import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/projects/$slug")({
  head: ({ params }) => ({
    meta: [{ title: `${params.slug} — Lucas · Beach OS` }],
  }),
  component: () => null,
});
