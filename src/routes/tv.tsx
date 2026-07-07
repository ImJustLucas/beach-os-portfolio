import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/tv")({
  head: () => ({ meta: [{ title: "Beach TV — Lucas · Beach OS" }] }),
  component: () => null,
});
