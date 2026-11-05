import React from 'react';

/**
 * ChamferCard renders an architectural spec card with a 45-degree beveled top-right corner,
 * continuous hairline border, clean white surface, and refined hover interactions.
 */
interface ChamferCardProps {
  children: React.ReactNode;
  className?: string;
  innerClassName?: string;
  notchSize?: number; // cut size in px, defaults to 22
}

export const ChamferCard: React.FC<ChamferCardProps> = ({
  children,
  className = '',
  innerClassName = 'p-4 sm:p-6',
  notchSize = 22,
}) => {
  // We use a dual-layer clip-path to ensure the 1px hairline border traces along the 45-degree diagonal beveled cut
  const outerClip = `polygon(0 0, calc(100% - ${notchSize}px) 0, 100% ${notchSize}px, 100% 100%, 0 100%)`;
  const innerClip = `polygon(0 0, calc(100% - ${notchSize - 1}px) 0, 100% ${notchSize - 1}px, 100% 100%, 0 100%)`;

  return (
    <div
      className={`relative p-[1px] bg-[#E5EAE5] transition-all duration-200 hover:bg-[#176B50]/40 group ${className}`}
      style={{ clipPath: outerClip }}
    >
      <div
        className={`bg-white flex flex-col justify-between h-full w-full ${innerClassName}`}
        style={{ clipPath: innerClip }}
      >
        {children}
      </div>
    </div>
  );
};

/**
 * Technical dot-matrix glyphs inspired by the spec-sheet reference
 */
export type DotGlyphType =
  | 'stepped'
  | 'square'
  | 'arrow'
  | 'cross'
  | 'reticle'
  | 'radar'
  | 'grid';

