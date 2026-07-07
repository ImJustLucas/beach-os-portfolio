import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/career")({
  head: () => ({ meta: [{ title: "Career — Lucas · Beach OS" }] }),
  component: () => null,
});
