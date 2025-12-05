import { Box, Heading, Button, Icon } from "@mond-design-system/theme";
import { Link } from "react-router-dom";
import { PuzzleIcon, HamburgerIcon } from "../icons";
import { ThemeToggle } from "../ThemeToggle/ThemeToggle";
import { HeaderMenu } from "./HeaderMenu";
import { GenreSelector } from "../GenreSelector";

interface HeaderProps {
  onSignOut: () => void;
  onMenuOpen: () => void;
}

export function Header({ onSignOut, onMenuOpen }: HeaderProps) {
  return (
    <Box as="header" paddingLeft="2" paddingRight="2">
      <Box
        display="flex"
        alignItems="center"
        gap="md"
        justifyContent="space-between"
      >
        <Box display="flex" alignItems="center" gap="md">
          <Box display="flex" alignItems="center">
            <Box>
              <Icon size="lg">
                <PuzzleIcon />
              </Icon>
            </Box>
            <Link key="/admin" to="/admin" className="no-underline">
              <Button variant="ghost">
                <Heading size="lg">Puzzlecules</Heading>
              </Button>
            </Link>
          </Box>
          <GenreSelector />
        </Box>

        {/* Desktop Navigation */}
        <div className="admin-nav-desktop">
          <HeaderMenu direction="row" />
        </div>

        <Box
          display="flex"
          alignItems="center"
          gap="sm"
          className="admin-header-actions"
        >
          <ThemeToggle />
          <Button variant="outline" size="sm" onClick={onSignOut}>
            Sign Out
          </Button>

          {/* Mobile Hamburger */}
          <Box className="admin-hamburger">
            <Button
              onClick={onMenuOpen}
              aria-label="Open navigation menu"
              variant="outline"
              size="sm"
            >
              <Icon>
                <HamburgerIcon />
              </Icon>
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
