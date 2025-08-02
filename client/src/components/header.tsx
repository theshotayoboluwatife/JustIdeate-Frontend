import { useState, useEffect } from "react";
import { ChevronDown, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UploadModal } from "./upload-modal";
import { AuthModal } from "./auth-modal";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import logoPath from "@assets/justideate logo_1750798684679.png";

interface HeaderProps {
  onSearch: (query: string) => void;
  searchQuery: string;
}

export function Header({}: HeaderProps) {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch user profile data from backend to get profile image
  const { data: userProfileData } = useQuery({
    queryKey: [`/api/users/${user?.id}`],
    enabled: !!user?.id && isAuthenticated,
  });

  const userProfile = userProfileData?.user;

  const handleLogoClick = () => {
    window.location.href = "/";
  };

  const handleProfileClick = () => {
    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
    } else {
      // Navigate to profile page or show profile menu
      window.location.href = `/profile/${user?.id}`;
    }
  };

  // Listen for custom event to open auth modal
  useEffect(() => {
    const handleOpenAuthModal = () => {
      setIsAuthModalOpen(true);
    };
    window.addEventListener("openAuthModal", handleOpenAuthModal);
    return () => {
      window.removeEventListener("openAuthModal", handleOpenAuthModal);
    };
  }, []);

  return (
    <>
      <header className="sticky top-0 bg-black z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-[16px] pb-[16px]">
          <div className="flex items-center justify-between h-16 pl-[19px] pr-[19px]">
            {/* Left Side - Logo and Navigation */}
            <div className="flex items-center space-x-8">
              {/* Logo */}
              <div
                className="flex items-center cursor-pointer hover:opacity-80 transition-opacity"
                onClick={handleLogoClick}
              >
                <img src={logoPath} alt="justideate" className="h-8 w-auto" />
              </div>
              {/* Navigation */}
              <div className="hidden md:flex items-center space-x-8 ml-6">
                <div
                  className="text-white cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => (window.location.href = "/about")}
                >
                  <span>About</span>
                </div>
                <div
                  className="text-white cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => (window.location.href = "/resources")}
                >
                  <span>Resources</span>
                </div>
              </div>
            </div>
            {/* Right Side - Upload & Profile */}
            <div className="flex items-center space-x-4">
              <Button
                className="hover:bg-gray-300 hover:text-black text-white font-medium px-4 py-2 border-dotted border-gray-300 rounded-lg bg-[#3C3C3C]"
                onClick={() => setIsUploadModalOpen(true)}
              >
                Create
              </Button>

              {/* Bookmark */}
              <div className="w-10 h-10 cursor-pointer hover:opacity-80 transition-opacity flex items-center justify-center">
                <i
                  className="fas fa-bookmark text-black text-xl"
                  onClick={() => (window.location.href = "/bookmarks")}
                  style={{
                    textShadow: `
                    -1px -1px 0 white,
                    1px -1px 0 white,
                    -1px  1px 0 white,
                    1px  1px 0 white
                  `,
                  }}
                ></i>
              </div>
              {/* Profile Icon */}
              <div
                className="w-10 h-10 bg-gray-300 rounded-full cursor-pointer hover:opacity-80 transition-opacity flex items-center justify-center"
                onClick={handleProfileClick}
              >
                {isAuthenticated && userProfile?.profileImageUrl ? (
                  <img
                    src={userProfile.profileImageUrl}
                    alt="Profile"
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <User className="w-6 h-6 text-gray-600" />
                )}
              </div>
            </div>
          </div>
        </div>
      </header>
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
      />
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </>
  );
}