export const DotGlyph: React.FC<{ type: DotGlyphType; className?: string }> = ({
  type,
  className = 'w-4 h-4 text-[#18231E]',
}) => {
  switch (type) {
    case 'stepped':
      // 4 ascending dot columns (1, 2, 3, 4 dots)
      return (
        <svg
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
        >
          {/* Col 1 */}
          <circle cx="2.5" cy="13.5" r="1.2" fill="currentColor" fillOpacity="0.4" />
          {/* Col 2 */}
          <circle cx="6.5" cy="13.5" r="1.2" fill="currentColor" fillOpacity="0.6" />
          <circle cx="6.5" cy="9.5" r="1.2" fill="currentColor" fillOpacity="0.6" />
          {/* Col 3 */}
          <circle cx="10.5" cy="13.5" r="1.2" fill="currentColor" fillOpacity="0.8" />
          <circle cx="10.5" cy="9.5" r="1.2" fill="currentColor" fillOpacity="0.8" />
          <circle cx="10.5" cy="5.5" r="1.2" fill="currentColor" fillOpacity="0.8" />
          {/* Col 4 */}
          <circle cx="14.5" cy="13.5" r="1.2" fill="currentColor" />
          <circle cx="14.5" cy="9.5" r="1.2" fill="currentColor" />
          <circle cx="14.5" cy="5.5" r="1.2" fill="currentColor" />
          <circle cx="14.5" cy="1.5" r="1.2" fill="currentColor" />
        </svg>
      );

    case 'square':
      // 3x3 dot matrix with corner emphasis
      return (
        <svg
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
        >
          <circle cx="3" cy="3" r="1.3" fill="currentColor" />
          <circle cx="8" cy="3" r="1.3" fill="currentColor" fillOpacity="0.5" />
          <circle cx="13" cy="3" r="1.3" fill="currentColor" />
          <circle cx="3" cy="8" r="1.3" fill="currentColor" fillOpacity="0.5" />
          <circle cx="8" cy="8" r="1.3" fill="currentColor" />
          <circle cx="13" cy="8" r="1.3" fill="currentColor" fillOpacity="0.5" />
          <circle cx="3" cy="13" r="1.3" fill="currentColor" />
          <circle cx="8" cy="13" r="1.3" fill="currentColor" fillOpacity="0.5" />
          <circle cx="13" cy="13" r="1.3" fill="currentColor" />
        </svg>
      );

    case 'arrow':
      // Diagonal 45-degree arrow dot cluster
      return (
        <svg
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
        >
          <circle cx="13" cy="3" r="1.3" fill="currentColor" />
          <circle cx="9" cy="3" r="1.3" fill="currentColor" />
          <circle cx="13" cy="7" r="1.3" fill="currentColor" />
          <circle cx="10" cy="6" r="1.2" fill="currentColor" fillOpacity="0.8" />
          <circle cx="7" cy="9" r="1.2" fill="currentColor" fillOpacity="0.6" />
          <circle cx="4" cy="12" r="1.2" fill="currentColor" fillOpacity="0.4" />
        </svg>
      );

    case 'cross':
      // Plus / cross pattern
      return (
        <svg
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
        >
          <circle cx="8" cy="2" r="1.2" fill="currentColor" />
          <circle cx="8" cy="5" r="1.2" fill="currentColor" fillOpacity="0.8" />
          <circle cx="2" cy="8" r="1.2" fill="currentColor" />
          <circle cx="5" cy="8" r="1.2" fill="currentColor" fillOpacity="0.8" />
          <circle cx="8" cy="8" r="1.4" fill="currentColor" />
          <circle cx="11" cy="8" r="1.2" fill="currentColor" fillOpacity="0.8" />
          <circle cx="14" cy="8" r="1.2" fill="currentColor" />
          <circle cx="8" cy="11" r="1.2" fill="currentColor" fillOpacity="0.8" />
          <circle cx="8" cy="14" r="1.2" fill="currentColor" />
        </svg>
      );

    case 'reticle':
      // Coordinate reticle with central dot
      return (
        <svg
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
        >
          <circle cx="8" cy="8" r="1.5" fill="currentColor" />
          <circle cx="3" cy="3" r="1.1" fill="currentColor" fillOpacity="0.6" />
          <circle cx="13" cy="3" r="1.1" fill="currentColor" fillOpacity="0.6" />
          <circle cx="3" cy="13" r="1.1" fill="currentColor" fillOpacity="0.6" />
          <circle cx="13" cy="13" r="1.1" fill="currentColor" fillOpacity="0.6" />
          <path
            d="M8 3V5M8 11V13M3 8H5M11 8H13"
            stroke="currentColor"
            strokeWidth="0.8"
            strokeLinecap="round"
          />
        </svg>
      );

    case 'radar':
      // Concentric quadrant dots
      return (
        <svg
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
        >
          <circle cx="8" cy="8" r="1.4" fill="currentColor" />
          <circle cx="8" cy="4" r="1.1" fill="currentColor" fillOpacity="0.6" />
          <circle cx="12" cy="8" r="1.1" fill="currentColor" fillOpacity="0.6" />
          <circle cx="8" cy="12" r="1.1" fill="currentColor" fillOpacity="0.6" />
          <circle cx="4" cy="8" r="1.1" fill="currentColor" fillOpacity="0.6" />
        </svg>
      );

    case 'grid':
    default:
      // 4x4 fine grid
      return (
        <svg
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
        >
          {[2, 6, 10, 14].map((x) =>
            [2, 6, 10, 14].map((y) => (
              <circle
                key={`${x}-${y}`}
                cx={x}
                cy={y}
                r="0.9"
                fill="currentColor"
                fillOpacity={(x + y) % 3 === 0 ? 0.9 : 0.35}
              />
            ))
          )}
        </svg>
      );
  }
};

/**
 * Technical Frame for the bottom window of the card
 */
