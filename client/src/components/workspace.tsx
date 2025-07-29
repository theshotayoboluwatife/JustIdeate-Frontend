import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Clock,
  Play,
  Pause,
  Square,
  Trash2,
  Edit3,
  FileText,
  Check,
  X,
  Lightbulb,
} from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Project } from "@shared/schema";

interface WorkspaceProps {
  userId: string;
}

export function Workspace({ userId }: WorkspaceProps) {
  const [activeTab, setActiveTab] = useState<"active" | "finished">("active");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(() => {
    const saved = localStorage.getItem(`selected-project-${userId}`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });
  // Timer state with persistence
  const [isTimerRunning, setIsTimerRunning] = useState(() => {
    const saved = localStorage.getItem(`timer-running-${userId}`);
    return saved ? JSON.parse(saved) : false;
  });

  const [currentTime, setCurrentTime] = useState(() => {
    const saved = localStorage.getItem(`timer-time-${userId}`);
    return saved ? parseInt(saved) : 25 * 60;
  });

  const [customDuration, setCustomDuration] = useState(() => {
    const saved = localStorage.getItem(`timer-duration-${userId}`);
    return saved ? parseInt(saved) : 25;
  });

  const [timerStartTime, setTimerStartTime] = useState(() => {
    const saved = localStorage.getItem(`timer-start-time-${userId}`);
    return saved ? parseInt(saved) : null;
  });
  const [projectSwitchModal, setProjectSwitchModal] = useState<{
    isOpen: boolean;
    newProject: Project | null;
  }>({ isOpen: false, newProject: null });
  const [showOnboarding, setShowOnboarding] = useState(false);
  // Removed session type - timer only for focus sessions

  const { data: projectsData, isLoading } = useQuery({
    queryKey: [`/api/users/${userId}/projects`],
    enabled: !!userId,
  });

  const projects: Project[] = projectsData?.projects || [];

  // Debug logging for completion fix
  console.log("🔍 WORKSPACE DEBUG:", {
    userId,
    projectsCount: projects.length,
    activeTab,
    projectsWithCompletion: projects.map((p) => ({
      id: p.id,
      title: p.title,
      completedAt: p.completedAt,
    })),
  });

  // Check if user has seen workspace onboarding
  useEffect(() => {
    const onboardingKey = `workspace-onboarding-seen-${userId}`;
    const hasSeenOnboarding = localStorage.getItem(onboardingKey);

    if (!hasSeenOnboarding && !isLoading) {
      // Small delay to ensure the component is fully rendered
      const timer = setTimeout(() => {
        setShowOnboarding(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [userId, isLoading]);

  // Filter projects based on active tab
  const displayedProjects = projects.filter((project) => {
    if (activeTab === "active") {
      return project.completedAt === null;
    } else {
      return project.completedAt !== null;
    }
  });

  const createProjectMutation = useMutation({
    mutationFn: async (projectData: { title: string; notes: string }) => {
      const response = await apiRequest("POST", "/api/projects", {
        title: projectData.title,
        notes: projectData.notes || "",
        userId: userId,
        totalMinutes: 0,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [`/api/users/${userId}/projects`],
      });
      setIsCreateModalOpen(false);
      toast({ title: "Project created successfully!" });
    },
  });

  const updateProjectMutation = useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: {
      id: number;
      title?: string;
      notes?: string;
      isCompleted?: boolean;
    }) => {
      const response = await apiRequest("PUT", `/api/projects/${id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [`/api/users/${userId}/projects`],
      });
      toast({ title: "Project updated successfully!" });
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: async (projectId: number) => {
      console.log(
        "🗑️ Frontend delete mutation called for project:",
        projectId,
        "userId:",
        userId,
      );
      const response = await apiRequest(
        "DELETE",
        `/api/projects/${projectId}`,
        { userId },
      );
      console.log("Delete response:", response);
      return response.json();
    },
    onSuccess: (_, projectId) => {
      console.log("✅ Delete mutation success for project:", projectId);
      queryClient.invalidateQueries({
        queryKey: [`/api/users/${userId}/projects`],
      });
      if (selectedProject?.id === projectId) {
        setSelectedProject(null);
      }
      toast({ title: "Project deleted successfully!" });
    },
    onError: (error) => {
      console.error("❌ Delete mutation error:", error);
      toast({ title: "Failed to delete project", variant: "destructive" });
    },
  });

  const createFocusSessionMutation = useMutation({
    mutationFn: async (sessionData: {
      projectId: number;
      duration: number;
      sessionType: string;
      userId: number;
    }) => {
      const response = await apiRequest(
        "POST",
        "/api/focus-sessions",
        sessionData,
      );
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [`/api/users/${userId}/projects`],
      });
    },
  });

  const handleProjectSelect = (project: Project) => {
    // Don't show project switch modal if any other modal/dialog is open
    if (isCreateModalOpen || projectSwitchModal.isOpen) {
      return;
    }

    // If timer is running and switching to a different project, show confirmation
    if (
      isTimerRunning &&
      selectedProject &&
      selectedProject.id !== project.id
    ) {
      setProjectSwitchModal({ isOpen: true, newProject: project });
      return;
    }
    setSelectedProject(project);
    localStorage.setItem(`selected-project-${userId}`, JSON.stringify(project));
  };

  const handleProjectSwitch = () => {
    if (projectSwitchModal.newProject) {
      setSelectedProject(projectSwitchModal.newProject);
      localStorage.setItem(
        `selected-project-${userId}`,
        JSON.stringify(projectSwitchModal.newProject),
      );
    }
    setProjectSwitchModal({ isOpen: false, newProject: null });
  };

  const handleCancelSwitch = () => {
    setProjectSwitchModal({ isOpen: false, newProject: null });
  };

  const toggleCompletionMutation = useMutation({
    mutationFn: async (projectId: number) => {
      const response = await apiRequest(
        "PUT",
        `/api/projects/${projectId}/toggle-completion`,
        { userId },
      );
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [`/api/users/${userId}/projects`],
      });
      toast({ title: "Project completion status updated" });
    },
    onError: (error) => {
      console.error("Toggle completion error:", error);
      toast({
        title: "Failed to update project completion",
        variant: "destructive",
      });
    },
  });

  const handleToggleCompletion = (projectId: number) => {
    toggleCompletionMutation.mutate(projectId);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const getTimerDuration = () => {
    return customDuration * 60;
  };

  const startTimer = () => {
    if (!selectedProject) {
      toast({ title: "Please select a project first", variant: "destructive" });
      return;
    }
    const startTime = Date.now();
    setIsTimerRunning(true);
    setTimerStartTime(startTime);
    localStorage.setItem(`timer-running-${userId}`, "true");
    localStorage.setItem(`timer-start-time-${userId}`, startTime.toString());
    // Keep the current time when resuming - don't reset it
    localStorage.setItem(`timer-time-${userId}`, currentTime.toString());
  };

  const pauseTimer = () => {
    setIsTimerRunning(false);
    setTimerStartTime(null);
    localStorage.setItem(`timer-running-${userId}`, "false");
    localStorage.removeItem(`timer-start-time-${userId}`);
    localStorage.setItem(`timer-time-${userId}`, currentTime.toString());
  };

  const resetTimer = () => {
    const newTime = getTimerDuration();
    setIsTimerRunning(false);
    setTimerStartTime(null);
    setCurrentTime(newTime);
    localStorage.setItem(`timer-running-${userId}`, "false");
    localStorage.removeItem(`timer-start-time-${userId}`);
    localStorage.setItem(`timer-time-${userId}`, newTime.toString());
  };

  const completeSession = () => {
    if (!selectedProject) return;

    const elapsedSeconds = getTimerDuration() - currentTime;
    const duration = Math.floor(elapsedSeconds / 60);

    // Only create session and update project if there was meaningful time elapsed
    if (duration > 0) {
      createFocusSessionMutation.mutate(
        {
          projectId: selectedProject.id,
          duration,
          sessionType: "focus",
          userId: parseInt(userId.toString()),
        },
        {
          onSuccess: () => {
            // Update the selected project's total minutes locally for immediate UI update
            const updatedProject = {
              ...selectedProject,
              totalMinutes: selectedProject.totalMinutes + duration,
            };
            setSelectedProject(updatedProject);
            localStorage.setItem(
              `selected-project-${userId}`,
              JSON.stringify(updatedProject),
            );
          },
        },
      );
    }

    const newTime = getTimerDuration();
    setIsTimerRunning(false);
    setTimerStartTime(null);
    setCurrentTime(newTime);

    // Clear timer persistence
    localStorage.setItem(`timer-running-${userId}`, "false");
    localStorage.removeItem(`timer-start-time-${userId}`);
    localStorage.setItem(`timer-time-${userId}`, newTime.toString());

    toast({
      title: "Focus session completed!",
      description:
        duration > 0
          ? `Great work! You focused for ${duration} minutes.`
          : "Session completed!",
    });
  };

  const dismissOnboarding = () => {
    const onboardingKey = `workspace-onboarding-seen-${userId}`;
    localStorage.setItem(onboardingKey, "true");
    setShowOnboarding(false);
  };

  // Initialize timer state from localStorage on mount
  useEffect(() => {
    if (!userId) return;

    const savedRunning = localStorage.getItem(`timer-running-${userId}`);
    const savedStartTime = localStorage.getItem(`timer-start-time-${userId}`);
    const savedTime = localStorage.getItem(`timer-time-${userId}`);

    if (savedRunning === "true" && savedStartTime && savedTime) {
      const startTime = parseInt(savedStartTime);
      const savedTimeValue = parseInt(savedTime);
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const newTime = Math.max(0, savedTimeValue - elapsed);

      if (newTime > 0) {
        setCurrentTime(newTime);
        setIsTimerRunning(true);
        setTimerStartTime(startTime);
      } else {
        // Timer completed while away - complete the session
        if (selectedProject) {
          const elapsedSeconds = getTimerDuration();
          const duration = Math.floor(elapsedSeconds / 60);

          if (duration > 0) {
            createFocusSessionMutation.mutate(
              {
                projectId: selectedProject.id,
                duration,
                sessionType: "focus",
                userId: parseInt(userId.toString()),
              },
              {
                onSuccess: () => {
                  const updatedProject = {
                    ...selectedProject,
                    totalMinutes: selectedProject.totalMinutes + duration,
                  };
                  setSelectedProject(updatedProject);
                  localStorage.setItem(
                    `selected-project-${userId}`,
                    JSON.stringify(updatedProject),
                  );
                },
              },
            );
          }
        }

        setIsTimerRunning(false);
        setTimerStartTime(null);
        setCurrentTime(getTimerDuration());
        localStorage.setItem(`timer-running-${userId}`, "false");
        localStorage.removeItem(`timer-start-time-${userId}`);
      }
    }
  }, [userId, customDuration]);

  // Timer countdown effect with persistence
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isTimerRunning && currentTime > 0 && timerStartTime) {
      interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - timerStartTime) / 1000);
        const savedTime = parseInt(
          localStorage.getItem(`timer-time-${userId}`) ||
            currentTime.toString(),
        );
        const newTime = Math.max(0, savedTime - elapsed);

        if (newTime <= 0) {
          completeSession();
          return;
        }

        setCurrentTime(newTime);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isTimerRunning, timerStartTime, selectedProject, userId]);

  // Update duration persistence
  useEffect(() => {
    if (userId) {
      localStorage.setItem(
        `timer-duration-${userId}`,
        customDuration.toString(),
      );
      // Only reset the timer if it's not running AND it's at the full duration
      // This prevents resetting a paused timer when duration changes
      const fullDuration = customDuration * 60;
      if (!isTimerRunning && currentTime === fullDuration) {
        setCurrentTime(fullDuration);
        localStorage.setItem(`timer-time-${userId}`, fullDuration.toString());
      }
    }
  }, [customDuration, userId, isTimerRunning, currentTime]);

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-48"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Workspace</h1>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button className="just-ideate-primary just-ideate-primary-hover text-white">
              <Plus className="w-4 h-4 mr-2" />
              New Project
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
            </DialogHeader>
            <ProjectForm
              onSubmit={(data) => createProjectMutation.mutate(data)}
              isLoading={createProjectMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Projects Section */}
        <div className="space-y-6">
          {/* Project Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8" aria-label="Project tabs">
              <button
                onClick={() => setActiveTab("active")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "active"
                    ? "border-[#2b3012] text-[#2b3012]"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                My Projects
              </button>
              <button
                onClick={() => setActiveTab("finished")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "finished"
                    ? "border-[#2b3012] text-[#2b3012]"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Finished
              </button>
            </nav>
          </div>

          {displayedProjects.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                {activeTab === "active" ? (
                  <Clock className="w-6 h-6 text-gray-400" />
                ) : (
                  <Check className="w-6 h-6 text-gray-400" />
                )}
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {activeTab === "active"
                  ? "No active projects yet"
                  : "No finished projects yet"}
              </h3>
              <p className="text-gray-500 mb-4">
                {activeTab === "active"
                  ? "Create your first zine project to start tracking your work."
                  : "Complete some projects to see them here."}
              </p>
              {activeTab === "active" && (
                <Button
                  onClick={() => setIsCreateModalOpen(true)}
                  variant="outline"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Project
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {displayedProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  isSelected={selectedProject?.id === project.id}
                  onSelect={() => handleProjectSelect(project)}
                  onUpdate={(updates) =>
                    updateProjectMutation.mutate({ id: project.id, ...updates })
                  }
                  onDelete={() => deleteProjectMutation.mutate(project.id)}
                  onToggleCompletion={() => handleToggleCompletion(project.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Focus Timer Section */}
        {/* <div className="space-y-6">
          <h2 className="text-lg font-semibold text-gray-900">Focus Timer</h2>

          <Card className="rounded-2xl border-0 shadow-lg bg-white">
            <CardHeader className="rounded-t-2xl bg-gradient-to-r from-[#f8f9f5] to-[#f0f2e8] border-b border-gray-100">
              <CardTitle className="text-center text-xl font-semibold text-[#2b3012]">
                Focus Session
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-8 p-8 rounded-b-2xl">
              <div className="flex items-center justify-center space-x-3 mb-6">
                <Label
                  htmlFor="duration"
                  className="text-base font-medium text-gray-700"
                >
                  Duration:
                </Label>
                <Input
                  id="duration"
                  type="number"
                  min="1"
                  max="120"
                  value={customDuration}
                  onChange={(e) => {
                    const newDuration = parseInt(e.target.value) || 25;
                    setCustomDuration(newDuration);
                    if (!isTimerRunning) {
                      setCurrentTime(newDuration * 60);
                    }
                  }}
                  className="w-24 h-10 text-center text-lg font-medium rounded-xl border-2 border-gray-200 focus:border-[#2b3012] focus:ring-0"
                  disabled={isTimerRunning}
                />
                <span className="text-base font-medium text-gray-700">min</span>
              </div>
              <div className="rounded-2xl p-8 mb-6 bg-[#ffffff]">
                <div className="text-7xl font-mono font-bold text-[#2b3012] mb-2">
                  {formatTime(currentTime)}
                </div>
                {selectedProject && (
                  <div className="text-lg text-gray-600">
                    Working on:{" "}
                    <span className="font-semibold text-[#2b3012]">
                      {selectedProject.title}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex justify-center space-x-4">
                {!isTimerRunning ? (
                  <Button
                    onClick={startTimer}
                    className="bg-[#2b3012] hover:bg-[#1e240d] text-white px-8 py-3 rounded-xl text-lg font-semibold shadow-md hover:shadow-lg transition-all"
                    disabled={!selectedProject}
                  >
                    <Play className="w-5 h-5 mr-2" />
                    Start
                  </Button>
                ) : (
                  <Button
                    onClick={pauseTimer}
                    variant="outline"
                    className="px-6 py-3 rounded-xl text-lg font-semibold border-2 border-gray-300 hover:border-gray-400"
                  >
                    <Pause className="w-5 h-5 mr-2" />
                    Pause
                  </Button>
                )}

                <Button
                  onClick={resetTimer}
                  variant="outline"
                  className="px-6 py-3 rounded-xl text-lg font-semibold border-2 border-gray-300 hover:border-gray-400"
                >
                  <Square className="w-5 h-5 mr-2" />
                  Reset
                </Button>

                <Button
                  onClick={completeSession}
                  variant="outline"
                  className="px-6 py-3 rounded-xl text-lg font-semibold border-2 border-gray-300 hover:border-gray-400"
                  disabled={!selectedProject}
                >
                  Done
                </Button>
              </div>
            </CardContent>
          </Card>
        </div> */}
      </div>
      {/* Project Switch Confirmation Dialog */}
      <Dialog
        open={projectSwitchModal.isOpen}
        onOpenChange={handleCancelSwitch}
      >
        <DialogContent className="sm:max-w-md bg-black border-black">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-left text-white">
              You’re still tracking a different project.
            </DialogTitle>
          </DialogHeader>
          <div className="text-left py-4">
            <p className="text-white/80 text-lg mt-[-15px] mb-[-15px]">
              Want to keep going with that one or switch to this one?
            </p>
          </div>
          <div className="flex justify-start space-x-4 pt-4">
            <Button
              onClick={handleCancelSwitch}
              className="bg-white text-black border-white hover:bg-gray-100 px-8 py-2 font-semibold"
            >
              Cancel
            </Button>
            <Button
              onClick={handleProjectSwitch}
              className="bg-white text-black hover:bg-gray-100 px-8 py-2 font-semibold"
            >
              Switch
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Onboarding Popup */}
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
                <Lightbulb className="w-8 h-8 text-[#2b3012]" />
              </div>

              <h3 className="text-2xl font-bold text-[#2b3012] mb-4 font-raleway">
                Welcome to Your Workspace!
              </h3>

              <div className="text-left space-y-4 text-gray-700 font-inter">
                <p className="text-lg">
                  Think of this as your creative journal—a place to:
                </p>

                <ul className="space-y-2 text-base">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-[#2b3012] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Plan and organize your zine projects
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-[#2b3012] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Track your creative progress with the focus timer
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-[#2b3012] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Keep notes and ideas in one place
                  </li>
                </ul>

                <p className="text-base text-gray-600 pt-2">
                  Create your first project to get started!
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

interface ProjectFormProps {
  project?: Project;
  onSubmit: (data: { title: string; notes: string }) => void;
  isLoading: boolean;
}

function ProjectForm({ project, onSubmit, isLoading }: ProjectFormProps) {
  const [title, setTitle] = useState(project?.title || "");
  const [notes, setNotes] = useState(project?.notes || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit({ title: title.trim(), notes: notes.trim() });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Project Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="My Awesome Zine"
          required
        />
      </div>

      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Ideas, research notes, todo items..."
          className="h-32 resize-none"
        />
      </div>

      <Button
        type="submit"
        className="w-full just-ideate-primary just-ideate-primary-hover text-white"
        disabled={isLoading || !title.trim()}
      >
        {isLoading
          ? "Saving..."
          : project
            ? "Update Project"
            : "Create Project"}
      </Button>
    </form>
  );
}

interface ProjectCardProps {
  project: Project;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: { title?: string; notes?: string }) => void;
  onDelete: () => void;
  onToggleCompletion: () => void;
}

function ProjectCard({
  project,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
  onToggleCompletion,
}: ProjectCardProps) {
  const [isEditing, setIsEditing] = useState(false);

  const formatTotalTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <Card
      className={`cursor-pointer transition-all duration-200 rounded-xl ${
        isSelected
          ? "border-2 border-[#2b3012] bg-[#f0f2e8]"
          : "hover:shadow-lg border border-gray-200"
      } ${project.completedAt ? "opacity-60" : ""}`}
    >
      <CardContent
        className="p-6 rounded-xl"
        onClick={(e) => {
          // Don't trigger selection if clicking on action buttons
          const target = e.target as HTMLElement;
          if (target.closest("button") || target.closest("a")) {
            return;
          }
          onSelect();
        }}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2 flex-1">
            <button
              className={`w-5 h-5 flex items-center justify-center transition-colors ${
                project.completedAt
                  ? "text-[#2b3012]"
                  : "text-gray-300 hover:text-[#2b3012]"
              }`}
              onClick={(e) => {
                e.stopPropagation();
                onToggleCompletion();
              }}
            >
              <Check className="w-5 h-5" />
            </button>
            <h3
              className={`font-semibold line-clamp-1 ${
                project.completedAt
                  ? "text-gray-500 line-through"
                  : "text-gray-900"
              }`}
            >
              {project.title}
            </h3>
          </div>
          <div className="flex items-center space-x-1 ml-2">
            <Link href={`/project/${project.id}/edit`}>
              <Button
                variant="ghost"
                size="sm"
                className="p-1 h-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <Edit3 className="w-3 h-3" />
              </Button>
            </Link>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-1 h-auto text-black hover:text-gray-700 font-bold"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-black border-black">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-white">
                    Delete Project
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-white/80">
                    Are you sure you want to delete "{project.title}"? This
                    action cannot be undone and you will lose all your progress
                    and focus sessions for this project.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="bg-white text-black border-white hover:bg-gray-100">
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      console.log(
                        "🗑️ Delete button clicked for project:",
                        project.id,
                      );
                      onDelete();
                    }}
                    className="bg-white text-black hover:bg-gray-100"
                  >
                    Delete Project
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {project.notes && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {project.notes}
          </p>
        )}

        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Total focus time: {formatTotalTime(project.totalMinutes)}</span>
          <span>{new Date(project.updatedAt).toLocaleDateString()}</span>
        </div>
      </CardContent>

      {isEditing && (
        <Dialog open={isEditing} onOpenChange={setIsEditing}>
          <DialogContent onClick={(e) => e.stopPropagation()}>
            <DialogHeader>
              <DialogTitle>Edit Project</DialogTitle>
            </DialogHeader>
            <ProjectForm
              project={project}
              onSubmit={(data) => {
                onUpdate(data);
                setIsEditing(false);
              }}
              isLoading={false}
            />
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
}
