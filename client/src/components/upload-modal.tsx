import { useState, useMemo, useEffect } from "react";
import {
  X,
  CloudUpload,
  Plus,
  ChevronLeft,
  ChevronRight,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAuth } from "@/hooks/use-auth";
import { useSupabase } from "@/hooks/use-supabase";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  modalVariants,
  buttonVariants,
  successVariants,
} from "@/lib/animations";
import Analytics from "@/lib/analytics";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UploadModal({ isOpen, onClose }: UploadModalProps) {
  const { user, isAuthenticated } = useAuth();
  const { uploadImage, uploadVideo } = useSupabase();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [files, setFiles] = useState<File[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0);

  const fileUrls = useMemo(() => {
    return files.map((file) => URL.createObjectURL(file));
  }, [files]);

  const fileAspectRatios = useMemo(() => {
    return files.map((file, index) => {
      // Generate a stable aspect ratio based on file name and size
      const hash = file.name.length + file.size;
      const ratios = ["1:1", "4:5", "9:16"];
      return ratios[hash % ratios.length];
    });
  }, [files]);

  useEffect(() => {
    return () => {
      fileUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [fileUrls]);

  // Track upload modal opened
  useEffect(() => {
    if (isOpen) {
      Analytics.trackUploadModalOpened(user?.id);
    }
  }, [isOpen, user?.id]);

  const createZineMutation = useMutation({
    mutationFn: async (zineData: any) => {
      console.log(
        "💫 MUTATION FUNCTION CALLED with data:",
        JSON.stringify(zineData, null, 2),
      );
      const response = await apiRequest("POST", "/api/zines", zineData);
      const result = await response.json();
      console.log("✅ MUTATION RESPONSE:", result);
      return result;
    },
    onSuccess: (data) => {
      console.log("🎉 MUTATION SUCCESS:", data);

      // Track successful zine upload
      if (user && data.zine) {
        const mediaType = files.some((f) => f.type.startsWith("video/"))
          ? "video"
          : "image";
        Analytics.trackZineUploaded(user.id, data.zine.id, title, mediaType);
      }

      // Invalidate all zine queries to refresh the feed
      queryClient.invalidateQueries({ queryKey: ["/api/zines"] });
      // Also invalidate user-specific zine queries if on profile page
      if (user) {
        queryClient.invalidateQueries({
          queryKey: [`/api/users/${user.id}/zines`],
        });
      }
      toast({
        title: "Success!",
        description: "Your zine has been uploaded successfully.",
      });
      handleClose();
    },
    onError: (error) => {
      console.error("❌ MUTATION ERROR:", error);
      toast({
        title: "Error",
        description: "Failed to upload your zine. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);

    // Validate file types
    const validFiles = selectedFiles.filter((file) => {
      const isImage = file.type.startsWith("image/");
      const isVideo = file.type.startsWith("video/");
      const isSVG =
        file.type === "image/svg+xml" ||
        file.name.toLowerCase().endsWith(".svg");
      return isImage || isVideo || isSVG;
    });

    // Check if no valid files
    if (validFiles.length === 0 && selectedFiles.length > 0) {
      toast({
        title: "Invalid file type",
        description: "Please select image or video files only.",
        variant: "destructive",
      });
      return;
    }

    // Limit to 5 files for carousel or 1 video
    const hasVideo = validFiles.some((file) => file.type.startsWith("video/"));
    if (hasVideo && validFiles.length > 1) {
      toast({
        title: "Invalid selection",
        description: "You can only upload one video at a time.",
        variant: "destructive",
      });
      return;
    }

    if (validFiles.length > 5) {
      toast({
        title: "Too many files",
        description: "You can upload up to 5 images or 1 video.",
        variant: "destructive",
      });
      return;
    }

    setFiles(validFiles);
    setCurrentPreviewIndex(0);
  };

  const addMoreFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files || []);
    const validFiles = newFiles.filter((file) => {
      const isImage = file.type.startsWith("image/");
      const isVideo = file.type.startsWith("video/");
      const isSVG =
        file.type === "image/svg+xml" ||
        file.name.toLowerCase().endsWith(".svg");
      return isImage || isVideo || isSVG;
    });

    const combinedFiles = [...files, ...validFiles];
    if (combinedFiles.length > 5) {
      toast({
        title: "Too many files",
        description: "You can upload up to 5 images total.",
        variant: "destructive",
      });
      return;
    }

    setFiles(combinedFiles);
  };

  const navigatePreview = (direction: "prev" | "next") => {
    if (direction === "prev") {
      setCurrentPreviewIndex((prev) =>
        prev > 0 ? prev - 1 : files.length - 1,
      );
    } else {
      setCurrentPreviewIndex((prev) =>
        prev < files.length - 1 ? prev + 1 : 0,
      );
    }
  };

  const getAspectRatioClass = (ratio: string) => {
    switch (ratio) {
      case "1:1":
        return "aspect-square";
      case "4:5":
        return "aspect-[4/5]";
      case "9:16":
        return "aspect-[9/16]";
      default:
        return "aspect-[4/5]";
    }
  };

  const getAspectRatio = (): string => {
    // Simple logic for aspect ratios - in real app would analyze image dimensions
    const ratios = ["1:1", "4:5", "9:16"];
    return ratios[Math.floor(Math.random() * ratios.length)];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("🎯 FRONTEND UPLOAD SUBMIT TRIGGERED");

    if (!user || files.length === 0 || !title.trim()) {
      toast({
        title: "Missing information",
        description:
          "Please fill in all required fields and select at least one file.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    // Track upload started
    if (user) {
      Analytics.trackZineUploadStarted(user.id);
    }

    try {
      // Convert files to base64
      const mediaFiles = await Promise.all(
        files.map(async (file) => ({
          base64String: await fileToBase64(file),
          type: file.type,
          size: file.size,
          name: file.name,
        })),
      );

      const zineData = {
        title: title.trim(),
        description: description.trim() || null,
        aspectRatio: getAspectRatio(),
        creatorId: user.id,
        mediaFiles, // Send base64 files to backend
      };

      console.log("🚀 Sending zine data with media files to backend");
      createZineMutation.mutate(zineData); // This calls /api/zines with integrated upload
    } catch (error) {
      toast({
        title: "Upload failed",
        description:
          error instanceof Error ? error.message : "Failed to process files.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Helper function to convert File to base64
  function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  const handleClose = () => {
    // FIXED: Clean up object URLs to prevent memory leaks
    fileUrls.forEach((url) => URL.revokeObjectURL(url));
    setFiles([]);
    setTitle("");
    setDescription("");
    setIsUploading(false);
    setCurrentPreviewIndex(0);
    onClose();
  };

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);

    // Adjust preview index if needed
    if (currentPreviewIndex >= newFiles.length && newFiles.length > 0) {
      setCurrentPreviewIndex(newFiles.length - 1);
    } else if (newFiles.length === 0) {
      setCurrentPreviewIndex(0);
    }
  };

  
  

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl mx-4 p-0 overflow-hidden">
        <div className="flex h-[600px]">
          {/* Left Side - Preview Pane */}
          <div className="flex-1 bg-white relative flex items-center justify-center">
            {files.length === 0 ? (
              /* Empty state - Instagram-style drop zone */
              <div className="text-center text-gray-700">
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <div className="space-y-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                      <CloudUpload className="w-8 h-8 text-gray-500" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">
                        Drag photos and videos here
                      </h3>
                      <p className="text-gray-500 mb-4">or click to browse</p>
                      <div className="inline-block text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#1877f2] transition-colors bg-[#364636]">
                        Select from computer
                      </div>
                    </div>
                  </div>
                </label>
              </div>
            ) : (
              /* Preview with navigation */
              <div className="relative w-full h-full flex items-center justify-center">
                {/* Image container with aspect ratio */}
                <div
                  className={`relative ${getAspectRatioClass(fileAspectRatios[currentPreviewIndex])} max-w-full max-h-full`}
                >
                  {files[currentPreviewIndex].type.startsWith("video/") ? (
                    <video
                      key={currentPreviewIndex} // FIXED: Add key to force re-mount when switching videos
                      src={fileUrls[currentPreviewIndex]} // FIXED: Use memoized URL
                      className="w-full h-full object-contain"
                      controls={false}
                      muted
                      autoPlay
                      loop
                    />
                  ) : (
                    <img
                      src={fileUrls[currentPreviewIndex]} // FIXED: Use memoized URL
                      alt="Preview"
                      className="w-full h-full object-contain"
                    />
                  )}
                </div>

                {/* Overlay controls - positioned relative to the full preview area */}
                {/* Navigation arrows for multiple files */}
                {files.length > 1 && (
                  <>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-gray-800 bg-opacity-80 text-white hover:bg-opacity-90 rounded-full w-8 h-8 p-0 shadow-lg"
                      onClick={() => navigatePreview("prev")}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-gray-800 bg-opacity-80 text-white hover:bg-opacity-90 rounded-full w-8 h-8 p-0 shadow-lg"
                      onClick={() => navigatePreview("next")}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </>
                )}

                {/* Delete current file button */}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute top-4 right-4 bg-gray-800 bg-opacity-80 text-white hover:bg-opacity-90 hover:text-red-400 rounded-full w-8 h-8 p-0 shadow-lg"
                  onClick={() => removeFile(currentPreviewIndex)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>

                {/* Add more files button */}
                {files.length < 5 &&
                  !files.some((f) => f.type.startsWith("video/")) && (
                    <div className="absolute bottom-4 right-4">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={addMoreFiles}
                        className="hidden"
                        id="add-more-files"
                      />
                      <label
                        htmlFor="add-more-files"
                        className="cursor-pointer"
                      >
                        <div className="bg-gray-800 bg-opacity-80 text-white hover:bg-opacity-90 rounded-full w-8 h-8 p-0 shadow-lg flex items-center justify-center transition-all">
                          <Plus className="w-4 h-4" />
                        </div>
                      </label>
                    </div>
                  )}

                {/* File indicator dots for multiple files */}
                {files.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                    {files.map((_, index) => (
                      <button
                        key={index}
                        type="button"
                        className={`w-2 h-2 rounded-full transition-colors ${
                          index === currentPreviewIndex
                            ? "bg-gray-800"
                            : "bg-gray-400"
                        }`}
                        onClick={() => setCurrentPreviewIndex(index)}
                      />
                    ))}
                  </div>
                )}

                {/* File counter */}
                {files.length > 1 && (
                  <div className="absolute top-4 left-4 bg-gray-800 bg-opacity-80 text-white text-sm px-2 py-1 rounded shadow-lg">
                    {currentPreviewIndex + 1} / {files.length}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Side - Form */}
          <div className="w-80 bg-white p-6 flex flex-col">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-xl font-semibold text-gray-900">
                Create new post
              </DialogTitle>
            </DialogHeader>

            <form
              onSubmit={handleSubmit}
              className="flex-1 flex flex-col space-y-4"
            >
              {/* Title Input */}
              {/* <div>
                <Label
                  htmlFor="title"
                  className="text-sm font-medium text-gray-700"
                >
                  Title *
                </Label>
                <Input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Give your zine a title..."
                  className="mt-1 focus:border-[#2b3012] focus:ring-[#2b3012]"
                  required
                />
              </div> */}

              {/* Description Input */}
              <div className="flex-1">
                <Label
                  htmlFor="description"
                  className="text-sm font-medium text-gray-700"
                >
                  Blurb
                </Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Write a caption..."
                  className="mt-1 h-32 resize-none focus:border-[#2b3012] focus:ring-[#2b3012]"
                />
              </div>

              {/* File info */}
              {files.length > 0 && (
                <div className="text-sm text-gray-500 p-3 bg-gray-50 rounded">
                  {files.length === 1 ? (
                    <p>
                      1 {files[0].type.startsWith("video/") ? "video" : "image"}{" "}
                      selected
                    </p>
                  ) : (
                    <p>{files.length} images selected (carousel)</p>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4 mt-auto">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={handleClose}
                  disabled={isUploading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-[#2b3012] hover:bg-[#1e2009] text-white"
                  disabled={
                    isUploading ||
                    createZineMutation.isPending ||
                    files.length === 0
                  }
                >
                  {isUploading ? "Sharing..." : "Share"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
