import { useEffect, useMemo, useState, useCallback } from "react";
import servicionivel3 from "../../services/nivel3";

import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  CircularProgress,
  Paper,
  MenuItem,
  Alert,
  Button,
  LinearProgress,
  Tooltip as MuiTooltip,
} from "@mui/material";

import RefreshIcon from "@mui/icons-material/Refresh";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import PaidIcon from "@mui/icons-material/Paid";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import HourglassBottomIcon from "@mui/icons-material/HourglassBottom";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import InboxIcon from "@mui/icons-material/Inbox";
import FilterAltOffIcon from "@mui/icons-material/FilterAltOff";
import FlagCircleIcon from "@mui/icons-material/FlagCircle";
import GridViewIcon from "@mui/icons-material/GridView";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import DonutLargeIcon from "@mui/icons-material/DonutLarge";

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
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLOR_NAVY = "#083b5c";
const COLOR_TEAL = "#148D8D";
const COLOR_SKY = "#2aaad1";
const COLOR_AMBER = "#d97706";
const COLOR_GREEN = "#15803d";
const PIE_COLORS = [COLOR_NAVY, COLOR_TEAL, COLOR_SKY, COLOR_AMBER, COLOR_GREEN, "#7c3aed", "#dc2626", "#0891b2"];
const MESES_CORTOS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

const formatoNumero = (valor, moneda = "USD") => {
  const numero = Number(valor || 0);
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: moneda,
    minimumFractionDigits: 2,
  }).format(numero);
};

