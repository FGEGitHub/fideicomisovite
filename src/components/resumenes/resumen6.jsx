import React, { useEffect, useState } from "react";
import servicionivel3 from "../../services/nivel3";

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

const COLOR_NAVY = "#083b5c";
const COLOR_TEAL = "#148D8D";
const COLOR_GREEN = "#15803d";
const FONT_FORMAL = "'Helvetica Neue', Helvetica, Arial, sans-serif";
// Paleta solo para "Ingresos por concepto": evita el rojo a propósito,
// porque en el resto del dashboard el rojo significa "egreso".
const PIE_COLORS = [COLOR_GREEN, COLOR_TEAL, "#2aaad1", COLOR_NAVY, "#7c6bb0", "#c98a3e", "#5b8fa3", "#946b53"];
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
              <div style={styles.textoSecundario}>
                Mostrando: {formatearMesLargo(mesSeleccionado)}
              </div>

              <select
                style={selectStyle(isNarrow)}
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
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#eef2f5" />
                  <XAxis type="number" tickFormatter={formatoCompacto} tick={{ fontSize: isNarrow ? 10 : 11, fontFamily: FONT_FORMAL }} />
                  <YAxis
                    type="category"
                    dataKey="concepto"
                    width={isNarrow ? 90 : isMobile ? 110 : 170}
                    tick={{ fontSize: isNarrow ? 10 : 11.5, fontFamily: FONT_FORMAL }}
                  />
                  <Tooltip formatter={(value) => formatoNumero(value)} />
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
            <div style={{ marginBottom: 10 }}>
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
                  <Tooltip formatter={(value) => formatoNumero(value)} />
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
          <div style={filtroWrapStyle(isNarrow)}>
            <div style={filtroGrupoStyle(isNarrow)}>
              <input type="date" style={inputStyle(isNarrow)} value={fechaDesde} onChange={(e) => setFechaDesde(e.target.value)} />
              <input type="date" style={inputStyle(isNarrow)} value={fechaHasta} onChange={(e) => setFechaHasta(e.target.value)} />
            </div>

            <select style={selectStyle(isNarrow)} value={modoVista} onChange={(e) => setModoVista(e.target.value)}>
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
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef2f5" />
                <XAxis dataKey={(d) => d.fecha || d.mes} tick={{ fontSize: isNarrow ? 10 : 11, fontFamily: FONT_FORMAL }} />
                <YAxis tickFormatter={formatoCompacto} tick={{ fontSize: 10, fontFamily: FONT_FORMAL }} width={50} />
                <Tooltip formatter={(value) => formatoNumero(value)} />
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

function SectionCard({ title, subtitle, icon, accent = COLOR_TEAL, isNarrow, children }) {
  return (
    <div style={styles.section}>
      <div style={{ ...styles.sectionHeader, padding: isNarrow ? "14px 14px 12px" : styles.sectionHeader.padding }}>
        {icon && (
          <div style={{ ...styles.sectionIcon, background: `${accent}1a`, color: accent }}>
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

const styles = {

  page: {
    width: "100%",
    minWidth: 0,
    padding: 12,
    boxSizing: "border-box",
    background: "#f4f7f9",
    fontFamily: FONT_FORMAL,
  },

  dashboard: {
    width: "100%",
    minWidth: 0,
    boxSizing: "border-box",
  },

  section: {
    background: "#fff",
    borderRadius: 18,
    marginBottom: 20,
    boxShadow: "0 6px 18px rgba(8,59,92,0.07)",
    border: "1px solid rgba(8,59,92,0.06)",
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
    color: COLOR_NAVY,
  },

  sectionSubtitle: {
    marginTop: 2,
    fontSize: 12,
    color: "#64748B",
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
    color: COLOR_GREEN,
    fontWeight: 600,
    background: "rgba(21, 128, 61, 0.1)",
    padding: "6px 12px",
    borderRadius: 999,
  },

  input: {
    padding: "6px 9px",
    borderRadius: 9,
    border: "1px solid rgba(8,59,92,0.16)",
    fontSize: 12.5,
    fontFamily: FONT_FORMAL,
    color: COLOR_NAVY,
    outline: "none",
  },

  select: {
    padding: "6px 9px",
    borderRadius: 9,
    border: "1px solid rgba(8,59,92,0.16)",
    background: "#fff",
    fontSize: 12.5,
    fontFamily: FONT_FORMAL,
    fontWeight: 500,
    color: COLOR_NAVY,
    outline: "none",
    cursor: "pointer",
  },

};

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

function filtroGrupoStyle(isNarrow) {
  return {
    ...styles.filtroGrupo,
    flexDirection: isNarrow ? "column" : "row",
    alignItems: isNarrow ? "stretch" : "center",
  };
}

function inputStyle(isNarrow) {
  return { ...styles.input, width: isNarrow ? "100%" : undefined, boxSizing: "border-box" };
}

function selectStyle(isNarrow) {
  return { ...styles.select, width: isNarrow ? "100%" : undefined, boxSizing: "border-box" };
}
