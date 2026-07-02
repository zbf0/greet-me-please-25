import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const STOPWORDS = new Set([
  "the","and","for","with","can","help","that","this","have","are","been","will","would","could","should","also","like","more","some","than","other","from","into","about","its","our","your","their","not","but","all","any","each","was","has","had","how","what","when","who","why","they","them","then","there","her","his","him","she","you","get","got","just","very","well","good","want","need","make","know","look","use","find","give","tell","work",
]);

function tokenize(text: string): string[] {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter((t) => t.length > 2 && !STOPWORDS.has(t));
}
function tfVector(tokens: string[]): Map<string, number> {
  const f = new Map<string, number>();
  for (const t of tokens) f.set(t, (f.get(t) ?? 0) + 1);
  const total = tokens.length || 1;
  f.forEach((v, k) => f.set(k, v / total));
  return f;
}
function cosine(a: Map<string, number>, b: Map<string, number>): number {
  let dot = 0, nA = 0, nB = 0;
  a.forEach((v, k) => { dot += v * (b.get(k) ?? 0); nA += v * v; });
  b.forEach((v) => { nB += v * v; });
  return nA && nB ? dot / (Math.sqrt(nA) * Math.sqrt(nB)) : 0;
}
function score(a: string, b: string) {
  return cosine(tfVector(tokenize(a)), tfVector(tokenize(b)));
}

const MentorInput = z.object({
  academicLevel: z.enum(["undergrad", "grad"]),
  age: z.number().int().min(16).max(100),
  major: z.string().min(2),
  canHelpWith: z.string().min(10),
});
const MenteeInput = z.object({
  academicLevel: z.enum(["undergrad", "grad"]),
  age: z.number().int().min(16).max(100),
  major: z.string().min(2),
  needsHelpWith: z.string().min(10),
});

export const createMentorProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => MentorInput.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: inserted, error } = await supabase
      .from("mentor_profiles")
      .insert({
        user_id: userId,
        academic_level: data.academicLevel,
        age: data.age,
        major: data.major,
        can_help_with: data.canHelpWith,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);

    const { data: mentees } = await supabase.from("mentee_profiles").select("*");
    const newText = `${data.academicLevel} ${data.major} ${data.canHelpWith}`;
    const matches = (mentees ?? [])
      .map((m) => ({ m, s: score(newText, `${m.academic_level} ${m.major} ${m.needs_help_with}`) }))
      .sort((a, b) => b.s - a.s)
      .slice(0, 5)
      .map(({ m }) => m);
    return { profile: inserted, matches };
  });

export const createMenteeProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => MenteeInput.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: inserted, error } = await supabase
      .from("mentee_profiles")
      .insert({
        user_id: userId,
        academic_level: data.academicLevel,
        age: data.age,
        major: data.major,
        needs_help_with: data.needsHelpWith,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);

    const { data: mentors } = await supabase.from("mentor_profiles").select("*");
    const newText = `${data.academicLevel} ${data.major} ${data.needsHelpWith}`;
    const matches = (mentors ?? [])
      .map((m) => ({ m, s: score(newText, `${m.academic_level} ${m.major} ${m.can_help_with}`) }))
      .sort((a, b) => b.s - a.s)
      .slice(0, 5)
      .map(({ m }) => m);
    return { profile: inserted, matches };
  });

export const getProfileStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const [{ count: mentorCount }, { count: menteeCount }] = await Promise.all([
      supabase.from("mentor_profiles").select("*", { count: "exact", head: true }),
      supabase.from("mentee_profiles").select("*", { count: "exact", head: true }),
    ]);
    return { mentorCount: mentorCount ?? 0, menteeCount: menteeCount ?? 0 };
  });
