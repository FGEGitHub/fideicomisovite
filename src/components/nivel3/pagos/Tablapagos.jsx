import { useState, useEffect, useMemo } from "react";

import { createTheme, alpha } from "@mui/material/styles";
import {
  Box,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Paper,
  Typography,
  Chip,
  Stack,
  Divider,
  TextField
} from "@mui/material";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
} from "@mui/material";
import logo from "../../../Assets/marcas.png";
import PrintIcon from "@mui/icons-material/Print";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import AssessmentIcon from "@mui/icons-material/Assessment";

import servicioPagos from "../../../services/pagos";
import serviciousuario1 from "../../../services/usuario1"; // (no lo uso, pero lo dejo como lo tenés)
import servicioLotes from "../../../services/lotes"; // ✅ NUEVO: para completar datos IC3 desde tabla lotes

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const PagosInusuales = () => {
  const [pagos, setPagos] = useState([]);
  const [filtroMes, setFiltroMes] = useState("");
  const [filtroAnio, setFiltroAnio] = useState("");
  const [filtroZona, setFiltroZona] = useState("PIT");
const [desdeMes, setDesdeMes] = useState("");
const [desdeAnio, setDesdeAnio] = useState("");
const [filtroTexto, setFiltroTexto] = useState("");
const [hastaMes, setHastaMes] = useState("");
const [hastaAnio, setHastaAnio] = useState("");
const [page, setPage] = useState(0);
const [rowsPerPage, setRowsPerPage] = useState(10);
const [tipoFecha, setTipoFecha] = useState("pago"); // "pago" o "cuota"
  // helper
  const esVacio = (v) =>
    v === null || v === undefined || v === "" || v === "-" || v === "Sin determinar";

  const formatMoney = (v) =>
    Number(v || 0).toLocaleString("es-AR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  // ✅ Traer pagos y completar fraccion/manzana/lote para IC3 sin tocar backend
  const getPagos = async () => {
  if (!desdeMes || !desdeAnio || !hastaMes || !hastaAnio) {
    alert("Completá el rango de fechas");
    return;
  }

  const resp = await servicioPagos.todoslospagos({
    desde_mes: desdeMes,
    desde_anio: desdeAnio,
    hasta_mes: hastaMes,
    hasta_anio: hastaAnio,
    tipo_fecha: tipoFecha,
  });

  const lotesResp = await servicioLotes.lista({});
  const lotes = Array.isArray(lotesResp) ? lotesResp[0] || [] : [];

  const normDigits = (v) => String(v ?? "").replace(/[^\d]/g, "");

  const normNombre = (s) =>
    String(s ?? "")
      .toUpperCase()
      .replace(/\(\s*\d+\s*\)/g, "")
      .replace(/\s+/g, " ")
      .trim();

  const idxIC3ByCuit = new Map();
  const idxIC3ByDni = new Map();
  const idxIC3ByNombre = new Map();

  lotes
    .filter((l) => String(l.zona ?? "").trim().toUpperCase() === "IC3")
    .forEach((l) => {
      const c = normDigits(l.cuil_cuit);
      const nombreLote = normNombre(l.nombre);

      if (nombreLote && !idxIC3ByNombre.has(nombreLote)) {
        idxIC3ByNombre.set(nombreLote, l);
      }

      if (!c || c === "0") return;

      if (!idxIC3ByCuit.has(c)) idxIC3ByCuit.set(c, l);

      if (c.length === 11) {
        const dni = c.slice(2, 10);
        if (!idxIC3ByDni.has(dni)) idxIC3ByDni.set(dni, l);
      }

      if (c.length <= 8) {
        if (!idxIC3ByDni.has(c)) idxIC3ByDni.set(c, l);
      }
    });

  const pagosFix = resp.map((p) => {
    if (p.origen !== "ic3") return p;

    const yaTieneDatos =
      !esVacio(p.fraccion) || !esVacio(p.manzana) || !esVacio(p.lote);
    if (yaTieneDatos) return p;

    const c = normDigits(p.cuil_cuit);

    let loteReal = idxIC3ByCuit.get(c);

    if (!loteReal) {
      const dni = c.length === 11 ? c.slice(2, 10) : c;
      loteReal = idxIC3ByDni.get(dni);
    }

    if (!loteReal) {
      const nombrePago = normNombre(p.nombre);
      loteReal = idxIC3ByNombre.get(nombrePago);
    }

    if (!loteReal) return p;

    return {
      ...p,
      fraccion: esVacio(p.fraccion) ? loteReal.fraccion : p.fraccion,
      manzana: esVacio(p.manzana) ? loteReal.manzana : p.manzana,
      lote: esVacio(p.lote) ? loteReal.lote : p.lote,
    };
  });

  setPagos(pagosFix);
};
useEffect(() => {
  const hoy = new Date();

  const mesActual = hoy.getMonth() + 1;
  const anioActual = hoy.getFullYear();

  setDesdeMes(1);
  setDesdeAnio(2026);

  setHastaMes(mesActual);
  setHastaAnio(anioActual);

  setTipoFecha("cuota");


  cargarInicial(1, 2026, mesActual, anioActual);
}, []);
useEffect(() => {
  // NO cargar automático
}, []);


const cargarInicial = async (dMes, dAnio, hMes, hAnio) => {
  const resp = await servicioPagos.todoslospagos({
    desde_mes: dMes,
    desde_anio: dAnio,
    hasta_mes: hMes,
    hasta_anio: hAnio,
    tipo_fecha: "cuota",
  });

  setPagos(resp);
};
  // =======================
  // OPCIONES DE FILTROS
  // =======================
  const meses = [...new Set(pagos.map((p) => Number(p.mes)))]
    .filter((m) => !isNaN(m))
    .sort((a, b) => a - b);

  const anios = [...new Set(pagos.map((p) => p.anio))].filter(Boolean);

  // =======================
  // FILTRADO (ZONA POR ORIGEN)
  // =======================
const pagosFiltrados = pagos.filter((p) => {
  const zonaOk =
    filtroZona === "" ||
    (filtroZona === "IC3" && p.origen === "ic3") ||
    (filtroZona === "PIT" && p.origen === "normal");

 const texto = filtroTexto.toLowerCase();

const textoOk =
  !filtroTexto ||
  p.cuil_cuit?.toString().includes(texto) ||
  p.nombre?.toLowerCase().includes(texto);

  return zonaOk && textoOk;
});

  // =======================
  // COLUMNAS (BASE)
  // =======================
  const columnsBase = useMemo(() => {
    // Índices por el orden DE ESTE ARRAY:
    // 0 mes
    // 1 anio
    // 2 fraccion
    // 3 manzana
    // 4 lote
    // 5 parcela
    // 6 origen
    // 7 cuil_cuit
    // 8 nombre
    // 9 monto
    const LOTE_INDEX = 4;
    const ORIGEN_INDEX = 6;

    return [
      { name: "mes", label: "Mes" },
      { name: "anio", label: "Año" },
      { name: "fraccion", label: "Fracción" },
      { name: "manzana", label: "Manzana" },

      // ✅ LOTE (PIT => "No corresponde")
      {
        name: "lote",
        label: "Lote",
        options: {
          customBodyRender: (value, tableMeta) => {
            const origen = tableMeta.rowData[ORIGEN_INDEX]; // "normal" o "ic3"
            if (origen === "normal") return "No corresponde";
            return esVacio(value) ? "-" : value;
          },
        },
      },

      // ✅ PARCELA (IC3 => "No corresponde")
      {
        name: "parcela",
        label: "Parcela",
        options: {
          customBodyRender: (value, tableMeta) => {
            const origen = tableMeta.rowData[ORIGEN_INDEX];
            const lote = tableMeta.rowData[LOTE_INDEX];

            if (origen === "ic3") return "No corresponde";

            const invalida =
              value === 0 ||
              value === "0" ||
              value === "Sin determinar" ||
              value === "" ||
              value === null ||
              value === undefined;

            return invalida ? (esVacio(lote) ? "-" : lote) : value;
          },
        },
      },

      {
        name: "origen",
        label: "Zona",
        options: {
          customBodyRender: (value) => (value === "ic3" ? "IC3" : "PIT"),
        },
      },

      { name: "cuil_cuit", label: "CUIL / CUIT" },
      { name: "nombre", label: "Nombre" },

      // ✅ MONTO con formato
      {
        name: "monto",
        label: "Monto",
        options: {
          customBodyRender: (value) => formatMoney(value),
        },
      },
    ];
  }, [formatMoney]); // ✅ important: cierro el useMemo BIEN

  // =======================
  // COLUMNAS VISIBLES SEGÚN FILTRO ZONA
  // =======================
  const columns = useMemo(() => {
    if (filtroZona === "PIT") {
      return columnsBase.filter((c) => c.name !== "lote");
    }
    if (filtroZona === "IC3") {
      return columnsBase.filter((c) => c.name !== "parcela");
    }
    return columnsBase;
  }, [columnsBase, filtroZona]);

  // =======================
  // EXPORTAR A EXCEL
  // =======================
  const exportarExcel = () => {
    const visibles = columns.map((c) => c.name);

    const data = pagosFiltrados.map((p) => {
      const esIC3 = p.origen === "ic3";
      const esPIT = p.origen === "normal";

      const row = {
        Mes: p.mes,
        Año: p.anio,
        Zona: esIC3 ? "IC3" : "PIT",
        "CUIL / CUIT": p.cuil_cuit,
        Nombre: p.nombre,
        Estado: p.estado === "A" ? "Aprobado" : "Pendiente",
        Monto: Number(p.monto || 0).toFixed(2),
      };

      if (visibles.includes("fraccion")) row.Fracción = p.fraccion ?? "-";
      if (visibles.includes("manzana")) row.Manzana = p.manzana ?? "-";

      if (visibles.includes("lote")) {
        row.Lote = esPIT ? "No corresponde" : p.lote ?? "-";
      }

      if (visibles.includes("parcela")) {
        row.Parcela = esIC3 ? "No corresponde" : p.parcela ?? "-";
      }

      return row;
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Pagos");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });

    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(blob, "pagos_filtrados.xlsx");
  };

  // =======================
  // OPCIONES TABLA
  // =======================
  const options = {
    selectableRows: false,
    responsive: "standard",
    rowsPerPage: 10,
    rowsPerPageOptions: [5, 10, 20],
    print: false,
    download: false,
    filter: false,
    viewColumns: true,
    textLabels: {
      body: { noMatch: "No se encontraron registros" },
      pagination: {
        rowsPerPage: "Filas por página:",
        displayRows: "de",
      },
      toolbar: {
        search: "Buscar",
        viewColumns: "Ver columnas",
      },
    },
  };
  // =======================
  // THEME (solo estética)
  // =======================
  const theme = createTheme({
    typography: {
      fontFamily:
        'Inter, system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif',
    },
    shape: { borderRadius: 14 },
    components: {
      MuiPaper: {
        styleOverrides: {
          root: { backgroundImage: "none" },
        },
      },
      MuiInputLabel: {
        styleOverrides: {
          root: { fontWeight: 800 },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            backgroundColor: alpha("#ffffff", 0.9),
            boxShadow: "0 10px 22px rgba(15,127,134,0.07)",
            transition: "all .18s ease",
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: alpha("#148D8D", 0.55),
            },
            "&.Mui-focused": {
              boxShadow: "0 14px 28px rgba(20,141,141,0.14)",
            },
          },
          notchedOutline: {
            borderColor: alpha("#0b4f6c", 0.18),
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            textTransform: "none",
            fontWeight: 900,
            paddingInline: 14,
            paddingBlock: 10,
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          head: {
            fontWeight: 900,
            color: "#0b4f6c",
            borderBottom: `1px solid ${alpha("#0b4f6c", 0.12)}`,
            backgroundColor: "transparent",
            paddingTop: 14,
            paddingBottom: 14,
          },
          body: {
            borderBottom: `1px solid ${alpha("#0b4f6c", 0.08)}`,
          },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: {
            "&:hover td": {
              backgroundColor: alpha("#148D8D", 0.06),
            },
          },
        },
      },
    },
  });

  const registros = pagosFiltrados?.length || 0;

  return (
    <>
      <Box
        sx={{
          width: "100%",
          maxWidth: "100%",
          flex: 1,
          minWidth: 0,
        }}
      >
        {/* HEADER */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: 3,
            px: { xs: 2, md: 3 },
            py: { xs: 2, md: 2.25 },
            border: `1px solid ${alpha("#0b4f6c", 0.18)}`,
            background:
              "linear-gradient(90deg, #0a3b4f 0%, #0b4f6c 55%, #0f7f86 100%)",
            boxShadow: "0 16px 40px rgba(8,58,82,0.22)",
            color: "#fff",
            overflow: "hidden",
            position: "relative",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(700px 220px at 10% 0%, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 60%)",
              pointerEvents: "none",
            }}
          />

          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            spacing={2}
            sx={{ position: "relative" }}
          >
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 3,
                  display: "grid",
                  placeItems: "center",
                  backgroundColor: alpha("#ffffff", 0.14),
                  border: `1px solid ${alpha("#ffffff", 0.22)}`,
                  backdropFilter: "blur(8px)",
                }}
              >
                <AssessmentIcon sx={{ fontSize: 22, color: "#fff" }} />
              </Box>

              <Box>
                <Typography
                  sx={{
                    fontWeight: 900,
                    fontSize: { xs: 18, md: 20 },
                    lineHeight: 1.15,
                  }}
                >
                  Reporte de los pagos registrados
                </Typography>
                <Typography
                  sx={{
                    opacity: 0.9,
                    fontSize: { xs: 12.5, md: 13.5 },
                    mt: 0.4,
                  }}
                >
                  Revisá, filtrá y gestioná pagos inusuales / sospechosos.
                </Typography>
              </Box>
            </Stack>

            <Chip
              label={`Registros: ${registros}`}
              sx={{
                height: 34,
                fontWeight: 900,
                color: "#fff",
                backgroundColor: alpha("#ffffff", 0.14),
                border: `1px solid ${alpha("#ffffff", 0.22)}`,
                backdropFilter: "blur(8px)",
                "& .MuiChip-label": { px: 1.4 },
              }}
            />
          </Stack>
        </Paper>

        {/* PANEL DE FILTROS */}
        <Paper
          elevation={0}
          sx={{
            mt: 2,
            borderRadius: 4,
            p: { xs: 1.5, md: 2 },
            border: `1px solid ${alpha("#0b4f6c", 0.14)}`,
            background:
              "linear-gradient(180deg, rgba(10,59,79,0.045) 0%, rgba(20,141,141,0.035) 45%, rgba(255,255,255,0.98) 100%)",
            boxShadow: "0 14px 35px rgba(15,127,134,0.10)",
          }}
        >
          <Stack
            direction={{ xs: "column", md: "row" }}
            alignItems={{ xs: "stretch", md: "center" }}
            justifyContent="space-between"
            spacing={1.25}
          >
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1.25}
              sx={{ flexWrap: "wrap" }}
            >



