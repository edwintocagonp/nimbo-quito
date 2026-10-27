import { useMemo, useState } from "react";

import { EXTRAS, RATES, RESERVE, decimal, deliveryLabel, money, monthsUntilDelivery, simulate } from "../finance";
import { useReferenceDate } from "../today";
import { TYPOLOGIES, UNITS, UNIT_BY_ID, unitTitle, type UnitType } from "../units";
import { planMessage, waLink } from "../whatsapp";
import { Icon } from "./icons";

const YEARS = [10, 15, 20, 25];
const GROUPS: UnitType[] = ["suite", "dos", "tres", "ph"];

export function Simulator({ unitId, onUnit }: { unitId: string; onUnit: (id: string) => void }) {
  const unit = UNIT_BY_ID.get(unitId) ?? UNITS[0];
  const [downPct, setDownPct] = useState(30);
  const [years, setYears] = useState(20);
  const [rate, setRate] = useState<number>(RATES[0].rate);
  const [extras, setExtras] = useState<(keyof typeof EXTRAS)[]>([]);
  const t = TYPOLOGIES[unit.type];
  const offered = (Object.keys(EXTRAS) as (keyof typeof EXTRAS)[]).filter((e) => !(e === "storage" && t.storage));
  const chosen = extras.filter((e) => offered.includes(e));
  const price = unit.price + chosen.reduce((sum, e) => sum + EXTRAS[e].price, 0);
  const months = monthsUntilDelivery(useReferenceDate());
  const sim = useMemo(() => simulate(price, downPct / 100, rate, years, months), [price, downPct, rate, years, months]);
  const preset = RATES.find((r) => r.rate === rate);
  const rateLabel = preset ? preset.label.toLowerCase() : "una tasa";
  const options = useMemo(
    () => GROUPS.map((type) => ({ type, units: UNITS.filter((u) => u.type === type && (u.status === "disponible" || u.id === unitId)) })),
    [unitId],
  );
  const toggle = (e: keyof typeof EXTRAS) => setExtras((list) => (list.includes(e) ? list.filter((x) => x !== e) : [...list, e]));

  return (
    <div className="sim">
      <div className="sim__controls">
        <label className="field">
          <span>Departamento</span>
          <select value={unit.id} onChange={(e) => onUnit(e.target.value)}>
            {options.map((group) => (
              <optgroup key={group.type} label={TYPOLOGIES[group.type].name}>
                {group.units.map((u) => (
                  <option key={u.id} value={u.id}>
                    {unitTitle(u)} · piso {u.floor} · {u.area} m² · {money(u.price)}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </label>

        <div className="field">
          <span>
            Entrada <output>{downPct} %</output>
          </span>
          <input type="range" min={20} max={50} step={5} value={downPct} onChange={(e) => setDownPct(Number(e.target.value))} aria-label="Porcentaje de entrada" />
          <div className="field__scale">
            <span>20 %</span>
            <span>50 %</span>
          </div>
        </div>

        <div className="field">
          <span>Plazo del crédito</span>
          <div className="segmented" role="radiogroup" aria-label="Plazo del crédito">
            {YEARS.map((y) => (
              <button key={y} role="radio" aria-checked={years === y} className={years === y ? "is-on" : ""} onClick={() => setYears(y)}>
                {y} años
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <span>
            Tasa de interés <output>{decimal(rate)} %</output>
          </span>
          <div className="segmented" role="radiogroup" aria-label="Tasa de interés">
            {RATES.map((r) => (
              <button key={r.id} role="radio" aria-checked={rate === r.rate} className={rate === r.rate ? "is-on" : ""} onClick={() => setRate(r.rate)}>
                {r.label} {decimal(r.rate)} %
              </button>
            ))}
          </div>
          <input type="range" min={5} max={12} step={0.1} value={rate} onChange={(e) => setRate(Number(e.target.value))} aria-label="Tasa de interés anual" />
        </div>

        <fieldset className="field">
          <legend>Extras</legend>
          {offered.map((e) => (
            <label key={e} className="check">
              <input type="checkbox" checked={chosen.includes(e)} onChange={() => toggle(e)} />
              <span className="check__box" aria-hidden="true">
                <Icon name="check" size={14} />
              </span>
              {EXTRAS[e].label} <small>+{money(EXTRAS[e].price)}</small>
            </label>
          ))}
          {t.storage && <p className="field__note">La bodega ya está incluida en este departamento.</p>}
        </fieldset>
      </div>

      <div className="sim__result">
        <p className="eyebrow">{unitTitle(unit)} · {money(price)}</p>
        <ol className="steps">
          <li>
            <span className="steps__when">Hoy</span>
            <strong>{money(RESERVE)}</strong>
            <span>Reserva y firma de la promesa de compraventa</span>
          </li>
          <li>
            <span className="steps__when">Hasta la entrega</span>
            <strong>
              {sim.months} cuotas de {money(sim.monthlyDown)}
            </strong>
            <span>
              Completa tu entrada de {money(sim.down)} sin intereses, hasta {deliveryLabel()}
            </span>
          </li>
          <li className="steps__main">
            <span className="steps__when">Después de la entrega</span>
            <strong>
              {money(sim.monthly)} <small>al mes</small>
            </strong>
            <span>
              Crédito de {money(sim.loan)} a {years} años con {rateLabel} al {decimal(rate)} %
            </span>
          </li>
        </ol>
        <p className="sim__income">
          Ingreso familiar sugerido: <strong>{money(sim.income)}</strong> al mes
        </p>
        <a className="btn btn--primary btn--wide" href={waLink(planMessage(unit, sim, rateLabel, rate, years, chosen))} target="_blank" rel="noopener">
          <Icon name="whatsapp" size={18} /> Enviar este plan por WhatsApp
        </a>
        <p className="fine">Valores referenciales. La tasa, el plazo y el monto final dependen de la aprobación de tu banco o del BIESS.</p>
      </div>
    </div>
  );
}
