// import { useState, useRef } from "react";
// import {
//   Star,
//   Play,
//   MoreVertical,
//   Trash2,
//   ChevronLeft,
//   ChevronRight,
//   Pause,
// } from "lucide-react";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { Button } from "@/components/ui/button";
// import { ZineWithCreator } from "@shared/schema";
// import { useAuth } from "@/hooks/use-auth";
// import { useMutation, useQueryClient } from "@tanstack/react-query";
// import { apiRequest } from "@/lib/queryClient";

// import { motion } from "framer-motion";
// import { cardHoverVariants } from "@/lib/animations";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
// } from "@/components/ui/alert-dialog";
// import { useToast } from "@/hooks/use-toast";
// import Analytics from "@/lib/analytics";

// interface ZineCardProps {
//   zine: ZineWithCreator;
//   onExpand?: (zine: ZineWithCreator) => void;
// }

// export function ZineCard({ zine, onExpand }: ZineCardProps) {
//   const { user } = useAuth();
//   const queryClient = useQueryClient();
//   const [isFavorited, setIsFavorited] = useState(zine.isFavorited || false);
//   const [showDeleteDialog, setShowDeleteDialog] = useState(false);
//   const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
//   const videoRef = useRef<HTMLVideoElement>(null);
//   const { toast } = useToast();

//   // Get all media URLs
//   const mediaUrls =
//     Array.isArray(zine.mediaUrls) && zine.mediaUrls.length > 0
//       ? zine.mediaUrls
//       : zine.imageUrl
//         ? [zine.imageUrl]
//         : [];

//   const currentMedia = mediaUrls[currentMediaIndex];
//   const isVideo = currentMedia && /\.(mp4|webm|ogg|mov)$/i.test(currentMedia);
//   const hasMultipleMedia = mediaUrls.length > 1;

//   const toggleFavoriteMutation = useMutation({
//     mutationFn: async () => {
//       const response = await apiRequest("POST", "/api/favorites/zines", {
//         userId: user.id,
//         zineId: zine.id,
//       });
//       return response.json();
//     },
//     onSuccess: (data) => {
//       setIsFavorited(data.isFavorited);

//       // Track favorite/unfavorite action
//       if (user) {
//         const action = data.isFavorited ? "favorited" : "unfavorited";
//         Analytics.trackZineFavorited(user.id, zine.id, action);
//       }

//       // Invalidate general zine feeds so Home, Popular, etc. update
//       queryClient.invalidateQueries({ queryKey: ["/api/search/zines"] });

//       // Invalidate the specific user's favorites so Favorites tab updates
//       queryClient.removeQueries({
//         queryKey: [`/api/users/${user?.id}/favorites`],
//       });
//       queryClient.invalidateQueries({
//         queryKey: [`/api/users/${user?.id}/favorites`],
//       });
//     },
//     onError: () => {
//       toast({
//         title: "Error",
//         description: "Could not update favorite status",
//         variant: "destructive",
//       });
//     },
//   });

//   const handleFavoriteClick = () => {
//     if (!user) {
//       document.getElementById("auth-modal")?.classList.remove("hidden");
//       return;
//     }
//     if (toggleFavoriteMutation.isPending) return;
//     toggleFavoriteMutation.mutate();
//   };

//   const handleCreatorClick = (e: React.MouseEvent) => {
//     e.stopPropagation(); // Prevent the container click handler from firing
//     // Track creator profile view
//     if (user) {
//       Analytics.trackCreatorProfileViewed(user.id, zine.creator.id);
//     }
//     window.location.href = `/profile/${zine.creator.id}`;
//   };

//   const handleZineExpand = () => {
//     // Track zine click/view
//     if (user) {
//       Analytics.trackZineClicked(user.id, zine.id, zine.title);
//     }
//     onExpand?.(zine);
//   };

