import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/help")({
  head: () => ({ meta: [{ title: "Look for Help" }] }),
  component: Help,
});

function Help() {
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-10 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Look for Help</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>Need a hand? Here are a few ways to get support:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Check the README for setup and usage instructions.</li>
              <li>Email us at <a className="underline text-foreground" href="mailto:support@example.com">support@example.com</a>.</li>
              <li>Visit our docs or community forum for common questions.</li>
            </ul>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
