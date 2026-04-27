import { useState, useRef, useEffect } from "react";
import { useParams, Link } from "wouter";
import {
  useListModules,
  useCreateModule,
  useUpdateModule,
  useDeleteModule,
  useListLessons,
  useCreateLesson,
  useUpdateLesson,
  useDeleteLesson,
  useGetCourse,
  getListModulesQueryKey,
  getListLessonsQueryKey,
} from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { useVideoUpload } from "@/hooks/use-video-upload";
import { NoSleepController } from "@/hooks/use-no-sleep";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RichTextEditor } from "@/components/rich-text-editor";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Loader2, Plus, Edit2, Trash2, ArrowLeft, Video, Music, Upload, Globe, Link2, CheckCircle2, X } from "lucide-react";

const VIDEO_TYPES = [
  { value: "youtube", label: "Lien YouTube", icon: Globe, color: "text-red-500", hint: "Colle le lien YouTube (ex: https://youtube.com/watch?v=...)" },
  { value: "vimeo", label: "Lien Vimeo", icon: Link2, color: "text-blue-500", hint: "Colle le lien Vimeo de ta vidéo" },
  { value: "upload", label: "Upload depuis PC / Téléphone", icon: Upload, color: "text-violet-500", hint: "Uploade une vidéo directement depuis ton appareil" },
  { value: "audio", label: "Fichier Audio", icon: Music, color: "text-amber-500", hint: "URL vers ton fichier audio (MP3, WAV...)" },
  { value: "embed", label: "Embed / Autre", icon: Video, color: "text-emerald-500", hint: "URL ou code embed d'une autre plateforme" },
];

function getTypeInfo(type: string) {
  return VIDEO_TYPES.find(t => t.value === type) || VIDEO_TYPES[0];
}

