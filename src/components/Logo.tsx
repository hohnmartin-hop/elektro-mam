interface LogoProps {
  className?: string;
  showText?: boolean;
}

export function Logo({ className = '', showText = true }: LogoProps) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* IC schematic symbol */}
      <svg
        viewBox="0 0 48 48"
        className="h-10 w-10 flex-shrink-0"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Rounded background */}
        <rect x="2" y="2" width="44" height="44" rx="12" fill="#0d1117" stroke="#00d4ff" strokeWidth="1.5" strokeOpacity="0.3" />

        {/* IC body */}
        <rect x="14" y="12" width="20" height="24" rx="2" fill="#00d4ff" fillOpacity="0.08" stroke="#00d4ff" strokeWidth="2" />

        /* Pin 1 indicator dot (notch) */
        <circle cx="17" cy="15" r="1.3" fill="#00d4ff" fillOpacity="0.5" />

        {/* Left pins */}
        <line x1="14" y1="17" x2="9" y2="17" stroke="#00d4ff" strokeWidth="1.8" stroke-linecap="round" />
        <line x1="14" y1="23" x2="9" y2="23" stroke="#00d4ff" strokeWidth="1.8" stroke-linecap="round" />
        <line x1="14" y1="29" x2="9" y2="29" stroke="#00d4ff" strokeWidth="1.8" stroke-linecap="round" />
        <line x1="14" y1="35" x2="9" y2="35" stroke="#00d4ff" strokeWidth="1.8" stroke-linecap="round" />

        {/* Right pins */}
        <line x1="34" y1="17" x2="39" y2="17" stroke="#00d4ff" strokeWidth="1.8" stroke-linecap="round" />
        <line x1="34" y1="23" x2="39" y2="23" stroke="#00d4ff" strokeWidth="1.8" stroke-linecap="round" />
        <line x1="34" y1="29" x2="39" y2="29" stroke="#00d4ff" strokeWidth="1.8" stroke-linecap="round" />
        <line x1="34" y1="35" x2="39" y2="35" stroke="#00d4ff" strokeWidth="1.8" stroke-linecap="round" />

        {/* Pin numbers */}
        <text x="15.5" y="18.5" font-size="3.5" fill="#00d4ff" fillOpacity="0.6" font-family="monospace">1</text>
        <text x="15.5" y="24.5" font-size="3.5" fill="#00d4ff" fillOpacity="0.6" font-family="monospace">2</text>
        <text x="15.5" y="30.5" font-size="3.5" fill="#00d4ff" fillOpacity="0.6" font-family="monospace">3</text>
        <text x="30" y="18.5" font-size="3.5" fill="#00d4ff" fillOpacity="0.6" font-family="monospace">8</text>
        <text x="30" y="24.5" font-size="3.5" fill="#00d4ff" fillOpacity="0.6" font-family="monospace">7</text>
        <text x="30" y="30.5" font-size="3.5" fill="#00d4ff" fillOpacity="0.6" font-family="monospace">6</text>

        {/* Inner glow core */}
        <circle cx="24" cy="24" r="3" fill="#00d4ff" fillOpacity="0.15" />
        <circle cx="24" cy="24" r="1.5" fill="#00d4ff" fillOpacity="0.5" />
      </svg>

      {showText && (
        <div className="leading-tight">
          <span className="block text-sm font-bold tracking-tight text-white">
            Elektro <span className="text-gradient">MaM</span>
          </span>
          <span className="block font-mono text-[10px] text-ink-200">Ostrava · Bastlení</span>
        </div>
      )}
    </div>
  );
}
