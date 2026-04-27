import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard, BookOpen, Users, CreditCard,
  FolderOpen, LogOut, ChevronRight, Shield, Menu, X
} from "lucide-react";
import logoImg from "@assets/ChatGPT_Image_Apr_18,_2026,_02_56_10_PM_1776520714293.png";
import { useState } from "react";

const NAV_ITEMS = [
  { href: "/admin", label: "Tableau de bord", icon: LayoutDashboard, exact: true },
  { href: "/admin/courses", label: "Formations", icon: BookOpen },
  { href: "/admin/users", label: "Étudiants", icon: Users },
  { href: "/admin/payments", label: "Paiements", icon: CreditCard },
  { href: "/admin/files", label: "Ressources", icon: FolderOpen },
];

function SidebarContent({ location, logout, user, onClose }: {
  location: string;
  logout: () => void;
  user: any;
  onClose?: () => void;
}) {
  const isActive = (href: string, exact?: boolean) =>
    exact ? location === href : location.startsWith(href);

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-between p-5 border-b border-white/10">
        <Link href="/admin" className="flex items-center gap-2.5" onClick={onClose}>
          <img src={logoImg} alt="IA Cash Flow" className="h-9 w-9 rounded-full object-cover ring-2 ring-white/20" />
          <div>
            <p className="font-black text-sm text-white leading-none">IA CASH FLOW</p>
            <p className="text-[10px] text-white/50 font-medium mt-0.5 flex items-center gap-1">
              <Shield className="h-2.5 w-2.5" /> Panneau Admin
            </p>
          </div>
        </Link>
        {onClose && (
          <button onClick={onClose} className="text-white/50 hover:text-white transition-colors">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Admin info */}
      <div className="mx-4 mt-4 mb-2 p-3 rounded-xl bg-white/5 border border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-violet-500 flex items-center justify-center text-white font-bold text-sm">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-white text-xs font-bold truncate">{user?.name}</p>
            <p className="text-white/40 text-[10px] truncate">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest px-3 mb-3">Navigation</p>
        {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
          const active = isActive(href, exact);
          return (
            <Link key={href} href={href} onClick={onClose}>
              <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 cursor-pointer group ${
                active
                  ? "bg-white text-primary font-bold shadow-lg shadow-white/10"
                  : "text-white/60 hover:text-white hover:bg-white/10"
              }`}>
                <Icon className={`h-4 w-4 flex-shrink-0 ${active ? "text-primary" : "group-hover:text-white"}`} />
                <span className="text-sm">{label}</span>
                {active && <ChevronRight className="h-3.5 w-3.5 ml-auto text-primary" />}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Bottom actions */}
      <div className="p-4 border-t border-white/10 space-y-2">
        <Link href="/dashboard" onClick={onClose}>
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-white/50 hover:text-white hover:bg-white/5 transition-all cursor-pointer text-sm">
            <LayoutDashboard className="h-4 w-4" /> Vue étudiant
          </div>
        </Link>
        <button
          onClick={logout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-red-400/70 hover:text-red-400 hover:bg-red-400/10 transition-all text-sm"
        >
          <LogOut className="h-4 w-4" /> Se déconnecter
        </button>
      </div>
    </div>
  );
}

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[#f4f4f8] overflow-hidden">
      {/* Sidebar desktop */}
      <aside className="hidden md:flex w-60 flex-col bg-gradient-to-b from-[#1a1035] via-[#1e1245] to-[#160d35] flex-shrink-0">
        <SidebarContent location={location} logout={logout} user={user} />
      </aside>

      {/* Mobile overlay sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="w-64 bg-gradient-to-b from-[#1a1035] via-[#1e1245] to-[#160d35] flex flex-col shadow-2xl">
            <SidebarContent location={location} logout={logout} user={user} onClose={() => setMobileOpen(false)} />
          </div>
          <div className="flex-1 bg-black/50" onClick={() => setMobileOpen(false)} />
        </div>
      )}

      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile topbar */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-border shadow-sm">
          <button onClick={() => setMobileOpen(true)} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <img src={logoImg} alt="" className="h-7 w-7 rounded-full object-cover" />
            <span className="font-black text-sm">Admin</span>
          </div>
          <div className="w-8" />
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
