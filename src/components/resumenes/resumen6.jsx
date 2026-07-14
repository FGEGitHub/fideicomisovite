import React, { useEffect, useState } from "react";
import servicionivel3 from "../../services/nivel3";
import { useTemaColores } from "../../context/ModoOscuroContext";

import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";

import {
  ResponsiveContainer,
  ComposedChart,
  BarChart,
  Bar,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  PieChart,
  Pie,
} from "recharts";

const FONT_FORMAL = "'Helvetica Neue', Helvetica, Arial, sans-serif";
// Paleta solo para "Ingresos por concepto": evita el rojo a propósito,
// porque en el resto del dashboard el rojo significa "egreso".
const crearPieColors = (c) => [c.COLOR_GREEN, c.COLOR_TEAL, "#2aaad1", c.COLOR_NAVY, "#9b8bd4", "#e0a458", "#7db8cf", "#c08a6e"];

const MESES_LARGOS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

const formatoNumero = (valor) => "$" + Math.round(Number(valor) || 0).toLocaleString("es-AR");

const formatoCompacto = (valor) =>
  new Intl.NumberFormat("es-AR", { notation: "compact", maximumFractionDigits: 1 }).format(
    Number(valor) || 0
  );

// "07-2026" -> "Julio 2026" (el mesSeleccionado usa formato mes-año)
const formatearMesLargo = (clave) => {
  if (!clave || clave === "todos") return "Todos los meses";
  const [mes, anio] = clave.split("-");
  return `${MESES_LARGOS[Number(mes) - 1] || mes} ${anio}`;
};

export default function DashboardIngresos() {
  const colores = useTemaColores();
  const { COLOR_NAVY, COLOR_TEAL, COLOR_GREEN, GRID_STROKE, TEXT_MUTED, BG_CARD, BORDER, TOOLTIP_TEXT } = colores;
  const styles = crearEstilos(colores);
  const PIE_COLORS = crearPieColors(colores);

  // =====================================================
  // STATES
  // =====================================================

  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [modoVista, setModoVista] = useState("mes");

  const [principalesIngresos, setPrincipalesIngresos] = useState([]);
  const [ingresosPorConcepto, setIngresosPorConcepto] = useState([]);
  const [evolucionIngresos, setEvolucionIngresos] = useState([]);
const [datosOriginales, setDatosOriginales] = useState([]);
const [mesSeleccionado, setMesSeleccionado] = useState("todos");
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined"
      ? window.innerWidth
      : 1366
  );

  // =====================================================
  // FECHAS DEFAULT
  // =====================================================

  useEffect(() => {

    const hoy = new Date();

    const primerDiaMesAnterior = new Date(
      hoy.getFullYear(),
      hoy.getMonth() - 1,
      1
    );

    const ultimoDiaMesAnterior = new Date(
      hoy.getFullYear(),
      hoy.getMonth(),
      0
    );

    const format = (fecha) =>
      fecha.toISOString().slice(0, 10);

    setFechaDesde(format(primerDiaMesAnterior));
    setFechaHasta(format(ultimoDiaMesAnterior));

  }, []);

  // =====================================================
  // RESIZE
  // =====================================================

  useEffect(() => {

    const onResize = () =>
      setWindowWidth(window.innerWidth);

    window.addEventListener("resize", onResize);

    return () =>
      window.removeEventListener("resize", onResize);

  }, []);

  // =====================================================
  // TRAER DATOS
  // =====================================================

useEffect(() => {

  traerDatos();

}, [modoVista]);

const traerDatos = async () => {

  try {

    const resp =
      await servicionivel3.traeringresos();

    setDatosOriginales(
      resp.movimientos || []
    );

    setPrincipalesIngresos(
      resp.principalesIngresos || []
    );

    if (modoVista === "mes") {

      setEvolucionIngresos(
        resp.ingresosPorMes || []
      );

    } else {

      setEvolucionIngresos(
        resp.ingresosPorDia || []
      );

    }

  } catch (error) {

    console.log(error);

  }

};

