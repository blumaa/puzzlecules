import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Box, ThemeProvider } from "@mond-design-system/theme";
import { ToastProvider } from "./providers/ToastProvider";
import { ThemeContextProvider } from "./providers/ThemeContext";
import { useThemeContext } from "./providers/useThemeContext";
import { AuthProvider } from "./providers/AuthProvider";
import { LoginPage } from "./pages/LoginPage";
import { RequireAdmin } from "./components/admin/RequireAdmin";
import { AdminLayout } from "./components/admin/AdminLayout";
import { AdminDashboard } from "./pages/admin/Dashboard";
import { PuzzleQueue } from "./pages/admin/PuzzleQueue";
import { GroupPool } from "./pages/admin/GroupPool";
import { PuzzleBuilder } from "./pages/admin/PuzzleBuilder";
import { ThemeManager as AdminThemeManager } from "./pages/admin/ThemeManager";
import { Analytics } from "./pages/admin/Analytics";
import { ConnectionTypesPage } from "./pages/admin/ConnectionTypesPage";
import { NewGroupGeneratorPage } from "./pages/admin/NewGroupGeneratorPage";
import { ThemeToggle } from "./components/ThemeToggle";
import { Footer } from "./components/Footer";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 60, // 1 hour
      refetchOnWindowFocus: false,
    },
  },
});

function ThemedApp() {
  const { theme } = useThemeContext();

  return (
    <ThemeProvider colorScheme={theme}>
      <ToastProvider>
        <BrowserRouter>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              minHeight: "100vh",
            }}
          >
            <Box display="flex" justifyContent="flex-end" padding="1">
              <ThemeToggle />
            </Box>
            <Routes>
              {/* Redirect root to admin */}
              <Route path="/" element={<Navigate to="/admin" replace />} />
              <Route path="/login" element={<LoginPage />} />

              {/* Protected admin routes */}
              <Route
                path="/admin"
                element={
                  <RequireAdmin>
                    <AdminLayout>
                      <AdminDashboard />
                    </AdminLayout>
                  </RequireAdmin>
                }
              />
              <Route
                path="/admin/puzzles"
                element={
                  <RequireAdmin>
                    <AdminLayout>
                      <PuzzleQueue />
                    </AdminLayout>
                  </RequireAdmin>
                }
              />
              <Route
                path="/admin/groups"
                element={
                  <RequireAdmin>
                    <AdminLayout>
                      <GroupPool />
                    </AdminLayout>
                  </RequireAdmin>
                }
              />
              <Route
                path="/admin/build"
                element={
                  <RequireAdmin>
                    <AdminLayout>
                      <PuzzleBuilder />
                    </AdminLayout>
                  </RequireAdmin>
                }
              />
              <Route
                path="/admin/themes"
                element={
                  <RequireAdmin>
                    <AdminLayout>
                      <AdminThemeManager />
                    </AdminLayout>
                  </RequireAdmin>
                }
              />
              <Route
                path="/admin/analytics"
                element={
                  <RequireAdmin>
                    <AdminLayout>
                      <Analytics />
                    </AdminLayout>
                  </RequireAdmin>
                }
              />
              <Route
                path="/admin/connection-types"
                element={
                  <RequireAdmin>
                    <AdminLayout>
                      <ConnectionTypesPage />
                    </AdminLayout>
                  </RequireAdmin>
                }
              />
              <Route
                path="/admin/generate"
                element={
                  <RequireAdmin>
                    <AdminLayout>
                      <NewGroupGeneratorPage />
                    </AdminLayout>
                  </RequireAdmin>
                }
              />
            </Routes>
            <Footer />
          </div>
        </BrowserRouter>
      </ToastProvider>
    </ThemeProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeContextProvider>
          <ThemedApp />
        </ThemeContextProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
