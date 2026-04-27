import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/auth";
import { Navbar } from "@/components/navbar";
import { AdminLayout } from "@/components/admin-layout";
import { ProtectedRoute, AdminRoute } from "@/components/auth-routes";
import NotFound from "@/pages/not-found";

// Pages
import Landing from "@/pages/landing";
import Tarifs from "@/pages/tarifs";
import APropos from "@/pages/a-propos";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Dashboard from "@/pages/dashboard";
import Courses from "@/pages/courses";
import CourseDetail from "@/pages/course-detail";
import LessonPlayer from "@/pages/lesson-player";
import Files from "@/pages/files";
import Paiement from "@/pages/paiement";
import ConfigurerCompte from "@/pages/configurer-compte";
import MotDePasseOublie from "@/pages/mot-de-passe-oublie";

// Admin Pages
import AdminDashboard from "@/pages/admin/dashboard";
import AdminCourses from "@/pages/admin/courses";
import AdminCourseForm from "@/pages/admin/course-form";
import AdminModules from "@/pages/admin/modules";
import AdminUsers from "@/pages/admin/users";
import AdminFiles from "@/pages/admin/files";
import AdminPayments from "@/pages/admin/payments";

const queryClient = new QueryClient();

function AppContent() {
  const [location] = useLocation();
  const isAdmin = location.startsWith("/admin");

  if (isAdmin) {
    return (
      <Switch>
        <Route path="/admin">
          <AdminRoute><AdminLayout><AdminDashboard /></AdminLayout></AdminRoute>
        </Route>
        <Route path="/admin/courses">
          <AdminRoute><AdminLayout><AdminCourses /></AdminLayout></AdminRoute>
        </Route>
        <Route path="/admin/courses/new">
          <AdminRoute><AdminLayout><AdminCourseForm /></AdminLayout></AdminRoute>
        </Route>
        <Route path="/admin/courses/:courseId/edit">
          <AdminRoute><AdminLayout><AdminCourseForm /></AdminLayout></AdminRoute>
        </Route>
        <Route path="/admin/courses/:courseId/modules">
          <AdminRoute><AdminLayout><AdminModules /></AdminLayout></AdminRoute>
        </Route>
        <Route path="/admin/users">
          <AdminRoute><AdminLayout><AdminUsers /></AdminLayout></AdminRoute>
        </Route>
        <Route path="/admin/payments">
          <AdminRoute><AdminLayout><AdminPayments /></AdminLayout></AdminRoute>
        </Route>
        <Route path="/admin/files">
          <AdminRoute><AdminLayout><AdminFiles /></AdminLayout></AdminRoute>
        </Route>
      </Switch>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 flex flex-col">
        <Switch>
          <Route path="/" component={Landing} />
          <Route path="/tarifs" component={Tarifs} />
          <Route path="/a-propos" component={APropos} />
          <Route path="/login" component={Login} />
          <Route path="/register" component={Register} />
          <Route path="/paiement" component={Paiement} />
          <Route path="/configurer-compte" component={ConfigurerCompte} />
          <Route path="/mot-de-passe-oublie" component={MotDePasseOublie} />

          <Route path="/dashboard">
            <ProtectedRoute><Dashboard /></ProtectedRoute>
          </Route>
          <Route path="/courses">
            <ProtectedRoute><Courses /></ProtectedRoute>
          </Route>
          <Route path="/courses/:courseId">
            <ProtectedRoute><CourseDetail /></ProtectedRoute>
          </Route>
          <Route path="/lesson/:lessonId">
            <ProtectedRoute><LessonPlayer /></ProtectedRoute>
          </Route>
          <Route path="/files">
            <ProtectedRoute><Files /></ProtectedRoute>
          </Route>

          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
