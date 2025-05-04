import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "./hooks/use-auth";
import { PreferencesProvider } from "./context/PreferencesContext";
import { ReadingTimeTracker } from "./components/ReadingTimeTracker";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import BookshelfPage from "@/pages/bookshelf-page";
import DiscoverPage from "@/pages/discover-page";
import CommunityPage from "@/pages/community-page";
import UserProfilePage from "@/pages/user-profile-page";
import MyProfilePage from "@/pages/my-profile-page";
import { ProtectedRoute } from "./lib/protected-route";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import CookieBanner from "@/components/ui/cookie-banner";

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/" component={HomePage} />
      <ProtectedRoute path="/bookshelf" component={BookshelfPage} />
      <ProtectedRoute path="/discover" component={DiscoverPage} />
      <ProtectedRoute path="/community" component={CommunityPage} />
      <ProtectedRoute path="/profile" component={MyProfilePage} />
      <ProtectedRoute path="/users/:id" component={UserProfilePage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <PreferencesProvider>
          <TooltipProvider>
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-grow">
                <Router />
              </main>
              <Footer />
              <CookieBanner />
              <Toaster />
              <ReadingTimeTracker />
            </div>
          </TooltipProvider>
        </PreferencesProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
