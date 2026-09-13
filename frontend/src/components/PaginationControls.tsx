// frontend/src/pages/AdminPage/PaginationControls.tsx
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const PaginationControls = ({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationControlsProps) => {
  const { t } = useTranslation();

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex items-center justify-end space-x-2 py-4 px-4 bg-[#1a1a1a] border-t border-[#2a2a2a]">
      <span className="text-sm text-gray-400">
        {t("pagination.page", { currentPage, totalPages })}
      </span>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="bg-[#2a2a2a] border-[#2a2a2a] text-white hover:bg-[#3a3a3a] disabled:opacity-50"
      >
        <ChevronLeft className="h-4 w-4" />
        {t("pagination.previous")}
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="bg-[#2a2a2a] border-[#2a2a2a] text-white hover:bg-[#3a3a3a] disabled:opacity-50"
      >
        {t("pagination.next")}
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default PaginationControls;
