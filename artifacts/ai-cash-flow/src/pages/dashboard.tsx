import { useGetDashboardSummary } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { Link } from "wouter";
import {
  BookOpen, CheckCircle2, PlayCircle, TrendingUp,
  ArrowRight, Lock, Zap, Trophy, MessageCircle
} from "lucide-react";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Bonjour";
  if (h < 18) return "Bon après-midi";
  return "Bonsoir";
}

export default function Dashboard() {
  const { user } = useAuth();
  const { data: summary, isLoading } = useGetDashboardSummary();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-4 md:p-8 max-w-6xl animate-pulse space-y-8">
          <div className="h-32 bg-muted rounded-2xl" />
          <div className="grid md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-28 bg-muted rounded-xl" />)}
          </div>
          <div className="h-10 bg-muted rounded w-1/3" />
          <div className="grid md:grid-cols-2 gap-6">
            {[1, 2].map(i => <div key={i} className="h-48 bg-muted rounded-xl" />)}
          </div>
        </div>
      </div>
    );
  }

  const hasAccess = user?.hasPaid;
  const courses = summary?.enrolledCourses || [];
  const completedLessons = summary?.completedLessons || 0;
  const totalLessons = summary?.totalLessons || 0;
  const progress = summary?.progressPercent || 0;

  return (
    <div className="min-h-screen bg-[#f8f8fc]">
      <div className="container mx-auto p-4 md:p-8 max-w-6xl space-y-8">

        {/* Hero welcome banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-violet-600 to-purple-800 p-6 md:p-8 text-white shadow-xl">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-4 right-8 w-40 h-40 rounded-full bg-white/20 blur-2xl" />
            <div className="absolute bottom-0 left-1/3 w-60 h-60 rounded-full bg-white/10 blur-3xl" />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <p className="text-white/70 text-sm font-medium mb-1">{getGreeting()} 👋</p>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight">{user?.name}</h1>
              <p className="text-white/80 mt-1 text-sm md:text-base">
                {hasAccess
                  ? "Ton accès est actif — continue ta progression !"
                  : "Active ton accès pour débloquer toutes les formations."}
              </p>
            </div>
            <div className="flex flex-col items-start md:items-end gap-2">
              {hasAccess ? (
                <Badge className="bg-green-400/20 text-green-200 border border-green-400/30 font-semibold px-3 py-1">
                  ✓ Accès complet activé
                </Badge>
              ) : (
                <Link href="/paiement">
                  <Button className="bg-white text-primary hover:bg-white/90 font-bold shadow-lg">
                    Activer mon accès <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              )}
              {progress > 0 && (
                <div className="text-sm text-white/70">
                  <span className="font-bold text-white">{Math.round(progress)}%</span> de la formation terminée
                </div>
              )}
            </div>
          </div>

          {/* Progress bar inside banner */}
          {hasAccess && totalLessons > 0 && (
            <div className="relative z-10 mt-6">
              <div className="flex justify-between text-xs text-white/60 mb-1.5">
                <span>Progression globale</span>
                <span>{completedLessons}/{totalLessons} leçons</span>
              </div>
              <div className="h-2 rounded-full bg-white/20 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-green-300 to-emerald-400 transition-all duration-700"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-0 shadow-sm bg-white">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-primary" />
                </div>
                <span className="text-2xl font-black text-foreground">{summary?.totalCourses || 0}</span>
              </div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Formations</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-white">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                  <PlayCircle className="w-4 h-4 text-blue-500" />
                </div>
                <span className="text-2xl font-black text-foreground">{totalLessons}</span>
              </div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Leçons</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-white">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                </div>
                <span className="text-2xl font-black text-foreground">{completedLessons}</span>
              </div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Complétées</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-white">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-amber-500" />
                </div>
                <span className="text-2xl font-black text-foreground">{Math.round(progress)}%</span>
              </div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Progression</p>
            </CardContent>
          </Card>
        </div>

        {/* Courses section */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-black tracking-tight">Mes formations</h2>
            <Link href="/courses">
              <Button variant="ghost" size="sm" className="text-primary font-semibold gap-1">
                Voir tout <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>

          {courses.length > 0 ? (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {courses.map((course: any) => (
                <Link key={course.id} href={`/courses/${course.id}`}>
                  <Card className="group cursor-pointer border-0 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden bg-white flex flex-col h-full">
                    <div className="aspect-video w-full overflow-hidden bg-muted relative">
                      {course.thumbnail ? (
                        <img
                          src={course.thumbnail}
                          alt={course.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-violet-100">
                          <BookOpen className="w-14 h-14 text-primary/30" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-lg">
                          <PlayCircle className="w-5 h-5 text-primary" />
                        </div>
                      </div>
                    </div>
                    <CardContent className="p-4 flex-1 flex flex-col gap-3">
                      <h3 className="font-bold text-base group-hover:text-primary transition-colors line-clamp-2 leading-snug">{course.title}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-2 flex-1">{course.description}</p>
                      <div className="pt-2 border-t border-border/50">
                        <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                          <span>Progression</span>
                          <span className="font-semibold text-foreground">{Math.round(progress)}%</span>
                        </div>
                        <Progress value={progress} className="h-1.5" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card className="border-0 shadow-sm bg-white p-10 text-center">
              {hasAccess ? (
                <>
                  <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                    <BookOpen className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">Aucune formation assignée</h3>
                  <p className="text-muted-foreground text-sm mb-5 max-w-sm mx-auto">
                    Les formations apparaîtront ici dès qu'elles seront publiées. Reviens bientôt !
                  </p>
                  <Link href="/courses">
                    <Button className="bg-primary text-white hover:bg-primary/90">Voir le catalogue</Button>
                  </Link>
                </>
              ) : (
                <>
                  <div className="mx-auto w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center mb-4">
                    <Lock className="w-8 h-8 text-amber-500" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">Accès non activé</h3>
                  <p className="text-muted-foreground text-sm mb-5 max-w-sm mx-auto">
                    Active ton accès pour débloquer toutes les formations IA CASH FLOW et rejoindre la communauté.
                  </p>
                  <Link href="/paiement">
                    <Button className="bg-primary text-white hover:bg-primary/90 font-bold">
                      <Zap className="mr-2 h-4 w-4" /> Activer pour 10 000 FCFA
                    </Button>
                  </Link>
                </>
              )}
            </Card>
          )}
        </div>

        {/* Bottom info cards */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* WhatsApp community */}
          <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-emerald-50 overflow-hidden">
            <CardContent className="p-5 flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-green-500 flex items-center justify-center flex-shrink-0 shadow-sm">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-sm mb-1 text-green-900">Groupe WhatsApp privé</h3>
                <p className="text-xs text-green-700/80 leading-relaxed">
                  Rejoins notre communauté privée pour poser tes questions, partager tes résultats et accéder aux lives du dimanche à 22h.
                </p>
                <a
                  href={hasAccess ? "https://chat.whatsapp.com/DPZrBUHMwdRJ4JkLUt0lnk" : "/paiement"}
                  target={hasAccess ? "_blank" : "_self"}
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 mt-3 text-xs font-bold text-green-700 hover:text-green-800 transition-colors"
                >
                  {hasAccess ? "Rejoindre le groupe" : "Activer l'accès pour rejoindre"} <ArrowRight className="h-3 w-3" />
                </a>
              </div>
            </CardContent>
          </Card>

          {/* Sunday live */}
          <Card className="border-0 shadow-sm bg-gradient-to-br from-violet-50 to-purple-50 overflow-hidden">
            <CardContent className="p-5 flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-primary flex items-center justify-center flex-shrink-0 shadow-sm">
                <Trophy className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-sm mb-1 text-violet-900">Lives dominicaux · 22h</h3>
                <p className="text-xs text-violet-700/80 leading-relaxed">
                  Chaque dimanche soir à 22h (heure du Bénin), live exclusif avec AGONAN ISIDORE pour aller plus loin et répondre à tes questions.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
