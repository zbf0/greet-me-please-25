import { createFileRoute } from "@tanstack/react-router";
import { useState, type CSSProperties } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { BookOpen, GraduationCap, Sparkles, Users, ChevronRight } from "lucide-react";
import {
  createMentorProfile,
  createMenteeProfile,
  getProfileStats,
} from "@/lib/mentor-match.functions";

export const Route = createFileRoute("/help")({
  head: () => ({ meta: [{ title: "Look for Help — Bridge" }] }),
  component: Help,
});

type Level = "undergrad" | "grad";
type Match = {
  id: string;
  academic_level: string;
  age: number;
  major: string;
  can_help_with?: string;
  needs_help_with?: string;
};
type Mode = "choose" | "mentor" | "mentee";

// Warm collegiate palette scoped to this route only (does not leak globally).
const bridgeTheme: CSSProperties = {
  // Base
  ["--background" as any]: "oklch(0.982 0.014 80)",
  ["--foreground" as any]: "oklch(0.28 0.05 260)",
  ["--card" as any]: "oklch(0.995 0.008 80)",
  ["--card-foreground" as any]: "oklch(0.28 0.05 260)",
  ["--popover" as any]: "oklch(0.995 0.008 80)",
  ["--popover-foreground" as any]: "oklch(0.28 0.05 260)",
  // Primary: burnt terracotta
  ["--primary" as any]: "oklch(0.68 0.16 42)",
  ["--primary-foreground" as any]: "oklch(0.99 0.01 80)",
  // Secondary: warm cream
  ["--secondary" as any]: "oklch(0.94 0.03 70)",
  ["--secondary-foreground" as any]: "oklch(0.28 0.05 260)",
  // Muted & accent
  ["--muted" as any]: "oklch(0.94 0.02 75)",
  ["--muted-foreground" as any]: "oklch(0.48 0.03 260)",
  ["--accent" as any]: "oklch(0.88 0.06 55)",
  ["--accent-foreground" as any]: "oklch(0.35 0.07 40)",
  // Borders & inputs: warm taupe
  ["--border" as any]: "oklch(0.88 0.02 70)",
  ["--input" as any]: "oklch(0.88 0.02 70)",
  ["--ring" as any]: "oklch(0.68 0.16 42)",
  ["--radius" as any]: "1rem",
  fontFamily: '"Outfit", ui-sans-serif, system-ui, sans-serif',
  backgroundColor: "var(--background)",
  color: "var(--foreground)",
  minHeight: "calc(100vh - 3.5rem)",
};

const serifStyle: CSSProperties = {
  fontFamily: '"Lora", ui-serif, Georgia, serif',
};

function Help() {
  const [mode, setMode] = useState<Mode>("choose");
  const statsFn = useServerFn(getProfileStats);
  const stats = useQuery({
    queryKey: ["profile-stats"],
    queryFn: () => statsFn(),
  });

  return (
    <div style={bridgeTheme} className="selection:bg-primary/20">
      <div className="max-w-5xl mx-auto px-6 pt-10 pb-24 w-full">
        <header className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center rotate-3 shadow-sm">
              <BookOpen className="w-5 h-5 -rotate-3" />
            </div>
            <div>
              <div style={serifStyle} className="text-2xl font-semibold tracking-tight leading-none">
                Bridge
              </div>
              <div className="text-xs text-muted-foreground mt-1 tracking-wide uppercase">
                A community connector
              </div>
            </div>
          </div>
          {mode !== "choose" && (
            <button
              onClick={() => setMode("choose")}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Back
            </button>
          )}
        </header>

        {mode === "choose" && <Landing stats={stats.data} loading={stats.isLoading} onPick={setMode} />}
        {mode === "mentor" && <MentorForm onDone={() => stats.refetch()} />}
        {mode === "mentee" && <MenteeForm onDone={() => stats.refetch()} />}
      </div>
    </div>
  );
}

