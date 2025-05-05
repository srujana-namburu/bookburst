import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { StarRating } from "@/components/ui/star-rating";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertBookSchema } from "@shared/schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Search } from "lucide-react";
import { insertUserBookSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";

type Book = {
  id: number;
  title: string;
  author: string;
  coverImage?: string;
  genre?: string;
  publicationDate?: string;
  isbn?: string;
};

interface AddBookModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prefillBook?: Book | null;
}

const bookFormSchema = insertBookSchema.extend({
  title: z.string().min(1, "Title is required"),
  author: z.string().min(1, "Author is required"),
});

const bookDetailsSchema = insertUserBookSchema.extend({
  bookId: z.number(),
  status: z.enum(["reading", "finished", "want_to_read"]),
  progress: z.number().min(0).max(100).nullable().optional(),
  rating: z.number().min(0).max(5).nullable().optional(),
  review: z.string().nullable().optional(),
  isPublic: z.boolean().default(false),
});

type BookFormValues = z.infer<typeof bookFormSchema>;
type BookDetailsValues = z.infer<typeof bookDetailsSchema>;

export function AddBookModal({ open, onOpenChange, prefillBook }: AddBookModalProps) {
  const [activeTab, setActiveTab] = useState("search");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Book[]>([]);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [readingStatus, setReadingStatus] = useState<"reading" | "finished" | "want_to_read">("reading");
  const [progress, setProgress] = useState(0);
  const [rating, setRating] = useState(0);
  const [isPublic, setIsPublic] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [googleResults, setGoogleResults] = useState<Book[]>([]);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);
  const { data: userBooks = [] } = useQuery<any[]>({
    queryKey: ["/api/user-books"],
    enabled: open,
  });

  const bookForm = useForm<BookFormValues>({
    resolver: zodResolver(bookFormSchema),
    defaultValues: {
      title: "",
      author: "",
      coverImage: "",
      genre: "",
      publicationDate: "",
      isbn: "",
    },
  });

  // Prefill logic
  useEffect(() => {
    if (open && prefillBook) {
      setSelectedBook(prefillBook);
      bookForm.reset({
        title: typeof prefillBook.title === 'string' ? prefillBook.title : (prefillBook.title ? String(prefillBook.title) : ''),
        author: typeof prefillBook.author === 'string' ? prefillBook.author : (prefillBook.author ? String(prefillBook.author) : ''),
        coverImage: typeof prefillBook.coverImage === 'string' ? prefillBook.coverImage : (prefillBook.coverImage ? String(prefillBook.coverImage) : undefined),
        genre: typeof prefillBook.genre === 'string' ? prefillBook.genre : (prefillBook.genre ? String(prefillBook.genre) : undefined),
        publicationDate: typeof prefillBook.publicationDate === 'string' ? prefillBook.publicationDate : (prefillBook.publicationDate ? String(prefillBook.publicationDate) : undefined),
        isbn: typeof prefillBook.isbn === 'string' ? prefillBook.isbn : (prefillBook.isbn ? String(prefillBook.isbn) : undefined),
      });
    } else if (!open) {
      setSelectedBook(null);
      bookForm.reset();
    }
  }, [open, prefillBook]);

  const handleSearch = async (term: string) => {
    if (!term.trim()) return;
    
    // This would typically be an API call to search for books
    // For demo purposes, we're just returning some mock results
    setTimeout(() => {
      const results: Book[] = [
        {
          id: 1,
          title: `${term} - A Novel`,
          author: "John Doe",
          coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
          genre: "Fiction",
        },
        {
          id: 2,
          title: `The History of ${term}`,
          author: "Jane Smith",
          coverImage: "https://images.unsplash.com/photo-1531911120215-9f628dc6e9c9?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
          genre: "Non-fiction",
        },
      ];
      setSearchResults(results);
    }, 500);
  };

  const handleSelectBook = (book: Book) => {
    setSelectedBook(book);
    // Optionally, fill the manual form with this book's details
    bookForm.reset({
      title: typeof book.title === 'string' ? book.title : (book.title ? String(book.title) : ''),
      author: typeof book.author === 'string' ? book.author : (book.author ? String(book.author) : ''),
      coverImage: typeof book.coverImage === 'string' ? book.coverImage : (book.coverImage ? String(book.coverImage) : undefined),
      genre: typeof book.genre === 'string' ? book.genre : (book.genre ? String(book.genre) : undefined),
      publicationDate: typeof book.publicationDate === 'string' ? book.publicationDate : (book.publicationDate ? String(book.publicationDate) : undefined),
      isbn: typeof book.isbn === 'string' ? book.isbn : (book.isbn ? String(book.isbn) : undefined),
    });
  };

  const handleCreateBook = async (data: BookFormValues) => {
    try {
      // Create the book
      const res = await apiRequest("POST", "/api/books", data);
      const book = await res.json();
      
      // Add book to user's shelf
      const userBookData: BookDetailsValues = {
        userId: user?.id!,
        bookId: book.id,
        status: readingStatus,
        progress: readingStatus === "reading" ? progress : null,
        rating: rating > 0 ? rating : null,
        review: null,
        isPublic,
      };
      
      await apiRequest("POST", "/api/user-books", userBookData);
      
      // Invalidate queries to refresh the bookshelf
      queryClient.invalidateQueries({ queryKey: ["/api/user-books"] });
      
      // Show success toast
      toast({
        title: "Book Added",
        description: `${book.title} has been added to your bookshelf.`,
      });
      
      // Close the modal
      onOpenChange(false);
      
      // Reset form
      bookForm.reset();
      setSelectedBook(null);
      setSearchTerm("");
      setSearchResults([]);
      setReadingStatus("reading");
      setProgress(0);
      setRating(0);
      setIsPublic(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add book to your bookshelf.",
        variant: "destructive",
      });
    }
  };

  const onSubmit = async () => {
    if (selectedBook) {
      // Check if book is already in user's bookshelf (by title+author, case-insensitive)
      const alreadyExists = userBooks.some((ub) =>
        ub.book &&
        ub.book.title &&
        ub.book.author &&
        selectedBook.title &&
        selectedBook.author &&
        ub.book.title.trim().toLowerCase() === selectedBook.title.trim().toLowerCase() &&
        ub.book.author.trim().toLowerCase() === selectedBook.author.trim().toLowerCase()
      );
      if (alreadyExists) {
        toast({
          title: "Book already in shelf",
          description: "Selected book is already present in your bookshelf.",
          variant: "destructive",
        });
        return;
      }
      // If not present, proceed to add
      await handleCreateBook({
        title: selectedBook.title ?? '',
        author: selectedBook.author ?? '',
        coverImage: selectedBook.coverImage === null ? undefined : selectedBook.coverImage,
        genre: selectedBook.genre === null ? undefined : selectedBook.genre,
        publicationDate: selectedBook.publicationDate === null ? undefined : selectedBook.publicationDate,
        isbn: selectedBook.isbn === null ? undefined : selectedBook.isbn,
      });
    } else {
      // Otherwise use the manual form data
      bookForm.handleSubmit(handleCreateBook)();
    }
  };

  // Google Books API search
  const fetchGoogleBooks = async (term: string) => {
    if (!term.trim()) return setGoogleResults([]);
    try {
      const res = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(term)}&maxResults=5`
      );
      const data = await res.json();
      if (!data.items) return setGoogleResults([]);
      const results: Book[] = data.items.map((item: any) => ({
        id: item.id,
        title: item.volumeInfo.title || "",
        author: (item.volumeInfo.authors && item.volumeInfo.authors.join(", ")) || "",
        coverImage:
          (item.volumeInfo.imageLinks && (item.volumeInfo.imageLinks.thumbnail || item.volumeInfo.imageLinks.smallThumbnail)) || "",
        genre: (item.volumeInfo.categories && item.volumeInfo.categories[0]) || "",
        publicationDate: item.volumeInfo.publishedDate || "",
        isbn:
          (item.volumeInfo.industryIdentifiers && item.volumeInfo.industryIdentifiers[0]?.identifier) || "",
      }));
      setGoogleResults(results);
      setDropdownOpen(true);
    } catch (e) {
      setGoogleResults([]);
      setDropdownOpen(false);
    }
  };

  // Debounced search
  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setDropdownOpen(!!value);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      fetchGoogleBooks(value);
    }, 400);
  };

  const handleSelectGoogleBook = (book: Book) => {
    setSelectedBook(book);
    setDropdownOpen(false);
    setGoogleResults([]);
    setSearchTerm(book.title);
    bookForm.reset({
      title: typeof book.title === 'string' ? book.title : (book.title ? String(book.title) : ''),
      author: typeof book.author === 'string' ? book.author : (book.author ? String(book.author) : ''),
      coverImage: typeof book.coverImage === 'string' ? book.coverImage : (book.coverImage ? String(book.coverImage) : undefined),
      genre: typeof book.genre === 'string' ? book.genre : (book.genre ? String(book.genre) : undefined),
      publicationDate: typeof book.publicationDate === 'string' ? book.publicationDate : (book.publicationDate ? String(book.publicationDate) : undefined),
      isbn: typeof book.isbn === 'string' ? book.isbn : (book.isbn ? String(book.isbn) : undefined),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">Add a Book to Your Shelf</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="search" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="search">Search for a book</TabsTrigger>
            <TabsTrigger value="manual">Add book manually</TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="grid flex-1 gap-2">
                <Label htmlFor="book-search">Search by title, author, or ISBN</Label>
                <div className="relative">
                  <Input
                    id="book-search"
                    value={searchTerm}
                    onChange={handleSearchInput}
                    placeholder="Search for a book"
                    className="pr-10"
                    autoComplete="off"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full"
                    onClick={() => fetchGoogleBooks(searchTerm)}
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                  {/* Google Books Dropdown */}
                  {dropdownOpen && googleResults.length > 0 && (
                    <div className="absolute z-50 left-0 right-0 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded shadow-lg mt-1 max-h-80 overflow-y-auto">
                      {googleResults.map((book) => (
                        <div
                          key={book.id}
                          className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-primary/10"
                          onClick={() => handleSelectGoogleBook(book)}
                        >
                          <img
                            src={book.coverImage || "https://via.placeholder.com/40x60?text=No+Cover"}
                            alt={book.title}
                            className="w-10 h-16 object-cover rounded"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">{book.title}</div>
                            <div className="text-xs text-gray-500 truncate">{book.author}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {searchResults.length > 0 && (
              <div className="space-y-4">
                <div className="text-sm font-medium">Search Results</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {searchResults.map((book) => (
                    <div 
                      key={book.id}
                      className={`flex bg-background rounded-lg p-2 cursor-pointer border-2 transition-colors ${
                        selectedBook?.id === book.id ? 'border-primary' : 'border-transparent hover:border-gray-200'
                      }`}
                      onClick={() => handleSelectBook(book)}
                    >
                      <img 
                        src={book.coverImage || "https://via.placeholder.com/100x150?text=No+Cover"} 
                        alt={book.title}
                        className="w-16 h-24 object-cover rounded mr-3"
                      />
                      <div>
                        <h4 className="font-medium">{book.title}</h4>
                        <p className="text-sm text-muted-foreground">{book.author}</p>
                        {book.genre && (
                          <span className="text-xs px-2 py-1 bg-accent/30 rounded-full mt-1 inline-block">
                            {book.genre}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="manual">
            <Form {...bookForm}>
              <form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-1">
                    <div className="flex flex-col items-center">
                      <div className="w-40 h-60 bg-gray-200 dark:bg-gray-700 mb-3 flex items-center justify-center rounded border-2 border-dashed border-gray-300 dark:border-gray-600">
                        {bookForm.watch("coverImage") ? (
                          <img
                            src={bookForm.watch("coverImage")}
                            alt="Book cover"
                            className="w-full h-full object-cover rounded"
                          />
                        ) : (
                          <div className="text-center p-4">
                            <div className="text-3xl mb-2">📚</div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">No cover image</span>
                          </div>
                        )}
                      </div>
                      <FormField
                        control={bookForm.control}
                        name="coverImage"
                        render={({ field }) => {
                          const { value, ...rest } = field;
                          return (
                            <FormItem className="w-full">
                              <FormControl>
                                <Input
                                  placeholder="Image URL"
                                  {...rest}
                                  className="text-xs"
                                  value={typeof value === 'string' ? value : ''}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          );
                        }}
                      />
                    </div>
                  </div>
                  
                  <div className="md:col-span-2 space-y-4">
                    <FormField
                      control={bookForm.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Book title" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={bookForm.control}
                      name="author"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Author</FormLabel>
                          <FormControl>
                            <Input placeholder="Author name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={bookForm.control}
                        name="genre"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Genre</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a genre" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Fiction">Fiction</SelectItem>
                                <SelectItem value="Non-fiction">Non-fiction</SelectItem>
                                <SelectItem value="Mystery">Mystery</SelectItem>
                                <SelectItem value="Science Fiction">Science Fiction</SelectItem>
                                <SelectItem value="Fantasy">Fantasy</SelectItem>
                                <SelectItem value="Biography">Biography</SelectItem>
                                <SelectItem value="History">History</SelectItem>
                                <SelectItem value="Self-help">Self-help</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={bookForm.control}
                        name="publicationDate"
                        render={({ field }) => {
                          const { value, ...rest } = field;
                          return (
                            <FormItem>
                              <FormLabel>Publication Date</FormLabel>
                              <FormControl>
                                <Input type="date" {...rest} value={typeof value === 'string' ? value : ''} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          );
                        }}
                      />
                    </div>
                    
                    <FormField
                      control={bookForm.control}
                      name="isbn"
                      render={({ field }) => {
                        const { value, ...rest } = field;
                        return (
                          <FormItem>
                            <FormLabel>ISBN (optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="ISBN" {...rest} value={typeof value === 'string' ? value : ''} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        );
                      }}
                    />
                  </div>
                </div>
              </form>
            </Form>
          </TabsContent>
        </Tabs>

        <div className="space-y-4 mt-6 pt-6 border-t">
          <div className="space-y-2">
            <Label>Reading Status</Label>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant={readingStatus === "reading" ? "default" : "outline"}
                onClick={() => setReadingStatus("reading")}
              >
                Reading
              </Button>
              <Button
                type="button"
                variant={readingStatus === "finished" ? "default" : "outline"}
                onClick={() => setReadingStatus("finished")}
              >
                Finished
              </Button>
              <Button
                type="button"
                variant={readingStatus === "want_to_read" ? "default" : "outline"}
                onClick={() => setReadingStatus("want_to_read")}
              >
                Want to Read
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Rating</Label>
            <StarRating
              rating={rating}
              onRate={setRating}
              size="lg"
            />
          </div>
          
          {readingStatus === "reading" && (
            <div className="space-y-2">
              <Label htmlFor="book-progress">Reading Progress</Label>
              <div className="flex items-center space-x-4">
                <Input
                  id="book-progress"
                  type="number"
                  min={0}
                  max={100}
                  value={progress}
                  onChange={(e) => setProgress(parseInt(e.target.value))}
                  className="w-20"
                />
                <span className="text-gray-500">%</span>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="book-notes">Notes (optional)</Label>
            <Textarea
              id="book-notes"
              placeholder="Your thoughts on the book..."
              rows={3}
            />
          </div>
          
          <div className="flex items-center gap-4 mt-4">
            <label className="flex items-center gap-1">
              <input
                type="radio"
                name="visibility"
                value="public"
                checked={isPublic === true}
                onChange={() => setIsPublic(true)}
              />
              Public
            </label>
            <label className="flex items-center gap-1">
              <input
                type="radio"
                name="visibility"
                value="private"
                checked={isPublic === false}
                onChange={() => setIsPublic(false)}
              />
              Private
            </label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSubmit}>
            Add Book
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
