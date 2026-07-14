import React, { useEffect, useState } from "react";
import servicionivel3 from "../../services/nivel3";
import { useTemaColores } from "../../context/ModoOscuroContext";

import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import PercentIcon from "@mui/icons-material/Percent";
import ShowChartIcon from "@mui/icons-material/ShowChart";

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
} from "recharts";

const FONT_FORMAL = "'Helvetica Neue', Helvetica, Arial, sans-serif";

const formatoNumero = (valor) => "$" + Math.round(Number(valor) || 0).toLocaleString("es-AR");

const formatoCompacto = (valor) =>
  new Intl.NumberFormat("es-AR", { notation: "compact", maximumFractionDigits: 1 }).format(
    Number(valor) || 0
  );

export default function DashboardPro() {
  const colores = useTemaColores();
  const { COLOR_NAVY, COLOR_TEAL, COLOR_GREEN, COLOR_RED, GRID_STROKE, TEXT_MUTED, BG_CARD, BORDER, TOOLTIP_TEXT } = colores;
  const styles = crearEstilos(colores);

  const [data, setData] = useState({
    ingresos: [],
    egresos: [],
    saldoMensual: [],
    totalIngresos: 0,
    totalEgresos: 0,
    proporcion: 0
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const resp = await servicionivel3.traermovimientos();

      const ingresosMap = {};
      const egresosMap = {};
      const saldoPorMes = {};

      let totalIngresos = 0;
      let totalEgresos = 0;

      resp.forEach(mov => {

        const concepto = mov.concepto || "Sin categoría";

        const debito = Number(mov.debito) || 0;
        const credito = Number(mov.credito) || 0;

        const fecha = new Date(mov.fecha);
        const mes = fecha.toLocaleString("es-AR", { month: "short" });

        /* ---------------- INGRESOS ---------------- */
        if (credito > 0) {
          if (!ingresosMap[concepto]) ingresosMap[concepto] = 0;

          ingresosMap[concepto] += credito;
          totalIngresos += credito;
        }

        /* ---------------- EGRESOS ---------------- */
        if (debito > 0) {
          if (!egresosMap[concepto]) egresosMap[concepto] = 0;

          egresosMap[concepto] += debito;
          totalEgresos += debito;
        }

        /* ---------------- SALDO MENSUAL ---------------- */
        const saldo = credito - debito;

        if (!saldoPorMes[mes]) saldoPorMes[mes] = 0;

        saldoPorMes[mes] += saldo;

      });

      /* ---------------- TRANSFORMACIONES ---------------- */

      const ingresosArray = Object.entries(ingresosMap)
        .map(([concepto, monto]) => ({ concepto, monto }))
        .sort((a, b) => b.monto - a.monto);

      const egresosArray = Object.entries(egresosMap)
        .map(([concepto, monto]) => ({ concepto, monto }))
        .sort((a, b) => b.monto - a.monto);

      let acumulado = 0;

      const saldoArray = Object.entries(saldoPorMes).map(([mes, valor]) => {
        acumulado += valor;
        return { mes, saldo: acumulado };
      });

      const proporcion = totalEgresos / totalIngresos;

      setData({
        ingresos: ingresosArray,
        egresos: egresosArray,
        saldoMensual: saldoArray,
        totalIngresos,
        totalEgresos,
        proporcion
      });

    } catch (error) {
      console.error(error);
    }
  };

  /* ---------------- UI ---------------- */

  const ingresosTop = data.ingresos.slice(0, 8);
  const egresosTop = data.egresos.slice(0, 8);
  const proporcionPct = Number.isFinite(data.proporcion) ? data.proporcion * 100 : 0;

  return (
    <div style={styles.container}>
     

      {/* RESUMEN */}
      <div style={styles.kpis}>
        <Card
          title="Ingresos"
          color={COLOR_GREEN}
          icon={<TrendingUpIcon />}
          value={formatoNumero(data.totalIngresos)}
        />

        <Card
          title="Egresos"
          color={COLOR_RED}
          icon={<TrendingDownIcon />}
          value={formatoNumero(data.totalEgresos)}
        />

        <Card
          title="Egreso / Ingreso"
          color={COLOR_NAVY}
          icon={<PercentIcon />}
          value={`${proporcionPct.toFixed(1)}%`}
        />
      </div>

      {/* SALDO MENSUAL */}
      <SectionCard title="Saldo mensual acumulado" subtitle="Balance acumulado mes a mes">
        <div style={{ height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data.saldoMensual} margin={{ top: 10, right: 16, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="gradSaldoResumen5" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={COLOR_TEAL} stopOpacity={0.28} />
                  <stop offset="100%" stopColor={COLOR_TEAL} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={GRID_STROKE} />
              <XAxis dataKey="mes" tick={{ fontSize: 12, fontFamily: FONT_FORMAL, fill: TEXT_MUTED }} />
              <YAxis tickFormatter={formatoCompacto} tick={{ fontSize: 11, fontFamily: FONT_FORMAL, fill: TEXT_MUTED }} width={55} />
              <Tooltip
                formatter={(value) => formatoNumero(value)}
                contentStyle={{ backgroundColor: BG_CARD, border: `1px solid ${BORDER}`, borderRadius: 10, color: TOOLTIP_TEXT }}
                labelStyle={{ color: TOOLTIP_TEXT }}
                itemStyle={{ color: TOOLTIP_TEXT }}
              />
              <Area
                type="monotone"
                dataKey="saldo"
                name="Saldo"
                stroke={COLOR_TEAL}
                strokeWidth={2.5}
                fill="url(#gradSaldoResumen5)"
                dot={{ r: 3, fill: COLOR_TEAL }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </SectionCard>

      {/* TABLAS */}
      <div style={styles.grid}>
        <SectionCard title="Ingresos por concepto" subtitle="Top conceptos con mayor ingreso">
          <RankingChart data={ingresosTop} color={COLOR_GREEN} />
        </SectionCard>

        <SectionCard title="Egresos por concepto" subtitle="Top conceptos con mayor egreso">
          <RankingChart data={egresosTop} color={COLOR_RED} />
        </SectionCard>
      </div>
    </div>
  );
}

/* ---------------- COMPONENTES ---------------- */

function RankingChart({ data, color }) {
  const colores = useTemaColores();
  const styles = crearEstilos(colores);
  const { GRID_STROKE, TEXT_MUTED, BG_CARD, BORDER, TOOLTIP_TEXT } = colores;

  if (!data.length) {
    return <div style={styles.sinDatos}>Sin datos para mostrar</div>;
  }

  return (
    <div style={{ height: Math.max(200, data.length * 32) }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={GRID_STROKE} />
          <XAxis type="number" tickFormatter={formatoCompacto} tick={{ fontSize: 11, fontFamily: FONT_FORMAL, fill: TEXT_MUTED }} />
          <YAxis
            type="category"
            dataKey="concepto"
            width={150}
            tick={{ fontSize: 11.5, fontFamily: FONT_FORMAL, fill: TEXT_MUTED }}
          />
          <Tooltip
            formatter={(value) => formatoNumero(value)}
            contentStyle={{ backgroundColor: BG_CARD, border: `1px solid ${BORDER}`, borderRadius: 10, color: TOOLTIP_TEXT }}
            labelStyle={{ color: TOOLTIP_TEXT }}
            itemStyle={{ color: TOOLTIP_TEXT }}
          />
          <Bar dataKey="monto" radius={[0, 6, 6, 0]}>
            {data.map((entry) => (
              <Cell key={entry.concepto} fill={color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function SectionCard({ title, subtitle, children }) {
  const styles = crearEstilos(useTemaColores());

  return (
    <div style={styles.card}>
      <h3 style={styles.cardTitle}>{title}</h3>
      {subtitle && <div style={styles.cardSubtitle}>{subtitle}</div>}
      <div style={{ marginTop: 12 }}>{children}</div>
    </div>
  );
}

function Card({ title, value, color, icon }) {
  const styles = crearEstilos(useTemaColores());

  return (
    <div style={styles.cardMini}>
      <div style={{ ...styles.cardMiniIcon, background: `${color}1a`, color }}>{icon}</div>
      <div style={{ minWidth: 0 }}>
        <div style={styles.cardMiniLabel}>{title}</div>
        <div style={styles.cardMiniValue}>{value}</div>
      </div>
    </div>
  );
}

/* ---------------- ESTILOS ---------------- */

const crearEstilos = (c) => ({

  container: {
    padding: 24,
    background: c.BG_PAGE,
    minHeight: "100vh",
    fontFamily: FONT_FORMAL,
    boxSizing: "border-box",
  },

  header: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
  },

  headerIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
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
    gap: 16,
    marginBottom: 20,
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: 20
  },

  card: {
    background: c.BG_CARD,
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    border: `1px solid ${c.BORDER}`,
    boxShadow: c.SHADOW_CARD,
  },

  cardTitle: {
    margin: 0,
    fontSize: 15,
    fontWeight: 700,
    color: c.COLOR_NAVY,
  },

  cardSubtitle: {
    marginTop: 2,
    fontSize: 12,
    color: c.TEXT_MUTED,
    fontWeight: 500,
  },

  cardMini: {
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

  cardMiniIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  cardMiniLabel: {
    fontSize: 11.5,
    fontWeight: 700,
    color: c.TEXT_MUTED,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },

  cardMiniValue: {
    fontSize: 19,
    fontWeight: 700,
    color: c.COLOR_NAVY,
    marginTop: 2,
  },

  sinDatos: {
    textAlign: "center",
    padding: "34px 12px",
    color: c.TEXT_MUTED,
    fontSize: 13,
    fontWeight: 500,
  },

});
