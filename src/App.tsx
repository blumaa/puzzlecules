import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@mond-design-system/theme";
import { ToastProvider } from "./providers/ToastProvider";
import { ThemeContextProvider } from "./providers/ThemeContext";
import { useThemeContext } from "./providers/useThemeContext";
import { AuthProvider } from "./providers/AuthProvider";
import { GenreProvider } from "./providers";
import { LoginPage } from "./components/Login/LoginPage";
import { RequireAdmin } from "./components/Layout/RequireAdmin";
import { Layout } from "./components/Layout/Layout";
import { AdminDashboard } from "./components/Dashboard/Dashboard";
import { PuzzleQueue } from "./components/PuzzleQueue/PuzzleQueue";
import { GroupPool } from "./components/GroupPool/GroupPool";
import { PuzzleBuilder } from "./components/PuzzleBuilder/PuzzleBuilder";
import { ConnectionTypesPage } from "./components/ConnectionTypes/ConnectionTypesPage";
import { NewGroupGeneratorPage } from "./components/GroupGenerator/NewGroupGeneratorPage";
import { Footer } from "./components/Footer/Footer";

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
      <GenreProvider>
        <ToastProvider>
          <BrowserRouter>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              minHeight: "100vh",
            }}
          >
            <Routes>
              <Route path="/" element={<Navigate to="/admin" replace />} />
              <Route path="/login" element={<LoginPage />} />

              {/* Protected routes - wrapped once */}
              <Route
                path="/admin"
                element={
                  <RequireAdmin>
                    <Layout />
                  </RequireAdmin>
                }
              >
                <Route index element={<AdminDashboard />} />
                <Route path="puzzles" element={<PuzzleQueue />} />
                <Route path="groups" element={<GroupPool />} />
                <Route path="build" element={<PuzzleBuilder />} />
                <Route path="connection-types" element={<ConnectionTypesPage />} />
                <Route path="generate" element={<NewGroupGeneratorPage />} />
              </Route>
            </Routes>
            <Footer />
          </div>
          </BrowserRouter>
        </ToastProvider>
      </GenreProvider>
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
