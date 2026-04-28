import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, Zap, Check, Loader2, ArrowRight, Lock,
  Phone, Smartphone, RefreshCw, CheckCircle, XCircle,
  ChevronDown,
} from "lucide-react";

// ── Supported countries & correspondents ──────────────────────────────────
const COUNTRIES = [
  { code: "BEN", name: "Bénin", flag: "🇧🇯", prefix: "+229", currency: "XOF",
    correspondents: [
      { id: "MTN_MOMO_BEN", label: "MTN MoMo" },
      { id: "MOOV_BEN",     label: "Moov Money" },
    ]},
  { code: "CIV", name: "Côte d'Ivoire", flag: "🇨🇮", prefix: "+225", currency: "XOF",
    correspondents: [
      { id: "MTN_MOMO_CIV", label: "MTN MoMo" },
      { id: "ORANGE_CIV",   label: "Orange Money" },
    ]},
  { code: "SEN", name: "Sénégal", flag: "🇸🇳", prefix: "+221", currency: "XOF",
    correspondents: [
      { id: "ORANGE_SEN", label: "Orange Money" },
      { id: "FREE_SEN",   label: "Free Money" },
    ]},
  { code: "CMR", name: "Cameroun", flag: "🇨🇲", prefix: "+237", currency: "XAF",
    correspondents: [
      { id: "MTN_MOMO_CMR", label: "MTN MoMo" },
    ]},
  { code: "COG", name: "Congo", flag: "🇨🇬", prefix: "+242", currency: "XAF",
    correspondents: [
      { id: "MTN_MOMO_COG", label: "MTN MoMo" },
      { id: "AIRTEL_COG",   label: "Airtel Money" },
    ]},
  { code: "GAB", name: "Gabon", flag: "🇬🇦", prefix: "+241", currency: "XAF",
    correspondents: [
      { id: "AIRTEL_GAB", label: "Airtel Money" },
    ]},
  { code: "COD", name: "RD Congo", flag: "🇨🇩", prefix: "+243", currency: "CDF",
    correspondents: [
      { id: "AIRTEL_COD",        label: "Airtel Money" },
      { id: "ORANGE_COD",        label: "Orange Money" },
      { id: "VODACOM_MPESA_COD", label: "M-Pesa" },
    ]},
  { code: "KEN", name: "Kenya", flag: "🇰🇪", prefix: "+254", currency: "KES",
    correspondents: [
      { id: "MPESA_KEN", label: "M-Pesa" },
    ]},
  { code: "RWA", name: "Rwanda", flag: "🇷🇼", prefix: "+250", currency: "RWF",
    correspondents: [
      { id: "MTN_MOMO_RWA", label: "MTN MoMo" },
      { id: "AIRTEL_RWA",   label: "Airtel Money" },
    ]},
  { code: "UGA", name: "Uganda", flag: "🇺🇬", prefix: "+256", currency: "UGX",
    correspondents: [
      { id: "MTN_MOMO_UGA",    label: "MTN MoMo" },
      { id: "AIRTEL_OAPI_UGA", label: "Airtel Money" },
    ]},
  { code: "ZMB", name: "Zambie", flag: "🇿🇲", prefix: "+260", currency: "ZMW",
    correspondents: [
      { id: "MTN_MOMO_ZMB", label: "MTN MoMo" },
      { id: "ZAMTEL_ZMB",   label: "Zamtel" },
    ]},
];

const CURRENCY_AMOUNT: Record<string, string> = {
  XOF: "10 000 FCFA", XAF: "10 000 FCFA",
  CDF: "28 000 FC", KES: "600 KES",
  RWF: "12 000 RWF", UGX: "37 000 UGX",
  ZMW: "270 ZMW", SLE: "230 SLE",
};

type Step = "form" | "waiting" | "success" | "failed";

