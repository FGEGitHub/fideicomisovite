import * as React from "react";
import { useMemo, useState } from "react";
import servicionivel3 from "../../services/nivel3";
import { parseFechaCorta, valorFecha, filtrarMovimientos, hayFiltrosActivos } from "./movimientosUtils";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Typography,
  TextField,
  MenuItem,
  Chip,
} from "@mui/material";
import { Autocomplete } from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import { useTemaColores } from "../../context/ModoOscuroContext";

const CONCEPTOS = [];
const categoriasEgresos = [
  "Honorarios Profesionales",
  "Servicios de Seguridad",
  "Servicio Seguridad Adicional",
  "Reintegro de Sueldos",
  "Reparación mantenimiento",
  "Alquileres Oficinas",
  "Cobranza SC Parque",
  "Servicios personales",
  "Otros egresos",
  "Baños químicos",
  "Cuotas",
  "Expensas",
  "Servicios",
  "Intereses",
  "Otros ingresos",
  "Compra muebles",
  "Impuestos DGR",
  "Impuestos AFIP",
  "Comisiones bancarias"
];
export default function MovimientosTabla({ movimientos, filtros, onFiltroChange, onLimpiarFiltros, onConceptoActualizado }) {
  const { COLOR_TEAL, COLOR_GREEN, COLOR_RED, BG_PAGE, BG_INPUT, TEXT_FUERTE } = useTemaColores();

  const [openDialog, setOpenDialog] = useState(false);
  const [movSeleccionado, setMovSeleccionado] = useState(null);
  const [nuevoConcepto, setNuevoConcepto] = useState("");

  const { tipo: filtroTipo, mes: filtroMes, anio: filtroAnio, concepto: filtroConcepto, cuit: filtroCuit } = filtros;
  const filtrosActivos = hayFiltrosActivos(filtros);

  const abrirDialog = (row) => {
    setMovSeleccionado(row);
    setNuevoConcepto(row.concepto || "");
    setOpenDialog(true);
  };

  const cerrarDialog = () => {
    setOpenDialog(false);
    setMovSeleccionado(null);
  };

  const formatearFecha = (fecha) => {
    const { dia, mes, anio } = parseFechaCorta(fecha);
    return `${dia}/${mes}/${anio}`;
  };

  const parseFechaHora = (fecha) => {
    if (!fecha) return { dia: "-", mes: "-", anio: "-", hora: "" };
    const limpia = fecha.replace("T", " ").split(".")[0];
    const [fechaParte, horaParte] = limpia.split(" ");
    if (fechaParte?.includes("-")) {
      const [anio, mes, dia] = fechaParte.split("-");
      return { dia, mes, anio, hora: horaParte || "" };
    }
    if (fechaParte?.includes("/")) {
      const [dia, mes, anio] = fechaParte.split("/");
      return { dia, mes, anio, hora: horaParte || "" };
    }
    return { dia: "-", mes: "-", anio: "-", hora: "" };
  };

  const formatearFechaHora = (fecha) => {
    const { dia, mes, anio, hora } = parseFechaHora(fecha);
    return `${dia}/${mes}/${anio} ${hora?.substring(0, 5)}`;
  };

  const getMes = (fecha) => parseFechaCorta(fecha).mes;
  const getAnio = (fecha) => parseFechaCorta(fecha).anio;

  const nombreMes = (mes) =>
    ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"][Number(mes)-1] || "-";

  const guardarConcepto = async () => {
    try {
      await servicionivel3.mofificarmconcepto({
        id: movSeleccionado.id,
        concepto: nuevoConcepto,
      });

      onConceptoActualizado(movSeleccionado.id, nuevoConcepto);

      cerrarDialog();
    } catch (error) {
      console.error(error);
    }
  };

  const formatearMoneda = (valor) =>
    !valor ? "-" : `$ ${Number(valor).toLocaleString("es-AR", { minimumFractionDigits: 2 })}`;

  const conceptosDisponibles = [...new Set(movimientos.map((m) => m.concepto).filter(Boolean))].sort(
    (a, b) => a.localeCompare(b, "es")
  );

const filtered = useMemo(
  () =>
    filtrarMovimientos(movimientos, filtros).sort((a, b) => {
      const fechaA = valorFecha(a.fecha);
      const fechaB = valorFecha(b.fecha);

      if (fechaA !== fechaB) return fechaB - fechaA;

      return b.id - a.id;
    }),
  [movimientos, filtros]
);
return (


  
  <Box
    sx={{
      flex: 1,
      display: "flex",
      flexDirection: "column",
      minHeight: 0,
      overflow: "auto",
      width: "100%",
    }}
  >
<Box
  sx={{
    background: BG_PAGE,
    borderRadius: "14px",
    p: 1.25,
    mb: 2,
  }}
>
  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: filtrosActivos ? 1 : 0 }}>
   

    {filtrosActivos && (
      <Button
        size="small"
        onClick={onLimpiarFiltros}
        startIcon={<ClearIcon sx={{ fontSize: 15 }} />}
        sx={{
          fontSize: 11.5,
          fontWeight: 600,
          textTransform: "none",
          color: COLOR_TEAL,
          minWidth: "auto",
        }}
      >
        Limpiar filtros
      </Button>
    )}
  </Box>

  <Box
    sx={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
      gap: 1,
    }}
  >
    {[
      <TextField
        key="tipo"
        select
        value={filtroTipo}
        onChange={(e) => onFiltroChange("tipo", e.target.value)}
        size="small"
        label="Tipo"
        fullWidth
      >
        <MenuItem value="">Todos</MenuItem>
        <MenuItem value="INGRESO">Ingreso</MenuItem>
        <MenuItem value="EGRESO">Egreso</MenuItem>
      </TextField>,

      <TextField
        key="mes"
        select
        label="Mes"
        value={filtroMes}
        onChange={(e) => onFiltroChange("mes", e.target.value)}
        size="small"
        fullWidth
      >
        <MenuItem value="">Todos</MenuItem>
        {[...Array(12)].map((_, i) => {
          const mes = (i + 1).toString().padStart(2, "0");
          return (
            <MenuItem key={mes} value={mes}>
              {nombreMes(mes)}
            </MenuItem>
          );
        })}
      </TextField>,

      <TextField
        key="anio"
        select
        label="Año"
        value={filtroAnio}
        onChange={(e) => onFiltroChange("anio", e.target.value)}
        size="small"
        fullWidth
      >
        <MenuItem value="">Todos</MenuItem>
        {[2023, 2024, 2025, 2026].map((anio) => (
          <MenuItem key={anio} value={anio.toString()}>
            {anio}
          </MenuItem>
        ))}
      </TextField>,

      <TextField
        key="concepto"
        select
        label="Concepto"
        value={filtroConcepto}
        onChange={(e) => onFiltroChange("concepto", e.target.value)}
        size="small"
        fullWidth
      >
        <MenuItem value="">Todos</MenuItem>
        {conceptosDisponibles.map((concepto) => (
          <MenuItem key={concepto} value={concepto}>
            {concepto}
          </MenuItem>
        ))}
      </TextField>,

      <TextField
        key="cuit"
        label="CUIT/CUIL"
        placeholder="Buscar por CUIT/CUIL"
        value={filtroCuit}
        onChange={(e) => onFiltroChange("cuit", e.target.value)}
        size="small"
        fullWidth
      />,
    ].map((campo) => (
      <Box
        key={campo.key}
        sx={{
          "& .MuiOutlinedInput-root": {
            borderRadius: "8px",
            background: BG_INPUT,
            fontSize: 12.5,
            "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: COLOR_TEAL },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: COLOR_TEAL },
          },
          "& .MuiOutlinedInput-input, & .MuiSelect-select": {
            padding: "6.5px 10px",
          },
          "& .MuiInputLabel-root": { fontSize: 12.5 },
          "& .MuiInputLabel-root.Mui-focused": { color: COLOR_TEAL },
        }}
      >
        {campo}
      </Box>
    ))}
  </Box>
