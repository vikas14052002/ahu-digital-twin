import type { VAVSensors } from '@/data/equipment-sensors';

export function VAVSchematic({ data }: { data: VAVSensors }) {
  const tempDiff = data.zoneTemp - data.zoneSetpoint;
  const zoneColor = Math.abs(tempDiff) < 1 ? '#22c55e' : Math.abs(tempDiff) < 2 ? '#eab308' : '#ef4444';
  const damperAngle = (data.damperPosition / 100) * 75;

  return (
    <div className="relative w-full">
      <svg viewBox="0 0 900 340" className="w-full h-auto" style={{ filter: 'drop-shadow(0 4px 20px rgba(0,0,0,0.15))' }}>
        <rect x="0" y="0" width="900" height="340" rx="12" fill="#0a0e1a" opacity="0.95" />
        <rect x="0" y="0" width="900" height="40" rx="12" fill="#111827" />
        <rect x="0" y="28" width="900" height="12" fill="#111827" />
        <text x="20" y="26" fill="#94a3b8" fontSize="13" fontFamily="monospace">VAV BOX 3F-01 SCHEMATIC VIEW</text>
        <circle cx="860" cy="20" r="5" fill={zoneColor}>
          <animate attributeName="opacity" values="1;0.4;1" dur="2s" repeatCount="indefinite" />
        </circle>
        <text x="830" y="25" fill={zoneColor} fontSize="10" textAnchor="end" fontFamily="monospace">
          {data.occupancy ? 'OCCUPIED' : 'UNOCCUPIED'}
        </text>

        {/* ── Supply duct (from AHU) ── */}
        <rect x="30" y="120" width="150" height="60" rx="4" fill="#334155" stroke="#475569" strokeWidth="1" />
        <text x="105" y="145" fill="#94a3b8" fontSize="9" textAnchor="middle" fontFamily="monospace">FROM AHU</text>
        <text x="105" y="168" fill="#06b6d4" fontSize="14" textAnchor="middle" fontWeight="bold">{data.dischargeAirTemp}°C</text>

        {/* Airflow arrows in duct */}
        {[50, 80, 110, 140].map((x) => (
          <polygon key={x} points={`${x},148 ${x + 8},150 ${x},152`} fill="#06b6d4" opacity="0.4">
            <animate attributeName="opacity" values="0.6;0.1;0.6" dur="1.5s" repeatCount="indefinite" begin={`${(x - 50) * 0.01}s`} />
          </polygon>
        ))}

        {/* ── Damper section ── */}
        <rect x="200" y="100" width="100" height="100" rx="6" fill="#1e293b" stroke="#8b5cf6" strokeWidth="1.5" />
        <text x="250" y="93" fill="#8b5cf6" fontSize="9" textAnchor="middle" fontFamily="monospace">DAMPER</text>
        {/* Damper blades */}
        {[0, 1, 2, 3].map((i) => {
          const cy = 115 + i * 20;
          return (
            <line key={i} x1="210" y1={cy} x2="290" y2={cy}
              stroke="#8b5cf6" strokeWidth="3" strokeLinecap="round"
              transform={`rotate(${damperAngle}, 250, ${cy})`} opacity="0.7" />
          );
        })}
        <text x="250" y="212" fill="#e2e8f0" fontSize="13" textAnchor="middle" fontWeight="bold">{data.damperPosition}%</text>

        {/* ── Reheat coil ── */}
        <rect x="320" y="110" width="80" height="80" rx="6" fill="#1e293b" stroke="#f97316" strokeWidth={data.reheatValve > 10 ? 1.5 : 0.5} />
        <text x="360" y="105" fill="#f97316" fontSize="9" textAnchor="middle" fontFamily="monospace">REHEAT</text>
        {/* Coil zigzag */}
        <path d={`M335,125 ${Array.from({ length: 5 }, (_, i) => `L${i % 2 === 0 ? 385 : 335},${130 + i * 12}`).join(' ')}`}
          fill="none" stroke="#f97316" strokeWidth="2"
          opacity={0.2 + (data.reheatValve / 100) * 0.7} />
        <text x="360" y="200" fill="#fb923c" fontSize="11" textAnchor="middle" fontWeight="bold">{data.reheatValve}%</text>

        {/* ── Airflow meter ── */}
        <rect x="420" y="120" width="80" height="60" rx="4" fill="#1e293b" stroke="#22c55e" strokeWidth="1" />
        <text x="460" y="140" fill="#22c55e" fontSize="8" textAnchor="middle" fontFamily="monospace">AIRFLOW</text>
        <text x="460" y="162" fill="#e2e8f0" fontSize="14" textAnchor="middle" fontWeight="bold">{data.airflowRate}</text>
        <text x="460" y="175" fill="#94a3b8" fontSize="8" textAnchor="middle">/ {data.airflowSetpoint} CFM</text>

        {/* ── Discharge to zone ── */}
        <line x1="500" y1="150" x2="560" y2="150" stroke="#06b6d4" strokeWidth="2" strokeDasharray="6 3">
          <animate attributeName="stroke-dashoffset" from="0" to="-18" dur="1.5s" repeatCount="indefinite" />
        </line>

        {/* ── Zone (room) ── */}
        <rect x="560" y="70" width="300" height="200" rx="10" fill="#1e293b" stroke={zoneColor} strokeWidth="1.5" strokeDasharray="6 3" />
        <text x="710" y="95" fill="#94a3b8" fontSize="10" textAnchor="middle" fontFamily="monospace">CONDITIONED ZONE</text>

        {/* Zone temperature (big) */}
        <text x="710" y="155" fill={zoneColor} fontSize="36" textAnchor="middle" fontWeight="bold">{data.zoneTemp}°C</text>
        <text x="710" y="175" fill="#94a3b8" fontSize="10" textAnchor="middle">Setpoint: {data.zoneSetpoint}°C</text>

        {/* Zone sensors */}
        <g transform="translate(590, 200)">
          {[
            ['Humidity', `${data.zoneHumidity}%`, '#3b82f6'],
            ['CO₂', `${data.zoneCO2} ppm`, data.zoneCO2 > 800 ? '#ef4444' : '#22c55e'],
            ['Occupancy', data.occupancy ? 'Yes' : 'No', data.occupancy ? '#22c55e' : '#6b7280'],
          ].map(([label, value, color], i) => (
            <g key={label}>
              <text x={i * 85} y="0" fill="#94a3b8" fontSize="8">{label}</text>
              <text x={i * 85} y="15" fill={color} fontSize="11" fontWeight="bold" fontFamily="monospace">{value}</text>
            </g>
          ))}
        </g>

        {/* ── Demand bars ── */}
        <g transform="translate(590, 240)">
          <text x="0" y="0" fill="#94a3b8" fontSize="8">Cooling Demand</text>
          <rect x="0" y="5" width="120" height="6" rx="3" fill="#1e293b" />
          <rect x="0" y="5" width={1.2 * data.coolingDemand} height="6" rx="3" fill="#06b6d4" opacity="0.7" />
          <text x="125" y="12" fill="#06b6d4" fontSize="9" fontFamily="monospace">{data.coolingDemand}%</text>

          <text x="0" y="25" fill="#94a3b8" fontSize="8">Heating Demand</text>
          <rect x="0" y="30" width="120" height="6" rx="3" fill="#1e293b" />
          <rect x="0" y="30" width={1.2 * data.heatingDemand} height="6" rx="3" fill="#f97316" opacity="0.7" />
          <text x="125" y="37" fill="#f97316" fontSize="9" fontFamily="monospace">{data.heatingDemand}%</text>
        </g>

        {/* Bottom bar */}
        <rect x="0" y="300" width="900" height="40" fill="#111827" />
        <rect x="0" y="300" width="900" height="2" fill="#8b5cf6" opacity="0.5" />
        <text x="20" y="325" fill="#64748b" fontSize="10" fontFamily="monospace">DAMPER: {data.damperPosition}%</text>
        <text x="200" y="325" fill="#64748b" fontSize="10" fontFamily="monospace">AIRFLOW: {data.airflowRate} CFM</text>
        <text x="420" y="325" fill="#64748b" fontSize="10" fontFamily="monospace">STATIC: {data.staticPressure} inWC</text>
        <text x="650" y="325" fill="#64748b" fontSize="10" fontFamily="monospace">ENERGY: {data.energyConsumption} kWh</text>
      </svg>
    </div>
  );
}
