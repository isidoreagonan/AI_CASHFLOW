import { motion } from "framer-motion";

export default function MentionsLegales() {
  return (
    <div className="min-h-screen bg-background py-16 md:py-24">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-border"
        >
          <h1 className="text-3xl md:text-4xl font-black mb-8 text-foreground">Mentions Légales</h1>
          
          <div className="space-y-8 text-muted-foreground leading-relaxed">
            <section>
              <h2 className="text-xl font-bold text-foreground mb-4">1. Éditeur du Site</h2>
              <p>
                Le présent site web, accessible à l'adresse <strong>https://aicashflow.site</strong>, est édité par :
              </p>
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li><strong>Nom / Raison Sociale :</strong> Isidore AGONAN</li>
                <li><strong>Siège Social :</strong> Cotonou, Bénin</li>
                <li><strong>Email :</strong> contact@aicashflow.site</li>
                <li><strong>WhatsApp :</strong> +229 01 57 38 58 85</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-foreground mb-4">2. Hébergement</h2>
              <p>
                Le site est hébergé par :
              </p>
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li><strong>Frontend :</strong> Vercel Inc., 340 S Lemon Ave #1184, Walnut, CA 91789, USA.</li>
                <li><strong>Backend :</strong> Render.com, San Francisco, USA.</li>
                <li><strong>Base de données :</strong> Supabase Inc., San Francisco, USA.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-foreground mb-4">3. Propriété Intellectuelle</h2>
              <p>
                L'ensemble du contenu de ce site (textes, images, vidéos, logos, icônes) est la propriété exclusive de IA Cash Flow, sauf mention contraire. Toute reproduction, distribution, modification ou adaptation, même partielle, est strictement interdite sans l'autorisation écrite préalable de l'éditeur.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-foreground mb-4">4. Limitation de Responsabilité</h2>
              <p>
                IA Cash Flow s'efforce de fournir des informations aussi précises que possible. Toutefois, l'éditeur ne pourra être tenu responsable des omissions, des inexactitudes et des carences dans la mise à jour. Les résultats financiers présentés comme exemples ne constituent en aucun cas une garantie de gain.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-foreground mb-4">5. Contact</h2>
              <p>
                Pour toute question ou demande d'information concernant le site, vous pouvez nous contacter par email à <strong>contact@aicashflow.site</strong> ou via notre support WhatsApp.
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
