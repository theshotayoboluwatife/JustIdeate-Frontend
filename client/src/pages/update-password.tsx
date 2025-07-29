import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useLocation } from "wouter";

export default function UpdatePasswordPage() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      toast({
        variant: "destructive",
        title: "Recovery Link Expired",
        //description: error.message,
      });
    } else {
      toast({
        title: "Password updated",
        description: "Your new password has been set.",
      });
      setLocation("/"); // or redirect to login
    }

    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto py-20 px-4">
      <h1 className="text-xl font-semibold mb-4">Update your password</h1>
      <form onSubmit={handleUpdate} className="space-y-4">
        <input
          type="password"
          placeholder="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={6}
          required
          className="w-full px-4 py-2 border rounded"
        />
        <button
          type="submit"
          className="w-full bg-[#2b3012] text-white py-2 rounded"
          disabled={loading}
        >
          {loading ? "Updating..." : "Update Password"}
        </button>
      </form>
    </div>
  );
}
