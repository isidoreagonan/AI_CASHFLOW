import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { useRegister } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PhoneInput } from "@/components/phone-input";
import { Loader2, Eye, EyeOff, Sparkles, Lock, Shield } from "lucide-react";
import { Link } from "wouter";

export default function Register() {
  const [, setLocation] = useLocation();
  const { login: setAuth } = useAuth();
  const { toast } = useToast();
  const registerMutation = useRegister();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName.trim() || !form.lastName.trim()) {
      toast({ title: "Prénom et nom requis", variant: "destructive" });
      return;
    }
    if (!form.phone || form.phone.replace(/\D/g, "").length < 7) {
      toast({ title: "Numéro de téléphone invalide", variant: "destructive" });
      return;
    }
    try {
      const fullName = `${form.firstName.trim()} ${form.lastName.trim()}`;
      const response = await registerMutation.mutateAsync({
        data: {
          name: fullName,
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          email: form.email,
          phone: form.phone,
          password: form.password,
        },
      });
      setAuth(response.token, response.user);
      setLocation("/dashboard");
      toast({ title: "Compte créé ! Bienvenue 🎉" });
    } catch (error: any) {
      toast({
        title: "Inscription échouée",
        description: error?.data?.error || error?.message || "Vérifie tes informations et réessaie.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f8fc] p-4">
      <div className="absolute top-0 left-0 right-0 h-72 bg-gradient-to-br from-primary/10 via-violet-500/5 to-transparent pointer-events-none" />

      <div className="w-full max-w-lg relative z-10">
        <div className="text-center mb-8">
          <Link href="/">
            <div className="inline-flex items-center gap-2 mb-6 cursor-pointer">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="font-black text-xl tracking-tight">IA CASH FLOW</span>
            </div>
          </Link>
          <h1 className="text-3xl font-black tracking-tight text-foreground">Crée ton compte</h1>
          <p className="text-muted-foreground mt-2">
            Rejoins la formation #1 en création de contenu IA Faceless
          </p>
        </div>

        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-sm">
          <Lock className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
          <p className="text-amber-800">
            <strong>Formation verrouillée après inscription.</strong> Débloque l'accès complet à vie via un paiement unique de <strong>10 000 FCFA</strong>.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-border/60 shadow-lg p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="firstName">Prénom <span className="text-destructive">*</span></Label>
                <Input
                  id="firstName"
                  placeholder="ex: Isidore"
                  value={form.firstName}
                  onChange={e => setForm({ ...form, firstName: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lastName">Nom <span className="text-destructive">*</span></Label>
                <Input
                  id="lastName"
                  placeholder="ex: Agonan"
                  value={form.lastName}
                  onChange={e => setForm({ ...form, lastName: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">Adresse e-mail <span className="text-destructive">*</span></Label>
              <Input
                id="email"
                type="email"
                placeholder="ton@email.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone">Numéro de téléphone <span className="text-destructive">*</span></Label>
              <PhoneInput
                id="phone"
                value={form.phone}
                onChange={val => setForm({ ...form, phone: val })}
                required
              />
              <p className="text-xs text-muted-foreground">Pour les notifications WhatsApp et accès aux lives du dimanche</p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Mot de passe <span className="text-destructive">*</span></Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="8 caractères minimum"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  required
                  minLength={8}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full py-6 text-base font-bold bg-primary hover:bg-primary/90"
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending ? (
                <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Création en cours…</>
              ) : (
                "Créer mon compte gratuitement"
              )}
            </Button>

            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground pt-1">
              <Shield className="w-3 h-3" />
              Données 100% sécurisées — Accès à vie après paiement unique
            </div>
          </form>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Déjà un compte ?{" "}
          <Link href="/login" className="text-primary font-semibold hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
