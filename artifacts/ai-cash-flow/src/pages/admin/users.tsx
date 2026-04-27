import { useState, useEffect } from "react";
import { useListUsers, useUpdateUser, getListUsersQueryKey } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { useQueryClient } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Loader2, Eye, CheckCircle, Clock, BookOpen, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

type ProgressSummary = {
  userId: number;
  name: string;
  email: string;
  lessonsCompleted: number;
  lessonsInProgress: number;
  lastActivity: string | null;
  currentModule: string | null;
  currentCourse: string | null;
};

type UserProgress = {
  progressId: number;
  completed: boolean;
  completedAt: string;
  lesson: { id: number; title: string; order: number };
  module: { id: number; title: string; order: number };
  course: { id: number; title: string };
};

const API_BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

export default function AdminUsers() {
  const { data: users, isLoading } = useListUsers();
  const updateUser = useUpdateUser();
  const { toast } = useToast();
  const { token } = useAuth();
  const queryClient = useQueryClient();

  const [progressSummary, setProgressSummary] = useState<ProgressSummary[]>([]);
  const [selectedUserProgress, setSelectedUserProgress] = useState<UserProgress[] | null>(null);
  const [selectedUserName, setSelectedUserName] = useState("");
  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(false);

  useEffect(() => {
    if (!token) return;
    fetch(`${API_BASE}/api/progress/admin/summary`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => setProgressSummary(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, [token]);

  const handleViewProgress = async (userId: number, name: string) => {
    setSelectedUserName(name);
    setIsProgressModalOpen(true);
    setLoadingProgress(true);
    try {
      const res = await fetch(`${API_BASE}/api/progress/admin/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setSelectedUserProgress(Array.isArray(data) ? data : []);
    } catch {
      setSelectedUserProgress([]);
    } finally {
      setLoadingProgress(false);
    }
  };

  const handleUpdateRole = async (userId: number, role: "admin" | "student") => {
    try {
      await updateUser.mutateAsync({ userId, data: { role } });
      queryClient.invalidateQueries({ queryKey: getListUsersQueryKey() });
      toast({ title: "Rôle mis à jour" });
    } catch {
      toast({ title: "Erreur lors de la mise à jour", variant: "destructive" });
    }
  };

  const handleUpdatePaidStatus = async (userId: number, hasPaid: boolean) => {
    try {
      await updateUser.mutateAsync({ userId, data: { hasPaid } });
      queryClient.invalidateQueries({ queryKey: getListUsersQueryKey() });
      toast({ title: "Statut de paiement mis à jour" });
    } catch {
      toast({ title: "Erreur lors de la mise à jour", variant: "destructive" });
    }
  };

  const getProgressForUser = (userId: number) =>
    progressSummary.find(p => p.userId === userId);

  if (isLoading) {
    return <div className="flex justify-center p-8"><Loader2 className="animate-spin w-8 h-8 text-primary" /></div>;
  }

  // Group selected progress by course then module
  const groupedProgress = selectedUserProgress
    ? selectedUserProgress.reduce((acc, p) => {
        const key = p.course.title;
        if (!acc[key]) acc[key] = {};
        const mKey = p.module.title;
        if (!acc[key][mKey]) acc[key][mKey] = [];
        acc[key][mKey].push(p);
        return acc;
      }, {} as Record<string, Record<string, UserProgress[]>>)
    : {};

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-7xl space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestion des élèves</h1>
          <p className="text-muted-foreground">{users?.length || 0} utilisateurs inscrits</p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card/50 border rounded-xl p-4">
          <BookOpen className="w-5 h-5 text-primary mb-2" />
          <div className="text-2xl font-black">{users?.filter(u => u.role === 'student').length || 0}</div>
          <div className="text-xs text-muted-foreground">Élèves inscrits</div>
        </div>
        <div className="bg-card/50 border rounded-xl p-4">
          <CheckCircle className="w-5 h-5 text-emerald-500 mb-2" />
          <div className="text-2xl font-black">{users?.filter(u => u.hasPaid).length || 0}</div>
          <div className="text-xs text-muted-foreground">Accès payant</div>
        </div>
        <div className="bg-card/50 border rounded-xl p-4">
          <TrendingUp className="w-5 h-5 text-violet-500 mb-2" />
          <div className="text-2xl font-black">{progressSummary.reduce((a, p) => a + p.lessonsCompleted, 0)}</div>
          <div className="text-xs text-muted-foreground">Leçons complétées</div>
        </div>
        <div className="bg-card/50 border rounded-xl p-4">
          <Clock className="w-5 h-5 text-amber-500 mb-2" />
          <div className="text-2xl font-black">{progressSummary.filter(p => p.lastActivity).length}</div>
          <div className="text-xs text-muted-foreground">Élèves actifs</div>
        </div>
      </div>

      <div className="border rounded-xl bg-card/50 backdrop-blur overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Téléphone</TableHead>
              <TableHead>Inscrit le</TableHead>
              <TableHead>Progression</TableHead>
              <TableHead>Module actuel</TableHead>
              <TableHead>Rôle</TableHead>
              <TableHead>Accès</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users?.map((user) => {
              const prog = getProgressForUser(user.id);
              const total = (prog?.lessonsCompleted || 0) + (prog?.lessonsInProgress || 0);
              const pct = total > 0 ? Math.round(((prog?.lessonsCompleted || 0) / total) * 100) : 0;
              return (
                <TableRow key={user.id}>
                  <TableCell className="font-semibold whitespace-nowrap">
                    <div>{(user as any).firstName && (user as any).lastName ? `${(user as any).firstName} ${(user as any).lastName}` : user.name}</div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">{user.email}</TableCell>
                  <TableCell className="text-sm text-muted-foreground font-mono">
                    {(user as any).phone || <span className="italic text-xs">—</span>}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(user.createdAt), "d MMM yyyy", { locale: fr })}
                  </TableCell>
                  <TableCell>
                    {prog ? (
                      <div className="space-y-1 min-w-[100px]">
                        <div className="text-xs text-muted-foreground">{prog.lessonsCompleted} leçons</div>
                        <Progress value={pct} className="h-1.5" />
                        <div className="text-xs font-medium">{pct}%</div>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">Pas commencé</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {prog?.currentModule ? (
                      <div className="text-xs">
                        <div className="font-medium truncate max-w-[140px]">{prog.currentModule}</div>
                        <div className="text-muted-foreground truncate max-w-[140px]">{prog.currentCourse}</div>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={user.role}
                      onValueChange={(val: "admin" | "student") => handleUpdateRole(user.id, val)}
                    >
                      <SelectTrigger className="w-[110px] h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="student">Élève</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={user.hasPaid}
                        onCheckedChange={(checked) => handleUpdatePaidStatus(user.id, checked)}
                      />
                      {user.hasPaid ? (
                        <Badge className="bg-emerald-500/20 text-emerald-600 border-emerald-200 text-xs">Payé</Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">Gratuit</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1.5 text-xs"
                      onClick={() => handleViewProgress(user.id, user.name)}
                    >
                      <Eye className="w-3.5 h-3.5" /> Progression
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
            {!users?.length && (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-12 text-muted-foreground">
                  Aucun utilisateur pour le moment.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Progress Modal */}
      <Dialog open={isProgressModalOpen} onOpenChange={setIsProgressModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Progression de {selectedUserName}</DialogTitle>
          </DialogHeader>
          {loadingProgress ? (
            <div className="flex justify-center py-8">
              <Loader2 className="animate-spin w-6 h-6 text-primary" />
            </div>
          ) : selectedUserProgress?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Cet élève n'a pas encore commencé de leçon.
            </div>
          ) : (
            <div className="space-y-6 pt-2">
              {Object.entries(groupedProgress).map(([courseTitle, modules]) => (
                <div key={courseTitle}>
                  <div className="text-sm font-bold text-primary mb-3">{courseTitle}</div>
                  <div className="space-y-3">
                    {Object.entries(modules).map(([moduleTitle, lessons]) => {
                      const done = lessons.filter(l => l.completed).length;
                      const pct = Math.round((done / lessons.length) * 100);
                      return (
                        <div key={moduleTitle} className="bg-background border rounded-xl p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="font-semibold text-sm">{moduleTitle}</div>
                            <div className="text-xs text-muted-foreground">{done}/{lessons.length} leçons</div>
                          </div>
                          <Progress value={pct} className="h-2 mb-3" />
                          <div className="space-y-1">
                            {lessons.sort((a, b) => a.lesson.order - b.lesson.order).map(l => (
                              <div key={l.progressId} className="flex items-center gap-2 text-xs">
                                {l.completed
                                  ? <CheckCircle className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                                  : <Clock className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                                }
                                <span className={l.completed ? "text-foreground" : "text-muted-foreground"}>
                                  {l.lesson.title}
                                </span>
                                {l.completed && l.completedAt && (
                                  <span className="ml-auto text-muted-foreground">
                                    {format(new Date(l.completedAt), "d MMM", { locale: fr })}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
