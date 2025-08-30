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
  const [url, setURL] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0);
  const [currentStep, setCurrentStep] = useState(1); // Upload, Step 2: Details
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [imagePreviewIndex, setImagePreviewIndex] = useState(0);

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
        JSON.stringify(zineData, null, 2)
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
        prev > 0 ? prev - 1 : files.length - 1
      );
    } else {
      setCurrentPreviewIndex((prev) =>
        prev < files.length - 1 ? prev + 1 : 0
      );
    }
  };

  const navigateImagePreview = (direction: "prev" | "next") => {
    if (direction === "prev") {
      setImagePreviewIndex((prev) => (prev > 0 ? prev - 1 : files.length - 1));
    } else {
      setImagePreviewIndex((prev) => (prev < files.length - 1 ? prev + 1 : 0));
    }
  };

  const openImagePreview = (index: number) => {
    setImagePreviewIndex(index);
    setShowImagePreview(true);
  };

  const closeImagePreview = () => {
    setShowImagePreview(false);
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

    if (!user || files.length === 0) {
      toast({
        title: "Missing information",
        description: "Please select at least one file.",
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
        }))
      );

      const zineData = {
        title: title.trim() || "Untitled",
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
    // Only close if image preview is not showing
    if (showImagePreview) {
      setShowImagePreview(false);
      return;
    }

    // FIXED: Clean up object URLs to prevent memory leaks
    fileUrls.forEach((url) => URL.revokeObjectURL(url));
    setFiles([]);
    setTitle("");
    setDescription("");
    setURL("");
    setIsUploading(false);
    setCurrentPreviewIndex(0);
    setCurrentStep(1); // Reset to step 1
    setShowImagePreview(false); // Close image preview
    setImagePreviewIndex(0);
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

  const handleNext = () => {
    if (files.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select at least one file before proceeding.",
        variant: "destructive",
      });
      return;
    }
    setCurrentStep(2);
  };

  const handleBack = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
    } else {
      handleClose();
    }
  };

  // Full Size Image Preview Modal
  const renderImagePreviewModal = () => {
    if (!showImagePreview) return null;

    return (
      <div
        className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center"
        style={{ zIndex: 9999 }}
      >
        <div className="absolute inset-0" onClick={closeImagePreview} />

        <div className="relative max-w-4xl max-h-[90vh] w-full h-full flex items-center justify-center p-4 z-10">
          {/* Close button */}
          <button
            onClick={closeImagePreview}
            className="absolute top-4 right-4 z-20 text-white hover:text-gray-300 transition-colors bg-black bg-opacity-50 rounded-full p-2"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Navigation buttons */}
          {files.length > 1 && (
            <>
              <button
                onClick={() => navigateImagePreview("prev")}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 text-white hover:text-gray-300 transition-colors bg-black bg-opacity-50 rounded-full p-2"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={() => navigateImagePreview("next")}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 text-white hover:text-gray-300 transition-colors bg-black bg-opacity-50 rounded-full p-2"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Main image/video */}
          <div className="relative max-w-full max-h-full z-10">
            {files[imagePreviewIndex]?.type.startsWith("video/") ? (
              <video
                src={fileUrls[imagePreviewIndex]}
                className="max-w-full max-h-full object-contain"
                controls
                autoPlay
              />
            ) : (
              <img
                src={fileUrls[imagePreviewIndex]}
                alt="Full size preview"
                className="max-w-full max-h-full object-contain"
              />
            )}
          </div>

          {/* Image counter */}
          {files.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-sm z-20">
              {imagePreviewIndex + 1} / {files.length}
            </div>
          )}

          {/* Thumbnail navigation */}
          {files.length > 1 && (
            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex space-x-2 max-w-full overflow-x-auto px-4 z-20">
              {files.map((file, index) => (
                <button
                  key={index}
                  onClick={() => setImagePreviewIndex(index)}
                  className={`flex-shrink-0 w-12 h-12 rounded overflow-hidden border-2 transition-all ${
                    index === imagePreviewIndex
                      ? "border-white"
                      : "border-transparent opacity-60 hover:opacity-80"
                  }`}
                >
                  {file.type.startsWith("video/") ? (
                    <video
                      src={fileUrls[index]}
                      className="w-full h-full object-cover"
                      muted
                    />
                  ) : (
                    <img
                      src={fileUrls[index]}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Upload Component
  const renderUploadStep = () => (
    <DialogContent className="max-w-lg mx-4 p-0 overflow-hidden bg-[#2a2a2a] border-gray-700">
      <div className="relative">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8 text-center">
          {files.length === 0 ? (
            <div className="space-y-6 border border-[#a0a0a0cc] py-12 border-dashed  rounded-lg mt-10">
              <div className="w-16 h-16 mx-auto flex items-center justify-center mb-[-20px]">
                <i className="fa-solid fa-arrow-up-from-bracket font-bold text-[#8d8a8a] text-4xl"></i>
              </div>

              <div>
                <h3 className="text-xl font-normal text-white mb-4">
                  Upload your zine
                </h3>
                <p className="text-[#8d8a8a] mb-6">
                  Drag and drop images here, or click to browse
                </p>
              </div>

              <input
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <div className="inline-block bg-[#474747] border border-[#a0a0a0cc] hover:bg-[#262626eb] text-white px-4 py-2 rounded-xl font-medium transition-colors">
                  Choose Files
                </div>
              </label>
            </div>
          ) : (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-white">
                Files Selected
              </h3>

              {/* File preview thumbnails */}
              <div className="flex flex-wrap gap-2 justify-center max-h-40 overflow-y-auto">
                {files.map((file, index) => (
                  <div key={index} className="relative">
                    <div
                      className="w-16 h-16 bg-gray-700 rounded overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => openImagePreview(index)}
                    >
                      {file.type.startsWith("video/") ? (
                        <video
                          src={fileUrls[index]}
                          className="w-full h-full object-cover"
                          muted
                        />
                      ) : (
                        <img
                          src={fileUrls[index]}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <button
                      onClick={() => removeFile(index)}
                      className="absolute -top-0 -right-0 bg-red-500 hover:bg-red-600 text-white rounded-full w-4 pl-[5px] pr-[4px] pb-[5px] pt-[4px] h-4 flex items-center justify-center text-xs"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>

              <p className="text-gray-400 text-sm">
                {files.length} {files.length === 1 ? "file" : "files"} selected
              </p>

              {/* Add more files option */}
              {files.length < 5 &&
                !files.some((f) => f.type.startsWith("video/")) && (
                  <div>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={addMoreFiles}
                      className="hidden"
                      id="add-more-files"
                    />
                    <label htmlFor="add-more-files" className="cursor-pointer">
                      <div className="inline-block bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded font-medium transition-colors">
                        Add More Files
                      </div>
                    </label>
                  </div>
                )}

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 bg-transparent border-gray-600 text-white hover:bg-gray-700"
                  onClick={handleBack}
                >
                  Back
                </Button>
                <Button
                  type="button"
                  className="flex-1 bg-white hover:bg-gray-100 text-black"
                  onClick={handleNext}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DialogContent>
  );

  // Details Component
  const renderDetailsStep = () => (
    <DialogContent className="max-w-2xl mx-4 p-0 overflow-hidden bg-[#2a2a2a] border-gray-700">
      <div className="relative">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 z-10 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Title - Top Left */}
        <div className="px-4 pt-4 pb-2 pl-7">
          <h3 className="text-lg font-medium text-white">Add Details</h3>
        </div>

        <div className="flex h-[280px]">
          {/* Left Side - Image Preview */}
          <div className="w-32 bg-[#2a2a2a] relative flex items-center justify-center">
            {files.length > 0 && (
              <div className="relative w-full h-full flex items-center justify-center p-3">
                {/* Small image container */}
                <div
                  className="relative w-40 h-40 flex-shrink-0 ml-[90px] mt-[-80px] cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => openImagePreview(currentPreviewIndex)}
                >
                  {files[currentPreviewIndex].type.startsWith("video/") ? (
                    <video
                      key={currentPreviewIndex}
                      src={fileUrls[currentPreviewIndex]}
                      className="w-full h-full object-cover rounded"
                      controls={false}
                      muted
                      autoPlay
                      loop
                    />
                  ) : (
                    <img
                      src={fileUrls[currentPreviewIndex]}
                      alt="Preview"
                      className="w-full h-full object-cover rounded"
                    />
                  )}
                </div>

                {/* Simple navigation for multiple files */}
                {files.length > 1 && (
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex space-x-1 ml-[40px] mb-[50px]">
                    {files.map((_, index) => (
                      <button
                        key={index}
                        type="button"
                        className={`w-1.5 h-1.5 rounded-full transition-colors ${
                          index === currentPreviewIndex
                            ? "bg-white"
                            : "bg-gray-500"
                        }`}
                        onClick={() => setCurrentPreviewIndex(index)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Side - Form */}
          <div className="flex-1 bg-[#2a2a2a] p-4 ml-[80px]">
            <form onSubmit={handleSubmit} className="h-full flex flex-col">
              {/* Blurb/Description */}
              <div className="mb-4">
                <Label
                  htmlFor="description"
                  className="text-sm text-white mb-2 block"
                >
                  Blurb
                </Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Write a short description about your zine..."
                  className="w-full h-16 pl-2 bg-transparent border-0 border-b border-gray-600 rounded-none resize-none text-white placeholder-gray-500 focus:border-gray-400 focus:ring-0 text-sm"
                />
              </div>

              {/* Website URL */}
              <div className="mb-6">
                <Label htmlFor="url" className="text-sm text-white mb-2 block">
                  Website URL (Optional)
                </Label>
                <input
                  id="url"
                  type="url"
                  value={url}
                  onChange={(e) => setURL(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full h-8 px-0 py-1 pl-0 bg-transparent border-0 border-b border-gray-600 text-white placeholder-gray-500 focus:border-gray-400 focus:ring-0 focus:outline-none text-sm"
                />
              </div>

              {/* Action Buttons - Positioned to the right */}
              {/*  */}
              <div className="flex justify-end gap-2 mt-auto">
                <Button
                  type="button"
                  variant="outline"
                  className="px-4 py-2 bg-transparent border border-gray-600 text-white hover:bg-gray-700 text-sm h-8"
                  onClick={handleBack}
                  disabled={isUploading}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  className="px-4 py-2 bg-white hover:bg-gray-100 text-black text-sm h-8"
                  disabled={isUploading || createZineMutation.isPending}
                >
                  {isUploading ? "Publishing..." : "Publish"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </DialogContent>
  );

  return (
    <>
      <Dialog
        open={isOpen && !showImagePreview}
        onOpenChange={(open) => {
          if (!open) {
            onClose();
          }
        }}
      >
        {currentStep === 1 ? renderUploadStep() : renderDetailsStep()}
      </Dialog>

      {/* Full Size Image Preview Modal - Rendered outside of Dialog */}
      {showImagePreview && renderImagePreviewModal()}
    </>
  );
}