</Box>

<TableContainer
  component={Paper}
  sx={{
    flex: 1,
    minHeight: 0,
    width: "100%",
    overflowX: "auto", // 🔥 scroll horizontal SOLO tabla
    overflowY: "auto",
    boxShadow: "none",
    borderRadius: 2,
    backgroundColor: BG_PAGE,
    backgroundImage: "none",
  }}
>
<Table
  stickyHeader
  size="small"
  sx={{
    "& td, & th": {
      textAlign: "left"
    }
  }}
>
    {/* Anchos pensados para que la tabla completa entre en pantallas de notebook (~1280-1440px) sin scroll excesivo */}
    <colgroup>
      <col style={{ width: "68px" }} />

      <col style={{ width: "46px" }} />
      <col style={{ width: "46px" }} />
      <col style={{ width: "64px" }} />
      <col style={{ width: "190px" }} />
      <col style={{ width: "150px" }} />
      <col style={{ width: "90px" }} />
      <col style={{ width: "85px" }} />
      <col style={{ width: "85px" }} />
      <col style={{ width: "130px" }} />
      <col style={{ width: "100px" }} />
      <col style={{ width: "100px" }} /> <col style={{ width: "64px" }} />
    </colgroup>

        <TableHead>
          <TableRow>
            {[
              "Fecha",
             
              "Mes",
              "Año",
              "Tipo",
              "Descripción",
              "Razón",
              "CUIT",
              "Débito",
              "Crédito",
              "Concepto",
              "Categoría",
              "Saldo", 
               "Acciones"
            
            ].map((h) => (
              <TableCell
                key={h}
                sx={{
                  fontWeight: 800,
                  color: TEXT_FUERTE,
                  backgroundColor: BG_INPUT,
                  borderBottom: `2px solid ${COLOR_TEAL}`,
                  py: 0.8,
                  px: 0.8,
                  fontSize: 11,
                }}
              >
                {h}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>

        <TableBody>
          {filtered.map((row, i) => (
            <TableRow key={i}>
              
              {/* FECHA */}
              <TableCell sx={{ fontSize: 11, width: 68 }}>
                {formatearFecha(row.fecha)}
              </TableCell>



              {/* MES */}
              <TableCell sx={{ fontSize: 11, width: 46 }}>
                {nombreMes(getMes(row.fecha))}
              </TableCell>

              {/* AÑO */}
              <TableCell sx={{ fontSize: 11, width: 46 }}>
                {getAnio(row.fecha)}
              </TableCell>

              {/* TIPO */}
              <TableCell sx={{ width: 64 }}>
                <Chip
                  label={row.tipo_operacion}
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: 10,
                    borderRadius: 999,
                  }}
                />
              </TableCell>

              {/* DESCRIPCIÓN (MULTILINEA) */}
              <TableCell
                sx={{
  fontSize: 11,
  whiteSpace: "normal",
  wordBreak: "break-word",
  lineHeight: 1.2,
}}
              >
                {row.descripcion}
              </TableCell>

              {/* RAZON SOCIAL */}
              <TableCell
               sx={{
  fontSize: 11,
  whiteSpace: "normal",
  wordBreak: "break-word",
  lineHeight: 1.2,
}}
              >
                {row.nombre_razon}
              </TableCell>

              {/* CUIT */}
              <TableCell sx={{ fontSize: 11, width: 90 }}>
                {row.cuil_cuit}
              </TableCell>

              {/* DEBITO */}
              <TableCell align="right" sx={{ width: 85 }}>
                <Typography sx={{ color: COLOR_RED, fontSize: 11 }}>
                  {formatearMoneda(row.debito)}
                </Typography>
              </TableCell>

              {/* CREDITO */}
              <TableCell align="right" sx={{ width: 85 }}>
                <Typography sx={{ color: COLOR_GREEN, fontSize: 11 }}>
                  {formatearMoneda(row.credito)}
                </Typography>
              </TableCell>

              {/* CONCEPTO */}
              <TableCell
              sx={{
  fontSize: 11,
  whiteSpace: "normal",
  wordBreak: "break-word",
  lineHeight: 1.2,
}}
              >
                {row.concepto}
              </TableCell>

              {/* CATEGORIA */}
              <TableCell sx={{ width: 100 }}>
                <Chip
                  label={row.categoria_general}
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: 10,
                  }}
                />
              </TableCell>

              {/* SALDO */}
             <TableCell
  sx={{
    width: 100,
    fontWeight: 700,
    fontSize: 12, // 🔥 tamaño
    color: COLOR_GREEN, // 🔥 color número
  }}
>
  {formatearMoneda(row.saldo)}
</TableCell>
 <TableCell>
<Button
  variant="contained"
  size="small"
  onClick={() => abrirDialog(row)}
  sx={{
     minWidth: "60px",
    height: "26px",
    fontSize: "11px",
    fontWeight: 500,
    textTransform: "none",
    borderRadius: "8px",
    px: 1.5,
    boxShadow: "none",
  }}
>
  Editar
</Button>
</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
    <Dialog
  open={openDialog}
  onClose={cerrarDialog}
  maxWidth="sm"
  fullWidth
>
  <DialogTitle>
    Cambiar concepto
  </DialogTitle>

  <DialogContent>
 <Autocomplete
  freeSolo
  options={categoriasEgresos}
  value={nuevoConcepto}
  onChange={(event, newValue) =>
    setNuevoConcepto(newValue || "")
  }
  onInputChange={(event, newInputValue) =>
    setNuevoConcepto(newInputValue)
  }
  renderInput={(params) => (
    <TextField
      {...params}
      label="Concepto"
      margin="normal"
      fullWidth
    />
  )}
/>
  </DialogContent>

  <DialogActions>
    <Button onClick={cerrarDialog}>
      Cancelar
    </Button>

    <Button
      variant="contained"
      onClick={guardarConcepto}
    >
      Guardar
    </Button>
  </DialogActions>
</Dialog>
  </Box>
);
}