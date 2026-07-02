import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  createMentorProfile,
  createMenteeProfile,
  getProfileStats,
} from "@/lib/mentor-match.functions";

export const Route = createFileRoute("/help")({
  head: () => ({ meta: [{ title: "Look for Help — Mentor Match" }] }),
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

function Help() {
  const statsFn = useServerFn(getProfileStats);
  const stats = useQuery({
    queryKey: ["profile-stats"],
    queryFn: () => statsFn(),
  });

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-10 max-w-3xl space-y-6">
        <div>
          <h1 className="text-3xl font-semibold">Look for Help</h1>
          <p className="text-muted-foreground mt-2">
            Find a mentor or offer to mentor. Fill out a short profile and we'll match you.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Community</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-8 text-sm">
            <div>
              <div className="text-2xl font-semibold">{stats.data?.mentorCount ?? "…"}</div>
              <div className="text-muted-foreground">Mentors</div>
            </div>
            <div>
              <div className="text-2xl font-semibold">{stats.data?.menteeCount ?? "…"}</div>
              <div className="text-muted-foreground">Mentees</div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="mentee">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="mentee">I need a mentor</TabsTrigger>
            <TabsTrigger value="mentor">I want to mentor</TabsTrigger>
          </TabsList>
          <TabsContent value="mentee">
            <MenteeForm onDone={() => stats.refetch()} />
          </TabsContent>
          <TabsContent value="mentor">
            <MentorForm onDone={() => stats.refetch()} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function MentorForm({ onDone }: { onDone: () => void }) {
  const fn = useServerFn(createMentorProfile);
  const [academicLevel, setLevel] = useState<Level>("undergrad");
  const [age, setAge] = useState("");
  const [major, setMajor] = useState("");
  const [canHelpWith, setText] = useState("");

  const mut = useMutation({
    mutationFn: (data: {
      academicLevel: Level; age: number; major: string; canHelpWith: string;
    }) => fn({ data }),
    onSuccess: () => onDone(),
  });

  return (
    <Card className="mt-4">
      <CardHeader><CardTitle>Become a Mentor</CardTitle></CardHeader>
      <CardContent>
        <form
          className="space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            mut.mutate({ academicLevel, age: Number(age), major, canHelpWith });
          }}
        >
          <div className="space-y-2">
            <Label>Academic Level</Label>
            <RadioGroup value={academicLevel} onValueChange={(v) => setLevel(v as Level)} className="flex gap-6">
              <label className="flex items-center gap-2"><RadioGroupItem value="undergrad" /> Undergrad</label>
              <label className="flex items-center gap-2"><RadioGroupItem value="grad" /> Grad</label>
            </RadioGroup>
          </div>
          <div className="space-y-2">
            <Label htmlFor="m-age">Age</Label>
            <Input id="m-age" type="number" value={age} onChange={(e) => setAge(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="m-major">Major</Label>
            <Input id="m-major" value={major} onChange={(e) => setMajor(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="m-help">What can you help with?</Label>
            <Textarea id="m-help" rows={4} value={canHelpWith} onChange={(e) => setText(e.target.value)} required />
          </div>
          <Button type="submit" disabled={mut.isPending}>
            {mut.isPending ? "Saving…" : "Save profile & find matches"}
          </Button>
          {mut.isError && <p className="text-sm text-destructive">{(mut.error as Error).message}</p>}
        </form>

        {mut.data && (
          <Matches
            title="Top mentee matches"
            items={(mut.data.matches as Match[]).map((m) => ({
              ...m,
              subtitle: m.needs_help_with ?? "",
            }))}
          />
        )}
      </CardContent>
    </Card>
  );
}

function MenteeForm({ onDone }: { onDone: () => void }) {
  const fn = useServerFn(createMenteeProfile);
  const [academicLevel, setLevel] = useState<Level>("undergrad");
  const [age, setAge] = useState("");
  const [major, setMajor] = useState("");
  const [needsHelpWith, setText] = useState("");

  const mut = useMutation({
    mutationFn: (data: {
      academicLevel: Level; age: number; major: string; needsHelpWith: string;
    }) => fn({ data }),
    onSuccess: () => onDone(),
  });

  return (
    <Card className="mt-4">
      <CardHeader><CardTitle>Find a Mentor</CardTitle></CardHeader>
      <CardContent>
        <form
          className="space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            mut.mutate({ academicLevel, age: Number(age), major, needsHelpWith });
          }}
        >
          <div className="space-y-2">
            <Label>Academic Level</Label>
            <RadioGroup value={academicLevel} onValueChange={(v) => setLevel(v as Level)} className="flex gap-6">
              <label className="flex items-center gap-2"><RadioGroupItem value="undergrad" /> Undergrad</label>
              <label className="flex items-center gap-2"><RadioGroupItem value="grad" /> Grad</label>
            </RadioGroup>
          </div>
          <div className="space-y-2">
            <Label htmlFor="s-age">Age</Label>
            <Input id="s-age" type="number" value={age} onChange={(e) => setAge(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="s-major">Major</Label>
            <Input id="s-major" value={major} onChange={(e) => setMajor(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="s-help">What do you need help with?</Label>
            <Textarea id="s-help" rows={4} value={needsHelpWith} onChange={(e) => setText(e.target.value)} required />
          </div>
          <Button type="submit" disabled={mut.isPending}>
            {mut.isPending ? "Saving…" : "Save profile & find matches"}
          </Button>
          {mut.isError && <p className="text-sm text-destructive">{(mut.error as Error).message}</p>}
        </form>

        {mut.data && (
          <Matches
            title="Top mentor matches"
            items={(mut.data.matches as Match[]).map((m) => ({
              ...m,
              subtitle: m.can_help_with ?? "",
            }))}
          />
        )}
      </CardContent>
    </Card>
  );
}

function Matches({ title, items }: { title: string; items: (Match & { subtitle: string })[] }) {
  return (
    <div className="mt-8">
      <h3 className="font-semibold mb-3">{title}</h3>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">No matches yet — be the first to join!</p>
      ) : (
        <ul className="space-y-3">
          {items.map((m) => (
            <li key={m.id} className="border rounded-lg p-4">
              <div className="font-medium">{m.major}</div>
              <div className="text-xs text-muted-foreground capitalize mb-1">{m.academic_level} · Age {m.age}</div>
              <div className="text-sm text-muted-foreground line-clamp-3">{m.subtitle}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
