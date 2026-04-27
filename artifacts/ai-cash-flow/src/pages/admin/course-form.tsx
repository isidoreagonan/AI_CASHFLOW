import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useGetCourse, useCreateCourse, useUpdateCourse, getListCoursesQueryKey } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft, BookOpen, Globe, Lock, Image, AlignLeft, DollarSign, Eye, Layers } from "lucide-react";
import { Link } from "wouter";

export default function AdminCourseForm() {
  const { courseId } = useParams();
  const isEditing = !!courseId && courseId !== "new";
  const parsedCourseId = isEditing ? parseInt(courseId, 10) : 0;

  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [price, setPrice] = useState(10000);
  const [isPublished, setIsPublished] = useState(false);
  const [activeTab, setActiveTab] = useState<"info" | "media" | "settings">("info");

  const { data: course, isLoading: isCourseLoading } = useGetCourse(parsedCourseId, {
    query: { enabled: isEditing },
  });

  const createCourse = useCreateCourse();
  const updateCourse = useUpdateCourse();

  useEffect(() => {
    if (isEditing && course) {
      setTitle(course.title);
      setDescription(course.description);
      setThumbnail(course.thumbnail || "");
      setPrice(course.price);
      setIsPublished(course.isPublished);
    }
  }, [course, isEditing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast({ title: "Le titre est requis", variant: "destructive" });
      return;
    }
    try {
      if (isEditing) {
        await updateCourse.mutateAsync({
          courseId: parsedCourseId,
          data: { title, description, thumbnail, price: Number(price), isPublished },
        });
        toast({ title: "Formation mise à jour ✓" });
      } else {
        const result = await createCourse.mutateAsync({
          data: { title, description, thumbnail, price: Number(price), isPublished },
        });
        toast({ title: "Formation créée avec succès !" });
        queryClient.invalidateQueries({ queryKey: getListCoursesQueryKey() });
        // Redirect to modules editor after creation
        setLocation(`/admin/courses/${result.id}/modules`);
        return;
      }
      queryClient.invalidateQueries({ queryKey: getListCoursesQueryKey() });
      setLocation("/admin/courses");
    } catch {
      toast({ title: "Erreur lors de la sauvegarde", variant: "destructive" });
    }
  };

  if (isEditing && isCourseLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="animate-spin w-8 h-8 text-primary" />
      </div>
    );
  }

  const isPending = createCourse.isPending || updateCourse.isPending;

  const tabs = [
    { id: "info", label: "Informations", icon: AlignLeft },
    { id: "media", label: "Média", icon: Image },
    { id: "settings", label: "Paramètres", icon: Layers },
  ] as const;

  return (
    <div className="p-6 md:p-8 max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/admin/courses">
          <Button variant="ghost" size="icon" className="rounded-xl">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-black tracking-tight">
            {isEditing ? "Modifier la formation" : "Nouvelle formation"}
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {isEditing ? "Mets à jour les informations de ta formation" : "Crée une nouvelle formation pour tes étudiants"}
          </p>
        </div>
        {/* Status badge */}
        <div className="hidden sm:block">
          {isPublished ? (
            <Badge className="bg-green-100 text-green-700 border border-green-200 font-semibold gap-1.5">
              <Globe className="h-3 w-3" /> Publiée
            </Badge>
          ) : (
            <Badge className="bg-amber-100 text-amber-700 border border-amber-200 font-semibold gap-1.5">
              <Lock className="h-3 w-3" /> Brouillon
            </Badge>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid md:grid-cols-3 gap-6">
          {/* Left column — main form */}
          <div className="md:col-span-2 space-y-5">
            {/* Tabs */}
            <div className="flex gap-1 p-1 bg-muted rounded-xl w-fit">
              {tabs.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    activeTab === id
                      ? "bg-white shadow text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </button>
              ))}
            </div>

            {/* Tab: Informations */}
            {activeTab === "info" && (
              <Card className="border-0 shadow-sm bg-white">
                <CardContent className="p-6 space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="font-bold text-sm">
                      Titre de la formation <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Ex: IA CASH FLOW — Maîtrise le contenu IA faceless"
                      className="text-base font-medium border-0 bg-muted/40 focus-visible:ring-primary"
                      required
                    />
                    <p className="text-xs text-muted-foreground">Le titre accrocheur qui donnera envie à tes étudiants</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="font-bold text-sm">Description</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Décris ce que les étudiants vont apprendre, les résultats attendus, le contenu de la formation..."
                      rows={8}
                      className="border-0 bg-muted/40 focus-visible:ring-primary resize-none"
                    />
                    <p className="text-xs text-muted-foreground">Sois précis et inspirant. Les étudiants lisent cette description avant de s'inscrire.</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tab: Média */}
            {activeTab === "media" && (
              <Card className="border-0 shadow-sm bg-white">
                <CardContent className="p-6 space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="thumbnail" className="font-bold text-sm">URL de l'image de couverture</Label>
                    <Input
                      id="thumbnail"
                      value={thumbnail}
                      onChange={(e) => setThumbnail(e.target.value)}
                      placeholder="https://exemple.com/image.jpg"
                      className="border-0 bg-muted/40 focus-visible:ring-primary"
                    />
                    <p className="text-xs text-muted-foreground">
                      Entre l'URL directe d'une image (JPG, PNG, WebP). Idéalement 16:9 (ex: 1280×720px).
                      Tu peux héberger sur <span className="font-semibold text-primary">imgbb.com</span>, <span className="font-semibold text-primary">postimages.org</span> ou autre service gratuit.
                    </p>
                  </div>

                  {/* Thumbnail preview */}
                  <div className="aspect-video w-full rounded-xl overflow-hidden border-2 border-dashed border-border bg-muted/30 flex items-center justify-center">
                    {thumbnail ? (
                      <img
                        src={thumbnail}
                        alt="Aperçu"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="text-center p-8">
                        <BookOpen className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                        <p className="text-sm text-muted-foreground font-medium">Aperçu de l'image</p>
                        <p className="text-xs text-muted-foreground">Entre une URL d'image ci-dessus</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tab: Paramètres */}
            {activeTab === "settings" && (
              <Card className="border-0 shadow-sm bg-white">
                <CardContent className="p-6 space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="price" className="font-bold text-sm flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-green-600" /> Prix (FCFA)
                    </Label>
                    <div className="relative">
                      <Input
                        id="price"
                        type="number"
                        min="0"
                        step="500"
                        value={price}
                        onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                        className="border-0 bg-muted/40 focus-visible:ring-primary pr-16"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground">FCFA</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Le prix de vente de ta formation. Actuellement : <strong>{price.toLocaleString("fr-FR")} FCFA</strong></p>
                  </div>

                  <div className="rounded-xl border border-border p-4 flex items-center justify-between bg-muted/20">
                    <div className="space-y-1">
                      <Label htmlFor="isPublished" className="font-bold text-sm cursor-pointer">
                        Publier la formation
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        {isPublished
                          ? "✓ Visible par tous les étudiants ayant accès"
                          : "En brouillon — non visible par les étudiants"}
                      </p>
                    </div>
                    <Switch
                      id="isPublished"
                      checked={isPublished}
                      onCheckedChange={setIsPublished}
                    />
                  </div>

                  {!isPublished && (
                    <div className="rounded-xl bg-amber-50 border border-amber-100 p-4 text-sm text-amber-800">
                      <strong>Brouillon :</strong> La formation ne sera pas visible par les étudiants tant qu'elle n'est pas publiée. Tu peux la préparer entièrement, puis la publier quand elle est prête.
                    </div>
                  )}
                  {isPublished && (
                    <div className="rounded-xl bg-green-50 border border-green-100 p-4 text-sm text-green-800">
                      <strong>Publiée :</strong> Les étudiants avec un accès payant pourront voir et suivre cette formation immédiatement après la sauvegarde.
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right column — summary + actions */}
          <div className="space-y-4">
            {/* Publish panel */}
            <Card className="border-0 shadow-sm bg-white">
              <CardContent className="p-5 space-y-4">
                <h3 className="font-bold text-sm">Publication</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Statut</span>
                    {isPublished ? (
                      <Badge className="bg-green-100 text-green-700 border-0 font-semibold">Publiée</Badge>
                    ) : (
                      <Badge className="bg-amber-100 text-amber-700 border-0 font-semibold">Brouillon</Badge>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Prix</span>
                    <span className="font-bold">{price.toLocaleString("fr-FR")} FCFA</span>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <Button
                    type="submit"
                    disabled={isPending}
                    className="w-full bg-primary hover:bg-primary/90 text-white font-bold"
                  >
                    {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {isEditing ? "Sauvegarder" : "Créer la formation"}
                  </Button>
                  <Link href="/admin/courses">
                    <Button variant="ghost" type="button" className="w-full">
                      Annuler
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Checklist */}
            <Card className="border-0 shadow-sm bg-white">
              <CardContent className="p-5 space-y-3">
                <h3 className="font-bold text-sm">Checklist</h3>
                <div className="space-y-2">
                  {[
                    { label: "Titre renseigné", done: !!title.trim() },
                    { label: "Description ajoutée", done: !!description.trim() },
                    { label: "Image de couverture", done: !!thumbnail.trim() },
                    { label: "Prix défini", done: price > 0 },
                  ].map(({ label, done }) => (
                    <div key={label} className="flex items-center gap-2 text-sm">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${done ? "bg-green-100" : "bg-muted"}`}>
                        {done && <span className="text-green-600 text-xs">✓</span>}
                      </div>
                      <span className={done ? "text-foreground" : "text-muted-foreground"}>{label}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Next step hint for new course */}
            {!isEditing && (
              <Card className="border-0 shadow-sm bg-primary/5 border border-primary/10">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <Eye className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-bold text-primary">Prochaine étape</p>
                      <p className="text-xs text-primary/70 mt-1">
                        Après avoir créé ta formation, tu seras redirigé vers l'éditeur de modules pour ajouter tes leçons vidéo.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
