import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/contact")({
  head: () => ({ meta: [{ title: "Contact — Lucas · Beach OS" }] }),
  component: () => null,
});
