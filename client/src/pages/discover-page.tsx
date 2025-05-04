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
              <TabsTrigger value="for-you">For You</TabsTrigger>
              <TabsTrigger value="new-releases">New Releases</TabsTrigger>
            </TabsList>

            {/* Trending tab */}
            <TabsContent value="trending">
              {isLoading ? (
                <div className="py-10 text-center">Loading trending books...</div>
              ) : filteredBooks.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredBooks.map(book => (
                    <TrendingBookCard
                      key={book.id}
                      book={book}
                      readers={Math.floor(Math.random() * 1000) + 100}
                      averageRating={4 + Math.random()}
                      onAddToShelf={() => handleAddToShelf(book)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <div className="text-5xl mb-4">📚</div>
                  <h3 className="text-xl font-semibold mb-2">No books found</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Try adjusting your search or filters to find more books.
                  </p>
                </div>
              )}
            </TabsContent>

            {/* For You tab */}
            <TabsContent value="for-you">
              {!hasUserConsent ? (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-6 border border-amber-200 dark:border-amber-800">
                  <div className="flex items-start">
                    <Sparkles className="h-5 w-5 text-amber-500 mr-3 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-serif text-xl font-semibold mb-2">
                        Personalized Recommendations
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        Enable cookies for personalized book recommendations based on your reading preferences and browsing patterns.
                      </p>
                      <Button
                        variant="outline" 
                        size="sm"
                        className="border-amber-500 text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-950/50"
                        onClick={() => {
                          toast({
                            title: "Cookie Settings",
                            description: "You can enable personalization from the cookie banner at the bottom of the page."
                          });
                        }}
                      >
                        Enable Personalization
                      </Button>
                    </div>
                  </div>
                </div>
              ) : null}
              
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-10">
                <h3 className="font-serif text-xl font-semibold text-primary mb-4">
                  Recommended For You
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                  {hasUserConsent 
                    ? "Personalized recommendations based on your reading history and preferences" 
                    : "Popular books we think you might enjoy"}
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Recommendation cards */}
                  {personalizedBooks.slice(0, 6).map(book => (
                    <div key={book.id} className="flex bg-bookcream-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                      <img 
                        src={book.coverImage || "https://via.placeholder.com/200x300?text=No+Cover"} 
                        className="w-24 h-full object-cover" 
                        alt={`Cover for ${book.title}`} 
                      />
                      <div className="p-3 flex-1">
                        <h4 className="font-serif font-bold text-md mb-1">{book.title}</h4>
                        <p className="text-gray-600 dark:text-gray-400 text-xs mb-2">{book.author}</p>
                        {hasUserConsent && book.genre && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                            {favGenres.includes(book.genre) 
                              ? `Because you enjoy ${book.genre} books`
                              : book.genre}
                          </p>
                        )}
                        <div className="flex justify-between items-center">
                          <div className="flex text-yellow-400 text-xs">
                            ★★★★☆
                          </div>
                          <Button 
                            size="sm" 
                            onClick={() => handleAddToShelf(book)}
                          >
                            Add
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* New Releases tab */}
            <TabsContent value="new-releases">
              {isLoading ? (
                <div className="py-10 text-center">Loading new releases...</div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredBooks
                    .sort((a, b) => {
                      // Sort by publication date (newest first)
                      if (!a.publicationDate) return 1;
                      if (!b.publicationDate) return -1;
                      return new Date(b.publicationDate).getTime() - new Date(a.publicationDate).getTime();
                    })
                    .slice(0, 8)
                    .map(book => (
                      <TrendingBookCard
                        key={book.id}
                        book={book}
                        readers={Math.floor(Math.random() * 500) + 50}
                        averageRating={4 + Math.random() * 0.5}
                        onAddToShelf={() => handleAddToShelf(book)}
                      />
                    ))
                  }
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
