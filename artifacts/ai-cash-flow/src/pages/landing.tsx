import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { useCaptureLead } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import facebookImg from "@assets/ChatGPT_Image_Apr_18,_2026,_02_31_17_PM_1776519398839.png";
import tiktokImg from "@assets/ChatGPT_Image_Apr_18,_2026,_02_36_55_PM_1776519428935.png";
import analyticsImg from "@assets/ChatGPT_Image_Apr_18,_2026,_02_34_29_PM_1776519486448.png";
import logoImg from "@assets/ChatGPT_Image_Apr_18,_2026,_02_56_10_PM_1776520714293.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, useInView, useMotionValue, useSpring } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import {
  Rocket,
  CheckCircle2,
  TrendingUp,
  Zap,
  Shield,
  Star,
  PlayCircle,
  MessageCircle,
  ArrowRight,
  Sparkles,
  Video,
  Brain,
  DollarSign,
  Users,
  Clock,
  Globe,
  ChevronRight,
  Check,
  Eye,
  Smartphone,
} from "lucide-react";

// ─── Animated counter hook ───────────────────────────────────────────────────
function useCounter(end: number, duration: number = 2000) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = end / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [inView, end, duration]);

  return { count, ref };
}

// ─── Revenue chart data ──────────────────────────────────────────────────────
const revenueData = [
  { mois: "Jan", revenus: 0 },
  { mois: "Fév", revenus: 180 },
  { mois: "Mar", revenus: 420 },
  { mois: "Avr", revenus: 890 },
  { mois: "Mai", revenus: 1640 },
  { mois: "Jun", revenus: 2800 },
  { mois: "Jul", revenus: 4200 },
  { mois: "Aoû", revenus: 5900 },
  { mois: "Sep", revenus: 7800 },
  { mois: "Oct", revenus: 9500 },
  { mois: "Nov", revenus: 11200 },
  { mois: "Déc", revenus: 14800 },
];

// ─── Stat card ───────────────────────────────────────────────────────────────
function StatCard({ value, suffix = "", label, icon }: { value: number; suffix?: string; label: string; icon: React.ReactNode }) {
  const { count, ref } = useCounter(value);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white rounded-xl p-4 shadow-md border border-border/50 text-center"
    >
      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-2">
        {icon}
      </div>
      <div className="text-xl md:text-2xl font-black text-foreground">
        <span ref={ref}>{count.toLocaleString("fr-FR")}</span>{suffix}
      </div>
      <div className="text-xs text-muted-foreground mt-0.5 font-medium">{label}</div>
    </motion.div>
  );
}

