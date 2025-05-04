import { StarRating } from "@/components/ui/star-rating";
import { Book } from "@shared/schema";
import { Button } from "@/components/ui/button";

interface TrendingBookCardProps {
  book: Book;
  readers?: number;
  averageRating?: number;
  onAddToShelf?: (book: Book) => void;
}

export function TrendingBookCard({
  book,
  readers = 0,
  averageRating = 0,
  onAddToShelf,
}: TrendingBookCardProps) {
  return (
    <div className="book-card bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <img
        src={book.coverImage || "https://via.placeholder.com/400x600?text=No+Cover"}
        className="w-full h-48 object-cover"
        alt={`Cover for ${book.title}`}
      />
      <div className="p-2">
        <h4 className="font-serif font-medium text-sm truncate">{book.title}</h4>
        <p className="text-gray-600 dark:text-gray-400 text-xs">{book.author}</p>
        <div className="flex items-center mt-1">
          <StarRating
            rating={averageRating}
            size="sm"
            readOnly
            className="mr-1"
          />
          <span className="text-xs text-gray-500 dark:text-gray-400">{averageRating.toFixed(1)}</span>
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-gray-500 dark:text-gray-400">{readers} readers</span>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-primary hover:text-primary/90 font-medium h-6 px-2"
            onClick={() => onAddToShelf?.(book)}
          >
            + Add
          </Button>
        </div>
      </div>
    </div>
  );
}
