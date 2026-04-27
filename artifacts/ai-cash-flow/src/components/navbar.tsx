import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  LogOut, LayoutDashboard, BookOpen, FolderOpen,
  ChevronDown, Settings, Menu, Shield,
} from "lucide-react";
import logoImg from "@assets/ChatGPT_Image_Apr_18,_2026,_02_56_10_PM_1776520714293.png";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function Navbar() {
  const { user, logout } = useAuth();
  const [location] = useLocation();

  // Admin area — admin has its own sidebar layout, no top navbar
  if (location.startsWith("/admin")) return null;

  // ── PUBLIC NAVBAR (not logged in) ────────────────────────────────────
  if (!user) {
    return (
      <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-xl border-b border-border/40 shadow-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 group">
            <img src={logoImg} alt="IA Cash Flow" className="h-10 w-10 rounded-full object-cover shadow-sm" />
            <span className="font-black text-lg tracking-tight">IA CASH FLOW</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link href="/tarifs" className="text-sm font-semibold text-foreground/70 hover:text-primary transition-colors">Tarifs</Link>
            <Link href="/a-propos" className="text-sm font-semibold text-foreground/70 hover:text-primary transition-colors">À propos</Link>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" className="font-semibold text-foreground/70 hover:text-foreground">Connexion</Button>
            </Link>
            <Link href="/paiement">
              <Button className="bg-primary hover:bg-primary/90 text-white font-semibold shadow-sm">Accéder aux formations</Button>
            </Link>
          </div>

          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="h-9 w-9"><Menu className="h-5 w-5" /></Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px]">
              <div className="flex items-center gap-2 mb-8 mt-2">
                <img src={logoImg} alt="IA Cash Flow" className="h-10 w-10 rounded-full object-cover" />
                <span className="font-black text-lg">IA CASH FLOW</span>
              </div>
              <nav className="flex flex-col gap-3">
                <Link href="/tarifs" className="text-sm font-semibold p-2 rounded-lg hover:bg-muted transition-colors">Tarifs</Link>
                <Link href="/a-propos" className="text-sm font-semibold p-2 rounded-lg hover:bg-muted transition-colors">À propos</Link>
                <div className="border-t border-border pt-3 mt-2 flex flex-col gap-2">
                  <Link href="/login"><Button variant="ghost" className="w-full justify-start">Connexion</Button></Link>
                  <Link href="/paiement"><Button className="w-full bg-primary text-white">Rejoindre la formation</Button></Link>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </header>
    );
  }

  // ── APP NAVBAR (logged in) ─────────────────────────────────────────────
  const navLinkClass = (path: string) =>
    `flex items-center gap-1.5 text-sm font-semibold transition-colors ${
      location === path || (path !== "/dashboard" && location.startsWith(path))
        ? "text-primary"
        : "text-foreground/70 hover:text-primary"
    }`;

  return (
    <header className="sticky top-0 z-50 w-full bg-background border-b border-border shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2 group">
          <img src={logoImg} alt="IA Cash Flow" className="h-10 w-10 rounded-full object-cover shadow-sm" />
          <span className="font-black text-lg tracking-tight">IA CASH FLOW</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-7">
          <Link href="/dashboard" className={navLinkClass("/dashboard")}>
            <LayoutDashboard className="h-4 w-4" /> Tableau de bord
          </Link>
          <Link href="/courses" className={navLinkClass("/courses")}>
            <BookOpen className="h-4 w-4" /> Mes formations
          </Link>
          <Link href="/files" className={navLinkClass("/files")}>
            <FolderOpen className="h-4 w-4" /> Ressources
          </Link>
        </nav>

        {/* Right */}
        <div className="flex items-center gap-3">
          {user.role === "admin" && (
            <Link href="/admin">
              <Button size="sm" variant="outline" className="hidden sm:flex items-center gap-1.5 border-primary/30 text-primary hover:bg-primary/5 font-semibold text-xs">
                <Shield className="h-3.5 w-3.5" /> Admin
              </Button>
            </Link>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 h-9 px-3 rounded-full border border-border">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-violet-500 flex items-center justify-center text-white text-xs font-bold">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium hidden sm:block max-w-[100px] truncate">{user.name?.split(" ")[0]}</span>
                <ChevronDown className="h-3 w-3 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-bold">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                  {user.hasPaid && (
                    <span className="inline-flex items-center gap-1 text-xs text-green-600 font-semibold mt-1">
                      ✓ Accès complet activé
                    </span>
                  )}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {user.role === "admin" && (
                <>
                  <DropdownMenuItem asChild>
                    <Link href="/admin" className="cursor-pointer flex items-center gap-2 w-full">
                      <Settings className="h-4 w-4 text-primary" /> Panneau admin
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem onClick={() => logout()} className="text-destructive cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" /> Se déconnecter
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile sheet */}
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="h-9 w-9"><Menu className="h-5 w-5" /></Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px]">
              <div className="flex items-center gap-2 mb-6 mt-2">
                <img src={logoImg} alt="IA Cash Flow" className="h-10 w-10 rounded-full object-cover" />
                <span className="font-black text-lg">IA CASH FLOW</span>
              </div>
              <div className="mb-4 p-3 rounded-lg bg-muted/50">
                <p className="text-sm font-semibold">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
              <nav className="flex flex-col gap-1">
                <Link href="/dashboard" className="flex items-center gap-2 text-sm font-semibold p-2.5 rounded-lg hover:bg-muted transition-colors">
                  <LayoutDashboard className="h-4 w-4 text-primary" /> Tableau de bord
                </Link>
                <Link href="/courses" className="flex items-center gap-2 text-sm font-semibold p-2.5 rounded-lg hover:bg-muted transition-colors">
                  <BookOpen className="h-4 w-4 text-primary" /> Mes formations
                </Link>
                <Link href="/files" className="flex items-center gap-2 text-sm font-semibold p-2.5 rounded-lg hover:bg-muted transition-colors">
                  <FolderOpen className="h-4 w-4 text-primary" /> Ressources
                </Link>
                {user.role === "admin" && (
                  <Link href="/admin" className="flex items-center gap-2 text-sm font-semibold p-2.5 rounded-lg text-primary hover:bg-primary/10 transition-colors mt-2 border-t border-border pt-4">
                    <Shield className="h-4 w-4" /> Panneau admin
                  </Link>
                )}
                <button
                  onClick={() => logout()}
                  className="flex items-center gap-2 text-sm font-semibold p-2.5 rounded-lg text-destructive hover:bg-destructive/10 transition-colors mt-4 border-t border-border pt-4 w-full text-left"
                >
                  <LogOut className="h-4 w-4" /> Se déconnecter
                </button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
