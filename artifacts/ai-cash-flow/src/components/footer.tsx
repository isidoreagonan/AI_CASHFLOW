import { Link } from "wouter";
import logoImg from "@assets/ChatGPT_Image_Apr_18,_2026,_02_56_10_PM_1776520714293.png";

export function Footer() {
  return (
    <footer className="py-12 bg-foreground text-background">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-2">
            <img src={logoImg} alt="IA Cash Flow" className="h-10 w-10 rounded-full object-cover" />
            <span className="font-black text-lg">IA CASH FLOW</span>
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-background/60">
            <Link href="/mentions-legales" className="hover:text-background transition-colors">Mentions légales</Link>
            <Link href="/cgv" className="hover:text-background transition-colors">CGV</Link>
            <Link href="/politique-confidentialite" className="hover:text-background transition-colors">Confidentialité</Link>
            <a href="mailto:contact@aicashflow.site" className="hover:text-background transition-colors">Contact</a>
          </div>
        </div>
        <div className="border-t border-background/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-background/50 text-center">
          <p>&copy; {new Date().getFullYear()} IA Cash Flow. Tous droits réservés.</p>
          <p>La formation #1 en création de contenu IA Faceless</p>
        </div>
      </div>
    </footer>
  );
}