export const TechWindow: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => {
  return (
    <div
      className={`border border-[#E5EAE5] bg-[#FBFDFB] relative overflow-hidden flex items-center justify-center min-h-[170px] ${className}`}
    >
      {/* Subtle coordinate crosshair marks at corners */}
      <div className="absolute top-1.5 left-1.5 text-[8px] font-mono text-[#A8B4A6] select-none pointer-events-none">
        +
      </div>
      <div className="absolute top-1.5 right-1.5 text-[8px] font-mono text-[#A8B4A6] select-none pointer-events-none">
        +
      </div>
      <div className="absolute bottom-1.5 left-1.5 text-[8px] font-mono text-[#A8B4A6] select-none pointer-events-none">
        +
      </div>
      <div className="absolute bottom-1.5 right-1.5 text-[8px] font-mono text-[#A8B4A6] select-none pointer-events-none">
        +
      </div>

      {/* Subtle axonometric background grid */}
      <svg
        className="absolute inset-0 w-full h-full opacity-40 pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="tech-grid"
            width="24"
            height="24"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 24 0 L 0 0 0 24"
              fill="none"
              stroke="#E5EAE5"
              strokeWidth="0.6"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#tech-grid)" />
      </svg>

      {/* Main Drawing */}
      <div className="relative z-10 w-full h-full flex items-center justify-center p-2">
        {children}
      </div>
    </div>
  );
};

/* =========================================================================
   ISOMETRIC VECTOR WIREFRAME DRAWINGS
   (Directly inspired by Icon Design Spotlight #028 reference)
   ========================================================================= */

/**
 * Card 1: Isometric Stepped Cubes (Deposit Lock)
 * Matches Card 1 in reference with ascending blocks and projection lines
 */
export const DepositLockIsometric: React.FC = () => {
  return (
    <svg
      viewBox="0 0 260 145"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full max-h-[155px]"
    >
      {/* Axonometric projection dashed guide lines */}
      <g stroke="#C2CCC1" strokeWidth="0.75" strokeDasharray="3 3">
        <line x1="20" y1="125" x2="240" y2="25" />
        <line x1="55" y1="135" x2="250" y2="40" />
        <line x1="140" y1="140" x2="140" y2="10" />
      </g>

      {/* Block 1 (Lowest: 2x Rent - Delhi NCR standard) */}
      <g>
        {/* Top Face */}
        <polygon
          points="25,105 65,85 105,105 65,125"
          fill="#FFFFFF"
          stroke="#18231E"
          strokeWidth="1"
        />
        {/* Left Face */}
        <polygon
          points="25,105 65,125 65,135 25,115"
          fill="#F2F5F2"
          stroke="#18231E"
          strokeWidth="1"
        />
        {/* Right Face */}
        <polygon
          points="65,125 105,105 105,115 65,135"
          fill="#E5EAE5"
          stroke="#18231E"
          strokeWidth="1"
        />
        <text
          x="65"
          y="108"
          fill="#18231E"
          fontSize="9"
          fontFamily="monospace"
          fontWeight="700"
          textAnchor="middle"
        >
          2x
        </text>
      </g>

      {/* Block 2 (Medium: 6x Rent - Whitefield / Suburbs) */}
      <g>
        {/* Top Face */}
        <polygon
          points="80,80 125,58 170,80 125,102"
          fill="#FFFFFF"
          stroke="#18231E"
          strokeWidth="1"
        />
        {/* Left Face */}
        <polygon
          points="80,80 125,102 125,130 80,108"
          fill="#F2F5F2"
          stroke="#18231E"
          strokeWidth="1"
        />
        {/* Right Face */}
        <polygon
          points="125,102 170,80 170,108 125,130"
          fill="#E5EAE5"
          stroke="#18231E"
          strokeWidth="1"
        />
        <text
          x="125"
          y="83"
          fill="#18231E"
          fontSize="9.5"
          fontFamily="monospace"
          fontWeight="700"
          textAnchor="middle"
        >
          6x
        </text>
      </g>

      {/* Block 3 (Highest: 10x Rent - Indiranagar / Koramangala) */}
      <g>
        {/* Top Face with subtle pine tint */}
        <polygon
          points="145,55 195,30 245,55 195,80"
          fill="#E8F4EF"
          stroke="#176B50"
          strokeWidth="1.2"
        />
        {/* Left Face */}
        <polygon
          points="145,55 195,80 195,125 145,100"
          fill="#F4F8F5"
          stroke="#176B50"
          strokeWidth="1.2"
        />
        {/* Right Face */}
        <polygon
          points="195,80 245,55 245,100 195,125"
          fill="#D6E5DC"
          stroke="#176B50"
          strokeWidth="1.2"
        />
        <text
          x="195"
          y="58"
          fill="#176B50"
          fontSize="10"
          fontFamily="monospace"
          fontWeight="700"
          textAnchor="middle"
        >
          10x
        </text>
      </g>

      {/* Dimension & Label Callouts */}
      <g fontSize="8" fontFamily="monospace" fill="#5F6A63">
        <text x="195" y="22" textAnchor="middle" fill="#176B50" fontWeight="700">
          ₹3.5L LOCKED
        </text>
        <line x1="195" y1="24" x2="195" y2="29" stroke="#176B50" strokeWidth="0.8" />
        
        <text x="25" y="98" fill="#5F6A63">
          NCR: ₹60k
        </text>
        <text x="205" y="138" fill="#18231E" fontWeight="600">
          0% YIELD
        </text>
      </g>
    </svg>
  );
};

