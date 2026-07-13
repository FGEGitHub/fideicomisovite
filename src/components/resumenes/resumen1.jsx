import React, { useEffect, useRef, useState } from "react";
import servicionivel3 from "../../services/nivel3";

import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import PercentIcon from "@mui/icons-material/Percent";
import AssessmentIcon from "@mui/icons-material/Assessment";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";

import {
  ResponsiveContainer,
  ComposedChart,
  BarChart,
  Bar,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
} from "recharts";

const COLOR_NAVY = "#083b5c";
const COLOR_TEAL = "#148D8D";
const COLOR_GREEN = "#15803d";
const COLOR_RED = "#dc2626";
const FONT_FORMAL = "'Helvetica Neue', Helvetica, Arial, sans-serif";

const formatoNumero = (valor) => "$" + Math.round(Number(valor) || 0).toLocaleString("es-AR");

const formatoCompacto = (valor) =>
  new Intl.NumberFormat("es-AR", { notation: "compact", maximumFractionDigits: 1 }).format(
    Number(valor) || 0
  );

const styles = {
  dashboard: {
    fontFamily: FONT_FORMAL,
    background: "#f4f7f9",
    padding: 24,
    minHeight: "100vh",
    boxSizing: "border-box",
  },

  seccion: {
    background: "#fff",
    borderRadius: 18,
    marginBottom: 22,
    boxShadow: "0 6px 18px rgba(8,59,92,0.07)",
    border: "1px solid rgba(8,59,92,0.06)",
    overflow: "hidden",
  },

  seccionHeader: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "20px 22px 16px",
  },

  seccionIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  seccionBody: {
    padding: "0 22px 22px",
  },

  subtitulo: {
    margin: 0,
    fontSize: 17,
    fontWeight: 700,
    letterSpacing: 0.1,
    color: COLOR_NAVY,
  },

  subtituloSecundario: {
    marginTop: 2,
    fontSize: 12.5,
    color: "#64748B",
    fontWeight: 600,
  },

  kpis: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 14,
    marginBottom: 18,
  },

  graficos: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
    gap: 16,
  },

  cardGrafico: {
    background: "#fff",
    borderRadius: 16,
    padding: 16,
    border: "1px solid rgba(8,59,92,0.08)",
    boxShadow: "0 4px 14px rgba(8,59,92,0.05)",
  },

  chartTitulo: {
    fontSize: 13,
    fontWeight: 600,
    color: COLOR_NAVY,
    marginBottom: 8,
  },

  chartInner: {
    height: 280,
    width: "100%",
  },

  filtroWrap: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
    flexWrap: "wrap",
    marginBottom: 18,
  },

  filtroGrupo: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
  },

  label: {
    fontSize: 13,
    fontWeight: 600,
    color: COLOR_NAVY,
  },

  select: {
    padding: "10px 14px",
    borderRadius: 12,
    border: "1px solid rgba(8,59,92,0.16)",
    background: "#fff",
    minWidth: 210,
    outline: "none",
    cursor: "pointer",
    fontSize: 13.5,
    fontWeight: 500,
    color: COLOR_NAVY,
  },

  textoSecundario: {
    fontSize: 12.5,
    color: COLOR_TEAL,
    fontWeight: 600,
    background: "rgba(20, 141, 141, 0.08)",
    padding: "8px 14px",
    borderRadius: 999,
  },

  sinDatos: {
    textAlign: "center",
    padding: "34px 12px",
    color: "#64748B",
    fontSize: 14,
    fontWeight: 600,
    background: "#fff",
    borderRadius: 14,
    border: "1px dashed rgba(148,163,184,0.3)",
  },

  kpiCard: {
    background: "#fff",
    borderRadius: 16,
    padding: 16,
    display: "flex",
    alignItems: "center",
    gap: 12,
    boxShadow: "0 6px 18px rgba(8,59,92,0.07)",
    border: "1px solid rgba(8,59,92,0.06)",
    minWidth: 0,
  },

  kpiIcon: {
    width: 44,
    height: 44,
    borderRadius: 13,
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  kpiLabel: {
    fontSize: 11.5,
    color: "#64748B",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },

  kpiValue: {
    fontSize: 19,
    fontWeight: 700,
    marginTop: 2,
    color: COLOR_NAVY,
    lineHeight: 1.15,
    wordBreak: "break-word",
  },
};

// Adapta el saldoArray (formato tabla: [encabezados, ...filas]) que ya devuelven
// calcularResumenGeneral/calcularResumenPorPeriodo al formato de objetos que usa Recharts.
// No recalcula nada, solo reordena los mismos valores ya calculados.
function convertirSaldoArray(saldoArray) {
  return saldoArray.slice(1).map(([label, saldo, ingresos, egresos]) => ({
    label,
    saldo,
    ingresos,
    egresos,
  }));
}

