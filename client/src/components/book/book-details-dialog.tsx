import { useState, useEffect } from "react";
import { Book, UserBook } from "@shared/schema";
import { StarRating } from "@/components/ui/star-rating";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface BookDetailsDialogProps {
  userBook: {
    id: number;
    status: string;
    progress?: number | null;
    rating?: number | null;
    review?: string | null;
    dateUpdated: Date;
    book: Book;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateStatus?: (id: number, status: string) => void;
  onUpdateProgress?: (id: number, progress: number) => void;
  onUpdateRating?: (id: number, rating: number) => void;
  onDelete?: (id: number) => void;
}

export function BookDetailsDialog({
  userBook,
  open,
  onOpenChange,
  onUpdateStatus,
  onUpdateProgress,
  onUpdateRating,
  onDelete,
}: BookDetailsDialogProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>("details");
  const [progress, setProgress] = useState<number>(0);
  const [review, setReview] = useState<string>("");
  const [rating, setRating] = useState<number>(0);

  // Update local state when userBook changes
  useEffect(() => {
    if (userBook) {
      setProgress(userBook.progress || 0);
      setReview(userBook.review || "");
      setRating(userBook.rating || 0);
    }
  }, [userBook]);

  const handleSaveProgress = async () => {
    if (!userBook) return;
    
    try {
      await onUpdateProgress?.(userBook.id, progress);
      toast({
        title: "Progress updated",
        description: `Reading progress set to ${progress}%`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update reading progress",
        variant: "destructive",
      });
    }
  };

  const handleSaveReview = async () => {
    if (!userBook) return;
    
    try {
      await apiRequest("PATCH", `/api/user-books/${userBook.id}`, { review });
      queryClient.invalidateQueries({ queryKey: ["/api/user-books"] });
      toast({
        title: "Review saved",
        description: "Your review has been saved",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save review",
        variant: "destructive",
      });
    }
  };

  const handleUpdateRating = async (newRating: number) => {
    if (!userBook) return;
    
    try {
      setRating(newRating);
      await onUpdateRating?.(userBook.id, newRating);
      toast({
        title: "Rating updated",
        description: `Rating set to ${newRating} stars`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update rating",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!userBook) return;
    
    try {
      await onDelete?.(userBook.id);
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove book from shelf",
        variant: "destructive",
      });
    }
  };

  if (!userBook) return null;

  const { book, status } = userBook;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">{book.title}</DialogTitle>
        </DialogHeader>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <img
              src={book.coverImage || "https://via.placeholder.com/400x600?text=No+Cover"}
              alt={`Cover for ${book.title}`}
              className="w-full rounded-lg shadow-md"
            />
            
            <div className="mt-4 space-y-3">
              <div>
                <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400">Reading Status</h4>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Button
                    size="sm"
                    variant={status === "reading" ? "default" : "outline"}
                    onClick={() => onUpdateStatus?.(userBook.id, "reading")}
                  >
                    Reading
                  </Button>
                  <Button
                    size="sm"
                    variant={status === "finished" ? "default" : "outline"}
                    onClick={() => onUpdateStatus?.(userBook.id, "finished")}
                  >
                    Finished
                  </Button>
                  <Button
                    size="sm"
                    variant={status === "want_to_read" ? "default" : "outline"}
                    onClick={() => onUpdateStatus?.(userBook.id, "want_to_read")}
                  >
                    Want to Read
                  </Button>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400">Your Rating</h4>
                <div className="mt-2">
                  <StarRating
                    rating={rating}
                    onRate={handleUpdateRating}
                    size="md"
                  />
                </div>
              </div>
              
              {status === "reading" && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400">Reading Progress</h4>
                  <div className="flex items-center space-x-2 mt-2">
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={progress}
                      onChange={(e) => setProgress(parseInt(e.target.value))}
                      className="w-20"
                    />
                    <span className="text-gray-500">%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2 mb-2">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <Button size="sm" onClick={handleSaveProgress}>Save Progress</Button>
                </div>
              )}
            </div>
          </div>
          
          <div className="md:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="details">Book Details</TabsTrigger>
                <TabsTrigger value="review">Your Review</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="space-y-4 mt-4">
                <div>
                  <h3 className="text-lg font-bold">About the Book</h3>
                  <div className="grid grid-cols-2 gap-4 mt-3">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400">Author</h4>
                      <p>{book.author}</p>
                    </div>
                    {book.publicationDate && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400">Publication Date</h4>
                        <p>{book.publicationDate}</p>
                      </div>
                    )}
                    {book.genre && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400">Genre</h4>
                        <Badge variant="outline" className="mt-1">{book.genre}</Badge>
                      </div>
                    )}
                    {book.isbn && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400">ISBN</h4>
                        <p className="text-sm font-mono">{book.isbn}</p>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="review" className="space-y-4 mt-4">
                <div>
                  <h3 className="text-lg font-bold">Your Review</h3>
                  <Textarea
                    placeholder="Write your thoughts about this book..."
                    className="min-h-[150px] mt-3"
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                  />
                  <Button className="mt-3" onClick={handleSaveReview}>Save Review</Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}