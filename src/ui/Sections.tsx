import { useMemo, useState, type ReactNode } from "react";
import { motion } from "motion/react";

import { AMENITIES, BRAND, FAQ, MILESTONES, OVERALL_PROGRESS, PLACES } from "../content";
import { money } from "../finance";
import type { PlanId } from "../plans";
import { TYPOLOGIES, UNITS, fromPrice, type UnitType } from "../units";
import { useToday } from "../today";
import { infoMessage, visitMessage, waLink } from "../whatsapp";
import { Icon, Logo } from "./icons";
import { PlanSvg } from "./PlanSvg";

const reveal = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const },
};

export function SectionHead({ index, label, title, text }: { index: string; label: string; title: ReactNode; text?: string }) {
  return (
    <motion.header className="section__head" {...reveal}>
      <p className="section__label">
        <span>{index}</span> {label}
      </p>
      <h2>{title}</h2>
      {text && <p className="section__text">{text}</p>}
    </motion.header>
  );
}

export function TopBar({ solid }: { solid: boolean }) {
  return (
    <header className={`topbar${solid ? " is-solid" : ""}`}>
      <a href="#inicio" className="topbar__brand" aria-label="Nimbo, inicio">
        <Logo />
      </a>
      <nav className="topbar__nav" aria-label="Secciones">
        <a href="#departamentos">Departamentos</a>
        <a href="#pagos">Formas de pago</a>
        <a href="#amenidades">Amenidades</a>
        <a href="#ubicacion">Ubicación</a>
        <a href="#avance">Avance de obra</a>
      </nav>
      <a className="btn btn--small btn--dark" href="#visita">
        Agenda tu visita
      </a>
    </header>
  );
}

const CARDS: { type: UnitType; plan: PlanId; text: string }[] = [
  { type: "suite", plan: "B", text: "Para empezar o para invertir: cocina abierta, dormitorio con vestidor y balcón." },
  { type: "dos", plan: "A", text: "Dos baños completos, lavandería y balcón. En las esquinas noroeste y sureste." },
  { type: "tres", plan: "D", text: "El más amplio de los pisos tipo: comedor para seis, dos baños y vista al parque." },
  { type: "ph", plan: "PH1", text: "En el último piso, con isla de cocina, tina y una terraza privada de 36 m²." },
];

