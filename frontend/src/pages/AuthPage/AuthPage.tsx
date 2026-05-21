import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import { useAuthStore, NotAdminError } from "../../stores/useAuthStore";
import { axiosInstance } from "../../lib/axios";
import toast from "react-hot-toast";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Eye, EyeOff, ShieldAlert } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import AuthShell from "../../components/auth/AuthShell";

type AuthStep = "email" | "login_password" | "access_denied";

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim() || "";

function AuthGoogleOAuthButton({
  setIsLoading,
  setErrorItem,
  onNotAdmin,
}: {
  setIsLoading: (v: boolean) => void;
  setErrorItem: (msg: string) => void;
  onNotAdmin: () => void;
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const completeGoogleAccessToken = useAuthStore(
    (s) => s.completeGoogleAccessToken,
  );

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsLoading(true);
      try {
        await completeGoogleAccessToken(tokenResponse.access_token);
        toast.success(t("auth.loginSuccess"));
        navigate("/", { replace: true });
      } catch (error: unknown) {
        if (error instanceof NotAdminError) {
          onNotAdmin();
        } else {
          const err = error as {
            response?: { data?: { code?: string; error?: string } };
          };
          const code = err?.response?.data?.code;
          if (code === "ACCOUNT_EXISTS_PASSWORD") {
            setErrorItem(t("auth.googleAccountExistsUsePassword"));
          } else {
            setErrorItem(
              err?.response?.data?.error || t("auth.googleSignInFailed"),
            );
          }
        }
      } finally {
        setIsLoading(false);
      }
    },
    onError: () => {
      toast.error(t("auth.googleSignInFailed"));
    },
    scope: "openid email profile",
  });

  return (
    <Button
      onClick={() => googleLogin()}
      variant="outline"
      type="button"
      className="w-full h-12 border-gray-700 hover:bg-gray-900 rounded-full shrink-0"
    >
      <img src="/google.svg" alt="G" className="w-5 h-5 mr-3" />
      {t("auth.continueWithGoogle", "Google")}
    </Button>
  );
}

const AuthPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const user = useAuthStore((s) => s.user);
  const isAdmin = useAuthStore((s) => s.isAdmin);
  const loginWithPassword = useAuthStore((s) => s.loginWithPassword);
  const reset = useAuthStore((s) => s.reset);

  const rawStep = (searchParams.get("step") as AuthStep) || "email";
  const step: AuthStep =
    rawStep === "login_password" || rawStep === "access_denied"
      ? rawStep
      : "email";

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errorItem, setErrorItem] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const goToAccessDenied = () => {
    setSearchParams({ step: "access_denied" });
  };

  useEffect(() => {
    if (user && isAdmin) {
      navigate("/", { replace: true });
    }
  }, [user, isAdmin, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrorItem("");
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email) {
      return setErrorItem(t("auth.emailRequired"));
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      return setErrorItem(t("auth.emailInvalid"));
    }

    setIsLoading(true);
    try {
      const response = await axiosInstance.post("/auth/check-email", {
        email: formData.email.trim().toLowerCase(),
      });
      const exists = response.data.exists as boolean;
      if (exists) {
        setSearchParams({ step: "login_password" });
      } else {
        setErrorItem(t("auth.errorUserNotFound"));
      }
    } catch {
      setErrorItem(t("auth.checkEmailError"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await loginWithPassword(formData.email, formData.password);
      toast.success(t("auth.loginSuccess"));
      navigate("/", { replace: true });
    } catch (error: unknown) {
      if (error instanceof NotAdminError) {
        goToAccessDenied();
      } else {
        const err = error as { response?: { data?: { error?: string } } };
        setErrorItem(
          err?.response?.data?.error || t("auth.errorInvalidCredentials"),
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleTryAnotherAccount = () => {
    reset();
    setFormData({ email: "", password: "" });
    setErrorItem("");
    setSearchParams({});
  };

  const goBackFromPassword = () => {
    setFormData((prev) => ({ ...prev, password: "" }));
    setErrorItem("");
    setSearchParams({});
  };

  const googleSection = googleClientId ? (
    <AuthGoogleOAuthButton
      setIsLoading={setIsLoading}
      setErrorItem={setErrorItem}
      onNotAdmin={goToAccessDenied}
    />
  ) : (
    <Button
      type="button"
      variant="outline"
      onClick={() => toast.error(t("auth.googleNotConfigured"))}
      className="w-full h-12 border-gray-700 hover:bg-gray-900 rounded-full shrink-0"
    >
      <img src="/google.svg" alt="G" className="w-5 h-5 mr-3" />
      {t("auth.continueWithGoogle", "Google")}
    </Button>
  );

  return (
    <>
      <Helmet>
        <title>
          {step === "access_denied"
            ? t("admin.unauthorized")
            : `${t("auth.loginTitle", "Вход")} - Moodify Admin`}
        </title>
      </Helmet>

      <AuthShell
        showBack={step === "login_password"}
        onBack={step === "login_password" ? goBackFromPassword : undefined}
      >
        {step === "email" && (
          <form onSubmit={handleEmailSubmit} className="flex flex-col flex-1">
            <div className="text-center mb-8 h-[80px] flex flex-col items-center justify-start shrink-0">
              <h1 className="text-3xl font-bold mb-2">
                {t("auth.loginWelcome", "С возвращением")}
              </h1>
            </div>

            <div>
              <Label htmlFor="email" className="text-sm text-gray-300 mb-2 block">
                {t("auth.emailLabel", "Email")}
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="bg-gray-900 border-gray-700 py-6"
              />
              <div className="min-h-[24px] mt-2">
                {errorItem && (
                  <div className="text-red-500 text-xs">{errorItem}</div>
                )}
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-violet-500 hover:bg-violet-600 text-black font-bold rounded-full mt-2 shrink-0"
            >
              {t("common.continue", "Продолжить")}
            </Button>

            <div className="flex items-center gap-2 my-4 shrink-0">
              <div className="flex-1 h-px bg-gray-700" />
              <span className="text-xs text-gray-500 uppercase">
                {t("auth.or", "или")}
              </span>
              <div className="flex-1 h-px bg-gray-700" />
            </div>

            {googleSection}
          </form>
        )}

        {step === "login_password" && (
          <form onSubmit={handleLoginSubmit} className="flex flex-col flex-1">
            <div className="text-center mb-8 h-[80px] flex flex-col items-center justify-start shrink-0">
              <h1 className="text-3xl font-bold mb-2">
                {t("auth.loginTitle", "Вход")}
              </h1>
              <p className="text-gray-400 text-sm">{formData.email}</p>
            </div>

            <div>
              <Label
                htmlFor="password"
                className="text-sm text-gray-300 mb-2 block"
              >
                {t("auth.passwordLabel", "Пароль")}
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="bg-gray-900 border-gray-700 py-6 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div className="min-h-[24px] mt-2">
                {errorItem && (
                  <div className="text-red-500 text-xs">{errorItem}</div>
                )}
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-violet-500 hover:bg-violet-600 text-black font-bold rounded-full mt-4 shrink-0"
            >
              {t("auth.loginButton", "Войти")}
            </Button>
          </form>
        )}

        {step === "access_denied" && (
          <div className="flex flex-col flex-1 items-center text-center">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 text-red-400">
              <ShieldAlert size={32} />
            </div>
            <h1 className="text-3xl font-bold mb-3">{t("admin.unauthorized")}</h1>
            <p className="text-gray-400 text-sm mb-8 max-w-[280px]">
              {t("admin.accessDeniedDescription")}
            </p>
            <Button
              type="button"
              onClick={handleTryAnotherAccount}
              className="w-full h-12 bg-violet-500 hover:bg-violet-600 text-black font-bold rounded-full shrink-0"
            >
              {t("admin.tryAnotherAccount")}
            </Button>
          </div>
        )}
      </AuthShell>
    </>
  );
};

export default AuthPage;
