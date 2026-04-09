import type { CoolingTowerSensors } from '@/data/equipment-sensors';

export function CoolingTowerSchematic({ data }: { data: CoolingTowerSensors }) {
  const fanAnimDur = Math.max(0.3, 2 - (data.fanSpeed / 1500) * 1.7);

  return (
    <div className="relative w-full">
      <svg viewBox="0 0 900 380" className="w-full h-auto" style={{ filter: 'drop-shadow(0 4px 20px rgba(0,0,0,0.15))' }}>
        <rect x="0" y="0" width="900" height="380" rx="12" fill="#0a0e1a" opacity="0.95" />
        <rect x="0" y="0" width="900" height="40" rx="12" fill="#111827" />
        <rect x="0" y="28" width="900" height="12" fill="#111827" />
        <text x="20" y="26" fill="#94a3b8" fontSize="13" fontFamily="monospace">COOLING TOWER-01 SCHEMATIC VIEW</text>

        {/* ── Tower body (trapezoidal) ── */}
        <path d="M300,310 L350,80 L550,80 L600,310 Z" fill="#1e293b" stroke="#475569" strokeWidth="1.5" />

        {/* Fan on top */}
        <circle cx="450" cy="75" r="35" fill="#1e293b" stroke="#22c55e" strokeWidth="1.5" />
        <g>
          <animateTransform attributeName="transform" type="rotate" from="0 450 75" to="360 450 75" dur={`${fanAnimDur}s`} repeatCount="indefinite" />
          {[0, 72, 144, 216, 288].map((a) => (
            <line key={a} x1="450" y1="75"
              x2={450 + 25 * Math.cos((a * Math.PI) / 180)}
              y2={75 + 25 * Math.sin((a * Math.PI) / 180)}
              stroke="#22c55e" strokeWidth="3" strokeLinecap="round" />
          ))}
          <circle cx="450" cy="75" r="5" fill="#22c55e" />
        </g>
        <text x="450" y="40" fill="#94a3b8" fontSize="9" textAnchor="middle" fontFamily="monospace">EXHAUST FAN</text>
        <text x="450" y="130" fill="#e2e8f0" fontSize="12" textAnchor="middle" fontWeight="bold">{data.fanSpeed} RPM</text>
        <text x="450" y="145" fill="#94a3b8" fontSize="9" textAnchor="middle">{data.fanPower} kW</text>

        {/* Fill media */}
        <rect x="365" y="160" width="170" height="60" rx="4" fill="none" stroke="#475569" strokeWidth="1" strokeDasharray="4 2" />
        <text x="450" y="195" fill="#475569" fontSize="9" textAnchor="middle" fontFamily="monospace">FILL MEDIA</text>
        {/* Cross-hatch */}
        {Array.from({ length: 8 }, (_, i) => (
          <line key={`fh-${i}`} x1={375 + i * 20} y1="165" x2={375 + i * 20} y2="215" stroke="#475569" strokeWidth="0.5" opacity="0.5" />
        ))}

        {/* Spray nozzles */}
        <text x="450" y="155" fill="#06b6d4" fontSize="9" textAnchor="middle" fontFamily="monospace">SPRAY NOZZLES</text>
        {[400, 430, 460, 500].map((x) => (
          <g key={x}>
            <circle cx={x} cy="158" r="2" fill="#06b6d4" />
            {/* Water drops */}
            <circle cx={x - 3} cy="165" r="1" fill="#06b6d4" opacity="0.5">
              <animate attributeName="cy" values="162;210" dur="1.5s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.6;0" dur="1.5s" repeatCount="indefinite" />
            </circle>
            <circle cx={x + 3} cy="170" r="1" fill="#06b6d4" opacity="0.4">
              <animate attributeName="cy" values="165;210" dur="1.3s" repeatCount="indefinite" begin="0.4s" />
              <animate attributeName="opacity" values="0.5;0" dur="1.3s" repeatCount="indefinite" begin="0.4s" />
            </circle>
          </g>
        ))}

        {/* Basin */}
        <rect x="330" y="290" width="240" height="30" rx="4" fill="#1e293b" stroke="#06b6d4" strokeWidth="1" />
        <rect x="332" y={292 + (1 - data.basinLevel / 100) * 26} width="236"
          height={Math.max(2, (data.basinLevel / 100) * 26)} rx="2" fill="#06b6d4" opacity="0.25" />
        <text x="450" y="308" fill="#e2e8f0" fontSize="10" textAnchor="middle" fontWeight="bold">
          Basin: {data.basinLevel}%
        </text>

        {/* ── HOT WATER IN (left) ── */}
        <line x1="100" y1="155" x2="365" y2="155" stroke="#f97316" strokeWidth="3" />
        <polygon points="365,150 375,155 365,160" fill="#f97316">
          <animate attributeName="opacity" values="1;0.3;1" dur="1s" repeatCount="indefinite" />
        </polygon>
        <rect x="60" y="130" width="140" height="50" rx="6" fill="#1e293b" stroke="#f97316" strokeWidth="1" />
        <text x="130" y="148" fill="#f97316" fontSize="9" textAnchor="middle" fontFamily="monospace">HOT WATER IN</text>
        <text x="130" y="170" fill="#e2e8f0" fontSize="16" textAnchor="middle" fontWeight="bold">{data.hotWaterIn}°C</text>

        {/* ── COLD WATER OUT (left bottom) ── */}
        <line x1="100" y1="305" x2="330" y2="305" stroke="#06b6d4" strokeWidth="3" />
        <polygon points="105,300 95,305 105,310" fill="#06b6d4">
          <animate attributeName="opacity" values="1;0.3;1" dur="1s" repeatCount="indefinite" />
        </polygon>
        <rect x="60" y="260" width="140" height="50" rx="6" fill="#1e293b" stroke="#06b6d4" strokeWidth="1" />
        <text x="130" y="278" fill="#06b6d4" fontSize="9" textAnchor="middle" fontFamily="monospace">COLD WATER OUT</text>
        <text x="130" y="300" fill="#e2e8f0" fontSize="16" textAnchor="middle" fontWeight="bold">{data.coldWaterOut}°C</text>

        {/* ── Right side info ── */}
        <rect x="660" y="90" width="200" height="220" rx="8" fill="#1e293b" stroke="#475569" strokeWidth="1" />
        <text x="760" y="115" fill="#94a3b8" fontSize="10" textAnchor="middle" fontFamily="monospace">PERFORMANCE</text>
        {[
          ['Wet Bulb', `${data.wetBulbTemp}°C`, '#eab308'],
          ['Approach', `${data.approachTemp}°C`, '#22c55e'],
          ['Water Flow', `${data.waterFlowRate} GPM`, '#06b6d4'],
          ['Makeup Water', `${data.makeupWaterFlow} GPM`, '#3b82f6'],
          ['Blowdown', `${data.blowdownRate} GPM`, '#a855f7'],
          ['Cycles', `${data.cycles}x`, '#8b5cf6'],
          ['Vibration', `${data.vibration} mm/s`, data.vibration > 3.5 ? '#ef4444' : '#22c55e'],
          ['Drift Loss', `${data.driftLoss}%`, '#94a3b8'],
        ].map(([label, value, color], i) => (
          <g key={label}>
            <text x="680" y={140 + i * 24} fill="#94a3b8" fontSize="9">{label}</text>
            <text x="840" y={140 + i * 24} fill={color} fontSize="11" textAnchor="end" fontWeight="bold" fontFamily="monospace">{value}</text>
          </g>
        ))}

        {/* Bottom bar */}
        <rect x="0" y="340" width="900" height="40" fill="#111827" />
        <rect x="0" y="340" width="900" height="2" fill="#22c55e" opacity="0.5" />
        <text x="20" y="365" fill="#64748b" fontSize="10" fontFamily="monospace">FAN: {data.fanSpeed} RPM</text>
        <text x="220" y="365" fill="#64748b" fontSize="10" fontFamily="monospace">FLOW: {data.waterFlowRate} GPM</text>
        <text x="440" y="365" fill="#64748b" fontSize="10" fontFamily="monospace">APPROACH: {data.approachTemp}°C</text>
        <text x="680" y="365" fill="#64748b" fontSize="10" fontFamily="monospace">ENERGY: {data.energyConsumption} kWh</text>
      </svg>
    </div>
  );
}
