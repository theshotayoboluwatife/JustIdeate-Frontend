import { useState } from "react";
import { ZineWithCreator } from "@shared/schema";
import Analytics from "@/lib/analytics";
import { useAuth } from "@/hooks/use-auth";
import { ZineCard } from "./zine-card";
import { ZineExpandedView } from "./zine-expanded-view";
import { UploadModal } from "./upload-modal";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  staggerContainer,
  staggerItem,
  buttonVariants,
} from "@/lib/animations";

interface MasonryGridProps {
  zines: ZineWithCreator[];
  isLoading?: boolean;
  isProfilePage?: boolean;
  isOwnProfile?: boolean;
  onUploadClick?: () => void;
}

export function MasonryGrid({
  zines,
  isLoading,
  isProfilePage = false,
  isOwnProfile = false,
  onUploadClick,
}: MasonryGridProps) {
  const { user } = useAuth();
  const [selectedZine, setSelectedZine] = useState<ZineWithCreator | null>(
    null,
  );
  const [isExpandedViewOpen, setIsExpandedViewOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const handleZineExpand = (zine: ZineWithCreator) => {
    // Track zine interaction
    Analytics.trackZineClicked(user?.id, zine.id, zine.title);
    setSelectedZine(zine);
    setIsExpandedViewOpen(true);
  };

  const handleCloseExpanded = () => {
    setIsExpandedViewOpen(false);
    setSelectedZine(null);
  };
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="masonry-grid">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="masonry-item bg-gray-200 rounded-xl animate-pulse"
              style={{ height: `${200 + Math.random() * 200}px` }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (zines.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 bg-subtle-custom rounded-full flex items-center justify-center mx-auto mb-4">
            {isProfilePage ? (
              <Plus className="w-8 h-8 text-gray-400" />
            ) : (
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            )}
          </div>
          <h3 className="text-lg font-medium text-primary-custom mb-2">
            {isProfilePage
              ? isOwnProfile
                ? "Start sharing your creativity"
                : "No zines yet"
              : "No zines found"}
          </h3>
          <p className="text-secondary-custom mb-4">
            {isProfilePage
              ? isOwnProfile
                ? "Upload your first zine and start building your creative portfolio."
                : ""
              : "Try adjusting your search or browse different categories to discover amazing zines."}
          </p>
          {isProfilePage && isOwnProfile && onUploadClick && (
            <Button
              onClick={onUploadClick}
              className="just-ideate-primary just-ideate-primary-hover text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Upload Your First Zine
            </Button>
          )}
        </div>
      </div>
    );
  }

  // For profile pages, use a simple grid layout
  if (isProfilePage) {
    return (
      <div className="w-full">
        {zines.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg
                className="w-16 h-16 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {isOwnProfile ? "No zines yet" : "No zines found"}
            </h3>
            <p className="text-gray-500">
              {isOwnProfile
                ? "Upload your first zine to get started!"
                : "Try adjusting your search or browse other creators."}
            </p>
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {zines.map((zine, index) => (
              <motion.div key={zine.id} variants={staggerItem} custom={index}>
                <ZineCard zine={zine} onExpand={handleZineExpand} />
              </motion.div>
            ))}
          </motion.div>
        )}

        <ZineExpandedView
          zine={selectedZine}
          isOpen={isExpandedViewOpen}
          onClose={handleCloseExpanded}
        />
      </div>
    );
  }

  // For main feed, use 3-column grid layout
  const mainContent = (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {zines.map((zine) => (
          <ZineCard key={zine.id} zine={zine} onExpand={handleZineExpand} />
        ))}
      </div>

      <ZineExpandedView
        zine={selectedZine}
        isOpen={isExpandedViewOpen}
        onClose={handleCloseExpanded}
      />
    </div>
  );

  return (
    <>
      {isProfilePage ? (
        <div className="w-full">
          {zines.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg
                  className="w-16 h-16 mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {isOwnProfile ? "No zines yet" : "No zines found"}
              </h3>
              <p className="text-gray-500">
                {isOwnProfile
                  ? "Upload your first zine to get started!"
                  : "Try adjusting your search or browse other creators."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {zines.map((zine) => (
                <ZineCard
                  key={zine.id}
                  zine={zine}
                  onExpand={handleZineExpand}
                />
              ))}
            </div>
          )}

          <ZineExpandedView
            zine={selectedZine}
            isOpen={isExpandedViewOpen}
            onClose={handleCloseExpanded}
          />
        </div>
      ) : (
        mainContent
      )}
    </>
  );
}
