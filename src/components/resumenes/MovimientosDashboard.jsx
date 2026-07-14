import { useMemo } from "react";

import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  Alert,
  Button,
  Chip,
} from "@mui/material";

import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import InboxIcon from "@mui/icons-material/Inbox";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import { useTemaColores, useModoOscuro } from "../../context/ModoOscuroContext";

const formatoNumero = (valor) => {
  const numero = Number(valor || 0);
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 2,
  }).format(numero);
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
  const { oscuro, colores } = useModoOscuro();
  const { COLOR_NAVY, BORDER, SHADOW_CARD } = colores;

  // En modo oscuro el gris tenue de "text.secondary" queda poco legible sobre
  // las cards oscuras; ahí usamos blanco pleno para label/valor.
  const colorTexto = oscuro ? "#fff" : "text.secondary";
  const colorValor = oscuro ? "#fff" : COLOR_NAVY;

  return (
    <Paper
      sx={{
        p: 1.25,
        borderRadius: 2.5,
        display: "flex",
        alignItems: "center",
        gap: 1,
        boxShadow: SHADOW_CARD,
        border: `1px solid ${BORDER}`,
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
          sx={{ color: colorTexto, textTransform: "uppercase", letterSpacing: 0.4, lineHeight: 1.2 }}
        >
          {label}
        </Typography>
        <Typography fontSize={15} fontWeight={800} sx={{ color: colorValor }} noWrap lineHeight={1.25}>
          {value}
        </Typography>
        {sub && (
          <Typography fontSize={10} sx={{ color: colorTexto }} noWrap lineHeight={1.2}>
            {sub}
          </Typography>
        )}
      </Box>
    </Paper>
  );
}

export default function MovimientosDashboard({
  movimientos,
  totalRegistros,
  filtrosActivos,
  loading,
  error,
  onReintentar,
}) {
  const { COLOR_NAVY, COLOR_TEAL, COLOR_GREEN, COLOR_RED } = useTemaColores();

  const movimientosConFecha = useMemo(
    () => movimientos.map((m) => ({ ...m, __fecha: parseFecha(m.fecha) })),
    [movimientos]
  );

  const kpis = useMemo(() => {
    const totalIngresos = movimientosConFecha.reduce((acc, m) => acc + Number(m.credito || 0), 0);
    const totalEgresos = movimientosConFecha.reduce((acc, m) => acc + Number(m.debito || 0), 0);

    const ultimoMovimiento = [...movimientosConFecha].sort((a, b) => {
      const fa = a.__fecha ? a.__fecha.anio * 100 + a.__fecha.mes : 0;
      const fb = b.__fecha ? b.__fecha.anio * 100 + b.__fecha.mes : 0;
      if (fa !== fb) return fb - fa;
      return (b.id || 0) - (a.id || 0);
    })[0];

    return {
      totalIngresos,
      totalEgresos,
      saldoActual: Number(ultimoMovimiento?.saldo || 0),
      cantidad: movimientosConFecha.length,
    };
  }, [movimientosConFecha]);

  const sinMovimientos = !loading && !error && totalRegistros === 0;
  const sinResultadosFiltro = !loading && !error && totalRegistros > 0 && movimientosConFecha.length === 0;

  return (
    <Box sx={{ mb: 0 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} action={<Button size="small" onClick={onReintentar}>Reintentar</Button>}>
          {error}
        </Alert>
      )}

      {filtrosActivos && !loading && !sinMovimientos && (
        <Chip
          icon={<FilterAltIcon sx={{ fontSize: 15 }} />}
          label={`Datos filtrados: ${kpis.cantidad} de ${totalRegistros} registros`}
          size="small"
          sx={{
            mb: 1,
            fontSize: 11.5,
            fontWeight: 600,
            color: COLOR_TEAL,
            background: `${COLOR_TEAL}1f`,
            "& .MuiChip-icon": { color: COLOR_TEAL },
          }}
        />
      )}

      {loading ? (
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 6, gap: 1.5 }}>
          <CircularProgress size={28} sx={{ color: COLOR_TEAL }} />
          <Typography sx={{ color: "text.secondary" }} fontSize={13}>
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
          <Typography fontWeight={700} sx={{ color: COLOR_NAVY }}>
            Todavía no hay movimientos cargados
          </Typography>
        </Paper>
      ) : sinResultadosFiltro ? (
        <Paper
          sx={{
            p: 3,
            borderRadius: 3,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 1,
          }}
        >
          <FilterAltIcon sx={{ fontSize: 28, color: COLOR_TEAL }} />
          <Typography fontWeight={700} sx={{ color: COLOR_NAVY }}>
            Ningún movimiento coincide con los filtros aplicados
          </Typography>
        </Paper>
      ) : (
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
            label={filtrosActivos ? "Saldo del filtro" : "Saldo actual"}

            sub={formatoNumero(kpis.saldoActual)}
          />
          <KpiCard
            icon={<ReceiptLongIcon />}
            color={COLOR_NAVY}
            label={filtrosActivos ? "Registros filtrados" : "Registros cargados"}
            value={kpis.cantidad}

          />
        </Box>
      )}
    </Box>
  );
}
