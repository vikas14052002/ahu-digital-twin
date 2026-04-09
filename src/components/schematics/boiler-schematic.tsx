import type { BoilerSensors } from '@/data/equipment-sensors';

export function BoilerSchematic({ data }: { data: BoilerSensors }) {
  const burnerColor = data.burnerOutput > 70 ? '#ef4444' : data.burnerOutput > 30 ? '#f97316' : '#eab308';
  const effColor = data.thermalEfficiency > 90 ? '#22c55e' : data.thermalEfficiency > 80 ? '#eab308' : '#ef4444';

  return (
    <div className="relative w-full">
      <svg viewBox="0 0 900 380" className="w-full h-auto" style={{ filter: 'drop-shadow(0 4px 20px rgba(0,0,0,0.15))' }}>
        <rect x="0" y="0" width="900" height="380" rx="12" fill="#0a0e1a" opacity="0.95" />
        <rect x="0" y="0" width="900" height="40" rx="12" fill="#111827" />
        <rect x="0" y="28" width="900" height="12" fill="#111827" />
        <text x="20" y="26" fill="#94a3b8" fontSize="13" fontFamily="monospace">BOILER-01 SCHEMATIC VIEW</text>
        <circle cx="860" cy="20" r="5" fill={burnerColor}>
          <animate attributeName="opacity" values="1;0.4;1" dur="1.5s" repeatCount="indefinite" />
        </circle>
        <text x="830" y="25" fill={burnerColor} fontSize="10" textAnchor="end" fontFamily="monospace">
          {data.burnerOutput}% FIRE
        </text>

        {/* ── Boiler vessel ── */}
        <rect x="250" y="70" width="300" height="200" rx="12" fill="#1e293b" stroke="#f97316" strokeWidth="1.5" />
        <text x="400" y="95" fill="#f97316" fontSize="11" textAnchor="middle" fontFamily="monospace">BOILER VESSEL</text>

        {/* Heat exchanger tubes */}
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <g key={`tube-${i}`}>
            <line x1="275" y1={120 + i * 22} x2="525" y2={120 + i * 22}
              stroke="#f97316" strokeWidth="3" opacity={0.2 + (data.burnerOutput / 100) * 0.5} />
            {/* Heat shimmer */}
            {data.burnerOutput > 20 && (
              <circle cx={300 + Math.random() * 200} cy={120 + i * 22} r="2" fill="#f97316" opacity="0.3">
                <animate attributeName="cy" values={`${120 + i * 22};${110 + i * 22}`} dur="1s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.4;0" dur="1s" repeatCount="indefinite" />
              </circle>
            )}
          </g>
        ))}

        {/* Water temp inside */}
        <text x="400" y="260" fill="#e2e8f0" fontSize="14" textAnchor="middle" fontWeight="bold">
          {data.supplyWaterTemp}°C
        </text>

        {/* ── Burner (bottom) ── */}
        <rect x="330" y="280" width="140" height="50" rx="8" fill="#1e293b" stroke={burnerColor} strokeWidth="1.5" />
        <text x="400" y="300" fill={burnerColor} fontSize="10" textAnchor="middle" fontFamily="monospace">BURNER</text>
        <text x="400" y="320" fill="#e2e8f0" fontSize="13" textAnchor="middle" fontWeight="bold">
          {data.burnerOutput}%
        </text>
        {/* Flames */}
        {data.burnerOutput > 5 && [360, 385, 410, 435].map((x) => (
          <g key={`flame-${x}`}>
            <path d={`M${x},280 Q${x - 5},265 ${x},250 Q${x + 5},265 ${x},280`}
              fill={burnerColor} opacity={0.3 + (data.burnerOutput / 100) * 0.4}>
              <animate attributeName="d" dur="0.8s" repeatCount="indefinite"
                values={`M${x},280 Q${x - 5},268 ${x},253 Q${x + 5},268 ${x},280;M${x},280 Q${x + 5},265 ${x},248 Q${x - 5},265 ${x},280;M${x},280 Q${x - 5},268 ${x},253 Q${x + 5},268 ${x},280`} />
            </path>
          </g>
        ))}

        {/* ── Fuel supply (left bottom) ── */}
        <line x1="100" y1="305" x2="330" y2="305" stroke="#eab308" strokeWidth="2" strokeDasharray="6 3">
          <animate attributeName="stroke-dashoffset" from="0" to="-18" dur="1.5s" repeatCount="indefinite" />
        </line>
        <rect x="30" y="280" width="120" height="50" rx="6" fill="#1e293b" stroke="#eab308" strokeWidth="1" />
        <text x="90" y="300" fill="#eab308" fontSize="9" textAnchor="middle" fontFamily="monospace">GAS SUPPLY</text>
        <text x="90" y="318" fill="#e2e8f0" fontSize="12" textAnchor="middle" fontWeight="bold">{data.fuelFlowRate} m³/h</text>

        {/* ── Flue / Chimney (top) ── */}
        <rect x="380" y="50" width="40" height="25" rx="2" fill="#1e293b" stroke="#78716c" strokeWidth="1" />
        <text x="400" y="46" fill="#78716c" fontSize="8" textAnchor="middle" fontFamily="monospace">FLUE</text>
        {/* Smoke animation */}
        {data.burnerOutput > 5 && [385, 400, 415].map((x, i) => (
          <circle key={`smoke-${i}`} cx={x} cy="45" r="3" fill="#78716c" opacity="0.3">
            <animate attributeName="cy" values="45;20" dur="2s" repeatCount="indefinite" begin={`${i * 0.4}s`} />
            <animate attributeName="opacity" values="0.3;0" dur="2s" repeatCount="indefinite" begin={`${i * 0.4}s`} />
            <animate attributeName="r" values="3;8" dur="2s" repeatCount="indefinite" begin={`${i * 0.4}s`} />
          </circle>
        ))}
        <text x="440" y="63" fill="#e2e8f0" fontSize="10" fontWeight="bold">{data.flueGasTemp}°C</text>

        {/* ── Water in (left) ── */}
        <line x1="100" y1="200" x2="250" y2="200" stroke="#3b82f6" strokeWidth="3" />
        <polygon points="250,195 260,200 250,205" fill="#3b82f6">
          <animate attributeName="opacity" values="1;0.3;1" dur="1s" repeatCount="indefinite" />
        </polygon>
        <rect x="30" y="175" width="120" height="50" rx="6" fill="#1e293b" stroke="#3b82f6" strokeWidth="1" />
        <text x="90" y="195" fill="#3b82f6" fontSize="9" textAnchor="middle" fontFamily="monospace">RETURN WATER</text>
        <text x="90" y="215" fill="#e2e8f0" fontSize="14" textAnchor="middle" fontWeight="bold">{data.returnWaterTemp}°C</text>

        {/* ── Water out (right) ── */}
        <line x1="550" y1="150" x2="700" y2="150" stroke="#ef4444" strokeWidth="3" />
        <polygon points="695,145 705,150 695,155" fill="#ef4444">
          <animate attributeName="opacity" values="1;0.3;1" dur="1s" repeatCount="indefinite" />
        </polygon>
        <rect x="700" y="125" width="160" height="50" rx="6" fill="#1e293b" stroke="#ef4444" strokeWidth="1" />
        <text x="780" y="145" fill="#ef4444" fontSize="9" textAnchor="middle" fontFamily="monospace">SUPPLY HOT WATER</text>
        <text x="780" y="167" fill="#e2e8f0" fontSize="16" textAnchor="middle" fontWeight="bold">{data.supplyWaterTemp}°C</text>

        {/* ── Right side: combustion data ── */}
        <rect x="700" y="200" width="160" height="120" rx="6" fill="#1e293b" stroke="#475569" strokeWidth="1" />
        <text x="780" y="220" fill="#94a3b8" fontSize="9" textAnchor="middle" fontFamily="monospace">COMBUSTION</text>
        {[
          ['A/F Ratio', data.airFuelRatio.toString(), '#eab308'],
          ['O₂ Level', `${data.oxygenLevel}%`, '#3b82f6'],
          ['CO Level', `${data.coLevel} ppm`, data.coLevel > 50 ? '#ef4444' : '#22c55e'],
          ['Stack Temp', `${data.stackTemp}°C`, '#f97316'],
        ].map(([label, value, color], i) => (
          <g key={label}>
            <text x="715" y={243 + i * 20} fill="#94a3b8" fontSize="9">{label}</text>
            <text x="845" y={243 + i * 20} fill={color} fontSize="10" textAnchor="end" fontWeight="bold" fontFamily="monospace">{value}</text>
          </g>
        ))}

        {/* Bottom bar */}
        <rect x="0" y="345" width="900" height="35" fill="#111827" />
        <rect x="0" y="345" width="900" height="2" fill="#f97316" opacity="0.5" />
        <text x="20" y="368" fill="#64748b" fontSize="10" fontFamily="monospace">EFFICIENCY: <tspan fill={effColor}>{data.thermalEfficiency}%</tspan></text>
        <text x="230" y="368" fill="#64748b" fontSize="10" fontFamily="monospace">WATER FLOW: {data.waterFlowRate} L/min</text>
        <text x="480" y="368" fill="#64748b" fontSize="10" fontFamily="monospace">PRESSURE: {data.waterPressure} bar</text>
        <text x="700" y="368" fill="#64748b" fontSize="10" fontFamily="monospace">ENERGY: {data.energyConsumption} kWh</text>
      </svg>
    </div>
  );
}
