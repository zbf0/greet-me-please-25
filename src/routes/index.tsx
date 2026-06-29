import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "My App — Template" },
      { name: "description", content: "A starter template with built-in authentication." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background to-muted px-4 text-center">
      <div className="max-w-xl space-y-6">
        <h1 className="text-5xl font-bold tracking-tight">My App Template</h1>
        <p className="text-lg text-muted-foreground">
          A clean starting point with authentication wired up to your database.
        </p>
      </div>
    </div>
  );
}
