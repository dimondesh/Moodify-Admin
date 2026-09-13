import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LayoutGroup, motion } from "framer-motion";
import {
  Activity,
  Album,
  ChevronDown,
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
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "../../components/ui/drawer";
import { cn } from "../../lib/utils";

type NavItem = {
  path: string;
  labelKey: string;
  icon: LucideIcon;
  iconActive: string;
  iconHover: string;
  barColor: string;
};

const NAV_ITEMS: NavItem[] = [
  {
    path: "/status",
    labelKey: "admin.tabs.status",
    icon: Activity,
    iconActive: "text-red-500",
    iconHover: "group-hover:text-red-500",
    barColor: "#ef4444",
  },
  {
    path: "/songs",
    labelKey: "admin.tabs.songs",
    icon: Music,
    iconActive: "text-emerald-500",
    iconHover: "group-hover:text-emerald-500",
    barColor: "#10b981",
  },
  {
    path: "/albums",
    labelKey: "admin.tabs.albums",
    icon: Album,
    iconActive: "text-violet-500",
    iconHover: "group-hover:text-violet-500",
    barColor: "#8b5cf6",
  },
  {
    path: "/artists",
    labelKey: "admin.tabs.artists",
    icon: Users2,
    iconActive: "text-orange-500",
    iconHover: "group-hover:text-orange-500",
    barColor: "#f97316",
  },
  {
    path: "/tests",
    labelKey: "admin.tabs.tests",
    icon: FlaskConical,
    iconActive: "text-sky-500",
    iconHover: "group-hover:text-sky-500",
    barColor: "#0ea5e9",
  },
];

type SidebarProps = {
  mobileOpen: boolean;
  onMobileOpenChange: (open: boolean) => void;
};

function Brand() {
  const { t } = useTranslation();
  return (
    <div className="flex min-w-0 items-center gap-3">
      <Link to="/status" className="hover-brightness shrink-0">
        <img src="/Moodify-transparent.svg" alt="Moodify" className="size-9" />
      </Link>
      <h1 className="hidden truncate text-base font-semibold text-white md:block">
        {t("admin.title")}
      </h1>
    </div>
  );
}

function NavLinks({
  onNavigate,
  scope,
}: {
  onNavigate?: () => void;
  scope: "mobile" | "desktop";
}) {
  const { t } = useTranslation();
  return (
    <LayoutGroup id={`sidebar-nav-${scope}`}>
      <nav className="flex flex-1 flex-col gap-1 p-2">
        {NAV_ITEMS.map(
          ({ path, labelKey, icon: Icon, iconActive, iconHover, barColor }) => (
            <NavLink
              key={path}
              to={path}
              onClick={onNavigate}
              className={({ isActive }) =>
                cn(
                  "group relative flex items-center gap-3 rounded-lg px-2 py-2 text-sm transition-colors",
                  isActive
                    ? "bg-white/5 text-white"
                    : "text-gray-400 hover:bg-white/5 hover:text-white",
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.span
                      layoutId={`sidebar-active-bar-${scope}`}
                      className="absolute left-0 top-1/2 h-6 w-0.5 -translate-y-1/2 rounded-full"
                      initial={false}
                      animate={{ backgroundColor: barColor }}
                      transition={{
                        type: "spring",
                        stiffness: 420,
                        damping: 34,
                        backgroundColor: { duration: 0.25 },
                      }}
                    />
                  )}
                  <span className="flex size-8 shrink-0 items-center justify-center">
                    <Icon
                      className={cn(
                        "size-5 transition-colors duration-200",
                        isActive
                          ? iconActive
                          : cn("text-gray-500", iconHover),
                      )}
                    />
                  </span>
                  <span>{t(labelKey)}</span>
                </>
              )}
            </NavLink>
          ),
        )}
      </nav>
    </LayoutGroup>
  );
}

