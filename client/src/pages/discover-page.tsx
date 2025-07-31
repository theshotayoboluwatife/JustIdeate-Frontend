import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { User } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { Input } from "@/components/ui/input";

// Creator Card Component
interface CreatorCardProps {
  creator: User;
}

function CreatorCard({ creator }: CreatorCardProps) {
  return (
    <div className="bg-black text-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center space-x-4">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
          {creator.avatar_url ? (
            <img
              src={creator.avatar_url}
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
        <button className="px-4 py-2 bg-black text-white text-sm font-medium rounded-md hover:bg-gray-800 transition-colors">
          View Profile
        </button>
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
      <div className="bg-black max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(9)].map((_, i) => (
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
      <div className="max-w-7xl bg-black text-white mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
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
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your search terms.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-black">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {creators.map((creator) => (
          <CreatorCard key={creator.id} creator={creator} />
        ))}
      </div>
    </div>
  );
}

// Hero Section for Discover Page
interface DiscoverHeroProps {
  onSearch: (query: string) => void;
  searchQuery: string;
}

function DiscoverHero({ onSearch, searchQuery }: DiscoverHeroProps) {
  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
            Discover <span className="text-black">Creators</span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Find and connect with talented creators from around the world.
            Explore their work and get inspired.
          </p>
          <div className="mt-8 max-w-md mx-auto">
            {/* Search Bar */}
            <div className="max-w-2xl">
              <Input
                type="text"
                className="w-full px-6 py-5 text-lg border border-gray-300 rounded-full bg-white placeholder-gray-400 focus:outline-none focus:border-gray-400 focus:ring-0 shadow-sm"
                placeholder="Discover creators..."
                value={searchQuery}
                onChange={(e) => onSearch(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Navigation for Discover Page
interface DiscoverNavigationProps {
  activeFilter: "all" | "popular" | "recent";
  onFilterChange: (filter: "all" | "popular" | "recent") => void;
}

function DiscoverNavigation({
  activeFilter,
  onFilterChange,
}: DiscoverNavigationProps) {
  const filters = [
    { id: "all" as const, label: "All Creators" },
    { id: "popular" as const, label: "Popular" },
    { id: "recent" as const, label: "New Creators" },
  ];

  return (
    <div className="bg-black border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-8">
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => onFilterChange(filter.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeFilter === filter.id
                  ? "border-black text-black"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// Main Discover Page Component
export default function Discover() {
  const { isAuthenticated, user } = useAuth();
  const currentUser = user;
  const [activeFilter, setActiveFilter] = useState<
    "all" | "popular" | "recent"
  >("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: creatorsData, isLoading } = useQuery({
    queryKey: [
      "/api/creators",
      { filter: activeFilter, search: debouncedSearch || undefined },
    ],
    queryFn: () => {
      const params = new URLSearchParams();
      if (activeFilter !== "all") params.append("filter", activeFilter);
      if (debouncedSearch) params.append("search", debouncedSearch);

      const url = debouncedSearch ? "/api/search/creators" : "/api/creators";
      return fetch(`${url}?${params}`).then((res) => res.json());
    },
  });

  const creators: User[] = creatorsData?.creators || [];

  return (
    <div className="min-h-screen bg-white">
      <Header onSearch={setSearchQuery} searchQuery={searchQuery} />
      <DiscoverHero onSearch={setSearchQuery} searchQuery={searchQuery} />
      <DiscoverNavigation
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
      />
      <div className="bg-white">
        <CreatorsGrid creators={creators} isLoading={isLoading} />
      </div>
      <Footer />
    </div>
  );
}
