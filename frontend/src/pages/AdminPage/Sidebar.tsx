import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Activity,
  Album,
  FlaskConical,
  Languages,
  LogOut,
  Menu,
  Music,
  Users2,
  type LucideIcon,
} from "lucide-react";
import { useAuthStore } from "../../stores/useAuthStore";
import { Button } from "../../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "../../components/ui/sheet";
import { CDN_DEFAULT_USER_IMAGE } from "../../lib/cdn";
import { cn } from "../../lib/utils";

export type AdminSection =
  | "status"
  | "songs"
  | "albums"
  | "artists"
  | "tests";

type NavItem = {
  id: AdminSection;
  labelKey: string;
  icon: LucideIcon;
  iconActive: string;
  iconHover: string;
  bar: string;
};

const NAV_ITEMS: NavItem[] = [
  {
    id: "status",
    labelKey: "admin.tabs.status",
    icon: Activity,
    iconActive: "text-red-500",
    iconHover: "group-hover:text-red-500",
    bar: "bg-red-500",
  },
  {
    id: "songs",
    labelKey: "admin.tabs.songs",
    icon: Music,
    iconActive: "text-emerald-500",
    iconHover: "group-hover:text-emerald-500",
    bar: "bg-emerald-500",
  },
  {
    id: "albums",
    labelKey: "admin.tabs.albums",
    icon: Album,
    iconActive: "text-violet-500",
    iconHover: "group-hover:text-violet-500",
    bar: "bg-violet-500",
  },
  {
    id: "artists",
    labelKey: "admin.tabs.artists",
    icon: Users2,
    iconActive: "text-orange-500",
    iconHover: "group-hover:text-orange-500",
    bar: "bg-orange-500",
  },
  {
    id: "tests",
    labelKey: "admin.tabs.tests",
    icon: FlaskConical,
    iconActive: "text-sky-500",
    iconHover: "group-hover:text-sky-500",
    bar: "bg-sky-500",
  },
];

type SidebarProps = {
  active: AdminSection;
  onNavigate: (section: AdminSection) => void;
};

function Brand() {
  const { t } = useTranslation();
  return (
    <div className="flex min-w-0 items-center gap-3">
      <Link to="/" className="hover-brightness shrink-0">
        <img src="/Moodify-transparent.svg" alt="Moodify" className="size-9" />
      </Link>
      <h1 className="hidden truncate text-base font-semibold text-white md:block">
        {t("admin.title")}
      </h1>
    </div>
  );
}

function NavLinks({
  active,
  onNavigate,
}: {
  active: AdminSection;
  onNavigate: (section: AdminSection) => void;
}) {
  const { t } = useTranslation();
  return (
    <nav className="flex flex-1 flex-col gap-1 p-2">
      {NAV_ITEMS.map(
        ({ id, labelKey, icon: Icon, iconActive, iconHover, bar }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onNavigate(id)}
              className={cn(
                "group relative flex items-center gap-3 rounded-lg px-2 py-2 text-sm transition-colors",
                isActive
                  ? "bg-white/5 text-white"
                  : "text-gray-400 hover:bg-white/5 hover:text-white",
              )}
            >
              {isActive && (
                <span
                  className={cn(
                    "absolute left-0 top-1/2 h-6 w-0.5 -translate-y-1/2 rounded-full",
                    bar,
                  )}
                />
              )}
              <span className="flex size-8 shrink-0 items-center justify-center">
                <Icon
                  className={cn(
                    "size-5 transition-colors",
                    isActive ? iconActive : cn("text-gray-500", iconHover),
                  )}
                />
              </span>
              <span>{t(labelKey)}</span>
            </button>
          );
        },
      )}
    </nav>
  );
}

