import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { useLogin } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function Login() {
  const [, setLocation] = useLocation();
  const { login: setAuth } = useAuth();
  const { toast } = useToast();
  const loginMutation = useLogin();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Read the return URL from query params (set by ProtectedRoute on redirect)
  const returnTo = new URLSearchParams(window.location.search).get("returnTo") || "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await loginMutation.mutateAsync({
        data: { email, password }
      });
      
      // login() now handles the redirect — pass returnTo so the user goes back to their page
      setAuth(response.token, response.user, returnTo || undefined);
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error?.error || "Please check your credentials and try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f8fc] p-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-72 bg-gradient-to-br from-primary/10 via-violet-500/5 to-transparent pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <Button variant="ghost" className="inline-flex items-center gap-2 mb-4 font-black text-xl p-0 h-auto" onClick={() => setLocation("/")}>
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <span className="text-white text-base font-black">IA</span>
            </div>
            IA CASH FLOW
          </Button>
          <h1 className="text-3xl font-black tracking-tight">Bon retour 👋</h1>
          <p className="text-muted-foreground mt-2">Connecte-toi pour accéder à ta formation</p>
        </div>

        <Card className="border-border/60 bg-white shadow-lg rounded-2xl">
          <CardContent className="pt-8 pb-6 px-6 md:px-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="email">Adresse e-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="ton@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Mot de passe</Label>
                  <Button
                    type="button"
                    variant="link"
                    className="text-xs text-primary p-0 h-auto font-semibold"
                    onClick={() => setLocation("/mot-de-passe-oublie")}
                  >
                    Mot de passe oublié ?
                  </Button>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full py-6 text-base font-bold bg-primary hover:bg-primary/90"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? (
                  <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Connexion…</>
                ) : (
                  "Se connecter"
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center border-t border-border/50 pt-5 pb-6">
            <p className="text-sm text-muted-foreground">
              Pas encore de compte ?{" "}
              <Button variant="link" className="text-primary p-0 h-auto font-semibold" onClick={() => setLocation("/register")}>
                S'inscrire gratuitement
              </Button>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