// ─── Floating notification card ──────────────────────────────────────────────
function NotifCard({ emoji, title, sub, delay = 0 }: { emoji: string; title: string; sub: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="bg-white rounded-xl shadow-lg border border-border/50 p-3 flex items-center gap-3 min-w-[220px]"
    >
      <span className="text-2xl">{emoji}</span>
      <div>
        <div className="text-sm font-semibold text-foreground">{title}</div>
        <div className="text-xs text-muted-foreground">{sub}</div>
      </div>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Landing() {
  const { toast } = useToast();
  const captureLead = useCaptureLead();
  const [email, setEmail] = useState("");
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    try {
      await captureLead.mutateAsync({ data: { email } });
      toast({
        title: "Tu es sur la liste !",
        description: "Vérifie ton email pour recevoir la formation gratuite.",
      });
      setEmail("");
    } catch {
      toast({
        title: "Erreur",
        description: "Quelque chose s'est mal passé. Réessaie.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">

      {/* ════════════════════════════════════════════════
          HERO SECTION
          ════════════════════════════════════════════════ */}
      <section className="relative flex items-center pt-16 pb-12 md:pt-20 md:pb-16 overflow-hidden hero-gradient grid-pattern">
        {/* Background blobs */}
        <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] blob bg-primary/10 blur-[80px] opacity-60" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[350px] h-[350px] blob bg-accent/10 blur-[80px] opacity-60" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">

            {/* LEFT: Copy */}
            <div className="space-y-5 md:space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs md:text-sm font-semibold mb-4">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                  </span>
                  La formation #1 en création de contenu IA Faceless
                </div>

                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-tight leading-[1.12]">
                  Crée du contenu viral{" "}
                  <span className="gradient-text">sans montrer ton visage</span>{" "}
                  et génère des revenus en automatique
                </h1>

                <p className="text-sm md:text-base text-muted-foreground leading-relaxed max-w-xl mt-4">
                  Maîtrise les outils IA pour créer des centaines de vidéos par mois, 
                  bâtir une audience massive et monétiser sans jamais apparaître à l'écran — 
                  même si tu pars de zéro.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="flex flex-col sm:flex-row gap-3"
              >
                <Link href="/register">
                  <Button
                    className="w-full sm:w-auto text-sm md:text-base h-11 md:h-12 px-6 bg-primary hover:bg-primary/90 text-white font-bold btn-glow shadow-lg"
                    data-testid="button-hero-cta"
                  >
                    Accéder aux formations <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className="w-full sm:w-auto text-sm md:text-base h-11 md:h-12 px-6 border-2 border-border hover:border-primary/40 hover:bg-primary/5"
                  onClick={() => setIsVideoOpen(true)}
                >
                  <PlayCircle className="mr-2 h-4 w-4 text-primary" />
                  Voir la vidéo gratuite
                </Button>
              </motion.div>

              {/* Trust signals */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex flex-wrap items-center gap-4 pt-1"
              >
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Shield className="h-3.5 w-3.5 text-green-500" />
                  <span>Garantie 30 jours</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Users className="h-3.5 w-3.5 text-primary" />
                  <span>+2 400 élèves actifs</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
                  <span>4.9/5 (340 avis)</span>
                </div>
              </motion.div>
            </div>

            {/* RIGHT: Real Facebook Prime Toon page screenshot */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative flex justify-center lg:justify-end mt-4 lg:mt-0"
            >
              {/* Floating notification cards — desktop only */}
              <div className="hidden lg:block absolute top-2 -left-6 z-20 animate-float-delayed">
                <NotifCard emoji="👥" title="142K abonnés Facebook" sub="Page Prime Toon" delay={0.8} />
              </div>
              <div className="hidden lg:block absolute bottom-8 -left-4 z-20 animate-float">
                <NotifCard emoji="🔥" title="13M de vues !" sub="En 28 jours seulement" delay={1.0} />
              </div>

              {/* Real Facebook page image — clickable */}
              <a
                href="https://www.facebook.com/share/1AwyWRS87U/"
                target="_blank"
                rel="noreferrer"
                className="animate-float-slow relative max-w-[280px] sm:max-w-[320px] lg:max-w-[360px] w-full block group"
                title="Voir notre page Facebook Prime Toon"
              >
                <div
                  className="rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl border-4 border-white group-hover:border-primary/40 transition-all duration-300"
                  style={{ boxShadow: "0 24px 60px rgba(99,91,255,0.2), 0 12px 30px rgba(0,0,0,0.10)" }}
                >
                  <img
                    src={facebookImg}
                    alt="Page Facebook Prime Toon – 142K abonnés"
                    className="w-full h-auto object-cover group-hover:scale-[1.02] transition-transform duration-300"
                  />
                </div>
                {/* Badge overlay */}
                <div className="absolute -bottom-3 -right-3 bg-white rounded-xl px-3 py-1.5 shadow-lg border border-border flex items-center gap-2 group-hover:shadow-primary/20 transition-shadow">
                  <span className="text-base">📘</span>
                  <div>
                    <div className="text-xs font-bold text-foreground">Prime Toon</div>
                    <div className="text-xs text-primary font-semibold">142K followers →</div>
                  </div>
                </div>
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          SOCIAL PROOF BAR — Platform logos
          ════════════════════════════════════════════════ */}
      <section className="py-4 border-y border-border bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-5 md:gap-10">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest whitespace-nowrap">
              Nos élèves créent sur
            </p>

            {/* TikTok */}
            <a href="https://www.tiktok.com/@prime_toon_?_r=1&_t=ZT-95dultLPR53" target="_blank" rel="noreferrer"
              className="flex items-center gap-2 opacity-60 hover:opacity-100 transition-opacity group">
              <svg viewBox="0 0 24 24" className="h-7 w-7 fill-[#010101] group-hover:fill-[#69C9D0]" xmlns="http://www.w3.org/2000/svg">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.34 6.34 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.99a8.28 8.28 0 0 0 4.84 1.54V7.08a4.85 4.85 0 0 1-1.07-.39z"/>
              </svg>
              <span className="text-sm font-bold text-gray-600 group-hover:text-[#010101]">TikTok</span>
            </a>

            {/* YouTube */}
            <div className="flex items-center gap-2 opacity-60 hover:opacity-90 transition-opacity">
              <svg viewBox="0 0 24 24" className="h-7 w-7 fill-[#FF0000]" xmlns="http://www.w3.org/2000/svg">
                <path d="M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.54 3.5 12 3.5 12 3.5s-7.54 0-9.38.55A3.02 3.02 0 0 0 .5 6.19 31.6 31.6 0 0 0 0 12a31.6 31.6 0 0 0 .5 5.81A3.02 3.02 0 0 0 2.62 19.95C4.46 20.5 12 20.5 12 20.5s7.54 0 9.38-.55a3.02 3.02 0 0 0 2.12-2.14A31.6 31.6 0 0 0 24 12a31.6 31.6 0 0 0-.5-5.81zM9.75 15.02V8.98L15.5 12l-5.75 3.02z"/>
              </svg>
              <span className="text-sm font-bold text-gray-600">YouTube</span>
            </div>

            {/* Instagram */}
            <div className="flex items-center gap-2 opacity-60 hover:opacity-90 transition-opacity">
              <svg viewBox="0 0 24 24" className="h-7 w-7" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="ig" x1="0%" y1="100%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#feda75"/>
                    <stop offset="25%" stopColor="#fa7e1e"/>
                    <stop offset="50%" stopColor="#d62976"/>
                    <stop offset="75%" stopColor="#962fbf"/>
                    <stop offset="100%" stopColor="#4f5bd5"/>
                  </linearGradient>
                </defs>
                <path fill="url(#ig)" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
              </svg>
              <span className="text-sm font-bold text-gray-600">Instagram</span>
            </div>

            {/* Facebook */}
            <a href="https://www.facebook.com/share/1AwyWRS87U/" target="_blank" rel="noreferrer"
              className="flex items-center gap-2 opacity-60 hover:opacity-100 transition-opacity group">
              <svg viewBox="0 0 24 24" className="h-7 w-7 fill-[#1877F2]" xmlns="http://www.w3.org/2000/svg">
                <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
              </svg>
              <span className="text-sm font-bold text-gray-600 group-hover:text-[#1877F2]">Facebook</span>
            </a>

            {/* Pinterest */}
            <div className="flex items-center gap-2 opacity-60 hover:opacity-90 transition-opacity">
              <svg viewBox="0 0 24 24" className="h-7 w-7 fill-[#E60023]" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/>
              </svg>
              <span className="text-sm font-bold text-gray-600">Pinterest</span>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          STATS SECTION
          ════════════════════════════════════════════════ */}
      <section className="py-10 md:py-14 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8"
          >
            <h2 className="text-xl md:text-2xl lg:text-3xl font-black mb-2">
              Des résultats <span className="gradient-text">prouvés</span>
            </h2>
            <p className="text-muted-foreground text-sm md:text-base">Chiffres réels de notre communauté</p>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
            <StatCard value={142} suffix="K" label="Abonnés Facebook" icon={<Users className="h-6 w-6 text-primary" />} />
            <StatCard value={31} suffix="K" label="Abonnés TikTok" icon={<Smartphone className="h-6 w-6 text-primary" />} />
            <StatCard value={13} suffix="M" label="Vues en 28 jours" icon={<Eye className="h-6 w-6 text-primary" />} />
            <StatCard value={748625} suffix="" label="Engagements totaux" icon={<TrendingUp className="h-6 w-6 text-primary" />} />
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          REAL SOCIAL PROOF — TikTok + Analytics
          ════════════════════════════════════════════════ */}
      <section className="py-10 md:py-14 bg-gradient-to-br from-primary/5 via-background to-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-50 text-green-700 text-xs font-semibold mb-3">
              <CheckCircle2 className="h-3.5 w-3.5" /> Preuve réelle — Nos propres comptes
            </div>
            <h2 className="text-xl md:text-2xl lg:text-3xl font-black mb-2">
              On ne vend pas du rêve. <span className="gradient-text">On montre les chiffres réels.</span>
            </h2>
            <p className="text-muted-foreground text-sm md:text-base max-w-2xl mx-auto">
              Ce que tu vois ci-dessous, c'est notre page TikTok <strong>@prime_toon_</strong> et 
              le tableau de bord analytics Facebook — tout ça créé avec exactement la méthode qu'on enseigne.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* TikTok Profile */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="absolute -top-3 -left-3 bg-black text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 z-10">
                <span>🎵</span> TikTok @prime_toon_
              </div>
              <a
                href="https://www.tiktok.com/@prime_toon_?_r=1&_t=ZT-95dultLPR53"
                target="_blank"
                rel="noreferrer"
                className="block group"
              >
              <div
                className="rounded-3xl overflow-hidden shadow-xl border-4 border-white group-hover:border-black/20 hover:shadow-2xl transition-all duration-300"
                style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.12)" }}
              >
                <img
                  src={tiktokImg}
                  alt="Profil TikTok Prime Toon – 31K abonnés, 98.8K likes"
                  className="w-full h-auto object-cover group-hover:scale-[1.02] transition-transform duration-300"
                />
              </div>
              </a>
              <div className="mt-4 flex items-center justify-center gap-4">
                <div className="bg-white rounded-xl px-4 py-2 shadow-sm border border-border text-center">
                  <div className="text-xl font-black text-foreground">31K</div>
                  <div className="text-xs text-muted-foreground">Abonnés</div>
                </div>
                <div className="bg-white rounded-xl px-4 py-2 shadow-sm border border-border text-center">
                  <div className="text-xl font-black text-foreground">98.8K</div>
                  <div className="text-xs text-muted-foreground">Likes</div>
                </div>
                <div className="bg-white rounded-xl px-4 py-2 shadow-sm border border-border text-center">
                  <div className="text-xl font-black text-foreground">Faceless</div>
                  <div className="text-xs text-muted-foreground">100% IA</div>
                </div>
              </div>
            </motion.div>

            {/* Facebook Analytics Dashboard */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="absolute -top-3 -left-3 bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 z-10">
                <span>📊</span> Analytics Facebook
              </div>
              <div
                className="rounded-3xl overflow-hidden shadow-xl border-4 border-white hover:shadow-2xl transition-shadow duration-300"
                style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.12)" }}
              >
                <img
                  src={analyticsImg}
                  alt="Tableau de bord analytics Facebook Prime Toon – 13M vues"
                  className="w-full h-auto object-cover"
                />
              </div>
              <div className="mt-4 flex items-center justify-center gap-4">
                <div className="bg-white rounded-xl px-4 py-2 shadow-sm border border-border text-center">
                  <div className="text-xl font-black text-green-600">13M</div>
                  <div className="text-xs text-muted-foreground">Vues (28j)</div>
                </div>
                <div className="bg-white rounded-xl px-4 py-2 shadow-sm border border-border text-center">
                  <div className="text-xl font-black text-foreground">748K</div>
                  <div className="text-xs text-muted-foreground">Engagements</div>
                </div>
                <div className="bg-white rounded-xl px-4 py-2 shadow-sm border border-border text-center">
                  <div className="text-xl font-black text-green-600">+100%</div>
                  <div className="text-xs text-muted-foreground">Croissance</div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Bottom CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-8"
          >
            <p className="text-muted-foreground text-sm md:text-base mb-4">
              Ces résultats ont été obtenus avec <strong>zéro apparition</strong>, <strong>zéro budget pub</strong> et <strong>100% d'outils IA</strong>.<br className="hidden sm:block" />
              Dans la formation, tu apprends exactement comment reproduire ça.
            </p>
            <Link href="/register">
              <Button className="h-11 px-6 text-sm md:text-base font-bold bg-primary text-white hover:bg-primary/90 btn-glow">
                Je veux les mêmes résultats <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          WHAT IS FACELESS CONTENT?
          ════════════════════════════════════════════════ */}
      <section className="py-10 md:py-14 bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-4"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                <Brain className="h-3.5 w-3.5" /> C'est quoi le contenu Faceless IA ?
              </div>
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black leading-tight">
                Crée du contenu viral <span className="gradient-text">sans jamais montrer ton visage</span>
              </h2>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                Le contenu faceless, c'est le modèle parfait pour monétiser sur les réseaux sociaux 
                sans stress. Tu utilises l'IA pour générer des scripts, des voix, des images et 
                des vidéos — sans caméra, sans studio, sans te montrer.
              </p>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                Des milliers de créateurs gagnent entre <strong>1 000€ et 15 000€ par mois</strong> 
                avec cette méthode. Notre formation t'apprend exactement comment faire, étape par étape.
              </p>
              <div className="space-y-4">
                {[
                  "Zéro apparition caméra requise",
                  "IA génère le contenu à ta place",
                  "Fonctionne sur TikTok, YouTube, Instagram",
                  "Revenus passifs 24h/24, 7j/7",
                  "Applicable dès cette semaine",
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                      <Check className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <span className="font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Feature grid cards */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="grid grid-cols-2 gap-5"
            >
              {[
                { icon: <Video className="h-7 w-7 text-primary" />, title: "Vidéos IA", desc: "Génère des vidéos complètes avec voix off et sous-titres automatiques" },
                { icon: <Brain className="h-7 w-7 text-accent" />, title: "Scripts IA", desc: "ChatGPT crée tes scripts viraux en moins de 30 secondes" },
                { icon: <TrendingUp className="h-7 w-7 text-green-500" />, title: "Croissance rapide", desc: "De 0 à 10k abonnés en 60 jours avec la bonne stratégie" },
                { icon: <DollarSign className="h-7 w-7 text-yellow-500" />, title: "Monétisation", desc: "5 sources de revenus différentes grâce à ton audience faceless" },
              ].map((card, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white rounded-2xl p-5 shadow-md border border-border/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="mb-4">{card.icon}</div>
                  <h3 className="font-bold text-base mb-2">{card.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{card.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          REVENUE GRAPH
          ════════════════════════════════════════════════ */}
      <section className="py-10 md:py-14 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-6"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-50 text-green-600 text-xs font-semibold mb-3">
              <TrendingUp className="h-3.5 w-3.5" /> Progression type d'un élève
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black mb-2">
              De 0€ à <span className="gradient-text">14 800€/mois</span> en 12 mois
            </h2>
            <p className="text-muted-foreground text-sm md:text-base max-w-xl mx-auto">
              Voici la progression réelle d'un de nos élèves qui a appliqué la méthode depuis le début.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl p-4 md:p-8 border border-border"
          >
            <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
              <div>
                <div className="text-xs text-muted-foreground">Revenu mensuel total</div>
                <div className="text-2xl md:text-3xl font-black text-foreground">14 800 €</div>
                <div className="text-xs text-green-600 font-semibold flex items-center gap-1 mt-0.5">
                  <TrendingUp className="h-3 w-3" /> +∞ depuis le départ
                </div>
              </div>
              <div className="flex gap-4">
                <div className="text-center">
                  <div className="text-lg md:text-xl font-black text-primary">2.4M</div>
                  <div className="text-xs text-muted-foreground">Vues générées</div>
                </div>
                <div className="text-center">
                  <div className="text-lg md:text-xl font-black text-accent">89k</div>
                  <div className="text-xs text-muted-foreground">Abonnés</div>
                </div>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(252,87%,62%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(252,87%,62%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(240,15%,92%)" />
                <XAxis dataKey="mois" tick={{ fill: "hsl(240,10%,50%)", fontSize: 12 }} />
                <YAxis
                  tickFormatter={(v) => v >= 1000 ? `${v / 1000}k€` : `${v}€`}
                  tick={{ fill: "hsl(240,10%,50%)", fontSize: 12 }}
                />
                <Tooltip
                  formatter={(v: number) => [`${v.toLocaleString("fr-FR")} €`, "Revenus"]}
                  contentStyle={{
                    background: "white",
                    border: "1px solid hsl(240,15%,88%)",
                    borderRadius: "12px",
                    fontSize: "14px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenus"
                  stroke="hsl(252,87%,62%)"
                  strokeWidth={3}
                  fill="url(#revenueGradient)"
                  dot={{ fill: "hsl(252,87%,62%)", r: 4 }}
                  activeDot={{ r: 6, fill: "hsl(252,87%,62%)" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          WHAT'S INSIDE — MODULES
          ════════════════════════════════════════════════ */}
      <section className="py-10 md:py-14 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-3">
              <Sparkles className="h-3.5 w-3.5" /> Ce que tu vas apprendre
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black mb-2">
              Une formation complète, <span className="gradient-text">structurée pour les résultats</span>
            </h2>
            <p className="text-muted-foreground text-sm md:text-base max-w-2xl mx-auto">
              Chaque module est conçu pour t'amener un niveau plus haut. 
              Pas de blabla — que du concret et de l'actionnable.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {[
              {
                num: "01",
                icon: <Brain className="h-6 w-6 text-primary" />,
                title: "Les Fondations de l'IA Faceless",
                desc: "Comprends l'écosystème IA et identifie ton niche à fort potentiel. Les outils essentiels pour démarrer sans budget.",
                tags: ["ChatGPT", "Niche Research", "Mindset"],
                color: "from-primary/10 to-primary/5",
              },
              {
                num: "02",
                icon: <Video className="h-6 w-6 text-accent" />,
                title: "Création de Contenu Automatisée",
                desc: "Génère 30 vidéos par semaine avec l'IA. Scripts, voix off, montage — tout automatisé. Ton contenu travaille pendant que tu dors.",
                tags: ["Heygen", "ElevenLabs", "CapCut IA"],
                color: "from-accent/10 to-accent/5",
              },
              {
                num: "03",
                icon: <TrendingUp className="h-6 w-6 text-green-600" />,
                title: "Croissance & Viralité",
                desc: "Les algorithmes à l'envers. Comprends exactement ce que TikTok, YouTube et Instagram veulent pour exploser ta portée.",
                tags: ["Algorithme", "Hooks", "Trending"],
                color: "from-green-400/10 to-green-400/5",
              },
              {
                num: "04",
                icon: <DollarSign className="h-6 w-6 text-yellow-500" />,
                title: "Monétisation Multi-Sources",
                desc: "Affiliation, formations, partenariats, YouTube Ads, TikTok Creator Fund. 5 sources de revenus avec ton compte faceless.",
                tags: ["Affiliation", "Sponsoring", "Formations"],
                color: "from-yellow-400/10 to-yellow-400/5",
              },
              {
                num: "05",
                icon: <Zap className="h-6 w-6 text-orange-500" />,
                title: "Automatisation & Scalabilité",
                desc: "Systèmes pour gérer 3-5 comptes simultanément. Délègue à l'IA pour te concentrer sur la stratégie haut niveau.",
                tags: ["Automation", "Multi-comptes", "Délégation"],
                color: "from-orange-400/10 to-orange-400/5",
              },
              {
                num: "06",
                icon: <Globe className="h-6 w-6 text-blue-500" />,
                title: "Le Business Modèle Global",
                desc: "Transforme ta présence faceless en véritable business. Personal branding sans visage, tunnel de vente, email list.",
                tags: ["Funnel", "Email Marketing", "Business"],
                color: "from-blue-400/10 to-blue-400/5",
              },
            ].map((module, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="bg-white rounded-2xl p-6 border border-border/60 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 group"
              >
                <div className={`w-full h-1.5 rounded-full bg-gradient-to-r ${module.color} mb-5 opacity-0 group-hover:opacity-100 transition-opacity`} />
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${module.color} flex items-center justify-center`}>
                    {module.icon}
                  </div>
                  <span className="text-4xl font-black text-muted-foreground/15">{module.num}</span>
                </div>
                <h3 className="font-bold text-lg mb-3">{module.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">{module.desc}</p>
                <div className="flex flex-wrap gap-2">
                  {module.tags.map((tag, ti) => (
                    <span key={ti} className="text-xs px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          TESTIMONIALS
          ════════════════════════════════════════════════ */}
      <section className="py-10 md:py-14 bg-gradient-to-b from-primary/5 to-background overflow-hidden">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8"
          >
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black mb-2">
              Ils ont tout changé avec <span className="gradient-text">l'IA Faceless</span>
            </h2>
            <p className="text-muted-foreground text-sm md:text-base">Vrais résultats, vraies personnes.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-4 md:gap-5">
            {[
              {
                name: "Karim M.",
                role: "Ancien salarié → Créateur IA",
                avatar: "K",
                text: "En 3 mois j'ai atteint 11k€/mois. Je travaille depuis mon téléphone, sans montrer mon visage. La méthode est claire, directe, applicable. Je regrette seulement de ne pas avoir commencé plus tôt.",
                revenue: "11 000€/mois",
                platform: "TikTok + YouTube",
                stars: 5,
              },
              {
                name: "Sophie L.",
                role: "Maman solo → Entrepreneur",
                avatar: "S",
                text: "J'avais zéro compétence en tech. Maintenant je génère 200 vidéos par mois avec l'IA. Mon compte YouTube a explosé à 45k abonnés en 4 mois. Je gagne plus qu'avec mon ancien CDI.",
                revenue: "6 800€/mois",
                platform: "YouTube",
                stars: 5,
              },
              {
                name: "Yacine B.",
                role: "Étudiant → Digital Creator",
                avatar: "Y",
                text: "La formation m'a ouvert les yeux sur ce qui est vraiment possible. J'ai lancé 3 comptes faceless dans 3 niches différentes. L'automatisation IA fait tout, moi je supervise et j'encaisse.",
                revenue: "8 400€/mois",
                platform: "TikTok + Instagram",
                stars: 5,
              },
            ].map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl p-6 border border-border shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Stars */}
                <div className="flex gap-1 mb-5">
                  {[...Array(t.stars)].map((_, si) => (
                    <Star key={si} className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>

                <p className="text-muted-foreground leading-relaxed mb-6 italic">"{t.text}"</p>

                {/* Revenue badge */}
                <div className="flex gap-2 mb-5">
                  <span className="text-xs px-2.5 py-1 rounded-full bg-green-50 text-green-700 font-bold">
                    {t.revenue}
                  </span>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary font-semibold">
                    {t.platform}
                  </span>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-border">
                  <div className="h-11 w-11 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold">
                    {t.avatar}
                  </div>
                  <div>
                    <div className="font-bold text-foreground">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          WHAT YOU GET
          ════════════════════════════════════════════════ */}
      <section className="py-10 md:py-14 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-4"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                <Sparkles className="h-3.5 w-3.5" /> Ce que tu obtiens
              </div>
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black leading-tight">
                Tout ce dont tu as besoin,{" "}
                <span className="gradient-text">en un seul endroit</span>
              </h2>
              <p className="text-muted-foreground text-sm md:text-base">
                Une plateforme complète, pas un simple cours Udemy. Tu as accès à tout l'écosystème 
                pour démarrer, scaler et automatiser ton business faceless IA.
              </p>

              <div className="space-y-4">
                {[
                  { icon: <Video className="h-5 w-5 text-primary" />, label: "6 modules vidéo HD (60+ heures de contenu)" },
                  { icon: <Brain className="h-5 w-5 text-accent" />, label: "Bibliothèque de prompts IA (mise à jour mensuelle)" },
                  { icon: <Smartphone className="h-5 w-5 text-green-500" />, label: "Templates vidéo prêts à l'emploi" },
                  { icon: <Users className="h-5 w-5 text-orange-500" />, label: "Communauté privée Discord (2 400+ membres)" },
                  { icon: <Clock className="h-5 w-5 text-blue-500" />, label: "Coaching live hebdomadaire" },
                  { icon: <Shield className="h-5 w-5 text-red-500" />, label: "Garantie satisfait ou remboursé 30 jours" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-xl border border-border hover:border-primary/30 hover:bg-primary/5 transition-all group">
                    <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0 group-hover:bg-white transition-colors">
                      {item.icon}
                    </div>
                    <span className="font-medium">{item.label}</span>
                    <CheckCircle2 className="h-5 w-5 text-green-500 ml-auto shrink-0" />
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Platform preview card */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-3xl blur-3xl scale-110 opacity-60" />
              <div className="relative bg-white rounded-2xl shadow-2xl border border-border overflow-hidden">
                {/* Window chrome */}
                <div className="bg-muted px-4 py-3 flex items-center gap-2 border-b border-border">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                  <div className="flex-1 text-center text-xs text-muted-foreground">ai-cash-flow.com/dashboard</div>
                </div>
                {/* Content preview */}
                <div className="p-5 space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: "Progression", value: "68%", color: "bg-primary" },
                      { label: "Vidéos créées", value: "124", color: "bg-accent" },
                      { label: "Revenus", value: "3.2k€", color: "bg-green-500" },
                    ].map((s, i) => (
                      <div key={i} className="bg-muted rounded-xl p-3 text-center">
                        <div className="text-xl font-black text-foreground">{s.value}</div>
                        <div className="text-xs text-muted-foreground">{s.label}</div>
                      </div>
                    ))}
                  </div>
                  {/* Progress bar */}
                  <div>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="font-medium">Module 3 — Croissance & Viralité</span>
                      <span className="text-primary font-bold">68%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full w-[68%] bg-gradient-to-r from-primary to-accent rounded-full" />
                    </div>
                  </div>
                  {/* Lesson list */}
                  {[
                    { title: "L'algorithme TikTok expliqué", done: true },
                    { title: "Créer un hook parfait", done: true },
                    { title: "Recycler du contenu viral", done: false },
                  ].map((l, i) => (
                    <div key={i} className={`flex items-center gap-3 p-3 rounded-lg ${l.done ? "bg-green-50" : "bg-muted"}`}>
                      <CheckCircle2 className={`h-5 w-5 ${l.done ? "text-green-500" : "text-muted-foreground"}`} />
                      <span className={`text-sm font-medium ${l.done ? "line-through text-muted-foreground" : ""}`}>
                        {l.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          PRICING
          ════════════════════════════════════════════════ */}
      <section className="py-10 md:py-14 bg-gradient-to-br from-primary/8 via-background to-accent/8">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8"
          >
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black mb-2">
              Ton investissement dans <span className="gradient-text">ta liberté financière</span>
            </h2>
            <p className="text-muted-foreground text-sm md:text-base">
              Accès à vie. Mises à jour incluses. Résultats garantis ou remboursé.
            </p>
          </motion.div>

          <div className="max-w-lg mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl shadow-2xl border-2 border-primary overflow-hidden relative"
            >
              {/* Popular badge */}
              <div className="absolute top-0 right-5 bg-primary text-white text-xs font-bold px-3 py-1 rounded-b-lg">
                OFFRE POPULAIRE
              </div>

              {/* Gradient top bar */}
              <div className="h-1.5 bg-gradient-to-r from-primary via-accent to-primary" />

              <div className="p-6 md:p-8">
                <div className="mb-5">
                  <h3 className="text-xl font-black mb-0.5">Accès Complet à Vie</h3>
                  <p className="text-muted-foreground text-sm">Tout ce dont tu as besoin pour réussir</p>
                </div>

                <div className="flex items-end gap-3 mb-1">
                  <div className="text-base text-muted-foreground line-through">50 000 FCFA</div>
                  <div className="text-3xl md:text-4xl font-black gradient-text">10 000 FCFA</div>
                </div>
                <p className="text-xs text-muted-foreground mb-5">Paiement unique — Accès à vie</p>

                <div className="space-y-2.5 mb-6">
                  {[
                    { icon: "🎬", label: "6 modules vidéo HD (60+ heures de contenu)" },
                    { icon: "🤖", label: "Bibliothèque de prompts IA (mise à jour mensuelle)" },
                    { icon: "📱", label: "Templates vidéo faceless prêts à l'emploi" },
                    { icon: "💬", label: "Groupe WhatsApp privé pour poser tes questions" },
                    { icon: "📺", label: "Live chaque dimanche à 22h (heure Bénin)" },
                    { icon: "🎯", label: "Accompagnement personnalisé" },
                    { icon: "🛠️", label: "Outils IA générateurs de vidéo (valeur 50$/mois) OFFERTS" },
                    { icon: "♾️", label: "Mises à jour à vie incluses" },
                    { icon: "🛡️", label: "Garantie satisfait ou remboursé 30 jours" },
                  ].map((feat, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-base shrink-0">{feat.icon}</span>
                      <span className="text-sm font-medium">{feat.label}</span>
                    </div>
                  ))}
                </div>

                <Link href="/register">
                  <Button
                    className="w-full h-11 md:h-12 text-sm md:text-base font-bold bg-primary hover:bg-primary/90 text-white btn-glow"
                    data-testid="button-pricing-cta"
                  >
                    Rejoindre la formation maintenant <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>

                <div className="flex items-center justify-center gap-3 mt-3 text-xs text-muted-foreground flex-wrap">
                  <span className="flex items-center gap-1"><Shield className="h-3 w-3" /> Paiement sécurisé</span>
                  <span>•</span>
                  <span>Accès immédiat</span>
                  <span>•</span>
                  <span>Garantie 30j</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          FAQ
          ════════════════════════════════════════════════ */}
      <section className="py-10 md:py-14 bg-background">
        <div className="container mx-auto px-4 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8"
          >
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black mb-2">Questions fréquentes</h2>
            <p className="text-muted-foreground text-sm md:text-base">Tout ce que tu dois savoir avant de rejoindre</p>
          </motion.div>
          <Accordion type="single" collapsible className="w-full space-y-3">
            {[
              {
                q: "Est-ce que je dois montrer mon visage ?",
                a: "Absolument pas. C'est tout le principe du contenu faceless. Avec l'IA, tu crées des vidéos complètes avec voix off synthétique, animations et images générées par IA — sans jamais apparaître à l'écran.",
              },
              {
                q: "Est-ce que je dois avoir des compétences techniques ?",
                a: "Non, zéro compétence requise. Si tu peux taper un message WhatsApp, tu peux utiliser ces outils IA. La formation commence de zéro et tu progresses à ton rythme.",
              },
              {
                q: "Combien de temps avant de voir mes premiers revenus ?",
                a: "La plupart de nos élèves voient leurs premières ventes dans les 30 à 60 jours après avoir commencé. Certains y arrivent en moins de 2 semaines. Ça dépend de votre engagement et du temps que vous y consacrez.",
              },
              {
                q: "Les plateformes comme TikTok autorisent-elles le contenu IA ?",
                a: "Oui, totalement. Les plateformes encouragent même ce type de contenu car il génère de l'engagement. Nous t'enseignons les bonnes pratiques pour rester dans les règles tout en maximisant ta portée.",
              },
              {
                q: "Est-ce que la méthode fonctionne encore en 2025 ?",
                a: "Plus que jamais. L'IA faceless est en plein essor. Les créateurs qui maîtrisent ces outils maintenant ont un avantage énorme sur ceux qui hésitent encore. C'est la meilleure période pour commencer.",
              },
              {
                q: "Qu'est-ce que la garantie 30 jours ?",
                a: "Si dans les 30 jours tu n'es pas satisfait pour n'importe quelle raison, on te rembourse intégralement — sans poser de questions. Tu ne prends aucun risque.",
              },
            ].map((faq, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="border border-border bg-white rounded-xl px-6 shadow-sm data-[state=open]:border-primary/40 data-[state=open]:shadow-md transition-all"
              >
                <AccordionTrigger className="text-base font-semibold hover:text-primary py-5 [&[data-state=open]]:text-primary transition-colors">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pb-5">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          LEAD CAPTURE / FINAL CTA
          ════════════════════════════════════════════════ */}
      <section className="py-10 md:py-14 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-accent" />
        <div className="absolute inset-0 grid-pattern opacity-20" />
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 blob blur-3xl" />
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-white/10 blob blur-3xl" />

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-xl mx-auto text-white"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 text-white text-xs font-semibold mb-5">
              <Rocket className="h-3.5 w-3.5" /> Formation gratuite offerte
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black mb-3 leading-tight">
              Pas encore prêt ? Reçois notre formation gratuite de 45 minutes
            </h2>
            <p className="text-white/80 text-sm md:text-base mb-6">
              Découvre comment générer tes premiers 500€ avec l'IA faceless — 
              même sans audience, sans budget, sans expérience.
            </p>
            <form onSubmit={handleLeadSubmit} className="flex flex-col sm:flex-row gap-3 justify-center" data-testid="form-lead-capture">
              <Input
                type="email"
                placeholder="Ton meilleur email"
                className="h-11 sm:w-72 bg-white/15 border-white/30 text-white placeholder:text-white/60 focus:border-white text-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                data-testid="input-email"
              />
              <Button
                type="submit"
                className="h-11 px-6 bg-white text-primary font-bold hover:bg-white/90 text-sm shrink-0"
                disabled={captureLead.isPending}
                data-testid="button-lead-submit"
              >
                {captureLead.isPending ? "Envoi..." : "Recevoir la formation gratuite"}
              </Button>
            </form>
            <p className="text-white/60 text-xs mt-3">100% gratuit. Aucune carte bancaire requise. Désabonnement en 1 clic.</p>
          </motion.div>
        </div>
      </section>



      {/* ════════════════════════════════════════════════
          FLOATING WHATSAPP BUTTON
          ════════════════════════════════════════════════ */}
      <a
        href="https://wa.me/2290157385885"
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-full shadow-lg hover:shadow-green-500/40 hover:scale-105 transition-all duration-300"
        data-testid="button-whatsapp"
      >
        <MessageCircle className="h-5 w-5" />
        <span className="text-sm font-semibold hidden sm:block">Support WhatsApp</span>
      </a>
    </div>
  );
}
