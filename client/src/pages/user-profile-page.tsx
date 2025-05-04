import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { UserBookWithDetails, User } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BookGrid } from "@/components/book/book-grid";
import { BookshelfTabs } from "@/components/book/bookshelf-tabs";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { ArrowLeft, BookOpen, CheckCircle, Library, Users } from "lucide-react";
import { ReviewCard } from "@/components/review/review-card";

export default function UserProfilePage() {
  const { toast } = useToast();
  const { id } = useParams<{ id: string }>();
  console.log('UserProfilePage: id param =', id);
  const [, navigate] = useLocation();
  const { user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<"reading" | "finished" | "want_to_read" | "all">("all");
  const [isFollowing, setIsFollowing] = useState(false);

  // Fetch user profile data (new endpoint)
  const { data: profileData, isLoading: isLoadingUser } = useQuery({
    queryKey: ["/api/users", id, "profile"],
    queryFn: async () => {
      const res = await fetch(`/api/users/${id}/profile`, { credentials: "include" });
      if (!res.ok) throw new Error("User not found");
      return res.json();
    },
    enabled: !!id,
  });

  const profileUser = profileData?.user;
  const publicBooks = profileData?.publicBooks || [];
  const followersCount = profileData?.followersCount || 0;
  const followingCount = profileData?.followingCount || 0;

  // Check if current user is following this user
  const { data: followingStatus } = useQuery<{isFollowing: boolean}>({
    queryKey: [`/api/follow/status/${id}`],
    enabled: !!currentUser && !!id && currentUser.id !== parseInt(id),
  });

  useEffect(() => {
    if (followingStatus) {
      setIsFollowing(followingStatus.isFollowing);
    }
  }, [followingStatus]);

  // Filter books based on active tab
  const filteredBooks = publicBooks.filter((book: any) => {
    if (activeTab !== "all" && book.status !== activeTab) {
      return false;
    }
    return true;
  });

  // Count books by status
  const bookCounts = {
    reading: publicBooks.filter((book: any) => book.status === "reading").length,
    finished: publicBooks.filter((book: any) => book.status === "finished").length,
    wantToRead: publicBooks.filter((book: any) => book.status === "want_to_read").length,
    total: publicBooks.length,
  };

  // Fetch user reviews for this profile
  const { data: userReviews = [], isLoading: isLoadingReviews } = useQuery({
    queryKey: ["/api/user-books", id, "reviews"],
    queryFn: async () => {
      const res = await fetch(`/api/user-books?userId=${id}&withReviews=true`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch user reviews");
      return res.json();
    },
    enabled: !!id,
  });

  const handleFollowToggle = async () => {
    if (!currentUser) {
      toast({
        title: "Authentication required",
        description: "Please log in to follow users",
        variant: "destructive",
      });
      return;
    }

    try {
      if (!profileUser) return;
      
      if (isFollowing) {
        await apiRequest("DELETE", `/api/follow/${id}`);
        setIsFollowing(false);
        toast({
          title: "Unfollowed",
          description: `You've unfollowed ${profileUser.name}`,
        });
      } else {
        await apiRequest("POST", `/api/follow/${id}`);
        setIsFollowing(true);
        toast({
          title: "Following",
          description: `You're now following ${profileUser.name}`,
        });
      }
      queryClient.invalidateQueries({ queryKey: [`/api/follow/status/${id}`] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update follow status",
        variant: "destructive",
      });
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  if (isLoadingUser) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-center items-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col items-center justify-center py-16">
          <h2 className="text-2xl font-bold mb-4">User Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">The user you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate("/community")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Community
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Button 
        variant="ghost" 
        className="mb-6" 
        onClick={() => navigate("/community")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Community
      </Button>
      
      {/* User Profile Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <Avatar className="h-24 w-24">
            <AvatarImage src={profileUser.profilePicture} alt={profileUser.name} />
            <AvatarFallback className="text-2xl">{getInitials(profileUser.name)}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1 text-center md:text-left">
            <h2 className="font-serif text-3xl font-bold text-gray-800 dark:text-gray-100 mb-1">
              {profileUser.name}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{profileUser.email}</p>
            
            <div className="flex flex-wrap gap-4 justify-center md:justify-start mb-4">
              <div className="flex items-center">
                <BookOpen className="h-5 w-5 mr-2 text-primary" />
                <span className="text-sm">
                  <span className="font-semibold">{bookCounts.reading}</span> Currently Reading
                </span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                <span className="text-sm">
                  <span className="font-semibold">{bookCounts.finished}</span> Completed
                </span>
              </div>
              <div className="flex items-center">
                <Library className="h-5 w-5 mr-2 text-amber-500" />
                <span className="text-sm">
                  <span className="font-semibold">{bookCounts.wantToRead}</span> Want to Read
                </span>
              </div>
              <div className="flex items-center">
                <Users className="h-5 w-5 mr-2 text-blue-500" />
                <span className="text-sm">
                  <span className="font-semibold">{followingCount}</span> Followers
                </span>
              </div>
            </div>
          </div>
          
          {currentUser && currentUser.id !== parseInt(id) && (
            <div className="mt-4 md:mt-0">
              <Button
                onClick={handleFollowToggle}
                variant={isFollowing ? "outline" : "default"}
              >
                {isFollowing ? "Following" : "Follow"}
              </Button>
            </div>
          )}
        </div>
      </div>
      
      <Tabs defaultValue="bookshelf" className="mb-8">
        <TabsList>
          <TabsTrigger value="bookshelf">Bookshelf</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
          <TabsTrigger value="all">Public Books</TabsTrigger>
        </TabsList>
        
        <TabsContent value="bookshelf" className="mt-6">
          <h3 className="font-serif text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">
            {profileUser.name}'s Bookshelf
          </h3>
          
          <BookshelfTabs
            activeTab={activeTab}
            bookCounts={bookCounts}
            onTabChange={setActiveTab}
          />
          
          {isLoadingUser ? (
            <div className="py-10 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Loading books...</p>
            </div>
          ) : filteredBooks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredBooks.map((userBook) => (
                <div key={userBook.id} className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                  <img
                    src={userBook.book.coverImage || "https://via.placeholder.com/400x600?text=No+Cover"}
                    className="w-full h-48 object-cover"
                    alt={`Cover for ${userBook.book.title}`}
                  />
                  <div className="p-4">
                    <h4 className="font-serif font-medium text-md mb-1 truncate">{userBook.book.title}</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">{userBook.book.author}</p>
                    <div className="flex justify-between items-center text-xs">
                      <span className="inline-flex items-center px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">
                        {userBook.status === "reading" ? "Reading" : 
                         userBook.status === "finished" ? "Finished" : "Want to Read"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-10 text-center">
                <div className="flex flex-col items-center">
                  <div className="text-5xl mb-4">📚</div>
                  <h3 className="text-xl font-semibold mb-2">No books to display</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                    {activeTab === "all"
                      ? `${profileUser.name} hasn't added any public books yet.`
                      : `${profileUser.name} doesn't have any public books in the "${activeTab}" category.`}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="activity" className="mt-6">
          <h3 className="font-serif text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">
            Recent Activity
          </h3>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              Activity feed coming soon!
            </p>
          </div>
        </TabsContent>
        
        <TabsContent value="reviews" className="mt-6">
          <h3 className="font-serif text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">
            Reviews
          </h3>
          {isLoadingReviews ? (
            <div className="py-10 text-center">Loading reviews...</div>
          ) : userReviews.length > 0 ? (
            <div className="grid grid-cols-1 gap-6">
              {userReviews.map((review: any) => (
                <ReviewCard
                  key={review.id}
                  user={profileUser}
                  book={review.book}
                  rating={review.rating || 0}
                  review={review.review}
                  likes={0}
                  comments={0}
                  date={review.dateUpdated || review.date}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-10 text-center">
                <div className="flex flex-col items-center">
                  <div className="text-5xl mb-4">📝</div>
                  <h3 className="text-xl font-semibold mb-2">No reviews found</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                    {profileUser.name} hasn't written any reviews yet.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="all" className="mt-6">
          <h3 className="text-xl font-bold mb-4">Public Books</h3>
          {isLoadingUser ? (
            <div className="py-10 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Loading books...</p>
            </div>
          ) : filteredBooks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredBooks.map((userBook) => (
                <div key={userBook.id} className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                  <img
                    src={userBook.book.coverImage || "https://via.placeholder.com/400x600?text=No+Cover"}
                    className="w-full h-48 object-cover"
                    alt={`Cover for ${userBook.book.title}`}
                  />
                  <div className="p-4">
                    <h4 className="font-serif font-medium text-md mb-1 truncate">{userBook.book.title}</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">{userBook.book.author}</p>
                    <div className="flex justify-between items-center text-xs">
                      <span className="inline-flex items-center px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">
                        {userBook.status === "reading" ? "Reading" : 
                         userBook.status === "finished" ? "Finished" : "Want to Read"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) :
            <Card>
              <CardContent className="py-10 text-center">
                <div className="flex flex-col items-center">
                  <div className="text-5xl mb-4">📚</div>
                  <h3 className="text-xl font-semibold mb-2">No public books to display</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                    {activeTab === "all"
                      ? `${profileUser.name} hasn't added any public books yet.`
                      : `${profileUser.name} doesn't have any public books in the "${activeTab}" category.`}
                  </p>
                </div>
              </CardContent>
            </Card>
          }
        </TabsContent>
      </Tabs>
    </div>
  );
}