useEffect(() => {

  if (!datosOriginales.length) return;

  // =====================================================
  // TODOS
  // =====================================================

  if (mesSeleccionado === "todos") {

    const conceptosMap = {};

    datosOriginales.forEach((mov) => {

      const concepto =
        mov.concepto || "Sin concepto";

      const monto =
        Number(mov.credito) || 0;

      if (!conceptosMap[concepto]) {

        conceptosMap[concepto] = 0;

      }

      conceptosMap[concepto] += monto;

    });

    const ingresosOrdenados =
      Object.entries(conceptosMap)
        .map(([concepto, monto]) => ({
          concepto,
          monto
        }))
        .sort((a, b) => b.monto - a.monto);

    const ranking = ingresosOrdenados.slice(0, 10);

    const conceptos = ingresosOrdenados
      .slice(0, 8)
      .map(({ concepto, monto }) => ({ name: concepto, value: monto }));

    setPrincipalesIngresos(ranking);
    setIngresosPorConcepto(conceptos);

    return;

  }

  // =====================================================
  // FILTRADO POR MES
  // =====================================================

  const filtrados =
    datosOriginales.filter((mov) => {

      const fecha =
        new Date(mov.fecha);

      const mes =
        String(fecha.getMonth() + 1)
          .padStart(2, "0");

      const anio =
        fecha.getFullYear();

      const key =
        `${mes}-${anio}`;

      return key === mesSeleccionado;

    });

  const conceptosMap = {};

  filtrados.forEach((mov) => {

    const concepto =
      mov.concepto || "Sin concepto";

    const monto =
      Number(mov.credito) || 0;

    if (!conceptosMap[concepto]) {

      conceptosMap[concepto] = 0;

    }

    conceptosMap[concepto] += monto;

  });

  const ingresosOrdenados =
    Object.entries(conceptosMap)
      .map(([concepto, monto]) => ({
        concepto,
        monto
      }))
      .sort((a, b) => b.monto - a.monto);

  const ranking = ingresosOrdenados.slice(0, 10);

  const conceptos = ingresosOrdenados
    .slice(0, 8)
    .map(({ concepto, monto }) => ({ name: concepto, value: monto }));

  setPrincipalesIngresos(ranking);
  setIngresosPorConcepto(conceptos);

}, [mesSeleccionado, datosOriginales]);

  // =====================================================
  // HELPERS
  // =====================================================
