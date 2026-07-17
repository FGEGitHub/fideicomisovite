import React, { useCallback, useEffect, useMemo, useState } from "react";
import servicionivel3 from "../../services/nivel3";
import SubirExcelMovimientos from "./subierexce";
import Tabla from "./tablamovimientos";
import MovimientosDashboard from "./MovimientosDashboard";
import { FILTROS_INICIALES, filtrarMovimientos, hayFiltrosActivos } from "./movimientosUtils";

import {
  Box,
  Button,
  TextField,
  Typography,
  MenuItem,
  Card,
  CardContent,
  Modal,
} from "@mui/material";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import { useTemaColores } from "../../context/ModoOscuroContext";

const COLOR_AQUA = "#14b8a6";

export default function FormMovimiento() {
  const { COLOR_NAVY, COLOR_TEAL, BG_CARD } = useTemaColores();

  const [mostrarForm, setMostrarForm] = useState(false);
  const [openExcel, setOpenExcel] = useState(false);

  const [tipo, setTipo] = useState("EGRESO");
  const [concepto, setConcepto] = useState("");
  const [monto, setMonto] = useState("");
  const [medio, setMedio] = useState("");
  const [detalle, setDetalle] = useState("");
  const [loadingForm, setLoadingForm] = useState(false);

  // Fuente única de datos: la tabla y las tarjetas de KPIs comparten el mismo
  // listado y el mismo estado de filtros, así lo que se filtra en la tabla
  // se refleja automáticamente en Ingresos / Egresos / Saldo / Registros.
  const [movimientos, setMovimientos] = useState([]);
  const [loadingDatos, setLoadingDatos] = useState(true);
  const [errorDatos, setErrorDatos] = useState(null);
  const [filtros, setFiltros] = useState(FILTROS_INICIALES);

  const mediosPago = [
    "Efectivo",
    "Transferencia",
    "Banco",
    "Tarjeta",
    "Cheque",
  ];

  const cargarMovimientos = useCallback(async () => {
    try {
      setLoadingDatos(true);
      setErrorDatos(null);
      const data = await servicionivel3.traermovimientos();
      setMovimientos(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error al traer movimientos:", err);
      setErrorDatos("No se pudo cargar la información de movimientos.");
    } finally {
      setLoadingDatos(false);
    }
  }, []);

  useEffect(() => {
    cargarMovimientos();
  }, [cargarMovimientos]);

  const movimientosFiltrados = useMemo(
    () => filtrarMovimientos(movimientos, filtros),
    [movimientos, filtros]
  );

  const handleFiltroChange = (campo, valor) => {
    setFiltros((prev) => ({ ...prev, [campo]: valor }));
  };

  const handleLimpiarFiltros = () => setFiltros(FILTROS_INICIALES);

  const handleConceptoActualizado = (id, nuevoConcepto) => {
    setMovimientos((prev) =>
      prev.map((m) => (m.id === id ? { ...m, concepto: nuevoConcepto } : m))
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!concepto || !monto || !medio) {
      alert("Complete los campos obligatorios");
      return;
    }

    setLoadingForm(true);

    const data = {
      tipo_operacion: tipo,
      concepto: concepto,
      monto: Number(monto),
      medio_pago: medio,
      descripcion: detalle,
    };

    try {
      await servicionivel3.enviarmovimiento(data);

      alert("Movimiento registrado");

      setConcepto("");
      setMonto("");
      setMedio("");
      setDetalle("");
      setMostrarForm(false);
      cargarMovimientos();
    } catch (err) {
      console.error(err);
      alert("Error al registrar el movimiento");
    }

    setLoadingForm(false);
  };

  return (
    <>
      {/* HEADER */}
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
          <Box
            sx={{
              width: 46,
              height: 46,
              borderRadius: "14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              background: `${COLOR_TEAL}1a`,
              color: COLOR_TEAL,
            }}
          >
            <AccountBalanceWalletIcon />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography fontWeight={800} fontSize={21} sx={{ color: COLOR_NAVY }} noWrap>
              Movimientos
            </Typography>
            <Typography sx={{ color: "text.secondary" }} fontSize={13}>
              Gestión y control general
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, flexWrap: "wrap" }}>
          <Button
            onClick={() => setOpenExcel(true)}
            startIcon={<UploadFileIcon />}
            sx={{
              borderRadius: 2.5,
              textTransform: "none",
              fontWeight: 700,
              fontSize: 13,
              px: 1.75,
              height: 40,
              color: COLOR_NAVY,
              background: `${COLOR_NAVY}14`,
              border: `1px solid ${COLOR_NAVY}3d`,
              "&:hover": { background: `${COLOR_NAVY}22`, border: `1px solid ${COLOR_NAVY}66` },
            }}
          >
            Cargar Excel
          </Button>

          <Button
            onClick={() => setMostrarForm(true)}
            startIcon={<AddCircleIcon />}
            sx={{
              borderRadius: 2.5,
              textTransform: "none",
              fontWeight: 700,
              fontSize: 13,
              px: 1.75,
              height: 40,
              color: COLOR_AQUA,
              background: `${COLOR_AQUA}14`,
              border: `1px solid ${COLOR_AQUA}3d`,
              "&:hover": { background: `${COLOR_AQUA}22`, border: `1px solid ${COLOR_AQUA}66` },
            }}
          >
            Registrar movimiento
          </Button>
        </Box>
      </Box>

      {/* MODAL EXCEL */}
{/* MODAL EXCEL */}
<Modal
  open={openExcel}
  onClose={() => setOpenExcel(false)}
>
  <Box
    sx={{
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      width: "100%",
      maxWidth: 700,
      px: 2,
    }}
  >
    <Card
      sx={{
        borderRadius: "22px",
        overflow: "hidden",
        boxShadow: "0 25px 60px rgba(0,0,0,0.25)",
      }}
    >
      {/* HEADER */}
      <Box
        sx={{
          background:
            "linear-gradient(90deg,#083b5c 0%, #0b5c76 55%, #148a8f 100%)",
          px: 3,
          py: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography
          sx={{
            color: "#fff",
            fontWeight: 800,
            fontSize: 20,
          }}
        >
          Cargar Excel
        </Typography>

        <Button
          onClick={() => setOpenExcel(false)}
          sx={{
            minWidth: "auto",
            color: "#fff",
            fontSize: 18,
          }}
        >
          ✕
        </Button>
      </Box>

      {/* BODY */}
      <Box
        sx={{
          p: 3,
          background: BG_CARD,
        }}
      >
        <SubirExcelMovimientos onSuccess={cargarMovimientos} />
      </Box>
    </Card>
  </Box>
</Modal>

      {/* FORMULARIO */}
      {/* MODAL REGISTRAR MOVIMIENTO */}
<Modal
  open={mostrarForm}
  onClose={() => setMostrarForm(false)}
>
  <Box
    sx={{
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      width: "100%",
      maxWidth: 520,
      px: 2,
    }}
  >
    <Card
      sx={{
        borderRadius: "22px",
        overflow: "hidden",
        boxShadow: "0 25px 60px rgba(0,0,0,0.25)",
      
      }}
    >
      {/* HEADER */}
      <Box
        sx={{
          background:
            "linear-gradient(90deg,#083b5c 0%, #0b5c76 55%, #148a8f 100%)",
          px: 3,
          py: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography
          sx={{
            color: "#fff",
            fontWeight: 800,
            fontSize: 20,
          }}
        >
          Registrar Movimiento
        </Typography>

        <Button
          onClick={() => setMostrarForm(false)}
          sx={{
            minWidth: "auto",
            color: "#fff",
            fontSize: 18,
          }}
        >
          ✕
        </Button>
      </Box>

      <CardContent sx={{ p: 3 }}>
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <TextField
            select
            label="Tipo"
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            size="small"
          >
            <MenuItem value="EGRESO">Egreso</MenuItem>
            <MenuItem value="INGRESO">Ingreso</MenuItem>
          </TextField>

          <TextField
            label="Concepto"
            value={concepto}
            onChange={(e) => setConcepto(e.target.value)}
            size="small"
          />

          <TextField
            label="Monto"
            type="number"
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
            size="small"
          />

          <TextField
            select
            label="Medio de pago"
            value={medio}
            onChange={(e) => setMedio(e.target.value)}
            size="small"
          >
            <MenuItem value="">Seleccionar</MenuItem>

            {mediosPago.map((m, i) => (
              <MenuItem key={i} value={m}>
                {m}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Detalle"
            value={detalle}
            onChange={(e) => setDetalle(e.target.value)}
            size="small"
          />

       <Button
  type="submit"
  disabled={loadingForm}
  variant="contained"
  sx={{
     mt: 1,
  background: "#14919B",
  color: "#fff",
  borderRadius: "10px",
  textTransform: "none",
  fontWeight: 700,
  fontSize: "13px",

  minWidth: 140,
  width: "fit-content",
  height: 34,

  px: 2,

  alignSelf: "center",

  boxShadow: "none",

  "&:hover": {
    background: "#117C85",
    boxShadow: "none",
    },
  }}
>
  {loadingForm ? "Guardando..." : "Guardar movimiento"}
</Button>
        </Box>
      </CardContent>
    </Card>
  </Box>
</Modal>

      {/* ANÁLISIS DE MOVIMIENTOS (KPIs) — altura propia según contenido, sin robarle espacio a la tabla */}
      <Box
        sx={{
          mb: 2,
          flexShrink: 0,
        }}
      >
        <MovimientosDashboard
          movimientos={movimientosFiltrados}
          totalRegistros={movimientos.length}
          filtrosActivos={hayFiltrosActivos(filtros)}
          loading={loadingDatos}
          error={errorDatos}
          onReintentar={cargarMovimientos}
        />
      </Box>

      {/* TABLA */}
      <Tabla
        movimientos={movimientos}
        filtros={filtros}
        onFiltroChange={handleFiltroChange}
        onLimpiarFiltros={handleLimpiarFiltros}
        onConceptoActualizado={handleConceptoActualizado}
      />
    </>
  );
}