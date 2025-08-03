import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { Header } from "@/components/header";
import { MasonryGrid } from "@/components/masonry-grid";
import { Workspace } from "@/components/workspace";
import { Footer } from "@/components/footer";
import { UploadModal } from "@/components/upload-modal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Star,
  Mail,
  Globe,
  Grid,
  Clock,
  Edit2,
  Check,
  X,
  MoreVertical,
  Settings,
} from "lucide-react";
import { User, ZineWithCreator } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import Analytics from "@/lib/analytics";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  avatarHoverVariants,
  buttonVariants,
  successVariants,
  fadeInVariants,
} from "@/lib/animations";

interface CreatorCardProps {
  creator: User;
}

function CreatorCard({ creator }: CreatorCardProps) {
  return (
    <div className="bg-black text-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center space-x-4">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
          {creator.profileImageUrl ? (
            <img
              src={creator.profileImageUrl}
              alt={creator.name || creator.username}
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <span className="text-2xl font-semibold text-gray-600">
              {(creator.name || creator.username)?.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">
            {creator.name || creator.username}
          </h3>
          <p className="text-sm text-gray-600">@{creator.username}</p>
          {creator.bio && (
            <p className="text-sm text-gray-700 mt-2 line-clamp-2">
              {creator.bio}
            </p>
          )}
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <div className="flex space-x-4 text-sm text-gray-500">
          <span>{creator.zine_count || 0} zines</span>
          <span>{creator.follower_count || 0} followers</span>
        </div>
        <Link href={`/profile/${creator.id}`}>
          <button className="px-4 py-2 bg-black text-white text-sm font-medium rounded-md hover:bg-gray-800 transition-colors">
            View Profile
          </button>
        </Link>
      </div>
    </div>
  );
}

// Creators Grid Component
interface CreatorsGridProps {
  creators: User[];
  isLoading: boolean;
}

function CreatorsGrid({ creators, isLoading }: CreatorsGridProps) {
  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-lg p-6 animate-pulse">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
              <div className="mt-4">
                <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (creators.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="text-gray-500">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No creators found
          </h3>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {creators.map((creator) => (
          <CreatorCard key={creator.id} creator={creator} />
        ))}
      </div>
    </div>
  );
}

export default function Profile() {
  const { id } = useParams();
  const { user: currentUser, logout } = useAuth();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  // Get tab from URL query parameter
  const urlParams = new URLSearchParams(window.location.search);
  const tabFromUrl = urlParams.get("tab") as
    | "zines"
    | "workspace"
    | "favorites"
    | null;

  const [activeTab, setActiveTab] = useState<
    "zines" | "workspace" | "favorites"
  >(
    tabFromUrl === "workspace" || tabFromUrl === "favorites"
      ? tabFromUrl
      : "zines"
  );

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [editedBio, setEditedBio] = useState("");
  const [editedWebsiteUrl, setEditedWebsiteUrl] = useState("");

  // Handle both UUID and numeric IDs
  let profileId: string;
  let isOwnProfile = false;

  if (id) {
    profileId = id;
    isOwnProfile = currentUser?.id === id;
  } else {
    // Default to current user's profile
    profileId = currentUser?.id || "xxxx";
    isOwnProfile = !!currentUser;
  }

  // Additional check: if we have a currentUser and the profileId matches, it's their own profile
  if (currentUser && currentUser.id === profileId) {
    isOwnProfile = true;
  }

  console.log("Profile component:", {
    id,
    profileId,
    currentUser: currentUser
      ? { id: currentUser.id, username: currentUser.user_metadata?.username }
      : null,
    isOwnProfile,
  });

  // Track page view on mount (after profileId is defined)
  useEffect(() => {
    if (profileId) {
      Analytics.trackPageView(
        currentUser?.id,
        "Profile",
        `/profile/${profileId}`
      );
    }
  }, [profileId, currentUser?.id]);

  const { data: userData, isLoading: userLoading } = useQuery({
    queryKey: [`/api/users/${profileId}`],
    enabled: !!profileId,
  });

  const { data: zinesData, isLoading: zinesLoading } = useQuery({
    queryKey: [`/api/users/${profileId}/zines`],
    enabled: !!profileId,
  });

  const { data: isFollowingData } = useQuery({
    queryKey: [`/api/users/${currentUser?.id}/favorite-creators/${id}`],
    enabled: !!currentUser && !!id && currentUser.id !== id,
  });

  // Get follower count for this user
  const { data: followerCountData } = useQuery({
    queryKey: [`/api/users/${id}/followers/count`],
    enabled: !!id,
  });
  const isFollowing = isFollowingData?.isFollowing || false;
  const followerCount = followerCountData?.count || 0;

  const { data: favoriteCreatorsData, isLoading: favoriteCreatorsLoading } =
    useQuery({
      queryKey: [`/api/users/${currentUser?.id}/favorite-creators`],
      queryFn: async () => {
        console.log(
          "🔍 Running favorite creators queryFn - this should match your backend log"
        );

        const response = await fetch(
          `/api/users/${currentUser?.id}/favorite-creators`
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      },
      enabled: !!currentUser?.id,
      staleTime: 0, // Force fresh data
      //cacheTime: 0, // Don't cache
      refetchOnMount: true, // Always refetch on mount
    });

  const toggleFollowMutation = useMutation({
    mutationFn: async () => {
      if (!currentUser) throw new Error("Not authenticated");
      const response = await apiRequest("POST", "/api/favorites/creators", {
        userId: currentUser.id,
        creatorId: id,
      });
      return response.json();
    },
    onSuccess: (data) => {
      const action = data.isFollowing ? "Followed" : "Unfollowed";
      toast({ title: `${action} successfully` });

      // Track creator follow/unfollow action
      if (currentUser && id) {
        const followAction = data.isFollowing ? "followed" : "unfollowed";
        Analytics.trackCreatorFollow(currentUser.id, id, followAction);
      }

      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: [`/api/users/${currentUser?.id}/favorite-creators`],
      });
      queryClient.invalidateQueries({
        queryKey: [`/api/users/${currentUser?.id}/favorite-creators/${id}`],
      });
      queryClient.invalidateQueries({
        queryKey: [`/api/users/${id}/followers/count`],
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update follow status",
        variant: "destructive",
      });
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (updates: {
      username?: string;
      bio?: string;
      websiteUrl?: string;
    }) => {
      const response = await apiRequest(
        "PUT",
        `/api/users/${profileId}`,
        updates
      );
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${profileId}`] });

      setIsEditingName(false);
      setIsEditingBio(false);
    },
  });

  const uploadProfilePicMutation = useMutation({
    mutationFn: async (base64Image: string) => {
      if (!currentUser) throw new Error("Not authenticated");

      const res = await apiRequest(
        "PUT",
        `/api/users/${currentUser.id}/profile-picture`,
        {
          base64Image,
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to upload profile picture");
      }

      const data = await res.json();
      return data.profileImageUrl;
    },
    onSuccess: (profileImageUrl) => {
      toast({
        title: "Profile Picture Updated",
        description: "Your profile photo was updated successfully.",
      });

      queryClient.invalidateQueries({ queryKey: [`/api/users/${profileId}`] });
    },
    onError: (error: Error) => {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const user: User | undefined = userData?.user;
  const zines: ZineWithCreator[] = Array.isArray(zinesData)
    ? zinesData
    : zinesData?.zines || [];

  const handleEditName = () => {
    setEditedName(user?.username || "");
    setIsEditingName(true);
  };

  const handleEditBio = () => {
    setEditedBio(user?.bio || "");
    setEditedWebsiteUrl(user?.websiteUrl || "");
    setIsEditingBio(true);
  };

  const handleSaveName = () => {
    if (editedName.trim() && editedName !== user?.username) {
      updateProfileMutation.mutate({ username: editedName.trim() });
    } else {
      setIsEditingName(false);
    }
  };

  const handleSaveBio = () => {
    if (editedBio !== user?.bio || editedWebsiteUrl !== user?.websiteUrl) {
      updateProfileMutation.mutate({
        bio: editedBio,
        websiteUrl: editedWebsiteUrl,
      });
    } else {
      setIsEditingBio(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditingName(false);
    setIsEditingBio(false);
    setEditedName("");
    setEditedBio("");
    setEditedWebsiteUrl("");
  };

  const handleProfileImageChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Convert image to base64 for storage
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result as string;
        uploadProfilePicMutation.mutate(base64String);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to upload profile image. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (userLoading) {
    return (
      <div className="min-h-screen bg-black text-white text-center">
        <Header onSearch={() => {}} searchQuery="" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4"></div>
            <div className="h-6 bg-gray-200 rounded w-48 mx-auto mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-32 mx-auto mb-8"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Header onSearch={setSearchQuery} searchQuery={searchQuery} />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-2xl font-bold text-primary-custom mb-4">
            User not found
          </h1>
          <p className="text-secondary-custom">
            The user you're looking for doesn't exist.
          </p>
        </div>
      </div>
    );
  }

  const showPublicEmail = user.showPublicEmail && user.email;

  return (
    <div className="min-h-screen bg-black text-white">
      <Header onSearch={() => {}} searchQuery="" />

      {/* Profile Header */}
      <div className="bg-black flex items-center justify-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="relative flex flex-col lg:flex-row items-center lg:items-start lg:space-x-8">
            {/* Profile Photo with Hover Bio */}
            <div className="relative group w-32 h-32 mb-6">
              {/* Hover Bio Tooltip */}
              {user.bio && user.websiteUrl && (
                <a
                  href={user.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute ml-[100px] mt-[-30px] xl:ml-[-150px] xl:mt-[45px] lg:ml-[-140px] lg:mt-[45px] md:ml-[-100px] md:mt-[45px] -top-4 -left-44 z-10 hidden group-hover:block max-w-xs p-3 rounded-3xl bg-white/10 backdrop-blur-md border border-white/30 text-white text-sm shadow-lg transition-opacity duration-300"
                >
                  <div className="relative">
                    <span className="block break-words whitespace-pre-wrap">
                      {user.bio}
                    </span>
                    <div className="absolute -right-2 bottom-2 w-3 h-3 bg-white/10 border-t border-l border-white/30 rotate-45 backdrop-blur-md"></div>
                  </div>
                </a>
              )}

              {/* Actual Profile Image */}
              <div
                className={`w-40 h-40 rounded-full overflow-hidden border border-[#5d5d5d] bg-gray-200 flex items-center justify-center relative ml-[-10px] xl:ml-[-40px] lg:ml-[-50px] ${
                  isOwnProfile ? "group cursor-pointer" : ""
                }`}
              >
                {user.profileImageUrl ? (
                  <img
                    src={user.profileImageUrl}
                    alt={user.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="profile_icon w-40 h-40 bg-gray-200 flex items-center justify-center cursor-pointer">
                    <svg
                      className="w-16 h-16 text-gray-400"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                  </div>
                )}

                {/* Hover Upload Overlay */}
                {isOwnProfile && (
                  <>
                    <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center rounded-full">
                      <div className="text-white text-center">
                        <svg
                          className="w-8 h-8 mx-auto mb-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        <span className="text-xs font-medium">
                          Change Photo
                        </span>
                      </div>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProfileImageChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      disabled={uploadProfilePicMutation.isPending}
                    />
                  </>
                )}
              </div>
            </div>

            {/* Right Side Content */}
            <div className="flex-1 w-full lg:w-auto">
              {/* Settings menu */}
              {isOwnProfile && (
                <div className="absolute top-4 right-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() =>
                          (window.location.href = "/account-settings")
                        }
                      >
                        <Settings className="mr-2 h-4 w-4" />
                        Edit Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={async () => {
                          try {
                            await logout();
                            toast({ title: "Logged out successfully" });
                            window.location.href = "/";
                          } catch (error) {
                            console.error("Logout failed:", error);
                            toast({
                              title: "Error",
                              description: "Failed to log out",
                              variant: "destructive",
                            });
                          }
                        }}
                        className="text-red-600"
                      >
                        <svg
                          className="mr-2 h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                          />
                        </svg>
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}

              {/* Username */}
              <div className="mb-4 text-center lg:text-left">
                {isEditingName && isOwnProfile ? (
                  <div className="flex items-center justify-center lg:justify-start space-x-2">
                    <Input
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      className="text-3xl font-bold max-w-md"
                      onKeyPress={(e) => e.key === "Enter" && handleSaveName()}
                    />
                    <Button
                      size="sm"
                      onClick={handleSaveName}
                      disabled={updateProfileMutation.isPending}
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCancelEdit}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <h1 className="text-3xl font-normal capitalize text-white font-[raleway] mb-[9px] mt-[20px] xl:mt-0 lg:mt-0">
                      {user.username}
                    </h1>
                    <p className="text-gray-500 text-sm mt-1 font-[raleway] mb-[-7px]">
                      @{user.username}
                    </p>
                  </>
                )}
              </div>

              {/* Followers and Buttons */}
              <div className="mb-6 flex flex-col items-center lg:items-start space-y-4 font-[raleway]">
                <div className="text-sm text-secondary-custom text-white font-[raleway] uppercase">
                  {followerCount}{" "}
                  {followerCount === 1 ? "follower" : "followers"}
                </div>

                {/* Always Show Follow Button */}
                <div className="flex items-center space-x-2 font-[raleway]">
                  <Button
                    onClick={() => toggleFollowMutation.mutate()}
                    disabled={toggleFollowMutation.isPending}
                    className={`${
                      isFollowing
                        ? "bg-[#1e1e1e] border border-[#5d5d5d] text-white hover:bg-[#5d5d5d] font-[raleway] text-[13px]"
                        : "bg-[#1e1e1e] border border-[#5d5d5d] text-white hover:bg-[#5d5d5d] font-[raleway] text-[13px]"
                    } transition-colors`}
                  >
                    {toggleFollowMutation.isPending
                      ? "Loading..."
                      : isFollowing
                      ? "Following"
                      : "Follow"}
                  </Button>

                  {showPublicEmail && (
                    <a
                      href={`mailto:${user.email}`}
                      className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                      title="Send email"
                    >
                      <Mail className="w-5 h-5 text-gray-600" />
                    </a>
                  )}
                </div>
              </div>

              {/* Bio section removed */}
              <div className="mb-6">
                {isEditingBio && isOwnProfile && (
                  <div className="flex flex-col items-center lg:items-start space-y-4 max-w-2xl mx-auto px-4">
                    <Textarea
                      value={editedBio}
                      onChange={(e) => setEditedBio(e.target.value)}
                      className="text-lg resize-none w-full text-center lg:text-left"
                      rows={3}
                      placeholder="Tell us about yourself..."
                    />
                    <input
                      type="url"
                      value={editedWebsiteUrl}
                      onChange={(e) => setEditedWebsiteUrl(e.target.value)}
                      placeholder="Website or portfolio URL (optional)"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#2b3012] focus:ring-1 focus:ring-[#2b3012]"
                    />
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        onClick={handleSaveBio}
                        disabled={updateProfileMutation.isPending}
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCancelEdit}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <div className="bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Tab Navigation - Only show for own profile */}
          {isOwnProfile && (
            <div className="mb-8 border-b border-gray-200">
              <nav className="-mb-px flex justify-center space-x-12">
                <button
                  onClick={() => setActiveTab("zines")}
                  className={`pb-3 px-2 border-b-2 font-semibold text-lg transition-colors ${
                    activeTab === "zines"
                      ? "border-[#364636] text-[#364636]"
                      : "border-transparent text-black hover:text-gray-700"
                  }`}
                >
                  {/* <Grid className="w-4 h-4 mr-2 inline" /> */}
                  Your Zines
                </button>

                {/* <button
                  onClick={() => setActiveTab("workspace")}
                  className={`pb-3 px-2 border-b-2 font-semibold text-lg transition-colors ${
                    activeTab === "workspace"
                      ? "border-[#364636] text-[#364636]"
                      : "border-transparent text-black hover:text-gray-700"
                  }`}
                >
                  <Clock className="w-4 h-4 mr-2 inline" />
                  Workspace
                </button>
 */}
                <button
                  onClick={() => setActiveTab("favorites")}
                  className={`pb-3 px-2 border-b-2 font-semibold text-lg transition-colors ${
                    activeTab === "favorites"
                      ? "border-[#364636] text-[#364636]"
                      : "border-transparent text-black hover:text-gray-700"
                  }`}
                >
                  {/* <Star className="w-4 h-4 mr-2 inline" /> */}
                  Following
                </button>
              </nav>
            </div>
          )}

          {/* Content based on active tab */}
          {activeTab === "zines" && (
            <>
              {/* Only show section header for own profile */}
              {isOwnProfile && (
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-primary-custom mb-2">
                    Your Zines
                  </h2>
                  {zines.length === 0 && !zinesLoading && (
                    <p className="text-secondary-custom">
                      You haven't uploaded any zines yet.
                    </p>
                  )}
                </div>
              )}

              <MasonryGrid
                zines={zines}
                isLoading={zinesLoading}
                isProfilePage={true}
                isOwnProfile={isOwnProfile}
                onUploadClick={() => setIsUploadModalOpen(true)}
              />
            </>
          )}

          {activeTab === "workspace" && <Workspace userId={profileId} />}

          {activeTab === "favorites" && isOwnProfile && (
            <>
              <h2 className="text-2xl font-bold text-primary-custom mb-4">
                Your Favorite Creators
              </h2>
              {favoriteCreatorsLoading ? (
                <CreatorsGrid creators={[]} isLoading={true} />
              ) : (
                <CreatorsGrid
                  creators={favoriteCreatorsData?.creators || []}
                  isLoading={false}
                />
              )}
            </>
          )}
        </div>
      </div>
      <Footer />

      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
      />
    </div>
  );
}
