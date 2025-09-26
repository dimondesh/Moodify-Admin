// frontend/src/pages/AdminPage/Header.tsx

import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { auth, signOut } from "../../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { Button } from "../../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import SignInOAuthButton from "../../components/ui/SignInOAuthButton";
import { LayoutDashboardIcon, LogOut} from "lucide-react";
import { useAuthStore } from "../../stores/useAuthStore";
import { useTranslation } from "react-i18next";

const Header = () => {
  const { t } = useTranslation();
  const [user, setUser] = useState<null | {
    displayName: string | null;
    photoURL: string | null;
  }>(null);
  const { isAdmin } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
        });
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <div className="flex items-center justify-between px-4 py-3 sticky top-0 bg-[#0f0f0f]/95 backdrop-blur-md z-20 border-b border-[#2a2a2a]">
      <div className="flex items-center gap-4">
        <Link to="/" className="hover-brightness">
          <img
            src="/Moodify.png"
            alt="Moodify Logo - Go to Home"
            className="size-8 text-white cursor-pointer"
          />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-white">{t("admin.title")}</h1>
          <p className="text-gray-400 text-sm">{t("admin.description")}</p>
        </div>
      </div>

      {user ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative h-8 w-8 rounded-full hover:bg-[#2a2a2a]"
            >
              <img
                src={user.photoURL || "/Moodify.png"}
                alt="User Avatar"
                className="w-8 h-8 rounded-full object-cover"
              />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-48 bg-[#1a1a1a] border-[#2a2a2a] text-white p-1"
            align="end"
          >
            {user.displayName && (
              <DropdownMenuItem className="text-sm font-semibold cursor-default text-white p-2 opacity-100 hover:bg-[#2a2a2a]">
                {user.displayName}
              </DropdownMenuItem>
            )}
            {isAdmin && (
              <DropdownMenuItem
                asChild
                className="p-2 cursor-pointer hover:bg-[#2a2a2a]"
              >
                <Link to="/admin">
                  <LayoutDashboardIcon className="w-4 h-4 mr-2" />
                  {t("topbar.adminDashboard")}
                </Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-red-400 p-2 cursor-pointer hover:bg-[#2a2a2a]"
            >
              <LogOut className="w-4 h-4 mr-2" />
              {t("topbar.logout")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <SignInOAuthButton />
      )}
    </div>
  );
};

export default Header;