export function Typologies({ onExplore }: { onExplore: (type: UnitType) => void }) {
  return (
    <section id="departamentos" className="section">
      <SectionHead index="01" label="Departamentos" title={<>Cuatro formas de vivir <em>Nimbo</em></>} text="Todos con piso flotante, ventanas de piso a techo y orientación pensada para la luz de Quito." />
      <div className="types">
        {CARDS.map((card, i) => {
          const units = UNITS.filter((u) => u.type === card.type);
          const areas = [...new Set(units.map((u) => u.area))].sort((a, b) => a - b);
          const free = units.filter((u) => u.status === "disponible").length;
          const t = TYPOLOGIES[card.type];
          return (
            <motion.article key={card.type} className="type" {...reveal} transition={{ ...reveal.transition, delay: i * 0.08 }}>
              <div className="type__plan">
                <PlanSvg id={card.plan} />
              </div>
              <div className="type__body">
                <h3>{card.type === "dos" || card.type === "tres" ? t.bedrooms : t.name}</h3>
                <p className="type__specs">
                  {areas.length > 1 ? `${areas[0]} a ${areas[areas.length - 1]}` : areas[0]} m² · {t.baths} · {t.parking.toLowerCase()}
                </p>
                <p>{card.text}</p>
                <div className="type__foot">
                  <div>
                    <span>Desde</span>
                    <strong>{money(fromPrice(card.type))}</strong>
                  </div>
                  <span className={`badge${free ? "" : " badge--off"}`}>{free ? `${free} disponibles` : "Agotado"}</span>
                </div>
                <button className="btn btn--ghost btn--wide" onClick={() => onExplore(card.type)}>
                  Ver en el edificio <Icon name="arrow" size={18} />
                </button>
              </div>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}

export function Amenities() {
  return (
    <section id="amenidades" className="section section--dark">
      <SectionHead
        index="03"
        label="Áreas comunales"
        title={<>Lo mejor está <em>en la azotea</em></>}
        text="Una terraza mirador con BBQ y pérgola frente al Pichincha, y todo lo que necesitas para tu día a día."
      />
      <div className="amenities">
        {AMENITIES.map((a, i) => (
          <motion.article key={a.title} className="amenity" {...reveal} transition={{ ...reveal.transition, delay: (i % 4) * 0.06 }}>
            <span className="amenity__icon">
              <Icon name={a.icon} size={24} />
            </span>
            <h3>{a.title}</h3>
            <p>{a.text}</p>
          </motion.article>
        ))}
      </div>
    </section>
  );
}

function MapSvg() {
  const blocks: [number, number][] = [];
  for (let x = 0; x < 640; x += 64) for (let y = 0; y < 440; y += 64) if (!(x >= 140 && x < 470 && y >= 190 && y < 410)) blocks.push([x, y]);
  return (
    <svg className="map" viewBox="0 0 640 440" role="img" aria-label="Mapa referencial de la ubicación">
      <rect width="640" height="440" className="map__bg" />
      {blocks.map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x + 8} y={y + 8} width="48" height="48" rx="6" className="map__block" />
      ))}
      <rect x="148" y="198" width="316" height="206" rx="18" className="map__park" />
      <ellipse cx="376" cy="300" rx="44" ry="24" className="map__lake" />
      <path d="M160 250 C220 230 260 280 320 260 S420 230 456 250 M200 396 C230 330 300 360 330 320 S400 300 440 396" className="map__path" />
      <rect x="182" y="322" width="64" height="40" rx="3" className="map__field" />
      <path d="M0 184 H640" className="map__avenue" />
      <path d="M134 0 V440" className="map__avenue" />
      <path d="M480 0 V440" className="map__avenue map__avenue--small" />
      <path d="M470 410 L640 330" className="map__avenue map__avenue--small" />
      <text x="630" y="176" className="map__street" textAnchor="end">Av. Naciones Unidas</text>
      <text x="126" y="60" className="map__street" transform="rotate(-90 126 60)" textAnchor="end">Av. Amazonas</text>
      <text x="472" y="60" className="map__street" transform="rotate(-90 472 60)" textAnchor="end">Av. de los Shyris</text>
      <text x="306" y="232" className="map__place" textAnchor="middle">Parque La Carolina</text>
      <g transform="translate(134 112)">
        <circle r="13" className="map__metro" />
        <text y="4.5" textAnchor="middle" className="map__metro-label">M</text>
      </g>
      <g transform="translate(300 150)">
        <circle r="34" className="map__halo" />
        <circle r="17" className="map__pin" />
        <path d="M-6 6V-1.5a6 6 0 0 1 12 0V6M0 6V0.5M-8.5 6h17" className="map__pin-mark" />
        <text y="-28" textAnchor="middle" className="map__pin-label">Nimbo</text>
      </g>
      <g transform="translate(604 40)" className="map__north">
        <path d="M0 -16 L7 6 L0 2 L-7 6Z" />
        <text y="22" textAnchor="middle">N</text>
      </g>
    </svg>
  );
}

export function Location() {
  return (
    <section id="ubicacion" className="section">
      <SectionHead index="04" label="Ubicación" title={<>En el corazón de <em>Quito norte</em></>} text="Frente al Parque La Carolina: caminas al parque, al bulevar y al Metro, con todo el norte a pocos minutos." />
      <div className="location">
        <motion.div className="location__map" {...reveal}>
          <MapSvg />
          <p className="fine">Mapa y tiempos referenciales.</p>
        </motion.div>
        <motion.ul className="places" {...reveal}>
          {PLACES.map((p) => (
            <li key={p.name}>
              <span className="places__icon">
                <Icon name={p.icon} size={20} />
              </span>
              <span className="places__name">{p.name}</span>
              <span className="places__time">{p.time}</span>
            </li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}

export function Progress() {
  return (
    <section id="avance" className="section section--paper">
      <SectionHead index="05" label="Avance de obra" title={<>Así avanza <em>Nimbo</em></>} text="Comprar en preventa te da el mejor precio. Te contamos cada etapa hasta la entrega de llaves." />
      <motion.div className="progress" {...reveal}>
        <div className="progress__total">
          <span>Avance general</span>
          <strong>{OVERALL_PROGRESS} %</strong>
        </div>
        <div className="bar" role="progressbar" aria-label="Avance general de la obra" aria-valuenow={OVERALL_PROGRESS} aria-valuemin={0} aria-valuemax={100}>
          <motion.span initial={{ width: 0 }} whileInView={{ width: `${OVERALL_PROGRESS}%` }} viewport={{ once: true }} transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }} />
        </div>
      </motion.div>
      <ol className="timeline">
        {MILESTONES.map((m, i) => (
          <motion.li key={m.title} className={`timeline__item is-${m.state}`} {...reveal} transition={{ ...reveal.transition, delay: i * 0.05 }}>
            <span className="timeline__dot" aria-hidden="true">
              {m.state === "done" && <Icon name="check" size={14} />}
            </span>
            <div>
              <h3>{m.title}</h3>
              <p>{m.date}</p>
              {m.progress !== undefined && (
                <div className="bar bar--small">
                  <span style={{ width: `${m.progress}%` }} />
                </div>
              )}
            </div>
            {m.state === "now" && <span className="badge">En curso · {m.progress} %</span>}
          </motion.li>
        ))}
      </ol>
    </section>
  );
}

export function Faq() {
  return (
    <section className="section section--narrow">
      <SectionHead index="06" label="Preguntas frecuentes" title={<>Comprar en preventa, <em>sin dudas</em></>} />
      <div className="faq">
        {FAQ.map((f) => (
          <details key={f.q}>
            <summary>
              {f.q}
              <Icon name="plus" size={18} />
            </summary>
            <p>{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

function nextDays(from: Date) {
  const out: string[] = [];
  const d = new Date(from);
  while (out.length < 8) {
    d.setDate(d.getDate() + 1);
    if (d.getDay() === 0) continue;
    out.push(d.toLocaleDateString("es-EC", { weekday: "long", day: "numeric", month: "long" }));
  }
  return out;
}

export function Visit() {
  const today = useToday();
  const days = useMemo(() => (today ? nextDays(today) : []), [today]);
  const [name, setName] = useState("");
  const [picked, setDay] = useState("");
  const day = picked || days[0] || "";
  const [slot, setSlot] = useState("mañana");
  const [interest, setInterest] = useState("2 dormitorios");
  const href = waLink(visitMessage(name.trim(), day, slot, interest));
  return (
    <section id="visita" className="section section--visit">
      <div className="visit">
        <motion.div className="visit__copy" {...reveal}>
          <p className="section__label">
            <span>07</span> Sala de ventas
          </p>
          <h2>
            Ven a conocer <em>Nimbo</em>
          </h2>
          <p>Te mostramos los acabados, la maqueta y el departamento muestra. Agenda tu visita y te esperamos con tu plan de pagos listo.</p>
          <ul className="visit__info">
            <li>
              <Icon name="pin" size={18} /> {BRAND.sector}
            </li>
            <li>
              <Icon name="sun" size={18} /> {BRAND.hours}
            </li>
            <li>
              <Icon name="whatsapp" size={18} />
              <a href={waLink(infoMessage())} target="_blank" rel="noopener">
                Escríbenos por WhatsApp
              </a>
            </li>
          </ul>
        </motion.div>
        <motion.form className="visit__form" {...reveal} onSubmit={(e) => e.preventDefault()}>
          <label className="field">
            <span>Tu nombre</span>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej.: María Pérez" autoComplete="name" />
          </label>
          <label className="field">
            <span>Día</span>
            <select value={day} onChange={(e) => setDay(e.target.value)}>
              {days.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
          </label>
          <div className="field">
            <span>Horario</span>
            <div className="segmented" role="radiogroup" aria-label="Horario">
              {["mañana", "tarde"].map((s) => (
                <button key={s} type="button" role="radio" aria-checked={slot === s} className={slot === s ? "is-on" : ""} onClick={() => setSlot(s)}>
                  {s === "mañana" ? "Mañana" : "Tarde"}
                </button>
              ))}
            </div>
          </div>
          <label className="field">
            <span>Me interesa</span>
            <select value={interest} onChange={(e) => setInterest(e.target.value)}>
              {["Suite", "2 dormitorios", "3 dormitorios", "Penthouse", "Todavía no sé"].map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </label>
          <a className="btn btn--primary btn--wide" href={href} target="_blank" rel="noopener">
            <Icon name="whatsapp" size={18} /> Agendar por WhatsApp
          </a>
        </motion.form>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer__top">
        <Logo className="footer__logo" />
        <p>{BRAND.tagline}. Departamentos en preventa en {BRAND.sector}.</p>
      </div>
      <nav className="footer__nav" aria-label="Pie de página">
        <a href="#departamentos">Departamentos</a>
        <a href="#pagos">Formas de pago</a>
        <a href="#amenidades">Amenidades</a>
        <a href="#ubicacion">Ubicación</a>
        <a href="#avance">Avance de obra</a>
        <a href="#visita">Sala de ventas</a>
      </nav>
      <p className="footer__notice">
        Proyecto demostrativo: el edificio, los precios y la disponibilidad son ficticios. Las imágenes son referenciales y se generan por código.
      </p>
    </footer>
  );
}
