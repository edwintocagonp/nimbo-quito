# Nimbo · Departamentos en preventa en 3D

Página de preventa de un edificio de departamentos en Quito norte, frente al Parque La Carolina. El edificio se recorre en 3D: se elige un piso, el piso sale del edificio como un cajón y muestra sus departamentos amoblados, cada uno con su estado (disponible, reservado o vendido), su plano, su precio y la vista desde sus ventanas, de día, al atardecer o de noche.

El simulador de pago calcula la reserva, las cuotas de la entrada hasta la entrega y la cuota del crédito hipotecario (banca privada o BIESS), y arma el plan como un mensaje de WhatsApp. También se puede agendar una visita a la sala de ventas.

Nimbo es un proyecto demostrativo: el edificio, los precios, la disponibilidad y el avance de obra son ficticios, y el número de WhatsApp es de prueba (593000000000). Los lugares de Quito (el parque, las avenidas, el Pichincha y los volcanes) son referenciales.

## Tecnología

- React 19, TypeScript y Vite
- three.js con React Three Fiber, drei y postprocessing
- Motion para las animaciones de la interfaz
- Nada descargado: edificio, muebles, ciudad, montañas, cielo y texturas se generan por código

## Cómo está hecho

- **Planos**: cada departamento se define por sus ambientes (rectángulos) y sus muebles. Las paredes, puertas y ventanales se calculan solos: entre dos ambientes hay pared interior, entre dos departamentos pared medianera y hacia afuera ventanal. Del mismo dato salen el piso en 3D, las etiquetas y el plano 2D de cada tarjeta.
- **Edificio**: 12 pisos (4 departamentos por piso y 2 penthouses arriba), planta baja con lobby y terraza mirador en la azotea. Cada piso se une en pocas mallas para que funcione bien en el celular.
- **Ciudad**: manzanas con edificios instanciados cuyas ventanas se encienden de noche desde el shader, el parque con su laguna, árboles, postes de luz y las luces de la ciudad subiendo por el Pichincha.
- **Hora del día**: cielo, sol, niebla, montañas y luces cambian entre día, atardecer y noche.
- **Rendimiento**: al compilar, la página se genera como HTML (`scripts/prerender.mjs`) y React la retoma sin volver a dibujarla. El inicio muestra una imagen fija del edificio, sacada de la misma escena, y el 3D arranca solo un momento después de cargar si el equipo tiene tarjeta gráfica, o al elegir un departamento o cambiar la hora del día. Lighthouse: 100 en rendimiento, accesibilidad, buenas prácticas y SEO, en celular y en escritorio.

## Desarrollo

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # revisa los tipos y genera dist/
npm run preview  # sirve dist/
```

## Estructura

| Archivo | Contenido |
|---|---|
| `src/plans.ts` | Planos de los departamentos, muebles y cálculo de paredes |
| `src/units.ts` | Departamentos, precios por piso y disponibilidad |
| `src/finance.ts` | Reserva, entrada en cuotas y crédito hipotecario |
| `src/content.ts` | Amenidades, lugares cercanos, avance de obra y preguntas |
| `src/scene/` | Edificio, muebles, ciudad, cielo, cámara y escena |
| `src/ui/` | Panel del edificio, tarjeta del departamento, simulador y secciones |
| `public/poster*.webp` | Imagen fija del inicio, de escritorio y de celular |
| `scripts/prerender.mjs` | Genera el HTML de la página al compilar |

## Despliegue en Cloudflare Pages

- Comando de build: `npm run build`
- Directorio de salida: `dist`
- Versión de Node: la indica `.node-version` (22)
