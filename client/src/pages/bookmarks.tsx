import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/header";
import { HeroSection } from "@/components/hero-section";
import { Navigation } from "@/components/navigation";
import { MasonryGrid } from "@/components/masonry-grid";
import { Footer } from "@/components/footer";
import { ZineWithCreator, User } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import Analytics from "@/lib/analytics";

// Creator Card Component
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
          <h3 className="mt-2 text-sm font-medium text-gray-400">
            No creators found
          </h3>
          <p className="mt-1 text-sm text-white">
            Try adjusting your search terms.
          </p>
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

export default function Bookmark() {
  const { isAuthenticated, user } = useAuth();
  const currentUser = user;
  const [activeTab, setActiveTab] = useState<
    "all" | "popular" | "favorites" | "creators"
  >("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Track page view on mount
  useEffect(() => {
    Analytics.trackPageView(user?.id, "Home", "/");
  }, [user?.id]);

  // Debounce search query and track search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      // Track search if query is not empty
      if (searchQuery.trim()) {
        Analytics.trackSearch(user?.id, searchQuery.trim());
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, user?.id]);

  // Query for zines
  const { data: zinesData, isLoading: zinesLoading } = useQuery({
    queryKey: [
      "/api/search/zines",
      {
        filter:
          activeTab === "popular"
            ? "popular"
            : activeTab === "all"
            ? undefined
            : activeTab,
        search: debouncedSearch || undefined,
        userId: currentUser?.id,
      },
    ],
    queryFn: () => {
      const params = new URLSearchParams();

      // Add filter if it's popular
      if (activeTab === "popular") {
        params.append("filter", "popular");
      }

      // Add search query if it exists and is not empty
      if (debouncedSearch && debouncedSearch.trim().length > 0) {
        params.append("search", debouncedSearch.trim());
      }

      // Add userId if user is authenticated
      if (currentUser?.id) {
        params.append("userId", currentUser.id.toString());
      }

      // Always use the same endpoint - let the backend handle the logic
      const url = "/api/search/zines";
      const queryString = params.toString();
      const finalUrl = queryString ? `${url}?${queryString}` : url;

      console.log("Fetching URL:", finalUrl); // Debug log

      return fetch(finalUrl)
        .then((res) => {
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          return res.json();
        })
        .then((data) => {
          console.log("Received data:", data); // Debug log
          return data;
        });
    },
    enabled: activeTab !== "favorites" && activeTab !== "creators",
  });

  // Query for creators
  const { data: creatorsData, isLoading: creatorsLoading } = useQuery({
    queryKey: ["/api/search/users", { search: debouncedSearch || "" }],
    queryFn: () => {
      const params = new URLSearchParams();
      params.append("search", debouncedSearch || "");
      return fetch(`/api/search/users?${params}`).then((res) => res.json());
    },
    enabled: activeTab === "creators",
  });

  // Query for favorites
  const { data: favoritesData, isLoading: favoritesLoading } = useQuery({
    queryKey: [
      `/api/users/${currentUser?.id}/favorites`,
      { search: debouncedSearch },
    ],
    queryFn: () => {
      if (!currentUser?.id) return Promise.resolve({ zines: [] });

      const params = new URLSearchParams();
      if (debouncedSearch.trim()) {
        params.append("search", debouncedSearch.trim());
      }

      return fetch(
        `/api/users/${currentUser.id}/favorites?${params.toString()}`
      ).then((res) => res.json());
    },
    enabled: isAuthenticated && activeTab === "favorites" && !!currentUser,
  });

  const zines: ZineWithCreator[] = zinesData?.zines || [];
  const creators: User[] = creatorsData?.creators || [];
  const favoriteZines: ZineWithCreator[] = (favoritesData as any)?.zines || [];

  const loading = zinesLoading || creatorsLoading || favoritesLoading;

  // Dynamic placeholder based on active tab
  const getPlaceholder = () => {
    switch (activeTab) {
      case "creators":
        return "Discover creators...";
      case "favorites":
        return "Search your favorites...";
      default:
        return "Discover creators, zines, ideas...";
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <Header onSearch={setSearchQuery} searchQuery={searchQuery} />
      <HeroSection
        onSearch={setSearchQuery}
        searchQuery={searchQuery}
        placeholder={getPlaceholder()}
      />
      <Navigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        userId={user?.id}
      />

      <div className="bg-black">
        {activeTab === "creators" ? (
          <CreatorsGrid creators={creators} isLoading={creatorsLoading} />
        ) : (
          <MasonryGrid
            zines={activeTab === "favorites" ? favoriteZines : zines}
            isLoading={loading}
          />
        )}
      </div>

      <Footer />
    </div>
  );
}
