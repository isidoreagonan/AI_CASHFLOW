import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !user) {
      // Save the current page so the user returns there after login
      const shouldSave = location !== "/login" && location !== "/register" && location !== "/";
      const returnParam = shouldSave ? `?returnTo=${encodeURIComponent(location)}` : "";
      setLocation(`/login${returnParam}`);
    }
  }, [user, isLoading, location, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  return <>{children}</>;
}

export function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        const shouldSave = location !== "/login";
        const returnParam = shouldSave ? `?returnTo=${encodeURIComponent(location)}` : "";
        setLocation(`/login${returnParam}`);
      } else if (user.role !== "admin") {
        setLocation("/dashboard");
      }
    }
  }, [user, isLoading, location, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || user.role !== "admin") return null;

  return <>{children}</>;
}
