import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AuthCallback() {
  const [, setLocation] = useLocation();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    const handleAuthCallback = async () => {
      if (!supabase) {
        setStatus("error");
        setMessage("Authentication service unavailable");
        return;
      }

      try {
        // First, try to get the session from URL hash/params
        const { data: authData, error: authError } =
          await supabase.auth.getSession();

        // Check if there's a hash in the URL (Supabase auth callback)
        if (window.location.hash) {
          const { data, error } = await supabase.auth.getUser();

          if (error) {
            console.error("Auth callback error:", error);
            setStatus("error");
            setMessage(error.message || "Email confirmation failed");
            return;
          }

          if (data.user && data.user.email_confirmed_at) {
            setStatus("success");
            setMessage("Email confirmed successfully! You are now logged in.");

            // Clear the URL hash
            window.history.replaceState(null, "", window.location.pathname);

            // Redirect to home after a short delay
            setTimeout(() => {
              setLocation("/");
            }, 2000);
            return;
          }
        }

        if (authError) {
          console.error("Auth callback error:", authError);
          setStatus("error");
          setMessage(authError.message || "Email confirmation failed");
          return;
        }

        if (authData.session) {
          // User successfully confirmed email and is logged in
          setStatus("success");
          setMessage("Email confirmed successfully! You are now logged in.");

          // Redirect to home after a short delay
          setTimeout(() => {
            setLocation("/");
          }, 2000);
        } else {
          // Check URL params for confirmation success
          const urlParams = new URLSearchParams(window.location.search);
          const type = urlParams.get("type");
          const error_param = urlParams.get("error");

          if (error_param) {
            setStatus("error");
            setMessage("Email confirmation failed. Please try again.");
          } else if (type === "signup") {
            setStatus("success");
            setMessage("Email confirmed successfully! You can now log in.");

            // Redirect to home after a short delay
            setTimeout(() => {
              setLocation("/");
            }, 2000);
          } else {
            // No session and no confirmation, redirect to home
            setTimeout(() => {
              setLocation("/");
            }, 1000);
          }
        }
      } catch (error) {
        console.error("Auth callback error:", error);
        setStatus("error");
        setMessage("An unexpected error occurred during confirmation");
      }
    };

    handleAuthCallback();
  }, [setLocation]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#f8f8f6] flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow-sm border border-gray-100 max-w-md w-full mx-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-[#364636]" />
          <h1 className="text-2xl font-raleway font-bold mb-4 text-gray-900">
            Confirming your account...
          </h1>
          <p className="text-gray-600">
            Please wait while we verify your email.
          </p>
        </div>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="min-h-screen bg-[#f8f8f6] flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow-sm border border-gray-100 max-w-md w-full mx-4">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-raleway font-bold mb-4 text-gray-900">
            Email Confirmed!
          </h1>
          <p className="text-gray-600 mb-6">{message}</p>
          <p className="text-sm text-gray-500">
            Redirecting you to the homepage...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f8f6] flex items-center justify-center">
      <div className="text-center bg-white p-8 rounded-lg shadow-sm border border-gray-100 max-w-md w-full mx-4">
        <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-raleway font-bold mb-4 text-gray-900">
          Confirmation Failed
        </h1>
        <p className="text-gray-600 mb-6">{message}</p>
        <Button
          onClick={() => setLocation("/")}
          className="bg-[#364636] hover:bg-[#2b3012] text-white"
        >
          Go to Homepage
        </Button>
      </div>
    </div>
  );
}
