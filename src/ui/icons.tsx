import type { IconName } from "../content";

const PATHS: Record<IconName | "sun" | "sunset" | "moon" | "arrow" | "back" | "close" | "eye" | "calc" | "whatsapp" | "drag" | "pin" | "check" | "plus" | "layers", string> = {
  terrace: "M3 21h18M5 21V11h14v10M3 11l9-6 9 6M9 21v-5h6v5",
  gym: "M3 10v4M6 7v10M18 7v10M21 10v4M6 12h12",
  cowork: "M4 5h16v10H4zM2 19h20M9 15v4M15 15v4",
  lounge: "M4 12V9a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v3M3 12h18v5H3zM5 17v2M19 17v2",
  pet: "M7 13c-2 0-3 2-3 4s2 3 4 2c2-1 6-1 8 0s4 0 4-2-1-4-3-4c-1.5 0-2.5-1-5-1s-3.5 1-5 1zM6 8.5a1.5 2 0 1 0 0 .1M10 6a1.5 2 0 1 0 0 .1M14 6a1.5 2 0 1 0 0 .1M18 8.5a1.5 2 0 1 0 0 .1",
  shield: "M12 3l8 3v6c0 4.5-3.5 8-8 9-4.5-1-8-4.5-8-9V6zM8.5 12l2.5 2.5 4.5-5",
  power: "M13 2L5 13h6l-1 9 8-11h-6z",
  bike: "M6 17a3.5 3.5 0 1 0 0 .1M18 17a3.5 3.5 0 1 0 0 .1M6 17l4-8h5l3 8M9 9h3M14 6h3",
  park: "M12 3c3 0 5 2.5 5 5.5S14.5 14 12 14 7 11.5 7 8.5 9 3 12 3zM12 14v7M8 21h8",
  metro: "M7 3h10a2 2 0 0 1 2 2v10a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3V5a2 2 0 0 1 2-2zM5 10h14M8 14h.01M16 14h.01M8 18l-2 3M16 18l2 3",
  shop: "M4 8h16l-1 12H5zM8 8V6a4 4 0 0 1 8 0v2",
  health: "M12 4v16M4 12h16",
  school: "M2 9l10-5 10 5-10 5zM6 11v5c3 2 9 2 12 0v-5",
  plane: "M2 16l8-3V6a2 2 0 0 1 4 0v7l8 3v2l-8-2v4l2 1.5V22l-4-1-4 1v-1.5L10 19v-4l-8 2z",
  city: "M3 21V9l6-3v15M9 21V4l8 3v14M17 21v-9l4 2v7M2 21h20",
  sun: "M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zM12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4",
  sunset: "M3 18h18M5 21h14M12 3v6M8.5 6.5L12 3l3.5 3.5M6 15a6 6 0 0 1 12 0",
  moon: "M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z",
  arrow: "M5 12h14M13 6l6 6-6 6",
  back: "M19 12H5M11 18l-6-6 6-6",
  close: "M6 6l12 12M18 6L6 18",
  eye: "M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",
  calc: "M6 3h12a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zM8 7h8M8 11h.01M12 11h.01M16 11h.01M8 15h.01M12 15h.01M16 15h.01M8 18h.01M12 18h4",
  whatsapp: "M20.5 11.8a8.6 8.6 0 0 1-12.6 7.6L3 21l1.6-4.8A8.6 8.6 0 1 1 20.5 11.8zM9 8.4c-.3 1.8.6 3.7 2 5.2 1.5 1.5 3.4 2.4 5.2 2l.6-1.6-2-1-1 1c-1-.5-2-1.5-2.6-2.6l1-1-1-2z",
  drag: "M8 12h8M5 12l3-3M5 12l3 3M19 12l-3-3M19 12l-3 3",
  pin: "M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21zM12 7a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z",
  check: "M5 12.5l4.5 4.5L19 7.5",
  plus: "M12 5v14M5 12h14",
  layers: "M12 3l9 5-9 5-9-5zM3 13l9 5 9-5M3 17l9 5 9-5",
};

export type IconKey = keyof typeof PATHS;

export function Icon({ name, size = 20, className }: { name: IconKey; size?: number; className?: string }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={PATHS[name]} />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 132 32" aria-label="Nimbo" role="img">
      <path d="M4 26V12.5a6 6 0 0 1 12 0V26M10 26V15" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M2 26h16" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <text x="26" y="24" fill="currentColor" fontFamily="'Instrument Serif', serif" fontSize="27" letterSpacing="0.5">
        nimbo
      </text>
    </svg>
  );
}
