import { useState, useEffect } from "react";
import {
  useGetCourse, useGetLesson, useGetMyProgress,
  useMarkLessonComplete, getGetMyProgressQueryKey,
} from "@workspace/api-client-react";
import { HtmlContent } from "@/components/html-content";
import { useParams, Link } from "wouter";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  CheckCircle2, PlayCircle, Lock, Loader2, BookOpen,
  ArrowRight, ChevronLeft, List, Video, FileText,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

function extractVideoId(url: string, type: string) {
  if (type === "youtube") {
    const m = url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/);
    return m && m[2].length === 11 ? m[2] : null;
  }
  if (type === "vimeo") {
    const m = url.match(/(?:www\.|player\.)?vimeo.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^/]*)\/videos\/|album\/(?:\d+)\/video\/|video\/|)(\d+)/i);
    return m ? m[1] : null;
  }
  return null;
}

function resolveVideoUrl(url: string) {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  // Always prepend BASE_URL so paths like /api/storage/... work on deployed app
  const base = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");
  if (url.startsWith("/")) return `${base}${url}`;
  return `${base}/${url}`;
}

function guessVideoMime(url: string): string {
  const ext = url.split("?")[0].split(".").pop()?.toLowerCase() ?? "";
  const map: Record<string, string> = {
    mp4: "video/mp4", webm: "video/webm", mov: "video/quicktime",
    mkv: "video/x-matroska", avi: "video/x-msvideo", m4v: "video/mp4",
    mp3: "audio/mpeg", wav: "audio/wav", ogg: "audio/ogg",
    m4a: "audio/mp4", aac: "audio/aac",
  };
  return map[ext] ?? "video/mp4";
}

