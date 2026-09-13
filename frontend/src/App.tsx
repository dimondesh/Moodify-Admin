import { Route, Routes, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useAuthStore } from "./stores/useAuthStore";
import AdminPage from "./pages/AdminPage/AdminPage";
import StatusTabContent from "./pages/AdminPage/StatusTabContent";
import SongsTabContent from "./pages/AdminPage/SongsTabContent";
import AlbumsTabContent from "./pages/AdminPage/AlbumsTabContent";
import ArtistsTabContent from "./pages/AdminPage/ArtistsTabContent";
import TestsTabContent from "./pages/AdminPage/TestsTabContent";
import AuthPage from "./pages/AuthPage/AuthPage";
import { JSX } from "react";

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const user = useAuthStore((s) => s.user);
  const isAdmin = useAuthStore((s) => s.isAdmin);
  const accessToken = useAuthStore((s) => s.accessToken);
  if (!user || !isAdmin) {
    const loginPath =
      accessToken && !isAdmin ? "/login?step=access_denied" : "/login";
    return <Navigate to={loginPath} replace />;
  }
  return children;
};

function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<AuthPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AdminPage />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/status" replace />} />
          <Route path="status" element={<StatusTabContent />} />
          <Route path="songs" element={<SongsTabContent />} />
          <Route path="albums" element={<AlbumsTabContent />} />
          <Route path="artists" element={<ArtistsTabContent />} />
          <Route path="tests" element={<TestsTabContent />} />
          <Route path="*" element={<Navigate to="/status" replace />} />
        </Route>
      </Routes>
      <Toaster
        toastOptions={{
          iconTheme: {
            primary: "#805ad5",
            secondary: "black",
          },
          blank: {
            style: {
              background: "#27272a",
              borderRadius: "20px",
              color: "#BAC4C8",
            },
          },
          success: {
            style: {
              background: "#27272a",
              borderRadius: "20px",
              color: "#BAC4C8",
            },
          },
          error: {
            style: {
              background: "#27272a",
              borderRadius: "20px",
              color: "#BAC4C8",
            },
          },
          loading: {
            style: {
              background: "#27272a",
              borderRadius: "20px",
              color: "#BAC4C8",
            },
          },
        }}
      />
    </>
  );
}
export default App;
