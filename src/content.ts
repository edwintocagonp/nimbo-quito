export const BRAND = {
  name: "Nimbo",
  tagline: "Vive con Quito a tus pies",
  sector: "La Carolina, Quito norte",
  whatsapp: "593000000000",
  hours: "Lunes a sábado, de 9:00 a 18:00",
};

export type IconName =
  | "terrace"
  | "gym"
  | "cowork"
  | "lounge"
  | "pet"
  | "shield"
  | "power"
  | "bike"
  | "park"
  | "metro"
  | "shop"
  | "health"
  | "school"
  | "plane"
  | "city";

export const AMENITIES: { icon: IconName; title: string; text: string }[] = [
  { icon: "terrace", title: "Terraza mirador", text: "En la azotea, con BBQ, pérgola y el Pichincha de frente." },
  { icon: "gym", title: "Gimnasio", text: "Equipado y con luz natural, abierto desde las 5:00." },
  { icon: "cowork", title: "Coworking", text: "Escritorios, sala de reuniones y fibra óptica." },
  { icon: "lounge", title: "Sala comunal", text: "Para reuniones y cumpleaños, con cocina de apoyo." },
  { icon: "pet", title: "Zona pet", text: "Un espacio con césped y bebedero para tu mascota." },
  { icon: "shield", title: "Seguridad 24/7", text: "Guardianía, cámaras y acceso con tarjeta." },
  { icon: "power", title: "Generador eléctrico", text: "Para ascensores, bombas de agua y áreas comunales." },
  { icon: "bike", title: "Bicicletero y carga eléctrica", text: "Parqueo de bicis y puntos de carga para autos eléctricos." },
];

export const PLACES: { icon: IconName; name: string; time: string }[] = [
  { icon: "park", name: "Parque La Carolina", time: "2 min a pie" },
  { icon: "shop", name: "Bulevar de las Naciones Unidas", time: "5 min a pie" },
  { icon: "metro", name: "Estación del Metro de Quito", time: "7 min a pie" },
  { icon: "health", name: "Clínicas y hospitales", time: "8 min en auto" },
  { icon: "school", name: "Colegios y universidades", time: "10 min en auto" },
  { icon: "city", name: "Centro Histórico", time: "20 min en auto" },
  { icon: "plane", name: "Aeropuerto Mariscal Sucre", time: "45 min en auto" },
];

export type Milestone = { title: string; date: string; state: "done" | "now" | "next"; progress?: number };

export const MILESTONES: Milestone[] = [
  { title: "Preventa y permisos municipales", date: "Agosto y septiembre 2026", state: "done" },
  { title: "Excavación y cimentación", date: "Octubre 2026 a marzo 2027", state: "now", progress: 30 },
  { title: "Estructura de los 12 pisos", date: "2027", state: "next" },
  { title: "Instalaciones y mampostería", date: "2027 y 2028", state: "next" },
  { title: "Acabados y áreas comunales", date: "2028", state: "next" },
  { title: "Entrega de llaves", date: "Diciembre 2028", state: "next" },
];

export const OVERALL_PROGRESS = 8;

export const FAQ: { q: string; a: string }[] = [
  { q: "¿Cómo separo un departamento?", a: "Con una reserva de $2.000 firmas la promesa de compraventa, que congela el precio y el departamento elegido." },
  { q: "¿Puedo pagar la entrada en cuotas?", a: "Sí. La entrada se divide en cuotas mensuales sin intereses hasta la entrega." },
  { q: "¿Con qué crédito pago el resto?", a: "Con un crédito hipotecario de cualquier banco o del BIESS. Te ayudamos con la precalificación." },
  { q: "¿Qué pasa si el precio sube?", a: "Nada: el precio de la preventa queda fijo desde la promesa de compraventa." },
];
