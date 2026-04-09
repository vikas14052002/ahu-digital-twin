import type { ChillerSensors } from '@/data/equipment-sensors';

export function ChillerSchematic({ data }: { data: ChillerSensors }) {
  const loadColor = data.loadPercent > 85 ? '#ef4444' : data.loadPercent > 60 ? '#f59e0b' : '#22c55e';
  const compSpeed = Math.max(0.3, 2 - (data.compressorSpeed / 3600) * 1.7);

  return (
    <div className="relative w-full">
      <svg viewBox="0 0 900 360" className="w-full h-auto" style={{ filter: 'drop-shadow(0 4px 20px rgba(0,0,0,0.15))' }}>
        <rect x="0" y="0" width="900" height="360" rx="12" fill="#0a0e1a" opacity="0.95" />
        {/* Title */}
        <rect x="0" y="0" width="900" height="40" rx="12" fill="#111827" />
        <rect x="0" y="28" width="900" height="12" fill="#111827" />
        <text x="20" y="26" fill="#94a3b8" fontSize="13" fontFamily="monospace">CHILLER-01 SCHEMATIC VIEW</text>
        <circle cx="860" cy="20" r="5" fill={loadColor}>
          <animate attributeName="opacity" values="1;0.4;1" dur="2s" repeatCount="indefinite" />
        </circle>
        <text x="830" y="25" fill={loadColor} fontSize="10" textAnchor="end" fontFamily="monospace">
          {data.loadPercent}% LOAD
        </text>

        {/* ── Evaporator (left) ── */}
        <rect x="60" y="100" width="200" height="120" rx="8" fill="#1e293b" stroke="#06b6d4" strokeWidth="1.5" />
        <text x="160" y="125" fill="#06b6d4" fontSize="11" textAnchor="middle" fontFamily="monospace">EVAPORATOR</text>
        {/* Coil lines */}
        {[0, 1, 2, 3, 4].map((i) => (
          <path key={`ev-${i}`} d={`M80,${140 + i * 15} Q160,${135 + i * 15} 240,${140 + i * 15}`} fill="none" stroke="#06b6d4" strokeWidth="2" opacity={0.4 + (data.loadPercent / 100) * 0.4} />
        ))}
        <text x="160" y="192" fill="#e2e8f0" fontSize="13" textAnchor="middle" fontWeight="bold">
          {data.evaporatorPressure} bar
        </text>
        <text x="160" y="210" fill="#94a3b8" fontSize="9" textAnchor="middle">Pressure</text>

        {/* Chilled water in/out */}
        <line x1="60" y1="140" x2="20" y2="140" stroke="#06b6d4" strokeWidth="3" />
        <text x="15" y="135" fill="#06b6d4" fontSize="9" textAnchor="end">CHW Return</text>
        <text x="15" y="150" fill="#e2e8f0" fontSize="12" textAnchor="end" fontWeight="bold">{data.chilledWaterReturn}°C</text>

        <line x1="60" y1="190" x2="20" y2="190" stroke="#22d3ee" strokeWidth="3" />
        <text x="15" y="185" fill="#22d3ee" fontSize="9" textAnchor="end">CHW Supply</text>
        <text x="15" y="200" fill="#e2e8f0" fontSize="12" textAnchor="end" fontWeight="bold">{data.chilledWaterSupply}°C</text>

        {/* ── Compressor (center) ── */}
        <g transform="translate(400, 160)">
          <circle cx="0" cy="0" r="55" fill="#1e293b" stroke="#8b5cf6" strokeWidth="1.5" />
          <text x="0" y="-30" fill="#8b5cf6" fontSize="10" textAnchor="middle" fontFamily="monospace">COMPRESSOR</text>
          {/* Spinning blades */}
          <g>
            <animateTransform attributeName="transform" type="rotate" from="0 0 0" to="360 0 0"
              dur={`${compSpeed}s`} repeatCount="indefinite" />
            {[0, 60, 120, 180, 240, 300].map((a) => (
              <line key={a} x1="0" y1="0"
                x2={30 * Math.cos((a * Math.PI) / 180)} y2={30 * Math.sin((a * Math.PI) / 180)}
                stroke="#8b5cf6" strokeWidth="3" strokeLinecap="round" />
            ))}
            <circle cx="0" cy="0" r="6" fill="#8b5cf6" opacity="0.8" />
          </g>
          <text x="0" y="18" fill="#e2e8f0" fontSize="12" textAnchor="middle" fontWeight="bold">
            {data.compressorSpeed} RPM
          </text>
          <text x="0" y="35" fill="#94a3b8" fontSize="9" textAnchor="middle">
            {data.compressorPower} kW
          </text>
        </g>

        {/* Refrigerant flow: Evaporator → Compressor (suction) */}
        <path d="M260,160 Q330,160 345,160" fill="none" stroke="#06b6d4" strokeWidth="2" strokeDasharray="6 3">
          <animate attributeName="stroke-dashoffset" from="0" to="-18" dur="1.5s" repeatCount="indefinite" />
        </path>
        <text x="300" y="150" fill="#94a3b8" fontSize="8" textAnchor="middle">SUCTION</text>
        <text x="300" y="175" fill="#06b6d4" fontSize="10" textAnchor="middle">{data.suctionTemp}°C</text>

        {/* Refrigerant flow: Compressor → Condenser (discharge) */}
        <path d="M455,160 Q530,160 550,160" fill="none" stroke="#f97316" strokeWidth="2" strokeDasharray="6 3">
          <animate attributeName="stroke-dashoffset" from="0" to="-18" dur="1.5s" repeatCount="indefinite" />
        </path>
        <text x="500" y="150" fill="#94a3b8" fontSize="8" textAnchor="middle">DISCHARGE</text>
        <text x="500" y="175" fill="#f97316" fontSize="10" textAnchor="middle">{data.dischargeTemp}°C</text>

        {/* ── Condenser (right) ── */}
        <rect x="560" y="100" width="200" height="120" rx="8" fill="#1e293b" stroke="#f97316" strokeWidth="1.5" />
        <text x="660" y="125" fill="#f97316" fontSize="11" textAnchor="middle" fontFamily="monospace">CONDENSER</text>
        {[0, 1, 2, 3, 4].map((i) => (
          <path key={`cd-${i}`} d={`M580,${140 + i * 15} Q660,${135 + i * 15} 740,${140 + i * 15}`} fill="none" stroke="#f97316" strokeWidth="2" opacity={0.4 + (data.loadPercent / 100) * 0.4} />
        ))}
        <text x="660" y="192" fill="#e2e8f0" fontSize="13" textAnchor="middle" fontWeight="bold">
          {data.condenserPressure} bar
        </text>
        <text x="660" y="210" fill="#94a3b8" fontSize="9" textAnchor="middle">Pressure</text>

        {/* Condenser water in/out */}
        <line x1="760" y1="140" x2="820" y2="140" stroke="#f97316" strokeWidth="3" />
        <text x="825" y="135" fill="#f97316" fontSize="9">CW Return</text>
        <text x="825" y="150" fill="#e2e8f0" fontSize="12" fontWeight="bold">{data.condenserWaterReturn}°C</text>

        <line x1="760" y1="190" x2="820" y2="190" stroke="#fb923c" strokeWidth="3" />
        <text x="825" y="185" fill="#fb923c" fontSize="9">CW Supply</text>
        <text x="825" y="200" fill="#e2e8f0" fontSize="12" fontWeight="bold">{data.condenserWaterSupply}°C</text>

        {/* ── Expansion Valve (bottom) ── */}
        <path d="M660,220 L660,270 Q660,285 645,285 L255,285 Q240,285 240,270 L240,220"
          fill="none" stroke="#a855f7" strokeWidth="2" strokeDasharray="6 3">
          <animate attributeName="stroke-dashoffset" from="0" to="18" dur="2s" repeatCount="indefinite" />
        </path>
        <rect x="420" y="270" width="80" height="30" rx="4" fill="#1e293b" stroke="#a855f7" strokeWidth="1" />
        <text x="460" y="289" fill="#a855f7" fontSize="9" textAnchor="middle" fontFamily="monospace">EXP VALVE</text>

        {/* ── Bottom bar ── */}
        <rect x="0" y="320" width="900" height="40" fill="#111827" />
        <rect x="0" y="320" width="900" height="2" fill="#8b5cf6" opacity="0.5" />
        <text x="20" y="345" fill="#64748b" fontSize="10" fontFamily="monospace">COP: {data.cop}</text>
        <text x="180" y="345" fill="#64748b" fontSize="10" fontFamily="monospace">OIL: {data.oilPressure} bar / {data.oilTemp}°C</text>
        <text x="420" y="345" fill="#64748b" fontSize="10" fontFamily="monospace">REFRIGERANT: {data.refrigerantCharge}%</text>
        <text x="660" y="345" fill="#64748b" fontSize="10" fontFamily="monospace">ENERGY: {data.energyConsumption} kWh</text>
      </svg>
    </div>
  );
}
