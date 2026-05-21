import { useGoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { useAuthStore, NotAdminError } from "../../stores/useAuthStore";
import { Button } from "./button";
import { useTranslation } from "react-i18next";

const SignInOAuthButton = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const completeGoogleAccessToken = useAuthStore(
    (s) => s.completeGoogleAccessToken,
  );

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        await completeGoogleAccessToken(tokenResponse.access_token);
        navigate("/");
      } catch (error) {
        if (error instanceof NotAdminError) {
          navigate("/login?step=access_denied", { replace: true });
        }
      }
    },
    onError: () => {
      // ignore
    },
    scope: "openid email profile",
  });

  return (
    <Button
      onClick={() => googleLogin()}
      variant="secondary"
      className="w-30 md:w-40 text-white border-zinc-200 h-10"
    >
      <p className="text-xs">{t("auth.continueWithGoogle")}</p>
    </Button>
  );
};

export default SignInOAuthButton;