<FormControl size="small" sx={{ minWidth: 160 }}>
  <InputLabel>Tipo Fecha</InputLabel>
  <Select
    value={tipoFecha}
    label="Tipo Fecha"
    onChange={(e) => setTipoFecha(e.target.value)}
  >
    <MenuItem value="pago">Fecha de Pago</MenuItem>
    <MenuItem value="cuota">Fecha de Cuota</MenuItem>
  </Select>
</FormControl>

<FormControl size="small" sx={{ minWidth: 120 }}>
  <InputLabel>Desde Mes</InputLabel>
  <Select
    value={desdeMes}
    label="Desde Mes"
    onChange={(e) => setDesdeMes(e.target.value)}
  >
    {[...Array(12)].map((_, i) => (
      <MenuItem key={i + 1} value={i + 1}>
        {i + 1}
      </MenuItem>
    ))}
  </Select>
</FormControl>

<FormControl size="small" sx={{ minWidth: 120 }}>
  <InputLabel>Desde Año</InputLabel>
  <Select
    value={desdeAnio}
    label="Desde Año"
    onChange={(e) => setDesdeAnio(e.target.value)}
  >
    {[2020, 2021, 2022, 2023, 2024, 2025, 2026].map((a) => (
      <MenuItem key={a} value={a}>
        {a}
      </MenuItem>
    ))}
  </Select>
