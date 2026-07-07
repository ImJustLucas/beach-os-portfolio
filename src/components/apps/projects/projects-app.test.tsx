import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ProjectsApp } from "./projects-app";

const mockPathname = vi.hoisted(() => ({ current: "/projects" }));

vi.mock("@tanstack/react-router", () => ({
  useLocation: () => ({ pathname: mockPathname.current }),
  Link: ({
    children,
    ...props
  }: React.ComponentProps<"a"> & { to?: string; params?: unknown }) => (
    <a {...props} href="#">
      {children}
    </a>
  ),
}));

describe("ProjectsApp", () => {
  it("lists all projects on /projects", () => {
    mockPathname.current = "/projects";
    render(<ProjectsApp />);
    expect(screen.getByText("Karaoke Platform")).toBeInTheDocument();
    expect(screen.getByText("imjustlucas.dev v1")).toBeInTheDocument();
  });

  it("shows the detail view on /projects/karaoke-platform", () => {
    mockPathname.current = "/projects/karaoke-platform";
    render(<ProjectsApp />);
    expect(screen.getByText(/NestJS API/)).toBeInTheDocument();
  });
});
