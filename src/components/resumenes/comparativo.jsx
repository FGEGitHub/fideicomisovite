import React, { useEffect, useMemo, useState } from "react";
import servicionivel3 from "../../services/nivel3";
import { useTemaColores } from "../../context/ModoOscuroContext";
import { parseFechaCorta, deduplicarMovimientos } from "./movimientosUtils";

import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import BarChartIcon from "@mui/icons-material/BarChart";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import ClearIcon from "@mui/icons-material/Clear";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  ComposedChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

const FONT_FORMAL = "'Helvetica Neue', Helvetica, Arial, sans-serif";

const MESES_CORTOS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
const MESES_LARGOS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];
// Mismo criterio que usa el filtro "Año" de la tabla de Movimientos.
const ANIOS_DISPONIBLES = ["2023", "2024", "2025", "2026"];

const formatoNumero = (valor) => "$" + Math.round(Number(valor) || 0).toLocaleString("es-AR");

const formatoCompacto = (valor) =>
  new Intl.NumberFormat("es-AR", { notation: "compact", maximumFractionDigits: 1 }).format(
    Number(valor) || 0
  );

const FILTROS_INICIALES_SECCION = { anio: "", mes: "", concepto: "" };

const crearEstilos = (c) => ({
  page: {
    fontFamily: FONT_FORMAL,
    padding: 18,
    minHeight: "100vh",
    boxSizing: "border-box",
    background: c.BG_PAGE,
  },

  section: {
    background: c.BG_CARD,
    borderRadius: 18,
    marginBottom: 22,
    boxShadow: c.SHADOW_CARD,
    border: `1px solid ${c.BORDER}`,
    overflow: "hidden",
  },

  sectionHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    padding: "18px 22px 14px",
    flexWrap: "wrap",
  },

  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    minWidth: 0,
  },

  sectionIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  sectionTitle: {
    margin: 0,
    fontSize: 17,
    fontWeight: 700,
    color: c.TEXT_FUERTE,
  },

  sectionSubtitle: {
    marginTop: 2,
    fontSize: 12.5,
    color: c.TEXT_MUTED,
    fontWeight: 500,
  },

  sectionBody: {
    padding: "0 22px 22px",
  },

  filtrosBar: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
    gap: 10,
    marginBottom: 18,
  },

  select: {
    padding: "9px 12px",
    borderRadius: 10,
    border: `1px solid ${c.BORDER_INPUT}`,
    background: c.BG_INPUT,
    fontSize: 13,
    fontFamily: FONT_FORMAL,
    fontWeight: 500,
    color: c.COLOR_NAVY,
    colorScheme: c.MODO,
    outline: "none",
    cursor: "pointer",
    width: "100%",
    boxSizing: "border-box",
  },

  limpiarBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    fontSize: 12,
    fontWeight: 700,
    background: "transparent",
    border: "none",
    cursor: "pointer",
    padding: "4px 0",
  },

  chips: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
    gap: 12,
    marginBottom: 18,
  },

  chip: {
    background: c.BG_INPUT,
    borderRadius: 14,
    padding: "12px 14px",
    display: "flex",
    alignItems: "center",
    gap: 10,
    border: `1px solid ${c.BORDER}`,
    minWidth: 0,
  },

  chipIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  chipLabel: {
    fontSize: 10.5,
    fontWeight: 700,
    color: c.TEXT_MUTED,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },

  chipValue: {
    fontSize: 15,
    fontWeight: 800,
    color: c.TEXT_FUERTE,
    lineHeight: 1.25,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },

  grid2: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: 16,
    marginBottom: 16,
  },

  chartCard: {
    background: c.BG_INPUT,
    borderRadius: 16,
    padding: 16,
    border: `1px solid ${c.BORDER}`,
  },

  chartTitulo: {
    fontSize: 13,
    fontWeight: 700,
    color: c.TEXT_FUERTE,
    marginBottom: 10,
  },

  sinDatos: {
    textAlign: "center",
    padding: "34px 12px",
    color: c.TEXT_MUTED,
    fontSize: 13,
    fontWeight: 500,
  },
});

