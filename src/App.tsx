import { Suspense, lazy, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type RefObject } from "react";
import { AnimatePresence } from "motion/react";

import { forceStart, useEngaged } from "./engage";
import type { TimeOfDay } from "./scene/env";
import type { Insets, SceneView } from "./scene/state";
import { UNITS, UNIT_BY_ID, available, type TypeFilter, type UnitType } from "./units";
import { Amenities, Faq, Footer, Location, Progress, SectionHead, TopBar, Typologies, Visit } from "./ui/Sections";
import { Simulator } from "./ui/Simulator";
import { DragHint, Explorer, Hero, Loading, Poster, TimeToggle, UnitCard, ViewOverlay } from "./ui/StageUI";

const Stage = lazy(() => import("./scene/Stage"));

const MOBILE = "(max-width: 959px)";
const ZERO: Insets = { left: 0, right: 0, top: 0, bottom: 0 };

function useInsets(stage: RefObject<HTMLElement | null>, deps: unknown[]) {
  const [insets, setInsets] = useState<Insets>(ZERO);
  useLayoutEffect(() => {
    const el = stage.current;
    if (!el) return;
    const measure = () => {
      const box = el.getBoundingClientRect();
      const mobile = window.matchMedia(MOBILE).matches;
      const next = { left: 0, right: 0, top: mobile ? 64 : 76, bottom: 0 };
      el.querySelectorAll<HTMLElement>("[data-inset], [data-inset-mobile]").forEach((node) => {
        const r = node.getBoundingClientRect();
        if (!r.width || !r.height) return;
        const side = (mobile && node.dataset.insetMobile) || node.dataset.inset;
        if (side === "left") next.left = Math.max(next.left, r.right - box.left + 8);
        if (side === "right") next.right = Math.max(next.right, box.right - r.left + 8);
        if (side === "top") next.top = Math.max(next.top, r.bottom - box.top + 8);
        if (side === "bottom") next.bottom = Math.max(next.bottom, box.bottom - r.top + 8);
      });
      setInsets((prev) => (Object.keys(next).every((k) => Math.abs(prev[k as keyof Insets] - next[k as keyof Insets]) < 2) ? prev : next));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    el.querySelectorAll("[data-inset], [data-inset-mobile]").forEach((n) => ro.observe(n));
    const late = window.setTimeout(measure, 700);
    return () => {
      ro.disconnect();
      window.clearTimeout(late);
    };
  }, deps);
  return insets;
}

const cheapest = (type: UnitType) => available(UNITS.filter((u) => u.type === type)).sort((a, b) => a.price - b.price)[0]?.id ?? UNITS[0].id;

export default function App() {
  const [mode, setMode] = useState<"intro" | "explore">("intro");
  const [floor, setFloor] = useState<number | null>(null);
  const [unitId, setUnitId] = useState<string | null>(null);
  const [vista, setVista] = useState(false);
  const [time, setTime] = useState<TimeOfDay>("dia");
  const [filter, setFilter] = useState<TypeFilter>("todos");
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [simId, setSimId] = useState(() => cheapest("dos"));
  const [ready, setReady] = useState(false);
  const engaged = useEngaged();
  const [solid, setSolid] = useState(false);
  const stageRef = useRef<HTMLElement>(null);

  const view: SceneView = useMemo(() => ({ mode, floor, unit: unitId, vista, filter, onlyAvailable }), [mode, floor, unitId, vista, filter, onlyAvailable]);
  const insets = useInsets(stageRef, [mode, floor, unitId, vista]);
  const unit = unitId ? UNIT_BY_ID.get(unitId) : undefined;

  const toTop = () => stageRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  const selectFloor = useCallback((f: number) => {
    setMode("explore");
    setFloor(f);
    setUnitId(null);
    setVista(false);
  }, []);

  const selectUnit = useCallback((id: string) => {
    const u = UNIT_BY_ID.get(id);
    if (!u) return;
    setMode("explore");
    setFloor(u.floor);
    setUnitId(id);
    setVista(false);
  }, []);

  const back = useCallback(() => {
    if (vista) setVista(false);
    else if (unitId) setUnitId(null);
    else if (floor !== null) setFloor(null);
    else setMode("intro");
  }, [vista, unitId, floor]);

  const explore = (type?: UnitType) => {
    setFilter(type ?? "todos");
    setMode("explore");
    setFloor(null);
    setUnitId(null);
    setVista(false);
    toTop();
  };

  const simulate = (id?: string) => {
    if (id) setSimId(id);
    document.getElementById("pagos")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && mode === "explore") back();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [back, mode]);

  useEffect(() => {
    document.documentElement.dataset.time = time;
  }, [time]);

  useEffect(() => {
    if (mode === "explore" || time !== "dia") forceStart();
  }, [mode, time]);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > (stageRef.current?.offsetHeight ?? 600) - 90);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <TopBar solid={solid} />
      <section id="inicio" ref={stageRef} className={`stage stage--${mode}${vista ? " stage--vista" : ""}`} data-time={time}>
        <Poster hidden={ready} />
        {engaged && (
          <Suspense fallback={null}>
            <Stage view={view} time={time} insets={insets} onFloor={selectFloor} onUnit={selectUnit} onReady={() => setReady(true)} />
          </Suspense>
        )}
        <div className="stage__scrim" aria-hidden="true" />
        {mode === "intro" && <Hero onExplore={() => explore()} onSimulate={() => simulate()} />}
        {mode === "explore" && !vista && (
          <Explorer view={view} onFloor={selectFloor} onUnit={selectUnit} onBack={back} onFilter={setFilter} onOnly={setOnlyAvailable} />
        )}
        <AnimatePresence>
          {unit && !vista && <UnitCard key={unit.id} unit={unit} onClose={() => setUnitId(null)} onVista={() => setVista(true)} onSimulate={simulate} />}
        </AnimatePresence>
        <AnimatePresence>{unit && vista && <ViewOverlay unit={unit} onBack={() => setVista(false)} />}</AnimatePresence>
        <div className="stage__tools">
          {!vista && <DragHint />}
          <TimeToggle time={time} onChange={setTime} />
        </div>
        <Loading show={engaged && !ready} />
      </section>
      <main>
        <Typologies onExplore={explore} />
        <section id="pagos" className="section section--paper">
          <SectionHead
            index="02"
            label="Formas de pago"
            title={
              <>
                ¿Cuánto pagarías <em>al mes?</em>
              </>
            }
            text="Reserva hoy, paga la entrada en cuotas sin intereses mientras se construye y el resto con tu crédito hipotecario cuando recibas las llaves."
          />
          <Simulator unitId={simId} onUnit={setSimId} />
        </section>
        <Amenities />
        <Location />
        <Progress />
        <Faq />
        <Visit />
      </main>
      <Footer />
    </>
  );
}
