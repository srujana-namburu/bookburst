import { Button } from "@/components/ui/button";
import { BookOpen, CheckCircle, Library } from "lucide-react";

interface BookCount {
  reading: number;
  finished: number;
  wantToRead: number;
  total: number;
}

interface BookshelfTabsProps {
  activeTab: "reading" | "finished" | "want_to_read" | "all";
  bookCounts: BookCount;
  onTabChange: (tab: "reading" | "finished" | "want_to_read" | "all") => void;
}

export function BookshelfTabs({
  activeTab,
  bookCounts,
  onTabChange,
}: BookshelfTabsProps) {
  return (
    <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
      <nav className="-mb-px flex space-x-8 overflow-x-auto">
        <button
          className={`${
            activeTab === "reading"
              ? "border-primary text-primary dark:text-primary-foreground"
              : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
          } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
          onClick={() => onTabChange("reading")}
        >
          <BookOpen className="mr-2 h-4 w-4" />
          Reading
          <span className="ml-1 text-gray-500 dark:text-gray-400 text-xs">
            {bookCounts.reading}
          </span>
        </button>
        
        <button
          className={`${
            activeTab === "finished"
              ? "border-primary text-primary dark:text-primary-foreground"
              : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
          } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
          onClick={() => onTabChange("finished")}
        >
          <CheckCircle className="mr-2 h-4 w-4" />
          Finished
          <span className="ml-1 text-gray-500 dark:text-gray-400 text-xs">
            {bookCounts.finished}
          </span>
        </button>
        
        <button
          className={`${
            activeTab === "want_to_read"
              ? "border-primary text-primary dark:text-primary-foreground"
              : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
          } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
          onClick={() => onTabChange("want_to_read")}
        >
          <Library className="mr-2 h-4 w-4" />
          Want to Read
          <span className="ml-1 text-gray-500 dark:text-gray-400 text-xs">
            {bookCounts.wantToRead}
          </span>
        </button>
        
        <button
          className={`${
            activeTab === "all"
              ? "border-primary text-primary dark:text-primary-foreground"
              : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
          } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          onClick={() => onTabChange("all")}
        >
          All Books
          <span className="ml-1 text-gray-500 dark:text-gray-400 text-xs">
            {bookCounts.total}
          </span>
        </button>
      </nav>
    </div>
  );
}
