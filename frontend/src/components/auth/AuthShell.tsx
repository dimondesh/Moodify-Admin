import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import MoodifyLogo from "../MoodifyLogo";

interface AuthShellProps {
  children: ReactNode;
  showBack?: boolean;
  onBack?: () => void;
}

const AuthShell = ({ children, showBack, onBack }: AuthShellProps) => {
  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white flex flex-col justify-center items-center px-4 py-8">
      <div className="w-full max-w-[340px] relative flex flex-col min-h-[480px]">
        {showBack && onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="absolute -left-12 top-0 p-2 text-gray-400 hover:text-white rounded-full hover:bg-white/10 transition-colors z-10 hidden sm:block"
          >
            <ArrowLeft size={24} />
          </button>
        ) : null}

        <Link to="/login" className="flex justify-center mb-8 shrink-0">
          <div className="w-10 h-10">
            <MoodifyLogo />
          </div>
        </Link>

        {children}
      </div>
    </div>
  );
};

export default AuthShell;
