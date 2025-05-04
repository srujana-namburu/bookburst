import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { insertUserSchema } from "@shared/schema";

const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const registerSchema = insertUserSchema.extend({
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type LoginValues = z.infer<typeof loginSchema>;
type RegisterValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [location, navigate] = useLocation();
  const { user, loginMutation, registerMutation } = useAuth();
  const [activeTab, setActiveTab] = useState("login");

  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: ""
    }
  });

  const registerForm = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      username: "",
      password: "",
      confirmPassword: ""
    }
  });

  useEffect(() => {
    // Redirect to home if already logged in
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const onLoginSubmit = (data: LoginValues) => {
    loginMutation.mutate(data);
  };

  const onRegisterSubmit = (data: RegisterValues) => {
    const { confirmPassword, ...userData } = data;
    registerMutation.mutate(userData);
  };

  if (user) {
    return null; // Redirect will handle this case
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-bookcream-500 dark:bg-gray-900">
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <Tabs
            defaultValue="login"
            value={activeTab}
            onValueChange={setActiveTab}
          >
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-serif font-bold text-primary mb-1">BookBurst</h1>
              <p className="text-gray-600 dark:text-gray-400">Your personal reading journey</p>
            </div>
            
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Create Account</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-6">
                  <FormField
                    control={loginForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your username" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex justify-between items-center">
                          <FormLabel>Password</FormLabel>
                          <a href="#" className="text-sm text-primary hover:text-primary/80">
                            Forgot password?
                          </a>
                        </div>
                        <FormControl>
                          <Input type="password" placeholder="Enter your password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                      Remember me
                    </label>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? "Logging in..." : "Sign in"}
                  </Button>
                  
                  <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                    Don't have an account?{" "}
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setActiveTab("register");
                      }}
                      className="text-primary hover:text-primary/80 font-medium"
                    >
                      Sign up
                    </a>
                  </p>
                </form>
              </Form>
            </TabsContent>
            
            <TabsContent value="register">
              <Form {...registerForm}>
                <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-6">
                  <FormField
                    control={registerForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your full name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={registerForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input placeholder="Choose a username" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={registerForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input 
                            type="password" 
                            placeholder="Create a password" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                        <div className="mt-1">
                          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Password strength</div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mb-1">
                            <div 
                              className={`h-1.5 rounded-full ${
                                field.value.length < 6 
                                  ? "bg-red-500 w-1/4" 
                                  : field.value.length < 10
                                    ? "bg-yellow-500 w-1/2"
                                    : "bg-green-500 w-3/4"
                              }`} 
                            />
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Use at least 8 characters with letters, numbers, and symbols
                          </p>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={registerForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <Input 
                            type="password" 
                            placeholder="Confirm your password" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex items-start">
                    <input
                      id="terms-conditions"
                      name="terms-conditions"
                      type="checkbox"
                      className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary mt-1"
                    />
                    <label htmlFor="terms-conditions" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                      I agree to the{" "}
                      <a href="#" className="text-primary hover:text-primary/80">
                        Terms of Service
                      </a>{" "}
                      and{" "}
                      <a href="#" className="text-primary hover:text-primary/80">
                        Privacy Policy
                      </a>
                    </label>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={registerMutation.isPending}
                  >
                    {registerMutation.isPending ? "Creating Account..." : "Create Account"}
                  </Button>
                  
                  <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                    Already have an account?{" "}
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setActiveTab("login");
                      }}
                      className="text-primary hover:text-primary/80 font-medium"
                    >
                      Log in
                    </a>
                  </p>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="hidden lg:block">
          <div className="relative h-full w-full rounded-lg overflow-hidden bg-primary page-texture">
            <div className="relative z-10 p-8 flex flex-col justify-center h-full">
              <h2 className="text-4xl font-serif font-bold text-white mb-6">
                Rediscover the Joy of Reading
              </h2>
              <ul className="space-y-4 text-white/90 max-w-md">
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-accent mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Track your reading progress across your personal bookshelf</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-accent mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Discover new books based on your preferences and reading history</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-accent mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Connect with a community of passionate readers</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-accent mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Set reading goals and track your achievements</span>
                </li>
              </ul>
              
              <div className="mt-8">
                <p className="italic text-white/80 text-lg font-serif">
                  "Reading is a conversation. All books talk. But a good book listens as well."
                </p>
                <p className="text-white/70 mt-2">— Mark Haddon</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
