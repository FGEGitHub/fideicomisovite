import * as React from "react";
import { useEffect, useState } from "react";
import servicionivel3 from "../../services/nivel3";
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
import FilterAltIcon from "@mui/icons-material/FilterAlt";

const COLOR_NAVY = "#083b5c";
const COLOR_TEAL = "#148D8D";

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
export default function MovimientosTabla() {
  const [movimientos, setMovimientos] = useState([]);
  const [search, setSearch] = useState("");
 const [filtroTipo, setFiltroTipo] = useState("");
const [filtroMes, setFiltroMes] = useState("");
const [filtroAnio, setFiltroAnio] = useState("");
const [filtroCuit, setFiltroCuit] = useState("");
const [filtroFecha, setFiltroFecha] = useState("");
const [filtroConcepto, setFiltroConcepto] = useState("");
  const [ordenCampo, setOrdenCampo] = useState("fecha");
  const [ordenDireccion, setOrdenDireccion] = useState("desc");

  const [openDialog, setOpenDialog] = useState(false);
  const [movSeleccionado, setMovSeleccionado] = useState(null);
  const [nuevoConcepto, setNuevoConcepto] = useState("");

  useEffect(() => {
    traerMovimientos();
  }, []);

  const traerMovimientos = async () => {
    try {
      const data = await servicionivel3.traermovimientos();
      setMovimientos(data);
    } catch (error) {
      console.error(error);
    }
  };

  const abrirDialog = (row) => {
    setMovSeleccionado(row);
    setNuevoConcepto(row.concepto || "");
    setOpenDialog(true);
  };

  const cerrarDialog = () => {
    setOpenDialog(false);
    setMovSeleccionado(null);
  };

  const parseFecha = (fecha) => {
    if (!fecha) return { dia: "-", mes: "-", anio: "-" };
    if (fecha.includes("-")) {
      const [anio, mes, dia] = fecha.split(" ")[0].split("-");
      return { dia, mes, anio };
    }
    if (fecha.includes("/")) {
      const [dia, mes, anio] = fecha.split(" ")[0].split("/");
      return { dia, mes, anio };
    }
    return { dia: "-", mes: "-", anio: "-" };
  };

  const formatearFecha = (fecha) => {
    const { dia, mes, anio } = parseFecha(fecha);
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

  const valorFecha = (fecha) => {
    if (!fecha) return 0;
    const limpia = fecha.replace("T", " ").split(".")[0];
    if (limpia.includes("-")) return new Date(limpia).getTime();
    if (limpia.includes("/")) {
      const [dia, mes, anio] = limpia.split(" ")[0].split("/");
      return new Date(`${anio}-${mes}-${dia}`).getTime();
    }
    return 0;
  };

  const getMes = (fecha) => parseFecha(fecha).mes;
  const getAnio = (fecha) => parseFecha(fecha).anio;

  const nombreMes = (mes) =>
    ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"][Number(mes)-1] || "-";

  const guardarConcepto = async () => {
    try {
      await servicionivel3.mofificarmconcepto({
        id: movSeleccionado.id,
        concepto: nuevoConcepto,
      });

      setMovimientos((prev) =>
        prev.map((m) =>
          m.id === movSeleccionado.id ? { ...m, concepto: nuevoConcepto } : m
        )
      );

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

const filtered = movimientos
  .filter((m) => {
    const fecha = parseFecha(m.fecha);

    // 🔥 TIPO (arreglado)
    const coincideTipo =
      !filtroTipo ||
      (filtroTipo === "INGRESO" && Number(m.credito) > 0) ||
      (filtroTipo === "EGRESO" && Number(m.debito) > 0);

    // 🔥 MES (exacto)
    const coincideMes =
      !filtroMes ||
      fecha.mes === filtroMes;

    // 🔥 AÑO (exacto)
    const coincideAnio =
      !filtroAnio ||
      fecha.anio === filtroAnio;

    // 🔥 CUIT
    const coincideCuit =
      !filtroCuit ||
      (m.cuil_cuit || "")
        .toString()
        .includes(filtroCuit);

    // 🔥 FECHA CARGA (robusta)
    const coincideFecha =
      !filtroFecha ||
      valorFecha(m.fechacarga) === valorFecha(filtroFecha);

    // 🔥 CONCEPTO (exacto, ahora que es un desplegable)
    const coincideConcepto =
      !filtroConcepto || (m.concepto || "") === filtroConcepto;

    return (
      coincideTipo &&
      coincideMes &&
      coincideAnio &&
      coincideCuit &&
      coincideFecha &&
      coincideConcepto
    );
  })
  .sort((a, b) => {
    const fechaA = valorFecha(a.fecha);
    const fechaB = valorFecha(b.fecha);

    if (fechaA !== fechaB) return fechaB - fechaA;

    return b.id - a.id;
  });
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
    background: "#fff",
    borderRadius: "16px",
    p: 2.25,
    mb: 2,
    border: "1px solid rgba(8,59,92,0.08)",
    boxShadow: "0 4px 14px rgba(8,59,92,0.05)",
  }}
>
  <Box
    sx={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
      gap: 1.5,
    }}
  >
    {[
      <TextField
        key="tipo"
        select
        value={filtroTipo}
        onChange={(e) => setFiltroTipo(e.target.value)}
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
        onChange={(e) => setFiltroMes(e.target.value)}
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
        onChange={(e) => setFiltroAnio(e.target.value)}
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
        onChange={(e) => setFiltroConcepto(e.target.value)}
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
        onChange={(e) => setFiltroCuit(e.target.value)}
        size="small"
        fullWidth
      />,
    ].map((campo) => (
      <Box
        key={campo.key}
        sx={{
          "& .MuiOutlinedInput-root": {
            borderRadius: "10px",
            background: "#fbfdfe",
            "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: COLOR_TEAL },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: COLOR_TEAL },
          },
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
    {/* 🔥 VA ACÁ (ANTES DEL HEAD) */}
    <colgroup>
      <col style={{ width: "70px" }} />
     
      <col style={{ width: "50px" }} />
      <col style={{ width: "50px" }} />
      <col style={{ width: "75px" }} />
      <col style={{ width: "250px" }} />
      <col style={{ width: "200px" }} />
      <col style={{ width: "70px" }} />
      <col style={{ width: "80px" }} />
      <col style={{ width: "100px" }} />
      <col style={{ width: "170px" }} />
      <col style={{ width: "90px" }} />
      <col style={{ width: "130px" }} /> <col style={{ width: "70px" }} />
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
                  color: "#fff",
                  backgroundColor: "#0799b6",
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
              <TableCell sx={{ fontSize: 11, width: 80 }}>
                {formatearFecha(row.fecha)}
              </TableCell>

            

              {/* MES */}
              <TableCell sx={{ fontSize: 11, width: 45 }}>
                {nombreMes(getMes(row.fecha))}
              </TableCell>

              {/* AÑO */}
              <TableCell sx={{ fontSize: 11, width: 50 }}>
                {getAnio(row.fecha)}
              </TableCell>

              {/* TIPO */}
              <TableCell sx={{ width: 70 }}>
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
              <TableCell sx={{ fontSize: 11, width: 110 }}>
                {row.cuil_cuit}
              </TableCell>

              {/* DEBITO */}
              <TableCell align="right" sx={{ width: 110 }}>
                <Typography sx={{ color: "#dc2626", fontSize: 11 }}>
                  {formatearMoneda(row.debito)}
                </Typography>
              </TableCell>

              {/* CREDITO */}
              <TableCell align="right" sx={{ width: 110 }}>
                <Typography sx={{ color: "#059669", fontSize: 11 }}>
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
              <TableCell sx={{ width: 90 }}>
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
    width: 120,
    fontWeight: 700,
    fontSize: 12, // 🔥 tamaño
    color: "#034401", // 🔥 color número
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