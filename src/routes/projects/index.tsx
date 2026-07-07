import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/projects/")({
  head: () => ({ meta: [{ title: "Projects — Lucas · Beach OS" }] }),
  component: () => null,
});