//   // New handler for video area click (opens popup for full control)
//   const handleVideoAreaClick = (e: React.MouseEvent) => {
//     e.stopPropagation(); // Prevent card click
//     handleZineExpand();
//   };

//   const deleteMutation = useMutation({
//     mutationFn: () =>
//       apiRequest("DELETE", `/api/zines/${zine.id}`, {
//         userId: user?.id,
//       }),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["/api/zines"] });
//       queryClient.invalidateQueries({ queryKey: ["/api/user-zines"] });
//       queryClient.invalidateQueries({
//         queryKey: [`/api/users/${user?.id}/zines`],
//       });
//       queryClient.invalidateQueries({
//         queryKey: [`/api/users/${zine.creator.id}/zines`],
//       });
//       toast({ title: "Success", description: "Zine deleted successfully" });
//       setShowDeleteDialog(false);
//     },
//     onError: () => {
//       toast({
//         title: "Error",
//         description: "Failed to delete zine",
//         variant: "destructive",
//       });
//     },
//   });

//   const handleDelete = () => {
//     deleteMutation.mutate();
//   };

//   const nextMedia = (e: React.MouseEvent) => {
//     e.stopPropagation();
//     setCurrentMediaIndex((prev) => (prev + 1) % mediaUrls.length);
//   };

//   const prevMedia = (e: React.MouseEvent) => {
//     e.stopPropagation();
//     setCurrentMediaIndex(
//       (prev) => (prev - 1 + mediaUrls.length) % mediaUrls.length,
//     );
//   };

//   const isOwner = user && user.id.toString() === zine.creator.id.toString();

//   if (mediaUrls.length === 0) {
//     return null; // or some fallback UI
//   }

//   return (
//     <div>
//       <motion.div
//         className="masonry-item bg-background rounded-2xl overflow-hidden group cursor-pointer border border-border"
//         variants={cardHoverVariants}
//         initial="rest"
//         whileHover="hover"
//         onClick={handleZineExpand}
//       >
//         <div className="relative">
//           {isVideo ? (
//             <div className="relative">
//               <video
//                 ref={videoRef}
//                 src={currentMedia}
//                 className="w-full object-cover aspect-[4/5] cursor-pointer"
//                 preload="metadata"
//                 onClick={handleVideoAreaClick}
//                 onError={(e) => {
//                   const fallback = e.currentTarget
//                     .nextElementSibling as HTMLElement;
//                   if (fallback) {
//                     e.currentTarget.style.display = "none";
//                     fallback.style.display = "flex";
//                   }
//                 }}
//               />

//               {/* Static Play Icon Overlay - Clicking opens popup */}
//               <div
//                 onClick={handleVideoAreaClick}
//                 className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 cursor-pointer"
//               >
//                 <div className="bg-black bg-opacity-50 rounded-full p-3 hover:bg-opacity-70 transition-all">
//                   <Play className="w-6 h-6 text-white ml-1" />
//                 </div>
//               </div>
//             </div>
//           ) : (
//             <img
//               src={currentMedia}
//               alt={zine.title}
//               className="w-full object-cover group-hover:scale-105 transition-transform duration-300 aspect-[4/5]"
//               onError={(e) => {
//                 e.currentTarget.style.display = "none";
//                 const fallback = e.currentTarget
//                   .nextElementSibling as HTMLElement;
//                 if (fallback) fallback.style.display = "flex";
//               }}
//             />
//           )}

//           {/* Fallback UI for failed media */}
//           <div
//             className="w-full hidden flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 aspect-[4/5]"
//             style={{ minHeight: "200px" }}
//           >
//             <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center mb-3">
//               <svg
//                 className="w-6 h-6 text-gray-400"
//                 fill="none"
//                 stroke="currentColor"
//                 viewBox="0 0 24 24"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2v12a2 2 0 002 2z"
//                 />
//               </svg>
//             </div>
//             <p className="text-gray-500 font-medium text-sm">
//               Media unavailable
//             </p>
//           </div>

