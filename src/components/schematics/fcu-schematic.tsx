import type { FCUSensors } from '@/data/equipment-sensors';

const modeLabels = ['OFF', 'COOLING', 'HEATING', 'FAN ONLY'];
const modeColors = ['#6b7280', '#06b6d4', '#f97316', '#22c55e'];

export function FCUSchematic({ data }: { data: FCUSensors }) {
  const mColor = modeColors[data.mode] ?? '#6b7280';
  const fanSpeeds = ['OFF', 'LOW', 'MED', 'HIGH'];

  return (
    <div className="relative w-full">
      <svg viewBox="0 0 900 340" className="w-full h-auto" style={{ filter: 'drop-shadow(0 4px 20px rgba(0,0,0,0.15))' }}>
        <rect x="0" y="0" width="900" height="340" rx="12" fill="#0a0e1a" opacity="0.95" />
        <rect x="0" y="0" width="900" height="40" rx="12" fill="#111827" />
        <rect x="0" y="28" width="900" height="12" fill="#111827" />
        <text x="20" y="26" fill="#94a3b8" fontSize="13" fontFamily="monospace">FCU LOBBY-01 SCHEMATIC VIEW</text>
        <circle cx="860" cy="20" r="5" fill={mColor}>
          <animate attributeName="opacity" values="1;0.4;1" dur="2s" repeatCount="indefinite" />
        </circle>
        <text x="830" y="25" fill={mColor} fontSize="10" textAnchor="end" fontFamily="monospace">{modeLabels[data.mode]}</text>

        {/* ── FCU Unit body ── */}
        <rect x="200" y="80" width="400" height="180" rx="10" fill="#1e293b" stroke={mColor} strokeWidth="1.5" />
        <text x="400" y="105" fill={mColor} fontSize="11" textAnchor="middle" fontFamily="monospace">FAN COIL UNIT</text>

        {/* ── Filter section ── */}
        <rect x="220" y="115" width="60" height="120" rx="4" fill="#1e293b" stroke="#475569" strokeWidth="1" />
        <text x="250" y="135" fill="#94a3b8" fontSize="8" textAnchor="middle" fontFamily="monospace">FILTER</text>
        {/* Filter mesh */}
        {Array.from({ length: 8 }, (_, i) => (
          <line key={i} x1={228 + i * 6} y1="140" x2={228 + i * 6} y2="225"
            stroke={data.filterStatus > 60 ? '#22c55e' : data.filterStatus > 40 ? '#eab308' : '#ef4444'}
            strokeWidth="1" opacity="0.4" />
        ))}
        <text x="250" y="230" fill={data.filterStatus > 60 ? '#22c55e' : '#eab308'} fontSize="9" textAnchor="middle" fontWeight="bold">
          {data.filterStatus}%
        </text>

        {/* ── Cooling coil ── */}
        <rect x="295" y="115" width="70" height="120" rx="4" fill="#1e293b" stroke="#06b6d4" strokeWidth={data.coolingValve > 10 ? 1.5 : 0.5} />
        <text x="330" y="132" fill="#06b6d4" fontSize="8" textAnchor="middle" fontFamily="monospace">COOL COIL</text>
        <path d={`M305,140 ${Array.from({ length: 6 }, (_, i) => `L${i % 2 === 0 ? 355 : 305},${145 + i * 14}`).join(' ')}`}
          fill="none" stroke="#06b6d4" strokeWidth="2" opacity={0.2 + (data.coolingValve / 100) * 0.6} />
        <text x="330" y="230" fill="#22d3ee" fontSize="10" textAnchor="middle" fontWeight="bold">{data.coolingValve}%</text>

        {/* ── Heating coil ── */}
        <rect x="380" y="115" width="70" height="120" rx="4" fill="#1e293b" stroke="#f97316" strokeWidth={data.heatingValve > 10 ? 1.5 : 0.5} />
        <text x="415" y="132" fill="#f97316" fontSize="8" textAnchor="middle" fontFamily="monospace">HEAT COIL</text>
        {data.heatingValve > 5 && [395, 415, 435].map((x) => (
          <path key={x} d={`M${x},145 Q${x + 4},160 ${x},175 Q${x - 4},190 ${x},205`}
            fill="none" stroke="#f97316" strokeWidth="2"
            opacity={0.2 + (data.heatingValve / 100) * 0.5}>
            <animate attributeName="d" dur="1.5s" repeatCount="indefinite"
              values={`M${x},145 Q${x + 4},160 ${x},175 Q${x - 4},190 ${x},205;M${x},145 Q${x - 4},160 ${x},175 Q${x + 4},190 ${x},205;M${x},145 Q${x + 4},160 ${x},175 Q${x - 4},190 ${x},205`} />
          </path>
        ))}
        <text x="415" y="230" fill="#fb923c" fontSize="10" textAnchor="middle" fontWeight="bold">{data.heatingValve}%</text>

        {/* ── Fan ── */}
        <g transform="translate(510, 175)">
          <circle cx="0" cy="0" r="35" fill="none" stroke="#475569" strokeWidth="1" />
          <g>
            {data.fanSpeed > 0 && (
              <animateTransform attributeName="transform" type="rotate" from="0 0 0" to="360 0 0"
                dur={`${2.5 - (data.fanSpeed / 3) * 0.7}s`} repeatCount="indefinite" />
            )}
            {[0, 72, 144, 216, 288].map((a) => (
              <line key={a} x1="0" y1="0"
                x2={25 * Math.cos((a * Math.PI) / 180)}
                y2={25 * Math.sin((a * Math.PI) / 180)}
                stroke={mColor} strokeWidth="3" strokeLinecap="round" />
            ))}
            <circle cx="0" cy="0" r="5" fill={mColor} />
          </g>
          <text x="0" y="50" fill="#e2e8f0" fontSize="11" textAnchor="middle" fontWeight="bold">
            {fanSpeeds[data.fanSpeed]}
          </text>
        </g>

        {/* ── Return air (left) ── */}
        <rect x="30" y="130" width="130" height="100" rx="6" fill="#334155" stroke="#475569" strokeWidth="1" />
        <text x="95" y="155" fill="#94a3b8" fontSize="9" textAnchor="middle" fontFamily="monospace">RETURN AIR</text>
        <text x="95" y="180" fill="#f97316" fontSize="16" textAnchor="middle" fontWeight="bold">{data.returnAirTemp}°C</text>
        <text x="95" y="198" fill="#94a3b8" fontSize="9" textAnchor="middle">{data.humidity}% RH</text>
        {/* Arrow */}
        <line x1="160" y1="175" x2="200" y2="175" stroke="#f97316" strokeWidth="2" />
        <polygon points="200,170 210,175 200,180" fill="#f97316" opacity="0.6" />

        {/* ── Supply air (right) ── */}
        <line x1="600" y1="175" x2="640" y2="175" stroke={mColor} strokeWidth="2" />
        <polygon points="640,170 650,175 640,180" fill={mColor}>
          <animate attributeName="opacity" values="1;0.3;1" dur="1s" repeatCount="indefinite" />
        </polygon>
        <rect x="650" y="130" width="130" height="100" rx="6" fill="#334155" stroke={mColor} strokeWidth="1" />
        <text x="715" y="155" fill="#94a3b8" fontSize="9" textAnchor="middle" fontFamily="monospace">SUPPLY AIR</text>
        <text x="715" y="180" fill={mColor} fontSize="16" textAnchor="middle" fontWeight="bold">{data.supplyAirTemp}°C</text>
        <text x="715" y="198" fill="#94a3b8" fontSize="9" textAnchor="middle">{data.airflowRate} CFM</text>

        {/* ── Room (far right) ── */}
        <rect x="810" y="70" width="70" height="190" rx="8" fill="#1e293b" stroke={mColor} strokeWidth="1" strokeDasharray="4 2" />
        <text x="845" y="100" fill="#94a3b8" fontSize="8" textAnchor="middle" fontFamily="monospace">ROOM</text>
        <text x="845" y="160" fill="#e2e8f0" fontSize="18" textAnchor="middle" fontWeight="bold">{data.roomTemp}°C</text>
        <text x="845" y="180" fill="#94a3b8" fontSize="8" textAnchor="middle">SP: {data.roomSetpoint}°C</text>

        {/* ── Water pipes (bottom) ── */}
        <line x1="330" y1="260" x2="330" y2="285" stroke="#06b6d4" strokeWidth="2" />
        <line x1="330" y1="285" x2="200" y2="285" stroke="#06b6d4" strokeWidth="2" />
        <text x="260" y="280" fill="#06b6d4" fontSize="8" textAnchor="middle">CHW IN {data.waterInTemp}°C</text>
        <line x1="415" y1="260" x2="415" y2="285" stroke="#f97316" strokeWidth="2" />
        <line x1="415" y1="285" x2="550" y2="285" stroke="#f97316" strokeWidth="2" />
        <text x="480" y="280" fill="#f97316" fontSize="8" textAnchor="middle">CHW OUT {data.waterOutTemp}°C</text>

        {/* Bottom bar */}
        <rect x="0" y="305" width="900" height="35" fill="#111827" />
        <rect x="0" y="305" width="900" height="2" fill={mColor} opacity="0.5" />
        <text x="20" y="328" fill="#64748b" fontSize="10" fontFamily="monospace">MODE: {modeLabels[data.mode]}</text>
        <text x="200" y="328" fill="#64748b" fontSize="10" fontFamily="monospace">FAN: {fanSpeeds[data.fanSpeed]}</text>
        <text x="380" y="328" fill="#64748b" fontSize="10" fontFamily="monospace">AIRFLOW: {data.airflowRate} CFM</text>
        <text x="580" y="328" fill="#64748b" fontSize="10" fontFamily="monospace">FILTER: {data.filterStatus}%</text>
        <text x="750" y="328" fill="#64748b" fontSize="10" fontFamily="monospace">ENERGY: {data.energyConsumption} kWh</text>
      </svg>
    </div>
  );
}