const formatoCompacto = (valor) => {
  return new Intl.NumberFormat("es-AR", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(Number(valor || 0));
};

const formatoM2 = (valor) => {
  return `${new Intl.NumberFormat("es-AR", { maximumFractionDigits: 0 }).format(Number(valor || 0))} m²`;
};

// Los datos vienen como "M/D/AA" o "M/D/AAAA" (a veces con año de 2 dígitos, a veces de 4).
const parseFecha = (fecha) => {
  if (!fecha) return null;
  const partes = String(fecha).split("/");
  if (partes.length !== 3) return null;

  const mes = parseInt(partes[0], 10);
  let anio = parseInt(partes[2], 10);

  if (!mes || !anio || mes < 1 || mes > 12) return null;
  if (anio < 100) anio += 2000;

  const trimestre = Math.floor((mes - 1) / 3) + 1;

  return { anio, mes, trimestre };
};

// El campo "estado" viene sucio (nulls, texto con residuos de fórmulas de Excel).
// El saldo es la fuente de verdad más confiable para saber si una venta está cancelada.
const estaCancelado = (venta) => Number(venta.saldo || 0) <= 0;

function KpiCard({ icon, label, value, color, sub }) {
  return (
    <Paper
      sx={{
        p: 2,
        borderRadius: 3,
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        boxShadow: "0 6px 18px rgba(8,59,92,0.07)",
        border: "1px solid rgba(8,59,92,0.06)",
        minWidth: 0,
      }}
    >
      <Box
        sx={{
          width: 46,
          height: 46,
          borderRadius: "14px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          background: `${color}1a`,
          color,
        }}
      >
        {icon}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography
          fontSize={12}
          fontWeight={700}
          color="text.secondary"
          sx={{ textTransform: "uppercase", letterSpacing: 0.4 }}
        >
          {label}
        </Typography>
        <Typography
          fontSize={19}
          fontWeight={800}
          color={COLOR_NAVY}
          noWrap
          title={typeof value === "string" ? value : undefined}
        >
          {value}
        </Typography>
        {sub && (
          <Typography fontSize={11.5} color="text.secondary">
            {sub}
          </Typography>
        )}
      </Box>
    </Paper>
  );
}

function ChartCard({ title, height = 300, children, empty }) {
  return (
    <Paper
      sx={{
        p: 2.5,
        borderRadius: 3,
        boxShadow: "0 6px 18px rgba(8,59,92,0.07)",
        border: "1px solid rgba(8,59,92,0.06)",
        height: "100%",
      }}
    >
      <Typography fontWeight={800} fontSize={15} color={COLOR_NAVY} sx={{ mb: 1.5 }}>
        {title}
      </Typography>
      {empty ? (
        <Box
          sx={{
            height,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "text.secondary",
            fontSize: 13,
          }}
        >
          Sin datos para mostrar
        </Box>
      ) : (
        <Box sx={{ height, width: "100%" }}>
          <ResponsiveContainer width="100%" height="100%">
            {children}
          </ResponsiveContainer>
        </Box>
      )}
    </Paper>
  );
}

export default function VentasDashboard({ vendedor, titulo, icon, accent = COLOR_TEAL }) {
  const [lotes, setLotes] = useState([]); // todos los lotes: vendidos + disponibles
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [manzana, setManzana] = useState("");
  const [lote, setLote] = useState("");
  const [anio, setAnio] = useState("");
  const [trimestre, setTrimestre] = useState("");
  const [busqueda, setBusqueda] = useState("");

  const traerVentas = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await servicionivel3.traerventas2({ vendedor });
      const data = res.data || res || [];

      setLotes(data);
    } catch (err) {
      console.error("Error al traer ventas:", err);
      setError("No se pudieron cargar las ventas. Probá de nuevo en unos segundos.");
    } finally {
      setLoading(false);
    }
  }, [vendedor]);

  useEffect(() => {
    traerVentas();
  }, [traerVentas]);

  const ventasConFecha = useMemo(
    () =>
      lotes
        .filter((v) => v.valor != null)
        .map((v) => ({ ...v, __fecha: parseFecha(v.fecha) })),
    [lotes]
  );

  const inventario = useMemo(() => {
    const totalLotes = lotes.length;
    const vendidos = lotes.filter((v) => v.valor != null);
    const lotesVendidos = vendidos.length;
    const lotesDisponibles = totalLotes - lotesVendidos;
    const m2Total = lotes.reduce((acc, v) => acc + Number(v.m2 || 0), 0);
    const m2Vendidos = vendidos.reduce((acc, v) => acc + Number(v.m2 || 0), 0);
    const m2Disponibles = m2Total - m2Vendidos;
    const pctAvance = totalLotes > 0 ? (lotesVendidos / totalLotes) * 100 : 0;

    return { totalLotes, lotesVendidos, lotesDisponibles, m2Total, m2Vendidos, m2Disponibles, pctAvance };
  }, [lotes]);

  const manzanasDisponibles = useMemo(() => {
    return [...new Set(ventasConFecha.map((v) => v.manzana).filter(Boolean))].sort((a, b) =>
      String(a).localeCompare(String(b), "es", { numeric: true })
    );
  }, [ventasConFecha]);

  const lotesDisponibles = useMemo(() => {
    return [
      ...new Set(
        ventasConFecha
          .filter((v) => !manzana || v.manzana === manzana)
          .map((v) => v.lote)
          .filter(Boolean)
      ),
    ].sort((a, b) => String(a).localeCompare(String(b), "es", { numeric: true }));
  }, [ventasConFecha, manzana]);

  const aniosDisponibles = useMemo(() => {
    return [...new Set(ventasConFecha.map((v) => v.__fecha?.anio).filter(Boolean))].sort(
      (a, b) => b - a
    );
  }, [ventasConFecha]);

  const hayFiltrosActivos = Boolean(manzana || lote || anio || trimestre || busqueda);

  const limpiarFiltros = () => {
    setManzana("");
    setLote("");
    setAnio("");
    setTrimestre("");
    setBusqueda("");
  };

  const filtradas = useMemo(() => {
    const texto = busqueda.toLowerCase().trim();

    return ventasConFecha.filter((v) => {
      if (manzana && v.manzana !== manzana) return false;
      if (lote && v.lote !== lote) return false;
      if (anio && v.__fecha?.anio !== Number(anio)) return false;
      if (trimestre && v.__fecha?.trimestre !== Number(trimestre)) return false;

      if (texto && !String(v.comprador || "").toLowerCase().includes(texto)) return false;

      return true;
    });
  }, [ventasConFecha, manzana, lote, anio, trimestre, busqueda]);

  const kpis = useMemo(() => {
    const valorTotal = filtradas.reduce((acc, v) => acc + Number(v.valor || 0), 0);
    const montoCobrado = filtradas.reduce((acc, v) => acc + Number(v.monto_cobrado || 0), 0);
    const saldoPendiente = filtradas.reduce((acc, v) => acc + Math.max(Number(v.saldo || 0), 0), 0);
    const cancelados = filtradas.filter(estaCancelado).length;
    const pctCobrado = valorTotal > 0 ? (montoCobrado / valorTotal) * 100 : 0;

    return {
      cantidad: filtradas.length,
      valorTotal,
      montoCobrado,
      saldoPendiente,
      cancelados,
      pendientes: filtradas.length - cancelados,
      pctCobrado,
    };
  }, [filtradas]);

  const flujoTemporal = useMemo(() => {
    const grupos = new Map();

    filtradas.forEach((v) => {
      if (!v.__fecha) return;
      const key = `${v.__fecha.anio}-${String(v.__fecha.mes).padStart(2, "0")}`;

      if (!grupos.has(key)) {
        grupos.set(key, {
          key,
          label: `${MESES_CORTOS[v.__fecha.mes - 1]} ${String(v.__fecha.anio).slice(-2)}`,
          valor: 0,
          cobrado: 0,
        });
      }

      const grupo = grupos.get(key);
      grupo.valor += Number(v.valor || 0);
      grupo.cobrado += Number(v.monto_cobrado || 0);
    });

    return [...grupos.values()].sort((a, b) => a.key.localeCompare(b.key));
  }, [filtradas]);

  const porManzana = useMemo(() => {
    const grupos = new Map();

    filtradas.forEach((v) => {
      if (!v.manzana) return;
      if (!grupos.has(v.manzana)) {
        grupos.set(v.manzana, { manzana: v.manzana, valor: 0, cantidad: 0 });
      }
      const grupo = grupos.get(v.manzana);
      grupo.valor += Number(v.valor || 0);
      grupo.cantidad += 1;
    });

    return [...grupos.values()].sort((a, b) =>
      String(a.manzana).localeCompare(String(b.manzana), "es", { numeric: true })
    );
  }, [filtradas]);

  const porUsoDeSuelo = useMemo(() => {
    const grupos = new Map();

    filtradas.forEach((v) => {
      const clave = v.uso_de_suelo || "Sin dato";
      grupos.set(clave, (grupos.get(clave) || 0) + 1);
    });

    return [...grupos.entries()]
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filtradas]);

  const estadoCartera = useMemo(() => {
    return [
      { name: "Cancelado", value: kpis.cancelados, color: COLOR_GREEN },
      { name: "Con saldo pendiente", value: kpis.pendientes, color: COLOR_AMBER },
    ].filter((d) => d.value > 0);
  }, [kpis]);

  const topDeudores = useMemo(() => {
    return filtradas
      .filter((v) => Number(v.saldo || 0) > 0)
      .sort((a, b) => Number(b.saldo || 0) - Number(a.saldo || 0))
      .slice(0, 6)
      .map((v) => ({
        label: `Mz ${v.manzana} · Lt ${v.lote}`,
        comprador: v.comprador || "Sin comprador",
        saldo: Number(v.saldo || 0),
      }))
      .reverse();
  }, [filtradas]);

  const sinVentasCargadas = !loading && !error && ventasConFecha.length === 0;
  const sinResultadosFiltro = !loading && !error && ventasConFecha.length > 0 && filtradas.length === 0;

  return (
    <Box sx={{ mt: 1 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 2,
          mb: 2.5,
          flexWrap: "wrap",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
          {icon && (
            <Box
              sx={{
                width: 46,
                height: 46,
                borderRadius: "14px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                background: `${accent}1a`,
                color: accent,
                "& svg": { fontSize: 24 },
              }}
            >
              {icon}
            </Box>
          )}
          <Box sx={{ minWidth: 0 }}>
            <Typography fontWeight={800} fontSize={21} color={COLOR_NAVY} noWrap>
              {titulo}
            </Typography>
            <Typography color="text.secondary" fontSize={13}>
              Análisis de ventas, cobranzas y saldos por manzana, lote, año y trimestre
            </Typography>
          </Box>
        </Box>

        <Button
          onClick={traerVentas}
          disabled={loading}
          startIcon={<RefreshIcon />}
          sx={{
            color: COLOR_NAVY,
            fontWeight: 700,
            fontSize: 13,
            borderRadius: 2.5,
            px: 1.75,
            border: "1px solid rgba(8,59,92,0.14)",
            "&:hover": { background: "rgba(8,59,92,0.06)" },
          }}
        >
          Actualizar
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} action={<Button size="small" onClick={traerVentas}>Reintentar</Button>}>
          {error}
        </Alert>
      )}

      {loading && lotes.length === 0 ? (
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 10, gap: 1.5 }}>
          <CircularProgress size={32} sx={{ color: COLOR_TEAL }} />
          <Typography color="text.secondary" fontSize={13}>
            Cargando información de {titulo}...
          </Typography>
        </Box>
      ) : (
        <>
          {/* AVANCE DE COMERCIALIZACIÓN — no depende de que haya ventas cargadas */}
          {inventario.totalLotes > 0 && (
            <Paper
              sx={{
                p: 2.5,
                borderRadius: 3,
                mb: 2.5,
                boxShadow: "0 6px 18px rgba(8,59,92,0.07)",
                border: "1px solid rgba(8,59,92,0.06)",
              }}
            >
              <Typography fontWeight={800} fontSize={15} color={COLOR_NAVY} sx={{ mb: 1.5 }}>
                Avance de comercialización
              </Typography>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(4, 1fr)" },
                  gap: 1.75,
                  mb: 2,
                }}
              >
                <KpiCard
                  icon={<GridViewIcon />}
                  color={COLOR_NAVY}
                  label="Lotes totales"
                  value={inventario.totalLotes}
                  sub={formatoM2(inventario.m2Total)}
                />
                <KpiCard
                  icon={<CheckCircleIcon />}
                  color={COLOR_GREEN}
                  label="Lotes vendidos"
                  value={inventario.lotesVendidos}
                  sub={formatoM2(inventario.m2Vendidos)}
                />
                <KpiCard
                  icon={<Inventory2Icon />}
                  color={COLOR_AMBER}
                  label="Lotes disponibles"
                  value={inventario.lotesDisponibles}
                  sub={formatoM2(inventario.m2Disponibles)}
                />
                <KpiCard
                  icon={<DonutLargeIcon />}
                  color={COLOR_TEAL}
                  label="% de avance"
                  value={`${inventario.pctAvance.toFixed(1)}%`}
                  sub="del inventario vendido"
                />
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <LinearProgress
                  variant="determinate"
                  value={Math.min(inventario.pctAvance, 100)}
                  sx={{
                    flex: 1,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: "rgba(8,59,92,0.08)",
                    "& .MuiLinearProgress-bar": { backgroundColor: COLOR_TEAL, borderRadius: 4 },
                  }}
                />
                <MuiTooltip title="Meta: 100% de los lotes vendidos">
                  <FlagCircleIcon sx={{ color: COLOR_TEAL, fontSize: 22, flexShrink: 0 }} />
                </MuiTooltip>
              </Box>
            </Paper>
          )}

          {sinVentasCargadas ? (
            <Paper
              sx={{
                p: 4,
                borderRadius: 3,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 1,
                color: "text.secondary",
              }}
            >
              <InboxIcon sx={{ fontSize: 34, color: COLOR_TEAL }} />
              <Typography fontWeight={700} color={COLOR_NAVY}>
                Todavía no hay ventas cargadas para {titulo}
              </Typography>
              <Typography fontSize={13}>Cuando se carguen ventas, el análisis financiero va a aparecer acá.</Typography>
            </Paper>
          ) : (
            <>
          {/* FILTROS */}
          <Paper
            sx={{
              p: 2,
              borderRadius: 3,
              mb: 2.5,
              display: "flex",
              gap: 1.5,
              flexWrap: "wrap",
              alignItems: "center",
              boxShadow: "0 6px 18px rgba(8,59,92,0.07)",
              border: "1px solid rgba(8,59,92,0.06)",
            }}
          >
            <TextField
              select
              size="small"
              label="Manzana"
              value={manzana}
              onChange={(e) => {
                setManzana(e.target.value);
                setLote("");
              }}
              sx={{ width: { xs: "100%", sm: 150 } }}
            >
              <MenuItem value="">Todas</MenuItem>
              {manzanasDisponibles.map((opcion) => (
                <MenuItem key={opcion} value={opcion}>
                  {opcion}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              size="small"
              label="Lote"
              value={lote}
              onChange={(e) => setLote(e.target.value)}
              disabled={!manzana}
              sx={{ width: { xs: "100%", sm: 140 } }}
            >
              <MenuItem value="">{manzana ? "Todos" : "Elegí manzana"}</MenuItem>
              {lotesDisponibles.map((opcion) => (
                <MenuItem key={opcion} value={opcion}>
                  {opcion}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              size="small"
              label="Año"
              value={anio}
              onChange={(e) => setAnio(e.target.value)}
              sx={{ width: { xs: "100%", sm: 130 } }}
            >
              <MenuItem value="">Todos</MenuItem>
              {aniosDisponibles.map((opcion) => (
                <MenuItem key={opcion} value={opcion}>
                  {opcion}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              size="small"
              label="Trimestre"
              value={trimestre}
              onChange={(e) => setTrimestre(e.target.value)}
              sx={{ width: { xs: "100%", sm: 150 } }}
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="1">T1 · Ene-Mar</MenuItem>
              <MenuItem value="2">T2 · Abr-Jun</MenuItem>
              <MenuItem value="3">T3 · Jul-Sep</MenuItem>
              <MenuItem value="4">T4 · Oct-Dic</MenuItem>
            </TextField>

            <TextField
              size="small"
              placeholder="Buscar por nombre..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              sx={{ width: { xs: "100%", sm: 230 }, flexGrow: 1 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">🔎</InputAdornment>
                ),
              }}
            />

            {hayFiltrosActivos && (
              <Button
                size="small"
                startIcon={<FilterAltOffIcon />}
                onClick={limpiarFiltros}
                sx={{ color: COLOR_NAVY }}
              >
                Limpiar filtros
              </Button>
            )}
          </Paper>

          {sinResultadosFiltro ? (
            <Paper
              sx={{
                p: 5,
                borderRadius: 3,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 1,
                color: "text.secondary",
              }}
            >
              <FilterAltOffIcon sx={{ fontSize: 34, color: COLOR_TEAL }} />
              <Typography fontWeight={700} color={COLOR_NAVY}>
                No hay resultados con estos filtros
              </Typography>
              <Button size="small" onClick={limpiarFiltros} sx={{ mt: 0.5 }}>
                Limpiar filtros
              </Button>
            </Paper>
          ) : (
            <>
              {/* KPIs */}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr 1fr",
                    sm: "repeat(3, 1fr)",
                    md: "repeat(5, 1fr)",
                  },
                  gap: 1.75,
                  mb: 2.5,
                }}
              >
                <KpiCard
                  icon={<ReceiptLongIcon />}
                  color={COLOR_NAVY}
                  label="Ventas"
                  value={kpis.cantidad}
                  sub={`${kpis.cancelados} canceladas`}
                />
                <KpiCard
                  icon={<PaidIcon />}
                  color={COLOR_SKY}
                  label="Valor vendido"
                  value={formatoCompacto(kpis.valorTotal)}
                  sub={formatoNumero(kpis.valorTotal)}
                />
                <KpiCard
                  icon={<AccountBalanceWalletIcon />}
                  color={COLOR_GREEN}
                  label="Cobrado"
                  value={formatoCompacto(kpis.montoCobrado)}
                  sub={formatoNumero(kpis.montoCobrado)}
                />
                <KpiCard
                  icon={<HourglassBottomIcon />}
                  color={COLOR_AMBER}
                  label="Saldo pendiente"
                  value={formatoCompacto(kpis.saldoPendiente)}
                  sub={formatoNumero(kpis.saldoPendiente)}
                />
                <KpiCard
                  icon={<TrendingUpIcon />}
                  color={COLOR_TEAL}
                  label="% cobrado"
                  value={`${kpis.pctCobrado.toFixed(1)}%`}
                  sub="sobre el valor vendido"
                />
              </Box>

              {/* FLUJO EN EL TIEMPO (gráfico de líneas, protagonista) + MAYORES SALDOS PENDIENTES */}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", md: "2fr 1fr" },
                  gap: 2.5,
                  mb: 2.5,
                  alignItems: "stretch",
                }}
              >
                <ChartCard title="Flujo de ventas y cobros en el tiempo" height={340} empty={flujoTemporal.length === 0}>
                  <ComposedChart data={flujoTemporal} margin={{ top: 10, right: 16, left: 0, bottom: 5 }}>
                    <defs>
                      <linearGradient id="gradVendido" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={COLOR_NAVY} stopOpacity={0.28} />
                        <stop offset="100%" stopColor={COLOR_NAVY} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef2f5" />
                    <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                    <YAxis tickFormatter={formatoCompacto} tick={{ fontSize: 11 }} width={55} />
                    <Tooltip formatter={(value) => formatoNumero(value)} />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="valor"
                      name="Vendido"
                      stroke={COLOR_NAVY}
                      strokeWidth={2.5}
                      fill="url(#gradVendido)"
                      dot={{ r: 3, fill: COLOR_NAVY }}
                      activeDot={{ r: 5 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="cobrado"
                      name="Cobrado"
                      stroke={COLOR_TEAL}
                      strokeWidth={3}
                      dot={{ r: 3.5, fill: COLOR_TEAL }}
                      activeDot={{ r: 6 }}
                    />
                  </ComposedChart>
                </ChartCard>

                <ChartCard title="Mayores saldos pendientes" height={340} empty={topDeudores.length === 0}>
                  <BarChart
                    data={topDeudores}
                    layout="vertical"
                    margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#eef2f5" />
                    <XAxis type="number" tickFormatter={formatoCompacto} tick={{ fontSize: 11 }} />
                    <YAxis type="category" dataKey="label" tick={{ fontSize: 11 }} width={90} />
                    <Tooltip
                      formatter={(value) => formatoNumero(value)}
                      labelFormatter={(label, payload) => payload?.[0]?.payload?.comprador || label}
                    />
                    <Bar dataKey="saldo" name="Saldo pendiente" fill={COLOR_AMBER} radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ChartCard>
              </Box>

              {/* USO DE SUELO + ESTADO DE CARTERA + VENTAS POR MANZANA, misma fila */}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "repeat(3, 1fr)" },
                  gap: 2.5,
                }}
              >
                <ChartCard title="Distribución por uso de suelo" height={260} empty={porUsoDeSuelo.length === 0}>
                  <PieChart>
                    <Pie
                      data={porUsoDeSuelo}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={0}
                      outerRadius={80}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {porUsoDeSuelo.map((entry, index) => (
                        <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ChartCard>

                <ChartCard title="Estado de cartera" height={260} empty={estadoCartera.length === 0}>
                  <PieChart>
                    <Pie
                      data={estadoCartera}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                    >
                      {estadoCartera.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ChartCard>

                <ChartCard title="Ventas por manzana" height={260} empty={porManzana.length === 0}>
                  <BarChart data={porManzana} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef2f5" />
                    <XAxis dataKey="manzana" tick={{ fontSize: 11 }} />
                    <YAxis tickFormatter={formatoCompacto} tick={{ fontSize: 11 }} width={55} />
                    <Tooltip
                      formatter={(value, name) => (name === "valor" ? formatoNumero(value) : value)}
                      labelFormatter={(label) => `Manzana ${label}`}
                    />
                    <Bar dataKey="valor" name="Valor vendido" fill={COLOR_SKY} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ChartCard>
              </Box>
            </>
          )}
        </>
      )}
        </>
      )}
    </Box>
  );
}
