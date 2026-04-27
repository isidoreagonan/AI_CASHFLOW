import { useGetAdminSummary } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Users, BookOpen, PlayCircle, CreditCard, TrendingUp, ArrowRight, Eye, Plus } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Link } from "wouter";

export default function AdminDashboard() {
  const { data: summary, isLoading } = useGetAdminSummary();

  if (isLoading) {
    return (
      <div className="p-8 space-y-6 animate-pulse">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-28 bg-muted rounded-xl" />)}
        </div>
      </div>
    );
  }

  const conversionRate = summary?.totalUsers
    ? Math.round((summary.paidUsers / summary.totalUsers) * 100)
    : 0;

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Tableau de bord</h1>
          <p className="text-muted-foreground text-sm mt-1">Vue d'ensemble de la plateforme IA CASH FLOW</p>
        </div>
        <Link href="/admin/courses/new">
          <Button className="bg-primary text-white hover:bg-primary/90 font-bold gap-2">
            <Plus className="h-4 w-4" /> Nouvelle formation
          </Button>
        </Link>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm bg-white overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
          <CardContent className="p-5 relative">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <TrendingUp className="w-4 h-4 text-green-500" />
            </div>
            <p className="text-3xl font-black">{summary?.totalUsers || 0}</p>
            <p className="text-xs font-semibold text-muted-foreground mt-1 uppercase tracking-wide">Inscrits totaux</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-white overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-transparent" />
          <CardContent className="p-5 relative">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">{conversionRate}%</span>
            </div>
            <p className="text-3xl font-black">{summary?.paidUsers || 0}</p>
            <p className="text-xs font-semibold text-muted-foreground mt-1 uppercase tracking-wide">Payants</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-white overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent" />
          <CardContent className="p-5 relative">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <p className="text-3xl font-black">{summary?.totalCourses || 0}</p>
            <p className="text-xs font-semibold text-muted-foreground mt-1 uppercase tracking-wide">Formations</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-white overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-transparent" />
          <CardContent className="p-5 relative">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                <PlayCircle className="w-5 h-5 text-amber-600" />
              </div>
            </div>
            <p className="text-3xl font-black">{summary?.totalLessons || 0}</p>
            <p className="text-xs font-semibold text-muted-foreground mt-1 uppercase tracking-wide">Leçons</p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue highlight */}
      <Card className="border-0 shadow-sm bg-gradient-to-br from-primary via-violet-700 to-purple-900 text-white overflow-hidden">
        <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-white/60 text-sm font-medium mb-1">Revenu estimé total</p>
            <p className="text-4xl font-black">
              {((summary?.paidUsers || 0) * 10000).toLocaleString("fr-FR")} FCFA
            </p>
            <p className="text-white/50 text-xs mt-1">
              Basé sur {summary?.paidUsers || 0} paiement(s) à 10 000 FCFA
            </p>
          </div>
          <Link href="/admin/payments">
            <Button className="bg-white text-primary hover:bg-white/90 font-bold gap-2 whitespace-nowrap">
              <Eye className="h-4 w-4" /> Voir les paiements
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Quick actions */}
      <div className="grid md:grid-cols-3 gap-4">
        <Link href="/admin/courses">
          <Card className="border-0 shadow-sm bg-white hover:shadow-md transition-shadow cursor-pointer group">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-sm">Gérer les formations</p>
                <p className="text-xs text-muted-foreground">Créer, modifier, publier</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/users">
          <Card className="border-0 shadow-sm bg-white hover:shadow-md transition-shadow cursor-pointer group">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-sm">Étudiants</p>
                <p className="text-xs text-muted-foreground">Voir & gérer les comptes</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-blue-600 transition-colors" />
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/files">
          <Card className="border-0 shadow-sm bg-white hover:shadow-md transition-shadow cursor-pointer group">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
                <CreditCard className="w-5 h-5 text-amber-600" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-sm">Ressources</p>
                <p className="text-xs text-muted-foreground">Fichiers et documents</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-amber-600 transition-colors" />
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent users */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-black">Inscrits récents</h2>
          <Link href="/admin/users">
            <Button variant="ghost" size="sm" className="text-primary gap-1 font-semibold">
              Voir tout <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
        <Card className="border-0 shadow-sm bg-white overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead className="font-bold text-xs uppercase tracking-wide">Nom</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wide">Email</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wide">Statut</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wide">Inscrit le</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {summary?.recentUsers?.map((u) => (
                <TableRow key={u.id} className="hover:bg-muted/10">
                  <TableCell className="font-semibold">{u.name}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{u.email}</TableCell>
                  <TableCell>
                    {u.hasPaid ? (
                      <Badge className="bg-green-100 text-green-700 border-0 font-semibold">✓ Payant</Badge>
                    ) : (
                      <Badge variant="secondary" className="font-semibold">En attente</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {format(new Date(u.createdAt), "d MMM yyyy", { locale: fr })}
                  </TableCell>
                </TableRow>
              ))}
              {(!summary?.recentUsers || summary.recentUsers.length === 0) && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">
                    Aucun inscrit pour le moment.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
}