</FormControl>


<FormControl size="small" sx={{ minWidth: 120 }}>
  <InputLabel>Hasta Mes</InputLabel>
  <Select
    value={hastaMes}
    label="Hasta Mes"
    onChange={(e) => setHastaMes(e.target.value)}
  >
    {[...Array(12)].map((_, i) => (
      <MenuItem key={i + 1} value={i + 1}>
        {i + 1}
      </MenuItem>
    ))}
  </Select>
</FormControl>

<FormControl size="small" sx={{ minWidth: 120 }}>
  <InputLabel>Hasta Año</InputLabel>
  <Select
    value={hastaAnio}
    label="Hasta Año"
    onChange={(e) => setHastaAnio(e.target.value)}
  >
    {[2020, 2021, 2022, 2023, 2024, 2025, 2026].map((a) => (
      <MenuItem key={a} value={a}>
        {a}
      </MenuItem>
    ))}
  </Select>
</FormControl>

           
<Button
  variant="contained"
  onClick={getPagos}
>
  Buscar
</Button>
              

              <FormControl size="small" sx={{ minWidth: 140 }}>
                <InputLabel>Zona</InputLabel>
                <Select
                  value={filtroZona}
                  label="Zona"
                  onChange={(e) => setFiltroZona(e.target.value)}
                >
                  <MenuItem value="">Todas</MenuItem>
                  <MenuItem value="IC3">IC3</MenuItem>
                  <MenuItem value="PIT">PIT</MenuItem>
                </Select>
              </FormControl>
            </Stack>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
              <Button
                variant="contained"
                startIcon={<FileDownloadIcon />}
                onClick={exportarExcel}
                sx={{
                  background:
                    "linear-gradient(90deg, #0b4f6c 0%, #148D8D 100%)",
                  boxShadow: "0 16px 28px rgba(11,79,108,0.18)",
                  "&:hover": {
                    background:
                      "linear-gradient(90deg, #0a415a 0%, #117777 100%)",
                  },
                }}
              >
                Excel
              </Button>

              <Button
                variant="outlined"
                startIcon={<PrintIcon />}
                onClick={() => window.print()}
                sx={{
                  borderColor: alpha("#0b4f6c", 0.35),
                  color: "#0b4f6c",
                  "&:hover": {
                    borderColor: alpha("#148D8D", 0.6),
                    backgroundColor: alpha("#148D8D", 0.08),
                  },
                }}
              >
                Imprimir
              </Button>

              <Button
                variant="outlined"
               onClick={() => {
  setFiltroZona("");
  setDesdeMes("");
  setDesdeAnio("");
  setHastaMes("");
  setHastaAnio("");
  setTipoFecha("pago");
}}
                sx={{
                  borderColor: alpha("#0b4f6c", 0.35),
                  color: "#0b4f6c",
                  "&:hover": {
                    borderColor: alpha("#148D8D", 0.6),
                    backgroundColor: alpha("#148D8D", 0.08),
                  },
                }}
              >
                Limpiar
              </Button>
            </Stack>
          </Stack>
        </Paper>

  <InputLabel>Buscar</InputLabel>
  <TextField
  size="small"
  label="Buscar por Nombre o CUIT"
  value={filtroTexto}
  onChange={(e) => setFiltroTexto(e.target.value)}
  sx={{ minWidth: 260 }}