/**
 * Card 2: Isometric Radial Elliptical Arc Gauge (Purchasing Power Parity)
 * Matches Card 2 in reference with 3D tilted ring and HEALTH SCORE / PARITY readout
 */
export const PurchasingPowerIsometric: React.FC = () => {
  return (
    <svg
      viewBox="0 0 260 145"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full max-h-[155px]"
    >
      {/* Projection axes */}
      <g stroke="#C2CCC1" strokeWidth="0.75" strokeDasharray="3 3">
        <line x1="130" y1="10" x2="130" y2="135" />
        <line x1="20" y1="75" x2="240" y2="75" />
      </g>

      {/* Outer 3D Elliptical Base Ring */}
      <g>
        {/* Lower extrusion / thickness */}
        <ellipse
          cx="130"
          cy="85"
          rx="90"
          ry="38"
          fill="none"
          stroke="#E5EAE5"
          strokeWidth="16"
        />
        {/* Main Upper Arc */}
        <ellipse
          cx="130"
          cy="75"
          rx="90"
          ry="38"
          fill="none"
          stroke="#F0F4F1"
          strokeWidth="16"
        />

        {/* Shaded Active Arc Segment (Pine Green) */}
        <path
          d="M 215 75 A 90 38 0 0 1 130 113"
          stroke="#176B50"
          strokeWidth="16"
          strokeLinecap="round"
        />

        {/* Highlighted Marker Block on ring */}
        <g transform="translate(195, 84)">
          <polygon
            points="0,-4 12,-1 12,8 0,5"
            fill="#18231E"
            stroke="#18231E"
            strokeWidth="0.8"
          />
        </g>
      </g>

      {/* Inner Floor with Center Readout */}
      <ellipse cx="130" cy="75" rx="72" ry="30" fill="#FFFFFF" stroke="#E5EAE5" strokeWidth="0.8" />

      {/* Center Readout (like HEALTH SCORE in reference) */}
      <g textAnchor="middle" fontFamily="monospace">
        <text x="130" y="66" fontSize="7.5" fill="#5F6A63" letterSpacing="1.2">
          PARITY INDEX
        </text>
        <text x="130" y="86" fontSize="19" fill="#18231E" fontWeight="700">
          84.5
        </text>
        <text x="130" y="96" fontSize="7" fill="#176B50" fontWeight="600">
          DELHI NCR +18% SURPLUS
        </text>
      </g>

      {/* Outer Delta Calipers */}
      <g fontSize="8" fontFamily="monospace">
        <text x="32" y="72" fill="#5F6A63">
          BLR: -14%
        </text>
        <text x="185" y="44" fill="#176B50" fontWeight="600">
          EXPENSE MULTIPLIER
        </text>
      </g>
    </svg>
  );
};

/**
 * Card 3: Isometric Roadway Grid & Trajectory (Commute Velocity)
 * Matches Card 3 in reference with axonometric plane and coordinate probe dot
 */