function VideoPlayer({ lesson }: { lesson: any }) {
  if (lesson.videoType === "youtube") {
    const id = extractVideoId(lesson.videoUrl, "youtube");
    if (!id) return <p className="text-white/50 text-sm m-auto">Lien YouTube invalide.</p>;
    return (
      <iframe
        key={lesson.id}
        className="w-full h-full absolute inset-0"
        src={`https://www.youtube.com/embed/${id}?rel=0&modestbranding=1`}
        title={lesson.title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    );
  }
  if (lesson.videoType === "vimeo") {
    const id = extractVideoId(lesson.videoUrl, "vimeo");
    if (!id) return <p className="text-white/50 text-sm m-auto">Lien Vimeo invalide.</p>;
    return (
      <iframe
        key={lesson.id}
        className="w-full h-full absolute inset-0"
        src={`https://player.vimeo.com/video/${id}?autoplay=0`}
        title={lesson.title}
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
      />
    );
  }
  if (lesson.videoType === "upload") {
    const src = resolveVideoUrl(lesson.videoUrl);
    const mime = guessVideoMime(src);
    return (
      <video
        key={src}
        className="w-full h-full absolute inset-0 bg-black"
        controls
        preload="metadata"
        playsInline
        // @ts-ignore — webkit attribute for old iOS Safari
        webkit-playsinline="true"
        x-webkit-airplay="allow"
      >
        <source src={src} type={mime} />
        {/* Fallback without type for browsers that need to sniff */}
        <source src={src} />
      </video>
    );
  }
  if (lesson.videoType === "audio") {
    const src = resolveVideoUrl(lesson.videoUrl);
    const mime = guessVideoMime(src);
    return (
      <div className="w-full h-full absolute inset-0 flex flex-col items-center justify-center gap-6 p-6 bg-gradient-to-br from-primary/10 to-violet-500/10">
        <div className="w-20 h-20 rounded-3xl bg-primary/20 flex items-center justify-center">
          <PlayCircle className="w-10 h-10 text-primary" />
        </div>
        <p className="text-sm font-semibold text-foreground text-center">{lesson.title}</p>
        <audio controls preload="metadata" className="w-full max-w-md" style={{ colorScheme: "light" }}>
          <source src={src} type={mime} />
          <source src={src} />
        </audio>
      </div>
    );
  }
  if (lesson.videoType === "embed") {
    return <iframe key={lesson.id} className="w-full h-full absolute inset-0" src={lesson.videoUrl} title={lesson.title} allow="autoplay; fullscreen" allowFullScreen />;
  }
  return <p className="text-white/50 text-sm m-auto">Format vidéo non reconnu.</p>;
}

function EmptyPlayer({ hasPaid }: { hasPaid: boolean }) {
  return (
    <div className="w-full h-full absolute inset-0 flex flex-col items-center justify-center gap-4 bg-zinc-950">
      <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center">
        <PlayCircle className="w-10 h-10 text-white/20" />
      </div>
      <p className="text-white/40 text-sm font-medium">
        {hasPaid ? "Sélectionne une leçon pour commencer" : "Débloque l'accès pour regarder les leçons"}
      </p>
    </div>
  );
}

export default function CourseDetail() {
  const { courseId } = useParams();
  const parsedCourseId = parseInt(courseId || "0", 10);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [selectedLessonId, setSelectedLessonId] = useState<number | null>(null);
  const [mobileTab, setMobileTab] = useState<"video" | "programme">("programme");
  const [openModules, setOpenModules] = useState<string[]>([]);

  const { data: course, isLoading: isCourseLoading } = useGetCourse(parsedCourseId, { query: { enabled: !!parsedCourseId } });
  const { data: activeLesson, isLoading: isLessonLoading } = useGetLesson(selectedLessonId ?? 0, { query: { enabled: !!selectedLessonId } });
  const { data: progress } = useGetMyProgress({ query: { enabled: !!user } });
  const markComplete = useMarkLessonComplete();

  const hasPaid = user?.hasPaid ?? false;
  const completedLessonIds = new Set(progress?.map(p => p.lessonId) || []);
  const isCompleted = selectedLessonId ? completedLessonIds.has(selectedLessonId) : false;

  const allLessons = course?.modules?.flatMap(m => m.lessons || []) || [];
  const totalLessons = allLessons.length;
  const completedCount = allLessons.filter(l => completedLessonIds.has(l.id)).length;
  const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  useEffect(() => {
    if (course?.modules) {
      setOpenModules(course.modules.map(m => `m-${m.id}`));
    }
  }, [course]);

  const handleSelectLesson = (lessonId: number, isFree: boolean) => {
    if (!hasPaid && !isFree) return;
    setSelectedLessonId(lessonId);
    setMobileTab("video");
  };

  const handleMarkComplete = async () => {
    if (!activeLesson) return;
    try {
      await markComplete.mutateAsync({ data: { lessonId: activeLesson.id, completed: !isCompleted } });
      queryClient.invalidateQueries({ queryKey: getGetMyProgressQueryKey() });
      toast({ title: !isCompleted ? "Leçon terminée ✓" : "Progression mise à jour" });
    } catch {
      toast({ title: "Erreur lors de la mise à jour", variant: "destructive" });
    }
  };

  if (isCourseLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  if (!course) {
    return <div className="p-8 text-center">Formation introuvable.</div>;
  }

  const sortedModules = [...(course.modules || [])].sort((a, b) => a.order - b.order);

  const Sidebar = (
    <div className="flex flex-col h-full bg-zinc-950 text-zinc-100 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-white/10 shrink-0">
        <Link href="/courses" className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors mb-3">
          <ChevronLeft className="w-3.5 h-3.5" /> Mes formations
        </Link>
        <h2 className="font-black text-sm leading-snug line-clamp-2 text-white mb-3">{course.title}</h2>
        {hasPaid && totalLessons > 0 && (
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-zinc-400">
              <span>{completedCount} / {totalLessons} leçons</span>
              <span className="font-bold text-primary">{progressPercent}%</span>
            </div>
            <Progress value={progressPercent} className="h-1.5 bg-white/10 [&>div]:bg-primary" />
          </div>
        )}
        {!hasPaid && (
          <Link href="/paiement">
            <Button size="sm" className="w-full mt-2 bg-primary text-white text-xs h-8">
              Débloquer l'accès — 10 000 FCFA
            </Button>
          </Link>
        )}
      </div>

      {/* Modules list */}
      <div className="flex-1 overflow-y-auto">
        {sortedModules.length > 0 ? (
          <Accordion type="multiple" value={openModules} onValueChange={setOpenModules} className="px-2 py-3 space-y-1">
            {sortedModules.map((module, i) => {
              const moduleLessons = [...(module.lessons || [])].sort((a, b) => a.order - b.order);
              const moduleDone = moduleLessons.filter(l => completedLessonIds.has(l.id)).length;
              return (
                <AccordionItem key={module.id} value={`m-${module.id}`} className="border border-white/10 rounded-xl overflow-hidden">
                  <AccordionTrigger className="hover:no-underline px-3 py-3 hover:bg-white/5 transition-colors [&>svg]:text-zinc-400">
                    <div className="flex items-center gap-3 text-left">
                      <span className="w-7 h-7 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-black text-xs shrink-0">
                        {i + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-white leading-snug line-clamp-1">{module.title}</p>
                        <p className="text-[11px] text-zinc-500 mt-0.5">
                          {moduleDone}/{moduleLessons.length} leçon{moduleLessons.length > 1 ? "s" : ""}
                          {hasPaid && moduleDone === moduleLessons.length && moduleLessons.length > 0 && (
                            <span className="text-emerald-400 ml-1.5">✓ terminé</span>
                          )}
                        </p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-0 pb-0 border-t border-white/10">
                    <div className="py-1">
                      {moduleLessons.map((lesson, j) => {
                        const done = completedLessonIds.has(lesson.id);
                        const canAccess = hasPaid || lesson.isFree;
                        const isActive = selectedLessonId === lesson.id;
                        return (
                          <button
                            key={lesson.id}
                            onClick={() => handleSelectLesson(lesson.id, lesson.isFree)}
                            disabled={!canAccess}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-all
                              ${isActive ? "bg-primary/20 border-l-2 border-primary" : "hover:bg-white/5 border-l-2 border-transparent"}
                              ${!canAccess ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}
                            `}
                          >
                            <div className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center">
                              {!canAccess ? (
                                <Lock className="w-3.5 h-3.5 text-zinc-500" />
                              ) : done ? (
                                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                              ) : isActive ? (
                                <PlayCircle className="w-5 h-5 text-primary" />
                              ) : (
                                <span className="text-[11px] text-zinc-500 font-semibold">{j + 1}</span>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className={`text-xs font-medium leading-snug line-clamp-2 ${isActive ? "text-white" : "text-zinc-300"}`}>
                                {lesson.title}
                              </p>
                              <p className="text-[10px] text-zinc-500 mt-0.5 flex items-center gap-1.5">
                                {lesson.duration > 0 && <span>{lesson.duration} min</span>}
                                {lesson.isFree && <span className="text-emerald-400">Gratuit</span>}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                      {moduleLessons.length === 0 && (
                        <p className="text-xs text-zinc-600 italic px-4 py-3">Leçons bientôt disponibles.</p>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <BookOpen className="w-10 h-10 text-zinc-700 mb-3" />
            <p className="text-zinc-500 text-sm">Formation en cours de préparation.</p>
          </div>
        )}
      </div>
    </div>
  );

  const MainContent = (
    <div className="flex flex-col h-full overflow-y-auto bg-background">
      {/* Video area */}
      <div className="bg-black relative w-full shrink-0" style={{ paddingTop: "56.25%" }}>
        {isLessonLoading && selectedLessonId ? (
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-950">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : activeLesson && selectedLessonId ? (
          (!hasPaid && !activeLesson.isFree) ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950 gap-4 p-6">
              <div className="w-16 h-16 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center">
                <Lock className="w-8 h-8 text-primary" />
              </div>
              <div className="text-center">
                <p className="text-white font-bold mb-1">Contenu verrouillé</p>
                <p className="text-zinc-400 text-sm mb-4">Débloque l'accès à vie pour 10 000 FCFA</p>
                <Link href="/paiement">
                  <Button className="bg-primary text-white font-bold">
                    Payer maintenant <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <VideoPlayer lesson={activeLesson} />
          )
        ) : (
          <EmptyPlayer hasPaid={hasPaid} />
        )}
      </div>

      {/* Lesson info + description */}
      <div className="flex-shrink-0">
        {activeLesson ? (
          <div className="p-5 md:p-6 space-y-5 max-w-4xl">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="min-w-0">
                <h1 className="text-xl md:text-2xl font-black tracking-tight text-foreground leading-snug">{activeLesson.title}</h1>
                {activeLesson.duration > 0 && (
                  <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5">
                    <Video className="w-3.5 h-3.5" /> {activeLesson.duration} minutes
                  </p>
                )}
              </div>
              {hasPaid && (
                <Button
                  onClick={handleMarkComplete}
                  variant={isCompleted ? "outline" : "default"}
                  size="sm"
                  disabled={markComplete.isPending}
                  className={`shrink-0 ${isCompleted ? "border-emerald-500 text-emerald-600 hover:bg-emerald-50" : "bg-primary text-white"}`}
                >
                  {markComplete.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <CheckCircle2 className={`w-4 h-4 mr-2 ${isCompleted ? "text-emerald-500" : "opacity-60"}`} />
                  )}
                  {isCompleted ? "Terminé ✓" : "Marquer comme terminé"}
                </Button>
              )}
            </div>

            {activeLesson.description && (
              <div className="border border-border rounded-xl overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 bg-muted/50 border-b border-border">
                  <FileText className="w-4 h-4 text-primary" />
                  <span className="text-sm font-bold">Notes & Ressources</span>
                </div>
                <div className="p-4">
                  <HtmlContent html={activeLesson.description} className="text-sm" />
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-6 md:p-8">
            <div className="max-w-lg">
              <h1 className="text-2xl md:text-3xl font-black tracking-tight mb-3">{course.title}</h1>
              <p className="text-muted-foreground text-sm leading-relaxed mb-5">{course.description}</p>
              {hasPaid && totalLessons > 0 && (
                <div className="p-4 rounded-xl bg-muted/50 border border-border space-y-2">
                  <p className="text-sm font-semibold">Ta progression</p>
                  <Progress value={progressPercent} className="h-2" />
                  <p className="text-xs text-muted-foreground">{completedCount} / {totalLessons} leçons terminées</p>
                </div>
              )}
              {!hasPaid && (
                <div className="p-5 rounded-xl bg-gradient-to-br from-primary/10 to-violet-500/5 border border-primary/20">
                  <h3 className="font-bold mb-1 text-sm">🔒 Accès verrouillé</h3>
                  <p className="text-muted-foreground text-xs mb-3">Paiement unique de 10 000 FCFA pour un accès à vie</p>
                  <Link href="/paiement">
                    <Button size="sm" className="bg-primary text-white font-bold">
                      Débloquer maintenant <ArrowRight className="ml-2 w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* ── DESKTOP LAYOUT ── */}
      <div className="hidden lg:flex h-[calc(100vh-4rem)] overflow-hidden">
        <div className="w-[300px] xl:w-[320px] shrink-0 border-r border-border/50">
          {Sidebar}
        </div>
        <div className="flex-1 min-w-0">
          {MainContent}
        </div>
      </div>

      {/* ── MOBILE LAYOUT ── */}
      <div className="flex flex-col lg:hidden h-[calc(100vh-4rem)] overflow-hidden">
        {/* Tab switcher */}
        <div className="flex border-b border-border shrink-0 bg-background">
          <button
            onClick={() => setMobileTab("video")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-colors border-b-2
              ${mobileTab === "video" ? "border-primary text-primary" : "border-transparent text-muted-foreground"}`}
          >
            <Video className="w-4 h-4" /> Vidéo
          </button>
          <button
            onClick={() => setMobileTab("programme")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-colors border-b-2
              ${mobileTab === "programme" ? "border-primary text-primary" : "border-transparent text-muted-foreground"}`}
          >
            <List className="w-4 h-4" /> Programme
          </button>
        </div>

        <div className="flex-1 overflow-hidden">
          {mobileTab === "video" ? MainContent : Sidebar}
        </div>
      </div>
    </>
  );
}
