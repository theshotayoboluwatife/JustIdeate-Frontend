import { motion } from "framer-motion";
import { buttonVariants } from "@/lib/animations";
import Analytics from "@/lib/analytics";
import { useEffect } from "react";

interface NavigationProps {
  activeTab: "all" | "popular" | "favorites" | "creators";
  onTabChange: (tab: "all" | "popular" | "favorites" | "creators") => void;
  userId?: string;
}

export function Navigation({
  activeTab,
  onTabChange,
  userId,
}: NavigationProps) {
  const handleTabChange = (
    tab: "all" | "popular" | "favorites" | "creators"
  ) => {
    // Track tab change
    if (userId) {
      Analytics.trackTabChanged(userId, tab);
    }
    onTabChange(tab);
  };

  useEffect(() => {
    if (window.location.pathname === "/bookmarks") {
      handleTabChange("favorites");
    }
  }, []);

  return (
    <div className="pb-8 bg-black">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex justify-center space-x-12">
          {/* Browse Tab */}
          {window.location.pathname === "/bookmarks" ? (
            <>
              <motion.button
                onClick={() => (window.location.href = "/")}
                className={`px-2 font-normal font-[raleway] mt-[-20px] mb-[-10px] text-[16px] transition-colors ${
                  activeTab === "all"
                    ? "border-[1px] border-gray-500 rounded-xl text-white"
                    : "border-transparent text-white hover:text-[#666666]"
                }`}
                variants={buttonVariants}
                initial="rest"
                whileHover="hover"
                whileTap="tap"
              >
                Browse
              </motion.button>
            </>
          ) : (
            <>
              <motion.button
                onClick={() => handleTabChange("all")}
                className={`px-2 font-normal font-[raleway] text-[16px] transition-colors ${
                  activeTab === "all"
                    ? "border-[1px] border-gray-500 rounded-xl text-white"
                    : "border-transparent text-white hover:text-[#666666]"
                }`}
                variants={buttonVariants}
                initial="rest"
                whileHover="hover"
                whileTap="tap"
              >
                Browse
              </motion.button>
            </>
          )}
          {/* Creators Tab */}
          {window.location.pathname === "/bookmarks" ? (
            ""
          ) : (
            <>
              <motion.button
                onClick={() => handleTabChange("creators")}
                className={`px-2  font-normal font-[raleway] text-[16px] transition-colors ${
                  activeTab === "creators"
                    ? "border-gray-500 text-white border-[1px] rounded-xl"
                    : "border-transparent text-white hover:text-[#666666]"
                }`}
                variants={buttonVariants}
                initial="rest"
                whileHover="hover"
                whileTap="tap"
              >
                Following
              </motion.button>
            </>
          )}

          {/* 
          <motion.button
            onClick={() => handleTabChange("popular")}
            className={`pb-3 px-2 border-b-2 font-semibold text-lg transition-colors ${
              activeTab === "popular"
                ? "border-[#2b3012] text-[#2b3012]"
                : "border-transparent text-black hover:text-gray-700"
            }`}
            variants={buttonVariants}
            initial="rest"
            whileHover="hover"
            whileTap="tap"
          >
            Popular
          </motion.button> */}
          {/* Favorites Tab */}
          {window.location.pathname === "/bookmarks" && (
            <motion.button
              onClick={() => handleTabChange("favorites")}
              className={`px-2 font-normal font-[raleway] mt-[-20px] mb-[-10px] text-[16px] transition-colors 
      ${
        activeTab === "favorites"
          ? "border-gray-500 text-white border-[1px] rounded-xl"
          : "border-gray-500 text-white hover:text-[#666666]"
      }`}
              variants={buttonVariants}
              initial="rest"
              whileHover="hover"
              whileTap="tap"
            >
              Bookmark
            </motion.button>
          )}
        </nav>
      </div>
    </div>
  );
}