//           {/* Dots Indicator */}
//           {hasMultipleMedia && (
//             <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-1 z-20">
//               {mediaUrls.map((_, index) => (
//                 <button
//                   key={index}
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     setCurrentMediaIndex(index);
//                   }}
//                   className={`w-2 h-2 rounded-full transition-all duration-200 ${
//                     index === currentMediaIndex
//                       ? "bg-white"
//                       : "bg-white bg-opacity-50"
//                   }`}
//                 />
//               ))}
//             </div>
//           )}

//           {/* Favorite Button */}
//           <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20">
//             <div className="relative">
//               <div className="absolute inset-0 bg-gray-200 rounded-full blur-sm opacity-50"></div>
//               <button
//                 onClick={(e) => {
//                   e.stopPropagation();
//                   handleFavoriteClick();
//                 }}
//                 disabled={toggleFavoriteMutation.isPending}
//                 className="relative bg-white rounded-full p-2 text-[#2b3012] hover:text-[#556320] transition-colors shadow-sm border border-gray-200"
//                 title={isFavorited ? "Unfavorite zine" : "Favorite zine"}
//               >
//                 {toggleFavoriteMutation.isPending ? (
//                   <div className="animate-pulse w-4 h-4 bg-gray-300 rounded-full" />
//                 ) : (
//                   <Star
//                     className={`w-4 h-4 ${isFavorited ? "fill-black text-black" : "text-gray-600"}`}
//                   />
//                 )}
//               </button>
//             </div>
//           </div>
//         </div>

//         <div className="p-4">
//           <h3 className="font-heading font-bold text-foreground text-base mb-2 leading-tight line-clamp-2">
//             {zine.title}
//           </h3>
//           <div className="flex items-center justify-between">
//             {/* Creator Profile Section */}
//             <div className="flex items-center space-x-3 flex-1">
//               <div
//                 className="flex items-center space-x-3 cursor-pointer"
//                 onClick={handleCreatorClick}
//               >
//                 <Avatar className="w-6 h-6">
//                   <AvatarImage
//                     src={zine.creator.profileImageUrl || undefined}
//                     alt={zine.creator.username}
//                   />
//                   <AvatarFallback className="text-xs">
//                     {zine.creator.username.slice(0, 2).toUpperCase()}
//                   </AvatarFallback>
//                 </Avatar>
//                 <div className="flex-1 min-w-0">
//                   <p className="font-semibold text-foreground text-sm hover:text-just-ideate-primary transition-colors truncate">
//                     {zine.creator.username}
//                   </p>
//                 </div>
//               </div>
//             </div>

//             <div className="flex items-center space-x-2">
//               {/* <div className="flex items-center space-x-1 text-muted-foreground">
//                 <Star className="w-3 h-3" />
//                 {(zine.favoriteCount ?? 0) > 0 && (
//                   <span className="text-xs font-medium">
//                     {zine.favoriteCount}
//                   </span>
//                 )}
//               </div> */}

//               {isOwner && (
//                 <DropdownMenu>
//                   <DropdownMenuTrigger asChild>
//                     <Button
//                       variant="ghost"
//                       size="sm"
//                       className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
//                       onClick={(e) => e.stopPropagation()}
//                     >
//                       <MoreVertical className="h-3 w-3" />
//                     </Button>
//                   </DropdownMenuTrigger>
//                   <DropdownMenuContent align="end">
//                     <DropdownMenuItem
//                       onClick={(e) => {
//                         e.stopPropagation();
//                         setShowDeleteDialog(true);
//                       }}
//                       className="text-red-600 focus:text-red-600"
//                     >
//                       <Trash2 className="w-4 h-4 mr-2" />
//                       Delete Zine
//                     </DropdownMenuItem>
//                   </DropdownMenuContent>
//                 </DropdownMenu>
//               )}
//             </div>
//           </div>
//         </div>
//       </motion.div>