const mesesDisponibles = [
  ...new Set(

    datosOriginales.map((mov) => {

      const fecha =
        new Date(mov.fecha);

      const mes =
        String(fecha.getMonth() + 1)
          .padStart(2, "0");

      const anio =
        fecha.getFullYear();

      return `${mes}-${anio}`;

    })

  )
];

  // =====================================================
  // MOBILE
  // =====================================================

  const isMobile = windowWidth < 900;
  const isNarrow = windowWidth < 640;

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div style={{ ...styles.page, padding: isNarrow ? 8 : 12 }}>

      <div style={styles.dashboard}>

        <div
          style={{
            ...styles.grid,
            gridTemplateColumns: isMobile ? "1fr" : "1.3fr 1fr",
            marginBottom: 20,
          }}
        >
          {/* PRINCIPALES INGRESOS */}
          <SectionCard
            title="Principales ingresos"
            subtitle="Ranking de conceptos con mayor impacto en los créditos"
            icon={<TrendingUpIcon />}
            accent={COLOR_GREEN}
            isNarrow={isNarrow}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
             

              <select
                style={selectStyle(isNarrow, styles)}
                value={mesSeleccionado}
                onChange={(e) => setMesSeleccionado(e.target.value)}
              >
                <option value="todos">Todos los meses</option>
                {mesesDisponibles.map((mes) => (
                  <option key={mes} value={mes}>{mes}</option>
                ))}
              </select>
            </div>

            <div style={{ flex: 1, minHeight: Math.max(220, principalesIngresos.length * 30) }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={principalesIngresos}
                  layout="vertical"
                  margin={{ top: 5, right: isNarrow ? 16 : 40, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={GRID_STROKE} />
                  <XAxis type="number" tickFormatter={formatoCompacto} tick={{ fontSize: isNarrow ? 10 : 11, fontFamily: FONT_FORMAL, fill: TEXT_MUTED }} />
                  <YAxis
                    type="category"
                    dataKey="concepto"
                    width={isNarrow ? 90 : isMobile ? 110 : 170}
                    tick={{ fontSize: isNarrow ? 10 : 11.5, fontFamily: FONT_FORMAL, fill: TEXT_MUTED }}
                  />
                  <Tooltip
                    formatter={(value) => formatoNumero(value)}
                    contentStyle={{ background: BG_CARD, border: `1px solid ${BORDER}`, borderRadius: 10, color: TOOLTIP_TEXT }}
                    labelStyle={{ color: TOOLTIP_TEXT }}
                  />
                  <Bar dataKey="monto" radius={[0, 6, 6, 0]}>
                    {principalesIngresos.map((entry) => (
                      <Cell key={entry.concepto} fill={COLOR_GREEN} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>

          {/* INGRESOS POR CONCEPTO */}
          <SectionCard
            title="Ingresos por concepto"
            subtitle="Distribución de los créditos por concepto"
            icon={<ReceiptLongIcon />}
            accent={COLOR_NAVY}
            isNarrow={isNarrow}
          >
            <div style={{ marginBottom: 10, display: "flex", justifyContent: "flex-end" }}>
              <div style={styles.textoSecundario}>
                Mostrando: {formatearMesLargo(mesSeleccionado)}
              </div>
            </div>

            <div style={{ flex: 1, minHeight: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={ingresosPorConcepto}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={isNarrow ? 40 : 55}
                    outerRadius={isNarrow ? 65 : 85}
                    paddingAngle={2}
                  >
                    {ingresosPorConcepto.map((entry, index) => (
                      <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => formatoNumero(value)}
                    contentStyle={{ background: BG_CARD, border: `1px solid ${BORDER}`, borderRadius: 10, color: TOOLTIP_TEXT }}
                    labelStyle={{ color: TOOLTIP_TEXT }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>
        </div>

        {/* EVOLUCION */}
        <SectionCard
          title="Evolución de ingresos"
          subtitle="Comportamiento de ingresos en el tiempo"
          icon={<ShowChartIcon />}
          accent={COLOR_TEAL}
          isNarrow={isNarrow}
        >
          <div style={filtroWrapStyle(isNarrow, styles)}>
            <div style={filtroGrupoStyle(isNarrow, styles)}>
              <input type="date" style={inputStyle(isNarrow, styles)} value={fechaDesde} onChange={(e) => setFechaDesde(e.target.value)} />
              <input type="date" style={inputStyle(isNarrow, styles)} value={fechaHasta} onChange={(e) => setFechaHasta(e.target.value)} />
            </div>

            <select style={selectStyle(isNarrow, styles)} value={modoVista} onChange={(e) => setModoVista(e.target.value)}>
              <option value="dia">Por día</option>
              <option value="mes">Por mes</option>
            </select>
          </div>

          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={evolucionIngresos} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="gradIngresosResumen6" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={COLOR_TEAL} stopOpacity={0.28} />
                    <stop offset="100%" stopColor={COLOR_TEAL} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={GRID_STROKE} />
                <XAxis dataKey={(d) => d.fecha || d.mes} tick={{ fontSize: isNarrow ? 10 : 11, fontFamily: FONT_FORMAL, fill: TEXT_MUTED }} />
                <YAxis tickFormatter={formatoCompacto} tick={{ fontSize: 10, fontFamily: FONT_FORMAL, fill: TEXT_MUTED }} width={50} />
                <Tooltip
                  formatter={(value) => formatoNumero(value)}
                  contentStyle={{ background: BG_CARD, border: `1px solid ${BORDER}`, borderRadius: 10, color: TOOLTIP_TEXT }}
                  labelStyle={{ color: TOOLTIP_TEXT }}
                />
                <Area
                  type="monotone"
                  dataKey="total"
                  name="Ingresos"
                  stroke={COLOR_TEAL}
                  strokeWidth={2.5}
                  fill="url(#gradIngresosResumen6)"
                  dot={{ r: 2.5, fill: COLOR_TEAL }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

      </div>

    </div>
  );
}

// =====================================================
// COMPONENTES
// =====================================================

function SectionCard({ title, subtitle, icon, accent, isNarrow, children }) {
  const colores = useTemaColores();
  const styles = crearEstilos(colores);
  const accentColor = accent || colores.COLOR_TEAL;

  return (
    <div style={styles.section}>
      <div style={{ ...styles.sectionHeader, padding: isNarrow ? "14px 14px 12px" : styles.sectionHeader.padding }}>
        {icon && (
          <div style={{ ...styles.sectionIcon, background: `${accentColor}1a`, color: accentColor }}>
            {icon}
          </div>
        )}
        <div style={{ minWidth: 0 }}>
          <h3 style={styles.sectionTitle}>{title}</h3>
          {subtitle && <div style={styles.sectionSubtitle}>{subtitle}</div>}
        </div>
      </div>

      <div style={{ ...styles.sectionBody, padding: isNarrow ? "0 14px 16px" : styles.sectionBody.padding }}>
        {children}
      </div>
    </div>
  );
}

// =====================================================
// STYLES
// =====================================================

const crearEstilos = (c) => ({

  page: {
    width: "100%",
    minWidth: 0,
    padding: 12,
    boxSizing: "border-box",
    background: c.BG_PAGE,
    fontFamily: FONT_FORMAL,
  },

  dashboard: {
    width: "100%",
    minWidth: 0,
    boxSizing: "border-box",
  },

  section: {
    background: c.BG_CARD,
    borderRadius: 18,
    marginBottom: 20,
    boxShadow: c.SHADOW_CARD,
    border: `1px solid ${c.BORDER}`,
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  },

  sectionHeader: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "18px 20px 14px",
  },

  sectionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  sectionTitle: {
    margin: 0,
    fontSize: 16,
    fontWeight: 700,
    color: c.COLOR_NAVY,
  },

  sectionSubtitle: {
    marginTop: 2,
    fontSize: 12,
    color: c.TEXT_MUTED,
    fontWeight: 500,
  },

  sectionBody: {
    padding: "0 20px 20px",
    flex: 1,
    display: "flex",
    flexDirection: "column",
    minHeight: 0,
  },

  grid: {
    display: "grid",
    gap: 20,
    alignItems: "stretch",
  },

  filtroGrupo: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },

  textoSecundario: {
    fontSize: 12,
    color: c.COLOR_GREEN,
    fontWeight: 600,
    background: `${c.COLOR_GREEN}22`,
    padding: "6px 12px",
    borderRadius: 999,
  },

  input: {
    padding: "6px 9px",
    borderRadius: 9,
    border: `1px solid ${c.BORDER_INPUT}`,
    fontSize: 12.5,
    fontFamily: FONT_FORMAL,
    color: c.COLOR_NAVY,
    background: c.BG_INPUT,
    colorScheme: c.MODO,
    outline: "none",
  },

  select: {
    padding: "6px 9px",
    borderRadius: 9,
    border: `1px solid ${c.BORDER_INPUT}`,
    background: c.BG_INPUT,
    fontSize: 12.5,
    fontFamily: FONT_FORMAL,
    fontWeight: 500,
    color: c.COLOR_NAVY,
    colorScheme: c.MODO,
    outline: "none",
    cursor: "pointer",
  },

});

function filtroWrapStyle(isNarrow) {
  return {
    display: "flex",
    justifyContent: "space-between",
    alignItems: isNarrow ? "stretch" : "center",
    flexDirection: isNarrow ? "column" : "row",
    gap: 10,
    flexWrap: "wrap",
    marginBottom: 14,
  };
}

function filtroGrupoStyle(isNarrow, styles) {
  return {
    ...styles.filtroGrupo,
    flexDirection: isNarrow ? "column" : "row",
    alignItems: isNarrow ? "stretch" : "center",
  };
}

function inputStyle(isNarrow, styles) {
  return { ...styles.input, width: isNarrow ? "100%" : undefined, boxSizing: "border-box" };
}

function selectStyle(isNarrow, styles) {
  return { ...styles.select, width: isNarrow ? "100%" : undefined, boxSizing: "border-box" };
}