function Landing({
  stats,
  loading,
  onPick,
}: {
  stats?: { mentorCount: number; menteeCount: number };
  loading: boolean;
  onPick: (m: Mode) => void;
}) {
  return (
    <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="flex flex-col gap-6">
        <span className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-sm text-primary font-medium w-fit">
          <Sparkles className="w-3.5 h-3.5 mr-1.5" /> University Network
        </span>
        <h1
          style={serifStyle}
          className="text-5xl md:text-6xl leading-[1.05] tracking-tight"
        >
          Find your <em className="text-primary not-italic italic-serif" style={{ ...serifStyle, fontStyle: "italic" }}>path</em>,
          <br />
          share your <em className="text-primary" style={{ ...serifStyle, fontStyle: "italic" }}>journey</em>.
        </h1>
        <p className="text-lg text-muted-foreground max-w-md leading-relaxed font-light">
          Whether you're looking for guidance or ready to offer it, Bridge is where the conversation begins.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 mt-2">
          <Button
            size="lg"
            onClick={() => onPick("mentor")}
            className="h-14 rounded-2xl text-base shadow-sm group flex-1"
          >
            <GraduationCap className="w-5 h-5 mr-2" />
            I want to mentor
            <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button
            size="lg"
            variant="secondary"
            onClick={() => onPick("mentee")}
            className="h-14 rounded-2xl text-base shadow-sm group flex-1"
          >
            <BookOpen className="w-5 h-5 mr-2" />
            I need a mentor
            <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>

      <div className="relative animate-in fade-in slide-in-from-right-8 duration-1000 delay-150 fill-mode-both">
        <div className="absolute inset-0 bg-primary/10 rounded-[3rem] -rotate-3 scale-[1.02] -z-10" />
        <div className="bg-card border border-border shadow-xl rounded-[2.5rem] p-8 md:p-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent/40 rounded-full blur-3xl -mr-10 -mt-10" />
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-primary/15 rounded-full blur-3xl -ml-20 -mb-20" />

          <div className="relative z-10">
            <h3 style={serifStyle} className="text-xl font-medium mb-8 flex items-center gap-3">
              <Users className="w-5 h-5 text-primary" />
              Community Pulse
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <StatTile
                value={loading ? "…" : stats?.mentorCount ?? 0}
                label="Mentors"
                tone="primary"
              />
              <StatTile
                value={loading ? "…" : stats?.menteeCount ?? 0}
                label="Mentees"
                tone="accent"
              />
            </div>

            <div className="mt-8 pt-8 border-t border-border/70">
              <p className="text-sm text-muted-foreground italic leading-relaxed">
                “A short conversation with the right person can change a whole semester.”
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatTile({
  value,
  label,
  tone,
}: {
  value: number | string;
  label: string;
  tone: "primary" | "accent";
}) {
  return (
    <div className="bg-background rounded-2xl p-6 border border-border/60 shadow-sm flex flex-col gap-2">
      <span
        style={serifStyle}
        className={tone === "primary" ? "text-4xl text-primary" : "text-4xl text-accent-foreground"}
      >
        {value}
      </span>
      <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
        {label}
      </span>
    </div>
  );
}

function FormShell({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-11 h-11 rounded-2xl bg-primary/15 text-primary flex items-center justify-center">
          {icon}
        </div>
        <h2 style={serifStyle} className="text-3xl md:text-4xl tracking-tight">
          {title}
        </h2>
      </div>
      <div className="bg-card border border-border shadow-sm rounded-[2rem] p-8 md:p-10">
        {children}
      </div>
    </div>
  );
}

function MentorForm({ onDone }: { onDone: () => void }) {
  const fn = useServerFn(createMentorProfile);
  const [academicLevel, setLevel] = useState<Level>("undergrad");
  const [age, setAge] = useState("");
  const [major, setMajor] = useState("");
  const [canHelpWith, setText] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const mut = useMutation({
    mutationFn: (d: { academicLevel: Level; age: number; major: string; canHelpWith: string }) =>
      fn({ data: d }),
    onSuccess: () => onDone(),
  });

  function validate(): string | null {
    const n = Number(age);
    if (!Number.isInteger(n) || n < 16 || n > 100) return "Age must be a whole number between 16 and 100.";
    if (major.trim().length < 2) return "Please enter your major (at least 2 characters).";
    if (canHelpWith.trim().length < 10) return "Please describe what you can help with (at least 10 characters).";
    return null;
  }

  return (
    <FormShell title="Become a Mentor" icon={<GraduationCap className="w-5 h-5" />}>
      <form
        className="space-y-6"
        onSubmit={(e) => {
          e.preventDefault();
          const err = validate();
          if (err) return setFormError(err);
          setFormError(null);
          mut.mutate({ academicLevel, age: Number(age), major: major.trim(), canHelpWith: canHelpWith.trim() });
        }}
      >
        <LevelField value={academicLevel} onChange={(v) => setLevel(v)} idPrefix="m" />
        <div className="grid sm:grid-cols-2 gap-5">
          <Field label="Age">
            <Input type="number" min={16} max={100} value={age} onChange={(e) => setAge(e.target.value)} required className="rounded-xl h-12" />
          </Field>
          <Field label="Major">
            <Input value={major} onChange={(e) => setMajor(e.target.value)} required className="rounded-xl h-12" />
          </Field>
        </div>
        <Field label="What can you help with?" hint="At least 10 characters">
          <Textarea rows={5} value={canHelpWith} onChange={(e) => setText(e.target.value)} required className="rounded-xl resize-none" />
        </Field>

        <Button type="submit" disabled={mut.isPending} size="lg" className="w-full h-14 rounded-2xl text-base shadow-sm">
          {mut.isPending ? "Saving…" : "Save profile & find matches"}
        </Button>
        {formError && <p className="text-sm text-destructive text-center">{formError}</p>}
        {mut.isError && !formError && (
          <p className="text-sm text-destructive text-center">Could not save profile. Please try again.</p>
        )}
      </form>

      {mut.data && (
        <MatchesGrid
          title="Top mentee matches"
          empty="No mentees have joined yet — you're one of the first! We'll match you as soon as someone signs up."
          items={(mut.data.matches as Match[]).map((m) => ({
            ...m,
            subtitle: m.needs_help_with ?? "",
          }))}
          role="mentee"
        />
      )}
    </FormShell>
  );
}

function MenteeForm({ onDone }: { onDone: () => void }) {
  const fn = useServerFn(createMenteeProfile);
  const [academicLevel, setLevel] = useState<Level>("undergrad");
  const [age, setAge] = useState("");
  const [major, setMajor] = useState("");
  const [needsHelpWith, setText] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const mut = useMutation({
    mutationFn: (d: { academicLevel: Level; age: number; major: string; needsHelpWith: string }) =>
      fn({ data: d }),
    onSuccess: () => onDone(),
  });

  function validate(): string | null {
    const n = Number(age);
    if (!Number.isInteger(n) || n < 16 || n > 100) return "Age must be a whole number between 16 and 100.";
    if (major.trim().length < 2) return "Please enter your major (at least 2 characters).";
    if (needsHelpWith.trim().length < 10) return "Please describe what you need help with (at least 10 characters).";
    return null;
  }

  return (
    <FormShell title="Find a Mentor" icon={<BookOpen className="w-5 h-5" />}>
      <form
        className="space-y-6"
        onSubmit={(e) => {
          e.preventDefault();
          const err = validate();
          if (err) return setFormError(err);
          setFormError(null);
          mut.mutate({ academicLevel, age: Number(age), major: major.trim(), needsHelpWith: needsHelpWith.trim() });
        }}
      >
        <LevelField value={academicLevel} onChange={(v) => setLevel(v)} idPrefix="s" />
        <div className="grid sm:grid-cols-2 gap-5">
          <Field label="Age">
            <Input type="number" min={16} max={100} value={age} onChange={(e) => setAge(e.target.value)} required className="rounded-xl h-12" />
          </Field>
          <Field label="Major">
            <Input value={major} onChange={(e) => setMajor(e.target.value)} required className="rounded-xl h-12" />
          </Field>
        </div>
        <Field label="What do you need help with?" hint="At least 10 characters">
          <Textarea rows={5} value={needsHelpWith} onChange={(e) => setText(e.target.value)} required className="rounded-xl resize-none" />
        </Field>

        <Button type="submit" disabled={mut.isPending} size="lg" className="w-full h-14 rounded-2xl text-base shadow-sm">
          {mut.isPending ? "Saving…" : "Save profile & find matches"}
        </Button>
        {formError && <p className="text-sm text-destructive text-center">{formError}</p>}
        {mut.isError && !formError && (
          <p className="text-sm text-destructive text-center">Could not save profile. Please try again.</p>
        )}
      </form>

      {mut.data && (
        <MatchesGrid
          title="Top mentor matches"
          empty="No mentors have joined yet — check back soon, or invite someone who inspires you."
          items={(mut.data.matches as Match[]).map((m) => ({
            ...m,
            subtitle: m.can_help_with ?? "",
          }))}
          role="mentor"
        />
      )}
    </FormShell>
  );
}

function LevelField({
  value,
  onChange,
  idPrefix,
}: {
  value: Level;
  onChange: (v: Level) => void;
  idPrefix: string;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">Academic Level</Label>
      <RadioGroup
        value={value}
        onValueChange={(v) => onChange(v as Level)}
        className="grid grid-cols-2 gap-3"
      >
        {(["undergrad", "grad"] as Level[]).map((lvl) => (
          <label
            key={lvl}
            htmlFor={`${idPrefix}-${lvl}`}
            className={`flex items-center gap-3 cursor-pointer rounded-xl border px-4 py-3 transition-all ${
              value === lvl
                ? "border-primary bg-primary/10 shadow-sm"
                : "border-border hover:border-primary/40"
            }`}
          >
            <RadioGroupItem id={`${idPrefix}-${lvl}`} value={lvl} />
            <span className="capitalize text-sm font-medium">{lvl === "undergrad" ? "Undergrad" : "Grad"}</span>
          </label>
        ))}
      </RadioGroup>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between">
        <Label className="text-sm font-medium">{label}</Label>
        {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function MatchesGrid({
  title,
  empty,
  items,
  role,
}: {
  title: string;
  empty: string;
  items: (Match & { subtitle: string })[];
  role: "mentor" | "mentee";
}) {
  return (
    <div className="mt-10 pt-8 border-t border-border/70">
      <div className="flex items-center gap-2 mb-5">
        <Sparkles className="w-4 h-4 text-primary" />
        <h3 style={serifStyle} className="text-xl">
          {title}
        </h3>
      </div>
      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-6 text-sm text-muted-foreground italic leading-relaxed">
          {empty}
        </div>
      ) : (
        <ul className="grid sm:grid-cols-2 gap-4">
          {items.map((m) => (
            <li
              key={m.id}
              className="bg-background border border-border rounded-2xl p-5 flex flex-col gap-2 hover:border-primary/40 hover:shadow-sm transition-all"
            >
              <div className="flex items-center gap-3 mb-1">
                <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  {role === "mentor" ? <GraduationCap className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />}
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate">{m.major}</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {m.academic_level} · Age {m.age}
                  </p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                {m.subtitle}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