export default function AdminModules() {
  const { courseId } = useParams();
  const parsedCourseId = parseInt(courseId || "0", 10);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: course, isLoading: isCourseLoading } = useGetCourse(parsedCourseId, {
    query: { enabled: !!parsedCourseId },
  });
  const { data: modules, isLoading: isModulesLoading } = useListModules(parsedCourseId, {
    query: { enabled: !!parsedCourseId },
  });

  const createModule = useCreateModule();
  const updateModule = useUpdateModule();
  const deleteModule = useDeleteModule();

  const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<any>(null);
  const [moduleForm, setModuleForm] = useState({ title: "", description: "", order: 1 });

  const handleOpenModuleModal = (module?: any) => {
    if (module) {
      setEditingModule(module);
      setModuleForm({ title: module.title, description: module.description, order: module.order });
    } else {
      setEditingModule(null);
      setModuleForm({ title: "", description: "", order: (modules?.length || 0) + 1 });
    }
    setIsModuleModalOpen(true);
  };

  const handleModuleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingModule) {
        await updateModule.mutateAsync({ moduleId: editingModule.id, data: moduleForm });
        toast({ title: "Module mis à jour ✓" });
      } else {
        await createModule.mutateAsync({ courseId: parsedCourseId, data: moduleForm });
        toast({ title: "Module créé ✓" });
      }
      queryClient.invalidateQueries({ queryKey: getListModulesQueryKey(parsedCourseId) });
      setIsModuleModalOpen(false);
    } catch {
      toast({ title: "Erreur lors de la sauvegarde", variant: "destructive" });
    }
  };

  const handleDeleteModule = async (id: number) => {
    if (!confirm("Supprimer ce module et toutes ses leçons ?")) return;
    try {
      await deleteModule.mutateAsync({ moduleId: id });
      queryClient.invalidateQueries({ queryKey: getListModulesQueryKey(parsedCourseId) });
      toast({ title: "Module supprimé" });
    } catch {
      toast({ title: "Erreur lors de la suppression", variant: "destructive" });
    }
  };

  if (isCourseLoading || isModulesLoading) {
    return <div className="flex justify-center p-8"><Loader2 className="animate-spin w-8 h-8 text-primary" /></div>;
  }

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-5xl space-y-6">
      <div className="flex items-center gap-4 border-b pb-6">
        <Link href="/admin/courses">
          <Button variant="outline" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div className="flex-1 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Modules de la formation</h1>
            <p className="text-muted-foreground">{course?.title}</p>
          </div>
          <Button onClick={() => handleOpenModuleModal()} className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" /> Nouveau module
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {modules?.length ? (
          <Accordion type="multiple" className="space-y-4">
            {[...modules].sort((a, b) => a.order - b.order).map((module) => (
              <AccordionItem key={module.id} value={`module-${module.id}`} className="border rounded-xl bg-card/40 backdrop-blur px-4">
                <div className="flex items-center justify-between py-4">
                  <AccordionTrigger className="hover:no-underline flex-1 py-0 justify-start">
                    <div className="flex items-center gap-4">
                      <span className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black text-sm">
                        {module.order}
                      </span>
                      <span className="text-lg font-bold">{module.title}</span>
                    </div>
                  </AccordionTrigger>
                  <div className="flex items-center gap-2 pr-4">
                    <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleOpenModuleModal(module); }}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={(e) => { e.stopPropagation(); handleDeleteModule(module.id); }}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <AccordionContent className="pt-2 pb-4 border-t">
                  <div className="pl-12">
                    {module.description && (
                      <p className="text-sm text-muted-foreground mb-4">{module.description}</p>
                    )}
                    <LessonList moduleId={module.id} />
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <div className="text-center py-16 border border-dashed rounded-xl text-muted-foreground">
            <Video className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>Aucun module créé. Commence par ajouter un module.</p>
          </div>
        )}
      </div>

      {/* Module modal */}
      <Dialog open={isModuleModalOpen} onOpenChange={setIsModuleModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingModule ? "Modifier le module" : "Nouveau module"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleModuleSubmit} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Titre du module</Label>
              <Input value={moduleForm.title} onChange={e => setModuleForm({ ...moduleForm, title: e.target.value })} placeholder="ex: Module 1 — Les bases de l'IA Faceless" required />
            </div>
            <div className="space-y-2">
              <Label>Description du module</Label>
              <Textarea value={moduleForm.description} onChange={e => setModuleForm({ ...moduleForm, description: e.target.value })}
                placeholder="Décris ce que l'élève va apprendre dans ce module..." rows={3} />
            </div>
            <div className="space-y-2">
              <Label>Numéro d'ordre</Label>
              <Input type="number" min={1} value={moduleForm.order} onChange={e => setModuleForm({ ...moduleForm, order: parseInt(e.target.value) })} required />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsModuleModalOpen(false)}>Annuler</Button>
              <Button type="submit" disabled={createModule.isPending || updateModule.isPending}>
                {(createModule.isPending || updateModule.isPending) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Sauvegarder
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function LessonList({ moduleId }: { moduleId: number }) {
  const { data: lessons, isLoading } = useListLessons(moduleId, { query: { enabled: !!moduleId } });
  const createLesson = useCreateLesson();
  const updateLesson = useUpdateLesson();
  const deleteLesson = useDeleteLesson();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [editingLesson, setEditingLesson] = useState<any>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewIsAudio, setPreviewIsAudio] = useState(false);
  // NoSleepController keeps the screen on during long uploads — works on iOS and Android
  const noSleepRef = useRef<NoSleepController | null>(null);

  const acquireWakeLock = async () => {
    if (!noSleepRef.current) {
      noSleepRef.current = new NoSleepController();
    }
    await noSleepRef.current.enable().catch(() => {});
  };

  const releaseWakeLock = () => {
    noSleepRef.current?.disable();
  };

  const { uploadVideo, isUploading, progress, error: uploadError } = useVideoUpload({
    onSuccess: (result) => {
      setLessonForm(prev => ({ ...prev, videoUrl: result.videoUrl }));
      releaseWakeLock();
      toast({ title: "Vidéo uploadée avec succès ✓" });
    },
    onError: (err) => {
      releaseWakeLock();
      toast({ title: `Erreur upload : ${err.message}`, variant: "destructive" });
    },
  });

  // Release wake lock when component unmounts or upload stops
  useEffect(() => {
    if (!isUploading) releaseWakeLock();
  }, [isUploading]);

  // Clean up preview URL when modal closes
  const clearPreview = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [lessonForm, setLessonForm] = useState({
    title: "",
    description: "",
    videoUrl: "",
    videoType: "youtube" as any,
    duration: 0,
    order: 1,
    isFree: false,
  });

  const selectedType = getTypeInfo(lessonForm.videoType);

  const detectMediaDuration = (file: File): Promise<number> =>
    new Promise((resolve) => {
      const isAudio = file.type.startsWith("audio/");
      const el = document.createElement(isAudio ? "audio" : "video");
      const url = URL.createObjectURL(file);
      el.preload = "metadata";
      el.onloadedmetadata = () => {
        const secs = el.duration;
        URL.revokeObjectURL(url);
        if (isFinite(secs) && secs > 0) {
          resolve(Math.max(1, Math.round(secs / 60)));
        } else {
          resolve(0);
        }
      };
      el.onerror = () => { URL.revokeObjectURL(url); resolve(0); };
      el.src = url;
    });

  const handleFileSelect = async (file: File) => {
    const mimeType = file.type || "";
    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    const allowedExts = ["mp4", "webm", "mov", "mkv", "avi", "m4v", "mp3", "wav", "ogg", "m4a", "aac", "flac"];
    const isAudio = mimeType.startsWith("audio/") || ["mp3", "wav", "ogg", "m4a", "aac", "flac"].includes(ext);
    const isVideoOrAudio = mimeType.startsWith("video/") || isAudio || allowedExts.includes(ext) || mimeType === "";
    if (!isVideoOrAudio) {
      toast({ title: "Format non supporté. Utilise MP4, MOV, WebM, MP3, WAV...", variant: "destructive" });
      return;
    }

    // Show local preview immediately
    clearPreview();
    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);
    setPreviewIsAudio(isAudio);
    setUploadedFileName(file.name);

    // Keep screen on during upload
    await acquireWakeLock();

    const [detectedMinutes] = await Promise.all([
      detectMediaDuration(file),
      uploadVideo(file),
    ]);
    if (detectedMinutes > 0) {
      setLessonForm(prev => ({ ...prev, duration: detectedMinutes }));
      toast({ title: `Durée détectée : ${detectedMinutes} min ✓` });
    }
  };

  const handleOpenCreate = () => {
    setEditingLesson(null);
    setLessonForm({
      title: "", description: "", videoUrl: "",
      videoType: "youtube", duration: 0,
      order: (lessons?.length || 0) + 1, isFree: false,
    });
    setUploadedFileName(null);
    clearPreview();
    setIsModalOpen(true);
  };

  const handleOpenEdit = (lesson: any) => {
    setEditingLesson(lesson);
    setLessonForm({
      title: lesson.title,
      description: lesson.description || "",
      videoUrl: lesson.videoUrl,
      videoType: lesson.videoType,
      duration: lesson.duration,
      order: lesson.order,
      isFree: lesson.isFree,
    });
    setUploadedFileName(null);
    clearPreview();
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lessonForm.videoType === "upload" && !lessonForm.videoUrl) {
      toast({ title: "Attends la fin de l'upload vidéo avant de sauvegarder", variant: "destructive" });
      return;
    }
    try {
      if (editingLesson) {
        await updateLesson.mutateAsync({ lessonId: editingLesson.id, data: lessonForm });
        toast({ title: "Leçon mise à jour ✓" });
      } else {
        await createLesson.mutateAsync({ moduleId, data: lessonForm });
        toast({ title: "Leçon créée ✓" });
      }
      queryClient.invalidateQueries({ queryKey: getListLessonsQueryKey(moduleId) });
      setIsModalOpen(false);
      setUploadedFileName(null);
      setEditingLesson(null);
    } catch {
      toast({ title: "Erreur lors de la sauvegarde", variant: "destructive" });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Supprimer cette leçon ?")) return;
    try {
      await deleteLesson.mutateAsync({ lessonId: id });
      queryClient.invalidateQueries({ queryKey: getListLessonsQueryKey(moduleId) });
      toast({ title: "Leçon supprimée" });
    } catch {
      toast({ title: "Erreur lors de la suppression", variant: "destructive" });
    }
  };

  if (isLoading) return <div className="p-4 flex justify-center"><Loader2 className="animate-spin w-4 h-4 text-primary" /></div>;

  const isPending = createLesson.isPending || updateLesson.isPending;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-sm text-muted-foreground">Leçons ({lessons?.length || 0})</h3>
        <Button variant="outline" size="sm" onClick={handleOpenCreate}>
          <Plus className="w-4 h-4 mr-2" /> Ajouter une leçon
        </Button>
      </div>

      <div className="space-y-2">
        {[...(lessons || [])].sort((a, b) => a.order - b.order).map(lesson => {
          const typeInfo = getTypeInfo(lesson.videoType);
          const Icon = typeInfo.icon;
          return (
            <div key={lesson.id} className="flex items-center justify-between p-3 bg-background border rounded-lg">
              <div className="flex items-center gap-3 min-w-0">
                <div className={`bg-muted p-2 rounded-md shrink-0 ${typeInfo.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="font-medium text-sm flex items-center gap-2 flex-wrap">
                    <span className="truncate">{lesson.title}</span>
                    {lesson.isFree && (
                      <Badge className="bg-emerald-500/20 text-emerald-600 border-emerald-200 text-[10px] shrink-0">Gratuit</Badge>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">{typeInfo.label} · {lesson.duration} min · Ordre {lesson.order}</div>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0 ml-2">
                <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(lesson)} className="text-muted-foreground hover:text-foreground">
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => handleDelete(lesson.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          );
        })}
        {!lessons?.length && (
          <div className="text-sm text-muted-foreground italic text-center py-4">
            Aucune leçon dans ce module.
          </div>
        )}
      </div>

      <Dialog open={isModalOpen} onOpenChange={open => { if (!isUploading) { setIsModalOpen(open); if (!open) { setEditingLesson(null); clearPreview(); } } }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingLesson ? "Modifier la leçon" : "Nouvelle leçon"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Titre de la leçon</Label>
              <Input value={lessonForm.title} onChange={e => setLessonForm({ ...lessonForm, title: e.target.value })}
                placeholder="ex: Comment créer une vidéo IA en 10 min" required />
            </div>

            <div className="space-y-2">
              <Label>Description / Notes de la leçon</Label>
              <RichTextEditor
                value={lessonForm.description}
                onChange={html => setLessonForm({ ...lessonForm, description: html })}
                placeholder="Ajoute ici les prompts, liens utiles, ressources de la leçon…"
                minHeight={180}
              />
            </div>

            <div className="space-y-2">
              <Label>Type de contenu</Label>
              <Select value={lessonForm.videoType} onValueChange={val => setLessonForm({ ...lessonForm, videoType: val as any, videoUrl: editingLesson?.videoType === val ? (editingLesson?.videoUrl ?? "") : "" })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {VIDEO_TYPES.map(t => (
                    <SelectItem key={t.value} value={t.value}>
                      <div className="flex items-center gap-2">
                        <t.icon className={`w-4 h-4 ${t.color}`} />
                        {t.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {lessonForm.videoType === "upload" ? (
              <div className="space-y-2">
                <Label>Fichier vidéo (depuis ton PC ou téléphone)</Label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*,audio/*"
                  className="hidden"
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) handleFileSelect(file);
                  }}
                />
                {lessonForm.videoUrl && !uploadedFileName ? (
                  <div className="rounded-xl border p-3 bg-muted/30 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span className="text-sm text-muted-foreground truncate">Vidéo existante liée</span>
                    </div>
                    <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => fileInputRef.current?.click()}>
                      Remplacer
                    </Button>
                  </div>
                ) : !uploadedFileName ? (
                  <div
                    className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${isDragging ? "border-violet-500 bg-violet-500/10" : "border-border hover:border-violet-400 hover:bg-violet-500/5"}`}
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => { e.preventDefault(); setIsDragging(false); const file = e.dataTransfer.files?.[0]; if (file) handleFileSelect(file); }}
                  >
                    <Upload className="w-8 h-8 mx-auto mb-3 text-violet-500 opacity-70" />
                    <p className="font-medium text-sm">Clique ou glisse ta vidéo ici</p>
                    <p className="text-xs text-muted-foreground mt-1">MP4, WebM, MOV, MKV, MP3, WAV — taille illimitée</p>
                  </div>
                ) : (
                  <div className="rounded-xl border overflow-hidden">
                    {/* Local preview — visible immediately before upload finishes */}
                    {previewUrl && !previewIsAudio && (
                      <div className="bg-black">
                        <video
                          src={previewUrl}
                          controls
                          playsInline
                          className="w-full max-h-48 object-contain"
                          preload="metadata"
                        />
                      </div>
                    )}
                    {previewUrl && previewIsAudio && (
                      <div className="p-3 bg-muted/30">
                        <audio controls src={previewUrl} className="w-full" preload="metadata" />
                      </div>
                    )}
                    <div className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          <Video className="w-4 h-4 text-violet-500 flex-shrink-0" />
                          <span className="text-sm font-medium truncate">{uploadedFileName}</span>
                        </div>
                        {!isUploading && lessonForm.videoUrl && <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />}
                        {!isUploading && !lessonForm.videoUrl && (
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setUploadedFileName(null); clearPreview(); setLessonForm(prev => ({ ...prev, videoUrl: "" })); }}>
                            <X className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                      {isUploading && (
                        <div className="space-y-1.5">
                          <Progress value={progress} className="h-2" />
                          <p className="text-xs text-muted-foreground text-center">
                            {progress < 20 ? "Préparation..." : progress < 95 ? `Upload en cours… ${progress}%` : "Finalisation…"}
                          </p>
                          <p className="text-[11px] text-muted-foreground text-center opacity-70">
                            Garde l'écran allumé — l'upload continue en arrière-plan
                          </p>
                        </div>
                      )}
                      {lessonForm.videoUrl && !isUploading && <p className="text-xs text-emerald-600 font-medium">✓ Vidéo uploadée et prête</p>}
                      {uploadError && <p className="text-xs text-destructive">{uploadError.message}</p>}
                      {!isUploading && (
                        <Button variant="outline" size="sm" className="w-full h-8 text-xs" onClick={() => { setUploadedFileName(null); clearPreview(); setLessonForm(prev => ({ ...prev, videoUrl: "" })); setTimeout(() => fileInputRef.current?.click(), 50); }}>
                          Changer de fichier
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <Label>{lessonForm.videoType === "audio" ? "URL du fichier audio" : "URL de la vidéo"}</Label>
                <Input
                  value={lessonForm.videoUrl}
                  onChange={e => setLessonForm({ ...lessonForm, videoUrl: e.target.value })}
                  placeholder={selectedType.hint}
                  required
                />
                <p className="text-xs text-muted-foreground">{selectedType.hint}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Durée (minutes)</Label>
                <Input type="number" min={0} value={lessonForm.duration}
                  onChange={e => setLessonForm({ ...lessonForm, duration: parseInt(e.target.value) || 0 })} />
              </div>
              <div className="space-y-2">
                <Label>Ordre</Label>
                <Input type="number" min={1} value={lessonForm.order}
                  onChange={e => setLessonForm({ ...lessonForm, order: parseInt(e.target.value) || 1 })} />
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/40 border border-border">
              <Switch checked={lessonForm.isFree} onCheckedChange={c => setLessonForm({ ...lessonForm, isFree: c })} />
              <div>
                <Label className="cursor-pointer">Aperçu gratuit</Label>
                <p className="text-xs text-muted-foreground">Les visiteurs non inscrits peuvent voir cette leçon</p>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} disabled={isUploading}>Annuler</Button>
              <Button type="submit" disabled={isPending || isUploading}>
                {(isPending || isUploading) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {isUploading ? "Upload en cours…" : editingLesson ? "Mettre à jour" : "Créer la leçon"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
