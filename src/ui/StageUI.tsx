import { AnimatePresence, motion } from "motion/react";

import { BRAND } from "../content";
import { RESERVE, money, monthsUntilDelivery } from "../finance";
import { useReferenceDate } from "../today";
import {
  FLOORS,
  PLAN_INFO,
  STATUS_LABEL,
  TOP_FLOOR,
  TYPOLOGIES,
  UNITS,
  available,
  fromPrice,
  matches,
  unitTitle,
  unitsOnFloor,
  type TypeFilter,
  type Unit,
} from "../units";
import type { TimeOfDay } from "../scene/env";
import type { SceneView } from "../scene/state";
import { reserveMessage, waLink } from "../whatsapp";
import { Icon, type IconKey } from "./icons";
import { PlanSvg } from "./PlanSvg";

const ease = [0.22, 1, 0.36, 1] as const;

export function Hero({ onExplore, onSimulate }: { onExplore: () => void; onSimulate: () => void }) {
  const left = available().length;
  return (
    <div className="hero">
      <div className="hero__top" data-inset="left" data-inset-mobile="none">
        <p className="hero__kicker">
          <span className="pulse" aria-hidden="true" />
          Preventa · {BRAND.sector}
        </p>
        <h1 data-inset-mobile="top">
          Vive con Quito <em>a tus pies</em>
        </h1>
        <p className="hero__lead">
          40 departamentos de 1 a 3 dormitorios y 2 penthouses, frente al Parque La Carolina y con el Pichincha de fondo. Entrega en diciembre de 2028.
        </p>
      </div>
      <div className="hero__bottom" data-inset="left" data-inset-mobile="bottom">
        <div className="hero__actions">
          <button className="btn btn--primary" onClick={onExplore}>
            Elige tu departamento <Icon name="arrow" size={18} />
          </button>
          <button className="btn btn--glass" onClick={onSimulate}>
            <Icon name="calc" size={18} /> Simula tu pago
          </button>
        </div>
        <dl className="hero__stats">
          <div>
            <dt>Desde</dt>
            <dd>{money(fromPrice())}</dd>
          </div>
          <div>
            <dt>Reserva con</dt>
            <dd>{money(RESERVE)}</dd>
          </div>
          <div>
            <dt>Disponibles</dt>
            <dd>
              {left} <small>de {UNITS.length}</small>
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}

const FILTERS: { id: TypeFilter; label: string }[] = [
  { id: "todos", label: "Todos" },
  { id: "suite", label: "Suite" },
  { id: "dos", label: "2 dorm." },
  { id: "tres", label: "3 dorm." },
  { id: "ph", label: "Penthouse" },
];

type ExplorerProps = {
  view: SceneView;
  onFloor: (floor: number) => void;
  onUnit: (id: string) => void;
  onBack: () => void;
  onFilter: (filter: TypeFilter) => void;
  onOnly: (only: boolean) => void;
};

function FloorUnits({ view, onUnit, compact }: { view: SceneView; onUnit: (id: string) => void; compact?: boolean }) {
  if (view.floor === null) return null;
  return (
    <ul className={`unit-list${compact ? " unit-list--compact" : ""}`}>
      {unitsOnFloor(view.floor).map((u) => {
        const match = matches(u, view.filter, view.onlyAvailable);
        return (
          <li key={u.id}>
            <button className={`unit-row${match ? "" : " is-off"}${view.unit === u.id ? " is-active" : ""}`} onClick={() => onUnit(u.id)}>
              <span className={`dot dot--${u.status}`} />
              <strong>{u.id}</strong>
              <span className="unit-row__type">
                {TYPOLOGIES[u.type].short} · {u.area} m²
              </span>
              <span className="unit-row__price">{u.status === "vendido" ? "Vendido" : money(u.price)}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

export function Explorer({ view, onFloor, onUnit, onBack, onFilter, onOnly }: ExplorerProps) {
  const floorTitle = view.floor === null ? "Elige tu piso" : view.floor === TOP_FLOOR ? "Piso 12 · Penthouses" : `Piso ${view.floor}`;
  return (
    <>
      <motion.aside
        className={`explorer${view.unit ? " has-unit" : ""}${view.floor !== null ? " has-floor" : ""}`}
        data-inset="left"
        data-inset-mobile="bottom"
        initial={{ opacity: 0, x: -24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease }}
      >
        <header className="explorer__head">
          <button className="icon-btn" onClick={onBack} aria-label="Volver">
            <Icon name="back" size={18} />
          </button>
          <div>
            <p className="eyebrow">Explora el edificio</p>
            <h2>{floorTitle}</h2>
          </div>
        </header>
        <div className="chips" role="radiogroup" aria-label="Tipo de departamento">
          {FILTERS.map((f) => (
            <button key={f.id} role="radio" aria-checked={view.filter === f.id} className={`chip${view.filter === f.id ? " is-on" : ""}`} onClick={() => onFilter(f.id)}>
              {f.label}
            </button>
          ))}
        </div>
        <label className="switch">
          <input type="checkbox" checked={view.onlyAvailable} onChange={(e) => onOnly(e.target.checked)} />
          <span className="switch__track" aria-hidden="true" />
          Solo disponibles
        </label>
        <ol className="floors" aria-label="Pisos">
          {[...FLOORS].reverse().map((floor) => {
            const units = unitsOnFloor(floor);
            const free = units.filter((u) => u.status === "disponible" && matches(u, view.filter, false)).length;
            const any = units.some((u) => matches(u, view.filter, view.onlyAvailable));
            return (
              <li key={floor}>
                <button className={`floor${view.floor === floor ? " is-active" : ""}${any ? "" : " is-off"}`} onClick={() => onFloor(floor)} aria-label={`Piso ${floor}, ${free} disponibles`}>
                  <span className="floor__num">{floor === TOP_FLOOR ? "PH" : floor}</span>
                  <span className="floor__dots">
                    {units.map((u) => (
                      <i key={u.id} className={`dot dot--${u.status}${matches(u, view.filter, view.onlyAvailable) ? "" : " is-off"}`} />
                    ))}
                  </span>
                  <span className="floor__free">{free ? `${free} disp.` : "—"}</span>
                </button>
              </li>
            );
          })}
        </ol>
        <div className="explorer__mobile-units">
          <FloorUnits view={view} onUnit={onUnit} compact />
        </div>
        <ul className="legend">
          <li>
            <span className="dot dot--disponible" /> Disponible
          </li>
          <li>
            <span className="dot dot--reservado" /> Reservado
          </li>
          <li>
            <span className="dot dot--vendido" /> Vendido
          </li>
        </ul>
      </motion.aside>
      <AnimatePresence>
        {view.floor !== null && !view.unit && (
          <motion.section
            key={`floor-${view.floor}`}
            className="detail detail--floor"
            data-inset="right"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 24 }}
            transition={{ duration: 0.45, ease }}
          >
            <p className="eyebrow">{floorTitle}</p>
            <h3>Elige un departamento</h3>
            <FloorUnits view={view} onUnit={onUnit} />
            <p className="hint">
              <Icon name="layers" size={16} /> También puedes tocarlo en el plano 3D.
            </p>
          </motion.section>
        )}
      </AnimatePresence>
    </>
  );
}

type UnitCardProps = { unit: Unit; onClose: () => void; onVista: () => void; onSimulate: (id: string) => void };

export function UnitCard({ unit, onClose, onVista, onSimulate }: UnitCardProps) {
  const months = monthsUntilDelivery(useReferenceDate());
  const t = TYPOLOGIES[unit.type];
  const info = PLAN_INFO[unit.plan];
  return (
    <motion.section
      key={unit.id}
      className="detail detail--unit"
      data-inset="right"
      data-inset-mobile="bottom"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 30 }}
      transition={{ duration: 0.5, ease }}
    >
      <header className="detail__head">
        <span className={`status status--${unit.status}`}>{STATUS_LABEL[unit.status]}</span>
        <button className="icon-btn" onClick={onClose} aria-label="Cerrar">
          <Icon name="close" size={18} />
        </button>
      </header>
      <h3>{unitTitle(unit)}</h3>
      <p className="detail__specs">
        {t.bedrooms} · {t.baths} · {unit.area} m² + {info.outdoorName.toLowerCase()} de {unit.outdoor.toLocaleString("es-EC")} m²
      </p>
      <p className="detail__view">
        <Icon name="eye" size={16} /> {info.view}
      </p>
      <PlanSvg id={unit.plan} labels className="detail__plan" />
      <dl className="facts">
        <div>
          <dt>Piso</dt>
          <dd>{unit.floor}</dd>
        </div>
        <div>
          <dt>Orientación</dt>
          <dd>{info.side}</dd>
        </div>
        <div>
          <dt>Parqueo</dt>
          <dd>{t.parking.replace("Parqueadero opcional", "Opcional")}</dd>
        </div>
        <div>
          <dt>Bodega</dt>
          <dd>{t.storage ? "Incluida" : "Opcional"}</dd>
        </div>
      </dl>
      <div className="detail__price">
        <span>Precio de preventa</span>
        <strong>{money(unit.price)}</strong>
        <small>
          Reserva con {money(RESERVE)} y paga la entrada en {months} cuotas
        </small>
      </div>
      <div className="detail__actions">
        <button className="btn btn--ghost" onClick={onVista}>
          <Icon name="eye" size={18} /> Ver la vista
        </button>
        {unit.status !== "vendido" && (
          <button className="btn btn--ghost" onClick={() => onSimulate(unit.id)}>
            <Icon name="calc" size={18} /> Simular pago
          </button>
        )}
        {unit.status === "disponible" ? (
          <a className="btn btn--primary btn--wide" href={waLink(reserveMessage(unit))} target="_blank" rel="noopener">
            <Icon name="whatsapp" size={18} /> Separar por WhatsApp
          </a>
        ) : (
          <p className="detail__note">
            {unit.status === "vendido" ? "Este departamento ya se vendió." : "Este departamento está reservado."} Mira los disponibles de este piso en verde.
          </p>
        )}
      </div>
    </motion.section>
  );
}

const TIMES: { id: TimeOfDay; label: string; icon: IconKey }[] = [
  { id: "dia", label: "Día", icon: "sun" },
  { id: "atardecer", label: "Atardecer", icon: "sunset" },
  { id: "noche", label: "Noche", icon: "moon" },
];

export function TimeToggle({ time, onChange }: { time: TimeOfDay; onChange: (t: TimeOfDay) => void }) {
  return (
    <div className="time" role="radiogroup" aria-label="Hora del día">
      {TIMES.map((t) => (
        <button key={t.id} role="radio" aria-checked={time === t.id} className={time === t.id ? "is-on" : ""} onClick={() => onChange(t.id)} title={t.label}>
          <Icon name={t.icon} size={17} />
          <span>{t.label}</span>
        </button>
      ))}
    </div>
  );
}

export function ViewOverlay({ unit, onBack }: { unit: Unit; onBack: () => void }) {
  const info = PLAN_INFO[unit.plan];
  return (
    <motion.div className="vista" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }}>
      <div className="vista__frame" aria-hidden="true" />
      <div className="vista__caption" data-inset="left" data-inset-mobile="top">
        <p className="eyebrow">Vista referencial</p>
        <h3>
          Desde el piso {unit.floor} · {info.side}
        </h3>
        <p>{info.view}</p>
      </div>
      <div className="vista__bar">
        <button className="btn btn--light" onClick={onBack}>
          <Icon name="back" size={18} /> Volver al plano
        </button>
        <span className="vista__hint">
          <Icon name="drag" size={18} /> Arrastra para mirar alrededor
        </span>
      </div>
    </motion.div>
  );
}

export function Poster({ hidden }: { hidden: boolean }) {
  return <div className={`stage__poster${hidden ? " is-hidden" : ""}`} aria-hidden="true" />;
}

export function Loading({ show }: { show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.p className="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4, delay: 0.3 }}>
          <span className="loading__spin" aria-hidden="true" /> Cargando el edificio en 3D…
        </motion.p>
      )}
    </AnimatePresence>
  );
}

export function DragHint() {
  return (
    <p className="drag-hint">
      <Icon name="drag" size={16} /> Arrastra para girar
    </p>
  );
}
