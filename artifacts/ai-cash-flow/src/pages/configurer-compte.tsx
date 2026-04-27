import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useSetupPassword } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Loader2, CheckCircle, Eye, EyeOff, Lock, User, Phone,
  AlertTriangle, Shield, ShieldCheck,
} from "lucide-react";

// ─── Calcul de la force du mot de passe
function getPasswordStrength(pwd: string): {
  score: number; label: string; color: string; bg: string;
} {
  if (!pwd) return { score: 0, label: "", color: "", bg: "" };
  let score = 0;
  if (pwd.length >= 8) score++;
  if (pwd.length >= 12) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;

  if (score <= 1) return { score, label: "Très faible", color: "text-red-500", bg: "bg-red-500" };
  if (score === 2) return { score, label: "Faible", color: "text-orange-500", bg: "bg-orange-500" };
  if (score === 3) return { score, label: "Moyen", color: "text-yellow-500", bg: "bg-yellow-500" };
  if (score === 4) return { score, label: "Fort", color: "text-green-500", bg: "bg-green-500" };
  return { score, label: "Très fort", color: "text-emerald-500", bg: "bg-emerald-500" };
}

export default function ConfigurerCompte() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();
  const setupPassword = useSetupPassword();

  const [token, setToken] = useState("");
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [done, setDone] = useState(false);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("token");
    if (t) {
      setToken(t);
      setTokenValid(true);
    } else {
      setTokenValid(false);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const strength = getPasswordStrength(form.password);
  const passwordMatch = form.confirmPassword && form.password === form.confirmPassword;
  const passwordMismatch = form.confirmPassword && form.password !== form.confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (form.password !== form.confirmPassword) {
      toast({ title: "Les mots de passe ne correspondent pas", variant: "destructive" });
      return;
    }
    if (form.password.length < 8) {
      toast({ title: "Le mot de passe doit faire au moins 8 caractères", variant: "destructive" });
      return;
    }

    try {
      const result = await setupPassword.mutateAsync({
        data: {
          token,
          password: form.password,
          firstName: form.firstName,
          lastName: form.lastName,
          phone: form.phone || undefined,
        },
      });
      login(result.token, result.user);
      setDone(true);
    } catch (err: any) {
      const msg = err?.response?.data?.error || "Une erreur est survenue";
      toast({ title: msg, variant: "destructive" });
    }
  };

  // ─── Chargement
  if (tokenValid === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // ─── Token invalide / manquant
  if (tokenValid === false) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-violet-50 to-indigo-50 p-4">
        <div className="w-full max-w-md text-center space-y-6">
          <div className="inline-flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-sm border border-violet-100">
            <span className="text-lg">💰</span>
            <span className="font-black text-primary tracking-tight">IA CASH FLOW</span>
          </div>
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-black mb-2">Lien invalide ou expiré</h2>
            <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
              Ce lien de configuration n'est plus valide.<br />
              Contactez l'administrateur pour recevoir un nouveau lien d'invitation.
            </p>
            <div className="bg-violet-50 rounded-xl p-4 mb-6">
              <p className="text-sm font-semibold text-violet-700 mb-1">Support IA CASH FLOW</p>
              <a href="https://wa.me/2290157385885" target="_blank" rel="noopener noreferrer"
                className="text-sm text-violet-600 font-bold hover:underline">
                WhatsApp : +229 01 57 38 58 85
              </a>
            </div>
            <Button onClick={() => setLocation("/login")} variant="outline" className="w-full font-bold">
              Retour à la connexion
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Succès
  if (done) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-violet-50 to-indigo-50 p-4">
        <div className="w-full max-w-md text-center space-y-6">
          <div className="inline-flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-sm border border-violet-100">
            <span className="text-lg">💰</span>
            <span className="font-black text-primary tracking-tight">IA CASH FLOW</span>
          </div>
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h2 className="text-2xl font-black mb-2">Compte activé !</h2>
            <p className="text-muted-foreground text-sm mb-1">
              Bienvenue sur IA CASH FLOW.
            </p>
            <p className="text-muted-foreground text-sm">
              Redirection vers vos formations...
            </p>
            <div className="mt-6">
              <Loader2 className="w-5 h-5 animate-spin text-primary mx-auto" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Formulaire principal
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-violet-50 to-indigo-50 p-4 py-10">
      <div className="w-full max-w-md space-y-6">

        {/* Logo */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-sm border border-violet-100 mb-4">
            <span className="text-lg">💰</span>
            <span className="font-black text-primary tracking-tight">IA CASH FLOW</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight">Créer votre compte</h1>
          <p className="text-muted-foreground text-sm mt-2">
            Complétez vos informations pour accéder à votre formation.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 space-y-5">

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Prénom + Nom */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="firstName" className="text-xs font-bold uppercase tracking-wide text-gray-600">
                  Prénom <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="firstName"
                    name="firstName"
                    value={form.firstName}
                    onChange={handleChange}
                    required
                    placeholder="Ex : Jean"
                    className="pl-9 bg-gray-50 border-gray-200 focus:bg-white"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lastName" className="text-xs font-bold uppercase tracking-wide text-gray-600">
                  Nom <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  required
                  placeholder="Ex : Dupont"
                  className="bg-gray-50 border-gray-200 focus:bg-white"
                />
              </div>
            </div>

            {/* Téléphone */}
            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-xs font-bold uppercase tracking-wide text-gray-600">
                Numéro WhatsApp <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  required
                  placeholder="+229 97 00 00 00"
                  className="pl-9 bg-gray-50 border-gray-200 focus:bg-white"
                />
              </div>
              <p className="text-xs text-gray-400">Nécessaire pour rejoindre le groupe WhatsApp de la formation.</p>
            </div>

            {/* Séparateur */}
            <div className="border-t border-gray-100 pt-1" />

            {/* Mot de passe */}
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wide text-gray-600">
                Mot de passe <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange}
                  required
                  placeholder="Minimum 8 caractères"
                  className="pl-9 pr-10 bg-gray-50 border-gray-200 focus:bg-white"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword((v) => !v)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {/* Barre de force */}
              {form.password && (
                <div className="space-y-1.5 pt-1">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                          i <= strength.score ? strength.bg : "bg-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-1.5">
                    {strength.score >= 4
                      ? <ShieldCheck className={`h-3.5 w-3.5 ${strength.color}`} />
                      : <Shield className={`h-3.5 w-3.5 ${strength.color}`} />
                    }
                    <span className={`text-xs font-semibold ${strength.color}`}>{strength.label}</span>
                    {strength.score < 3 && (
                      <span className="text-xs text-gray-400 ml-1">— Ajoutez des chiffres, majuscules ou symboles</span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Confirmation */}
            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword" className="text-xs font-bold uppercase tracking-wide text-gray-600">
                Confirmer le mot de passe <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                  placeholder="Répétez votre mot de passe"
                  className={`pl-9 pr-10 bg-gray-50 focus:bg-white transition-colors ${
                    passwordMatch ? "border-green-400 focus:border-green-500" :
                    passwordMismatch ? "border-red-400 focus:border-red-500" :
                    "border-gray-200"
                  }`}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowConfirm((v) => !v)}
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {passwordMatch && (
                <p className="text-xs text-green-600 flex items-center gap-1 font-medium">
                  <CheckCircle className="h-3.5 w-3.5" /> Les mots de passe correspondent
                </p>
              )}
              {passwordMismatch && (
                <p className="text-xs text-red-500 flex items-center gap-1 font-medium">
                  <AlertTriangle className="h-3.5 w-3.5" /> Les mots de passe ne correspondent pas
                </p>
              )}
            </div>

            {/* Bouton */}
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-black py-5 text-base shadow-lg shadow-violet-200"
              disabled={setupPassword.isPending}
            >
              {setupPassword.isPending ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Activation en cours...</>
              ) : (
                "Activer mon compte"
              )}
            </Button>

          </form>
        </div>

        <p className="text-center text-xs text-gray-400">
          Besoin d'aide ?{" "}
          <a href="https://wa.me/2290157385885" target="_blank" rel="noopener noreferrer"
            className="text-violet-600 font-semibold hover:underline">
            Contactez le support WhatsApp
          </a>
        </p>

      </div>
    </div>
  );
}