export default function ComparativoIngresosEgresos() {
  const [movimientos, setMovimientos] = useState([]);
  const [loading, setLoading] = useState(true);
  const colores = useTemaColores();
  const styles = crearEstilos(colores);

  useEffect(() => {
    let cancelado = false;

    (async () => {
      try {
        setLoading(true);
        const resp = await servicionivel3.traermovimientos();
        if (cancelado) return;
        setMovimientos(deduplicarMovimientos(Array.isArray(resp) ? resp : []));
      } catch (error) {
        console.error(error);
      } finally {
        if (!cancelado) setLoading(false);
      }
    })();

    return () => {
      cancelado = true;
    };
  }, []);

  return (
    <div style={styles.page}>
      <SeccionTipo
        tipo="INGRESO"
        titulo="Ingresos"
        subtitulo="Créditos recibidos — filtrá por año, mes o concepto"
        icono={<TrendingUpIcon />}
        campoMonto="credito"
        colorAccent={colores.COLOR_GREEN}
        movimientos={movimientos}
        loading={loading}
      />

      <SeccionTipo
        tipo="EGRESO"
        titulo="Egresos"
        subtitulo="Débitos realizados — filtrá por año, mes o concepto"
        icono={<TrendingDownIcon />}
        campoMonto="debito"
        colorAccent={colores.COLOR_RED}
        movimientos={movimientos}
        loading={loading}
      />
    </div>
  );
}

