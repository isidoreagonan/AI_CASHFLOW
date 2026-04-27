import { useState } from "react";
import { useLocation } from "wouter";
import { useForgotPassword, useResetPassword } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Mail, KeyRound, Lock, Eye, EyeOff, CheckCircle, ArrowLeft } from "lucide-react";

type Step = "email" | "code" | "done";

export default function MotDePasseOublie() {
  const [, setLocation] = useLocation();
  const { login: setAuth } = useAuth();
  const { toast } = useToast();

  const forgotMutation = useForgotPassword();
  const resetMutation = useResetPassword();

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await forgotMutation.mutateAsync({ data: { email } });
      setStep("code");
      toast({
        title: "Code envoyé !",
        description: "Vérifiez votre boîte mail (et les spams).",
      });
    } catch {
      toast({ title: "Une erreur est survenue", variant: "destructive" });
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({ title: "Les mots de passe ne correspondent pas", variant: "destructive" });
      return;
    }
    if (password.length < 6) {
      toast({ title: "Le mot de passe doit faire au moins 6 caractères", variant: "destructive" });
      return;
    }
    try {
      const result = await resetMutation.mutateAsync({ data: { email, code: code.trim(), password } });
      setAuth(result.token, result.user);
      setStep("done");
      setTimeout(() => setLocation(result.user.role === "admin" ? "/admin" : "/dashboard"), 2000);
    } catch (err: any) {
      const msg = err?.response?.data?.error || "Code invalide ou expiré";
      toast({ title: msg, variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f8fc] p-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-72 bg-gradient-to-br from-primary/10 via-violet-500/5 to-transparent pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <Button variant="ghost" className="inline-flex items-center gap-2 mb-4 font-black text-xl p-0 h-auto" onClick={() => setLocation("/")}>
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <span className="text-white text-base font-black">IA</span>
            </div>
            IA CASH FLOW
          </Button>

          {step === "email" && (
            <>
              <h1 className="text-3xl font-black tracking-tight">Mot de passe oublié 🔐</h1>
              <p className="text-muted-foreground mt-2 text-sm">Entrez votre email pour recevoir un code de réinitialisation</p>
            </>
          )}
          {step === "code" && (
            <>
              <h1 className="text-3xl font-black tracking-tight">Vérification 📬</h1>
              <p className="text-muted-foreground mt-2 text-sm">Un code à 6 chiffres a été envoyé à <strong>{email}</strong></p>
            </>
          )}
          {step === "done" && (
            <>
              <h1 className="text-3xl font-black tracking-tight">Mot de passe mis à jour ✅</h1>
              <p className="text-muted-foreground mt-2 text-sm">Redirection en cours...</p>
            </>
          )}
        </div>

        {/* Step: Email */}
        {step === "email" && (
          <Card className="border-border/60 bg-white shadow-lg rounded-2xl">
            <CardContent className="pt-8 pb-6 px-6 md:px-8">
              <form onSubmit={handleSendCode} className="space-y-5">
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="font-semibold">Adresse e-mail</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="ton@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="pl-9"
                      autoFocus
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full py-6 text-base font-bold bg-primary hover:bg-primary/90"
                  disabled={forgotMutation.isPending}
                >
                  {forgotMutation.isPending ? (
                    <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Envoi en cours…</>
                  ) : (
                    "Envoyer le code"
                  )}
                </Button>
                <div className="text-center">
                  <Button variant="link" className="text-sm text-muted-foreground p-0 h-auto gap-1" onClick={() => setLocation("/login")}>
                    <ArrowLeft className="h-3.5 w-3.5" /> Retour à la connexion
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Step: Code + New Password */}
        {step === "code" && (
          <Card className="border-border/60 bg-white shadow-lg rounded-2xl">
            <CardContent className="pt-8 pb-6 px-6 md:px-8">
              <form onSubmit={handleResetPassword} className="space-y-5">
                {/* Code input */}
                <div className="space-y-1.5">
                  <Label htmlFor="code" className="font-semibold">Code à 6 chiffres</Label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="code"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]{6}"
                      maxLength={6}
                      placeholder="000000"
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      required
                      className="pl-9 text-center tracking-[0.5em] text-xl font-black"
                      autoFocus
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">⏰ Ce code expire dans 15 minutes</p>
                </div>

                {/* New password */}
                <div className="space-y-1.5">
                  <Label htmlFor="password" className="font-semibold">Nouveau mot de passe</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Minimum 6 caractères"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="pl-9 pr-10"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowPassword((v) => !v)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm password */}
                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword" className="font-semibold">Confirmer le mot de passe</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="Répétez votre mot de passe"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="pl-9"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full py-6 text-base font-bold bg-primary hover:bg-primary/90"
                  disabled={resetMutation.isPending || code.length < 6}
                >
                  {resetMutation.isPending ? (
                    <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Réinitialisation…</>
                  ) : (
                    "Réinitialiser mon mot de passe"
                  )}
                </Button>

                <div className="flex justify-between items-center">
                  <Button
                    type="button"
                    variant="link"
                    className="text-sm text-muted-foreground p-0 h-auto gap-1"
                    onClick={() => setStep("email")}
                  >
                    <ArrowLeft className="h-3.5 w-3.5" /> Changer d'email
                  </Button>
                  <Button
                    type="button"
                    variant="link"
                    className="text-sm text-primary p-0 h-auto"
                    disabled={forgotMutation.isPending}
                    onClick={async () => {
                      await forgotMutation.mutateAsync({ data: { email } });
                      toast({ title: "Nouveau code envoyé !" });
                    }}
                  >
                    Renvoyer le code
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Step: Done */}
        {step === "done" && (
          <Card className="border-border/60 bg-white shadow-lg rounded-2xl">
            <CardContent className="pt-10 pb-10 px-6 text-center">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-xl font-black mb-2">Mot de passe mis à jour !</h2>
              <p className="text-muted-foreground text-sm">Vous allez être redirigé automatiquement...</p>
              <Loader2 className="w-5 h-5 animate-spin text-primary mx-auto mt-4" />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
