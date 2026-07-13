import { useEffect, useMemo, useState, useCallback } from "react";
import servicionivel3 from "../../services/nivel3";

import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  Alert,
  Button,
} from "@mui/material";

import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import InboxIcon from "@mui/icons-material/Inbox";

import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

const COLOR_NAVY = "#083b5c";
const COLOR_TEAL = "#148D8D";
const COLOR_GREEN = "#15803d";
const COLOR_RED = "#dc2626";
const MESES_CORTOS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

const formatoNumero = (valor) => {
  const numero = Number(valor || 0);
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 2,
  }).format(numero);
};

const formatoCompacto = (valor) => {
  return new Intl.NumberFormat("es-AR", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(Number(valor || 0));
};

// El backend puede devolver el mismo movimiento más de una vez (ej. reimportaciones de Excel).
// Mismo criterio que usa resumen1.jsx para no inflar los totales.
const deduplicarMovimientos = (lista) => {
  const vistos = new Set();

  return lista.filter((m) => {
    const key = [
      String(m.fecha || "").replace("T", " ").split(".")[0].split(" ")[0].trim(),
      String(m.cuil_cuit || "").trim(),
      Number(m.debito || 0).toFixed(2),
      Number(m.credito || 0).toFixed(2),
      String(m.descripcion || "").trim().toLowerCase(),
      String(m.nombre_razon || "").trim().toLowerCase(),
    ].join("|");

    if (vistos.has(key)) return false;
    vistos.add(key);
    return true;
  });
};

// La fecha viene como "AAAA-MM-DD ..." o "DD/MM/AAAA ...", según el origen del movimiento.
const parseFecha = (fecha) => {
  if (!fecha) return null;
  const limpia = String(fecha).replace("T", " ").split(".")[0];
  const fechaParte = limpia.split(" ")[0];

  let anio;
  let mes;

  if (fechaParte.includes("-")) {
    [anio, mes] = fechaParte.split("-").map((p) => parseInt(p, 10));
  } else if (fechaParte.includes("/")) {
    const partes = fechaParte.split("/").map((p) => parseInt(p, 10));
    mes = partes[1];
    anio = partes[2];
  } else {
    return null;
  }

  if (!mes || !anio || mes < 1 || mes > 12) return null;
  if (anio < 100) anio += 2000;

  return { anio, mes };
};

function KpiCard({ icon, label, value, color, sub }) {
  return (
    <Paper
      sx={{
        p: 1.25,
        borderRadius: 2.5,
        display: "flex",
        alignItems: "center",
        gap: 1,
        boxShadow: "0 6px 18px rgba(8,59,92,0.07)",
        border: "1px solid rgba(8,59,92,0.06)",
        minWidth: 0,
      }}
    >
      <Box
        sx={{
          width: 34,
          height: 34,
          borderRadius: "10px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          background: `${color}1a`,
          color,
          "& svg": { fontSize: 18 },
        }}
      >
        {icon}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography
          fontSize={10.5}
          fontWeight={700}
          color="text.secondary"
          sx={{ textTransform: "uppercase", letterSpacing: 0.4, lineHeight: 1.2 }}
        >
          {label}
        </Typography>
        <Typography fontSize={15} fontWeight={800} color={COLOR_NAVY} noWrap lineHeight={1.25}>
          {value}
        </Typography>
        {sub && (
          <Typography fontSize={10} color="text.secondary" noWrap lineHeight={1.2}>
            {sub}
          </Typography>
        )}
      </Box>
    </Paper>
  );
}

function ChartCard({ title, height = 240, children, empty }) {
  return (
    <Paper
      sx={{
        p: 1.5,
        borderRadius: 2.5,
        boxShadow: "0 6px 18px rgba(8,59,92,0.07)",
        border: "1px solid rgba(8,59,92,0.06)",
        height: "100%",
      }}
    >
      <Typography fontWeight={800} fontSize={13} color={COLOR_NAVY} sx={{ mb: 0.5 }}>
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

export default function MovimientosDashboard() {
  const [movimientos, setMovimientos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const traerMovimientos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await servicionivel3.traermovimientos();
      setMovimientos(deduplicarMovimientos(Array.isArray(data) ? data : []));
    } catch (err) {
      console.error("Error al traer movimientos:", err);
      setError("No se pudo cargar el análisis de movimientos.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    traerMovimientos();
  }, [traerMovimientos]);

  const movimientosConFecha = useMemo(
    () => movimientos.map((m) => ({ ...m, __fecha: parseFecha(m.fecha) })),
    [movimientos]
  );

  const filtrados = movimientosConFecha;

  const kpis = useMemo(() => {
    const totalIngresos = filtrados.reduce((acc, m) => acc + Number(m.credito || 0), 0);
    const totalEgresos = filtrados.reduce((acc, m) => acc + Number(m.debito || 0), 0);

    const ultimoMovimiento = [...filtrados].sort((a, b) => {
      const fa = a.__fecha ? a.__fecha.anio * 100 + a.__fecha.mes : 0;
      const fb = b.__fecha ? b.__fecha.anio * 100 + b.__fecha.mes : 0;
      if (fa !== fb) return fb - fa;
      return (b.id || 0) - (a.id || 0);
    })[0];

    return {
      totalIngresos,
      totalEgresos,
      saldoActual: Number(ultimoMovimiento?.saldo || 0),
      cantidad: filtrados.length,
    };
  }, [filtrados]);

  const flujoTemporal = useMemo(() => {
    const grupos = new Map();

    filtrados.forEach((m) => {
      if (!m.__fecha) return;
      const key = `${m.__fecha.anio}-${String(m.__fecha.mes).padStart(2, "0")}`;

      if (!grupos.has(key)) {
        grupos.set(key, {
          key,
          label: `${MESES_CORTOS[m.__fecha.mes - 1]} ${String(m.__fecha.anio).slice(-2)}`,
          ingresos: 0,
          egresos: 0,
        });
      }

      const grupo = grupos.get(key);
      grupo.ingresos += Number(m.credito || 0);
      grupo.egresos += Number(m.debito || 0);
    });

    return [...grupos.values()].sort((a, b) => a.key.localeCompare(b.key));
  }, [filtrados]);

  const sinMovimientos = !loading && !error && movimientosConFecha.length === 0;

  return (
    <Box sx={{ mb: 0 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} action={<Button size="small" onClick={traerMovimientos}>Reintentar</Button>}>
          {error}
        </Alert>
      )}

      {loading && movimientos.length === 0 ? (
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 6, gap: 1.5 }}>
          <CircularProgress size={28} sx={{ color: COLOR_TEAL }} />
          <Typography color="text.secondary" fontSize={13}>
            Cargando análisis de movimientos...
          </Typography>
        </Box>
      ) : sinMovimientos ? (
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
          <InboxIcon sx={{ fontSize: 32, color: COLOR_TEAL }} />
          <Typography fontWeight={700} color={COLOR_NAVY}>
            Todavía no hay movimientos cargados
          </Typography>
        </Paper>
      ) : (
        <>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(4, 1fr)" },
              gap: 1,
              mb: 1,
            }}
          >
            <KpiCard
              icon={<TrendingUpIcon />}
              color={COLOR_GREEN}
              label="Ingresos"
             
              sub={formatoNumero(kpis.totalIngresos)}
            />
            <KpiCard
              icon={<TrendingDownIcon />}
              color={COLOR_RED}
              label="Egresos"
              
              sub={formatoNumero(kpis.totalEgresos)}
            />
            <KpiCard
              icon={<AccountBalanceWalletIcon />}
              color={COLOR_TEAL}
              label="Saldo actual"
              
              sub={formatoNumero(kpis.saldoActual)}
            />
            <KpiCard
              icon={<ReceiptLongIcon />}
              color={COLOR_NAVY}
              label="Registros cargados"
              value={kpis.cantidad}
              
            />
          </Box>

          <Box>
            <ChartCard title="Flujo de ingresos y egresos" height={170} empty={flujoTemporal.length === 0}>
              <ComposedChart data={flujoTemporal} margin={{ top: 10, right: 16, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="gradIngresos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={COLOR_GREEN} stopOpacity={0.28} />
                    <stop offset="100%" stopColor={COLOR_GREEN} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef2f5" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={formatoCompacto} tick={{ fontSize: 10 }} width={50} />
                <Tooltip formatter={(value) => formatoNumero(value)} />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="ingresos"
                  name="Ingresos"
                  stroke={COLOR_GREEN}
                  strokeWidth={2.5}
                  fill="url(#gradIngresos)"
                  dot={{ r: 3, fill: COLOR_GREEN }}
                />
                <Line
                  type="monotone"
                  dataKey="egresos"
                  name="Egresos"
                  stroke={COLOR_RED}
                  strokeWidth={3}
                  dot={{ r: 3.5, fill: COLOR_RED }}
                />
              </ComposedChart>
            </ChartCard>
          </Box>
        </>
      )}
    </Box>
  );
}
