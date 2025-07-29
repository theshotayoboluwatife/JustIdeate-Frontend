import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Save,
  MoreVertical,
  Trash2,
  Undo,
  Redo,
  X,
  Edit3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Project } from "@shared/schema";

export default function ProjectEditor() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const titleRef = useRef<HTMLTextAreaElement>(null);
  const notesRef = useRef<HTMLTextAreaElement>(null);

  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Undo/Redo state
  const [history, setHistory] = useState<
    Array<{ title: string; notes: string }>
  >([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isUndoRedoing, setIsUndoRedoing] = useState(false);

  const projectId = id;

  const { data: projectData, isLoading } = useQuery({
    queryKey: [`/api/projects/${projectId}`],
    enabled: !!projectId,
  });

  const project: Project | undefined = projectData?.project;

  // Initialize form data when project loads
  useEffect(() => {
    if (project) {
      const initialState = { title: project.title, notes: project.notes || "" };
      setTitle(project.title);
      setNotes(project.notes || "");
      setHasUnsavedChanges(false);

      // Initialize history with current state
      setHistory([initialState]);
      setHistoryIndex(0);
    }
  }, [project]);

  // Check if user has seen project editor onboarding
  useEffect(() => {
    if (project && user) {
      const onboardingKey = `project-editor-onboarding-seen-${user.id}`;
      const hasSeenOnboarding = localStorage.getItem(onboardingKey);

      if (!hasSeenOnboarding) {
        // Small delay to ensure the component is fully rendered
        const timer = setTimeout(() => {
          setShowOnboarding(true);
        }, 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [project, user]);

  // Track changes
  useEffect(() => {
    if (project) {
      const titleChanged = title !== project.title;
      const notesChanged = notes !== (project.notes || "");
      setHasUnsavedChanges(titleChanged || notesChanged);
    }
  }, [title, notes, project]);

  // Auto-save functionality
  const updateProjectMutation = useMutation({
    mutationFn: async (updates: { title?: string; notes?: string }) => {
      if (!projectId) throw new Error("No project ID");
      const response = await apiRequest(
        "PUT",
        `/api/projects/${projectId}`,
        updates,
      );
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [`/api/projects/${projectId}`],
      });
      queryClient.invalidateQueries({
        queryKey: [`/api/users/${user?.id}/projects`],
      });
      setHasUnsavedChanges(false);
      setIsAutoSaving(false);
    },
    onError: () => {
      setIsAutoSaving(false);
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: async () => {
      if (!projectId || !user) throw new Error("Missing project ID or user");
      const response = await apiRequest(
        "DELETE",
        `/api/projects/${projectId}`,
        { userId: user.id },
      );
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [`/api/users/${user?.id}/projects`],
      });
      toast({ title: "Project deleted successfully" });
      setLocation(`/profile/${user?.id}`);
    },
  });

  // Save current state to history
  const saveToHistory = useCallback(
    (newTitle: string, newNotes: string) => {
      if (isUndoRedoing) return;

      setHistory((prev) => {
        const newHistory = prev.slice(0, historyIndex + 1);
        const newState = { title: newTitle, notes: newNotes };

        // Don't save if it's the same as the last state
        if (newHistory.length > 0) {
          const lastState = newHistory[newHistory.length - 1];
          if (lastState.title === newTitle && lastState.notes === newNotes) {
            return prev;
          }
        }

        const updatedHistory = [...newHistory, newState];
        // Keep history to reasonable size (max 50 entries)
        return updatedHistory.slice(-50);
      });

      setHistoryIndex((prev) => Math.min(prev + 1, 49));
    },
    [historyIndex, isUndoRedoing],
  );

  // Auto-save with debouncing
  useEffect(() => {
    if (!hasUnsavedChanges || !project) return;

    const autoSaveTimer = setTimeout(() => {
      setIsAutoSaving(true);
      updateProjectMutation.mutate({ title, notes });
    }, 2000); // Auto-save after 2 seconds of inactivity

    return () => clearTimeout(autoSaveTimer);
  }, [title, notes, hasUnsavedChanges, project]);

  const handleSave = () => {
    if (!hasUnsavedChanges) return;
    setIsAutoSaving(true);
    updateProjectMutation.mutate({ title, notes });
  };

  const handleDelete = () => {
    if (
      window.confirm(
        "Are you sure you want to delete this project? This action cannot be undone.",
      )
    ) {
      deleteProjectMutation.mutate();
    }
  };

  const handleBackToProfile = () => {
    // Navigate to current user's profile with workspace tab preselected
    const targetUserId = user?.id || project?.userId;
    setLocation(`/profile/${targetUserId}?tab=workspace`);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    saveToHistory(newTitle, notes);

    // Auto-resize textarea
    if (titleRef.current) {
      titleRef.current.style.height = "auto";
      titleRef.current.style.height = titleRef.current.scrollHeight + "px";
    }
  };

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newNotes = e.target.value;
    setNotes(newNotes);
    saveToHistory(title, newNotes);

    // Auto-resize textarea
    if (notesRef.current) {
      notesRef.current.style.height = "auto";
      notesRef.current.style.height = notesRef.current.scrollHeight + "px";
    }
  };

  // Undo functionality
  const handleUndo = () => {
    if (historyIndex > 0) {
      setIsUndoRedoing(true);
      const prevState = history[historyIndex - 1];
      setTitle(prevState.title);
      setNotes(prevState.notes);
      setHistoryIndex(historyIndex - 1);
      setTimeout(() => setIsUndoRedoing(false), 0);
    }
  };

  // Redo functionality
  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setIsUndoRedoing(true);
      const nextState = history[historyIndex + 1];
      setTitle(nextState.title);
      setNotes(nextState.notes);
      setHistoryIndex(historyIndex + 1);
      setTimeout(() => setIsUndoRedoing(false), 0);
    }
  };

  const dismissOnboarding = () => {
    if (user) {
      const onboardingKey = `project-editor-onboarding-seen-${user.id}`;
      localStorage.setItem(onboardingKey, "true");
      setShowOnboarding(false);
    }
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      } else if ((e.metaKey || e.ctrlKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      } else if (
        (e.metaKey || e.ctrlKey) &&
        (e.key === "y" || (e.key === "z" && e.shiftKey))
      ) {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [historyIndex, history.length]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Loading project...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Project Not Found
          </h1>
          <p className="text-gray-600 mb-4">
            The project you're looking for doesn't exist.
          </p>
          <Button
            onClick={() =>
              setLocation(`/profile/${user?.id || "1"}?tab=workspace`)
            }
            className="just-ideate-primary just-ideate-primary-hover text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Profile
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white relative">
      {/* Floating Controls - Top Left */}
      <div className="fixed top-6 left-6 z-10 flex items-center space-x-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBackToProfile}
          className="bg-white/80 backdrop-blur-sm shadow-sm text-gray-600 hover:text-gray-900 hover:bg-white/90"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        {isAutoSaving && (
          <div className="bg-just-ideate-primary/10 text-just-ideate-primary text-xs px-3 py-1 rounded-full border border-just-ideate-primary/30">
            Saving...
          </div>
        )}
        {hasUnsavedChanges && !isAutoSaving && (
          <div className="bg-green-50 text-green-700 text-xs px-3 py-1 rounded-full border border-green-200">
            Unsaved changes
          </div>
        )}
      </div>

      {/* Floating Controls - Top Right */}
      <div className="fixed top-6 right-6 z-10 flex items-center space-x-2">
        {/* Undo/Redo */}
        <div className="flex items-center space-x-1">
          <Button
            onClick={handleUndo}
            disabled={historyIndex <= 0}
            size="sm"
            variant="ghost"
            className="bg-white/80 backdrop-blur-sm shadow-sm hover:bg-white/90 disabled:opacity-50"
          >
            <Undo className="w-4 h-4" />
          </Button>
          <Button
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            size="sm"
            variant="ghost"
            className="bg-white/80 backdrop-blur-sm shadow-sm hover:bg-white/90 disabled:opacity-50"
          >
            <Redo className="w-4 h-4" />
          </Button>
        </div>

        <Button
          onClick={handleSave}
          disabled={!hasUnsavedChanges || updateProjectMutation.isPending}
          size="sm"
          className="just-ideate-primary just-ideate-primary-hover text-white shadow-sm"
        >
          <Save className="w-4 h-4 mr-2" />
          {updateProjectMutation.isPending ? "Saving..." : "Save"}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="bg-white/80 backdrop-blur-sm shadow-sm hover:bg-white/90"
            >
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={handleDelete}
              className="text-red-600 focus:text-red-600"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Project
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Full Canvas Editor */}
      <div className="min-h-screen flex flex-col justify-center px-12 py-24">
        <div className="w-full max-w-4xl mx-auto">
          {/* Title Field - Very Large */}
          <textarea
            ref={titleRef}
            value={title}
            onChange={handleTitleChange}
            placeholder="Untitled idea..."
            maxLength={60}
            rows={2}
            className="w-full text-4xl sm:text-5xl lg:text-6xl font-raleway font-extrabold-custom text-primary-custom placeholder-gray-300 border-none outline-none bg-transparent resize-none mb-12 leading-tight overflow-hidden"
            style={{
              height: "auto",
              whiteSpace: "pre-wrap",
              wordWrap: "break-word",
              overflowWrap: "break-word",
            }}
            onKeyDown={(e) => {
              // Prevent Enter key from creating new lines
              if (e.key === "Enter") {
                e.preventDefault();
              }
            }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              // Reset height to auto to recalculate
              target.style.height = "auto";
              // Set height to scrollHeight to show all content without scrolling
              target.style.height = target.scrollHeight + "px";
            }}
          />

          {/* Notes Field - Full Canvas */}
          <textarea
            ref={notesRef}
            value={notes}
            onChange={handleNotesChange}
            placeholder="Start writing your notes here..."
            className="w-full text-lg font-inter text-secondary-custom placeholder-gray-400 border-none outline-none bg-transparent resize-none leading-relaxed min-h-[50vh]"
            style={{
              lineHeight: "1.8",
            }}
          />
        </div>
      </div>

      {/* Project Editor Onboarding Popup */}
      {showOnboarding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="relative bg-white rounded-2xl p-8 max-w-md mx-4 shadow-2xl border border-gray-100">
            <button
              onClick={dismissOnboarding}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-[#f8f9f5] to-[#f0f2e8] rounded-full flex items-center justify-center mx-auto mb-6">
                <Edit3 className="w-8 h-8 text-[#2b3012]" />
              </div>

              <h3 className="text-2xl font-bold text-[#2b3012] mb-4 font-raleway">
                Your Project Canvas
              </h3>

              <div className="text-left space-y-4 text-gray-700 font-inter">
                <p className="text-lg">
                  This is your dedicated space for this project. Use it to:
                </p>

                <ul className="space-y-2 text-base">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-[#2b3012] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Jot down ideas as they come to you
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-[#2b3012] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Draft content and rough sketches
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-[#2b3012] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Plan your layout and structure
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-[#2b3012] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Keep all project details in one place
                  </li>
                </ul>

                <p className="text-base text-gray-600 pt-2">
                  Your notes auto-save, so just start writing!
                </p>
              </div>

              <Button
                onClick={dismissOnboarding}
                className="mt-6 bg-[#2b3012] hover:bg-[#1e240d] text-white px-8 py-3 rounded-xl font-semibold"
              >
                Got it, let's create!
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
