import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingBookCard } from "@/components/book/trending-book-card";
import { AddBookModal } from "@/components/book/add-book-modal";
import { Book } from "@shared/schema";
import { Search, Sparkles } from "lucide-react";
import { 
  getUserBehavior, 
  trackSearch, 
  hasConsent, 
  getPersonalizedGenres,
  getPersonalizedBookRecommendations 
} from "@/lib/cookie-manager";

export default function DiscoverPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("trending");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("all");
  const [isAddBookModalOpen, setIsAddBookModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [personalizedBooks, setPersonalizedBooks] = useState<Book[]>([]);
  const [favGenres, setFavGenres] = useState<string[]>([]);
  const [hasUserConsent, setHasUserConsent] = useState(false);

  // Fetch all books
  const { data: books = [], isLoading } = useQuery<Book[]>({
    queryKey: ["/api/books"],
  });

  // Fetch trending books
  const { data: trendingBooks = [], isLoading: isLoadingTrending } = useQuery<Array<{ book: Book, count: number }>>({
    queryKey: ["/api/trending-books"],
    queryFn: async () => {
      const res = await fetch("/api/trending-books");
      if (!res.ok) throw new Error("Failed to fetch trending books");
      return res.json();
    },
  });

  // Initialize personalization data
  useEffect(() => {
    if (books.length > 0) {
      const consent = hasConsent();
      setHasUserConsent(consent);
      
      if (consent) {
        // Get personalized recommendations based on user behavior
        const recommended = getPersonalizedBookRecommendations(books);
        setPersonalizedBooks(recommended);
        
        // Get user's favorite genres based on behavior
        const genres = getPersonalizedGenres();
        setFavGenres(genres);
      } else {
        // If no consent, just use the regular books
        setPersonalizedBooks(books);
      }
    }
  }, [books]);

  // Get unique genres
  const uniqueGenres = Array.from(new Set(books.map(book => book.genre).filter(Boolean) as string[]));
  const genres = ["all", ...uniqueGenres];

  // Track search when query changes
  useEffect(() => {
    if (searchQuery.trim().length > 2) {
      trackSearch(searchQuery);
    }
  }, [searchQuery]);

  // Filter books based on search and genre
  const filteredBooks = books.filter(book => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesTitle = book.title.toLowerCase().includes(query);
      const matchesAuthor = book.author.toLowerCase().includes(query);
      if (!matchesTitle && !matchesAuthor) {
        return false;
      }
    }
    
    if (selectedGenre !== "all" && book.genre !== selectedGenre) {
      return false;
    }
    
    return true;
  });

  // Filter trending books by search query and genre
  const filteredTrendingBooks = trendingBooks.filter(({ book }) => {
    // Genre filter
    if (selectedGenre !== "all" && book.genre !== selectedGenre) return false;
    // Search filter
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      book.title.toLowerCase().includes(query) ||
      book.author.toLowerCase().includes(query)
    );
  });

  const handleAddToShelf = (book: Book) => {
    setSelectedBook(book);
    setIsAddBookModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <header className="mb-8">
        <h2 className="font-serif text-3xl font-bold text-gray-800 dark:text-gray-100 mb-4">
          Discover New Books
        </h2>
        <p className="text-gray-600 dark:text-gray-400 max-w-3xl">
          Explore trending books, get personalized recommendations, and find your next great read.
        </p>
      </header>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar with filters */}
        <div className="w-full md:w-64 space-y-6">
          {/* Search */}
          <div>
            <h3 className="font-medium mb-2">Search</h3>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <Input 
                type="text"
                placeholder="Search titles or authors"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Genre filter */}
          <div>
            <h3 className="font-medium mb-2">Genres</h3>
            <div className="space-y-2">
              {genres.map(genre => (
                <Button
                  key={genre}
                  variant={selectedGenre === genre ? "default" : "outline"}
                  size="sm"
                  className="mr-2 mb-2"
                  onClick={() => setSelectedGenre(genre)}
                >
                  {genre === "all" ? "All Genres" : genre}
                </Button>
              ))}
            </div>
          </div>

          {/* Random book recommendation */}
          <div>
            <h3 className="font-medium mb-2">Surprise Me</h3>
            <Button 
              className="w-full"
              onClick={() => {
                const randomIndex = Math.floor(Math.random() * books.length);
                if (books[randomIndex]) {
                  handleAddToShelf(books[randomIndex]);
                  toast({
                    title: "Random Book Selected",
                    description: `How about "${books[randomIndex].title}" by ${books[randomIndex].author}?`,
                  });
                }
              }}
            >
              Random Book
            </Button>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1">
          <Tabs defaultValue="trending" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="trending">Trending</TabsTrigger>
            </TabsList>

            {/* Trending tab */}
            <TabsContent value="trending">
              {isLoadingTrending ? (
                <div className="py-10 text-center">Loading trending books...</div>
              ) : filteredTrendingBooks.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredTrendingBooks.map((item) => {
                    const { book, count } = item as { book: Book, count: number };
                    return (
                      <TrendingBookCard
                        key={book.id}
                        book={book}
                        readers={count}
                        averageRating={4 + Math.random()}
                        onAddToShelf={() => handleAddToShelf(book)}
                      />
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-10">
                  <div className="text-5xl mb-4">📚</div>
                  <h3 className="text-xl font-semibold mb-2">No books match your filters</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Try a different search or genre.
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Reading Challenges */}
      <section className="mt-12">
        <h2 className="font-serif text-xl font-semibold text-gray-800 dark:text-gray-100 mb-6">
          Reading Challenges
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-4">
            <div className="flex justify-between items-start mb-3">
              <h4 className="font-serif font-bold text-lg">2023 Reading Challenge</h4>
              <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">In Progress</span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              You've read 15 of 30 books this year
            </p>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-4">
              <div className="bg-primary h-2.5 rounded-full" style={{ width: "50%" }}></div>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500 dark:text-gray-400">50% complete</span>
              <Button variant="ghost" className="text-primary font-medium">View Details</Button>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex justify-between items-start mb-3">
              <h4 className="font-serif font-bold text-lg">Genres Exploration</h4>
              <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">In Progress</span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">Read books from 5 different genres</p>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-4">
              <div className="bg-primary h-2.5 rounded-full" style={{ width: "60%" }}></div>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500 dark:text-gray-400">3 of 5 genres</span>
              <Button variant="ghost" className="text-primary font-medium">View Details</Button>
            </div>
          </Card>
        </div>
      </section>

      {/* Add Book Modal */}
      <AddBookModal 
        open={isAddBookModalOpen} 
        onOpenChange={setIsAddBookModalOpen} 
      />
    </div>
  );
}
