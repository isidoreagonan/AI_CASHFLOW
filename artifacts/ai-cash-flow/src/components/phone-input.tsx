import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

const COUNTRIES = [
  { code: "BJ", name: "Bénin", flag: "🇧🇯", prefix: "+229" },
  { code: "CI", name: "Côte d'Ivoire", flag: "🇨🇮", prefix: "+225" },
  { code: "SN", name: "Sénégal", flag: "🇸🇳", prefix: "+221" },
  { code: "CM", name: "Cameroun", flag: "🇨🇲", prefix: "+237" },
  { code: "CG", name: "Congo", flag: "🇨🇬", prefix: "+242" },
  { code: "GA", name: "Gabon", flag: "🇬🇦", prefix: "+241" },
  { code: "CD", name: "RD Congo", flag: "🇨🇩", prefix: "+243" },
  { code: "KE", name: "Kenya", flag: "🇰🇪", prefix: "+254" },
  { code: "RW", name: "Rwanda", flag: "🇷🇼", prefix: "+250" },
  { code: "UG", name: "Uganda", flag: "🇺🇬", prefix: "+256" },
  { code: "TZ", name: "Tanzanie", flag: "🇹🇿", prefix: "+255" },
  { code: "GH", name: "Ghana", flag: "🇬🇭", prefix: "+233" },
  { code: "NG", name: "Nigeria", flag: "🇳🇬", prefix: "+234" },
  { code: "TG", name: "Togo", flag: "🇹🇬", prefix: "+228" },
  { code: "BF", name: "Burkina Faso", flag: "🇧🇫", prefix: "+226" },
  { code: "ML", name: "Mali", flag: "🇲🇱", prefix: "+223" },
  { code: "NE", name: "Niger", flag: "🇳🇪", prefix: "+227" },
  { code: "GN", name: "Guinée", flag: "🇬🇳", prefix: "+224" },
  { code: "MR", name: "Mauritanie", flag: "🇲🇷", prefix: "+222" },
  { code: "MA", name: "Maroc", flag: "🇲🇦", prefix: "+212" },
  { code: "TN", name: "Tunisie", flag: "🇹🇳", prefix: "+216" },
  { code: "DZ", name: "Algérie", flag: "🇩🇿", prefix: "+213" },
  { code: "EG", name: "Égypte", flag: "🇪🇬", prefix: "+20" },
  { code: "FR", name: "France", flag: "🇫🇷", prefix: "+33" },
  { code: "BE", name: "Belgique", flag: "🇧🇪", prefix: "+32" },
  { code: "CH", name: "Suisse", flag: "🇨🇭", prefix: "+41" },
  { code: "CA", name: "Canada", flag: "🇨🇦", prefix: "+1" },
  { code: "US", name: "États-Unis", flag: "🇺🇸", prefix: "+1" },
];

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
  id?: string;
}

export function PhoneInput({ value, onChange, placeholder = "6X XX XX XX", className = "", required, id }: PhoneInputProps) {
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filtered = COUNTRIES.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.prefix.includes(search)
  );

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearch("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const phoneNumber = value.startsWith(selectedCountry.prefix)
    ? value.slice(selectedCountry.prefix.length).trimStart()
    : value.replace(/^\+\d+\s?/, "");

  const handlePhoneChange = (raw: string) => {
    const digits = raw.replace(/[^\d\s]/g, "");
    onChange(`${selectedCountry.prefix} ${digits}`.trim());
  };

  const handleCountryChange = (country: typeof COUNTRIES[0]) => {
    const digits = value.replace(/^\+\d+\s?/, "").replace(/[^\d\s]/g, "");
    setSelectedCountry(country);
    onChange(`${country.prefix} ${digits}`.trim());
    setIsOpen(false);
    setSearch("");
  };

  return (
    <div className={`relative flex ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-2 bg-background/50 border border-r-0 border-border rounded-l-md hover:bg-muted/60 transition-colors min-w-[90px] shrink-0 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:z-10"
      >
        <span className="text-lg leading-none">{selectedCountry.flag}</span>
        <span className="text-sm font-medium text-muted-foreground">{selectedCountry.prefix}</span>
        <ChevronDown className={`w-3 h-3 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      <input
        id={id}
        type="tel"
        inputMode="numeric"
        value={phoneNumber}
        onChange={e => handlePhoneChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="flex-1 px-3 py-2 bg-background/50 border border-border rounded-r-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors"
      />

      {isOpen && (
        <div className="absolute left-0 top-full mt-1 z-50 bg-card border border-border rounded-xl shadow-xl w-72 overflow-hidden">
          <div className="p-2 border-b border-border">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher un pays…"
              className="w-full px-3 py-1.5 text-sm bg-muted/50 border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary/40"
              autoFocus
            />
          </div>
          <div className="max-h-56 overflow-y-auto">
            {filtered.map(country => (
              <button
                key={`${country.code}-${country.prefix}`}
                type="button"
                onClick={() => handleCountryChange(country)}
                className={`w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-muted/60 transition-colors text-left ${
                  selectedCountry.code === country.code ? "bg-primary/10 text-primary font-medium" : ""
                }`}
              >
                <span className="text-lg">{country.flag}</span>
                <span className="flex-1 truncate">{country.name}</span>
                <span className="text-muted-foreground text-xs">{country.prefix}</span>
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="text-center text-sm text-muted-foreground py-4">Aucun résultat</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
