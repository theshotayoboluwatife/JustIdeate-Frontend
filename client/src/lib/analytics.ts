import mixpanel from "mixpanel-browser";

// Analytics utility for centralized Mixpanel event tracking
export class Analytics {
  private static isInitialized = true; // Mixpanel is already initialized in main.tsx

  /**
   * Identify a user with Mixpanel
   * Links anonymous sessions to authenticated users
   */
  static identifyUser(userId: string, userProperties?: Record<string, any>) {
    try {
      mixpanel.identify(userId);

      if (userProperties) {
        mixpanel.people.set(userProperties);
      }

      console.log("📊 User identified:", userId);
    } catch (error) {
      console.error("Analytics error (identifyUser):", error);
    }
  }

  /**
   * Reset user identity on logout
   * Clears user identity and starts new anonymous session
   */
  static resetUser() {
    try {
      mixpanel.reset();
      console.log("📊 User session reset");
    } catch (error) {
      console.error("Analytics error (resetUser):", error);
    }
  }

  /**
   * Track user signup completion
   */
  static trackUserSignup(userId: string, email: string) {
    try {
      mixpanel.track("User Signed Up", {
        user_id: userId,
        email: email,
        timestamp: new Date().toISOString(),
      });
      console.log("📊 Tracked: User Signed Up");
    } catch (error) {
      console.error("Analytics error (trackUserSignup):", error);
    }
  }

  /**
   * Track user login success
   */
  static trackUserLogin(userId: string, email: string) {
    try {
      mixpanel.track("User Logged In", {
        user_id: userId,
        email: email,
        timestamp: new Date().toISOString(),
      });
      console.log("📊 Tracked: User Logged In");
    } catch (error) {
      console.error("Analytics error (trackUserLogin):", error);
    }
  }

  /**
   * Track user logout
   */
  static trackUserLogout(userId: string) {
    try {
      mixpanel.track("User Logged Out", {
        user_id: userId,
        timestamp: new Date().toISOString(),
      });
      console.log("📊 Tracked: User Logged Out");
    } catch (error) {
      console.error("Analytics error (trackUserLogout):", error);
    }
  }

  /**
   * Track zine upload started
   */
  static trackZineUploadStarted(userId: string) {
    try {
      mixpanel.track("Zine Upload Started", {
        user_id: userId,
        timestamp: new Date().toISOString(),
      });
      console.log("📊 Tracked: Zine Upload Started");
    } catch (error) {
      console.error("Analytics error (trackZineUploadStarted):", error);
    }
  }

  /**
   * Track successful zine upload
   */
  static trackZineUploaded(
    userId: string,
    zineId: string,
    title: string,
    mediaType: string,
  ) {
    try {
      mixpanel.track("Zine Uploaded", {
        user_id: userId,
        zine_id: zineId,
        title: title,
        media_type: mediaType,
        timestamp: new Date().toISOString(),
      });
      console.log("📊 Tracked: Zine Uploaded");
    } catch (error) {
      console.error("Analytics error (trackZineUploaded):", error);
    }
  }

  /**
   * Track upload modal opened
   */
  static trackUploadModalOpened(userId?: string) {
    try {
      mixpanel.track("Upload Modal Opened", {
        user_id: userId || "anonymous",
        timestamp: new Date().toISOString(),
      });
      console.log("📊 Tracked: Upload Modal Opened");
    } catch (error) {
      console.error("Analytics error (trackUploadModalOpened):", error);
    }
  }

  /**
   * Track zine viewed
   */
  static trackZineViewed(
    userId: string | undefined,
    zineId: string,
    creatorId: string,
  ) {
    try {
      mixpanel.track("Zine Viewed", {
        user_id: userId || "anonymous",
        zine_id: zineId,
        creator_id: creatorId,
        timestamp: new Date().toISOString(),
      });
      console.log("📊 Tracked: Zine Viewed");
    } catch (error) {
      console.error("Analytics error (trackZineViewed):", error);
    }
  }

  /**
   * Track zine clicked/expanded
   */
  static trackZineClicked(
    userId: string | undefined,
    zineId: string,
    title: string,
  ) {
    try {
      mixpanel.track("Zine Clicked", {
        user_id: userId || "anonymous",
        zine_id: zineId,
        title: title,
        timestamp: new Date().toISOString(),
      });
      console.log("📊 Tracked: Zine Clicked");
    } catch (error) {
      console.error("Analytics error (trackZineClicked):", error);
    }
  }

