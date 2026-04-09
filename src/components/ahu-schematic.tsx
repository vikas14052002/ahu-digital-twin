import { type SensorData, getAHUMode } from '@/data/mock-data';

interface Props {
  data: SensorData;
}

export function AHUSchematic({ data }: Props) {
  const mode = getAHUMode(data);
  const modeColor =
    mode.mode === 'cooling'
      ? '#06b6d4'
      : mode.mode === 'heating'
        ? '#f97316'
        : mode.mode === 'economizer'
          ? '#22c55e'
          : '#6b7280';

  const airflowSpeed = Math.max(0.5, 3 - (data.fanSpeed / 1500) * 2.5);

  return (
    <div className="relative w-full">
      <svg
        viewBox="0 0 900 340"
        className="w-full h-auto"
        style={{ filter: 'drop-shadow(0 4px 20px rgba(0,0,0,0.15))' }}
      >
        <defs>
          {/* Airflow particle animation */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <linearGradient id="ahuBody" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>

          <linearGradient id="coolGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#0891b2" stopOpacity="0.4" />
          </linearGradient>

          <linearGradient id="heatGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f97316" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#ea580c" stopOpacity="0.4" />
          </linearGradient>

          <linearGradient id="ductGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#334155" />
            <stop offset="50%" stopColor="#475569" />
            <stop offset="100%" stopColor="#334155" />
          </linearGradient>

          {/* Animated airflow dots */}
          <pattern
            id="airflow"
            x="0"
            y="0"
            width="40"
            height="20"
            patternUnits="userSpaceOnUse"
          >
            <circle r="2" fill={modeColor} opacity="0.6">
              <animateMotion
                dur={`${airflowSpeed}s`}
                repeatCount="indefinite"
                path="M0,10 L40,10"
              />
            </circle>
            <circle r="1.5" fill={modeColor} opacity="0.4">
              <animateMotion
                dur={`${airflowSpeed}s`}
                repeatCount="indefinite"
                path="M0,5 L40,5"
                begin="0.3s"
              />
            </circle>
            <circle r="1.5" fill={modeColor} opacity="0.4">
              <animateMotion
                dur={`${airflowSpeed}s`}
                repeatCount="indefinite"
                path="M0,15 L40,15"
                begin="0.6s"
              />
            </circle>
          </pattern>
        </defs>

        {/* Background */}
        <rect x="0" y="0" width="900" height="340" rx="12" fill="#0a0e1a" opacity="0.95" />

        {/* Title bar */}
        <rect x="0" y="0" width="900" height="40" rx="12" fill="#111827" />
        <rect x="0" y="28" width="900" height="12" fill="#111827" />
        <text x="20" y="26" fill="#94a3b8" fontSize="13" fontFamily="monospace">
          AHU-01 SCHEMATIC VIEW
        </text>
        <circle cx="860" cy="20" r="5" fill={modeColor}>
          <animate attributeName="opacity" values="1;0.4;1" dur="2s" repeatCount="indefinite" />
        </circle>
        <text x="830" y="25" fill={modeColor} fontSize="10" textAnchor="end" fontFamily="monospace">
          {mode.label.toUpperCase()}
        </text>

        {/* ===== OUTSIDE AIR INTAKE ===== */}
        <rect x="20" y="80" width="80" height="180" rx="6" fill="url(#ductGrad)" stroke="#475569" strokeWidth="1" />
        <text x="60" y="108" fill="#94a3b8" fontSize="9" textAnchor="middle" fontFamily="monospace">OUTSIDE</text>
        <text x="60" y="120" fill="#94a3b8" fontSize="9" textAnchor="middle" fontFamily="monospace">AIR</text>
        <text x="60" y="148" fill="#e2e8f0" fontSize="16" textAnchor="middle" fontWeight="bold">
          {data.outsideAirTemp}°C
        </text>

        {/* Animated intake arrows */}
        {[130, 160, 190].map((y) => (
          <g key={y}>
            <line x1="35" y1={y} x2="75" y2={y} stroke={modeColor} strokeWidth="2" opacity="0.3" />
            <polygon fill={modeColor} opacity="0.6">
              <animateMotion dur={`${airflowSpeed}s`} repeatCount="indefinite" path={`M35,${y} L75,${y}`} />
              <set attributeName="points" to="-4,-3 4,0 -4,3" />
            </polygon>
          </g>
        ))}

        {/* ===== DAMPER (Outside) ===== */}
        <rect x="110" y="120" width="40" height="100" rx="3" fill="#1e293b" stroke="#475569" strokeWidth="1" />
        <text x="130" y="115" fill="#94a3b8" fontSize="8" textAnchor="middle" fontFamily="monospace">DAMPER</text>
        {/* Damper blades */}
        {[0, 1, 2, 3].map((i) => {
          const angle = (data.outsideDamper / 100) * 80;
          const cy = 132 + i * 20;
          return (
            <line
              key={`damper-${i}`}
              x1="115"
              y1={cy}
              x2="145"
              y2={cy}
              stroke="#06b6d4"
              strokeWidth="3"
              strokeLinecap="round"
              transform={`rotate(${angle}, 130, ${cy})`}
              opacity="0.8"
            />
          );
        })}
        <text x="130" y="232" fill="#22d3ee" fontSize="11" textAnchor="middle" fontWeight="bold">
          {data.outsideDamper}%
        </text>

        {/* ===== MIXING BOX ===== */}
        <rect x="160" y="80" width="80" height="180" rx="6" fill="#1e293b" stroke="#475569" strokeWidth="1" />
        <text x="200" y="98" fill="#94a3b8" fontSize="9" textAnchor="middle" fontFamily="monospace">MIXING</text>
        <text x="200" y="110" fill="#94a3b8" fontSize="9" textAnchor="middle" fontFamily="monospace">CHAMBER</text>
        <text x="200" y="148" fill="#e2e8f0" fontSize="14" textAnchor="middle" fontWeight="bold">
          {data.mixedAirTemp}°C
        </text>

        {/* Swirl animation in mixing box */}
        <circle cx="200" cy="180" r="15" fill="none" stroke={modeColor} strokeWidth="1" opacity="0.3">
          <animateTransform attributeName="transform" type="rotate" from="0 200 180" to="360 200 180" dur="3s" repeatCount="indefinite" />
        </circle>
        <circle cx="200" cy="180" r="8" fill="none" stroke={modeColor} strokeWidth="1" opacity="0.4" strokeDasharray="4 4">
          <animateTransform attributeName="transform" type="rotate" from="360 200 180" to="0 200 180" dur="2s" repeatCount="indefinite" />
        </circle>

        {/* ===== FILTER ===== */}
        <rect x="250" y="80" width="50" height="180" rx="4" fill="#1e293b" stroke="#475569" strokeWidth="1" />
        <text x="275" y="98" fill="#94a3b8" fontSize="9" textAnchor="middle" fontFamily="monospace">FILTER</text>
        {/* Filter mesh lines */}
        {Array.from({ length: 12 }, (_, i) => (
          <line
            key={`fv-${i}`}
            x1={255 + i * 3.5}
            y1="108"
            x2={255 + i * 3.5}
            y2="240"
            stroke={data.filterPressureDrop > 200 ? '#f97316' : data.filterPressureDrop > 150 ? '#eab308' : '#22c55e'}
            strokeWidth="1"
            opacity="0.5"
          />
        ))}
        <text x="275" y="256" fill={data.filterPressureDrop > 200 ? '#f97316' : '#22c55e'} fontSize="10" textAnchor="middle" fontWeight="bold">
          {data.filterPressureDrop} Pa
        </text>

        {/* ===== COOLING COIL ===== */}
        <rect x="310" y="80" width="70" height="180" rx="4" fill="#1e293b" stroke="#475569" strokeWidth="1" />
        <text x="345" y="98" fill="#94a3b8" fontSize="9" textAnchor="middle" fontFamily="monospace">COOLING</text>
        <text x="345" y="110" fill="#94a3b8" fontSize="9" textAnchor="middle" fontFamily="monospace">COIL</text>
        {/* Coil zigzag */}
        <path
          d={`M320,120 ${Array.from({ length: 10 }, (_, i) => `L${i % 2 === 0 ? 370 : 320},${125 + i * 12}`).join(' ')}`}
          fill="none"
          stroke="#06b6d4"
          strokeWidth="2.5"
          opacity={0.3 + (data.coolingCoilValve / 100) * 0.7}
        />
        {/* Water droplets when active */}
        {data.coolingCoilValve > 40 && (
          <>
            <circle cx="335" cy="170" r="2" fill="#06b6d4" opacity="0.6">
              <animate attributeName="cy" values="140;230" dur="2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.8;0" dur="2s" repeatCount="indefinite" />
            </circle>
            <circle cx="355" cy="160" r="1.5" fill="#06b6d4" opacity="0.5">
              <animate attributeName="cy" values="150;230" dur="1.8s" repeatCount="indefinite" begin="0.5s" />
              <animate attributeName="opacity" values="0.7;0" dur="1.8s" repeatCount="indefinite" begin="0.5s" />
            </circle>
          </>
        )}
        <text x="345" y="256" fill="#22d3ee" fontSize="11" textAnchor="middle" fontWeight="bold">
          {data.coolingCoilValve}%
        </text>

        {/* ===== HEATING COIL ===== */}
        <rect x="390" y="80" width="70" height="180" rx="4" fill="#1e293b" stroke="#475569" strokeWidth="1" />
        <text x="425" y="98" fill="#94a3b8" fontSize="9" textAnchor="middle" fontFamily="monospace">HEATING</text>
        <text x="425" y="110" fill="#94a3b8" fontSize="9" textAnchor="middle" fontFamily="monospace">COIL</text>
        {/* Heat waves */}
        {data.heatingCoilValve > 5 && (
          <>
            {[410, 425, 440].map((x) => (
              <path
                key={x}
                d={`M${x},130 Q${x + 5},145 ${x},160 Q${x - 5},175 ${x},190 Q${x + 5},205 ${x},220`}
                fill="none"
                stroke="#f97316"
                strokeWidth="2"
                opacity={0.2 + (data.heatingCoilValve / 100) * 0.6}
              >
                <animate attributeName="d" dur="2s" repeatCount="indefinite"
                  values={`M${x},130 Q${x + 5},145 ${x},160 Q${x - 5},175 ${x},190 Q${x + 5},205 ${x},220;M${x},130 Q${x - 5},145 ${x},160 Q${x + 5},175 ${x},190 Q${x - 5},205 ${x},220;M${x},130 Q${x + 5},145 ${x},160 Q${x - 5},175 ${x},190 Q${x + 5},205 ${x},220`}
                />
              </path>
            ))}
          </>
        )}
        <text x="425" y="256" fill="#fb923c" fontSize="11" textAnchor="middle" fontWeight="bold">
          {data.heatingCoilValve}%
        </text>

        {/* ===== SUPPLY FAN ===== */}
        <g transform="translate(510, 130)">
          <rect x="-25" y="-40" width="80" height="120" rx="6" fill="#1e293b" stroke="#475569" strokeWidth="1" />
          <text x="15" y="-24" fill="#94a3b8" fontSize="9" textAnchor="middle" fontFamily="monospace">SUPPLY</text>
          <text x="15" y="-13" fill="#94a3b8" fontSize="9" textAnchor="middle" fontFamily="monospace">FAN</text>
          {/* Fan blades */}
          <g filter="url(#glow)">
            <circle cx="15" cy="30" r="28" fill="none" stroke="#475569" strokeWidth="1" />
            <g>
              <animateTransform
                attributeName="transform"
                type="rotate"
                from="0 15 30"
                to="360 15 30"
                dur={`${Math.max(0.2, 2 - (data.fanSpeed / 1500) * 1.8)}s`}
                repeatCount="indefinite"
              />
              {[0, 72, 144, 216, 288].map((angle) => (
                <line
                  key={angle}
                  x1="15"
                  y1="30"
                  x2={15 + 22 * Math.cos((angle * Math.PI) / 180)}
                  y2={30 + 22 * Math.sin((angle * Math.PI) / 180)}
                  stroke={modeColor}
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              ))}
              <circle cx="15" cy="30" r="5" fill={modeColor} opacity="0.8" />
            </g>
          </g>
          <text x="15" y="76" fill="#e2e8f0" fontSize="11" textAnchor="middle" fontWeight="bold">
            {data.fanSpeed} RPM
          </text>
        </g>

        {/* ===== SUPPLY DUCT ===== */}
        <rect x="600" y="100" width="120" height="60" rx="4" fill="url(#ductGrad)" stroke="#475569" strokeWidth="1" />
        {/* Airflow particles in supply duct */}
        <rect x="600" y="100" width="120" height="60" rx="4" fill="url(#airflow)" opacity="0.5" />
        <text x="660" y="122" fill="#94a3b8" fontSize="9" textAnchor="middle" fontFamily="monospace">SUPPLY AIR</text>
        <text x="660" y="148" fill={modeColor} fontSize="16" textAnchor="middle" fontWeight="bold" filter="url(#glow)">
          {data.supplyAirTemp}°C
        </text>

        {/* Arrow to zones */}
        <g>
          <line x1="720" y1="130" x2="780" y2="130" stroke={modeColor} strokeWidth="2" />
          <polygon points="780,124 795,130 780,136" fill={modeColor}>
            <animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite" />
          </polygon>
        </g>

        {/* ===== ZONES ICON ===== */}
        <rect x="800" y="90" width="80" height="80" rx="8" fill="#1e293b" stroke={modeColor} strokeWidth="1.5" strokeDasharray="4 2" />
        <text x="840" y="118" fill="#94a3b8" fontSize="9" textAnchor="middle" fontFamily="monospace">ZONES</text>
        <text x="840" y="140" fill="#e2e8f0" fontSize="14" textAnchor="middle">
          {data.co2Level} ppm
        </text>
        <text x="840" y="158" fill="#94a3b8" fontSize="8" textAnchor="middle">CO2</text>

        {/* ===== RETURN DUCT ===== */}
        <rect x="600" y="200" width="120" height="50" rx="4" fill="url(#ductGrad)" stroke="#475569" strokeWidth="1" />
        <text x="660" y="218" fill="#94a3b8" fontSize="9" textAnchor="middle" fontFamily="monospace">RETURN AIR</text>
        <text x="660" y="240" fill="#fb923c" fontSize="14" textAnchor="middle" fontWeight="bold">
          {data.returnAirTemp}°C
        </text>

        {/* Return arrow from zones */}
        <g>
          <line x1="780" y1="225" x2="720" y2="225" stroke="#f97316" strokeWidth="2" opacity="0.6" />
          <polygon points="720,219 705,225 720,231" fill="#f97316" opacity="0.6">
            <animate attributeName="opacity" values="0.6;0.2;0.6" dur="1.5s" repeatCount="indefinite" />
          </polygon>
        </g>

        {/* Return air going back to mixing box */}
        <path
          d="M600,225 L560,225 Q540,225 540,205 L540,280 Q540,300 520,300 L200,300 Q180,300 180,280 L180,260"
          fill="none"
          stroke="#f97316"
          strokeWidth="2"
          strokeDasharray="6 4"
          opacity="0.5"
        >
          <animate attributeName="stroke-dashoffset" from="0" to="-20" dur={`${airflowSpeed}s`} repeatCount="indefinite" />
        </path>

        {/* ===== RETURN DAMPER ===== */}
        <rect x="160" y="270" width="80" height="30" rx="3" fill="#1e293b" stroke="#475569" strokeWidth="1" />
        <text x="200" y="289" fill="#94a3b8" fontSize="8" textAnchor="middle" fontFamily="monospace">
          RETURN DAMPER {data.returnDamper}%
        </text>

        {/* ===== EXHAUST ===== */}
        <rect x="20" y="270" width="80" height="30" rx="3" fill="#1e293b" stroke="#475569" strokeWidth="1" />
        <text x="60" y="289" fill="#94a3b8" fontSize="8" textAnchor="middle" fontFamily="monospace">
          EXHAUST AIR
        </text>

        {/* ===== BOTTOM INFO BAR ===== */}
        <rect x="0" y="310" width="900" height="30" rx="0" fill="#111827" />
        <rect x="0" y="310" width="900" height="2" fill={modeColor} opacity="0.5" />
        <text x="20" y="330" fill="#64748b" fontSize="10" fontFamily="monospace">
          AIRFLOW: {data.airflowRate} CFM
        </text>
        <text x="220" y="330" fill="#64748b" fontSize="10" fontFamily="monospace">
          FAN POWER: {data.fanPower} kW
        </text>
        <text x="420" y="330" fill="#64748b" fontSize="10" fontFamily="monospace">
          HUMIDITY: {data.supplyHumidity}% / {data.returnHumidity}%
        </text>
        <text x="660" y="330" fill="#64748b" fontSize="10" fontFamily="monospace">
          ENERGY: {data.energyConsumption} kWh
        </text>
      </svg>
    </div>
  );
}
