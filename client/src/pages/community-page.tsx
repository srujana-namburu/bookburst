import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserCard } from "@/components/profile/user-card";
import { ReviewCard } from "@/components/review/review-card";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Search } from "lucide-react";

// Mock types for the community page
type User = {
  id: number;
  name: string;
  username: string;
  profilePicture?: string;
  booksRead: number;
  genres: string[];
};

type Review = {
  id: number;
  userId: number;
  bookId: number;
  rating: number;
  review: string;
  likes: number;
  comments: number;
  date: Date;
  user: {
    id: number;
    name: string;
    username: string;
    profilePicture?: string;
  };
  book: {
    id: number;
    title: string;
    author: string;
  };
};

export default function CommunityPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("reviews");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch users
  const { data: users = [], isLoading: isLoadingUsers } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  // For the purpose of this example, we'll create mock reviews based on books
  const { data: books = [] } = useQuery({
    queryKey: ["/api/books"],
  });

  // Create mock reviews based on books
  const mockReviews: Review[] = books.slice(0, 5).map((book, index) => ({
    id: index + 1,
    userId: index % users.length + 1,
    bookId: book.id,
    rating: Math.floor(Math.random() * 5) + 1,
    review: "This book was an incredible journey that took me through a range of emotions. The author's vivid descriptions and character development made me feel like I was right there experiencing the story firsthand. I highly recommend this to anyone looking for a thought-provoking read.",
    likes: Math.floor(Math.random() * 200) + 50,
    comments: Math.floor(Math.random() * 30) + 5,
    date: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
    user: users[index % users.length] || {
      id: index + 1,
      name: "User " + (index + 1),
      username: "user" + (index + 1),
      profilePicture: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
    },
    book: {
      id: book.id,
      title: book.title,
      author: book.author
    }
  }));

  const filteredUsers = users.filter(user => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return user.name.toLowerCase().includes(query) || 
           user.username.toLowerCase().includes(query);
  });

  const filteredReviews = mockReviews.filter(review => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return review.book.title.toLowerCase().includes(query) ||
           review.book.author.toLowerCase().includes(query) ||
           review.user.name.toLowerCase().includes(query);
  });

  const handleFollowUser = async (userId: number) => {
    try {
      await apiRequest("POST", `/api/follow/${userId}`);
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "Success",
        description: "You are now following this user",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to follow user",
        variant: "destructive",
      });
    }
  };

  const handleUnfollowUser = async (userId: number) => {
    try {
      await apiRequest("DELETE", `/api/follow/${userId}`);
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "Success",
        description: "You have unfollowed this user",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to unfollow user",
        variant: "destructive",
      });
    }
  };

  const handleLikeReview = (reviewId: number) => {
    toast({
      title: "Liked",
      description: "You liked this review",
    });
  };

  const handleCommentOnReview = (reviewId: number) => {
    toast({
      title: "Comment",
      description: "Comment feature coming soon",
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <header className="mb-8">
        <h2 className="font-serif text-3xl font-bold text-gray-800 dark:text-gray-100 mb-4">
          Community
        </h2>
        <p className="text-gray-600 dark:text-gray-400 max-w-3xl">
          Connect with fellow readers, discover popular reviews, and follow active readers with similar interests.
        </p>
      </header>

      <div className="mb-6">
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <Input
            type="text"
            placeholder={activeTab === "reviews" ? "Search reviews..." : "Search users..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Tabs defaultValue="reviews" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="reviews">Popular Reviews</TabsTrigger>
          <TabsTrigger value="users">Active Readers</TabsTrigger>
        </TabsList>

        {/* Reviews Tab */}
        <TabsContent value="reviews">
          <div className="grid grid-cols-1 gap-6">
            {filteredReviews.length > 0 ? (
              filteredReviews.map(review => (
                <ReviewCard
                  key={review.id}
                  user={review.user}
                  book={review.book}
                  rating={review.rating}
                  review={review.review}
                  likes={review.likes}
                  comments={review.comments}
                  date={review.date}
                  onLike={() => handleLikeReview(review.id)}
                  onComment={() => handleCommentOnReview(review.id)}
                />
              ))
            ) : (
              <div className="text-center py-10">
                <div className="text-5xl mb-4">📝</div>
                <h3 className="text-xl font-semibold mb-2">No reviews found</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {searchQuery ? "Try adjusting your search query." : "Be the first to write a review!"}
                </p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users">
          {isLoadingUsers ? (
            <div className="py-10 text-center">Loading users...</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {filteredUsers.length > 0 ? (
                filteredUsers.map(user => (
                  <UserCard
                    key={user.id}
                    user={user}
                    isFollowing={Math.random() > 0.5} // Mock following status
                    onFollow={() => handleFollowUser(user.id)}
                    onUnfollow={() => handleUnfollowUser(user.id)}
                  />
                ))
              ) : (
                <div className="col-span-3 text-center py-10">
                  <div className="text-5xl mb-4">👥</div>
                  <h3 className="text-xl font-semibold mb-2">No users found</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {searchQuery ? "Try adjusting your search query." : "There are no active users at the moment."}
                  </p>
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
