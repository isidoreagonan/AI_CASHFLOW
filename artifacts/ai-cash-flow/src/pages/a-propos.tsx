import { useRef } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import photoImg from "@assets/Whisk_yzn2mzmwymn2umyz0inirgotctzxqtlmrdzz0yn_1776521888334.png";
import { TrendingUp, Users, Play, Award, ArrowRight, Quote } from "lucide-react";

const stats = [
  { icon: Users, label: "Abonnés Facebook", value: "142K", color: "text-blue-500" },
  { icon: Play, label: "Vues en 28 jours", value: "13M", color: "text-violet-500" },
  { icon: TrendingUp, label: "Revenus générés", value: "7 chiffres", color: "text-emerald-500" },
  { icon: Award, label: "Formations créées", value: "100%", color: "text-amber-500" },
];

function Counter({ value, label }: { value: string; label: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6 }}
    >
      <div className="text-4xl md:text-5xl font-black gradient-text">{value}</div>
      <div className="text-sm text-muted-foreground mt-1">{label}</div>
    </motion.div>
  );
}

export default function APropos() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const heroRef = useRef(null);
  const heroInView = useInView(heroRef, { once: true });

  return (
    <div ref={containerRef} className="overflow-hidden">

      {/* ─── Hero ─── */}
      <section className="relative min-h-[90vh] grid-pattern flex items-center overflow-hidden bg-gradient-to-br from-lavender-50 via-white to-violet-50">
        {/* Blobs */}
        <motion.div style={{ y }} className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full opacity-20 blur-3xl"
          animate={{ scale: [1, 1.1, 1], rotate: [0, 10, 0] }} transition={{ duration: 10, repeat: Infinity }}>
          <div className="w-full h-full rounded-full bg-gradient-to-br from-violet-400 to-purple-600" />
        </motion.div>
        <motion.div style={{ y }} className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] rounded-full opacity-15 blur-3xl"
          animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 8, repeat: Infinity, delay: 2 }}>
          <div className="w-full h-full rounded-full bg-gradient-to-br from-indigo-400 to-violet-500" />
        </motion.div>

        <div className="container mx-auto px-4 py-20 md:py-0">
          <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center" ref={heroRef}>

            {/* Text */}
            <div className="order-2 md:order-1">
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                animate={heroInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <span className="inline-flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-widest bg-primary/10 px-4 py-2 rounded-full mb-6">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  Mon histoire
                </span>
                <h1 className="text-4xl md:text-6xl font-black leading-tight mb-6">
                  Je suis <span className="gradient-text">AGONAN</span><br />
                  <span className="gradient-text">ISIDORE ABRAHAM</span>
                </h1>
                <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                  Étudiant, créateur de contenu IA, entrepreneur digital. J'ai transformé ma curiosité en <strong>empire numérique</strong> — et je t'apprends à faire pareil.
                </p>
                <Link href="/tarifs">
                  <Button className="btn-glow bg-primary hover:bg-primary/90 text-white font-bold px-8 py-6 rounded-xl text-base gap-2">
                    Rejoindre la formation <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </motion.div>
            </div>

            {/* Photo */}
            <div className="order-1 md:order-2 flex justify-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 40 }}
                animate={heroInView ? { opacity: 1, scale: 1, y: 0 } : {}}
                transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                className="relative"
              >
                {/* Glow ring */}
                <motion.div
                  className="absolute inset-[-16px] rounded-3xl"
                  style={{ background: "linear-gradient(135deg, hsl(252,87%,62%,0.4) 0%, hsl(280,80%,70%,0.2) 100%)" }}
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                />
                {/* Photo container */}
                <motion.div
                  className="relative z-10 rounded-2xl overflow-hidden shadow-2xl shadow-primary/30 border-4 border-white"
                  style={{ width: 340, height: 420 }}
                  animate={{ y: [0, -12, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                >
                  <img
                    src={photoImg}
                    alt="Isidore Abraham Agonan"
                    className="w-full h-full object-cover object-top"
                  />
                  {/* Name overlay */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                    <div className="text-white font-black text-xl">ISIDORE ABRAHAM</div>
                    <div className="text-primary/90 text-sm font-semibold">Fondateur · IA Cash Flow</div>
                  </div>
                </motion.div>

                {/* Floating badges */}
                <motion.div
                  className="absolute top-8 -left-12 bg-white rounded-xl shadow-xl border border-border/40 px-4 py-3 z-20"
                  animate={{ y: [0, -8, 0], rotate: [-2, 2, -2] }}
                  transition={{ duration: 4, repeat: Infinity }}
                >
                  <div className="text-2xl font-black text-blue-500">142K</div>
                  <div className="text-xs text-muted-foreground">Abonnés Facebook</div>
                </motion.div>
                <motion.div
                  className="absolute bottom-16 -right-12 bg-white rounded-xl shadow-xl border border-border/40 px-4 py-3 z-20"
                  animate={{ y: [0, 8, 0], rotate: [2, -2, 2] }}
                  transition={{ duration: 5, repeat: Infinity, delay: 1 }}
                >
                  <div className="text-2xl font-black gradient-text">13M</div>
                  <div className="text-xs text-muted-foreground">Vues en 28 jours</div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Stats bar ─── */}
      <section className="py-16 bg-foreground text-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="space-y-2"
              >
                <s.icon className={`w-6 h-6 mx-auto mb-2 ${s.color}`} />
                <div className="text-3xl font-black text-background">{s.value}</div>
                <div className="text-sm text-background/60">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Mon histoire ─── */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              D'étudiant à <span className="gradient-text">créateur 7 chiffres</span>
            </h2>
            <p className="text-muted-foreground text-lg">Voici la vraie histoire — sans fioritures</p>
          </motion.div>

          <div className="space-y-12">
            {[
              {
                step: "01",
                title: "L'étudiant qui cherchait sa voie",
                text: "Je m'appelle Isidore Abraham AGONAN. Comme beaucoup, j'ai commencé mes études sans vraiment savoir où j'allais. J'aimais le digital, la création, l'innovation — mais je ne savais pas comment transformer cette passion en quelque chose de concret. Le monde me semblait réservé à ceux qui avaient déjà tout : des ressources, du réseau, de l'expérience.",
              },
              {
                step: "02",
                title: "Le matin où tout a changé",
                text: "Un matin, je me suis levé avec une idée simple : et si je testais la création de contenu IA ? Pas pour devenir célèbre. Juste pour voir. J'ai commencé à créer des vidéos animées faceless — sans montrer mon visage, sans matériel coûteux, juste avec des outils IA gratuits et ma connexion internet. J'ai publié ma première vidéo. Puis une autre. Puis une autre.",
              },
              {
                step: "03",
                title: "Les résultats ont parlé",
                text: "En quelques mois, ma page Facebook Prime Toon a explosé : 142 000 abonnés. 13 millions de vues en seulement 28 jours. Mon compte TikTok @prime_toon_ a dépassé 31 000 abonnés. Des revenus ont commencé à rentrer — en automatique, pendant que je dormais, pendant que j'étudiais. J'avais prouvé que le système fonctionnait.",
              },
              {
                step: "04",
                title: "La mission : te transmettre le savoir",
                text: "Aujourd'hui, ma mission est claire : je ne veux pas garder ce savoir pour moi. IA Cash Flow, c'est la formation que j'aurais voulu avoir quand j'ai commencé. Je t'enseigne exactement ce que j'ai fait, étape par étape, avec les outils que j'utilise chaque jour. Que tu sois étudiant, salarié ou entrepreneur — si tu es prêt à travailler, je suis prêt à te guider.",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.7 }}
                className="flex gap-6 md:gap-10"
              >
                <div className="flex-shrink-0">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                    <span className="text-primary font-black text-lg">{item.step}</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-black mb-3">{item.title}</h3>
                  <p className="text-muted-foreground leading-relaxed text-base">{item.text}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Quote */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mt-16 relative bg-gradient-to-br from-primary/5 to-violet-100/50 rounded-3xl p-8 md:p-12 border border-primary/10"
          >
            <Quote className="absolute top-6 left-8 w-10 h-10 text-primary/20" />
            <blockquote className="text-center text-xl md:text-2xl font-bold text-foreground leading-relaxed pt-4">
              "Le succès en ligne n'est pas réservé aux chanceux. Il est réservé à ceux qui apprennent les bonnes méthodes et les appliquent avec constance."
            </blockquote>
            <div className="mt-6 flex items-center justify-center gap-3">
              <img src={photoImg} alt="Isidore" className="w-12 h-12 rounded-full object-cover object-top border-2 border-primary" />
              <div className="text-left">
                <div className="font-bold text-sm">Isidore Abraham AGONAN</div>
                <div className="text-xs text-muted-foreground">Fondateur, IA Cash Flow</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── Valeurs ─── */}
      <section className="py-24 bg-gradient-to-br from-lavender-50 to-violet-50/30">
        <div className="container mx-auto px-4 max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-black mb-4">Ce en quoi je crois</h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { emoji: "🚀", title: "L'action avant tout", text: "La connaissance sans action ne vaut rien. Dans IA Cash Flow, tu apprends ET tu agis dès le premier jour." },
              { emoji: "🤖", title: "L'IA comme levier", text: "Les outils IA ne sont pas là pour remplacer les humains — ils sont là pour multiplier ta productivité par 10." },
              { emoji: "🌍", title: "Accessible à tous", text: "Que tu sois en Afrique, en Europe ou ailleurs, avec un téléphone et une connexion, tu peux créer un business digital qui tourne." },
            ].map((v, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="bg-white rounded-2xl p-8 border border-border/40 shadow-sm hover:shadow-primary/10 hover:border-primary/20 transition-all"
              >
                <div className="text-4xl mb-4">{v.emoji}</div>
                <h3 className="font-black text-lg mb-3">{v.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{v.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-24 bg-foreground text-background">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-black mb-6">
              Prêt à écrire ta propre histoire ?
            </h2>
            <p className="text-background/70 text-lg mb-10 leading-relaxed">
              Rejoins IA Cash Flow et commence dès aujourd'hui à construire ton empire numérique, comme je l'ai fait.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/tarifs">
                <Button className="btn-glow bg-primary hover:bg-primary/90 text-white font-bold px-10 py-6 rounded-xl text-base gap-2">
                  Voir la formation <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="outline" className="border-background/30 text-background hover:bg-background/10 font-semibold px-10 py-6 rounded-xl text-base">
                  Créer mon compte
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
