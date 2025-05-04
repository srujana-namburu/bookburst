import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserCard } from "@/components/profile/user-card";
import { ReviewCard } from "@/components/review/review-card";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Search } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

// Mock types for the community page
type User = {
  id: number;
  name: string;
  email: string;
  profilePicture?: string;
  booksRead: number;
  genres: string[];
  followersCount: number;
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
    email: string;
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
  const { user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState("reviews");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch users
  const { data: users = [], isLoading: isLoadingUsers } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  // Remove mockReviews and fetch real reviews
  const { data: reviews = [] } = useQuery<Review[]>({
    queryKey: ["/api/reviews"],
  });

  const filteredReviews = reviews.filter(review => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return review.book.title.toLowerCase().includes(query) ||
           review.book.author.toLowerCase().includes(query) ||
           review.user.name.toLowerCase().includes(query);
  });

  // Filter out the current user from the users list
  const filteredUsers = users.filter(user => {
    if (!searchQuery) return user.id !== currentUser?.id;
    const query = searchQuery.toLowerCase();
    return (
      user.id !== currentUser?.id &&
      (user.name.toLowerCase().includes(query) || user.email.toLowerCase().includes(query))
    );
  });

  // Store follow status for each user
  const [followStatus, setFollowStatus] = useState<Record<number, boolean>>({});

  // Store followers count for each user
  const [followersCount, setFollowersCount] = useState<Record<number, number>>({});

  // When users are loaded, initialize followersCount state
  useEffect(() => {
    const counts: Record<number, number> = {};
    users.forEach(user => {
      counts[user.id] = user.followersCount;
    });
    setFollowersCount(counts);
  }, [users]);

  // Fetch follow status for each user (except current user)
  useEffect(() => {
    if (!currentUser) return;
    const fetchStatuses = async () => {
      const statuses: Record<number, boolean> = {};
      await Promise.all(
        users
          .filter(user => user.id !== currentUser.id)
          .map(async (user) => {
            try {
              const res = await fetch(`/api/follow/status/${user.id}`, { credentials: "include" });
              if (res.ok) {
                const data = await res.json();
                statuses[user.id] = data.isFollowing;
              }
            } catch {}
          })
      );
      setFollowStatus(statuses);
    };
    fetchStatuses();
  }, [users, currentUser?.id]);

  const handleFollowUser = async (userId: number) => {
    try {
      await apiRequest("POST", `/api/follow/${userId}`);
      setFollowStatus((prev) => ({ ...prev, [userId]: true }));
      setFollowersCount((prev) => ({ ...prev, [userId]: (prev[userId] || 0) + 1 }));
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
      setFollowStatus((prev) => ({ ...prev, [userId]: false }));
      setFollowersCount((prev) => ({ ...prev, [userId]: Math.max((prev[userId] || 1) - 1, 0) }));
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
                    user={{ ...user, followersCount: followersCount[user.id] ?? user.followersCount }}
                    isFollowing={!!followStatus[user.id]}
                    onFollow={() => handleFollowUser(user.id)}
                    onUnfollow={() => handleUnfollowUser(user.id)}
                  />
                ))
              ) : (
                <div className="col-span-3 text-center py-10">
                  <div className="text-5xl mb-4">👥</div>
                  <h3 className="text-xl font-semibold mb-2">No other users found</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {searchQuery ? "Try adjusting your search query." : "There are no other active users at the moment."}
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
