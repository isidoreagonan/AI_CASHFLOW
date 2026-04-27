import { useParams, Link } from "wouter";
import { useGetLesson, useMarkLessonComplete, useGetMyProgress, useListFiles, getGetMyProgressQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { HtmlContent } from "@/components/html-content";
import { Loader2, CheckCircle2, ChevronLeft, PlayCircle, Lock, ArrowRight, FileText, Download, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";

function VideoError({ msg }: { msg: string }) {
  return (
    <div className="w-full h-full absolute inset-0 bg-muted flex items-center justify-center p-4">
      <p className="text-muted-foreground text-sm text-center">{msg}</p>
    </div>
  );
}

function extractVideoId(url: string, type: string) {
  if (type === "youtube") {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  } else if (type === "vimeo") {
    const regExp = /(?:www\.|player\.)?vimeo.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|video\/|)(\d+)(?:[a-zA-Z0-9_\-]+)?/i;
    const match = url.match(regExp);
    return match ? match[1] : null;
  }
  return null;
}

const FILE_TYPE_ICON: Record<string, string> = {
  pdf: "📄",
  guide: "📘",
  resource: "📁",
  video: "🎬",
  link: "🔗",
  other: "📎",
};

export default function LessonPlayer() {
  const { lessonId } = useParams();
  const parsedLessonId = parseInt(lessonId || "0", 10);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: lesson, isLoading: isLessonLoading } = useGetLesson(parsedLessonId, {
    query: { enabled: !!parsedLessonId }
  });

  // Fetch resources attached to this lesson's module
  const { data: files = [] } = useListFiles(
    { moduleId: lesson?.moduleId },
    { query: { enabled: !!lesson?.moduleId } }
  );

  const markComplete = useMarkLessonComplete();
  const { data: progress } = useGetMyProgress();

  const isCompleted = progress?.some(p => p.lessonId === parsedLessonId && p.completed);

  const handleMarkComplete = async () => {
    if (!lesson) return;
    try {
      await markComplete.mutateAsync({
        data: { lessonId: lesson.id, completed: !isCompleted }
      });
      queryClient.invalidateQueries({ queryKey: getGetMyProgressQueryKey() });
      toast({
        title: !isCompleted ? "Leçon terminée !" : "Leçon marquée comme incomplète",
        description: !isCompleted ? "Bravo, continuez !" : "Progression mise à jour.",
      });
    } catch {
      toast({ title: "Erreur", description: "Impossible de mettre à jour la progression.", variant: "destructive" });
    }
  };

  if (isLessonLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!lesson) {
    return <div className="p-8 text-center">Leçon introuvable.</div>;
  }

  const hasPaid = user?.hasPaid ?? false;
  const canWatch = hasPaid || lesson.isFree;

  if (!canWatch) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-black tracking-tight mb-3">Contenu verrouillé</h2>
          <p className="text-muted-foreground mb-6 leading-relaxed">
            Cette leçon est réservée aux membres. Débloque l'accès complet à <strong>IA CASH FLOW</strong> pour un paiement unique de <strong>10 000 FCFA</strong> et accède à toutes les formations, ressources et lives du dimanche.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/paiement">
              <Button className="bg-primary font-bold">
                Débloquer l'accès à vie <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
            <Link href="/courses">
              <Button variant="outline">
                <ChevronLeft className="mr-2 w-4 h-4" /> Retour aux formations
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const resolveVideoUrl = (url: string) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    const base = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");
    return url.startsWith("/") ? `${base}${url}` : `${base}/${url}`;
  };

  const renderVideo = () => {
    if (lesson.videoType === "youtube") {
      const id = extractVideoId(lesson.videoUrl, "youtube");
      if (!id) return <VideoError msg="Lien YouTube invalide." />;
      return (
        <iframe
          className="w-full h-full absolute inset-0"
          src={`https://www.youtube.com/embed/${id}?rel=0&modestbranding=1&autohide=1&showinfo=0`}
          title={lesson.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      );
    } else if (lesson.videoType === "vimeo") {
      const id = extractVideoId(lesson.videoUrl, "vimeo");
      if (!id) return <VideoError msg="Lien Vimeo invalide." />;
      return (
        <iframe
          className="w-full h-full absolute inset-0"
          src={`https://player.vimeo.com/video/${id}?autoplay=0`}
          title={lesson.title}
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        />
      );
    } else if (lesson.videoType === "upload") {
      const src = resolveVideoUrl(lesson.videoUrl);
      return (
        <video
          key={src}
          className="w-full h-full absolute inset-0 bg-black"
          controls
          controlsList="nodownload"
          preload="metadata"
          playsInline
        >
          <source src={src} />
          Votre navigateur ne supporte pas la lecture vidéo.
        </video>
      );
    } else if (lesson.videoType === "audio") {
      const src = resolveVideoUrl(lesson.videoUrl);
      return (
        <div className="w-full h-full absolute inset-0 bg-gradient-to-br from-primary/10 to-violet-500/10 flex flex-col items-center justify-center gap-4 p-6">
          <div className="w-16 h-16 rounded-2xl bg-primary/15 flex items-center justify-center">
            <PlayCircle className="w-8 h-8 text-primary" />
          </div>
          <p className="text-sm font-medium text-foreground">{lesson.title}</p>
          <audio controls preload="metadata" className="w-full max-w-lg" style={{ colorScheme: "light" }}>
            <source src={src} />
            Votre navigateur ne supporte pas la lecture audio.
          </audio>
        </div>
      );
    } else if (lesson.videoType === "embed") {
      return (
        <iframe
          className="w-full h-full absolute inset-0"
          src={lesson.videoUrl}
          title={lesson.title}
          allow="autoplay; fullscreen"
          allowFullScreen
        />
      );
    } else {
      return <VideoError msg="Format vidéo non reconnu pour cette leçon." />;
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-4rem)] bg-background">
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Video Player Area */}
        <div className="w-full bg-black relative pt-[56.25%]">
          {renderVideo()}
        </div>

        {/* Lesson Info */}
        <div className="flex-1 p-6 md:p-10 max-w-4xl mx-auto w-full">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 border-b border-border pb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">{lesson.title}</h1>
              <p className="text-muted-foreground flex items-center gap-2">
                <PlayCircle className="w-4 h-4" /> {lesson.duration} minutes
              </p>
            </div>
            <Button
              onClick={handleMarkComplete}
              variant={isCompleted ? "outline" : "default"}
              size="lg"
              className={isCompleted ? "border-primary text-primary hover:bg-primary/10" : "bg-primary text-primary-foreground hover:bg-primary/90"}
              disabled={markComplete.isPending}
            >
              {markComplete.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
              ) : (
                <CheckCircle2 className={`w-5 h-5 mr-2 ${isCompleted ? "" : "opacity-50"}`} />
              )}
              {isCompleted ? "Terminé ✓" : "Marquer comme terminé"}
            </Button>
          </div>

          {lesson.description && (
            <div className="mb-10">
              <h3 className="text-xl font-semibold mb-4">Description de la leçon</h3>
              <HtmlContent html={lesson.description} />
            </div>
          )}

          {/* Resources section — shown below the video content */}
          {files.length > 0 && (
            <div className="mt-2 mb-10">
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="w-5 h-5 text-primary" />
                <h3 className="text-xl font-semibold">Ressources du module</h3>
              </div>
              <div className="grid gap-3">
                {files.map(file => (
                  <a
                    key={file.id}
                    href={file.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:border-primary/50 hover:bg-primary/5 transition-all"
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-xl flex-shrink-0">
                      {FILE_TYPE_ICON[file.fileType] ?? "📎"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                        {file.name}
                      </p>
                      {file.description && (
                        <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">{file.description}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wide">
                        {file.fileType} · {file.fileSize}
                      </p>
                    </div>
                    <Download className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                  </a>
                ))}
              </div>
            </div>
          )}

          <div className="mt-4 flex justify-between">
            <Button variant="outline" asChild>
              <Link href="/courses">
                <span className="flex items-center"><ChevronLeft className="w-4 h-4 mr-2" /> Retour aux formations</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
