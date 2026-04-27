import { useListCourses } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { BookOpen, Loader2, Lock, Play, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth";

export default function Courses() {
  const { data: courses, isLoading } = useListCourses();
  const { user } = useAuth();
  const hasPaid = user?.hasPaid ?? false;

  if (isLoading) {
    return (
      <div className="container mx-auto p-8 max-w-6xl flex justify-center items-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-6xl space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Mes formations</h1>
          <p className="text-muted-foreground mt-1">
            {hasPaid ? "Accès complet activé — continue ta progression !" : "Débloque l'accès complet à vie."}
          </p>
        </div>
        {!hasPaid && (
          <Link href="/paiement">
            <Button className="bg-primary font-bold">
              Débloquer l'accès <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        )}
      </div>

      {!hasPaid && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm">
          <Lock className="w-4 h-4 text-amber-600 shrink-0" />
          <p className="text-amber-800">
            <strong>Formation verrouillée.</strong> Effectue le paiement unique de <strong>10 000 FCFA</strong> pour débloquer l'accès à vie à toutes les leçons, ressources et lives du dimanche.
          </p>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {courses?.map((course) => (
          <Card key={course.id} className={`flex flex-col overflow-hidden border transition-all duration-300 ${hasPaid ? "hover:border-primary/30 bg-card/40" : "border-border/60"}`}>
            <div className="aspect-video w-full relative bg-muted overflow-hidden group">
              {course.thumbnail ? (
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${!hasPaid ? "blur-sm" : ""}`}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-violet-500/10">
                  <BookOpen className="w-14 h-14 text-primary/30" />
                </div>
              )}
              {!hasPaid && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-[2px]">
                  <div className="bg-white/90 rounded-full p-3 shadow-lg">
                    <Lock className="w-6 h-6 text-primary" />
                  </div>
                </div>
              )}
              <div className="absolute bottom-3 left-3">
                <Badge className="bg-primary/90 text-white text-xs font-semibold">
                  {course.price > 0 ? `${course.price.toLocaleString()} FCFA` : "Gratuit"}
                </Badge>
              </div>
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="line-clamp-2 text-base font-bold">{course.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 pb-2">
              <p className={`text-sm text-muted-foreground line-clamp-3 ${!hasPaid ? "blur-sm select-none" : ""}`}>
                {course.description}
              </p>
            </CardContent>
            <CardFooter className="pt-3 border-t border-border/50">
              {hasPaid ? (
                <Link href={`/courses/${course.id}`} className="w-full">
                  <Button className="w-full bg-primary hover:bg-primary/90 font-semibold">
                    <Play className="w-4 h-4 mr-2" /> Voir la formation
                  </Button>
                </Link>
              ) : (
                <Link href="/paiement" className="w-full">
                  <Button variant="outline" className="w-full border-primary/30 text-primary hover:bg-primary/5 font-semibold">
                    <Lock className="w-4 h-4 mr-2" /> Débloquer — 10 000 FCFA
                  </Button>
                </Link>
              )}
            </CardFooter>
          </Card>
        ))}

        {!courses?.length && (
          <div className="col-span-full py-16 text-center text-muted-foreground border border-dashed rounded-xl">
            <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>Aucune formation disponible pour l'instant.</p>
          </div>
        )}
      </div>
    </div>
  );
}
