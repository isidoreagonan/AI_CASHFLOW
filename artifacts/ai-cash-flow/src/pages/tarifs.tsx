import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Check,
  Shield,
  Sparkles,
  MessageCircle,
  Video,
  Brain,
  Users,
  Clock,
  Zap,
  Star,
  Gift,
  Globe,
} from "lucide-react";

const benefits = [
  {
    icon: "🎬",
    title: "6 Modules Vidéo HD",
    desc: "60+ heures de contenu actionnable pour maîtriser la création de contenu faceless IA de A à Z.",
    badge: "Contenu premium",
  },
  {
    icon: "🤖",
    title: "Bibliothèque de Prompts IA",
    desc: "Des centaines de prompts testés et optimisés pour générer du contenu viral rapidement. Mise à jour chaque mois.",
    badge: "Mis à jour mensuel",
  },
  {
    icon: "📱",
    title: "Templates Vidéo Prêts à l'Emploi",
    desc: "Utilise nos modèles directement pour créer tes premières vidéos faceless dès aujourd'hui.",
    badge: "Gagner du temps",
  },
  {
    icon: "💬",
    title: "Groupe WhatsApp Privé",
    desc: "Intègre notre communauté exclusive sur WhatsApp. Pose tes questions, partage tes victoires, reçois des feedbacks en temps réel.",
    badge: "Communauté active",
  },
  {
    icon: "📺",
    title: "Live Chaque Dimanche à 22h (Heure Bénin)",
    desc: "Chaque dimanche soir, rejoins notre session live hebdomadaire pour des stratégies avancées, du Q&A en direct et des analyses de comptes.",
    badge: "Live hebdomadaire",
  },
  {
    icon: "🎯",
    title: "Accompagnement Personnalisé",
    desc: "Tu n'es pas seul. Nos formateurs suivent ta progression et t'orientent selon tes objectifs spécifiques.",
    badge: "Suivi individuel",
  },
  {
    icon: "🛠️",
    title: "Outils IA Générateurs de Vidéo OFFERTS",
    desc: "Accède gratuitement à des outils IA premium de génération vidéo (valeur 50$/mois). On te donne accès sans frais supplémentaires.",
    badge: "Valeur 50$/mois offerte",
    highlight: true,
  },
  {
    icon: "♾️",
    title: "Mises à Jour à Vie",
    desc: "Le monde de l'IA évolue vite. Tu reçois toutes les mises à jour de la formation gratuitement, pour toujours.",
    badge: "À vie",
  },
  {
    icon: "🛡️",
    title: "Garantie 30 Jours",
    desc: "Si tu n'es pas satisfait pour n'importe quelle raison dans les 30 jours, on te rembourse intégralement. Zéro risque.",
    badge: "Sans risque",
  },
];

const faqs = [
  {
    q: "Comment se passe le paiement ?",
    a: "Tu paies une seule fois 10 000 FCFA et tu accèdes à tout le contenu immédiatement. Nous acceptons Mobile Money (MTN, Moov, Wave) et les virements bancaires.",
  },
  {
    q: "Est-ce que le prix va augmenter ?",
    a: "Oui. Le tarif actuel de 10 000 FCFA est notre prix de lancement. Il augmentera prochainement. Les premiers inscrits gardent le tarif actuel à vie.",
  },
  {
    q: "Est-ce que c'est vraiment pour les débutants ?",
    a: "Absolument. La formation est conçue pour partir de zéro. Pas de compétences tech requises — si tu peux utiliser WhatsApp, tu peux suivre cette formation.",
  },
  {
    q: "Comment accéder au groupe WhatsApp ?",
    a: "Après ton inscription et paiement, tu reçois un lien d'invitation directement sur ton email ou WhatsApp pour rejoindre le groupe privé.",
  },
  {
    q: "Les lives du dimanche sont-ils enregistrés ?",
    a: "Oui ! Si tu rates un live, l'enregistrement est disponible dans l'espace membres dans les 24h qui suivent.",
  },
];

