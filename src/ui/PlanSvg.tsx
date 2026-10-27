import { PLANS, planBounds, planWalls, roomArea, type PlanId, type RoomKind } from "../plans";

const FILL: Record<RoomKind, string> = {
  social: "var(--plan-wood)",
  dorm: "var(--plan-wood-2)",
  circ: "var(--plan-wood-2)",
  cocina: "var(--plan-tile)",
  bano: "var(--plan-wet)",
  servicio: "var(--plan-tile)",
};

const WIDTH = { interior: 0.1, party: 0.22, facade: 0.16, solid: 0.22 } as const;

const SHORT: Record<string, string> = {
  "Dormitorio principal": "Principal",
  "Dormitorio 2": "Dorm. 2",
  "Dormitorio 3": "Dorm. 3",
  Dormitorio: "Dormitorio",
  "Sala y comedor": "Sala",
  "Baño principal": "Baño",
  "Baño 2": "Baño 2",
  Baño: "Baño",
  Cocina: "Cocina",
  Lavandería: "Lav.",
  Vestidor: "Vest.",
};

export function PlanSvg({ id, labels = false, className }: { id: PlanId; labels?: boolean; className?: string }) {
  const plan = PLANS[id];
  const [x0, z0, x1, z1] = planBounds(id);
  const pad = 0.6;
  const w = x1 - x0 + pad * 2;
  const h = z1 - z0 + pad * 2;
  return (
    <svg className={className} viewBox={`${x0 - pad} ${z0 - pad} ${w} ${h}`} role="img" aria-label="Plano del departamento">
      {plan.balconies.map((b, i) => (
        <rect key={`b${i}`} x={b[0]} y={b[1]} width={b[2] - b[0]} height={b[3] - b[1]} className="plan__outdoor" />
      ))}
      {plan.terrace && (
        <rect x={plan.terrace.rect[0]} y={plan.terrace.rect[1]} width={plan.terrace.rect[2] - plan.terrace.rect[0]} height={plan.terrace.rect[3] - plan.terrace.rect[1]} className="plan__outdoor" />
      )}
      {plan.rooms.flatMap((room, i) =>
        room.rects.map((r, j) => <rect key={`${i}-${j}`} x={r[0]} y={r[1]} width={r[2] - r[0]} height={r[3] - r[1]} fill={FILL[room.kind]} />),
      )}
      {planWalls(id).map((wall, i) => {
        const [ax, az, bx, bz] = wall.axis === "x" ? [wall.c, wall.a, wall.c, wall.b] : [wall.a, wall.c, wall.b, wall.c];
        return <line key={i} x1={ax} y1={az} x2={bx} y2={bz} strokeWidth={WIDTH[wall.kind]} className={`plan__wall plan__wall--${wall.kind}`} />;
      })}
      {labels &&
        plan.rooms
          .filter((room) => roomArea(room) > 3.5 && room.kind !== "circ")
          .map((room, i) => {
            const r = [...room.rects].sort((a, b) => (b[2] - b[0]) * (b[3] - b[1]) - (a[2] - a[0]) * (a[3] - a[1]))[0];
            const short = SHORT[room.name] ?? room.name;
            return (
              <text key={i} x={(r[0] + r[2]) / 2} y={(r[1] + r[3]) / 2} className="plan__label" textAnchor="middle" dominantBaseline="middle">
                {short}
              </text>
            );
          })}
    </svg>
  );
}