function normalizarAnio(anio) {
  const texto = String(anio || "").trim();
  if (texto.length === 2) {
    return `20${texto}`;
  }
  return texto;
}

function limpiarFecha(fecha) {
  if (!fecha) return "";
  return String(fecha)
    .replace("T", " ")
    .split(" ")[0]
    .split(".")[0]
    .trim();
}

function parseFecha(fecha) {
  const limpia = limpiarFecha(fecha);
  if (!limpia) return null;

  let dia = "";
  let mes = "";
  let anio = "";

  if (limpia.includes("/")) {
    const partes = limpia.split("/");
    if (partes.length !== 3) return null;
    [dia, mes, anio] = partes;
  } else if (limpia.includes("-")) {
    const partes = limpia.split("-");
    if (partes.length !== 3) return null;

    if (partes[0].length === 4) {
      [anio, mes, dia] = partes;
    } else {
      [dia, mes, anio] = partes;
    }
  } else {
    return null;
  }

  const dia2 = String(dia).padStart(2, "0");
  const mes2 = String(mes).padStart(2, "0");
  const anio4 = normalizarAnio(anio);

  return {
    dia: dia2,
    mes: mes2,
    anio: anio4,
    iso: `${anio4}-${mes2}-${dia2}`,
    periodo: `${anio4}-${mes2}`,
    label: `${dia2}/${mes2}/${anio4}`,
  };
}

function valorFecha(fecha) {
  const parsed = parseFecha(fecha);
  if (!parsed) return 0;
  return new Date(`${parsed.anio}-${parsed.mes}-${parsed.dia}`).getTime();
}

function obtenerPeriodo(fecha) {
  const parsed = parseFecha(fecha);
  return parsed ? parsed.periodo : "";
}

function formatearFecha(fecha) {
  const parsed = parseFecha(fecha);
  return parsed ? parsed.label : "-";
}

function deduplicarMovimientos(lista) {
  const vistos = new Set();

  return lista.filter((mov) => {
    const key = [
      limpiarFecha(mov.fecha),
      String(mov.cuil_cuit || "").trim(),
      Number(mov.debito || 0).toFixed(2),
      Number(mov.credito || 0).toFixed(2),
      String(mov.descripcion || "").trim().toLowerCase(),
      String(mov.nombre_razon || "").trim().toLowerCase(),
    ].join("|");

    if (vistos.has(key)) {
      return false;
    }

    vistos.add(key);
    return true;
  });
}

function formatearPeriodo(periodo) {
  if (!periodo) return "-";

  const [anio, mes] = periodo.split("-");
  const meses = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];

  return `${meses[Number(mes) - 1] || mes} ${anio}`;
}

function formatearPeriodoCorto(periodo) {
  if (!periodo) return "-";

  const [anio, mes] = periodo.split("-");
  const meses = [
    "ene",
    "feb",
    "mar",
    "abr",
    "may",
    "jun",
    "jul",
    "ago",
    "sep",
    "oct",
    "nov",
    "dic",
  ];

  return `${meses[Number(mes) - 1] || mes}/${anio}`;
}

