export interface NavItem {
  label: string;
  href: string;
  iconName: "LayoutDashboard" | "MessageSquare" | "Users" | "Activity" | "Settings";
  badge?: string;
  description: string;
}

export const MAIN_NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    href: "/",
    iconName: "LayoutDashboard",
    description: "Overview of conversion rates, pipeline velocity & active SDR agents",
  },
  {
    label: "AI Sales Chat",
    href: "/chat",
    iconName: "MessageSquare",
    badge: "Live Mock",
    description: "Customer-facing interactive AI SDR chat with tool calls",
  },
  {
    label: "Leads Pipeline",
    href: "/leads",
    iconName: "Users",
    description: "Extracted BANT data, pipeline stages, risk flags & lead scoring",
  },
  {
    label: "Evaluations",
    href: "/evaluations",
    iconName: "Activity",
    badge: "20 Tests",
    description: "Accuracy benchmarks, safety guardrail pass rates & regression test suites",
  },
  {
    label: "Settings",
    href: "/settings",
    iconName: "Settings",
    description: "Package pricing registry, calendar availability & safety policies",
  },
];
