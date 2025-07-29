import { useState, useEffect } from "react";

// Updated Supabase hook to call backend API
export function useSupabase() {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Simulate initialization
    setIsInitialized(true);
  }, []);

  const uploadImage = async (file: File): Promise<string> => {
    try {
      // Convert file to base64
      const base64String = await fileToBase64(file);

      // Call your backend API endpoint
      const response = await fetch("/api/upload-zine-media", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          base64String,
        }),
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.url) {
        throw new Error("No URL returned from upload");
      }

      return data.url;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    }
  };

  const uploadVideo = async (file: File): Promise<string> => {
    try {
      // Convert file to base64
      const base64String = await fileToBase64(file);

      // Call your backend API endpoint
      const response = await fetch("/api/upload-zine-media", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          base64String,
        }),
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.url) {
        throw new Error("No URL returned from upload");
      }

      return data.url;
    } catch (error) {
      console.error("Error uploading video:", error);
      throw error;
    }
  };

  return {
    isInitialized,
    uploadImage,
    uploadVideo,
  };
}

// Helper function to convert File to base64
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result as string);
    };
    reader.onerror = (error) => {
      reject(error);
    };
    reader.readAsDataURL(file);
  });
}
