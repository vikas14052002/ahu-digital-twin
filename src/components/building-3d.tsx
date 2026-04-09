import { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import {
  OrbitControls,
  Text,
  RoundedBox,
  Html,
} from '@react-three/drei';
import { useNavigate } from 'react-router-dom';
import * as THREE from 'three';
import {
  equipment,
  type Equipment,
  type EquipmentStatus,
} from '@/data/equipment';
import { useTheme } from '@/hooks/use-theme';

/* ───────── Equipment 3D positions ───────── */
const equipmentPositions: Record<
  string,
  { position: [number, number, number]; label: string }
> = {
  'ahu-01': { position: [0.9, 1.15, 0.6], label: 'AHU-01' },
  'ahu-02': { position: [-0.7, 2.0, 0.4], label: 'AHU-02' },
  'chiller-01': { position: [0.0, -0.35, 1.0], label: 'Chiller' },
  'ct-01': { position: [1.1, 2.85, 0], label: 'Cooling Tower' },
  'boiler-01': { position: [-1.0, -0.35, 0.7], label: 'Boiler' },
  'vav-01': { position: [0.3, 1.15, -0.2], label: 'VAV Box' },
  'fcu-01': { position: [-0.5, 0.3, 0.9], label: 'FCU' },
};

const statusColors: Record<EquipmentStatus, string> = {
  online: '#22c55e',
  warning: '#f59e0b',
  offline: '#6b7280',
  maintenance: '#3b82f6',
};

/* ───────── Pulsing ring ───────── */
function PulseRing({ color, radius = 0.2 }: { color: string; radius?: number }) {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame(({ clock }) => {
    const s = 1 + Math.sin(clock.elapsedTime * 3) * 0.15;
    ref.current.scale.set(s, s, 1);
  });
  return (
    <mesh ref={ref as React.RefObject<THREE.Mesh>} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
      <ringGeometry args={[radius, radius + 0.03, 32]} />
      <meshBasicMaterial color={color} transparent opacity={0.35} side={THREE.DoubleSide} />
    </mesh>
  );
}

/* ───────── Realistic equipment shapes ───────── */
function AHUShape({ color, hovered }: { color: string; hovered: boolean }) {
  // Rectangular box with duct stubs
  return (
    <group>
      {/* Main body */}
      <RoundedBox args={[0.4, 0.2, 0.25]} radius={0.02} smoothness={4}>
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={hovered ? 0.4 : 0.15} metalness={0.7} roughness={0.3} />
      </RoundedBox>
      {/* Intake duct */}
      <mesh position={[-0.25, 0, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.12, 8]} />
        <meshStandardMaterial color={color} metalness={0.5} roughness={0.4} transparent opacity={0.7} />
      </mesh>
      {/* Exhaust duct */}
      <mesh position={[0.25, 0, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.1, 8]} />
        <meshStandardMaterial color={color} metalness={0.5} roughness={0.4} transparent opacity={0.7} />
      </mesh>
      {/* Fan circle on front */}
      <mesh position={[0, 0, 0.126]} rotation={[0, 0, 0]}>
        <ringGeometry args={[0.03, 0.06, 16]} />
        <meshBasicMaterial color="#94a3b8" side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function ChillerShape({ color, hovered }: { color: string; hovered: boolean }) {
  // Horizontal cylinder with pipes
  return (
    <group>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.12, 0.12, 0.5, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={hovered ? 0.4 : 0.15} metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Pipe in */}
      <mesh position={[-0.3, -0.08, 0]}>
        <cylinderGeometry args={[0.025, 0.025, 0.15, 8]} />
        <meshStandardMaterial color="#06b6d4" metalness={0.6} roughness={0.3} />
      </mesh>
      {/* Pipe out */}
      <mesh position={[0.3, -0.08, 0]}>
        <cylinderGeometry args={[0.025, 0.025, 0.15, 8]} />
        <meshStandardMaterial color="#f97316" metalness={0.6} roughness={0.3} />
      </mesh>
    </group>
  );
}

function CoolingTowerShape({ color, hovered }: { color: string; hovered: boolean }) {
  // Tapered cylinder (wider at top) with fan on top
  return (
    <group>
      <mesh>
        <cylinderGeometry args={[0.18, 0.13, 0.35, 8]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={hovered ? 0.4 : 0.15} metalness={0.5} roughness={0.4} transparent opacity={0.85} />
      </mesh>
      {/* Grille slats */}
      {[-0.08, 0, 0.08].map((y) => (
        <mesh key={y} position={[0, y, 0.15]}>
          <boxGeometry args={[0.25, 0.015, 0.005]} />
          <meshStandardMaterial color="#475569" metalness={0.6} roughness={0.3} />
        </mesh>
      ))}
      {/* Top fan */}
      <mesh position={[0, 0.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.1, 0.015, 8, 16]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.7} roughness={0.2} />
      </mesh>
    </group>
  );
}

function BoilerShape({ color, hovered }: { color: string; hovered: boolean }) {
  // Upright cylinder with a chimney
  return (
    <group>
      <mesh>
        <cylinderGeometry args={[0.1, 0.1, 0.3, 12]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={hovered ? 0.4 : 0.15} metalness={0.6} roughness={0.35} />
      </mesh>
      {/* Chimney/flue */}
      <mesh position={[0.0, 0.22, 0]}>
        <cylinderGeometry args={[0.03, 0.025, 0.15, 8]} />
        <meshStandardMaterial color="#78716c" metalness={0.4} roughness={0.5} />
      </mesh>
      {/* Flame glow at base */}
      <mesh position={[0, -0.12, 0.1]}>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshBasicMaterial color="#f97316" transparent opacity={color === '#6b7280' ? 0.1 : 0.6} />
      </mesh>
    </group>
  );
}

function VAVShape({ color, hovered }: { color: string; hovered: boolean }) {
  // Small box with a damper flap
  return (
    <group>
      <RoundedBox args={[0.2, 0.12, 0.15]} radius={0.015} smoothness={4}>
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={hovered ? 0.4 : 0.15} metalness={0.6} roughness={0.3} />
      </RoundedBox>
      {/* Damper blade */}
      <mesh position={[0, 0, 0.08]} rotation={[0.3, 0, 0]}>
        <boxGeometry args={[0.14, 0.06, 0.005]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.7} roughness={0.2} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function FCUShape({ color, hovered }: { color: string; hovered: boolean }) {
  // Flat wall-mounted unit with grille
  return (
    <group>
      <RoundedBox args={[0.25, 0.1, 0.08]} radius={0.01} smoothness={4}>
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={hovered ? 0.4 : 0.15} metalness={0.6} roughness={0.3} />
      </RoundedBox>
      {/* Grille lines */}
      {[-0.06, -0.02, 0.02, 0.06].map((x) => (
        <mesh key={x} position={[x, 0, 0.042]}>
          <boxGeometry args={[0.008, 0.07, 0.002]} />
          <meshStandardMaterial color="#64748b" />
        </mesh>
      ))}
    </group>
  );
}

const shapeComponents: Record<string, React.FC<{ color: string; hovered: boolean }>> = {
  ahu: AHUShape,
  chiller: ChillerShape,
  'cooling-tower': CoolingTowerShape,
  boiler: BoilerShape,
  vav: VAVShape,
  fcu: FCUShape,
};

/* ───────── Equipment unit wrapper ───────── */
function EquipmentUnit({
  item,
  position,
  label,
  onSelect,
  light,
}: {
  item: Equipment;
  position: [number, number, number];
  label: string;
  onSelect: (id: string) => void;
  light: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null!);
  const [hovered, setHovered] = useState(false);
  const color = statusColors[item.status];
  const ShapeComp = shapeComponents[item.type] ?? AHUShape;

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.position.y =
        position[1] + Math.sin(clock.elapsedTime * 1.8 + position[0] * 2) * 0.015;
    }
  });

  return (
    <group position={position}>
      <PulseRing color={color} radius={0.22} />
      <group
        ref={groupRef as React.RefObject<THREE.Group>}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = 'default';
        }}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(item.id);
        }}
      >
        <ShapeComp color={hovered ? '#67e8f9' : color} hovered={hovered} />
      </group>

      {/* Label */}
      <Text
        position={[0, 0.22, 0]}
        fontSize={0.08}
        color={hovered ? '#67e8f9' : light ? '#1e293b' : '#e2e8f0'}
        anchorX="center"
        anchorY="bottom"
        font={undefined}
        fontWeight={700}
      >
        {label}
      </Text>
      <Text
        position={[0, 0.14, 0]}
        fontSize={0.05}
        color={color}
        anchorX="center"
        anchorY="bottom"
        font={undefined}
      >
        {item.status.toUpperCase()}
      </Text>

      {hovered && (
        <Html position={[0, 0.4, 0]} center distanceFactor={6}>
          <div className="bg-background/95 backdrop-blur border border-border/50 rounded-lg px-3 py-2 shadow-xl pointer-events-none min-w-[150px]">
            <p className="text-xs font-semibold text-foreground">{item.name}</p>
            <p className="text-[10px] text-muted-foreground">{item.location}</p>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
              <span className="text-[10px]" style={{ color }}>
                {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
              </span>
              <span className="text-[10px] text-muted-foreground ml-auto">{item.efficiency}% eff.</span>
            </div>
            <p className="text-[9px] text-cyan-400 mt-1">Click to monitor →</p>
          </div>
        </Html>
      )}
    </group>
  );
}

