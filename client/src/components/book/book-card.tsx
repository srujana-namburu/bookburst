import { useState } from "react";
import { StarRating } from "@/components/ui/star-rating";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Book, UserBook } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { BookDetailsDialog } from "./book-details-dialog";

interface BookCardProps {
  userBook: {
    id: number;
    status: string;
    progress?: number | null;
    rating?: number | null;
    review?: string | null;
    dateUpdated: Date;
    book: Book;
  };
  onUpdateStatus?: (id: number, status: string) => void;
  onUpdateProgress?: (id: number, progress: number) => void;
  onUpdateRating?: (id: number, rating: number) => void;
  onDelete?: (id: number) => void;
}

export function BookCard({
  userBook,
  onUpdateStatus,
  onUpdateProgress,
  onUpdateRating,
  onDelete,
}: BookCardProps) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const { id, status, progress, rating, dateUpdated, book } = userBook;
  
  const getStatusText = (status: string) => {
    switch (status) {
      case "reading":
        return "Reading";
      case "finished":
        return "Finished";
      case "want_to_read":
        return "Want to Read";
      default:
        return status;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case "reading":
        return "bg-primary";
      case "finished":
        return "bg-green-600";
      case "want_to_read":
        return "bg-accent";
      default:
        return "bg-gray-500";
    }
  };

  const formatTimeAgo = (date: Date) => {
    if (!(date instanceof Date)) {
      date = new Date(date);
    }
    
    return formatDistanceToNow(date, { addSuffix: true });
  };

  const handleCardClick = () => {
    setDetailsOpen(true);
  };

  return (
    <>
      <div 
        className="book-card bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden flex flex-col cursor-pointer transition-transform hover:scale-105 hover:shadow-lg"
        onClick={handleCardClick}
      >
        <div className="relative">
          <img
            src={book.coverImage || "https://via.placeholder.com/400x600?text=No+Cover"}
            className="w-full h-64 object-cover"
            alt={`Cover for ${book.title}`}
          />
          <div className={`absolute top-2 right-2 ${getStatusClass(status)} text-white text-xs px-2 py-1 rounded-full`}>
            {getStatusText(status)}
          </div>
        </div>
        <div className="p-4 flex-1 flex flex-col">
          <h3 className="font-serif text-lg font-bold mb-1 line-clamp-1">{book.title}</h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">by {book.author}</p>
          <div className="flex items-center mb-3">
            <StarRating
              rating={rating || 0}
              size="sm"
              className="mr-2"
              readOnly
            />
            {rating && <span className="text-xs text-gray-500 dark:text-gray-400">{rating.toFixed(1)}</span>}
          </div>
          
          {status === "reading" && progress !== undefined && progress !== null && (
            <div className="mt-auto">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Reading progress: {progress}%</div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mb-2">
                <div
                  className="bg-primary h-1.5 rounded-full reading-progress"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          )}
          
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Updated {formatTimeAgo(dateUpdated)}
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0"
                  onClick={(e) => e.stopPropagation()} // Prevent opening details when clicking dropdown
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation(); // Prevent opening details
                  onUpdateStatus?.(id, "reading");
                }}>
                  Mark as Reading
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation(); // Prevent opening details
                  onUpdateStatus?.(id, "finished");
                }}>
                  Mark as Finished
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation(); // Prevent opening details
                  onUpdateStatus?.(id, "want_to_read");
                }}>
                  Add to Want to Read
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation(); // Prevent opening details
                  onDelete?.(id);
                }}>
                  Remove from Shelf
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <BookDetailsDialog
        userBook={userBook}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        onUpdateStatus={onUpdateStatus}
        onUpdateProgress={onUpdateProgress}
        onUpdateRating={onUpdateRating}
        onDelete={onDelete}
      />
    </>
  );
}
