import { motion } from "framer-motion";
import { buttonVariants } from "@/lib/animations";
import Analytics from "@/lib/analytics";

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
  return (
    <div className="pb-8 bg-black">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex justify-center space-x-12">
          <motion.button
            onClick={() => handleTabChange("all")}
            className={`pb-3 px-2 border-b-2 font-semibold text-lg transition-colors ${
              activeTab === "all"
                ? "border-white text-white"
                : "border-transparent text-white hover:text-[#666666]"
            }`}
            variants={buttonVariants}
            initial="rest"
            whileHover="hover"
            whileTap="tap"
          >
            All Zines
          </motion.button>
          <motion.button
            onClick={() => handleTabChange("creators")}
            className={`pb-3 px-2 border-b-2 font-semibold text-lg transition-colors ${
              activeTab === "creators"
                ? "border-white text-white"
                : "border-transparent text-white hover:text-[#666666]"
            }`}
            variants={buttonVariants}
            initial="rest"
            whileHover="hover"
            whileTap="tap"
          >
            Creators
          </motion.button>

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

          <motion.button
            onClick={() => handleTabChange("favorites")}
            className={`pb-3 px-2 border-b-2 font-semibold text-lg transition-colors ${
              activeTab === "favorites"
                ? "border-white text-white"
                : "border-transparent text-white hover:text-[#666666]"
            }`}
            variants={buttonVariants}
            initial="rest"
            whileHover="hover"
            whileTap="tap"
          >
            Favorites
          </motion.button>
        </nav>
      </div>
    </div>
  );
}
