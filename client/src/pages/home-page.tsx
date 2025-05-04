import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { BookCard } from "@/components/book/book-card";
import { BookGrid } from "@/components/book/book-grid";
import { TrendingBookCard } from "@/components/book/trending-book-card";
import { UserBookWithDetails } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { AddBookModal } from "@/components/book/add-book-modal";
import { PlusCircle } from "lucide-react";

export default function HomePage() {
  const { user } = useAuth();
  const [isAddBookModalOpen, setIsAddBookModalOpen] = useState(false);

  // Fetch user's current reading books
  const { data: userBooks, isLoading: isLoadingUserBooks } = useQuery<UserBookWithDetails[]>({
    queryKey: ["/api/user-books"],
  });

  // Fetch trending books
  const { data: allBooks, isLoading: isLoadingBooks } = useQuery({
    queryKey: ["/api/books"],
  });

  const readingBooks = userBooks?.filter(book => book.status === "reading") || [];
  const recentlyAddedBooks = [...(userBooks || [])].sort((a, b) => 
    new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime()
  ).slice(0, 4);

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      await apiRequest("PATCH", `/api/user-books/${id}`, { status });
      queryClient.invalidateQueries({ queryKey: ["/api/user-books"] });
    } catch (error) {
      console.error("Failed to update book status:", error);
    }
  };

  const handleAddToShelf = (book: any) => {
    setIsAddBookModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-primary text-white rounded-lg mb-12">
        <div className="page-texture absolute inset-0"></div>
        <div className="relative z-10 py-16 px-8 md:px-12 lg:px-16 max-w-4xl">
          <h1 className="font-serif text-4xl md:text-5xl font-bold leading-tight mb-6">Your Reading Journey Begins Here</h1>
          <p className="text-lg md:text-xl mb-8 max-w-2xl">Track your books, discover new stories, and connect with fellow readers in a community built for book lovers.</p>
          <div className="flex flex-wrap gap-4">
            <Button 
              className="bg-accent hover:bg-accent/90 text-primary-foreground font-medium py-3 px-6"
              onClick={() => setIsAddBookModalOpen(true)}
            >
              Add Your First Book
            </Button>
            <Link href="/discover">
              <Button variant="outline" className="bg-transparent border-2 border-white hover:bg-white/10 text-white font-medium py-3 px-6">
                Explore Books
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Currently Reading Section */}
      <section className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-serif text-3xl font-bold text-gray-800 dark:text-gray-100">Currently Reading</h2>
          <Link href="/bookshelf">
            <Button variant="ghost" className="text-primary">View All</Button>
          </Link>
        </div>

        {isLoadingUserBooks ? (
          <div className="py-10 text-center">Loading your books...</div>
        ) : readingBooks.length > 0 ? (
          <BookGrid 
            books={readingBooks} 
            onUpdateStatus={handleUpdateStatus}
          />
        ) : (
          <Card>
            <CardContent className="py-10 text-center">
              <div className="flex flex-col items-center">
                <div className="text-5xl mb-4">📚</div>
                <h3 className="text-xl font-semibold mb-2">You're not reading any books yet</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                  Add books to your "Reading" shelf to keep track of your progress
                </p>
                <Button onClick={() => setIsAddBookModalOpen(true)}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add a Book
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </section>

      {/* Recently Added Books */}
      {recentlyAddedBooks.length > 0 && (
        <section className="mb-12">
          <h2 className="font-serif text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6">
            Recently Added
          </h2>
          <BookGrid 
            books={recentlyAddedBooks} 
            onUpdateStatus={handleUpdateStatus}
          />
        </section>
      )}

      {/* Trending Books */}
      <section className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-serif text-3xl font-bold text-gray-800 dark:text-gray-100">
            Trending Books
          </h2>
          <Link href="/discover">
            <Button variant="ghost" className="text-primary">See More</Button>
          </Link>
        </div>

        {isLoadingBooks ? (
          <div className="py-10 text-center">Loading trending books...</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {allBooks?.slice(0, 5).map(book => (
              <TrendingBookCard
                key={book.id}
                book={book}
                readers={Math.floor(Math.random() * 1000) + 100}
                averageRating={4 + Math.random()}
                onAddToShelf={() => handleAddToShelf(book)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Reading Challenges */}
      <section>
        <h2 className="font-serif text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6">
          Reading Challenges
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-4">
            <div className="flex justify-between items-start mb-3">
              <h4 className="font-serif font-bold text-lg">2023 Reading Challenge</h4>
              <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">In Progress</span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              You've read {userBooks?.filter(b => b.status === "finished").length || 0} of 30 books this year
            </p>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-4">
              <div 
                className="bg-primary h-2.5 rounded-full" 
                style={{ width: `${((userBooks?.filter(b => b.status === "finished").length || 0) / 30) * 100}%` }}
              ></div>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500 dark:text-gray-400">
                {Math.round(((userBooks?.filter(b => b.status === "finished").length || 0) / 30) * 100)}% complete
              </span>
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
              <div 
                className="bg-primary h-2.5 rounded-full" 
                style={{ width: "60%" }}
              ></div>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500 dark:text-gray-400">3 of 5 genres</span>
              <Button variant="ghost" className="text-primary font-medium">View Details</Button>
            </div>
          </Card>
        </div>
      </section>

      {/* Floating Add Button */}
      <Button
        className="bg-primary hover:bg-primary/90 text-white p-2 rounded-full shadow-md transition-all fixed bottom-6 right-6 z-20 flex items-center justify-center"
        size="icon"
        onClick={() => setIsAddBookModalOpen(true)}
      >
        <PlusCircle className="h-6 w-6" />
        <span className="sr-only">Add Book</span>
      </Button>

      {/* Add Book Modal */}
      <AddBookModal 
        open={isAddBookModalOpen} 
        onOpenChange={setIsAddBookModalOpen} 
      />
    </div>
  );
}