// ── Component ──────────────────────────────────────────────────────────────
export default function Paiement() {
  const { user, refreshUser } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Form state
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
  const [phone, setPhone] = useState("");
  const [correspondent, setCorrespondent] = useState(COUNTRIES[0].correspondents[0]);
  const [detecting, setDetecting] = useState(false);
  const [showCountryList, setShowCountryList] = useState(false);

  // Payment state
  const [step, setStep] = useState<Step>("form");
  const [depositId, setDepositId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [pollCount, setPollCount] = useState(0);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Base API URL
  const base = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");

  // Clean phone input (strip non-digits)
  const cleanPhone = (raw: string) => raw.replace(/\D/g, "");

  // Full MSISDN = country prefix digits + local number
  const fullMsisdn = () => {
    const prefix = selectedCountry.prefix.replace("+", "");
    const local = cleanPhone(phone);
    if (!local) return "";
    // Avoid double-prefixing
    if (local.startsWith(prefix)) return local;
    return `${prefix}${local}`;
  };

  // Auto-detect network from phone number
  const detectNetwork = async () => {
    const msisdn = fullMsisdn();
    if (!msisdn || msisdn.length < 8) return;
    setDetecting(true);
    try {
      const res = await fetch(`${base}/api/payment/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ msisdn }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.correspondent) {
          // Find in current country list
          const found = selectedCountry.correspondents.find(
            (c) => c.id === data.correspondent
          );
          if (found) setCorrespondent(found);
          // Also update country if different
          if (data.country && data.country !== selectedCountry.code) {
            const foundCountry = COUNTRIES.find((c) => c.code === data.country);
            if (foundCountry) {
              setSelectedCountry(foundCountry);
              const foundCorr = foundCountry.correspondents.find(
                (c) => c.id === data.correspondent
              );
              if (foundCorr) setCorrespondent(foundCorr);
            }
          }
        }
      }
    } catch {}
    setDetecting(false);
  };

  // When country changes, reset correspondent to first
  const handleCountryChange = (c: typeof COUNTRIES[0]) => {
    setSelectedCountry(c);
    setCorrespondent(c.correspondents[0]);
    setShowCountryList(false);
    setPhone("");
  };

  // Initiate payment
  const handlePay = async () => {
    if (!user) { setLocation("/register"); return; }

    const msisdn = fullMsisdn();
    if (!msisdn || msisdn.length < 8) {
      toast({ title: "Numéro invalide", description: "Entre ton numéro complet.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${base}/api/payment/initiate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          phone: msisdn,
          correspondent: correspondent.id,
          country: selectedCountry.code,
        }),
      });

      let data;
      try {
        data = await res.json();
      } catch (e) {
        throw new Error("Invalid JSON response from server");
      }

      if (!res.ok) {
        toast({ title: "Erreur", description: data?.error || "Paiement refusé", variant: "destructive" });
        setLoading(false);
        return;
      }

      setDepositId(data.depositId);
      setStep("waiting");
      startPolling(data.depositId);
    } catch {
      toast({ title: "Erreur réseau", description: "Réessaie dans quelques secondes.", variant: "destructive" });
    }
    setLoading(false);
  };

  // Poll for payment status every 4 seconds (max 75 attempts = 5 minutes)
  const startPolling = (id: string) => {
    setPollCount(0);
    pollRef.current = setInterval(async () => {
      setPollCount((n) => {
        if (n >= 75) {
          stopPolling();
          return n;
        }
        return n + 1;
      });

      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${base}/api/payment/status/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;

        const data = await res.json();

        if (data.status === "COMPLETED") {
          stopPolling();
          setStep("success");
          if (refreshUser) await refreshUser();
        } else if (data.status === "FAILED") {
          stopPolling();
          setStep("failed");
        }
      } catch {}
    }, 4000);
  };

  const stopPolling = () => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
  };

  useEffect(() => () => stopPolling(), []);

  const amountLabel = CURRENCY_AMOUNT[selectedCountry.currency] || "10 000 FCFA";

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero */}
      <section className="relative py-16 hero-gradient grid-pattern overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 blob blur-[80px] opacity-60" />
        <div className="container mx-auto px-4 relative z-10 text-center max-w-xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 border border-green-300 text-green-700 text-sm font-semibold mb-5">
              <Lock className="h-4 w-4" /> Paiement sécurisé • Mobile Money
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-3 leading-tight">
              Rejoins <span className="gradient-text">IA CASH FLOW</span>
            </h1>
            <p className="text-muted-foreground">
              Paye depuis ton téléphone — MTN MoMo, Moov, Orange Money et plus.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4 max-w-lg">
          <AnimatePresence mode="wait">

            {/* ── STEP: FORM ─────────────────────────────── */}
            {step === "form" && (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-5"
              >
                {/* Order summary */}
                <div className="bg-white rounded-2xl border border-border shadow-sm p-5 flex items-center justify-between">
                  <div>
                    <p className="font-black text-sm">Formation IA CASH FLOW</p>
                    <p className="text-xs text-muted-foreground">Accès complet à vie · Mise à jour garantie</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground line-through">50 000 FCFA</p>
                    <p className="text-2xl font-black gradient-text">{amountLabel}</p>
                  </div>
                </div>

                {/* Main payment form */}
                <div className="bg-white rounded-2xl border border-border shadow-sm p-6 space-y-5">
                  <h2 className="font-black text-lg">Ton numéro Mobile Money</h2>

                  {/* Country selector */}
                  <div className="relative">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">
                      Pays
                    </label>
                    <button
                      onClick={() => setShowCountryList(!showCountryList)}
                      className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl border-2 border-border hover:border-primary/40 transition-colors bg-muted/30"
                    >
                      <span className="flex items-center gap-3">
                        <span className="text-2xl">{selectedCountry.flag}</span>
                        <span className="font-semibold text-sm">{selectedCountry.name}</span>
                        <span className="text-xs text-muted-foreground">{selectedCountry.prefix}</span>
                      </span>
                      <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${showCountryList ? "rotate-180" : ""}`} />
                    </button>

                    {showCountryList && (
                      <div className="absolute z-20 mt-2 w-full bg-white border border-border rounded-xl shadow-xl max-h-64 overflow-y-auto">
                        {COUNTRIES.map((c) => (
                          <button
                            key={c.code}
                            onClick={() => handleCountryChange(c)}
                            className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left ${c.code === selectedCountry.code ? "bg-primary/5 border-l-2 border-primary" : ""}`}
                          >
                            <span className="text-xl">{c.flag}</span>
                            <span className="font-medium text-sm">{c.name}</span>
                            <span className="text-xs text-muted-foreground ml-auto">{c.prefix}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Phone number */}
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">
                      Numéro de téléphone
                    </label>
                    <div className="flex gap-2">
                      <div className="flex items-center px-3 py-3 bg-muted rounded-xl border border-border font-mono text-sm font-semibold text-muted-foreground shrink-0">
                        {selectedCountry.prefix}
                      </div>
                      <Input
                        type="tel"
                        placeholder="67 000 000"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        onBlur={detectNetwork}
                        className="rounded-xl border-border text-base font-mono h-12"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1.5">
                      {fullMsisdn() ? (
                        <span className="text-primary font-medium">Numéro détecté : {fullMsisdn()}</span>
                      ) : (
                        "Entre le numéro lié à ton compte Mobile Money"
                      )}
                    </p>
                  </div>

                  {/* Network / Correspondent */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Réseau
                      </label>
                      {detecting && (
                        <span className="flex items-center gap-1 text-xs text-primary">
                          <Loader2 className="h-3 w-3 animate-spin" /> Détection...
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {selectedCountry.correspondents.map((c) => (
                        <button
                          key={c.id}
                          onClick={() => setCorrespondent(c)}
                          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${
                            correspondent.id === c.id
                              ? "border-primary bg-primary/5 text-primary"
                              : "border-border hover:border-primary/40 text-foreground/70"
                          }`}
                        >
                          {correspondent.id === c.id && <Check className="h-3.5 w-3.5" />}
                          {c.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Pay button */}
                  {user ? (
                    <Button
                      onClick={handlePay}
                      disabled={loading || !phone}
                      className="w-full h-14 text-lg font-black bg-primary hover:bg-primary/90 text-white btn-glow rounded-2xl mt-2"
                    >
                      {loading ? (
                        <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Envoi en cours...</>
                      ) : (
                        <><Smartphone className="mr-2 h-5 w-5" /> Payer {amountLabel} <ArrowRight className="ml-2 h-5 w-5" /></>
                      )}
                    </Button>
                  ) : (
                    <div className="space-y-2">
                      <Button onClick={() => setLocation("/register")} className="w-full h-12 rounded-2xl bg-primary text-white font-bold">
                        Créer un compte pour payer
                      </Button>
                      <p className="text-xs text-center text-muted-foreground">
                        Déjà inscrit ?{" "}
                        <button className="text-primary font-semibold underline" onClick={() => setLocation("/login")}>
                          Se connecter
                        </button>
                      </p>
                    </div>
                  )}
                </div>

                {/* Trust badges */}
                <div className="grid grid-cols-3 gap-3 text-center">
                  {[
                    { icon: <Lock className="h-4 w-4 mx-auto mb-1 text-green-500" />, label: "SSL sécurisé" },
                    { icon: <Zap className="h-4 w-4 mx-auto mb-1 text-blue-500" />, label: "Accès immédiat" },
                    { icon: <Shield className="h-4 w-4 mx-auto mb-1 text-purple-500" />, label: "Garanti 30J" },
                  ].map((item, i) => (
                    <div key={i} className="bg-white rounded-xl p-3 border border-border shadow-sm">
                      {item.icon}
                      <p className="text-xs font-medium text-muted-foreground">{item.label}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ── STEP: WAITING ──────────────────────────── */}
            {step === "waiting" && (
              <motion.div
                key="waiting"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="bg-white rounded-3xl border-2 border-primary/30 shadow-xl p-10 text-center"
              >
                <div className="relative w-24 h-24 mx-auto mb-6">
                  <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping" />
                  <div className="relative w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                    <Smartphone className="h-12 w-12 text-primary" />
                  </div>
                </div>

                <h1 className="text-2xl font-black mb-2">Confirme sur ton téléphone</h1>
                <p className="text-muted-foreground mb-1">
                  Une notification a été envoyée au <strong>{fullMsisdn()}</strong>
                </p>
                <p className="text-sm text-muted-foreground mb-6">
                  Ouvre ton application <strong>{correspondent.label}</strong> ou attends le message USSD et entre ton <strong>PIN</strong> pour confirmer le paiement de <strong>{amountLabel}</strong>.
                </p>

                <div className="bg-primary/5 rounded-2xl p-5 border border-primary/20 mb-6 text-left space-y-3">
                  {[
                    "Tu vas recevoir une notification ou un SMS USSD",
                    "Ouvre ton application ou réponds au USSD",
                    "Entre ton code PIN Mobile Money",
                    "L'accès à la formation s'active automatiquement",
                  ].map((step, i) => (
                    <div key={i} className="flex items-start gap-3 text-sm">
                      <span className="w-5 h-5 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span>En attente de confirmation... ({Math.ceil((75 - pollCount) * 4 / 60)} min restantes)</span>
                </div>

                {pollCount >= 75 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-sm text-destructive font-medium">Délai dépassé</p>
                    <Button variant="outline" size="sm" className="rounded-xl" onClick={() => setStep("form")}>
                      <RefreshCw className="h-4 w-4 mr-2" /> Réessayer
                    </Button>
                  </div>
                )}
              </motion.div>
            )}

            {/* ── STEP: SUCCESS ──────────────────────────── */}
            {step === "success" && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-3xl border-2 border-green-400 shadow-xl p-10 text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                  className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6"
                >
                  <CheckCircle className="h-14 w-14 text-green-500" />
                </motion.div>

                <h1 className="text-3xl font-black mb-2 text-green-700">Paiement confirmé !</h1>
                <p className="text-muted-foreground mb-8">
                  Bienvenue dans <strong>IA CASH FLOW</strong> ! Ton accès est activé.
                </p>

                <div className="bg-green-50 rounded-2xl p-5 mb-8 border border-green-200 text-left space-y-2">
                  {[
                    "🎬 Tous les modules vidéo HD sont débloqués",
                    "💬 Tu vas recevoir le lien du groupe WhatsApp",
                    "📺 Rejoins le live dimanche à 22h heure Bénin",
                    "🤖 Accède à la bibliothèque de prompts IA",
                  ].map((item, i) => (
                    <p key={i} className="text-sm text-green-700">{item}</p>
                  ))}
                </div>

                <Button
                  onClick={() => setLocation("/dashboard")}
                  className="w-full h-13 text-lg font-black bg-primary hover:bg-primary/90 text-white rounded-2xl btn-glow"
                >
                  Accéder à la formation <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </motion.div>
            )}

            {/* ── STEP: FAILED ───────────────────────────── */}
            {step === "failed" && (
              <motion.div
                key="failed"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-3xl border-2 border-red-300 shadow-xl p-10 text-center"
              >
                <div className="w-24 h-24 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
                  <XCircle className="h-14 w-14 text-red-500" />
                </div>
                <h1 className="text-2xl font-black mb-2 text-red-700">Paiement échoué</h1>
                <p className="text-muted-foreground mb-8">
                  Le paiement n'a pas pu être traité. Aucun montant n'a été débité. Vérifie ton solde et réessaie.
                </p>
                <div className="space-y-3">
                  <Button onClick={() => setStep("form")} className="w-full h-12 rounded-2xl bg-primary text-white font-bold">
                    <RefreshCw className="mr-2 h-4 w-4" /> Réessayer
                  </Button>
                  <a href="https://wa.me/22967000000" target="_blank" rel="noreferrer">
                    <Button variant="outline" className="w-full h-12 rounded-2xl border-green-400 text-green-700 hover:bg-green-50">
                      <Phone className="mr-2 h-4 w-4" /> Support WhatsApp
                    </Button>
                  </a>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
}
