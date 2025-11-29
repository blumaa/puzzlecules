import { Box, Heading, Icon } from "@mond-design-system/theme";
import {
  Drawer,
  DrawerHeader,
  DrawerBody,
} from "@mond-design-system/theme/client";
import { PuzzleIcon } from "../icons";
import { HeaderMenu } from "./HeaderMenu";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  return (
    <Drawer isOpen={isOpen} onClose={onClose} position="left" width="sm">
      <DrawerHeader onClose={onClose}>
        <Box display="flex" alignItems="center" gap="sm">
          <Icon size="md" decorative color="var(--mond-colors-blue-500)">
            <PuzzleIcon />
          </Icon>
          <Heading level={3} size="md">
            Puzzlecules
          </Heading>
        </Box>
      </DrawerHeader>
      <DrawerBody>
        <HeaderMenu direction="column" onNavClick={onClose} />
      </DrawerBody>
    </Drawer>
  );
}
