import { BookCard } from "./book-card";
import { UserBook, Book } from "@shared/schema";

interface BookGridProps {
  books: Array<{
    id: number;
    status: string;
    progress?: number | null;
    rating?: number | null;
    dateUpdated: Date;
    book: Book;
  }>;
  onUpdateStatus?: (id: number, status: string) => void;
  onUpdateProgress?: (id: number, progress: number) => void;
  onUpdateRating?: (id: number, rating: number) => void;
  onDelete?: (id: number) => void;
  emptyMessage?: string;
}

export function BookGrid({
  books,
  onUpdateStatus,
  onUpdateProgress,
  onUpdateRating,
  onDelete,
  emptyMessage = "No books found"
}: BookGridProps) {
  if (books.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="text-5xl mb-4">📚</div>
        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
          Your shelf is empty
        </h3>
        <p className="text-gray-600 dark:text-gray-400 max-w-md">
          {emptyMessage}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {books.map((userBook) => (
        <BookCard
          key={userBook.id}
          userBook={userBook}
          onUpdateStatus={onUpdateStatus}
          onUpdateProgress={onUpdateProgress}
          onUpdateRating={onUpdateRating}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
