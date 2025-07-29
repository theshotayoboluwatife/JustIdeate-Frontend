import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import Analytics from "@/lib/analytics";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { supabase } from "@/lib/supabase";

export default function AccountSettings() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Track page view on mount
  useEffect(() => {
    Analytics.trackPageView(user?.id, "Account Settings", "/account-settings");
  }, [user?.id]);

  // Form states
  const [username, setUsername] = useState(user?.user_metadata?.username || "");
  const [email, setEmail] = useState(user?.email || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Loading states
  const [isUpdatingUsername, setIsUpdatingUsername] = useState(false);
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Validation
  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const isValidPassword = (password: string) => {
    return password.length >= 6;
  };

  // Update username mutation
  const updateUsernameMutation = useMutation({
    mutationFn: async (newUsername: string) => {
      const response = await apiRequest("PUT", `/api/users/${user?.id}`, {
        username: newUsername,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Username updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${user?.id}`] });
    },
    onError: (error: any) => {
      toast({
        title: "Error updating username",
        description: error.message || "Failed to update username",
        variant: "destructive",
      });
    },
  });

  // Update email mutation
  const updateEmailMutation = useMutation({
    mutationFn: async (newEmail: string) => {
      console.log("🔍 EMAIL UPDATE DIAGNOSIS - Starting email update process");
      console.log("🔍 Target new email:", newEmail);

      // Step 1: Check current user state
      console.log("🔍 Current user object:", user);
      console.log("🔍 User email from context:", user?.email);
      console.log("🔍 User ID from context:", user?.id);

      if (!user?.email) {
        console.log("❌ User email not found in context");
        return { success: false, error: "User email not found" };
      }

      // Step 2: Get current Supabase Auth session
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();
      console.log("🔍 Supabase session data:", sessionData);
      console.log("🔍 Supabase session error:", sessionError);
      console.log("🔍 Session user:", sessionData?.session?.user);
      console.log("🔍 Session user email:", sessionData?.session?.user?.email);
      console.log(
        "🔍 Session access token present:",
        !!sessionData?.session?.access_token,
      );

      // Step 3: Get current user from Supabase Auth
      const { data: userData, error: userError } =
        await supabase.auth.getUser();
      console.log("🔍 Supabase user data:", userData);
      console.log("🔍 Supabase user error:", userError);
      console.log("🔍 Supabase user email:", userData?.user?.email);

      // Step 4: Check if session is valid
      if (!sessionData?.session) {
        console.log("❌ No valid Supabase session found");
        return { success: false, error: "No valid authentication session" };
      }

      // Step 5: Check email consistency
      const contextEmail = user.email;
      const sessionEmail = sessionData.session.user?.email;
      const userDataEmail = userData?.user?.email;

      console.log("🔍 Email consistency check:");
      console.log("  - Context email:", contextEmail);
      console.log("  - Session email:", sessionEmail);
      console.log("  - User data email:", userDataEmail);
      console.log(
        "  - All emails match:",
        contextEmail === sessionEmail && sessionEmail === userDataEmail,
      );

      // Check if email is actually different
      if (newEmail === user.email) {
        console.log("✅ Email unchanged, skipping update");
        return { success: true, message: "Email unchanged", data: null };
      }

      // Step 6: Account State Investigation
      console.log("🔍 STEP 2A - Account State Investigation");

      // Check user verification status and account details
      const userAccountDetails = sessionData.session.user;
      console.log("🔍 User account details:");
      console.log("  - User ID:", userAccountDetails.id);
      console.log("  - Email:", userAccountDetails.email);
      console.log(
        "  - Email confirmed at:",
        userAccountDetails.email_confirmed_at,
      );
      console.log("  - Created at:", userAccountDetails.created_at);
      console.log("  - Updated at:", userAccountDetails.updated_at);
      console.log("  - User metadata:", userAccountDetails.user_metadata);
      console.log("  - App metadata:", userAccountDetails.app_metadata);
      console.log("  - Identities:", userAccountDetails.identities);

      // Check if email is verified
      const emailVerified = !!userAccountDetails.email_confirmed_at;
      console.log(
        "🔍 Email verification status:",
        emailVerified ? "VERIFIED" : "NOT VERIFIED",
      );

      if (!emailVerified) {
        console.log(
          "⚠️ Account email not verified - this might cause update issues",
        );
      }

      // Step 7: Session Refresh Strategy
      console.log("🔍 Attempting session refresh before email update...");
      const { data: refreshData, error: refreshError } =
        await supabase.auth.refreshSession();
      console.log("🔍 Session refresh result:");
      console.log("  - Refresh data:", refreshData);
      console.log("  - Refresh error:", refreshError);

      if (refreshError) {
        console.log("⚠️ Session refresh failed:", refreshError.message);
      } else {
        console.log("✅ Session refreshed successfully");
      }

      // Step 8: Re-check auth state after refresh
      const { data: postRefreshUser, error: postRefreshError } =
        await supabase.auth.getUser();
      console.log("🔍 Post-refresh user state:");
      console.log("  - User data:", postRefreshUser);
      console.log("  - User error:", postRefreshError);
      console.log(
        "  - User email after refresh:",
        postRefreshUser?.user?.email,
      );

      // Step 10: STEP 2C - Comprehensive Authentication Solution
      console.log("🔍 STEP 2C - Comprehensive Authentication Solution");
      console.log(
        "🔍 Testing multiple Supabase Auth approaches to find working method",
      );

      // Method 1: Try admin API approach
      console.log("🔍 Method 1: Testing admin updateUserById approach...");
      try {
        const adminUpdateResult = await fetch("/api/auth/admin-update-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: postRefreshUser?.user?.id,
            newEmail: newEmail,
          }),
        });

        if (adminUpdateResult.ok) {
          const adminData = await adminUpdateResult.json();
          console.log("✅ Admin API update successful:", adminData);

          // Also update our backend profile
          const response = await apiRequest("PUT", `/api/users/${user?.id}`, {
            email: newEmail,
          });

          if (response.ok) {
            console.log(
              "✅ Both admin auth and backend profile updated successfully",
            );
            return {
              success: true,
              data: adminData,
              message: "Email updated successfully using admin API",
            };
          }
        } else {
          const adminError = await adminUpdateResult.json();
          console.log("❌ Admin API failed:", adminError);
        }
      } catch (adminError) {
        console.log("❌ Admin API exception:", adminError);
      }

      // Method 2: Try direct auth schema update
      console.log("🔍 Method 2: Testing direct auth schema update...");
      try {
        const directUpdateResult = await fetch(
          "/api/auth/direct-update-email",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: postRefreshUser?.user?.id,
              newEmail: newEmail,
            }),
          },
        );

        if (directUpdateResult.ok) {
          const directData = await directUpdateResult.json();
          console.log("✅ Direct auth update successful:", directData);

          // Also update our backend profile
          const response = await apiRequest("PUT", `/api/users/${user?.id}`, {
            email: newEmail,
          });

          if (response.ok) {
            console.log(
              "✅ Both direct auth and backend profile updated successfully",
            );
            return {
              success: true,
              data: directData,
              message: "Email updated successfully using direct method",
            };
          }
        } else {
          const directError = await directUpdateResult.json();
          console.log("❌ Direct update failed:", directError);
        }
      } catch (directError) {
        console.log("❌ Direct update exception:", directError);
      }

      // Method 3: Try alternative updateUser payload formats
      console.log(
        "🔍 Method 3: Testing alternative updateUser payload formats...",
      );

      // Format A: With explicit attributes
      try {
        console.log("🔍 Format A: updateUser with attributes wrapper");
        const { data: dataA, error: errorA } = await supabase.auth.updateUser({
          email: newEmail,
          data: { email: newEmail },
        });

        if (!errorA) {
          console.log("✅ Format A successful:", dataA);

          const response = await apiRequest("PUT", `/api/users/${user?.id}`, {
            email: newEmail,
          });

          if (response.ok) {
            console.log(
              "✅ Both Format A auth and backend profile updated successfully",
            );
            return {
              success: true,
              data: dataA,
              message: "Email updated successfully using format A",
            };
          }
        } else {
          console.log("❌ Format A failed:", errorA.message);
        }
      } catch (formatAError) {
        console.log("❌ Format A exception:", formatAError);
      }

      // Format B: With password to trigger full update
      try {
        console.log("🔍 Format B: updateUser with comprehensive update");
        const { data: dataB, error: errorB } = await supabase.auth.updateUser({
          email: newEmail,
          data: {
            email_change_token_current: "",
            email_change_token_new: "",
          },
        });

        if (!errorB) {
          console.log("✅ Format B successful:", dataB);

          const response = await apiRequest("PUT", `/api/users/${user?.id}`, {
            email: newEmail,
          });

          if (response.ok) {
            console.log(
              "✅ Both Format B auth and backend profile updated successfully",
            );
            return {
              success: true,
              data: dataB,
              message: "Email updated successfully using format B",
            };
          }
        } else {
          console.log("❌ Format B failed:", errorB.message);
        }
      } catch (formatBError) {
        console.log("❌ Format B exception:", formatBError);
      }

      // Method 4: Atomic transaction approach - all or nothing
      console.log(
        "🔍 Method 4: Atomic transaction approach - preventing data inconsistency",
      );
      console.log(
        "❌ All Supabase Auth methods failed - maintaining data consistency",
      );
      console.log("🔍 Account investigation summary:");
      console.log("  - Email verified:", emailVerified);
      console.log("  - Session refresh success:", !refreshError);
      console.log("  - Post-refresh user valid:", !!postRefreshUser?.user);
      console.log("  - All auth update methods tested and failed");

      return {
        success: false,
        error:
          "Unable to update email. Authentication service limitations prevent email changes at this time.",
        technicalDetails:
          "All Supabase Auth update methods failed despite valid account state",
        accountInfo: {
          emailVerified,
          sessionRefreshWorked: !refreshError,
          postRefreshUserValid: !!postRefreshUser?.user,
          methodsTested: ["admin API", "direct schema", "format A", "format B"],
        },
      };
    },
    onSuccess: (result) => {
      if (result.success) {
        if (result.message === "Email unchanged") {
          toast({
            title: "No changes needed",
            description: "Email address is already set to this value.",
          });
        } else if (result.technicalDetails) {
          toast({
            title: "Email update failed",
            description:
              result.error ||
              "Authentication service limitations prevent email changes.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Email updated successfully",
            description: "Your email has been updated across all services.",
          });

          // Invalidate user profile cache to refresh email display
          queryClient.invalidateQueries({
            queryKey: [`/api/users/${user?.id}`],
          });
          queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });

          // Also invalidate any profile page queries for this user
          queryClient.invalidateQueries({
            queryKey: [`/api/users/${user?.id}/zines`],
          });
        }
      } else {
        toast({
          title: "Error updating email",
          description: result.error || "Failed to update email",
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error updating email",
        description: error.message || "Failed to update email",
        variant: "destructive",
      });
    },
  });

  // Update password mutation
  const updatePasswordMutation = useMutation({
    mutationFn: async ({
      currentPassword,
      newPassword,
    }: {
      currentPassword: string;
      newPassword: string;
    }) => {
      if (!user?.email) {
        return { success: false, error: "User email not found" };
      }

      // First, verify the current password by attempting to sign in
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });

      if (verifyError) {
        return { success: false, error: "Current password is incorrect" };
      }

      // If current password is verified, update to new password
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data };
    },
    onSuccess: (result) => {
      if (result.success) {
        toast({
          title: "Password updated successfully",
        });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        toast({
          title: "Error updating password",
          description: result.error || "Failed to update password",
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error updating password",
        description: error.message || "Failed to update password",
        variant: "destructive",
      });
    },
  });

  const handleUpdateUsername = async () => {
    if (!username.trim()) {
      toast({
        title: "Invalid username",
        description: "Username cannot be empty",
        variant: "destructive",
      });
      return;
    }

    if (username === user?.user_metadata?.username) {
      toast({
        title: "No changes",
        description: "Username is the same as current",
        variant: "destructive",
      });
      return;
    }

    setIsUpdatingUsername(true);
    try {
      await updateUsernameMutation.mutateAsync(username);
    } finally {
      setIsUpdatingUsername(false);
    }
  };

  const handleUpdateEmail = async () => {
    if (!isValidEmail(email)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    if (email === user?.email) {
      toast({
        title: "No changes",
        description: "Email is the same as current",
        variant: "destructive",
      });
      return;
    }

    setIsUpdatingEmail(true);
    try {
      await updateEmailMutation.mutateAsync(email);
    } finally {
      setIsUpdatingEmail(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!currentPassword.trim()) {
      toast({
        title: "Current password required",
        description: "Please enter your current password",
        variant: "destructive",
      });
      return;
    }

    if (!isValidPassword(newPassword)) {
      toast({
        title: "Invalid password",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "New password and confirmation must match",
        variant: "destructive",
      });
      return;
    }

    setIsUpdatingPassword(true);
    try {
      await updatePasswordMutation.mutateAsync({
        currentPassword,
        newPassword,
      });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const goBack = () => {
    window.history.back();
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-white">
        <Header onSearch={() => {}} searchQuery="" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-2xl font-bold text-primary-custom mb-4">
            Access Denied
          </h1>
          <p className="text-secondary-custom">
            You need to be logged in to access account settings.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onSearch={() => {}} searchQuery="" />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={goBack}
            className="mb-4 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Profile
          </Button>

          <h1 className="text-3xl font-bold text-primary-custom">
            Account Settings
          </h1>
          <p className="text-secondary-custom mt-2">
            Manage your account information and security settings
          </p>
        </div>

        <div className="space-y-6">
          {/* Username Section */}
          <Card>
            <CardHeader>
              <CardTitle>Username</CardTitle>
              <CardDescription>
                Your username is displayed on your profile and zines
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="mt-1"
                />
              </div>
              <Button
                onClick={handleUpdateUsername}
                disabled={
                  isUpdatingUsername ||
                  !username.trim() ||
                  username === user?.user_metadata?.username
                }
                className="w-full sm:w-auto"
              >
                {isUpdatingUsername ? (
                  "Updating..."
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Update Username
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Email Section */}
          <Card>
            <CardHeader>
              <CardTitle>Email Address</CardTitle>
              <CardDescription>
                Used for login and important account notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="mt-1"
                />
              </div>
              <Button
                onClick={handleUpdateEmail}
                disabled={
                  isUpdatingEmail ||
                  !isValidEmail(email) ||
                  email === user?.email
                }
                className="w-full sm:w-auto"
              >
                {isUpdatingEmail ? (
                  "Updating..."
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Update Email
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Password Section */}
          <Card>
            <CardHeader>
              <CardTitle>Password</CardTitle>
              <CardDescription>
                Change your password to keep your account secure
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="current-password">Current Password</Label>
                <Input
                  id="current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password (min 6 characters)"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="mt-1"
                />
              </div>
              <Button
                onClick={handleUpdatePassword}
                disabled={
                  isUpdatingPassword ||
                  !currentPassword ||
                  !isValidPassword(newPassword) ||
                  newPassword !== confirmPassword
                }
                className="w-full sm:w-auto"
              >
                {isUpdatingPassword ? (
                  "Updating..."
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Update Password
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-red-600">Danger Zone</CardTitle>
              <CardDescription>
                These actions cannot be undone. Please be careful.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="destructive"
                onClick={logout}
                className="w-full sm:w-auto"
              >
                Sign Out of All Devices
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}