function UserMenu() {
  const { t, i18n } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  useEffect(() => {
    const savedLang = localStorage.getItem("i18nextLng");
    if (savedLang && savedLang !== i18n.language) {
      i18n.changeLanguage(savedLang);
    }
  }, [i18n]);

  if (!user) return null;

  const availableLanguages = [
    { code: "en", name: t("topbar.languages.en"), flag: "🇬🇧" },
    { code: "uk", name: t("topbar.languages.uk"), flag: "🇺🇦" },
    { code: "ru", name: t("topbar.languages.ru"), flag: "🇷🇺" },
  ];

  const handleChangeLanguage = (langCode: string) => {
    i18n.changeLanguage(langCode);
    localStorage.setItem("i18nextLng", langCode);
  };

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  return (
    <div className="border-t border-[#2a2a2a] p-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="h-auto w-full justify-start gap-3 rounded-lg px-2 py-2 hover:bg-[#2a2a2a]"
          >
            <img
              src={user.imageUrl || CDN_DEFAULT_USER_IMAGE}
              alt=""
              className="size-8 shrink-0 rounded-full object-cover"
            />
            {user.fullName ? (
              <span className="min-w-0 truncate text-sm text-white">
                {user.fullName}
              </span>
            ) : null}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-48 border-[#2a2a2a] bg-[#1a1a1a] p-1 text-white"
          side="right"
          align="end"
        >
          {user.fullName && (
            <DropdownMenuItem className="cursor-default p-2 text-sm font-semibold text-white opacity-100 hover:bg-[#2a2a2a]">
              {user.fullName}
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator className="bg-[#2a2a2a]" />

          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="cursor-pointer p-2 hover:bg-[#2a2a2a]">
              <Languages className="mr-2 h-4 w-4" />
              <span>{t("topbar.language")}</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="border-[#2a2a2a] bg-[#1a1a1a] p-1 text-white">
              {availableLanguages.map((lang) => {
                const isSelected = i18n.language.startsWith(lang.code);
                return (
                  <DropdownMenuItem
                    key={lang.code}
                    onClick={() => handleChangeLanguage(lang.code)}
                    className={`cursor-pointer p-2 hover:bg-[#2a2a2a] ${
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
            className="cursor-pointer p-2 text-red-400 hover:bg-[#2a2a2a] focus:bg-red-500/20 focus:text-red-400"
          >
            <LogOut className="mr-2 h-4 w-4" />
            {t("topbar.logout")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

const Sidebar = ({ active, onNavigate }: SidebarProps) => {
  const { t } = useTranslation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNavigate = (section: AdminSection) => {
    onNavigate(section);
    setMobileOpen(false);
  };

  return (
    <>
      <header className="flex shrink-0 items-center justify-between border-b border-[#2a2a2a] bg-[#0f0f0f] px-4 py-3 md:hidden">
        <Brand />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="text-gray-300 hover:bg-[#2a2a2a] hover:text-white"
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
        >
          <Menu className="size-5" />
        </Button>
      </header>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent
          side="left"
          className="w-72 border-[#2a2a2a] bg-[#0f0f0f] p-0 text-white [&>button]:text-gray-400"
        >
          <SheetHeader className="border-b border-[#2a2a2a] px-4 py-4 text-left">
            <SheetTitle className="sr-only">{t("admin.title")}</SheetTitle>
            <Link to="/" className="hover-brightness w-fit">
              <img
                src="/Moodify-transparent.svg"
                alt="Moodify"
                className="size-9"
              />
            </Link>
          </SheetHeader>
          <div className="flex h-[calc(100%-4.5rem)] flex-col">
            <NavLinks active={active} onNavigate={handleNavigate} />
            <UserMenu />
          </div>
        </SheetContent>
      </Sheet>

      <aside className="hidden h-full w-56 shrink-0 flex-col border-r border-[#2a2a2a] bg-[#0f0f0f] md:flex">
        <div className="border-b border-[#2a2a2a] px-4 py-4">
          <Brand />
        </div>
        <NavLinks active={active} onNavigate={handleNavigate} />
        <UserMenu />
      </aside>
    </>
  );
};

export default Sidebar;
