import { Link, useLocation } from "react-router-dom";
import { Box, Button } from "@mond-design-system/theme";

interface NavLinkItem {
  path: string;
  label: string;
}

const NAV_LINKS: NavLinkItem[] = [
  { path: "/admin", label: "Dashboard" },
  { path: "/admin/connection-types", label: "Connection Types" },
  { path: "/admin/generate", label: "Generate Groups" },
  { path: "/admin/groups", label: "Group Pool" },
  { path: "/admin/build", label: "Build Puzzle" },
  { path: "/admin/puzzles", label: "Puzzle Queue" },
];

interface HeaderMenuProps {
  direction?: "row" | "column";
  onNavClick?: () => void;
}

export function HeaderMenu({ direction = "row", onNavClick }: HeaderMenuProps) {
  const location = useLocation();

  return (
    <Box as="nav" display="flex" flexDirection={direction}>
      {NAV_LINKS.map((link) => {
        const isActive = location.pathname === link.path;
        return (
          <Link
            key={link.path}
            to={link.path}
            className="no-underline"
            onClick={onNavClick}
          >
            <Button variant={isActive ? "outline" : "ghost"} size="sm">
              {link.label}
            </Button>
          </Link>
        );
      })}
    </Box>
  );
}
