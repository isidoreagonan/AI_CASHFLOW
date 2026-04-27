import { useState } from "react";
import { useListCourses, useDeleteCourse, useUpdateCourse, useGrantCourseAccess, getListCoursesQueryKey } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Loader2, Plus, Edit, Trash2, List, Eye, EyeOff,
  BookOpen, Search, Globe, Lock, UserPlus, Mail, User,
} from "lucide-react";

export default function AdminCourses() {
  const { data: courses, isLoading } = useListCourses();
  const deleteCourse = useDeleteCourse();
  const updateCourse = useUpdateCourse();
  const grantAccess = useGrantCourseAccess();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const [grantDialog, setGrantDialog] = useState<{ courseId: number; courseTitle: string } | null>(null);
  const [grantEmail, setGrantEmail] = useState("");
  const [grantFirstName, setGrantFirstName] = useState("");
  const [grantLastName, setGrantLastName] = useState("");

  const filtered = courses?.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.description?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteCourse.mutateAsync({ courseId: deleteId });
      queryClient.invalidateQueries({ queryKey: getListCoursesQueryKey() });
      toast({ title: "Formation supprimée" });
    } catch {
      toast({ title: "Erreur lors de la suppression", variant: "destructive" });
    }
    setDeleteId(null);
  };

  const handleTogglePublish = async (course: any) => {
    setTogglingId(course.id);
    try {
      await updateCourse.mutateAsync({
        courseId: course.id,
        data: { ...course, isPublished: !course.isPublished },
      });
      queryClient.invalidateQueries({ queryKey: getListCoursesQueryKey() });
      toast({
        title: course.isPublished ? "Formation dépubliée" : "Formation publiée !",
        description: course.isPublished
          ? "La formation est maintenant en brouillon."
          : "Les étudiants peuvent maintenant y accéder.",
      });
    } catch {
      toast({ title: "Erreur", variant: "destructive" });
    }
    setTogglingId(null);
  };

  const openGrantDialog = (course: any) => {
    setGrantDialog({ courseId: course.id, courseTitle: course.title });
    setGrantEmail("");
    setGrantFirstName("");
    setGrantLastName("");
  };

  const handleGrantAccess = async () => {
    if (!grantDialog || !grantEmail.trim()) return;
    try {
      const result = await grantAccess.mutateAsync({
        courseId: grantDialog.courseId,
        data: {
          email: grantEmail.trim(),
          firstName: grantFirstName.trim() || undefined,
          lastName: grantLastName.trim() || undefined,
        },
      });
      toast({
        title: "Accès accordé !",
        description: result.message,
      });
      setGrantDialog(null);
    } catch (err: any) {
      const msg = err?.response?.data?.error || "Une erreur est survenue";
      toast({ title: msg, variant: "destructive" });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="animate-spin w-8 h-8 text-primary" />
      </div>
    );
  }

  const published = courses?.filter(c => c.isPublished).length || 0;
  const drafts = (courses?.length || 0) - published;

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Formations</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {published} publiées · {drafts} brouillons
          </p>
        </div>
        <Link href="/admin/courses/new">
          <Button className="bg-primary text-white hover:bg-primary/90 font-bold gap-2 shadow-sm">
            <Plus className="w-4 h-4" /> Créer une formation
          </Button>
        </Link>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm bg-white">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-black">{courses?.length || 0}</p>
            <p className="text-xs text-muted-foreground font-semibold mt-1 uppercase tracking-wide">Total</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-white">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-black text-green-600">{published}</p>
            <p className="text-xs text-muted-foreground font-semibold mt-1 uppercase tracking-wide">Publiées</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-white">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-black text-amber-600">{drafts}</p>
            <p className="text-xs text-muted-foreground font-semibold mt-1 uppercase tracking-wide">Brouillons</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher une formation..."
          className="pl-9 bg-white border-0 shadow-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Course cards grid */}
      {filtered.length === 0 ? (
        <Card className="border-0 shadow-sm bg-white p-12 text-center">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
            <BookOpen className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-lg font-bold mb-2">
            {search ? "Aucun résultat" : "Aucune formation"}
          </h3>
          <p className="text-muted-foreground text-sm mb-5">
            {search ? "Modifie ta recherche ou crée une nouvelle formation." : "Crée ta première formation pour commencer."}
          </p>
          {!search && (
            <Link href="/admin/courses/new">
              <Button className="bg-primary text-white hover:bg-primary/90 font-bold gap-2">
                <Plus className="w-4 h-4" /> Créer une formation
              </Button>
            </Link>
          )}
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((course) => (
            <Card key={course.id} className="border-0 shadow-sm bg-white overflow-hidden group hover:shadow-md transition-shadow">
              {/* Thumbnail */}
              <div className="aspect-video relative overflow-hidden bg-muted">
                {course.thumbnail ? (
                  <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-violet-100">
                    <BookOpen className="w-10 h-10 text-primary/30" />
                  </div>
                )}
                <div className="absolute top-2 left-2">
                  {course.isPublished ? (
                    <Badge className="bg-green-500 text-white border-0 shadow font-semibold text-xs gap-1">
                      <Globe className="h-3 w-3" /> Publiée
                    </Badge>
                  ) : (
                    <Badge className="bg-amber-500 text-white border-0 shadow font-semibold text-xs gap-1">
                      <Lock className="h-3 w-3" /> Brouillon
                    </Badge>
                  )}
                </div>
              </div>

              <CardContent className="p-4 space-y-3">
                <div>
                  <h3 className="font-bold text-sm leading-snug line-clamp-2">{course.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{course.description}</p>
                </div>

                <div className="text-xs text-muted-foreground font-semibold">
                  Prix : <span className="text-foreground">{course.price > 0 ? `${course.price.toLocaleString("fr-FR")} FCFA` : "Gratuit"}</span>
                </div>

                {/* Grant access button — prominent */}
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full text-xs font-bold gap-1.5 border-violet-200 text-violet-700 hover:bg-violet-50 hover:border-violet-400"
                  onClick={() => openGrantDialog(course)}
                >
                  <UserPlus className="h-3.5 w-3.5" /> Donner l'accès
                </Button>

                {/* Other actions */}
                <div className="flex gap-2 pt-1">
                  <Button
                    size="sm"
                    variant={course.isPublished ? "outline" : "default"}
                    className={`flex-1 text-xs font-bold gap-1.5 ${
                      course.isPublished
                        ? "border-amber-200 text-amber-700 hover:bg-amber-50"
                        : "bg-green-600 hover:bg-green-700 text-white"
                    }`}
                    onClick={() => handleTogglePublish(course)}
                    disabled={togglingId === course.id}
                  >
                    {togglingId === course.id ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : course.isPublished ? (
                      <><EyeOff className="h-3 w-3" /> Dépublier</>
                    ) : (
                      <><Eye className="h-3 w-3" /> Publier</>
                    )}
                  </Button>

                  <Link href={`/admin/courses/${course.id}/modules`}>
                    <Button size="sm" variant="outline" className="text-xs gap-1 px-2.5" title="Modules & leçons">
                      <List className="h-3.5 w-3.5" /> Modules
                    </Button>
                  </Link>

                  <Link href={`/admin/courses/${course.id}/edit`}>
                    <Button size="sm" variant="outline" className="px-2.5" title="Modifier">
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                  </Link>

                  <Button
                    size="sm"
                    variant="outline"
                    className="px-2.5 text-destructive hover:bg-destructive/10 border-destructive/20"
                    title="Supprimer"
                    onClick={() => setDeleteId(course.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette formation ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. La formation, tous ses modules et toutes ses leçons seront définitivement supprimés.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteCourse.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Supprimer définitivement"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Grant Access Dialog */}
      <Dialog open={!!grantDialog} onOpenChange={(open) => !open && setGrantDialog(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-black text-lg">
              <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
                <UserPlus className="w-4 h-4 text-violet-700" />
              </div>
              Donner l'accès
            </DialogTitle>
            <DialogDescription className="text-sm">
              Accordez l'accès à <strong>{grantDialog?.courseTitle}</strong> sans paiement.
              <br />
              <span className="text-violet-600 font-medium mt-1 block">
                Si l'email n'a pas encore de compte, un email d'invitation sera envoyé pour qu'il crée son mot de passe.
              </span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="grant-email" className="text-xs font-bold uppercase tracking-wide">
                Email *
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="grant-email"
                  type="email"
                  value={grantEmail}
                  onChange={(e) => setGrantEmail(e.target.value)}
                  placeholder="email@exemple.com"
                  className="pl-9 bg-gray-50 border-0"
                  autoFocus
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Nom (optionnel — si nouveau compte)
              </Label>
              <div className="grid grid-cols-2 gap-2">
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={grantFirstName}
                    onChange={(e) => setGrantFirstName(e.target.value)}
                    placeholder="Prénom"
                    className="pl-9 bg-gray-50 border-0"
                  />
                </div>
                <Input
                  value={grantLastName}
                  onChange={(e) => setGrantLastName(e.target.value)}
                  placeholder="Nom"
                  className="bg-gray-50 border-0"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setGrantDialog(null)} className="font-semibold">
              Annuler
            </Button>
            <Button
              onClick={handleGrantAccess}
              disabled={!grantEmail.trim() || grantAccess.isPending}
              className="bg-violet-600 hover:bg-violet-700 text-white font-black gap-2"
            >
              {grantAccess.isPending ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> En cours...</>
              ) : (
                <><UserPlus className="h-4 w-4" /> Accorder l'accès</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