export default function PanelFinanciero() {
  const [movimientos, setMovimientos] = useState([]);
  const [periodosDisponibles, setPeriodosDisponibles] = useState([]);
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState("");

  const [ingresosGenerales, setIngresosGenerales] = useState(0);
  const [egresosGenerales, setEgresosGenerales] = useState(0);
  const [ingresosGeneralesAnim, setIngresosGeneralesAnim] = useState(0);
  const [egresosGeneralesAnim, setEgresosGeneralesAnim] = useState(0);

  const [ingresosMes, setIngresosMes] = useState(0);
  const [egresosMes, setEgresosMes] = useState(0);
  const [ingresosMesAnim, setIngresosMesAnim] = useState(0);
  const [egresosMesAnim, setEgresosMesAnim] = useState(0);

  const [datosGeneral, setDatosGeneral] = useState([]);
  const [datosMes, setDatosMes] = useState([]);

  const timersRef = useRef({});

  useEffect(() => {
    traerDatos();

    return () => {
      Object.values(timersRef.current).forEach((timer) => clearInterval(timer));
    };
  }, []);

  useEffect(() => {
    if (!movimientos.length) {
      setIngresosGenerales(0);
      setEgresosGenerales(0);
      setIngresosGeneralesAnim(0);
      setEgresosGeneralesAnim(0);
      setDatosGeneral([]);
      return;
    }

    const resumenGeneral = calcularResumenGeneral(movimientos);

    setIngresosGenerales(resumenGeneral.totalIngresos);
    setEgresosGenerales(resumenGeneral.totalEgresos);

    animarNumero(resumenGeneral.totalIngresos, setIngresosGeneralesAnim, "ingGeneral");
    animarNumero(resumenGeneral.totalEgresos, setEgresosGeneralesAnim, "egGeneral");

    setDatosGeneral(convertirSaldoArray(resumenGeneral.saldoArray));
  }, [movimientos]);

  useEffect(() => {
    if (!periodoSeleccionado || !movimientos.length) {
      setIngresosMes(0);
      setEgresosMes(0);
      setIngresosMesAnim(0);
      setEgresosMesAnim(0);
      setDatosMes([]);
      return;
    }

    const resumenMes = calcularResumenPorPeriodo(movimientos, periodoSeleccionado);

    setIngresosMes(resumenMes.totalIngresos);
    setEgresosMes(resumenMes.totalEgresos);

    animarNumero(resumenMes.totalIngresos, setIngresosMesAnim, "ingMes");
    animarNumero(resumenMes.totalEgresos, setEgresosMesAnim, "egMes");

    setDatosMes(convertirSaldoArray(resumenMes.saldoArray));
  }, [movimientos, periodoSeleccionado]);

  const traerDatos = async () => {
    try {
      const resp = await servicionivel3.traermovimientos();
      const lista = Array.isArray(resp) ? resp : [];
      const listaSinDuplicados = deduplicarMovimientos(lista);

      setMovimientos(listaSinDuplicados);

      const periodos = [
        ...new Set(lista.map((mov) => obtenerPeriodo(mov.fecha)).filter(Boolean)),
      ].sort((a, b) => b.localeCompare(a));

      setPeriodosDisponibles(periodos);

      if (periodos.length > 0) {
        setPeriodoSeleccionado(periodos[0]);
      }
    } catch (error) {
      console.error(error);
    }
  };

  function animarNumero(valor, setter, key) {
    clearInterval(timersRef.current[key]);

    if (!valor || valor <= 0) {
      setter(0);
      return;
    }

    let actual = 0;
    const incremento = valor / 60;

    timersRef.current[key] = setInterval(() => {
      actual += incremento;

      if (actual >= valor) {
        actual = valor;
        clearInterval(timersRef.current[key]);
      }

      setter(actual);
    }, 20);
  }

  function calcularResumenGeneral(lista) {
  let totalIngresos = 0;
  let totalEgresos = 0;

  const acumuladoPorPeriodo = {};
  const ingresosPorPeriodo = {};
  const egresosPorPeriodo = {};

  lista.forEach((mov) => {
    const periodo = obtenerPeriodo(mov.fecha);
    if (!periodo) return;

    const credito = Number(mov.credito) || 0;
    const debito = Number(mov.debito) || 0;

    totalIngresos += credito;
    totalEgresos += debito;

    if (!acumuladoPorPeriodo[periodo]) {
      acumuladoPorPeriodo[periodo] = 0;
      ingresosPorPeriodo[periodo] = 0;
      egresosPorPeriodo[periodo] = 0;
    }

    acumuladoPorPeriodo[periodo] += credito - debito;
    ingresosPorPeriodo[periodo] += credito;
    egresosPorPeriodo[periodo] += debito;
  });

  const saldoArray = [["Mes", "Saldo", "Ingresos", "Egresos"]];

  let saldoAcum = 0;
  let ingAcum = 0;
  let egAcum = 0;

  Object.keys(acumuladoPorPeriodo)
    .sort((a, b) => a.localeCompare(b))
    .forEach((periodo) => {
      saldoAcum += acumuladoPorPeriodo[periodo];
      ingAcum += ingresosPorPeriodo[periodo];
      egAcum += egresosPorPeriodo[periodo];

      saldoArray.push([
        formatearPeriodoCorto(periodo),
        saldoAcum,
        ingAcum,
        egAcum,
      ]);
    });

  return {
    totalIngresos,
    totalEgresos,
    saldoArray,
  };
}

  function calcularResumenPorPeriodo(lista, periodoSeleccionadoActual) {
  const filtrados = lista
    .filter((mov) => obtenerPeriodo(mov.fecha) === periodoSeleccionadoActual)
    .sort((a, b) => valorFecha(a.fecha) - valorFecha(b.fecha));

  let totalIngresos = 0;
  let totalEgresos = 0;

  const acumuladoPorFecha = {};
  const ingresosPorFecha = {};
  const egresosPorFecha = {};

  filtrados.forEach((mov) => {
    const credito = Number(mov.credito) || 0;
    const debito = Number(mov.debito) || 0;

    totalIngresos += credito;
    totalEgresos += debito;

    const parsed = parseFecha(mov.fecha);
    if (!parsed) return;

    if (!acumuladoPorFecha[parsed.iso]) {
      acumuladoPorFecha[parsed.iso] = 0;
      ingresosPorFecha[parsed.iso] = 0;
      egresosPorFecha[parsed.iso] = 0;
    }

    acumuladoPorFecha[parsed.iso] += credito - debito;
    ingresosPorFecha[parsed.iso] += credito;
    egresosPorFecha[parsed.iso] += debito;
  });

  const saldoArray = [["Fecha", "Saldo", "Ingresos", "Egresos"]];

  let saldoAcum = 0;
  let ingAcum = 0;
  let egAcum = 0;

  Object.keys(acumuladoPorFecha)
    .sort((a, b) => a.localeCompare(b))
    .forEach((fechaIso) => {
      saldoAcum += acumuladoPorFecha[fechaIso];
      ingAcum += ingresosPorFecha[fechaIso];
      egAcum += egresosPorFecha[fechaIso];

      saldoArray.push([
        formatearFecha(fechaIso),
        saldoAcum,
        ingAcum,
        egAcum,
      ]);
    });

  if (saldoArray.length === 1) {
    saldoArray.push([formatearPeriodo(periodoSeleccionadoActual), 0, 0, 0]);
  }

  return {
    totalIngresos,
    totalEgresos,
    saldoArray,
  };
}
  const resultadoGeneral = ingresosGenerales - egresosGenerales;
  const proporcionGeneral =
    ingresosGenerales > 0 ? ((egresosGenerales / ingresosGenerales) * 100).toFixed(2) : 0;

  const resultadoMes = ingresosMes - egresosMes;
  const proporcionMes =
    ingresosMes > 0 ? ((egresosMes / ingresosMes) * 100).toFixed(2) : 0;

  const datosBarraGeneral = [
    { concepto: "Ingresos", monto: ingresosGenerales, fill: COLOR_GREEN },
    { concepto: "Egresos", monto: egresosGenerales, fill: COLOR_RED },
    { concepto: "Resultado", monto: resultadoGeneral, fill: "#0B4F6C" },
  ];

  const datosBarraMes = [
    { concepto: "Ingresos", monto: ingresosMes, fill: COLOR_GREEN },
    { concepto: "Egresos", monto: egresosMes, fill: COLOR_RED },
    { concepto: "Resultado", monto: resultadoMes, fill: "#0B4F6C" },
  ];

  return (
    <div style={styles.dashboard}>
      <SectionCard
        title="Análisis Anual"
        subtitle="Totales acumulados de todos los extractos cargados"
        icon={<AssessmentIcon />}
      >
        <div style={styles.kpis}>
          <Card titulo="Ingresos" valor={ingresosGeneralesAnim} color={COLOR_GREEN} icon={<TrendingUpIcon />} />
          <Card titulo="Egresos" valor={egresosGeneralesAnim} color={COLOR_RED} icon={<TrendingDownIcon />} />
          <Card
            titulo="Resultado"
            valor={resultadoGeneral}
            color={resultadoGeneral < 0 ? COLOR_RED : "#148D8D"}
            icon={<AccountBalanceWalletIcon />}
          />
          <Card
            titulo="Egreso / Ingreso"
            valor={proporcionGeneral + "%"}
            color="#0B4F6C"
            icon={<PercentIcon />}
          />
        </div>

        <div style={styles.graficos}>
          <div style={styles.cardGrafico}>
            <div style={styles.chartTitulo}>Ingresos, egresos y resultado</div>
            <div style={styles.chartInner}>
              <BarraConceptos data={datosBarraGeneral} />
            </div>
          </div>

          <div style={styles.cardGrafico}>
            <div style={styles.chartTitulo}>Evolución de saldo</div>
            <div style={styles.chartInner}>
              <EvolucionSaldo data={datosGeneral} />
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Análisis Mensual" icon={<CalendarMonthIcon />}>
        <div style={styles.filtroWrap}>
          <div style={styles.filtroGrupo}>
            <label style={styles.label}>Seleccionar período</label>

            <select
              value={periodoSeleccionado}
              onChange={(e) => setPeriodoSeleccionado(e.target.value)}
              style={styles.select}
            >
              {periodosDisponibles.length === 0 && (
                <option value="">Sin períodos</option>
              )}

              {periodosDisponibles.map((periodo) => (
                <option key={periodo} value={periodo}>
                  {formatearPeriodo(periodo)}
                </option>
              ))}
            </select>
          </div>

          <div style={styles.textoSecundario}>
            {periodoSeleccionado
              ? `Mostrando: ${formatearPeriodo(periodoSeleccionado)}`
              : "Sin datos"}
          </div>
        </div>

        <div style={styles.kpis}>
          <Card titulo="Ingresos" valor={ingresosMesAnim} color={COLOR_GREEN} icon={<TrendingUpIcon />} />
          <Card titulo="Egresos" valor={egresosMesAnim} color={COLOR_RED} icon={<TrendingDownIcon />} />
          <Card
            titulo="Resultado"
            valor={resultadoMes}
            color={resultadoMes < 0 ? COLOR_RED : "#148D8D"}
            icon={<AccountBalanceWalletIcon />}
          />
          <Card
            titulo="Egreso / Ingreso"
            valor={proporcionMes + "%"}
            color="#0B4F6C"
            icon={<PercentIcon />}
          />
        </div>

        {periodoSeleccionado ? (
          <div style={styles.graficos}>
            <div style={styles.cardGrafico}>
              <div style={styles.chartTitulo}>Ingresos, egresos y resultado</div>
              <div style={styles.chartInner}>
                <BarraConceptos data={datosBarraMes} />
              </div>
            </div>

            <div style={styles.cardGrafico}>
              <div style={styles.chartTitulo}>Evolución de saldo</div>
              <div style={styles.chartInner}>
                <EvolucionSaldo data={datosMes} />
              </div>
            </div>
          </div>
        ) : (
          <div style={styles.sinDatos}>No hay datos disponibles para ese período.</div>
        )}
      </SectionCard>

     
    </div>
  );
}