/>  
<TableContainer>
  <Table>
    <TableHead>
      <TableRow>
        <TableCell>Mes</TableCell>
        <TableCell>Año</TableCell>
        <TableCell>Zona</TableCell>
        <TableCell>Fracción</TableCell>
        <TableCell>Manzana</TableCell>

        {filtroZona !== "PIT" && (
          <TableCell>Lote</TableCell>
        )}

        {filtroZona !== "IC3" && (
          <TableCell>Parcela</TableCell>
        )}

        <TableCell>CUIL / CUIT</TableCell>
        <TableCell>Nombre</TableCell>
        <TableCell>Monto</TableCell>
      </TableRow>
    </TableHead>

    <TableBody>
      {pagosFiltrados
        .slice(
          page * rowsPerPage,
          page * rowsPerPage + rowsPerPage
        )
        .map((p, index) => {
          const esIC3 = p.origen === "ic3";
          const esPIT = p.origen === "normal";

          return (
            <TableRow key={index} hover>
              <TableCell>{p.mes}</TableCell>

              <TableCell>{p.anio}</TableCell>

              <TableCell>
                <Chip
                  label={esIC3 ? "IC3" : "PIT"}
                  color={esIC3 ? "secondary" : "primary"}
                  size="small"
                />
              </TableCell>

              <TableCell>
                {p.fraccion || "-"}
              </TableCell>

              <TableCell>
                {p.manzana || "-"}
              </TableCell>

              {filtroZona !== "PIT" && (
                <TableCell>
                  {esPIT
                    ? "No corresponde"
                    : p.lote || "-"}
                </TableCell>
              )}

              {filtroZona !== "IC3" && (
                <TableCell>
                  {esIC3
                    ? "No corresponde"
                    : p.parcela || "-"}
                </TableCell>
              )}

              <TableCell>
                {p.cuil_cuit}
              </TableCell>

              <TableCell>
                {p.nombre}
              </TableCell>

              <TableCell>
                ${formatMoney(p.monto)}
              </TableCell>
            </TableRow>
          );
        })}
    </TableBody>
  </Table>

  <TablePagination
    component="div"
    count={pagosFiltrados.length}
    page={page}
    rowsPerPage={rowsPerPage}
    onPageChange={(e, newPage) => setPage(newPage)}
    onRowsPerPageChange={(e) => {
      setRowsPerPage(parseInt(e.target.value, 10));
      setPage(0);
    }}
    rowsPerPageOptions={[5, 10, 20, 50]}
  />
