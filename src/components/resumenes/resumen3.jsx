import React, { useEffect, useMemo, useState } from "react";
import servicionivel3 from "../../services/nivel3";
import { useTemaColores } from "../../context/ModoOscuroContext";
import { aFechaValida } from "./movimientosUtils";

import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import PercentIcon from "@mui/icons-material/Percent";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import LabelImportantIcon from "@mui/icons-material/LabelImportant";
import BarChartIcon from "@mui/icons-material/BarChart";
import PieChartIcon from "@mui/icons-material/PieChart";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  PieChart as RPieChart,
  Pie,
} from "recharts";

const FONT_FORMAL = "'Helvetica Neue', Helvetica, Arial, sans-serif";

const crearPalette = (c) => [c.COLOR_NAVY, c.COLOR_TEAL, "#2aaad1", c.COLOR_AMBER, "#9b8bd4", "#7db8cf", c.COLOR_GREEN, "#c08a6e"];

const formatoNumero = (valor) => "$" + Math.round(Number(valor) || 0).toLocaleString("es-AR");

const formatoCompacto = (valor) =>
  new Intl.NumberFormat("es-AR", { notation: "compact", maximumFractionDigits: 1 }).format(
    Number(valor) || 0
  );

const formatPercent = (valor) => {
  const num = Number(valor || 0);
  const signo = num > 0 ? "+" : "";
  return `${signo}${num.toFixed(2)}%`;
};

