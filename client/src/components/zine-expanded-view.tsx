import { useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ZineWithCreator } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { Link } from "wouter";

interface ZineExpandedViewProps {
  zine: ZineWithCreator | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ZineExpandedView({
  zine,
  isOpen,
  onClose,
}: ZineExpandedViewProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!zine) return null;

  // Get media URLs with fallback to imageUrl for single images
  const rawMediaUrls = Array.isArray(zine.mediaUrls)
    ? zine.mediaUrls.filter((url) => url !== null)
    : zine.mediaUrls
    ? [zine.mediaUrls]
    : [];

  // If no mediaUrls but we have imageUrl, use that
  const mediaUrls =
    rawMediaUrls.length > 0
      ? rawMediaUrls
      : [zine.imageUrl].filter((url) => url !== null);
  const isCarousel = mediaUrls.length > 1;

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % mediaUrls.length);
  };

  const prevImage = () => {
    setCurrentImageIndex(
      (prev) => (prev - 1 + mediaUrls.length) % mediaUrls.length
    );
  };

  const getMediaElement = (url: string | null) => {
    if (!url) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 min-h-[400px]">
          <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center mb-4">
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
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <p className="text-gray-500 font-medium">Content unavailable</p>
          <p className="text-gray-400 text-sm">
            This media could not be loaded
          </p>
        </div>
      );
    }

    const isVideo =
      url.includes(".mp4") || url.includes(".webm") || url.includes(".mov");

    if (isVideo) {
      return (
        <video
          src={url}
          controls
          className="w-full h-full object-contain"
          autoPlay
          muted
          loop
          onError={(e) => {
            e.currentTarget.style.display = "none";
            const fallback = e.currentTarget.nextElementSibling as HTMLElement;
            if (fallback) fallback.style.display = "flex";
          }}
        />
      );
    } else {
      return (
        <>
          <img
            src={url}
            alt={zine.title}
            className="w-full h-full object-contain"
            onError={(e) => {
              e.currentTarget.style.display = "none";
              const fallback = e.currentTarget
                .nextElementSibling as HTMLElement;
              if (fallback) fallback.style.display = "flex";
            }}
          />
          <div className="w-full h-full flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 min-h-[400px] hidden">
            <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center mb-4">
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
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <p className="text-gray-500 font-medium">Image unavailable</p>
            <p className="text-gray-400 text-sm">
              This image could not be loaded
            </p>
          </div>
        </>
      );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg w-full max-h-[95vh] p-0 bg-white overflow-hidden">
        <div className="flex flex-col h-full max-h-[95vh]">
          {/* Header */}
          <div className="absolute top-1 right-1 z-10">
            <span
              onClick={onClose}
              className="flex items-center justify-center w-10 h-10 rounded-full 
               bg-white text-black
                cursor-pointer"
            >
              <X className="w-5 h-5" />
            </span>
          </div>

          {/* Creator Info at Top */}
          <div className="p-4 border-b border-gray-100 bg-white">
            <Link href={`/profile/${zine.creator.id}`}>
              <div className="flex items-center space-x-3 hover:opacity-80 transition-opacity cursor-pointer">
                <Avatar className="w-10 h-10">
                  <AvatarImage
                    src={zine.creator.profileImageUrl || undefined}
                  />
                  <AvatarFallback className="bg-gray-200 text-gray-600 text-sm">
                    {zine.creator.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 text-sm">
                    {zine.creator.username}
                  </p>
                  <p className="text-gray-500 text-xs">
                    Posted{" "}
                    {formatDistanceToNow(new Date(zine.createdAt), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
                <div className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded">
                  {zine.aspectRatio}
                </div>
              </div>
            </Link>
          </div>

          {/* Media Content */}
          <div className="relative flex-1 bg-gray-50 flex items-center justify-center overflow-hidden">
            <div className="w-full h-full flex items-center justify-center">
              {getMediaElement(mediaUrls[currentImageIndex])}
            </div>

            {/* Carousel Navigation */}
            {isCarousel && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 backdrop-blur-sm hover:bg-white/90 text-gray-700 rounded-full shadow-sm"
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 backdrop-blur-sm hover:bg-white/90 text-gray-700 rounded-full shadow-sm"
                >
                  <ChevronRight className="w-5 h-5" />
                </Button>

                {/* Dots Indicator */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  {mediaUrls.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === currentImageIndex ? "bg-white" : "bg-white/50"
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Content Details at Bottom */}
          <div className="p-4 bg-white border-t border-gray-100 max-h-32 overflow-y-auto">
            {/* Title */}
            <h1 className="text-lg font-bold text-gray-900 mb-2 leading-tight">
              {zine.title}
            </h1>

            {/* Description */}
            {zine.description && (
              <p className="text-gray-700 text-sm leading-relaxed">
                {zine.description}
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
