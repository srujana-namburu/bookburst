import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserBookWithDetails } from "@shared/schema";
import { BookshelfTabs } from "@/components/book/bookshelf-tabs";
import { BookGrid } from "@/components/book/book-grid";
import { AddBookModal } from "@/components/book/add-book-modal";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { LayoutGrid, List, PlusCircle, Search } from "lucide-react";

type BookshelfTab = "reading" | "finished" | "want_to_read" | "all";
type SortOption = "title" | "author" | "date_added" | "rating";
type ViewMode = "grid" | "list";

export default function BookshelfPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<BookshelfTab>("reading");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("date_added");
  const [genreFilter, setGenreFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [isAddBookModalOpen, setIsAddBookModalOpen] = useState(false);

  // Fetch user's books
  const { data: userBooks = [], isLoading } = useQuery<UserBookWithDetails[]>({
    queryKey: ["/api/user-books"],
  });

  // Filter books based on active tab
  const filteredBooks = userBooks.filter(book => {
    // Filter by tab
    if (activeTab !== "all" && book.status !== activeTab) {
      return false;
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesTitle = book.book.title.toLowerCase().includes(query);
      const matchesAuthor = book.book.author.toLowerCase().includes(query);
      if (!matchesTitle && !matchesAuthor) {
        return false;
      }
    }
    
    // Filter by genre
    if (genreFilter !== "all" && book.book.genre !== genreFilter) {
      return false;
    }
    
    return true;
  });

  // Sort filtered books
  const sortedBooks = [...filteredBooks].sort((a, b) => {
    switch (sortBy) {
      case "title":
        return a.book.title.localeCompare(b.book.title);
      case "author":
        return a.book.author.localeCompare(b.book.author);
      case "rating":
        return (b.rating || 0) - (a.rating || 0);
      case "date_added":
      default:
        return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
    }
  });

  // Count books by status
  const bookCounts = {
    reading: userBooks.filter(book => book.status === "reading").length,
    finished: userBooks.filter(book => book.status === "finished").length,
    wantToRead: userBooks.filter(book => book.status === "want_to_read").length,
    total: userBooks.length,
  };

  // Get unique genres from books
  const genres = ["all", ...new Set(userBooks.map(book => book.book.genre).filter(Boolean))];

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      await apiRequest("PATCH", `/api/user-books/${id}`, { status });
      queryClient.invalidateQueries({ queryKey: ["/api/user-books"] });
      toast({
        title: "Status updated",
        description: `Book has been moved to your ${status} shelf`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update book status",
        variant: "destructive",
      });
    }
  };

  const handleUpdateProgress = async (id: number, progress: number) => {
    try {
      await apiRequest("PATCH", `/api/user-books/${id}`, { progress });
      queryClient.invalidateQueries({ queryKey: ["/api/user-books"] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update reading progress",
        variant: "destructive",
      });
    }
  };

  const handleUpdateRating = async (id: number, rating: number) => {
    try {
      await apiRequest("PATCH", `/api/user-books/${id}`, { rating });
      queryClient.invalidateQueries({ queryKey: ["/api/user-books"] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update rating",
        variant: "destructive",
      });
    }
  };

  const handleDeleteBook = async (id: number) => {
    try {
      await apiRequest("DELETE", `/api/user-books/${id}`);
      queryClient.invalidateQueries({ queryKey: ["/api/user-books"] });
      toast({
        title: "Book removed",
        description: "Book has been removed from your shelf",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove book",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <header className="flex justify-between items-center mb-6">
        <h2 className="font-serif text-3xl font-bold text-gray-800 dark:text-gray-100">My Bookshelf</h2>
        <Button
          onClick={() => setIsAddBookModalOpen(true)}
          className="bg-primary hover:bg-primary/90"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Book
        </Button>
      </header>

      {/* Tabs */}
      <BookshelfTabs
        activeTab={activeTab}
        bookCounts={bookCounts}
        onTabChange={setActiveTab}
      />

      {/* Controls */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <Input
            type="text"
            placeholder="Search books..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Select 
            value={sortBy} 
            onValueChange={(value) => setSortBy(value as SortOption)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date_added">Sort by: Date Added</SelectItem>
              <SelectItem value="title">Sort by: Title</SelectItem>
              <SelectItem value="author">Sort by: Author</SelectItem>
              <SelectItem value="rating">Sort by: Rating</SelectItem>
            </SelectContent>
          </Select>
          
          <Select 
            value={genreFilter} 
            onValueChange={setGenreFilter}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by Genre" />
            </SelectTrigger>
            <SelectContent>
              {genres.map((genre) => (
                <SelectItem key={genre} value={genre}>
                  {genre === "all" ? "All Genres" : genre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <div className="flex">
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="icon"
              className="rounded-r-none"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
              <span className="sr-only">List view</span>
            </Button>
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="icon"
              className="rounded-l-none"
              onClick={() => setViewMode("grid")}
            >
              <LayoutGrid className="h-4 w-4" />
              <span className="sr-only">Grid view</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Books Grid/List */}
      {isLoading ? (
        <div className="py-10 text-center">Loading your books...</div>
      ) : (
        <BookGrid
          books={sortedBooks}
          onUpdateStatus={handleUpdateStatus}
          onUpdateProgress={handleUpdateProgress}
          onUpdateRating={handleUpdateRating}
          onDelete={handleDeleteBook}
          emptyMessage={
            searchQuery || genreFilter !== "all" 
              ? "No books match your filters. Try adjusting your search or filters."
              : activeTab === "all" 
                ? "You haven't added any books yet. Click 'Add Book' to get started."
                : `You don't have any books in your '${activeTab}' shelf yet.`
          }
        />
      )}

      {/* Floating Add Button */}
      <Button
        className="bg-primary hover:bg-primary/90 text-white p-2 rounded-full shadow-md transition-all fixed bottom-6 right-6 z-20 flex items-center justify-center"
        size="icon"
        onClick={() => setIsAddBookModalOpen(true)}
      >
        <PlusCircle className="h-6 w-6" />
        <span className="sr-only">Quick Add Book</span>
      </Button>

      {/* Add Book Modal */}
      <AddBookModal 
        open={isAddBookModalOpen} 
        onOpenChange={setIsAddBookModalOpen} 
      />
    </div>
  );
}