export default function Tarifs() {
  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* ─── HERO ───────────────────────────────────── */}
      <section className="relative py-24 hero-gradient grid-pattern overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 blob blur-[80px] opacity-60" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent/10 blob blur-[80px] opacity-60" />
        <div className="container mx-auto px-4 relative z-10 text-center max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-semibold mb-6">
              <Sparkles className="h-4 w-4" /> Offre de lancement — Prix limité
            </div>
            <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-6 leading-tight">
              Accès Complet à la Formation{" "}
              <span className="gradient-text">AI Cash Flow</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Un investissement unique. Un accès à vie. Des résultats concrets 
              en création de contenu faceless IA.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ─── PRICING CARD ──────────────────────────── */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-white rounded-3xl shadow-2xl border-2 border-primary overflow-hidden"
          >
            <div className="h-2 bg-gradient-to-r from-primary via-accent to-primary" />

            <div className="p-8 md:p-12">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 pb-10 border-b border-border">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mb-3">
                    ⭐ OFFRE POPULAIRE — PRIX DE LANCEMENT
                  </div>
                  <h2 className="text-3xl font-black">Accès Complet à Vie</h2>
                  <p className="text-muted-foreground mt-1">Tout ce qu'il te faut pour réussir avec l'IA faceless</p>
                </div>
                <div className="text-left md:text-right shrink-0">
                  <div className="text-lg text-muted-foreground line-through">50 000 FCFA</div>
                  <div className="text-6xl font-black gradient-text leading-none">10 000</div>
                  <div className="text-2xl font-bold text-muted-foreground">FCFA</div>
                  <div className="text-xs text-green-600 font-semibold mt-1">Tu économises 40 000 FCFA</div>
                </div>
              </div>

              {/* Benefits grid */}
              <div className="grid md:grid-cols-2 gap-4 mb-10">
                {benefits.map((b, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    className={`flex items-start gap-4 p-4 rounded-2xl border transition-all ${
                      b.highlight
                        ? "border-primary/40 bg-primary/5 shadow-sm"
                        : "border-border hover:border-primary/20 hover:bg-muted/50"
                    }`}
                  >
                    <span className="text-2xl shrink-0 mt-0.5">{b.icon}</span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-bold text-sm">{b.title}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                          b.highlight
                            ? "bg-primary text-white"
                            : "bg-secondary text-secondary-foreground"
                        }`}>
                          {b.badge}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{b.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* CTA */}
              <Link href="/paiement">
                <Button className="w-full h-16 text-xl font-black bg-primary hover:bg-primary/90 text-white btn-glow rounded-2xl">
                  Rejoindre la formation — 10 000 FCFA <ArrowRight className="ml-2 h-6 w-6" />
                </Button>
              </Link>

              <div className="grid grid-cols-3 gap-4 mt-6 text-center">
                {[
                  { icon: "🔒", label: "Paiement sécurisé" },
                  { icon: "⚡", label: "Accès immédiat" },
                  { icon: "🛡️", label: "Garanti 30 jours" },
                ].map((item, i) => (
                  <div key={i} className="text-xs text-muted-foreground font-medium">
                    <div className="text-xl mb-1">{item.icon}</div>
                    {item.label}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Value comparison */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 bg-gradient-to-br from-primary/5 to-accent/5 rounded-3xl p-8 border border-border"
          >
            <h3 className="text-2xl font-black text-center mb-8">
              Ce que tu obtiens vs ce que ça vaut vraiment
            </h3>
            <div className="space-y-3">
              {[
                { item: "Formation vidéo HD (6 modules)", value: "30 000 FCFA" },
                { item: "Bibliothèque de prompts IA", value: "10 000 FCFA" },
                { item: "Outils IA générateurs vidéo (1 an)", value: "36 000 FCFA" },
                { item: "Accès groupe WhatsApp privé", value: "5 000 FCFA" },
                { item: "50+ lives hebdomadaires (1 an)", value: "25 000 FCFA" },
                { item: "Accompagnement personnalisé", value: "20 000 FCFA" },
              ].map((row, i) => (
                <div key={i} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                  <div className="flex items-center gap-3">
                    <Check className="h-4 w-4 text-primary shrink-0" />
                    <span className="text-sm font-medium">{row.item}</span>
                  </div>
                  <span className="text-sm font-bold text-muted-foreground">{row.value}</span>
                </div>
              ))}
              <div className="flex items-center justify-between py-4 bg-primary/5 rounded-xl px-4 mt-4">
                <span className="font-black text-lg">Valeur totale</span>
                <span className="text-2xl font-black text-muted-foreground line-through">126 000 FCFA</span>
              </div>
              <div className="flex items-center justify-between py-4 bg-primary rounded-xl px-4 text-white">
                <span className="font-black text-xl">Tu paies seulement</span>
                <span className="text-3xl font-black">10 000 FCFA</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── SOCIAL LINKS ──────────────────────────── */}
      <section className="py-16 bg-white border-y border-border">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-2xl font-black mb-3">Rejoins nos communautés</h3>
          <p className="text-muted-foreground mb-8">Vois par toi-même ce que nos élèves créent chaque jour</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a
              href="https://www.facebook.com/share/1AwyWRS87U/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 px-6 py-3 bg-[#1877F2] text-white rounded-2xl font-bold hover:bg-[#166FE5] transition-colors shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5 transform duration-200"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-white">
                <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
              </svg>
              Prime Toon — 142K abonnés
            </a>
            <a
              href="https://www.tiktok.com/@prime_toon_?_r=1&_t=ZT-95dultLPR53"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 px-6 py-3 bg-black text-white rounded-2xl font-bold hover:bg-gray-900 transition-colors shadow-lg hover:-translate-y-0.5 transform duration-200"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-white">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.34 6.34 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.99a8.28 8.28 0 0 0 4.84 1.54V7.08a4.85 4.85 0 0 1-1.07-.39z"/>
              </svg>
              @prime_toon_ — 31K abonnés
            </a>
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS MINI ─────────────────────── */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 max-w-4xl">
          <h3 className="text-3xl font-black text-center mb-10">
            Ce que disent nos élèves
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: "Karim M.", text: "En 3 mois, 11k€/mois. La méthode est claire et applicable dès le premier jour.", stars: 5 },
              { name: "Sophie L.", text: "Zéro compétence au départ. Aujourd'hui 45k abonnés YouTube et un revenu stable.", stars: 5 },
              { name: "Yacine B.", text: "3 comptes faceless, l'IA fait tout. J'encaisse et je supervise depuis mon téléphone.", stars: 5 },
            ].map((t, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 border border-border shadow-sm">
                <div className="flex gap-1 mb-3">
                  {[...Array(t.stars)].map((_, si) => (
                    <Star key={si} className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground italic mb-4">"{t.text}"</p>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-xs font-bold">
                    {t.name.charAt(0)}
                  </div>
                  <span className="font-semibold text-sm">{t.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FAQ ────────────────────────────────────── */}
      <section className="py-16 bg-gradient-to-br from-primary/5 to-background">
        <div className="container mx-auto px-4 max-w-3xl">
          <h3 className="text-3xl font-black text-center mb-10">Questions sur le tarif</h3>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="bg-white rounded-2xl p-6 border border-border shadow-sm"
              >
                <h4 className="font-bold text-base mb-2 flex items-start gap-2">
                  <span className="text-primary mt-0.5">Q.</span>
                  {faq.q}
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed pl-5">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA ──────────────────────────────── */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-accent" />
        <div className="absolute inset-0 grid-pattern opacity-20" />
        <div className="container mx-auto px-4 relative z-10 text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto"
          >
            <h2 className="text-4xl md:text-5xl font-black mb-6 leading-tight">
              Prêt à changer ta vie avec l'IA Faceless ?
            </h2>
            <p className="text-white/80 text-lg mb-8">
              10 000 FCFA. Un seul paiement. Un accès à vie à tout ce dont tu as besoin.
            </p>
            <Link href="/paiement">
              <Button
                size="lg"
                className="h-16 px-10 text-xl font-black bg-white text-primary hover:bg-white/90 rounded-2xl shadow-2xl"
              >
                Je commence maintenant — 10 000 FCFA <ArrowRight className="ml-2 h-6 w-6" />
              </Button>
            </Link>
            <p className="text-white/60 text-sm mt-4">Garantie 30 jours satisfait ou remboursé</p>
          </motion.div>
        </div>
      </section>

      {/* WhatsApp flottant */}
      <a
        href="https://wa.me/33600000000"
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-full shadow-lg hover:scale-105 transition-all duration-300"
      >
        <MessageCircle className="h-5 w-5" />
        <span className="text-sm font-semibold hidden sm:block">Support WhatsApp</span>
      </a>
    </div>
  );
}