</TableContainer>
        {/* TABLA */}
        <Paper
          elevation={0}
          sx={{
            mt: 2,
            borderRadius: 2,
            border: `1px solid ${alpha("#0b4f6c", 0.14)}`,
            background:
              "linear-gradient(180deg, rgba(10,59,79,0.035) 0%, rgba(20,141,141,0.03) 35%, rgba(255,255,255,0.98) 100%)",
            boxShadow: "0 14px 35px rgba(15,127,134,0.10)",
            overflow: "hidden",
          }}
        >
        {/*   <MUIDataTable data={pagosFiltrados} columns={columns} options={options} /> */}
        </Paper>
      </Box>

      {/* ===== VISTA SOLO IMPRESIÓN ===== */}
      <div id="print-area" style={{ display: "none" }}>
        <Box sx={{ padding: "30px", fontFamily: "Arial" }}>
          {/* HEADER */}
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <img src={logo} alt="logo" style={{ height: 70, marginRight: 20 }} />
            <Box>
              <Typography variant="h5" fontWeight="bold">
                Informe de Pagos Registrados
              </Typography>
              <Typography variant="body2">
                Municipalidad de Corrientes
              </Typography>
              <Typography variant="body2">
                Fecha de emisión: {new Date().toLocaleDateString()}
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ mb: 2 }} />

          {/* FILTROS */}
          <Typography variant="subtitle2" fontWeight="bold">
            Filtros aplicados:
          </Typography>
          <Typography variant="body2" mb={2}>
            Mes: {filtroMes || "Todos"} | Año: {filtroAnio || "Todos"} | Zona:{" "}
            {filtroZona || "Todas"}
          </Typography>

          {/* TABLA */}
          <table
            width="100%"
            border="1"
            cellSpacing="0"
            style={{ borderCollapse: "collapse", fontSize: "12px" }}
          >
            <thead style={{ background: "#0b4f6c", color: "white" }}>
              <tr>
                <th>Mes</th>
                <th>Año</th>
                <th>Zona</th>
                <th>CUIL/CUIT</th>
                <th>Nombre</th>
                <th>Monto</th>
              </tr>
            </thead>
            <tbody>
              {pagosFiltrados.map((p, i) => (
                <tr key={i}>
                  <td>{p.mes}</td>
                  <td>{p.anio}</td>
                  <td>{p.origen === "ic3" ? "IC3" : "PIT"}</td>
                  <td>{p.cuil_cuit}</td>
                  <td>{p.nombre}</td>
                  <td>${p.monto}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <Typography variant="body2" mt={2}>
            Total de registros: {pagosFiltrados.length}
          </Typography>
        </Box>
      </div>
    </>
  );
};

export default PagosInusuales;
