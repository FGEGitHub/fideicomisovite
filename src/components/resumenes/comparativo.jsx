import React, { useEffect, useMemo, useState } from "react";
import servicionivel3 from "../../services/nivel3";
import { useTemaColores } from "../../context/ModoOscuroContext";
import { parseFechaCorta } from "./movimientosUtils";

import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import ClearIcon from "@mui/icons-material/Clear";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  ComposedChart,
  Area,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

const FONT_FORMAL = "'Helvetica Neue', Helvetica, Arial, sans-serif";

const MESES_CORTOS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
// Mismo criterio que usa el filtro "Año" de la tabla de Movimientos.
const ANIOS_DISPONIBLES = ["2023", "2024", "2025", "2026"];

const formatoNumero = (valor) => "$" + Math.round(Number(valor) || 0).toLocaleString("es-AR");

const formatoCompacto = (valor) =>
  new Intl.NumberFormat("es-AR", { notation: "compact", maximumFractionDigits: 1 }).format(
    Number(valor) || 0
  );

// Número completo (sin abreviar, sin "$") para columnas angostas de la tabla concepto x mes.
const formatoEntero = (valor) => Math.round(Number(valor) || 0).toLocaleString("es-AR");

const FILTROS_INICIALES_SECCION = { anio: "", concepto: "" };

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

  filaGraficos: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
    gap: 16,
  },

  graficosApilados: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
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

  tablaWrap: {
    overflowX: "auto",
    borderRadius: 12,
    border: `1px solid ${c.BORDER}`,
  },

  tabla: {
    borderCollapse: "collapse",
    width: "100%",
    tableLayout: "fixed",
    fontSize: 9.5,
    fontFamily: FONT_FORMAL,
  },

  th: {
    padding: "5px 2px",
    fontWeight: 800,
    fontSize: 9.5,
    color: c.TEXT_FUERTE,
    background: c.BG_INPUT,
    borderBottom: `2px solid ${c.COLOR_TEAL}`,
    whiteSpace: "nowrap",
    textAlign: "right",
  },

  thConcepto: {
    textAlign: "left",
    width: "9%",
  },

  td: {
    padding: "3px 2px",
    textAlign: "right",
    border: `1px solid ${c.BORDER}`,
    color: c.TEXT_FUERTE,
  },

  tdConcepto: {
    textAlign: "left",
    fontWeight: 600,
    whiteSpace: "normal",
    wordBreak: "break-word",
    lineHeight: 1.2,
  },

  tdVacia: {
    color: c.TEXT_MUTED,
    fontWeight: 400,
  },

  filaTotal: {
    fontWeight: 800,
  },
});

