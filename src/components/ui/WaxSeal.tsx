interface WaxSealProps {
  monogram: string;
  /** Render hanya separuh segel (untuk animasi segel pecah saat dibuka). */
  half?: "left" | "right";
  className?: string;
}

/** Shade lilin dari --accent tema, supaya segel ikut data-theme. */
const WAX = {
  hi: "color-mix(in srgb, var(--accent) 58%, white)",
  mid: "var(--accent)",
  lo: "color-mix(in srgb, var(--accent) 52%, black)",
  deep: "color-mix(in srgb, var(--accent) 28%, black)",
  face: "color-mix(in srgb, var(--accent) 78%, black)",
  glint: "color-mix(in srgb, var(--accent) 38%, white)",
};
  
  export function WaxSeal({ monogram, half, className }: WaxSealProps) {
    return (
      <svg
        viewBox="-10 -10 220 230"
        className={className}
        aria-hidden="true"
        focusable="false"
        style={{ overflow: "visible" }}
      >
        <defs>
          {/* Cahaya dari kiri atas, dipakai di seluruh badan lilin */}
          <radialGradient
            id="wax-body"
            gradientUnits="userSpaceOnUse"
            cx="72"
            cy="66"
            r="150"
          >
            <stop offset="0" stopColor={WAX.hi} />
            <stop offset="0.42" stopColor={WAX.mid} />
            <stop offset="1" stopColor={WAX.lo} />
          </radialGradient>
  
          <radialGradient id="wax-disc" cx="60%" cy="62%" r="80%">
            <stop offset="0" stopColor={WAX.mid} />
            <stop offset="1" stopColor={WAX.lo} />
          </radialGradient>
  
          {/* Bevel tepi luar: terang di kiri atas, gelap di kanan bawah */}
          <linearGradient id="wax-rim" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={WAX.glint} stopOpacity="0.75" />
            <stop offset="0.4" stopColor={WAX.glint} stopOpacity="0" />
            <stop offset="0.7" stopColor={WAX.deep} stopOpacity="0" />
            <stop offset="1" stopColor={WAX.deep} stopOpacity="0.85" />
          </linearGradient>
  
          {/* Cekungan dalam: kebalikannya, gelap di kiri atas, terang di kanan bawah */}
          <linearGradient id="wax-inner-bevel" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={WAX.deep} stopOpacity="0.9" />
            <stop offset="0.5" stopColor={WAX.deep} stopOpacity="0" />
            <stop offset="1" stopColor={WAX.glint} stopOpacity="0.6" />
          </linearGradient>
  
          {/* Tepi lilin yang tidak bulat sempurna, seperti lelehan sungguhan */}
          <filter id="wax-edge" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.022 0.03"
              numOctaves="3"
              seed="7"
              result="n"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="n"
              scale="16"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
  
          {/* Ketidaksempurnaan halus pada cetakan */}
          <filter id="wax-soft" x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.05"
              numOctaves="2"
              seed="11"
              result="n"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="n"
              scale="3.5"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
  
          {/* Butiran halus permukaan lilin */}
          <filter id="wax-grain" x="0" y="0" width="100%" height="100%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.85"
              numOctaves="2"
              seed="3"
              result="t"
            />
            <feColorMatrix
              in="t"
              type="matrix"
              values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1.1 -0.45"
              result="speck"
            />
            <feComposite in="speck" in2="SourceGraphic" operator="in" />
          </filter>
  
          <filter id="wax-shadow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="7" />
          </filter>
          <filter id="wax-blur-soft" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4.5" />
          </filter>
  
          {/* Garis retak untuk dua belahan, dipakai saat segel dibuka */}
          <clipPath id="wax-clip-left">
            <polygon points="-20,-20 96,-20 104,34 94,62 106,96 97,128 104,160 98,230 -20,230" />
          </clipPath>
          <clipPath id="wax-clip-right">
            <polygon points="96,-20 230,-20 230,230 98,230 104,160 97,128 106,96 94,62 104,34" />
          </clipPath>
        </defs>
  
        <g clipPath={half ? `url(#wax-clip-${half})` : undefined}>
          {/* Bayangan jatuh di atas foto */}
          <circle
            cx="105"
            cy="114"
            r="76"
            fill="#000"
            opacity="0.5"
            filter="url(#wax-shadow)"
          />
  
          {/* Badan lilin: lingkaran + tonjolan lelehan, semuanya dibengkokkan filter */}
          <g filter="url(#wax-edge)">
            <circle cx="100" cy="100" r="78" fill="url(#wax-body)" />
            <circle cx="26" cy="126" r="15" fill="url(#wax-body)" />
            <circle cx="178" cy="74" r="13" fill="url(#wax-body)" />
            <circle cx="132" cy="176" r="12" fill="url(#wax-body)" />
            <circle
              cx="100"
              cy="100"
              r="75"
              fill="none"
              stroke="url(#wax-rim)"
              strokeWidth="3.5"
            />
          </g>
  
          {/* Butiran permukaan */}
          <circle
            cx="100"
            cy="100"
            r="74"
            fill="#000"
            opacity="0.3"
            filter="url(#wax-grain)"
          />
  
          {/* Cakram cetakan yang menekan lilin */}
          <g filter="url(#wax-soft)">
            <circle cx="100" cy="100" r="56" fill="url(#wax-disc)" />
            <circle
              cx="100"
              cy="100"
              r="56"
              fill="none"
              stroke="url(#wax-inner-bevel)"
              strokeWidth="3"
            />
  
            {/* Cincin timbul tipis */}
            <circle
              cx="99.2"
              cy="99.2"
              r="47"
              fill="none"
              stroke={WAX.glint}
              strokeOpacity="0.4"
              strokeWidth="1"
            />
            <circle
              cx="100.8"
              cy="100.8"
              r="47"
              fill="none"
              stroke={WAX.deep}
              strokeOpacity="0.7"
              strokeWidth="1"
            />
  
            {/* Monogram timbul: sisi terang kiri atas, sisi gelap kanan bawah */}
            <text
              x="101.6"
              y="102.2"
              textAnchor="middle"
              dominantBaseline="central"
              className="font-maellen"
              fontSize="50"
              fill={WAX.deep}
              fillOpacity="0.9"
            >
              {monogram}
            </text>
            <text
              x="98.8"
              y="99"
              textAnchor="middle"
              dominantBaseline="central"
              className="font-maellen"
              fontSize="50"
              fill={WAX.glint}
              fillOpacity="0.65"
            >
              {monogram}
            </text>
            <text
              x="100"
              y="100.5"
              textAnchor="middle"
              dominantBaseline="central"
              className="font-maellen"
              fontSize="50"
              fill={WAX.face}
            >
              {monogram}
            </text>
          </g>
  
          {/* Kilau pada permukaan lilin yang licin */}
          <ellipse
            cx="64"
            cy="48"
            rx="28"
            ry="9"
            transform="rotate(-38 64 48)"
            fill="#fff"
            opacity="0.35"
            filter="url(#wax-blur-soft)"
          />
          <ellipse
            cx="50"
            cy="66"
            rx="7"
            ry="2.4"
            transform="rotate(-42 50 66)"
            fill="#fff"
            opacity="0.55"
          />
          <ellipse
            cx="154"
            cy="154"
            rx="16"
            ry="4"
            transform="rotate(-40 154 154)"
            fill={WAX.glint}
            opacity="0.18"
            filter="url(#wax-blur-soft)"
          />
        </g>
      </svg>
    );
  }