export const CommuteVelocityIsometric: React.FC = () => {
  return (
    <svg
      viewBox="0 0 260 145"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full max-h-[155px]"
    >
      {/* Isometric Grid Floor Planes */}
      <g stroke="#E5EAE5" strokeWidth="0.8">
        {/* Plane 1 */}
        <polygon points="30,85 100,45 170,85 100,125" fill="#FAFCFA" />
        {/* Plane 2 offset */}
        <polygon points="100,45 170,10 240,45 170,85" fill="#F4F7F4" />
      </g>

      {/* Dotted projection coordinate lines */}
      <g stroke="#A8B4A6" strokeWidth="0.8" strokeDasharray="3 3">
        <line x1="170" y1="10" x2="170" y2="135" />
        <line x1="30" y1="85" x2="240" y2="85" />
        <line x1="65" y1="65" x2="205" y2="65" />
      </g>

      {/* Isometric Road Ribbon / Highway corridor */}
      <g>
        <path
          d="M 45 105 L 110 65 L 170 85 L 225 50"
          stroke="#D8E2DA"
          strokeWidth="12"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Road center dash */}
        <path
          d="M 45 105 L 110 65 L 170 85 L 225 50"
          stroke="#176B50"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>

      {/* Coordinate Probe Dot (black point with vertical probe line, like in ref) */}
      <line x1="170" y1="20" x2="170" y2="130" stroke="#18231E" strokeWidth="1" />
      <circle cx="170" cy="85" r="4.5" fill="#18231E" />
      <circle cx="170" cy="85" r="8" stroke="#176B50" strokeWidth="0.8" strokeDasharray="2 2" />

      {/* Origin Node */}
      <circle cx="45" cy="105" r="3" fill="#5F6A63" />

      {/* Dimension and Telemetry Labels */}
      <g fontFamily="monospace" fontSize="8" fill="#5F6A63">
        <text x="178" y="55" fill="#18231E" fontWeight="700">
          PEAK: +45m
        </text>
        <text x="178" y="65" fill="#176B50">
          2.1x SURGE
        </text>

        <text x="48" y="122" fill="#5F6A63">
          12.4 KM ROAD
        </text>
        <text x="200" y="40" fill="#A8B4A6">
          ORR CORRIDOR
        </text>
      </g>
    </svg>
  );
};

/**
 * Engine Card 1: Isometric Campus Hub & Baseline Coordinates
 */