export default function DashboardFinanciero() {
  const colores = useTemaColores();
  const { COLOR_NAVY, COLOR_TEAL, COLOR_GREEN, COLOR_RED, COLOR_AMBER, GRID_STROKE, TEXT_MUTED, BG_CARD, BORDER, TOOLTIP_TEXT } = colores;
  const styles = crearEstilos(colores);

  const [kpisExtra, setKpisExtra] = useState({
    variacionIngresos: 0,
    variacionGastos: 0,
    mejorCategoriaGasto: "",
    mejorConceptoIngreso: "",
  });
  const [kpis, setKpis] = useState({
    ingresos: 0,
    gastos: 0,
    ganancia: 0,
    rentabilidad: 0,
  });

  const [flujoCaja, setFlujoCaja] = useState([]);
  const [resultadoGeneral, setResultadoGeneral] = useState([]);
  const [ingresosPorConcepto, setIngresosPorConcepto] = useState([]);
  const [gastosPorCategoria, setGastosPorCategoria] = useState([]);

  useEffect(() => {
    traerDatos();
  }, []);

  const traerDatos = async () => {
    try {
      const resp = await servicionivel3.traermovimientos();
      const movimientos = Array.isArray(resp) ? resp : [];

      let ingresos = 0;
      let gastos = 0;

      const ingresosConceptoMap = {};
      const gastosCategoriaMap = {};

      movimientos.forEach((mov) => {
        const credito = Number(mov.credito) || 0;
        const debito = Number(mov.debito) || 0;

        const concepto = (mov.concepto || "SIN CLASIFICAR").trim();
        const categoria =
          (mov.categoria_general || mov.categoria || "SIN CLASIFICAR").trim();

        ingresos += credito;
        gastos += debito;

        if (credito > 0) {
          if (!ingresosConceptoMap[concepto]) ingresosConceptoMap[concepto] = 0;
          ingresosConceptoMap[concepto] += credito;
        }

        if (debito > 0) {
          if (!gastosCategoriaMap[categoria]) gastosCategoriaMap[categoria] = 0;
          gastosCategoriaMap[categoria] += debito;
        }
      });
      // Agrupar por fecha (mes simple)
      const porMes = {};

      movimientos.forEach((mov) => {
        const fecha = aFechaValida(mov.fecha);
        const key = `${fecha.getFullYear()}-${fecha.getMonth()}`;

        if (!porMes[key]) {
          porMes[key] = { ingresos: 0, gastos: 0 };
        }

        porMes[key].ingresos += Number(mov.credito) || 0;
        porMes[key].gastos += Number(mov.debito) || 0;
      });

      const meses = Object.entries(porMes)
        .sort((a, b) => new Date(a[0]) - new Date(b[0]))
        .map((item) => item[1]);

      let variacionIngresos = 0;
      let variacionGastos = 0;

      if (meses.length >= 2) {
        const actual = meses[meses.length - 1];
        const anterior = meses[meses.length - 2];

        variacionIngresos =
          anterior.ingresos > 0
            ? ((actual.ingresos - anterior.ingresos) / anterior.ingresos) * 100
            : 0;

        variacionGastos =
          anterior.gastos > 0
            ? ((actual.gastos - anterior.gastos) / anterior.gastos) * 100
            : 0;
      }
      const ganancia = ingresos - gastos;
      const rentabilidad =
        ingresos > 0 ? Number(((ganancia / ingresos) * 100).toFixed(2)) : 0;

      setKpis({
        ingresos,
        gastos,
        ganancia,
        rentabilidad,
      });

      setFlujoCaja([
        { label: "Ingresos", value: ingresos },
        { label: "Gastos", value: gastos },
      ]);
      const mejorCategoriaGasto = Object.entries(gastosCategoriaMap)
        .sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";

      const mejorConceptoIngreso = Object.entries(ingresosConceptoMap)
        .sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";
      setKpisExtra({
        variacionIngresos: variacionIngresos.toFixed(2),
        variacionGastos: variacionGastos.toFixed(2),
        mejorCategoriaGasto,
        mejorConceptoIngreso,
      });

      setResultadoGeneral([{ label: "Resultado", value: ganancia }]);

      setIngresosPorConcepto(prepararDonutData(ingresosConceptoMap));
      setGastosPorCategoria(prepararDonutData(gastosCategoriaMap));
    } catch (e) {
      console.error(e);
    }
  };

  // Presentación: combina flujoCaja + resultadoGeneral (mismos datos ya calculados)
  // en un solo gráfico de 3 barras, siguiendo el mismo patrón que "Resumen1".
  const datosFlujoResultado = useMemo(
    () => [...flujoCaja, ...resultadoGeneral],
    [flujoCaja, resultadoGeneral]
  );

  const coloresFlujoResultado = { Ingresos: COLOR_GREEN, Gastos: COLOR_RED, Resultado: COLOR_NAVY };

  const varIngresosPositiva = Number(kpisExtra.variacionIngresos) >= 0;
  const varGastosPositiva = Number(kpisExtra.variacionGastos) >= 0;

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div style={{ ...styles.headerIcon, background: `${COLOR_TEAL}1a`, color: COLOR_TEAL }}>
          <AccountBalanceIcon />
        </div>
        <div>
          <h2 style={styles.title}>Análisis General Anual</h2>
          <div style={styles.subtitle}>
           Analisis de ingresos, gastos, resultado y distribución anual.
          </div>
        </div>
      </div>

      <div style={styles.kpis}>
        <KpiCard titulo="Ingresos" valor={kpis.ingresos} color={COLOR_GREEN} icon={<TrendingUpIcon />} tipo="money" />
        <KpiCard titulo="Gastos" valor={kpis.gastos} color={COLOR_RED} icon={<TrendingDownIcon />} tipo="money" />
        <KpiCard titulo="Resultado" valor={kpis.ganancia} color={COLOR_NAVY} icon={<AccountBalanceWalletIcon />} tipo="money" />
        <KpiCard titulo="Rentabilidad" valor={kpis.rentabilidad} color={COLOR_TEAL} icon={<PercentIcon />} tipo="percent" />
      </div>

      <div style={styles.kpis}>
        <KpiCard
          titulo="Ingresos vs. mes anterior"
          valor={kpisExtra.variacionIngresos}
          color={varIngresosPositiva ? COLOR_GREEN : COLOR_RED}
          icon={varIngresosPositiva ? <TrendingUpIcon /> : <TrendingDownIcon />}
          tipo="percent"
        />

        <KpiCard
          titulo="Gastos vs. mes anterior"
          valor={kpisExtra.variacionGastos}
          color={varGastosPositiva ? COLOR_RED : COLOR_GREEN}
          icon={varGastosPositiva ? <TrendingUpIcon /> : <TrendingDownIcon />}
          tipo="percent"
        />

        <KpiCard
          titulo="Principal gasto"
          valor={kpisExtra.mejorCategoriaGasto}
          color={COLOR_AMBER}
          icon={<ReceiptLongIcon />}
          tipo="text"
        />

        <KpiCard
          titulo="Principal ingreso"
          valor={kpisExtra.mejorConceptoIngreso}
          color={COLOR_NAVY}
          icon={<LabelImportantIcon />}
          tipo="text"
        />
      </div>

      <div style={styles.grid3}>
        <SectionCard
          title="Ingresos, gastos y resultado"
          subtitle="Comparación general del período"
          icon={<BarChartIcon />}
          accent={COLOR_TEAL}
        >
          <div style={{ flex: 1, minHeight: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={datosFlujoResultado} margin={{ top: 10, right: 16, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={GRID_STROKE} />
                <XAxis dataKey="label" tick={{ fontSize: 12, fontFamily: FONT_FORMAL, fill: TEXT_MUTED }} />
                <YAxis tickFormatter={formatoCompacto} tick={{ fontSize: 11, fontFamily: FONT_FORMAL, fill: TEXT_MUTED }} width={55} />
                <Tooltip
                  formatter={(value) => formatoNumero(value)}
                  contentStyle={{ backgroundColor: BG_CARD, border: `1px solid ${BORDER}`, borderRadius: 10, color: TOOLTIP_TEXT }}
                  labelStyle={{ color: TOOLTIP_TEXT }}
                  itemStyle={{ color: TOOLTIP_TEXT }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {datosFlujoResultado.map((entry) => (
                    <Cell key={entry.label} fill={coloresFlujoResultado[entry.label] || COLOR_NAVY} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard
          title="Ingresos por concepto"
          subtitle="Distribución porcentual según concepto"
          icon={<PieChartIcon />}
          accent={COLOR_GREEN}
        >
          <DonutChart data={ingresosPorConcepto} />
        </SectionCard>

        <SectionCard
          title="Gastos por categoría"
          subtitle="Distribución porcentual según categoría"
          icon={<PieChartIcon />}
          accent={COLOR_RED}
        >
          <DonutChart data={gastosPorCategoria} />
        </SectionCard>
      </div>
    </div>
  );
}

/* ---------------- HELPERS (sin cambios de lógica) ---------------- */

function prepararDonutData(obj) {
  const entries = Object.entries(obj)
    .map(([label, amount]) => ({
      label,
      amount,
    }))
    .sort((a, b) => b.amount - a.amount);

  if (entries.length === 0) return [];

  const limit = 5;
  const principales = entries.slice(0, limit);
  const resto = entries.slice(limit);

  if (resto.length > 0) {
    const totalResto = resto.reduce((acc, item) => acc + item.amount, 0);
    principales.push({
      label: "Otros",
      amount: totalResto,
    });
  }

  const total = principales.reduce((acc, item) => acc + item.amount, 0);

  return principales.map((item) => ({
    ...item,
    percentage: total > 0 ? (item.amount / total) * 100 : 0,
  }));
}

/* ---------------- COMPONENTES ---------------- */

function DonutChart({ data }) {
  const colores = useTemaColores();
  const styles = crearEstilos(colores);
  const PALETTE = crearPalette(colores);
  const { BG_CARD, BORDER, TOOLTIP_TEXT } = colores;

  if (!data || data.length === 0) {
    return <div style={styles.sinDatos}>Sin datos para mostrar</div>;
  }

  return (
    <div style={{ flex: 1, minHeight: 240 }}>
      <ResponsiveContainer width="100%" height="100%">
        <RPieChart>
          <Pie
            data={data}
            dataKey="amount"
            nameKey="label"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={2}
          >
            {data.map((entry, index) => (
              <Cell key={entry.label} fill={PALETTE[index % PALETTE.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value, name, props) => [formatoNumero(value), `${name} (${props.payload.percentage.toFixed(1)}%)`]}
            contentStyle={{ backgroundColor: BG_CARD, border: `1px solid ${BORDER}`, borderRadius: 10, color: TOOLTIP_TEXT }}
            labelStyle={{ color: TOOLTIP_TEXT }}
            itemStyle={{ color: TOOLTIP_TEXT }}
          />
        </RPieChart>
      </ResponsiveContainer>
    </div>
  );
}

function KpiCard({ titulo, valor, color, icon, tipo = "money" }) {
  const styles = crearEstilos(useTemaColores());
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (tipo === "text") return;

    let current = 0;
    const target = Number(valor || 0);
    const increment = target / 35 || 0;

    const timer = setInterval(() => {
      current += increment;

      if ((increment >= 0 && current >= target) || (increment < 0 && current <= target)) {
        current = target;
        clearInterval(timer);
      }

      setDisplay(current);
    }, 20);

    return () => clearInterval(timer);
  }, [valor, tipo]);

  const valorMostrado =
    tipo === "percent" ? formatPercent(display) : tipo === "text" ? valor : formatoNumero(display);

  return (
    <div style={styles.card}>
      <div style={{ ...styles.cardIcon, background: `${color}1a`, color }}>{icon}</div>
      <div style={{ minWidth: 0 }}>
        <div style={styles.cardTitle}>{titulo}</div>
        <div style={styles.cardValue} title={typeof valorMostrado === "string" ? valorMostrado : undefined}>
          {valorMostrado}
        </div>
      </div>
    </div>
  );
}

function SectionCard({ title, subtitle, icon, accent, children }) {
  const colores = useTemaColores();
  const styles = crearEstilos(colores);
  const accentColor = accent || colores.COLOR_TEAL;

  return (
    <div style={styles.section}>
      <div style={styles.sectionHeader}>
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

      <div style={styles.sectionBody}>{children}</div>
    </div>
  );
}

/* ---------------- ESTILOS ---------------- */

const crearEstilos = (c) => ({
  page: {
    fontFamily: FONT_FORMAL,
    padding: 18,
    minHeight: "100vh",
    boxSizing: "border-box",
    background: c.BG_PAGE,
  },

  header: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginBottom: 18,
  },

  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 13,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  title: {
    margin: 0,
    fontSize: 19,
    fontWeight: 700,
    color: c.COLOR_NAVY,
  },

  subtitle: {
    marginTop: 2,
    fontSize: 12.5,
    color: c.TEXT_MUTED,
    fontWeight: 500,
  },

  kpis: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: 14,
    marginBottom: 18,
  },

  card: {
    background: c.BG_CARD,
    padding: 16,
    borderRadius: 14,
    display: "flex",
    alignItems: "center",
    gap: 12,
    border: `1px solid ${c.BORDER}`,
    boxShadow: c.SHADOW_CARD,
    minWidth: 0,
  },

  cardIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  cardTitle: {
    fontSize: 11.5,
    fontWeight: 700,
    color: c.TEXT_MUTED,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },

  cardValue: {
    fontSize: 18,
    fontWeight: 700,
    marginTop: 2,
    color: c.COLOR_NAVY,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },

  grid3: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: 18,
    alignItems: "stretch",
  },

  section: {
    background: c.BG_CARD,
    borderRadius: 18,
    marginBottom: 18,
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

  sinDatos: {
    textAlign: "center",
    padding: "34px 12px",
    color: c.TEXT_MUTED,
    fontSize: 13,
    fontWeight: 500,
  },
});
