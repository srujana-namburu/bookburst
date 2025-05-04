import { useEffect, useState } from "react";
import { StarRating } from "@/components/ui/star-rating";
import { Book } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock } from "lucide-react";
import { trackBookView } from "@/lib/cookie-manager";

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
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Track book view when the details dialog is opened
  useEffect(() => {
    if (isDetailsOpen) {
      trackBookView(book.id, book.genre || undefined, book.author);
    }
  }, [isDetailsOpen, book]);

  return (
    <>
      <div 
        className="book-card bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden cursor-pointer"
        onClick={() => setIsDetailsOpen(true)}
      >
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
              onClick={(e) => {
                e.stopPropagation(); // Prevent opening the details dialog
                onAddToShelf?.(book);
              }}
            >
              + Add
            </Button>
          </div>
        </div>
      </div>

      {/* Book details dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif">{book.title}</DialogTitle>
            <DialogDescription>by {book.author}</DialogDescription>
          </DialogHeader>

          <div className="flex gap-4 py-4">
            <img
              src={book.coverImage || "https://via.placeholder.com/200x300?text=No+Cover"}
              className="w-32 h-48 object-cover rounded"
              alt={`Cover for ${book.title}`}
            />
            <div className="space-y-3">
              {book.genre && (
                <Badge variant="outline" className="mb-2">{book.genre}</Badge>
              )}

              {book.publicationDate && (
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>Published: {new Date(book.publicationDate).toLocaleDateString()}</span>
                </div>
              )}

              <div className="flex items-center">
                <StarRating
                  rating={averageRating}
                  size="sm"
                  readOnly
                  className="mr-1"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {averageRating.toFixed(1)} ({readers} readers)
                </span>
              </div>

              {book.isbn && (
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  ISBN: {book.isbn}
                </div>
              )}

              <Button 
                className="w-full mt-4"
                onClick={() => {
                  onAddToShelf?.(book);
                  setIsDetailsOpen(false);
                }}
              >
                Add to My Bookshelf
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
