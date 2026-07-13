import React, { useEffect, useState } from "react";
import servicionivel3 from "../../services/nivel3";

import TrendingDownIcon from "@mui/icons-material/TrendingDown";
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
const COLOR_RED = "#b3564f";
const FONT_FORMAL = "'Helvetica Neue', Helvetica, Arial, sans-serif";
// Paleta solo para "Egresos por concepto": evita el verde a propósito,
// porque en el resto del dashboard el verde significa "ingreso".
const PIE_COLORS = [COLOR_RED, "#c98a3e", "#2aaad1", COLOR_TEAL, "#7c6bb0", "#5b8fa3", COLOR_NAVY, "#946b53"];
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

export default function DashboardFinanciero() {
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [modoVista, setModoVista] = useState("dia"); // "dia" o "mes"
  const [egresos, setEgresos] = useState([]);
  const [egresosPorConcepto, setEgresosPorConcepto] = useState([]);
  const [datosOriginales, setDatosOriginales] = useState([]);
  const [mesSeleccionado, setMesSeleccionado] = useState("todos");
  const [gastosEvolucion, setGastosEvolucion] = useState([]);
  const [tablaMovimientos, setTablaMovimientos] = useState([]);
  const [tablaDesde, setTablaDesde] = useState("");
  const [tablaHasta, setTablaHasta] = useState("");
  const [tablaModo, setTablaModo] = useState("dia");
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1366
  );

  useEffect(() => {
    const hoy = new Date();

    // 🔥 ir al mes anterior
    const primerDiaMesAnterior = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1);
    const ultimoDiaMesAnterior = new Date(hoy.getFullYear(), hoy.getMonth(), 0);

    // 🔥 formatear a YYYY-MM-DD (input date)
    const format = (fecha) => fecha.toISOString().slice(0, 10);

    setFechaDesde(format(primerDiaMesAnterior));
    setFechaHasta(format(ultimoDiaMesAnterior));
  }, []);
  useEffect(() => {
    traerDatos();
  }, []);

  useEffect(() => {
    const onResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    traerDatos();
  }, [fechaDesde, fechaHasta, modoVista]);

  useEffect(() => {
    traerDatos();
  }, [tablaDesde, tablaHasta, tablaModo]);

  const traerDatos = async () => {
    try {
      const resp = await servicionivel3.traermovimientos();

      setDatosOriginales(resp);

      // ================================
      // 🔴 GASTOS COMPARATIVO
      // ================================
      const gastos1 = calcularGastosComparativo(resp, fechaDesde, fechaHasta);

      setGastosEvolucion(gastos1);

      // ================================
      // 🟡 TABLA MOVIMIENTOS
      // ================================
      const tabla = calcularTabla(resp, tablaDesde, tablaHasta, tablaModo);
      setTablaMovimientos(tabla);
    } catch (error) {
      console.error(error);
    }
  };

  // 🟢 EGRESOS por concepto (ranking + torta), filtrados por mes —
  // mismo criterio y mismo filtro de "mes seleccionado" que usa Ingresos.
  useEffect(() => {
    if (!datosOriginales.length) return;

    const base =
      mesSeleccionado === "todos"
        ? datosOriginales
        : datosOriginales.filter((mov) => {
            const fecha = new Date(mov.fecha);
            const mes = String(fecha.getMonth() + 1).padStart(2, "0");
            const anio = fecha.getFullYear();
            return `${mes}-${anio}` === mesSeleccionado;
          });

    const egresosMap = {};

    base.forEach((mov) => {
      const concepto = mov.concepto || "Sin concepto";
      const debito = Number(mov.debito) || 0;

      if (debito > 0) {
        if (!egresosMap[concepto]) egresosMap[concepto] = 0;
        egresosMap[concepto] += debito;
      }
    });

    const egresosOrdenados = Object.entries(egresosMap)
      .map(([concepto, monto]) => ({ concepto, monto }))
      .sort((a, b) => b.monto - a.monto);

    const egresosArray = egresosOrdenados.slice(0, 10);

    const conceptoArray = egresosOrdenados
      .slice(0, 8)
      .map(({ concepto, monto }) => ({ name: concepto, value: monto }));

    setEgresos(egresosArray);
    setEgresosPorConcepto(conceptoArray);
  }, [mesSeleccionado, datosOriginales]);

  function calcularTabla(resp, desde, hasta, modo) {
    const agrupado = {};

    resp.forEach((mov) => {
      const fecha = new Date(mov.fecha);

      if (desde && fecha < new Date(desde)) return;
      if (hasta && fecha > new Date(hasta)) return;

      let clave;

      if (modo === "dia") {
        clave = fecha.toISOString().slice(0, 10);
      } else {
        clave = fecha.toISOString().slice(0, 7);
      }

      const debito = Number(mov.debito) || 0;
      const credito = Number(mov.credito) || 0;

      if (!agrupado[clave]) {
        agrupado[clave] = {
          debito: 0,
          credito: 0,
        };
      }

      agrupado[clave].debito += debito;
      agrupado[clave].credito += credito;
    });

    return Object.keys(agrupado)
      .sort()
      .map((key) => ({
        fecha: formatearFecha(key),
        debito: agrupado[key].debito,
        credito: agrupado[key].credito,
        saldo: agrupado[key].credito - agrupado[key].debito,
      }));
  }

  function formatearFecha(fechaStr) {
    if (fechaStr.length === 10) {
      // día
      const [anio, mes, dia] = fechaStr.split("-");
      return `${dia}/${mes}`;
    } else {
      // mes
      const [anio, mes] = fechaStr.split("-");
      return `${mes}/${anio}`;
    }
  }

  function calcularGastosComparativo(resp, desde, hasta) {
    const agrupado = {};

    resp.forEach((mov) => {
      const fecha = new Date(mov.fecha);

      if (desde && fecha < new Date(desde)) return;
      if (hasta && fecha > new Date(hasta)) return;

      let clave =
        modoVista === "dia"
          ? fecha.toISOString().slice(0, 10)
          : fecha.toISOString().slice(0, 7);

      const debito = Number(mov.debito) || 0;

      if (debito > 0) {
        if (!agrupado[clave]) agrupado[clave] = 0;
        agrupado[clave] += debito;
      }
    });

    return Object.keys(agrupado)
      .sort()
      .map((key) => ({
        fecha: formatearFecha(key),
        monto: agrupado[key], // ✅ SIN acumulado
      }));
  }

  const mesesDisponibles = [
    ...new Set(
      datosOriginales.map((mov) => {
        const fecha = new Date(mov.fecha);
        const mes = String(fecha.getMonth() + 1).padStart(2, "0");
        const anio = fecha.getFullYear();
        return `${mes}-${anio}`;
      })
    ),
  ];

  const isMobile = windowWidth < 900;
  const isNarrow = windowWidth < 640;

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
          <SectionCard
            title="Principales egresos"
            subtitle="Ranking de conceptos con mayor impacto en los débitos"
            icon={<TrendingDownIcon />}
            accent={COLOR_RED}
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

            <div style={{ flex: 1, minHeight: Math.max(220, egresos.length * 34) }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={egresos}
                  layout="vertical"
                  margin={{ top: 5, right: isNarrow ? 16 : 40, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#eef2f5" />
                  <XAxis type="number" tickFormatter={formatoCompacto} tick={{ fontSize: isNarrow ? 10 : 11, fontFamily: FONT_FORMAL }} />
                  <YAxis
                    type="category"
                    dataKey="concepto"
                    width={isNarrow ? 90 : isMobile ? 110 : 190}
                    tick={{ fontSize: isNarrow ? 10 : 11.5, fontFamily: FONT_FORMAL }}
                  />
                  <Tooltip formatter={(value) => formatoNumero(value)} />
                  <Bar dataKey="monto" radius={[0, 6, 6, 0]}>
                    {egresos.map((entry) => (
                      <Cell key={entry.concepto} fill={COLOR_RED} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>

          <SectionCard
            title="Egresos por concepto"
            subtitle="Distribución de los débitos por concepto"
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
                    data={egresosPorConcepto}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={isNarrow ? 40 : 55}
                    outerRadius={isNarrow ? 65 : 85}
                    paddingAngle={2}
                  >
                    {egresosPorConcepto.map((entry, index) => (
                      <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatoNumero(value)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>
        </div>

        <SectionCard
          title="Evolución de gastos"
          subtitle="Acumulado de egresos en el período"
          icon={<ShowChartIcon />}
          accent={COLOR_RED}
          isNarrow={isNarrow}
        >
          <div style={filtroWrapStyle(isNarrow)}>
            <div style={filtroGrupoStyle(isNarrow)}>
              <span style={styles.filtroLabel}>Período</span>
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
              <ComposedChart data={gastosEvolucion} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="gradGastosResumen2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={COLOR_RED} stopOpacity={0.25} />
                    <stop offset="100%" stopColor={COLOR_RED} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef2f5" />
                <XAxis dataKey="fecha" tick={{ fontSize: 11, fontFamily: FONT_FORMAL }} />
                <YAxis tickFormatter={formatoCompacto} tick={{ fontSize: 10, fontFamily: FONT_FORMAL }} width={50} />
                <Tooltip formatter={(value) => formatoNumero(value)} />
                <Area
                  type="monotone"
                  dataKey="monto"
                  name="Gastos"
                  stroke={COLOR_RED}
                  strokeWidth={2.5}
                  fill="url(#gradGastosResumen2)"
                  dot={{ r: 2.5, fill: COLOR_RED }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

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

  filtroWrap: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
    marginBottom: 14,
  },

  filtroGrupo: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },

  filtroLabel: {
    fontSize: 11.5,
    fontWeight: 600,
    color: "#64748B",
  },

  textoSecundario: {
    fontSize: 12,
    color: COLOR_RED,
    fontWeight: 600,
    background: "rgba(179, 86, 79, 0.1)",
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

  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: 12.5,
    color: "#0F172A",
    minWidth: 300,
  },

  th: {
    textAlign: "left",
    padding: "9px 12px",
    borderBottom: "1px solid #E5E7EB",
    background: "#F8FAFC",
    position: "sticky",
    top: 0,
    zIndex: 1,
    fontSize: 12,
    fontWeight: 700,
    color: COLOR_NAVY,
  },

  td: {
    padding: "9px 12px",
    borderBottom: "1px solid #F1F5F9",
    verticalAlign: "top",
    fontSize: 12.5,
  },

  tdMonto: {
    padding: "9px 12px",
    borderBottom: "1px solid #F1F5F9",
    verticalAlign: "top",
    fontSize: 12.5,
    fontWeight: 700,
    color: COLOR_NAVY,
    whiteSpace: "nowrap",
  },

  tablaScrollContainer: {
    maxHeight: "360px",
    overflowY: "auto",
    overflowX: "auto",
    padding: 10,
    boxSizing: "border-box",
    background: "#fff",
    borderRadius: 14,
    border: "1px solid rgba(148,163,184,0.14)",
  },
};

// Helpers responsive: en pantallas angostas los filtros se apilan en columna
// y los inputs ocupan todo el ancho, en vez de amontonarse en una fila.
function filtroWrapStyle(isNarrow) {
  return {
    ...styles.filtroWrap,
    flexDirection: isNarrow ? "column" : "row",
    alignItems: isNarrow ? "stretch" : "center",
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
