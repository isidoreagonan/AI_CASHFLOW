import { motion } from "framer-motion";

export default function PolitiqueConfidentialite() {
  return (
    <div className="min-h-screen bg-background py-16 md:py-24">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-border"
        >
          <h1 className="text-3xl md:text-4xl font-black mb-8 text-foreground">Politique de Confidentialité</h1>
          
          <div className="space-y-8 text-muted-foreground leading-relaxed">
            <section>
              <h2 className="text-xl font-bold text-foreground mb-4">1. Introduction</h2>
              <p>
                La protection de vos données personnelles est une priorité pour <strong>IA Cash Flow</strong>. Cette politique détaille comment nous collectons, utilisons et protégeons vos informations lorsque vous visitez notre site <strong>https://aicashflow.site</strong>.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-foreground mb-4">2. Données Collectées</h2>
              <p>Nous collectons les données suivantes :</p>
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li><strong>Informations de compte :</strong> Nom, adresse email, mot de passe (crypté).</li>
                <li><strong>Informations de paiement :</strong> Gérées par nos prestataires sécurisés (Stripe, PawaPay). Nous ne stockons pas vos coordonnées bancaires sur nos serveurs.</li>
                <li><strong>Données de navigation :</strong> Adresse IP, type de navigateur, pages consultées (via des cookies).</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-foreground mb-4">3. Utilisation des Données</h2>
              <p>Vos données sont utilisées pour :</p>
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>Fournir l'accès aux formations et à l'espace membre.</li>
                <li>Traiter vos paiements et envoyer les factures.</li>
                <li>Améliorer l'expérience utilisateur sur le site.</li>
                <li>Vous envoyer des informations importantes ou des offres (si vous y avez consenti).</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-foreground mb-4">4. Cookies et Publicité (AdSense)</h2>
              <p>
                Ce site utilise des cookies pour améliorer la navigation. Nous utilisons également <strong>Google AdSense</strong> pour diffuser des publicités.
              </p>
              <p className="mt-2">
                Google utilise des cookies pour diffuser des annonces basées sur vos visites antérieures sur ce site ou sur d'autres sites. L'utilisation par Google du cookie DoubleClick lui permet, ainsi qu'à ses partenaires, de diffuser des annonces en fonction de votre navigation. Vous pouvez désactiver la publicité personnalisée dans les <a href="https://www.google.com/settings/ads" className="text-primary underline">Paramètres des annonces Google</a>.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-foreground mb-4">5. Partage des Données</h2>
              <p>
                Nous ne vendons ni ne louons vos données personnelles à des tiers. Vos données peuvent être partagées uniquement avec nos prestataires de confiance indispensables au fonctionnement du site (Hébergement, Paiement, Envoi d'emails).
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-foreground mb-4">6. Vos Droits</h2>
              <p>
                Vous disposez d'un droit d'accès, de rectification et de suppression de vos données personnelles. Vous pouvez exercer ce droit à tout moment en nous contactant à <strong>contact@aicashflow.site</strong>.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-foreground mb-4">7. Sécurité</h2>
              <p>
                Nous mettons en œuvre des mesures de sécurité techniques (chiffrement SSL, serveurs sécurisés) pour protéger vos données contre tout accès non autorisé.
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
