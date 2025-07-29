import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/home";
import Profile from "@/pages/profile";
import About from "@/pages/about";
import AccountSettings from "@/pages/account-settings";
import NotFound from "@/pages/not-found";
import AuthCallback from "@/pages/auth-callback";
import ProjectEditor from "@/components/project-editor";
import UpdatePasswordPage from "./pages/update-password";

import { setupMockFetch } from '@/lib/mock-api';

// Enable mock API for demo mode when Supabase credentials are missing
if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.log("🎭 Demo Mode: Enabling mock API");
  setupMockFetch();
}

function Router() {
  return (
    <div className="animate-page-enter">
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/about" component={About} />
        <Route path="/profile/:id" component={Profile} />
        <Route path="/auth/update-password" component={UpdatePasswordPage} />
        <Route path="/account-settings" component={AccountSettings} />
        <Route path="/auth/callback" component={AuthCallback} />
        <Route path="/project/:id/edit" component={ProjectEditor} />
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