//       <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
//         <AlertDialogContent className="bg-white border-gray-200">
//           <AlertDialogHeader>
//             <AlertDialogTitle>Delete Zine</AlertDialogTitle>
//             <AlertDialogDescription>
//               Are you sure you want to delete "{zine.title}"? This action cannot
//               be undone.
//             </AlertDialogDescription>
//           </AlertDialogHeader>
//           <AlertDialogFooter>
//             <AlertDialogCancel>Cancel</AlertDialogCancel>
//             <AlertDialogAction
//               onClick={handleDelete}
//               className="bg-red-600 hover:bg-red-700 text-white"
//               disabled={deleteMutation.isPending}
//             >
//               {deleteMutation.isPending ? "Deleting..." : "Delete Zine"}
//             </AlertDialogAction>
//           </AlertDialogFooter>
//         </AlertDialogContent>
//       </AlertDialog>
//     </div>
//   );
// }

import { useState, useRef } from "react";
import {
  Star,
  Play,
  MoreVertical,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Pause,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ZineWithCreator } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

import { motion } from "framer-motion";
import { cardHoverVariants } from "@/lib/animations";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import Analytics from "@/lib/analytics";

interface ZineCardProps {
  zine: ZineWithCreator;
  onExpand?: (zine: ZineWithCreator) => void;
}