/* ───────── Theme palettes ───────── */
const palettes = {
  dark: {
    basement: '#1a1f2e', slab: '#2a3040', glass: '#1e3a5f',
    glassOp: 0.15, glassOpSide: 0.12, roof: '#334155',
    mechRoom: '#1e293b', ground: '#0c1017', floorLabel: '#475569',
    bg: '#080c14', fog: '#080c14',
  },
  light: {
    basement: '#c8cdd5', slab: '#d1d5db', glass: '#93c5fd',
    glassOp: 0.2, glassOpSide: 0.15, roof: '#9ca3af',
    mechRoom: '#a1a1aa', ground: '#e5e7eb', floorLabel: '#6b7280',
    bg: '#f0f4f8', fog: '#f0f4f8',
  },
};

/* ───────── Building ───────── */
function Building({ light }: { light: boolean }) {
  const p = light ? palettes.light : palettes.dark;
  const floors = 4;
  const fh = 0.55; // floor height
  const w = 3;     // width
  const d = 1.8;   // depth

  const GlassWall = ({
    pos, rot, size, op,
  }: {
    pos: [number, number, number];
    rot?: [number, number, number];
    size: [number, number];
    op: number;
  }) => (
    <mesh position={pos} rotation={rot}>
      <planeGeometry args={size} />
      <meshPhysicalMaterial
        color={p.glass}
        transparent
        opacity={op}
        metalness={light ? 0.15 : 0.9}
        roughness={0.1}
        side={THREE.DoubleSide}
      />
    </mesh>
  );

  return (
    <group>
      {/* Basement */}
      <mesh position={[0, -0.25, 0]}>
        <boxGeometry args={[w + 0.2, 0.25, d + 0.2]} />
        <meshStandardMaterial color={p.basement} metalness={0.3} roughness={0.7} transparent opacity={0.85} />
      </mesh>

      {/* Floors */}
      {Array.from({ length: floors }, (_, i) => {
        const y = i * fh;
        const wallH = fh - 0.04;
        return (
          <group key={i}>
            {/* Slab */}
            <mesh position={[0, y, 0]}>
              <boxGeometry args={[w, 0.04, d]} />
              <meshStandardMaterial color={p.slab} metalness={0.4} roughness={0.5} />
            </mesh>
            {/* 4 glass walls */}
            <GlassWall pos={[0, y + fh / 2, d / 2]} size={[w, wallH]} op={p.glassOp} />
            <GlassWall pos={[0, y + fh / 2, -d / 2]} size={[w, wallH]} op={p.glassOp} />
            <GlassWall pos={[-w / 2, y + fh / 2, 0]} rot={[0, Math.PI / 2, 0]} size={[d, wallH]} op={p.glassOpSide} />
            <GlassWall pos={[w / 2, y + fh / 2, 0]} rot={[0, Math.PI / 2, 0]} size={[d, wallH]} op={p.glassOpSide} />
            {/* Floor label */}
            <Text
              position={[-w / 2 - 0.08, y + fh / 2, d / 2 + 0.05]}
              fontSize={0.07}
              color={p.floorLabel}
              anchorX="right"
              font={undefined}
            >
              {i === 0 ? 'GF' : `F${i}`}
            </Text>
          </group>
        );
      })}

      {/* Roof */}
      <mesh position={[0, floors * fh, 0]}>
        <boxGeometry args={[w + 0.05, 0.05, d + 0.05]} />
        <meshStandardMaterial color={p.roof} metalness={0.5} roughness={0.4} />
      </mesh>

      {/* Mechanical penthouse on roof */}
      <mesh position={[0.7, floors * fh + 0.18, 0]}>
        <boxGeometry args={[0.8, 0.3, 0.6]} />
        <meshStandardMaterial color={p.mechRoom} metalness={0.4} roughness={0.6} transparent opacity={0.9} />
      </mesh>

      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.38, 0]}>
        <planeGeometry args={[12, 12]} />
        <meshStandardMaterial color={p.ground} metalness={0.1} roughness={0.9} />
      </mesh>
    </group>
  );
}

