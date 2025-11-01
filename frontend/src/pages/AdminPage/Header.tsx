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
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "../../components/ui/dropdown-menu";
import SignInOAuthButton from "../../components/ui/SignInOAuthButton";
import { LogOut, Languages } from "lucide-react";
import { useTranslation } from "react-i18next";

const Header = () => {
  const { t, i18n } = useTranslation();
  const [user, setUser] = useState<null | {
    displayName: string | null;
    photoURL: string | null;
  }>(null);

  useEffect(() => {
    const savedLang = localStorage.getItem("i18nextLng"); 
    if (savedLang && savedLang !== i18n.language) {
      i18n.changeLanguage(savedLang);
    }
  }, [i18n]); 

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

  const availableLanguages = [
    { code: "en", name: t("topbar.languages.en"), flag: "🇬🇧" },
    { code: "uk", name: t("topbar.languages.uk"), flag: "🇺🇦" },
    { code: "ru", name: t("topbar.languages.ru"), flag: "🇷🇺" },
  ];

  const handleChangeLanguage = (langCode: string) => {
    i18n.changeLanguage(langCode);
    localStorage.setItem("i18nextLng", langCode);
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <div className="flex items-center justify-between px-4 py-3 sticky top-0 bg-[#0f0f0f]/95 backdrop-blur-md z-20 border-b border-[#2a2a2a]">
      {/* ... остальной JSX код без изменений ... */}
      <div className="flex items-center gap-4">
        <Link to="/" className="hover-brightness">
          <img
            src="/Moodify-transparent.svg"
            alt="Moodify Logo - Go to Home"
            className="size-10 text-white cursor-pointer"
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

            <DropdownMenuSeparator className="bg-[#2a2a2a]" />

            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="p-2 cursor-pointer hover:bg-[#2a2a2a]">
                <Languages className="w-4 h-4 mr-2" />
                <span>{t("topbar.language")}</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="bg-[#1a1a1a] border-[#2a2a2a] text-white p-1">
                {availableLanguages.map((lang) => {
                  const isSelected = i18n.language.startsWith(lang.code);
                  return (
                    <DropdownMenuItem
                      key={lang.code}
                      onClick={() => handleChangeLanguage(lang.code)}
                      className={`p-2 cursor-pointer hover:bg-[#2a2a2a] ${
                        isSelected ? "text-violet-500" : ""
                      }`}
                    >
                      <span>{`${lang.flag} ${lang.name}`}</span>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            <DropdownMenuSeparator className="bg-[#2a2a2a]" />

            <DropdownMenuItem
              onClick={handleLogout}
              className="text-red-400 p-2 cursor-pointer hover:bg-[#2a2a2a] focus:bg-red-500/20 focus:text-red-400"
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