function SeccionTipo({ tipo, titulo, subtitulo, icono, campoMonto, colorAccent, movimientos, loading }) {
  const colores = useTemaColores();
  const styles = crearEstilos(colores);

  const [filtros, setFiltros] = useState(FILTROS_INICIALES_SECCION);

  // Solo los movimientos de este tipo (créditos para Ingresos, débitos para Egresos).
  const movimientosTipo = useMemo(
    () => movimientos.filter((m) => Number(m[campoMonto]) > 0),
    [movimientos, campoMonto]
  );

  const conceptosDisponibles = useMemo(
    () => [...new Set(movimientosTipo.map((m) => m.concepto).filter(Boolean))].sort((a, b) => a.localeCompare(b, "es")),
    [movimientosTipo]
  );

  const filtrados = useMemo(
    () =>
      movimientosTipo.filter((m) => {
        const f = parseFechaCorta(m.fecha);
        const coincideAnio = !filtros.anio || f.anio === filtros.anio;
        const coincideMes = !filtros.mes || f.mes === filtros.mes;
        const coincideConcepto = !filtros.concepto || (m.concepto || "") === filtros.concepto;
        return coincideAnio && coincideMes && coincideConcepto;
      }),
    [movimientosTipo, filtros]
  );

  const total = useMemo(
    () => filtrados.reduce((acc, m) => acc + Number(m[campoMonto] || 0), 0),
    [filtrados, campoMonto]
  );
  const cantidad = filtrados.length;
  const promedio = cantidad ? total / cantidad : 0;

  const porConcepto = useMemo(() => {
    const mapa = {};
    filtrados.forEach((m) => {
      const concepto = m.concepto || "Sin concepto";
      mapa[concepto] = (mapa[concepto] || 0) + Number(m[campoMonto] || 0);
    });
    return Object.entries(mapa)
      .map(([concepto, monto]) => ({ concepto, monto }))
      .sort((a, b) => b.monto - a.monto);
  }, [filtrados, campoMonto]);

  const rankingData = porConcepto.slice(0, 8);

  const donutData = useMemo(() => {
    const principales = porConcepto.slice(0, 6);
    const resto = porConcepto.slice(6);
    const datos = principales.map((p) => ({ name: p.concepto, value: p.monto }));
    if (resto.length) {
      datos.push({ name: "Otros", value: resto.reduce((acc, p) => acc + p.monto, 0) });
    }
    return datos;
  }, [porConcepto]);

  // Evolución en el tiempo: siempre agrupada por mes (respeta Año y Concepto si
  // están elegidos). Si no hay Año seleccionado, muestra la línea de tiempo
  // completa mes a mes de todos los años cargados, en vez de colapsar todo a
  // un total por año (con un solo año de datos ese gráfico no decía nada).
  const evolucionData = useMemo(() => {
    const base = movimientosTipo.filter((m) => !filtros.concepto || (m.concepto || "") === filtros.concepto);
    const scoped = filtros.anio ? base.filter((m) => parseFechaCorta(m.fecha).anio === filtros.anio) : base;

    const agrupado = {};
    scoped.forEach((m) => {
      const f = parseFechaCorta(m.fecha);
      if (!f.anio || f.anio === "-") return;
      const mesPad = String(f.mes).padStart(2, "0");
      const clave = `${f.anio}-${mesPad}`;
      agrupado[clave] = (agrupado[clave] || 0) + Number(m[campoMonto] || 0);
    });

    const claves = Object.keys(agrupado).sort();
    const variosAnios = new Set(claves.map((clave) => clave.split("-")[0])).size > 1;

    return claves.map((clave) => {
      const [anio, mes] = clave.split("-");
      const nombreMes = MESES_CORTOS[Number(mes) - 1] || mes;
      return {
        label: variosAnios ? `${nombreMes} '${anio.slice(-2)}` : nombreMes,
        monto: agrupado[clave],
      };
    });
  }, [movimientosTipo, filtros.anio, filtros.concepto, campoMonto]);

  const filtrosActivos = Boolean(filtros.anio || filtros.mes || filtros.concepto);
  const limpiarFiltros = () => setFiltros(FILTROS_INICIALES_SECCION);

  const paletaDonut = [colorAccent, colores.COLOR_TEAL, "#2aaad1", colores.COLOR_AMBER, "#9b8bd4", "#7db8cf", colores.COLOR_NAVY];

  const tooltipSx = {
    contentStyle: { backgroundColor: colores.BG_CARD, border: `1px solid ${colores.BORDER}`, borderRadius: 10, color: colores.TOOLTIP_TEXT },
    labelStyle: { color: colores.TOOLTIP_TEXT },
    itemStyle: { color: colores.TOOLTIP_TEXT },
  };

  return (
    <div style={styles.section}>
      <div style={styles.sectionHeader}>
        <div style={styles.headerLeft}>
          <div style={{ ...styles.sectionIcon, background: `${colorAccent}1a`, color: colorAccent }}>
            {icono}
          </div>
          <div style={{ minWidth: 0 }}>
            <h3 style={styles.sectionTitle}>{titulo}</h3>
            <div style={styles.sectionSubtitle}>{subtitulo}</div>
          </div>
        </div>

        {filtrosActivos && (
          <button style={{ ...styles.limpiarBtn, color: colorAccent }} onClick={limpiarFiltros}>
            <ClearIcon sx={{ fontSize: 15 }} /> Limpiar filtros
          </button>
        )}
      </div>

      <div style={styles.sectionBody}>
        <div style={styles.filtrosBar}>
          <select
            style={styles.select}
            value={filtros.anio}
            onChange={(e) => setFiltros((prev) => ({ ...prev, anio: e.target.value }))}
          >
            <option value="">Todos los años</option>
            {ANIOS_DISPONIBLES.map((anio) => (
              <option key={anio} value={anio}>{anio}</option>
            ))}
          </select>

          <select
            style={styles.select}
            value={filtros.mes}
            onChange={(e) => setFiltros((prev) => ({ ...prev, mes: e.target.value }))}
          >
            <option value="">Todos los meses</option>
            {MESES_LARGOS.map((nombre, i) => {
              const valor = String(i + 1).padStart(2, "0");
              return <option key={valor} value={valor}>{nombre}</option>;
            })}
          </select>

          <select
            style={styles.select}
            value={filtros.concepto}
            onChange={(e) => setFiltros((prev) => ({ ...prev, concepto: e.target.value }))}
          >
            <option value="">Todos los conceptos</option>
            {conceptosDisponibles.map((concepto) => (
              <option key={concepto} value={concepto}>{concepto}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div style={styles.sinDatos}>Cargando...</div>
        ) : filtrados.length === 0 ? (
          <div style={styles.sinDatos}>
            No hay {tipo === "INGRESO" ? "ingresos" : "egresos"} para los filtros seleccionados.
          </div>
        ) : (
          <>
            <div style={styles.chips}>
              <ChipInfo
                icon={<ReceiptLongIcon sx={{ fontSize: 18 }} />}
                color={colorAccent}
                label={tipo === "INGRESO" ? "Total ingresado" : "Total egresado"}
                valor={formatoNumero(total)}
                styles={styles}
              />
              <ChipInfo
                icon={<BarChartIcon sx={{ fontSize: 18 }} />}
                color={colores.COLOR_TEAL}
                label="Movimientos"
                valor={cantidad}
                styles={styles}
              />
              <ChipInfo
                icon={<ShowChartIcon sx={{ fontSize: 18 }} />}
                color={colores.COLOR_NAVY}
                label="Promedio por movimiento"
                valor={formatoNumero(promedio)}
                styles={styles}
              />
            </div>

            <div style={styles.grid2}>
              <div style={styles.chartCard}>
                <div style={styles.chartTitulo}>Principales conceptos</div>
                <div style={{ height: Math.max(200, rankingData.length * 30) }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={rankingData} layout="vertical" margin={{ top: 5, right: 24, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={colores.GRID_STROKE} />
                      <XAxis type="number" tickFormatter={formatoCompacto} tick={{ fontSize: 11, fontFamily: FONT_FORMAL, fill: colores.TEXT_MUTED }} />
                      <YAxis type="category" dataKey="concepto" width={140} tick={{ fontSize: 11, fontFamily: FONT_FORMAL, fill: colores.TEXT_MUTED }} />
                      <Tooltip formatter={(v) => formatoNumero(v)} {...tooltipSx} />
                      <Bar dataKey="monto" radius={[0, 6, 6, 0]}>
                        {rankingData.map((entry) => (
                          <Cell key={entry.concepto} fill={colorAccent} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div style={styles.chartCard}>
                <div style={styles.chartTitulo}>Distribución por concepto</div>
                <div style={{ height: 240 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={donutData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2}>
                        {donutData.map((entry, i) => (
                          <Cell key={entry.name} fill={paletaDonut[i % paletaDonut.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v) => formatoNumero(v)} {...tooltipSx} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div style={styles.chartCard}>
              <div style={styles.chartTitulo}>
                {filtros.anio ? `Evolución mensual — ${filtros.anio}` : "Evolución mensual"}
              </div>
              {evolucionData.length === 0 ? (
                <div style={styles.sinDatos}>Sin datos para mostrar</div>
              ) : (
                <div style={{ height: 240 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={evolucionData} margin={{ top: 10, right: 16, left: 0, bottom: 5 }}>
                      <defs>
                        <linearGradient id={`gradEvolucion${tipo}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={colorAccent} stopOpacity={0.28} />
                          <stop offset="100%" stopColor={colorAccent} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={colores.GRID_STROKE} />
                      <XAxis dataKey="label" tick={{ fontSize: 11, fontFamily: FONT_FORMAL, fill: colores.TEXT_MUTED }} />
                      <YAxis tickFormatter={formatoCompacto} tick={{ fontSize: 11, fontFamily: FONT_FORMAL, fill: colores.TEXT_MUTED }} width={55} />
                      <Tooltip formatter={(v) => formatoNumero(v)} {...tooltipSx} />
                      <Area
                        type="monotone"
                        dataKey="monto"
                        stroke={colorAccent}
                        strokeWidth={2.5}
                        fill={`url(#gradEvolucion${tipo})`}
                        dot={{ r: 3, fill: colorAccent }}
                        activeDot={{ r: 5 }}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ChipInfo({ icon, color, label, valor, styles }) {
  return (
    <div style={styles.chip}>
      <div style={{ ...styles.chipIcon, background: `${color}1a`, color }}>{icon}</div>
      <div style={{ minWidth: 0 }}>
        <div style={styles.chipLabel}>{label}</div>
        <div style={styles.chipValue}>{valor}</div>
      </div>
    </div>
  );
}