export const HubBaselineIsometric: React.FC = () => {
  return (
    <svg
      viewBox="0 0 260 145"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full max-h-[155px]"
    >
      {/* Axonometric grid floor */}
      <g stroke="#E5EAE5" strokeWidth="0.7">
        <line x1="20" y1="70" x2="140" y2="135" />
        <line x1="60" y1="50" x2="180" y2="115" />
        <line x1="100" y1="30" x2="220" y2="95" />
        <line x1="140" y1="135" x2="240" y2="80" />
        <line x1="100" y1="115" x2="200" y2="60" />
      </g>

      {/* Radar Concentric Rings around office hub */}
      <ellipse
        cx="140"
        cy="90"
        rx="70"
        ry="30"
        stroke="#176B50"
        strokeWidth="0.8"
        strokeDasharray="3 3"
        fill="#176B50"
        fillOpacity="0.03"
      />
      <ellipse
        cx="140"
        cy="90"
        rx="38"
        ry="16"
        stroke="#176B50"
        strokeWidth="0.9"
        fill="#176B50"
        fillOpacity="0.06"
      />

      {/* 3D Tech Park Building Volume */}
      <g transform="translate(130, 48)">
        {/* Top */}
        <polygon
          points="10,0 28,-10 46,0 28,10"
          fill="#FFFFFF"
          stroke="#176B50"
          strokeWidth="1.2"
        />
        {/* Left */}
        <polygon
          points="10,0 28,10 28,42 10,32"
          fill="#E8F4EF"
          stroke="#176B50"
          strokeWidth="1.2"
        />
        {/* Right */}
        <polygon
          points="28,10 46,0 46,32 28,42"
          fill="#D6E5DC"
          stroke="#176B50"
          strokeWidth="1.2"
        />

        {/* Windows */}
        <line x1="16" y1="12" x2="22" y2="15" stroke="#176B50" strokeWidth="0.8" />
        <line x1="16" y1="20" x2="22" y2="23" stroke="#176B50" strokeWidth="0.8" />
        <line x1="34" y1="15" x2="40" y2="12" stroke="#176B50" strokeWidth="0.8" />
        <line x1="34" y1="23" x2="40" y2="20" stroke="#176B50" strokeWidth="0.8" />
      </g>

      {/* Coordinate & Cashflow Tags */}
      <g fontFamily="monospace" fontSize="8">
        <text x="35" y="40" fill="#18231E" fontWeight="700">
          HUB: [12.935, 77.691]
        </text>
        <text x="35" y="52" fill="#5F6A63">
          ECOSPACE / BELLANDUR
        </text>

        {/* Floating Callout badge */}
        <rect
          x="35"
          y="105"
          width="85"
          height="22"
          fill="#FFFFFF"
          stroke="#E5EAE5"
          strokeWidth="0.8"
        />
        <text x="42" y="115" fill="#5F6A63" fontSize="7">
          IN-HAND TAKE-HOME
        </text>
        <text x="42" y="123" fill="#176B50" fontSize="8" fontWeight="700">
          ₹1,45,000 / mo
        </text>
      </g>
    </svg>
  );
};

/**
 * Engine Card 2: Isometric OSRM Road Vector Network
 */
export const RoutingMatrixIsometric: React.FC = () => {
  return (
    <svg
      viewBox="0 0 260 145"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full max-h-[155px]"
    >
      {/* Axonometric reference planes */}
      <polygon
        points="30,75 130,25 230,75 130,125"
        fill="#FFFFFF"
        stroke="#E5EAE5"
        strokeWidth="0.8"
      />

      {/* Secondary network links (grey) */}
      <g stroke="#C2CCC1" strokeWidth="1" strokeDasharray="2 2">
        <line x1="60" y1="80" x2="110" y2="55" />
        <line x1="110" y1="55" x2="160" y2="90" />
        <line x1="160" y1="90" x2="200" y2="70" />
        <line x1="110" y1="55" x2="140" y2="35" />
      </g>

      {/* Main OSRM Routing Vector (High-contrast pine path) */}
      <path
        d="M 60 80 L 105 102 L 155 75 L 200 70"
        stroke="#176B50"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Network Nodes */}
      <circle cx="60" cy="80" r="3.5" fill="#18231E" />
      <circle cx="105" cy="102" r="3" fill="#176B50" />
      <circle cx="155" cy="75" r="3" fill="#176B50" />
      <circle cx="200" cy="70" r="4.5" fill="#176B50" />
      <circle cx="200" cy="70" r="1.5" fill="#FFFFFF" />

      {/* Floating Measurement Caliper */}
      <line x1="60" y1="90" x2="200" y2="80" stroke="#18231E" strokeWidth="0.6" />
      <line x1="60" y1="87" x2="60" y2="93" stroke="#18231E" strokeWidth="0.6" />
      <line x1="200" y1="77" x2="200" y2="83" stroke="#18231E" strokeWidth="0.6" />

      {/* Telemetry Readouts */}
      <g fontFamily="monospace" fontSize="8">
        <text x="130" y="96" fill="#18231E" textAnchor="middle" fontWeight="700">
          14.8 KM · 24 MINS
        </text>

        <rect
          x="150"
          y="25"
          width="82"
          height="22"
          fill="#FFFFFF"
          stroke="#E5EAE5"
          strokeWidth="0.8"
        />
        <text x="156" y="34" fill="#5F6A63" fontSize="6.5">
          OSRM SCORE
        </text>
        <text x="156" y="43" fill="#176B50" fontSize="8" fontWeight="700">
          COMMUTE INDEX 94
        </text>
      </g>
    </svg>
  );
};