export function ZineCard({ zine, onExpand }: ZineCardProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isFavorited, setIsFavorited] = useState(zine.isFavorited || false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();

  // Get all media URLs
  const mediaUrls =
    Array.isArray(zine.mediaUrls) && zine.mediaUrls.length > 0
      ? zine.mediaUrls
      : zine.imageUrl
      ? [zine.imageUrl]
      : [];

  const currentMedia = mediaUrls[currentMediaIndex];
  const isVideo = currentMedia && /\.(mp4|webm|ogg|mov)$/i.test(currentMedia);
  const hasMultipleMedia = mediaUrls.length > 1;

  const toggleFavoriteMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/favorites/zines", {
        userId: user.id,
        zineId: zine.id,
      });
      return response.json();
    },
    onSuccess: (data) => {
      setIsFavorited(data.isFavorited);

      // Track favorite/unfavorite action
      if (user) {
        const action = data.isFavorited ? "favorited" : "unfavorited";
        Analytics.trackZineFavorited(user.id, zine.id, action);
      }

      // Invalidate general zine feeds so Home, Popular, etc. update
      queryClient.invalidateQueries({ queryKey: ["/api/search/zines"] });

      // Invalidate the specific user's favorites so Favorites tab updates
      queryClient.removeQueries({
        queryKey: [`/api/users/${user?.id}/favorites`],
      });
      queryClient.invalidateQueries({
        queryKey: [`/api/users/${user?.id}/favorites`],
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Could not update favorite status",
        variant: "destructive",
      });
    },
  });

  const handleFavoriteClick = () => {
    if (!user) {
      document.getElementById("auth-modal")?.classList.remove("hidden");
      return;
    }
    if (toggleFavoriteMutation.isPending) return;
    toggleFavoriteMutation.mutate();
  };

  const handleCreatorClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent the container click handler from firing
    // Track creator profile view
    if (user) {
      Analytics.trackCreatorProfileViewed(user.id, zine.creator.id);
    }
    window.location.href = `/profile/${zine.creator.id}`;
  };

  const handleZineExpand = () => {
    // Track zine click/view
    if (user) {
      Analytics.trackZineClicked(user.id, zine.id, zine.title);
    }
    onExpand?.(zine);
  };

  // New handler for video area click (opens popup for full control)
  const handleVideoAreaClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    handleZineExpand();
  };

  const deleteMutation = useMutation({
    mutationFn: () =>
      apiRequest("DELETE", `/api/zines/${zine.id}`, {
        userId: user?.id,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/zines"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user-zines"] });
      queryClient.invalidateQueries({
        queryKey: [`/api/users/${user?.id}/zines`],
      });
      queryClient.invalidateQueries({
        queryKey: [`/api/users/${zine.creator.id}/zines`],
      });
      toast({ title: "Success", description: "Zine deleted successfully" });
      setShowDeleteDialog(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete zine",
        variant: "destructive",
      });
    },
  });

  const handleDelete = () => {
    deleteMutation.mutate();
  };

  const nextMedia = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentMediaIndex((prev) => (prev + 1) % mediaUrls.length);
  };

  const prevMedia = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentMediaIndex(
      (prev) => (prev - 1 + mediaUrls.length) % mediaUrls.length
    );
  };

  const isOwner = user && user.id.toString() === zine.creator.id.toString();

  if (mediaUrls.length === 0) {
    return null; // or some fallback UI
  }

  return (
    <div>
      <motion.div
        className="masonry-item bg-background rounded-2xl overflow-hidden group cursor-pointer border border-border"
        variants={cardHoverVariants}
        initial="rest"
        whileHover="hover"
        onClick={handleZineExpand}
      >
        <div className="relative">
          {isVideo ? (
            <div className="relative">
              <video
                ref={videoRef}
                src={currentMedia}
                className="w-full object-cover cursor-pointer"
                preload="metadata"
                onClick={handleVideoAreaClick}
                onError={(e) => {
                  const fallback = e.currentTarget
                    .nextElementSibling as HTMLElement;
                  if (fallback) {
                    e.currentTarget.style.display = "none";
                    fallback.style.display = "flex";
                  }
                }}
              />

              {/* Static Play Icon Overlay - Clicking opens popup */}
              <div
                onClick={handleVideoAreaClick}
                className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 cursor-pointer"
              >
                <div className="bg-black bg-opacity-50 rounded-full p-3 hover:bg-opacity-70 transition-all">
                  <Play className="w-6 h-6 text-white ml-1" />
                </div>
              </div>
            </div>
          ) : (
            <img
              src={currentMedia}
              alt={zine.title}
              className="w-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                e.currentTarget.style.display = "none";
                const fallback = e.currentTarget
                  .nextElementSibling as HTMLElement;
                if (fallback) fallback.style.display = "flex";
              }}
            />
          )}

          {/* Fallback UI for failed media */}
          <div
            className="w-full hidden flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100"
            style={{ minHeight: "200px" }}
          >
            <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center mb-3">
              <svg
                className="w-6 h-6 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <p className="text-gray-500 font-medium text-sm">
              Media unavailable
            </p>
          </div>

          {/* Dots Indicator */}
          {hasMultipleMedia && (
            <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-1 z-20">
              {mediaUrls.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentMediaIndex(index);
                  }}
                  className={`w-2 h-2 rounded-full transition-all duration-200 ${
                    index === currentMediaIndex
                      ? "bg-black"
                      : "bg-black bg-opacity-50"
                  }`}
                />
              ))}
            </div>
          )}

          {/* Favorite Button */}
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20">
            <div className="relative">
              <div className="absolute inset-0 bg-gray-200 rounded-full blur-sm opacity-50"></div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleFavoriteClick();
                }}
                disabled={toggleFavoriteMutation.isPending}
                className="relative bg-white rounded-full p-2 text-[#2b3012] hover:text-[#556320] transition-colors shadow-sm border border-gray-200"
                title={isFavorited ? "Unfavorite zine" : "Favorite zine"}
              >
                {toggleFavoriteMutation.isPending ? (
                  <div className="animate-pulse w-4 h-4 bg-gray-300 rounded-full" />
                ) : (
                  <Star
                    className={`w-4 h-4 ${
                      isFavorited ? "fill-black text-black" : "text-gray-600"
                    }`}
                  />
                )}
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-white border-gray-200">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Zine</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{zine.title}"? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete Zine"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
