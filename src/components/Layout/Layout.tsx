import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Box } from "@mond-design-system/theme";
import { useAuth } from "../../providers/useAuth";
import { Header } from "./Header";
import { MobileMenu } from "./MobileMenu";
import "./Layout.css";

export function Layout() {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <Box display="flex" flexDirection="column" className="admin-layout">
      <Header
        onSignOut={handleSignOut}
        onMenuOpen={() => setIsDrawerOpen(true)}
      />
      <MobileMenu
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
      <main className="admin-main">
        <Outlet />
      </main>
    </Box>
  );
}
