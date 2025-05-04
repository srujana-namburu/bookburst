import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserBookWithDetails } from "@shared/schema";
import { BookGrid } from "@/components/book/book-grid";
import { getUserPreferences, saveUserPreferences, UserPreferences } from "@/lib/cookie-manager";
import { Pencil, Settings, User, BookOpen, CheckCircle, Library, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BookshelfTabs } from "@/components/book/bookshelf-tabs";
import { Toggle } from "@/components/ui/toggle";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";

export default function MyProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"reading" | "finished" | "want_to_read" | "all">("all");
  const [editMode, setEditMode] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [bioInput, setBioInput] = useState("");
  const [preferences, setPreferences] = useState<UserPreferences>({});
  
  // Fetch user books
  const { data: userBooks = [], isLoading: isLoadingBooks } = useQuery<UserBookWithDetails[]>({
    queryKey: ["/api/user-books"],
  });

  // Load user preferences from cookies
  useEffect(() => {
    if (user) {
      setNameInput(user.name);
      setBioInput(user.bio || "");
      setPreferences(getUserPreferences());
    }
  }, [user]);

  // Update user profile
  const updateProfileMutation = useMutation({
    mutationFn: async (data: { name: string; bio: string }) => {
      const res = await apiRequest("PATCH", `/api/users/${user?.id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      setEditMode(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update book status, progress, or rating
  const updateBookMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: any }) => {
      const res = await apiRequest("PATCH", `/api/user-books/${id}`, updates);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user-books"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete a book from the user's collection
  const deleteBookMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/user-books/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Book removed",
        description: "The book has been removed from your collection",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user-books"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Removal failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle profile update
  const handleUpdateProfile = () => {
    if (!nameInput.trim()) {
      toast({
        title: "Name required",
        description: "Please enter your name",
        variant: "destructive",
      });
      return;
    }

    updateProfileMutation.mutate({
      name: nameInput,
      bio: bioInput,
    });
  };

  // Handle book updates
  const handleUpdateStatus = (id: number, status: string) => {
    updateBookMutation.mutate({ id, updates: { status } });
  };

  const handleUpdateProgress = (id: number, progress: number) => {
    updateBookMutation.mutate({ id, updates: { progress } });
  };

  const handleUpdateRating = (id: number, rating: number) => {
    updateBookMutation.mutate({ id, updates: { rating } });
  };

  const handleDeleteBook = (id: number) => {
    if (confirm("Are you sure you want to remove this book from your collection?")) {
      deleteBookMutation.mutate(id);
    }
  };

  // Handle preferences update
  const handlePreferenceUpdate = (key: keyof UserPreferences, value: any) => {
    const newPreferences = { ...preferences, [key]: value };
    setPreferences(newPreferences);
    saveUserPreferences(newPreferences);
    
    toast({
      title: "Preferences updated",
      description: "Your preferences have been saved",
    });
  };

  // Filter books based on active tab
  const filteredBooks = userBooks.filter(book => {
    if (activeTab !== "all" && book.status !== activeTab) {
      return false;
    }
    return true;
  });

  // Count books by status
  const bookCounts = {
    reading: userBooks.filter(book => book.status === "reading").length,
    finished: userBooks.filter(book => book.status === "finished").length,
    wantToRead: userBooks.filter(book => book.status === "want_to_read").length,
    total: userBooks.length,
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Loading profile...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Profile Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="relative">
            <Avatar className="h-24 w-24">
              <AvatarImage src={user.profilePicture || undefined} alt={user.name} />
              <AvatarFallback className="text-2xl">{getInitials(user.name)}</AvatarFallback>
            </Avatar>
            {editMode && (
              <Button 
                size="icon" 
                variant="outline" 
                className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-primary text-primary-foreground"
              >
                <Pencil className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          <div className="flex-1 text-center md:text-left">
            {editMode ? (
              <div className="space-y-4 max-w-md">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input 
                    id="name" 
                    value={nameInput} 
                    onChange={(e) => setNameInput(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Input 
                    id="bio" 
                    value={bioInput} 
                    onChange={(e) => setBioInput(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={handleUpdateProfile}
                    disabled={updateProfileMutation.isPending}
                  >
                    {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setEditMode(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                  <h2 className="font-serif text-3xl font-bold text-gray-800 dark:text-gray-100">
                    {user.name}
                  </h2>
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="h-8 w-8"
                    onClick={() => setEditMode(true)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-4">{user.email}</p>
                {user.bio && (
                  <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-md">
                    {user.bio}
                  </p>
                )}
                
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
                      <span className="font-semibold">0</span> Following
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      
      <Tabs defaultValue="bookshelf" className="mb-8">
        <TabsList>
          <TabsTrigger value="bookshelf">My Bookshelf</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        {/* Bookshelf Tab */}
        <TabsContent value="bookshelf" className="mt-6">
          <h3 className="font-serif text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">
            My Bookshelf
          </h3>
          
          <BookshelfTabs
            activeTab={activeTab}
            bookCounts={bookCounts}
            onTabChange={setActiveTab}
          />
          
          {isLoadingBooks ? (
            <div className="py-10 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Loading books...</p>
            </div>
          ) : filteredBooks.length > 0 ? (
            <BookGrid
              books={filteredBooks}
              onUpdateStatus={handleUpdateStatus}
              onUpdateProgress={handleUpdateProgress}
              onUpdateRating={handleUpdateRating}
              onDelete={handleDeleteBook}
              emptyMessage={`You don't have any books in this category.`}
            />
          ) : (
            <Card>
              <CardContent className="py-10 text-center">
                <div className="flex flex-col items-center">
                  <div className="text-5xl mb-4">📚</div>
                  <h3 className="text-xl font-semibold mb-2">No books to display</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                    {activeTab === "all"
                      ? `You haven't added any books to your bookshelf yet.`
                      : `You don't have any books in the "${activeTab}" category.`}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        {/* Settings Tab */}
        <TabsContent value="settings" className="mt-6">
          <h3 className="font-serif text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">
            Account Settings
          </h3>
          
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <h4 className="text-lg font-medium flex items-center mb-4">
                  <Settings className="h-5 w-5 mr-2 text-primary" />
                  App Preferences
                </h4>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Theme</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Choose your preferred theme</p>
                    </div>
                    <div className="flex gap-2">
                      <Toggle 
                        pressed={preferences.theme === 'light'} 
                        onPressedChange={() => handlePreferenceUpdate('theme', 'light')}
                      >
                        Light
                      </Toggle>
                      <Toggle 
                        pressed={preferences.theme === 'dark'} 
                        onPressedChange={() => handlePreferenceUpdate('theme', 'dark')}
                      >
                        Dark
                      </Toggle>
                      <Toggle 
                        pressed={preferences.theme === 'system' || !preferences.theme} 
                        onPressedChange={() => handlePreferenceUpdate('theme', 'system')}
                      >
                        System
                      </Toggle>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Bookshelf View</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Choose how books are displayed</p>
                    </div>
                    <div className="flex gap-2">
                      <Toggle 
                        pressed={preferences.viewMode === 'grid' || !preferences.viewMode} 
                        onPressedChange={() => handlePreferenceUpdate('viewMode', 'grid')}
                      >
                        Grid
                      </Toggle>
                      <Toggle 
                        pressed={preferences.viewMode === 'list'} 
                        onPressedChange={() => handlePreferenceUpdate('viewMode', 'list')}
                      >
                        List
                      </Toggle>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Sort Books By</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Default sorting for your bookshelf</p>
                    </div>
                    <div className="flex gap-2 flex-wrap justify-end">
                      <Toggle 
                        pressed={preferences.sortOrder === 'title' || !preferences.sortOrder} 
                        onPressedChange={() => handlePreferenceUpdate('sortOrder', 'title')}
                      >
                        Title
                      </Toggle>
                      <Toggle 
                        pressed={preferences.sortOrder === 'author'} 
                        onPressedChange={() => handlePreferenceUpdate('sortOrder', 'author')}
                      >
                        Author
                      </Toggle>
                      <Toggle 
                        pressed={preferences.sortOrder === 'date_added'} 
                        onPressedChange={() => handlePreferenceUpdate('sortOrder', 'date_added')}
                      >
                        Date Added
                      </Toggle>
                      <Toggle 
                        pressed={preferences.sortOrder === 'rating'} 
                        onPressedChange={() => handlePreferenceUpdate('sortOrder', 'rating')}
                      >
                        Rating
                      </Toggle>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <h4 className="text-lg font-medium flex items-center mb-4">
                  <User className="h-5 w-5 mr-2 text-primary" />
                  Privacy Settings
                </h4>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Public Profile</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Allow others to view your profile</p>
                    </div>
                    <Switch 
                      checked={true} 
                      disabled
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Show Reading Progress</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Display your reading progress to others</p>
                    </div>
                    <Switch 
                      checked={true}
                      onCheckedChange={(checked) => {
                        // This would typically update a user setting in the database
                        toast({
                          title: "Setting updated",
                          description: `Reading progress is now ${checked ? "visible" : "hidden"} to others`,
                        });
                      }}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Show Ratings</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Display your book ratings to others</p>
                    </div>
                    <Switch 
                      checked={true}
                      onCheckedChange={(checked) => {
                        // This would typically update a user setting in the database
                        toast({
                          title: "Setting updated",
                          description: `Ratings are now ${checked ? "visible" : "hidden"} to others`,
                        });
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}