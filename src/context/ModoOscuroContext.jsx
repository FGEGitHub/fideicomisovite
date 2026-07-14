import { createContext, useContext } from "react";

// Paletas de color para la sección nivel6 (Movimientos / resúmenes). Los nombres
// de las claves se mantienen iguales a como se usaban antes de que existiera el
// toggle, para no tener que tocar cada uso individual de color en cada archivo.
export const PALETA_CLARA = {
  MODO: "light",
  COLOR_NAVY: "#083b5c",
  COLOR_TEAL: "#148D8D",
  COLOR_GREEN: "#15803d",
  COLOR_RED: "#dc2626",
  COLOR_RED_SUAVE: "#b3564f",
  COLOR_AMBER: "#c98a3e",
  BG_PAGE: "#f4f7f9",
  BG_CARD: "#ffffff",
  BG_INPUT: "#ffffff",
  BORDER: "rgba(8,59,92,0.06)",
  BORDER_INPUT: "rgba(8,59,92,0.16)",
  TEXT_MUTED: "#64748B",
  TEXT_FUERTE: "#0F172A",
  GRID_STROKE: "#eef2f5",
  SHADOW_CARD: "0 6px 18px rgba(8,59,92,0.07)",
  TOOLTIP_TEXT: "#0F172A",
};

export const PALETA_OSCURA = {
  MODO: "dark",
  COLOR_NAVY: "#4fc3f7",
  COLOR_TEAL: "#20b2b2",
  COLOR_GREEN: "#22c55e",
  COLOR_RED: "#f0554a",
  COLOR_RED_SUAVE: "#e8685c",
  COLOR_AMBER: "#e0a458",
  BG_PAGE: "#0a1e2c",
  BG_CARD: "#122d42",
  BG_INPUT: "#0d2740",
  BORDER: "rgba(255,255,255,0.08)",
  BORDER_INPUT: "rgba(255,255,255,0.18)",
  TEXT_MUTED: "rgba(234,243,247,0.62)",
  TEXT_FUERTE: "#eaf3f7",
  GRID_STROKE: "rgba(234,243,247,0.12)",
  SHADOW_CARD: "0 6px 18px rgba(0,0,0,0.35)",
  TOOLTIP_TEXT: "#eaf3f7",
};

const ModoOscuroContext = createContext({
  oscuro: false,
  toggleOscuro: () => {},
  colores: PALETA_CLARA,
});

export default ModoOscuroContext;

// Hook de conveniencia: devuelve directamente la paleta de colores vigente
// (clara u oscura) según el estado del toggle en menuizq6.jsx.
export const useTemaColores = () => useContext(ModoOscuroContext).colores;

export const useModoOscuro = () => useContext(ModoOscuroContext);