// Toda la data derivada (filtrada, agrupada por concepto, pivote concepto x mes,
// evolución mensual) para un tipo (INGRESO/EGRESO), a partir del mismo estado de
// filtros — así la tabla y los gráficos de ese tipo siempre muestran lo mismo.
function useDatosTipo(movimientos, campoMonto) {
  const [filtros, setFiltros] = useState(FILTROS_INICIALES_SECCION);

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
        const coincideConcepto = !filtros.concepto || (m.concepto || "") === filtros.concepto;
        return coincideAnio && coincideConcepto;
      }),
    [movimientosTipo, filtros]
  );

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

  // Año que se muestra en la tabla concepto x mes: el que esté elegido en el
  // filtro; si no hay ninguno elegido, el año más reciente que tenga datos
  // cargados (o el año actual si todavía no hay nada).
  const aniosConDatos = useMemo(
    () => [...new Set(movimientosTipo.map((m) => parseFechaCorta(m.fecha).anio).filter((a) => a && a !== "-"))].sort(),
    [movimientosTipo]
  );
  const anioPivote = filtros.anio || aniosConDatos[aniosConDatos.length - 1] || String(new Date().getFullYear());

  // Tabla concepto x mes: cada concepto es una fila, cada mes una columna,
  // siempre los 12 meses del año elegido (aunque no tengan datos todavía),
  // sin colapsar en totales trimestrales.
  const pivoteConceptoMes = useMemo(() => {
    const base = movimientosTipo.filter((m) => {
      const f = parseFechaCorta(m.fecha);
      const coincideAnio = f.anio === anioPivote;
      const coincideConcepto = !filtros.concepto || (m.concepto || "") === filtros.concepto;
      return coincideAnio && coincideConcepto;
    });

    const mapa = {};
    const totalesPorMes = Array(12).fill(0);

    base.forEach((m) => {
      const f = parseFechaCorta(m.fecha);
      const mesIdx = Number(f.mes) - 1;
      if (Number.isNaN(mesIdx) || mesIdx < 0 || mesIdx > 11) return;

      const concepto = m.concepto || "Sin concepto";
      if (!mapa[concepto]) mapa[concepto] = Array(12).fill(0);

      const monto = Number(m[campoMonto] || 0);
      mapa[concepto][mesIdx] += monto;
      totalesPorMes[mesIdx] += monto;
    });

    const filas = Object.entries(mapa)
      .map(([concepto, valores]) => ({
        concepto,
        valores,
        total: valores.reduce((a, b) => a + b, 0),
      }))
      .sort((a, b) => b.total - a.total);

    return {
      filas,
      totalesPorMes,
      totalGeneral: totalesPorMes.reduce((a, b) => a + b, 0),
    };
  }, [movimientosTipo, anioPivote, filtros.concepto, campoMonto]);

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

  const filtrosActivos = Boolean(filtros.anio || filtros.concepto);
  const limpiarFiltros = () => setFiltros(FILTROS_INICIALES_SECCION);

  return {
    filtros,
    setFiltros,
    conceptosDisponibles,
    filtrados,
    rankingData,
    anioPivote,
    pivoteConceptoMes,
    evolucionData,
    filtrosActivos,
    limpiarFiltros,
  };
}

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
        setMovimientos(Array.isArray(resp) ? resp : []);
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

  const datosIngreso = useDatosTipo(movimientos, "credito");
  const datosEgreso = useDatosTipo(movimientos, "debito");

  return (
    <div style={styles.page}>
      <SeccionTabla
        tipo="INGRESO"
        titulo="Ingresos"
        subtitulo="Créditos recibidos — filtrá por año o concepto"
        icono={<TrendingUpIcon />}
        colorAccent={colores.COLOR_GREEN}
        loading={loading}
        datos={datosIngreso}
      />

      <SeccionTabla
        tipo="EGRESO"
        titulo="Egresos"
        subtitulo="Débitos realizados — filtrá por año o concepto"
        icono={<TrendingDownIcon />}
        colorAccent={colores.COLOR_RED}
        loading={loading}
        datos={datosEgreso}
      />

      <div style={styles.filaGraficos}>
        <CardGraficos
          tipo="INGRESO"
          titulo="Ingresos"
          icono={<TrendingUpIcon />}
          colorAccent={colores.COLOR_GREEN}
          loading={loading}
          datos={datosIngreso}
        />
        <CardGraficos
          tipo="EGRESO"
          titulo="Egresos"
          icono={<TrendingDownIcon />}
          colorAccent={colores.COLOR_RED}
          loading={loading}
          datos={datosEgreso}
        />
      </div>
    </div>
  );
}

function SeccionTabla({ tipo, titulo, subtitulo, icono, colorAccent, loading, datos }) {
  const colores = useTemaColores();
  const styles = crearEstilos(colores);

  const {
    filtros,
    setFiltros,
    conceptosDisponibles,
    filtrados,
    anioPivote,
    pivoteConceptoMes,
    filtrosActivos,
    limpiarFiltros,
  } = datos;

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
          <TablaConceptoMes
            tipo={tipo}
            anio={anioPivote}
            pivote={pivoteConceptoMes}
            colorAccent={colorAccent}
            styles={styles}
          />
        )}
      </div>
    </div>
  );
}