/* ───────── Duct lines ───────── */
function DuctLines() {
  const ducts = useMemo(() => [
    { from: new THREE.Vector3(0, -0.35, 1.0), to: new THREE.Vector3(0.9, 1.15, 0.6), color: '#06b6d4' },
    { from: new THREE.Vector3(0.9, 1.15, 0.6), to: new THREE.Vector3(1.1, 2.85, 0), color: '#f97316' },
    { from: new THREE.Vector3(-1.0, -0.35, 0.7), to: new THREE.Vector3(-0.7, 2.0, 0.4), color: '#ef4444' },
  ], []);

  return (
    <>
      {ducts.map((duct, i) => {
        const mid = new THREE.Vector3().addVectors(duct.from, duct.to).multiplyScalar(0.5);
        mid.y += 0.3;
        const curve = new THREE.QuadraticBezierCurve3(duct.from, mid, duct.to);
        const pts = curve.getPoints(30);
        const geo = new THREE.BufferGeometry().setFromPoints(pts);
        const mat = new THREE.LineBasicMaterial({ color: duct.color, transparent: true, opacity: 0.3 });
        const line = new THREE.Line(geo, mat);
        return <primitive key={i} object={line} />;
      })}
    </>
  );
}

/* ───────── Exported component ───────── */
export function Building3D() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const light = theme === 'light';
  const p = light ? palettes.light : palettes.dark;

  return (
    <div
      className="relative w-full h-[480px] rounded-xl overflow-hidden border border-border/50"
      style={{ backgroundColor: p.bg }}
    >
      <div className="absolute top-4 left-4 z-10 pointer-events-none">
        <h2 className="text-sm font-semibold text-foreground/90">Building A — 3D Overview</h2>
        <p className="text-[11px] text-muted-foreground">Orbit to explore • Click equipment to monitor</p>
      </div>

      <div className="absolute top-4 right-4 z-10 flex flex-col gap-1 pointer-events-none">
        {([
          ['#22c55e', 'Online'], ['#f59e0b', 'Warning'],
          ['#6b7280', 'Offline'], ['#3b82f6', 'Maintenance'],
        ] as const).map(([color, label]) => (
          <div key={label} className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
            <span className="text-[10px] text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>

      <Canvas
        key={theme}
        camera={{ position: [4, 3, 4], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
      >
        <ambientLight intensity={light ? 0.9 : 0.4} />
        <directionalLight position={[6, 8, 4]} intensity={light ? 1.3 : 0.8} castShadow />
        <directionalLight position={[-4, 6, -2]} intensity={light ? 0.5 : 0.3} color={light ? '#fff' : '#4488ff'} />
        <pointLight position={[0, 4, 0]} intensity={light ? 0.3 : 0.3} color="#06b6d4" />
        <fog attach="fog" args={[p.fog, 8, 18]} />

        <Building light={light} />
        <DuctLines />

        {equipment.map((item) => {
          const pos = equipmentPositions[item.id];
          if (!pos) return null;
          return (
            <EquipmentUnit
              key={item.id}
              item={item}
              position={pos.position}
              label={pos.label}
              onSelect={(id) => navigate(`/monitor/${id}`)}
              light={light}
            />
          );
        })}

        <OrbitControls
          enablePan enableZoom enableRotate
          minDistance={3} maxDistance={12}
          minPolarAngle={0.3} maxPolarAngle={Math.PI / 2.1}
          autoRotate autoRotateSpeed={0.5}
        />
      </Canvas>
    </div>
  );
}
