import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Search, RefreshCw, CheckCircle2, XCircle, Clock, TrendingUp, DollarSign, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface Payment {
  id: number;
  depositId: string;
  status: string;
  amount: number;
  currency: string;
  country: string;
  correspondent: string;
  phone: string;
  failureReason?: string;
  createdAt: string;
  user?: { name: string; email: string };
}

function StatusBadge({ status }: { status: string }) {
  if (status === "COMPLETED") {
    return (
      <Badge className="bg-green-100 text-green-700 border-0 font-semibold gap-1 text-xs">
        <CheckCircle2 className="h-3 w-3" /> Complété
      </Badge>
    );
  }
  if (status === "FAILED" || status === "REJECTED") {
    return (
      <Badge className="bg-red-100 text-red-700 border-0 font-semibold gap-1 text-xs">
        <XCircle className="h-3 w-3" /> Échoué
      </Badge>
    );
  }
  return (
    <Badge className="bg-amber-100 text-amber-700 border-0 font-semibold gap-1 text-xs">
      <Clock className="h-3 w-3" /> En attente
    </Badge>
  );
}

export default function AdminPayments() {
  const [search, setSearch] = useState("");

  const { data: payments, isLoading, refetch, isFetching } = useQuery<Payment[]>({
    queryKey: ["admin-payments"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/payment/history", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch payments");
      return res.json();
    },
    refetchInterval: 30000,
  });

  const filtered = payments?.filter(p => {
    const q = search.toLowerCase();
    return (
      p.phone?.includes(q) ||
      p.user?.name?.toLowerCase().includes(q) ||
      p.user?.email?.toLowerCase().includes(q) ||
      p.correspondent?.toLowerCase().includes(q) ||
      p.country?.toLowerCase().includes(q) ||
      p.depositId?.toLowerCase().includes(q)
    );
  }) || [];

  const completed = payments?.filter(p => p.status === "COMPLETED") || [];
  const failed = payments?.filter(p => p.status === "FAILED" || p.status === "REJECTED") || [];
  const pending = payments?.filter(p => !["COMPLETED", "FAILED", "REJECTED"].includes(p.status)) || [];
  const totalRevenue = completed.reduce((sum, p) => sum + (p.amount || 10000), 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Paiements</h1>
          <p className="text-muted-foreground text-sm mt-1">Suivi des transactions PawaPay Mobile Money</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
          className="gap-2 font-semibold"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} />
          Actualiser
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm bg-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-4 h-4 text-green-600" />
            </div>
            <p className="text-2xl font-black text-green-700">{totalRevenue.toLocaleString("fr-FR")}</p>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mt-1">FCFA encaissés</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
            </div>
            <p className="text-2xl font-black">{completed.length}</p>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mt-1">Complétés</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <p className="text-2xl font-black text-amber-700">{pending.length}</p>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mt-1">En attente</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <XCircle className="w-4 h-4 text-red-500" />
            </div>
            <p className="text-2xl font-black text-red-600">{failed.length}</p>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mt-1">Échoués</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher par téléphone, nom, opérateur, pays..."
          className="pl-9 bg-white border-0 shadow-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <Card className="border-0 shadow-sm bg-white overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableHead className="font-bold text-xs uppercase tracking-wide">Étudiant</TableHead>
              <TableHead className="font-bold text-xs uppercase tracking-wide">Téléphone</TableHead>
              <TableHead className="font-bold text-xs uppercase tracking-wide">Opérateur</TableHead>
              <TableHead className="font-bold text-xs uppercase tracking-wide">Montant</TableHead>
              <TableHead className="font-bold text-xs uppercase tracking-wide">Statut</TableHead>
              <TableHead className="font-bold text-xs uppercase tracking-wide">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                  {search ? "Aucun paiement trouvé pour cette recherche." : "Aucun paiement enregistré pour le moment."}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((p) => (
                <TableRow key={p.id} className="hover:bg-muted/10">
                  <TableCell>
                    {p.user ? (
                      <div>
                        <p className="font-semibold text-sm">{p.user.name}</p>
                        <p className="text-xs text-muted-foreground">{p.user.email}</p>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm italic">—</span>
                    )}
                  </TableCell>
                  <TableCell className="font-mono text-sm">{p.phone || "—"}</TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm font-semibold">{p.correspondent || "—"}</p>
                      <p className="text-xs text-muted-foreground">{p.country}</p>
                    </div>
                  </TableCell>
                  <TableCell className="font-bold">
                    {p.amount ? `${p.amount.toLocaleString("fr-FR")} ${p.currency || "FCFA"}` : "10 000 FCFA"}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <StatusBadge status={p.status} />
                      {p.failureReason && (
                        <p className="text-[10px] text-red-500 max-w-[150px] truncate">{p.failureReason}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {format(new Date(p.createdAt), "d MMM yyyy HH:mm", { locale: fr })}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