function CardGraficos({ tipo, titulo, icono, colorAccent, loading, datos }) {
  const colores = useTemaColores();
  const styles = crearEstilos(colores);
  const { filtros, filtrados, rankingData, evolucionData } = datos;

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
          <h3 style={styles.sectionTitle}>{titulo}</h3>
        </div>
      </div>

      <div style={styles.sectionBody}>
        {loading ? (
          <div style={styles.sinDatos}>Cargando...</div>
        ) : filtrados.length === 0 ? (
          <div style={styles.sinDatos}>
            No hay {tipo === "INGRESO" ? "ingresos" : "egresos"} para los filtros seleccionados.
          </div>
        ) : (
          <div style={styles.graficosApilados}>
            <div style={styles.chartCard}>
              <div style={styles.chartTitulo}>Principales conceptos</div>
              <div style={{ height: Math.max(140, rankingData.length * 20) }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={rankingData} layout="vertical" margin={{ top: 5, right: 24, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={colores.GRID_STROKE} />
                    <XAxis type="number" tickFormatter={formatoCompacto} tick={{ fontSize: 10, fontFamily: FONT_FORMAL, fill: colores.TEXT_MUTED }} />
                    <YAxis type="category" dataKey="concepto" width={120} tick={{ fontSize: 10, fontFamily: FONT_FORMAL, fill: colores.TEXT_MUTED }} />
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
              <div style={styles.chartTitulo}>
                {filtros.anio ? `Evolución mensual — ${filtros.anio}` : "Evolución mensual"}
              </div>
              {evolucionData.length === 0 ? (
                <div style={styles.sinDatos}>Sin datos para mostrar</div>
              ) : (
                <div style={{ height: 160 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={evolucionData} margin={{ top: 10, right: 16, left: 0, bottom: 5 }}>
                      <defs>
                        <linearGradient id={`gradEvolucion${tipo}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={colorAccent} stopOpacity={0.28} />
                          <stop offset="100%" stopColor={colorAccent} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={colores.GRID_STROKE} />
                      <XAxis dataKey="label" tick={{ fontSize: 10, fontFamily: FONT_FORMAL, fill: colores.TEXT_MUTED }} />
                      <YAxis tickFormatter={formatoCompacto} tick={{ fontSize: 10, fontFamily: FONT_FORMAL, fill: colores.TEXT_MUTED }} width={50} />
                      <Tooltip formatter={(v) => formatoNumero(v)} {...tooltipSx} />
                      <Area
                        type="monotone"
                        dataKey="monto"
                        stroke={colorAccent}
                        strokeWidth={2}
                        fill={`url(#gradEvolucion${tipo})`}
                        dot={{ r: 2.5, fill: colorAccent }}
                        activeDot={{ r: 4 }}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function TablaConceptoMes({ tipo, anio, pivote, colorAccent, styles }) {
  const etiquetaTotal = tipo === "INGRESO" ? "Total Ingresos" : "Total Egresos";

  return (
    <div style={styles.chartCard}>
      <div style={styles.chartTitulo}>
        {tipo === "INGRESO" ? "Ingresos" : "Egresos"} por concepto y mes — {anio}
      </div>

      <div style={styles.tablaWrap}>
        <table style={styles.tabla}>
          <thead>
            <tr>
              <th style={{ ...styles.th, ...styles.thConcepto }}>Concepto</th>
              {MESES_CORTOS.map((mes, i) => (
                <th
                  key={mes}
                  style={styles.th}
                  title={pivote.totalesPorMes[i] ? undefined : "Sin información cargada"}
                >
                  {mes}
                </th>
              ))}
              <th style={styles.th}>Total</th>
            </tr>
          </thead>

          <tbody>
            {pivote.filas.length === 0 ? (
              <tr>
                <td style={{ ...styles.td, ...styles.tdConcepto }} colSpan={14}>
                  <span style={styles.tdVacia}>Sin información cargada para {anio}</span>
                </td>
              </tr>
            ) : (
              pivote.filas.map((fila) => (
                <tr key={fila.concepto}>
                  <td style={{ ...styles.td, ...styles.tdConcepto }}>{fila.concepto}</td>
                  {fila.valores.map((valor, i) => (
                    <td key={i} style={styles.td}>
                      {valor > 0 ? formatoEntero(valor) : <span style={styles.tdVacia}>-</span>}
                    </td>
                  ))}
                  <td style={{ ...styles.td, fontWeight: 700 }}>
                    {formatoEntero(fila.total)}
                  </td>
                </tr>
              ))
            )}
          </tbody>

          <tfoot>
            <tr style={styles.filaTotal}>
              <td style={{ ...styles.td, ...styles.tdConcepto, ...styles.filaTotal }}>{etiquetaTotal}</td>
              {pivote.totalesPorMes.map((valor, i) => (
                <td
                  key={i}
                  style={{ ...styles.td, ...styles.filaTotal }}
                  title={valor > 0 ? undefined : "Sin información cargada"}
                >
                  {valor > 0 ? formatoEntero(valor) : <span style={styles.tdVacia}>-</span>}
                </td>
              ))}
              <td style={{ ...styles.td, ...styles.filaTotal, color: colorAccent }}>
                {formatoEntero(pivote.totalGeneral)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
