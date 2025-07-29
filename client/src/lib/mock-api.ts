import { User, ZineWithCreator } from "@shared/schema";

// Mock user data
const MOCK_USERS: Record<string, User> = {
  "mock-user-123": {
    id: "mock-user-123",
    email: "demo@example.com",
    username: "demouser",
    bio: "This is a demo account for testing the frontend",
    profileImageUrl: null,
    websiteUrl: "https://example.com",
    showPublicEmail: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    zine_count: 5,
    follower_count: 42,
    contactInfo: null,
    name: "Demo User"
  }
};

// Mock zines data
const MOCK_ZINES: ZineWithCreator[] = [
  {
    id: "1",
    title: "My First Zine",
    description: "A beautiful zine about creativity",
    imageUrl: "https://picsum.photos/400/500?random=1",
    mediaUrls: ["https://picsum.photos/400/500?random=1"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    userId: "mock-user-123",
    isFavorited: false,
    favoriteCount: 10,
    creator: MOCK_USERS["mock-user-123"]
  },
  {
    id: "2",
    title: "Design Inspiration",
    description: "Collection of design ideas",
    imageUrl: "https://picsum.photos/400/600?random=2",
    mediaUrls: ["https://picsum.photos/400/600?random=2"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    userId: "mock-user-123",
    isFavorited: true,
    favoriteCount: 25,
    creator: MOCK_USERS["mock-user-123"]
  },
  {
    id: "3",
    title: "Nature Photography",
    description: "Beautiful shots from nature",
    imageUrl: "https://picsum.photos/400/400?random=3",
    mediaUrls: ["https://picsum.photos/400/400?random=3"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    userId: "mock-user-123",
    isFavorited: false,
    favoriteCount: 15,
    creator: MOCK_USERS["mock-user-123"]
  },
  {
    id: "4",
    title: "Urban Exploration",
    description: "City life through my lens",
    imageUrl: "https://picsum.photos/400/550?random=4",
    mediaUrls: ["https://picsum.photos/400/550?random=4"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    userId: "mock-user-123",
    isFavorited: true,
    favoriteCount: 42,
    creator: MOCK_USERS["mock-user-123"]
  },
  {
    id: "5",
    title: "Abstract Art Collection",
    description: "Exploring colors and forms",
    imageUrl: "https://picsum.photos/400/450?random=5",
    mediaUrls: ["https://picsum.photos/400/450?random=5"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    userId: "mock-user-123",
    isFavorited: false,
    favoriteCount: 18,
    creator: MOCK_USERS["mock-user-123"]
  },
  {
    id: "6",
    title: "Minimalist Living",
    description: "Simple is beautiful",
    imageUrl: "https://picsum.photos/400/500?random=6",
    mediaUrls: ["https://picsum.photos/400/500?random=6"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    userId: "mock-user-123",
    isFavorited: false,
    favoriteCount: 30,
    creator: MOCK_USERS["mock-user-123"]
  },
  {
    id: "7",
    title: "Street Art Gallery",
    description: "Graffiti and murals from around the world",
    imageUrl: "https://picsum.photos/400/650?random=7",
    mediaUrls: ["https://picsum.photos/400/650?random=7"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    userId: "mock-user-123",
    isFavorited: false,
    favoriteCount: 55,
    creator: MOCK_USERS["mock-user-123"]
  },
  {
    id: "8",
    title: "Coffee Culture",
    description: "A journey through coffee shops",
    imageUrl: "https://picsum.photos/400/400?random=8",
    mediaUrls: ["https://picsum.photos/400/400?random=8"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    userId: "mock-user-123",
    isFavorited: true,
    favoriteCount: 28,
    creator: MOCK_USERS["mock-user-123"]
  },
  {
    id: "9",
    title: "Typography Experiments",
    description: "Playing with letters and fonts",
    imageUrl: "https://picsum.photos/400/480?random=9",
    mediaUrls: ["https://picsum.photos/400/480?random=9"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    userId: "mock-user-123",
    isFavorited: false,
    favoriteCount: 22,
    creator: MOCK_USERS["mock-user-123"]
  }
];

// Add a configurable delay for demo purposes
const DEMO_DELAY = 3000; // 3 seconds

// Helper function to simulate network delay
const simulateDelay = (ms: number = DEMO_DELAY) => 
  new Promise(resolve => setTimeout(resolve, ms));

// Mock API responses
export const mockApi = {
  // User endpoints
  async getUser(userId: string): Promise<{ user: User }> {
    console.log("🔌 Mock API: Getting user", userId);
    
    // Simulate network delay
    await simulateDelay(1000); // Shorter delay for profile loading
    
    // Return mock user for any ID (so profile pages work)
    const user = MOCK_USERS[userId] || {
      ...MOCK_USERS["mock-user-123"],
      id: userId,
      username: `user_${userId.slice(0, 8)}`
    };
    
    return { user };
  },

  // Zines endpoints
  async getUserZines(userId: string): Promise<{ zines: ZineWithCreator[] }> {
    console.log("🔌 Mock API: Getting user zines", userId);
    
    // Simulate network delay
    await simulateDelay();
    
    // Return mock zines for the user
    return { 
      zines: MOCK_ZINES.filter(zine => zine.userId === userId || userId === "mock-user-123") 
    };
  },

  // Search endpoints
  async searchZines(params: any): Promise<{ zines: ZineWithCreator[] }> {
    console.log("🔌 Mock API: Searching zines", params);
    
    // Simulate network delay
    await simulateDelay();
    
    // Return all mock zines for search
    return { zines: MOCK_ZINES };
  },

  // Favorites endpoints
  async getUserFavorites(userId: string): Promise<{ zines: ZineWithCreator[] }> {
    console.log("🔌 Mock API: Getting user favorites", userId);
    
    // Simulate network delay
    await simulateDelay();
    
    // Return favorited zines
    return { 
      zines: MOCK_ZINES.filter(zine => zine.isFavorited) 
    };
  },

  // Favorite creators
  async getFavoriteCreators(userId: string): Promise<{ creators: User[] }> {
    console.log("🔌 Mock API: Getting favorite creators", userId);
    
    // Simulate network delay
    await simulateDelay(2000); // Slightly shorter delay for creators
    
    // Return some mock creators
    return { 
      creators: [
        {
          ...MOCK_USERS["mock-user-123"],
          id: "creator-1",
          username: "artist1",
          name: "Creative Artist",
          bio: "I love making zines about art and design",
          follower_count: 150,
          zine_count: 23
        },
        {
          ...MOCK_USERS["mock-user-123"],
          id: "creator-2", 
          username: "photographer",
          name: "Photo Enthusiast",
          bio: "Capturing moments through my lens",
          follower_count: 89,
          zine_count: 15
        }
      ]
    };
  },

  // Follow status
  async getFollowStatus(userId: string, creatorId: string): Promise<{ isFollowing: boolean }> {
    console.log("🔌 Mock API: Getting follow status", { userId, creatorId });
    return { isFollowing: false };
  },

  // Follower count
  async getFollowerCount(userId: string): Promise<{ count: number }> {
    console.log("🔌 Mock API: Getting follower count", userId);
    return { count: 42 };
  }
};

// Override fetch for API calls
export function setupMockFetch() {
  const originalFetch = window.fetch;
  
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const url = typeof input === 'string' ? input : input.toString();
    
    // Only intercept API calls
    if (url.includes('/api/')) {
      console.log("🔌 Intercepting API call:", url);
      
      // Parse the URL to determine which endpoint
      if (url.includes('/api/users/') && url.includes('/zines')) {
        const userId = url.split('/users/')[1].split('/')[0];
        const data = await mockApi.getUserZines(userId);
        return new Response(JSON.stringify(data), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      if (url.includes('/api/users/') && url.includes('/favorites')) {
        const userId = url.split('/users/')[1].split('/')[0];
        const data = await mockApi.getUserFavorites(userId);
        return new Response(JSON.stringify(data), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      if (url.includes('/api/users/') && url.includes('/favorite-creators')) {
        const userId = url.split('/users/')[1].split('/')[0];
        
        if (url.includes('/favorite-creators/')) {
          // Follow status check
          const creatorId = url.split('/favorite-creators/')[1];
          const data = await mockApi.getFollowStatus(userId, creatorId);
          return new Response(JSON.stringify(data), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
        } else {
          // Get all favorite creators
          const data = await mockApi.getFavoriteCreators(userId);
          return new Response(JSON.stringify(data), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
        }
      }
      
      if (url.includes('/api/users/') && url.includes('/followers/count')) {
        const userId = url.split('/users/')[1].split('/')[0];
        const data = await mockApi.getFollowerCount(userId);
        return new Response(JSON.stringify(data), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      if (url.includes('/api/users/')) {
        const userId = url.split('/users/')[1].split('?')[0];
        const data = await mockApi.getUser(userId);
        return new Response(JSON.stringify(data), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      if (url.includes('/api/search/zines')) {
        const data = await mockApi.searchZines({});
        return new Response(JSON.stringify(data), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      if (url.includes('/api/search/users')) {
        // Simulate delay
        await simulateDelay(2000);
        // Return empty for user search
        return new Response(JSON.stringify({ creators: [] }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      // For other API calls, return empty success
      console.log("🔌 Mock API: Returning empty response for", url);
      return new Response(JSON.stringify({}), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // For non-API calls, use original fetch
    return originalFetch(input, init);
  };
}