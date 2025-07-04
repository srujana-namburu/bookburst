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
  const recentlyAddedBooks = [...(userBooks || [])].sort((a, b) => {
    const dateA = a.dateAdded ? new Date(a.dateAdded) : new Date(0);
    const dateB = b.dateAdded ? new Date(b.dateAdded) : new Date(0); 
    return dateB.getTime() - dateA.getTime();
  }).slice(0, 4);

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
            books={readingBooks.map(book => ({
              ...book,
              dateUpdated: book.dateUpdated || new Date()
            }))}
            onUpdateStatus={handleUpdateStatus}
            onUpdateProgress={async (id, progress) => {
              try {
                await apiRequest("PATCH", `/api/user-books/${id}`, { progress });
                queryClient.invalidateQueries({ queryKey: ["/api/user-books"] });
              } catch (error) {
                console.error("Failed to update reading progress:", error);
              }
            }}
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
            books={recentlyAddedBooks.map(book => ({
              ...book,
              dateUpdated: book.dateUpdated || new Date()
            }))} 
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
            {(Array.isArray(allBooks) ? allBooks : []).slice(0, 5).map((book: any) => (
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