/**
 * Engine Card 3: Isometric Scenarios & Executive Ledger Sheets
 * Matches Card 4 in reference with stacked axonometric rectangular volumes
 */
export const ExecutiveReportIsometric: React.FC = () => {
  return (
    <svg
      viewBox="0 0 260 145"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full max-h-[155px]"
    >
      {/* Projection construction lines */}
      <g stroke="#C2CCC1" strokeWidth="0.75" strokeDasharray="3 3">
        <line x1="30" y1="30" x2="230" y2="130" />
        <line x1="175" y1="10" x2="175" y2="140" />
      </g>

      {/* Layer 1: Bottom Report Sheet */}
      <polygon
        points="40,80 120,40 190,75 110,115"
        fill="#FFFFFF"
        stroke="#E5EAE5"
        strokeWidth="1"
      />

      {/* Layer 2: Middle Data Sheet with Cashflow bars */}
      <polygon
        points="55,68 135,28 205,63 125,103"
        fill="#F8FBF8"
        stroke="#18231E"
        strokeWidth="1"
      />

      {/* Isometric Surplus Block on the report sheet */}
      <g transform="translate(135, 45)">
        {/* Top */}
        <polygon
          points="0,0 24,-12 48,0 24,12"
          fill="#C8E6A0"
          stroke="#176B50"
          strokeWidth="1.2"
        />
        {/* Left */}
        <polygon
          points="0,0 24,12 24,30 0,18"
          fill="#176B50"
          stroke="#176B50"
          strokeWidth="1.2"
        />
        {/* Right */}
        <polygon
          points="24,12 48,0 48,18 24,30"
          fill="#125740"
          stroke="#176B50"
          strokeWidth="1.2"
        />
        <text
          x="24"
          y="3"
          fill="#18231E"
          fontSize="7"
          fontFamily="monospace"
          fontWeight="700"
          textAnchor="middle"
        >
          NET
        </text>
      </g>

      {/* Text Annotations */}
      <g fontFamily="monospace" fontSize="8">
        <text x="65" y="60" fill="#18231E" fontWeight="700">
          EXECUTIVE AUDIT
        </text>
        <text x="65" y="70" fill="#5F6A63" fontSize="7">
          VERIFIED SCENARIOS
        </text>

        <rect
          x="35"
          y="110"
          width="90"
          height="20"
          fill="#FFFFFF"
          stroke="#E5EAE5"
          strokeWidth="0.8"
        />
        <text x="42" y="123" fill="#176B50" fontSize="8" fontWeight="700">
          +₹48,500/MO SURPLUS
        </text>
      </g>
    </svg>
  );
};

/**
 * Offer Evaluation: Isometric Compensation Parity & Counter-Offer Architecture
 */
