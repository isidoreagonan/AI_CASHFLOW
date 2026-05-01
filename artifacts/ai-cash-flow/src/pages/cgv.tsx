import { motion } from "framer-motion";

export default function CGV() {
  return (
    <div className="min-h-screen bg-background py-16 md:py-24">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-border"
        >
          <h1 className="text-3xl md:text-4xl font-black mb-8 text-foreground">Conditions Générales de Vente (CGV)</h1>
          
          <div className="space-y-8 text-muted-foreground leading-relaxed">
            <section>
              <h2 className="text-xl font-bold text-foreground mb-4">1. Objet</h2>
              <p>
                Les présentes Conditions Générales de Vente (CGV) régissent les relations contractuelles entre <strong>IA Cash Flow</strong> et toute personne physique ou morale (ci-après "le Client") souhaitant acquérir les formations numériques proposées sur le site.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-foreground mb-4">2. Produits et Services</h2>
              <p>
                IA Cash Flow propose des formations en ligne sous forme de vidéos, de documents PDF et d'accès à des outils logiciels. Le contenu des formations est décrit sur chaque page de vente. L'accès aux formations est strictement personnel et ne peut être partagé.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-foreground mb-4">3. Prix et Paiement</h2>
              <p>
                Les prix sont indiqués en FCFA ou en Euros, toutes taxes comprises. Le paiement est exigible immédiatement au moment de la commande. Nous acceptons les paiements via Stripe (Carte Bancaire) et les solutions de Mobile Money (PawaPay/FedaPay).
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-foreground mb-4">4. Livraison des Services</h2>
              <p>
                Après confirmation du paiement, le Client reçoit un accès immédiat à son espace membre via ses identifiants. En cas de problème technique, le Client peut contacter le support à <strong>contact@aicashflow.site</strong>.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-foreground mb-4">5. Droit de Rétractation et Remboursement</h2>
              <p>
                Conformément à la réglementation sur les contenus numériques, le droit de rétractation ne s'applique pas une fois que le contenu a été accédé. Cependant, IA Cash Flow offre une <strong>garantie commerciale de 30 jours</strong>. Si vous n'êtes pas satisfait, vous pouvez demander un remboursement complet sous 30 jours après l'achat.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-foreground mb-4">6. Responsabilité</h2>
              <p>
                Le Client est seul responsable de la mise en œuvre des techniques enseignées. IA Cash Flow ne garantit pas de résultats financiers spécifiques, ceux-ci dépendant du travail et de l'implication de chaque élève.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-foreground mb-4">7. Droit Applicable</h2>
              <p>
                Les présentes CGV sont soumises au droit béninois. En cas de litige, une solution amiable sera recherchée avant toute action judiciaire.
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