function SidebarActions() {
  const { t, i18n } = useTranslation();
  const logout = useAuthStore((s) => s.logout);
  const [langOpen, setLangOpen] = useState(false);

  useEffect(() => {
    const savedLang = localStorage.getItem("i18nextLng");
    if (savedLang && savedLang !== i18n.language) {
      i18n.changeLanguage(savedLang);
    }
  }, [i18n]);

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
    <div className="flex flex-col gap-1 border-t border-[#2a2a2a] p-2">
      <div>
        <button
          type="button"
          onClick={() => setLangOpen((open) => !open)}
          aria-expanded={langOpen}
          className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-2 py-2 text-gray-400 transition-colors hover:bg-white/5 hover:text-white"
        >
          <span className="flex size-8 shrink-0 items-center justify-center">
            <Languages className="size-5" />
          </span>
          <span className="flex-1 text-left text-sm">{t("topbar.language")}</span>
          <ChevronDown
            className={cn(
              "size-4 shrink-0 transition-transform duration-200",
              langOpen && "rotate-180",
            )}
          />
        </button>
        <motion.div
          initial={false}
          animate={{
            height: langOpen ? "auto" : 0,
            opacity: langOpen ? 1 : 0,
          }}
          transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
          className="overflow-hidden"
        >
          <div className="flex flex-col gap-1 py-1">
            {availableLanguages.map((lang) => {
              const isSelected = i18n.language.startsWith(lang.code);
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => handleChangeLanguage(lang.code)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-2 py-2 text-sm transition-colors hover:bg-white/5 hover:text-white",
                    isSelected ? "text-violet-500" : "text-gray-400",
                  )}
                >
                  <span className="flex size-8 shrink-0 items-center justify-center text-base">
                    {lang.flag}
                  </span>
                  <span>{lang.name}</span>
                </button>
              );
            })}
          </div>
        </motion.div>
      </div>

      <Button
        variant="ghost"
        onClick={handleLogout}
        className="h-auto w-full justify-start gap-3 rounded-lg px-2 py-2 text-gray-400 hover:bg-white/5 hover:text-red-400"
      >
        <span className="flex size-8 shrink-0 items-center justify-center">
          <LogOut className="size-5" />
        </span>
        <span className="text-sm">{t("topbar.logout")}</span>
      </Button>
    </div>
  );
}

const Sidebar = ({ mobileOpen, onMobileOpenChange }: SidebarProps) => {
  const { t } = useTranslation();

  return (
    <>
      <header className="flex shrink-0 items-center justify-between border-b border-[#2a2a2a] bg-[#0f0f0f] px-4 py-3 md:hidden">
        <Brand />
        <Drawer
          direction="left"
          open={mobileOpen}
          onOpenChange={onMobileOpenChange}
        >
          <DrawerTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-gray-400 hover:bg-[#2a2a2a] hover:text-white"
              aria-label="Open menu"
            >
              <Menu className="size-5" />
            </Button>
          </DrawerTrigger>
          <DrawerContent
            className="h-full w-56 border-r-[#2a2a2a] bg-[#0f0f0f] p-0 text-white sm:max-w-56"
            aria-describedby={undefined}
          >
            <DrawerHeader className="border-b border-[#2a2a2a] px-4 py-4 text-left">
              <DrawerTitle className="sr-only">{t("admin.title")}</DrawerTitle>
              <Link to="/status" className="hover-brightness w-fit">
                <img
                  src="/Moodify-transparent.svg"
                  alt="Moodify"
                  className="size-9"
                />
              </Link>
            </DrawerHeader>
            <div className="flex min-h-0 flex-1 flex-col">
              <NavLinks
                scope="mobile"
                onNavigate={() => onMobileOpenChange(false)}
              />
              <SidebarActions />
            </div>
          </DrawerContent>
        </Drawer>
      </header>

      <aside className="hidden h-full w-56 shrink-0 flex-col border-r border-[#2a2a2a] bg-[#0f0f0f] md:flex">
        <div className="border-b border-[#2a2a2a] px-4 py-4">
          <Brand />
        </div>
        <NavLinks scope="desktop" />
        <SidebarActions />
      </aside>
    </>
  );
};

export default Sidebar;