export const CompensationAuditIsometric: React.FC = () => {
  return (
    <svg
      viewBox="0 0 280 150"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full max-h-[160px]"
    >
      {/* Axonometric construction grid */}
      <g stroke="#C2CCC1" strokeWidth="0.75" strokeDasharray="3 3">
        <line x1="20" y1="120" x2="260" y2="40" />
        <line x1="140" y1="15" x2="140" y2="140" />
        <line x1="30" y1="50" x2="250" y2="120" />
      </g>

      {/* Current Offer Baseline Column (Left) */}
      <g transform="translate(60, 45)">
        {/* Base Block (Current Living Costs) */}
        <polygon
          points="0,20 28,6 56,20 28,34"
          fill="#FFFFFF"
          stroke="#18231E"
          strokeWidth="1"
        />
        <polygon
          points="0,20 28,34 28,65 0,51"
          fill="#F2F5F2"
          stroke="#18231E"
          strokeWidth="1"
        />
        <polygon
          points="28,34 56,20 56,51 28,65"
          fill="#E5EAE5"
          stroke="#18231E"
          strokeWidth="1"
        />

        {/* Top Surplus Cap */}
        <polygon
          points="0,0 28,-14 56,0 28,14"
          fill="#F5F8F5"
          stroke="#5F6A63"
          strokeWidth="1"
        />
        <polygon
          points="0,0 28,14 28,20 0,6"
          fill="#E5EAE5"
          stroke="#5F6A63"
          strokeWidth="1"
        />
        <polygon
          points="28,14 56,0 56,6 28,20"
          fill="#DDE4DD"
          stroke="#5F6A63"
          strokeWidth="1"
        />

        <text x="28" y="4" fill="#5F6A63" fontSize="7" fontFamily="monospace" textAnchor="middle" fontWeight="600">
          CURRENT
        </text>
        <text x="28" y="48" fill="#18231E" fontSize="8" fontFamily="monospace" textAnchor="middle" fontWeight="700">
          ₹1.25L
        </text>
      </g>

      {/* Relocation Required Target Column (Right, Elevated with Pine Top) */}
      <g transform="translate(160, 20)">
        {/* Required Costs Base */}
        <polygon
          points="0,25 32,9 64,25 32,41"
          fill="#FFFFFF"
          stroke="#176B50"
          strokeWidth="1.2"
        />
        <polygon
          points="0,25 32,41 32,85 0,69"
          fill="#E8F4EF"
          stroke="#176B50"
          strokeWidth="1.2"
        />
        <polygon
          points="32,41 64,25 64,69 32,85"
          fill="#D6E5DC"
          stroke="#176B50"
          strokeWidth="1.2"
        />

        {/* Elevated Surplus Block (Pistachio Green) */}
        <polygon
          points="0,0 32,-16 64,0 32,16"
          fill="#C8E6A0"
          stroke="#176B50"
          strokeWidth="1.2"
        />
        <polygon
          points="0,0 32,16 32,25 0,9"
          fill="#176B50"
          stroke="#176B50"
          strokeWidth="1.2"
        />
        <polygon
          points="32,16 64,0 64,9 32,25"
          fill="#125740"
          stroke="#176B50"
          strokeWidth="1.2"
        />

        <text x="32" y="2" fill="#18231E" fontSize="8" fontFamily="monospace" textAnchor="middle" fontWeight="700">
          +32% PARITY
        </text>
        <text x="32" y="58" fill="#176B50" fontSize="8.5" fontFamily="monospace" textAnchor="middle" fontWeight="700">
          ₹1.65L
        </text>
      </g>

      {/* Parity Caliper Connection Line */}
      <path
        d="M 116 48 L 160 30"
        stroke="#176B50"
        strokeWidth="1.2"
        strokeDasharray="2 2"
      />
      <circle cx="116" cy="48" r="2.5" fill="#18231E" />
      <circle cx="160" cy="30" r="3" fill="#176B50" />

      {/* Readout Badges */}
      <g fontFamily="monospace" fontSize="8">
        <text x="140" y="24" fill="#176B50" textAnchor="middle" fontWeight="700">
          Δ +₹40k / MO
        </text>

        <rect
          x="15"
          y="118"
          width="110"
          height="22"
          fill="#FFFFFF"
          stroke="#E5EAE5"
          strokeWidth="0.8"
        />
        <text x="22" y="128" fill="#5F6A63" fontSize="6.5">
          ONE-TIME CAPITAL LOCK
        </text>
        <text x="22" y="136" fill="#18231E" fontSize="7.5" fontWeight="700">
          ₹3.0L–₹4.5L DEPOSIT
        </text>

        <rect
          x="155"
          y="118"
          width="110"
          height="22"
          fill="#FFFFFF"
          stroke="#E5EAE5"
          strokeWidth="0.8"
        />
        <text x="162" y="128" fill="#5F6A63" fontSize="6.5">
          COUNTER-OFFER RULE
        </text>
        <text x="162" y="136" fill="#176B50" fontSize="7.5" fontWeight="700">
          MIN +28% IN-HAND
        </text>
      </g>
    </svg>
  );
};

