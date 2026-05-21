import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore, NotAdminError } from "../stores/useAuthStore";
import { Loader2 } from "lucide-react";

const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authReady, setAuthReady] = useState(false);
  const navigate = useNavigate();
  const reset = useAuthStore((s) => s.reset);

  useEffect(() => {
    const finish = () => setAuthReady(true);
    const runBootstrap = async () => {
      try {
        await useAuthStore.getState().bootstrapAuth();
      } catch (error) {
        if (error instanceof NotAdminError) {
          reset();
          navigate("/login?step=access_denied", { replace: true });
        }
      } finally {
        finish();
      }
    };

    const unsub = useAuthStore.persist.onFinishHydration(() => {
      void runBootstrap();
    });
    if (useAuthStore.persist.hasHydrated()) {
      void runBootstrap();
    }
    return unsub;
  }, [navigate, reset]);

  if (!authReady) {
    return (
      <div className="h-screen w-full bg-[#0f0f0f] flex items-center justify-center">
        <Loader2 className="size-10 text-violet-500 animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthProvider;