  /**
   * Track zine favorited/unfavorited
   */
  static trackZineFavorited(
    userId: string,
    zineId: string,
    action: "favorited" | "unfavorited",
  ) {
    try {
      mixpanel.track("Zine Favorited", {
        user_id: userId,
        zine_id: zineId,
        action: action,
        timestamp: new Date().toISOString(),
      });
      console.log(`📊 Tracked: Zine ${action}`);
    } catch (error) {
      console.error("Analytics error (trackZineFavorited):", error);
    }
  }

  /**
   * Track search performed
   */
  static trackSearch(
    userId: string | undefined,
    searchQuery: string,
    resultsCount: number,
  ) {
    try {
      mixpanel.track("Search Performed", {
        user_id: userId || "anonymous",
        search_query: searchQuery,
        results_count: resultsCount,
        timestamp: new Date().toISOString(),
      });
      console.log("📊 Tracked: Search Performed");
    } catch (error) {
      console.error("Analytics error (trackSearch):", error);
    }
  }

  /**
   * Track page views
   */
  static trackPageView(
    userId: string | undefined,
    pageName: string,
    path: string,
  ) {
    try {
      mixpanel.track("Page Viewed", {
        user_id: userId || "anonymous",
        page_name: pageName,
        path: path,
        timestamp: new Date().toISOString(),
      });
      console.log(`📊 Tracked: Page Viewed - ${pageName}`);
    } catch (error) {
      console.error("Analytics error (trackPageView):", error);
    }
  }

  /**
   * Track profile visits
   */
  static trackProfileVisit(userId: string | undefined, profileUserId: string) {
    try {
      mixpanel.track("Profile Visited", {
        user_id: userId || "anonymous",
        profile_user_id: profileUserId,
        timestamp: new Date().toISOString(),
      });
      console.log("📊 Tracked: Profile Visited");
    } catch (error) {
      console.error("Analytics error (trackProfileVisit):", error);
    }
  }

  /**
   * Track creator followed/unfollowed
   */
  static trackCreatorFollow(
    userId: string,
    creatorId: string,
    action: "followed" | "unfollowed",
  ) {
    try {
      mixpanel.track("Creator Followed", {
        user_id: userId,
        creator_id: creatorId,
        action: action,
        timestamp: new Date().toISOString(),
      });
      console.log(`📊 Tracked: Creator ${action}`);
    } catch (error) {
      console.error("Analytics error (trackCreatorFollow):", error);
    }
  }

  /**
   * Track filter applied
   */
  static trackFilterApplied(
    userId: string | undefined,
    filterType: string,
    filterValue: string,
  ) {
    try {
      mixpanel.track("Filter Applied", {
        user_id: userId || "anonymous",
        filter_type: filterType,
        filter_value: filterValue,
        timestamp: new Date().toISOString(),
      });
      console.log("📊 Tracked: Filter Applied");
    } catch (error) {
      console.error("Analytics error (trackFilterApplied):", error);
    }
  }

  /**
   * Track creator profile viewed
   */
  static trackCreatorProfileViewed(
    userId: string | undefined,
    creatorId: string,
  ) {
    try {
      mixpanel.track("Creator Profile Viewed", {
        user_id: userId || "anonymous",
        creator_id: creatorId,
        timestamp: new Date().toISOString(),
      });
      console.log("📊 Tracked: Creator Profile Viewed");
    } catch (error) {
      console.error("Analytics error (trackCreatorProfileViewed):", error);
    }
  }

  /**
   * Track tab changed in navigation
   */
  static trackTabChanged(userId: string | undefined, tab: string) {
    try {
      mixpanel.track("Tab Changed", {
        user_id: userId || "anonymous",
        tab: tab,
        timestamp: new Date().toISOString(),
      });
      console.log(`📊 Tracked: Tab Changed - ${tab}`);
    } catch (error) {
      console.error("Analytics error (trackTabChanged):", error);
    }
  }
}

// Export default instance for convenience
export default Analytics;