function SectionCard({ title, subtitle, icon, children }) {
  return (
    <div style={styles.seccion}>
      <div style={styles.seccionHeader}>
        {icon && (
          <div style={{ ...styles.seccionIcon, background: `${COLOR_TEAL}1a`, color: COLOR_TEAL }}>
            {icon}
          </div>
        )}
        <div>
          <h3 style={styles.subtitulo}>{title}</h3>
          {subtitle && <div style={styles.subtituloSecundario}>{subtitle}</div>}
        </div>
      </div>
      <div style={styles.seccionBody}>{children}</div>
    </div>
  );
}

function Card({ titulo, valor, color, icon }) {
  return (
    <div style={styles.kpiCard}>
      {icon && (
        <div style={{ ...styles.kpiIcon, background: `${color}1a`, color }}>
          {icon}
        </div>
      )}
      <div style={{ minWidth: 0 }}>
        <div style={styles.kpiLabel}>{titulo}</div>

        <div style={styles.kpiValue}>
          {typeof valor === "number"
            ? "$" + Math.round(valor).toLocaleString("es-AR")
            : valor}
        </div>
      </div>
    </div>
  );
}

function BarraConceptos({ data }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef2f5" />
        <XAxis dataKey="concepto" tick={{ fontSize: 12, fontFamily: FONT_FORMAL }} />
        <YAxis tickFormatter={formatoCompacto} tick={{ fontSize: 11, fontFamily: FONT_FORMAL }} width={55} />
        <Tooltip formatter={(value) => formatoNumero(value)} />
        <Bar dataKey="monto" radius={[6, 6, 0, 0]}>
          {data.map((entry) => (
            <Cell key={entry.concepto} fill={entry.fill} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function EvolucionSaldo({ data }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
        <defs>
          <linearGradient id="gradSaldoResumen1" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0B4F6C" stopOpacity={0.25} />
            <stop offset="100%" stopColor="#0B4F6C" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef2f5" />
        <XAxis dataKey="label" tick={{ fontSize: 11, fontFamily: FONT_FORMAL }} />
        <YAxis tickFormatter={formatoCompacto} tick={{ fontSize: 11, fontFamily: FONT_FORMAL }} width={55} />
        <Tooltip formatter={(value) => formatoNumero(value)} />
        <Legend wrapperStyle={{ fontSize: 12, fontFamily: FONT_FORMAL }} />
        <Area
          type="monotone"
          dataKey="saldo"
          name="Saldo"
          stroke="#0B4F6C"
          strokeWidth={3}
          fill="url(#gradSaldoResumen1)"
          dot={{ r: 2.5, fill: "#0B4F6C" }}
        />
        <Line type="monotone" dataKey="ingresos" name="Ingresos" stroke={COLOR_GREEN} strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="egresos" name="Egresos" stroke={COLOR_RED} strokeWidth={2} dot={false} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}