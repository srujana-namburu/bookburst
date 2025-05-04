import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/hooks/use-theme";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { Menu, X, Moon, Sun } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Navbar() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const { theme, setTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const isActive = (path: string) => location === path;

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-md">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/">
                <a className="flex items-center">
                  <span className="ml-2 font-serif font-bold text-2xl text-primary">BookBurst</span>
                </a>
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link href="/">
                <a className={`${isActive("/") ? "border-primary text-primary" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium h-16`}>
                  Home
                </a>
              </Link>
              <Link href="/bookshelf">
                <a className={`${isActive("/bookshelf") ? "border-primary text-primary" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium h-16`}>
                  My Bookshelf
                </a>
              </Link>
              <Link href="/discover">
                <a className={`${isActive("/discover") ? "border-primary text-primary" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium h-16`}>
                  Discover
                </a>
              </Link>
              <Link href="/community">
                <a className={`${isActive("/community") ? "border-primary text-primary" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium h-16`}>
                  Community
                </a>
              </Link>
            </div>
          </div>
          
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt={user.name} />
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuItem>
                    <Link href="/profile">
                      <a className="w-full">Your Profile</a>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href="/settings">
                      <a className="w-full">Account Settings</a>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <div className="flex items-center justify-between w-full">
                      <span>{theme === 'dark' ? 'Light' : 'Dark'} Mode</span>
                      <Switch
                        checked={theme === 'dark'}
                        onCheckedChange={(checked) => 
                          setTheme(checked ? 'dark' : 'light')
                        }
                        className="ml-2"
                      />
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div>
                <Link href="/auth">
                  <a className="text-gray-500 hover:text-primary px-3 py-2 text-sm font-medium">
                    Log in
                  </a>
                </Link>
                <Link href="/auth">
                  <a className="bg-primary text-white hover:bg-primary/90 px-3 py-2 rounded-md text-sm font-medium ml-2">
                    Sign up
                  </a>
                </Link>
              </div>
            )}
          </div>
          
          <div className="flex items-center sm:hidden">
            <button
              onClick={toggleMobileMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} sm:hidden`}>
        <div className="pt-2 pb-3 space-y-1">
          <Link href="/">
            <a 
              className={`${isActive("/") ? 
                "bg-primary/10 border-primary text-primary" : 
                "border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"
              } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
              onClick={closeMobileMenu}
            >
              Home
            </a>
          </Link>
          <Link href="/bookshelf">
            <a 
              className={`${isActive("/bookshelf") ? 
                "bg-primary/10 border-primary text-primary" : 
                "border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"
              } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
              onClick={closeMobileMenu}
            >
              My Bookshelf
            </a>
          </Link>
          <Link href="/discover">
            <a 
              className={`${isActive("/discover") ? 
                "bg-primary/10 border-primary text-primary" : 
                "border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"
              } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
              onClick={closeMobileMenu}
            >
              Discover
            </a>
          </Link>
          <Link href="/community">
            <a 
              className={`${isActive("/community") ? 
                "bg-primary/10 border-primary text-primary" : 
                "border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"
              } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
              onClick={closeMobileMenu}
            >
              Community
            </a>
          </Link>
        </div>
        
        {user ? (
          <div className="pt-4 pb-3 border-t border-gray-200">
            <div className="flex items-center px-4">
              <div className="flex-shrink-0">
                <Avatar className="h-10 w-10">
                  <AvatarImage src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt={user.name} />
                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
              </div>
              <div className="ml-3">
                <div className="text-base font-medium text-gray-800 dark:text-gray-200">{user.name}</div>
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">{user.email}</div>
              </div>
            </div>
            <div className="mt-3 space-y-1">
              <Link href="/profile">
                <a 
                  className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                  onClick={closeMobileMenu}
                >
                  Your Profile
                </a>
              </Link>
              <Link href="/settings">
                <a 
                  className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                  onClick={closeMobileMenu}
                >
                  Account Settings
                </a>
              </Link>
              <div className="px-4 py-2 flex items-center justify-between">
                <span className="text-base font-medium text-gray-500">
                  {theme === 'dark' ? 'Light' : 'Dark'} Mode
                </span>
                <Switch
                  checked={theme === 'dark'}
                  onCheckedChange={(checked) => 
                    setTheme(checked ? 'dark' : 'light')
                  }
                />
              </div>
              <button 
                onClick={() => {
                  handleLogout();
                  closeMobileMenu();
                }}
                className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
              >
                Sign out
              </button>
            </div>
          </div>
        ) : (
          <div className="pt-4 pb-3 border-t border-gray-200 px-4 flex flex-col space-y-2">
            <Link href="/auth">
              <a 
                className="block text-center w-full py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded"
                onClick={closeMobileMenu}
              >
                Log in
              </a>
            </Link>
            <Link href="/auth">
              <a 
                className="block text-center w-full py-2 text-base font-medium text-white bg-primary hover:bg-primary/90 rounded"
                onClick={closeMobileMenu}
              >
                Sign up
              </a>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
