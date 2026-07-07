import { useState, useEffect } from "react";
import servicioClientes from "../../../services/clientes";
import servicioLotes from "../../../services/lotes";
import CargaDeTabla from "../../CargaDeTabla";
import { useNavigate } from "react-router-dom";

import { IconButton, Tooltip } from "@mui/material";
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  Divider,
  TextField,
  InputAdornment,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import PeopleRoundedIcon from "@mui/icons-material/PeopleRounded";
import { alpha } from "@mui/material/styles";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";


import ModalDetalleDeudor from "./ModalDetalleDeudor";

const Deudores = () => {
  const [clientes, setClientes] = useState([]);
  const [resumen, setResumen] = useState(null);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);

  const [openDetalle, setOpenDetalle] = useState(false);
  const [detalleCliente, setDetalleCliente] = useState(null);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState("");

  const navigate = useNavigate();


  const esVacio = (v) =>
    v === null ||
    v === undefined ||
    v === "" ||
    v === "-" ||
    v === "Sin determinar";

  const normDigits = (v) => String(v ?? "").replace(/[^\d]/g, "");

  const normNombre = (s) =>
    String(s ?? "")
      .toUpperCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\(\s*\d+\s*\)/g, "")
      .replace(/\s+/g, " ")
      .trim();

  const normalizeText = (s) =>
    String(s ?? "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, " ")
      .trim();

  const onlyDigits = (s) => String(s ?? "").replace(/\D/g, "");


  useEffect(() => {
    getData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getData = async () => {
    setLoading(true);

    const data = await servicioClientes.deudores();
    const detalleClientes = data?.[0] || [];
    const resumenGeneral = data?.[1] || null;

    //  Lotes para completar terreno SIN romper casos multi-lote
    const lotesResp = await servicioLotes.lista({});
    const lotes = Array.isArray(lotesResp) ? lotesResp[0] || [] : [];

    // Índices por zona
    const idxByZonaDni = new Map();     // ZONA|DNI -> lote (primero)
    const idxByZonaNombre = new Map();  // ZONA|NOMBRE -> lote (primero)

    //  CUIT SOLO si es ÚNICO (si tiene más de 1 terreno, NO autocompletamos por CUIT)
    const idxByZonaCuitSingle = new Map(); // ZONA|CUIT -> lote
    const countByZonaCuit = new Map();     // ZONA|CUIT -> count

    lotes.forEach((l) => {
      const zona = String(l.zona ?? "").trim().toUpperCase();
      if (!zona) return;

      const c = normDigits(l.cuil_cuit);
      const nombreLote = normNombre(l.nombre);

      if (nombreLote) {
        const kNom = `${zona}|${nombreLote}`;
        if (!idxByZonaNombre.has(kNom)) idxByZonaNombre.set(kNom, l);
      }

      if (!c || c === "0") return;

      const kCuit = `${zona}|${c}`;
      countByZonaCuit.set(kCuit, (countByZonaCuit.get(kCuit) ?? 0) + 1);
      if (!idxByZonaCuitSingle.has(kCuit)) idxByZonaCuitSingle.set(kCuit, l);

      // DNI si CUIT 11
      if (c.length === 11) {
        const dni = c.slice(2, 10);
        const kDni = `${zona}|${dni}`;
        if (!idxByZonaDni.has(kDni)) idxByZonaDni.set(kDni, l);
      }

      // DNI directo
      if (c.length <= 8) {
        const kDni = `${zona}|${c}`;
        if (!idxByZonaDni.has(kDni)) idxByZonaDni.set(kDni, l);
      }
    });

    // invalidamos CUIT con más de 1 terreno
    for (const [k, cnt] of countByZonaCuit.entries()) {
      if (cnt > 1) idxByZonaCuitSingle.delete(k);
    }

    // Completar terreno (solo si falta) cuando hay multi-lote
    const clientesFix = detalleClientes.map((c) => {
      const zona = String(c.zona ?? "PIT").trim().toUpperCase();

      const yaTieneDatos =
        !esVacio(c.fraccion) ||
        !esVacio(c.manzana) ||
        !esVacio(c.lote) ||
        !esVacio(c.parcela);

      if (yaTieneDatos) return c;

      const cuil = normDigits(c.cuil_cuit);
      const keyCuit = `${zona}|${cuil}`;

      // 1) por CUIT (solo si es único)
      let loteReal = idxByZonaCuitSingle.get(keyCuit);

      // 2) por DNI (fallback)
      if (!loteReal) {
        const dni = cuil.length === 11 ? cuil.slice(2, 10) : cuil;
        loteReal = idxByZonaDni.get(`${zona}|${dni}`);
      }

      // 3) por NOMBRE (último recurso; puede traer falsos positivos si hay homónimos)
      if (!loteReal) {
        const nombre = normNombre(`${c.nombre ?? ""} ${c.apellido ?? ""}`);
        loteReal = idxByZonaNombre.get(`${zona}|${nombre}`);
      }

      if (!loteReal) return c;

      return {
        ...c,
        fraccion: esVacio(c.fraccion) ? loteReal.fraccion : c.fraccion,
        manzana: esVacio(c.manzana) ? loteReal.manzana : c.manzana,
        parcela: esVacio(c.parcela) ? loteReal.parcela : c.parcela,
        lote: esVacio(c.lote) ? loteReal.lote : c.lote,
      };
    });

    setClientes(clientesFix);
    setFiltered(clientesFix);
    setResumen(resumenGeneral);
    setLoading(false);
  };

 
  const handleSearch = (e) => {
    const raw = e.target.value;
    setSearch(raw);

    const qText = normalizeText(raw);
    const qDigits = onlyDigits(raw);
    const tokens = qText.split(" ").filter(Boolean);

    const filteredData = clientes.filter((c) => {
      const cuilDigits = onlyDigits(c.cuil_cuit);
      const nombreCompleto = normalizeText(`${c.nombre} ${c.apellido}`);

      if (qDigits.length > 0) return cuilDigits.includes(qDigits);
      if (tokens.length === 0) return true;

      // exige que todas las palabras estén
      return tokens.every((t) => nombreCompleto.includes(t));
    });

    setFiltered(filteredData);
    setPage(0);
  };

  const handleOpenDetalle = (cliente) => {
    setDetalleCliente(cliente);
    setOpenDetalle(true);
  };

  const handleCloseDetalle = () => {
    setOpenDetalle(false);
    setDetalleCliente(null);
  };

  const getDetalleCliente = async (cuil) => {
    return await servicioClientes.detalle(cuil);
  };

  if (loading) return <CargaDeTabla />;

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
    
      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          p: 2,
          background:
            "linear-gradient(90deg, #0a3b4f 0%, #0b4f6c 55%, #0f7f86 100%)",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          gap: 2,
        }}
      >
        <PeopleRoundedIcon />
        <Box>
          <Typography fontWeight={900}>Estado de cuotas - Zona PIT</Typography>
          <Typography fontSize={13} sx={{ opacity: 0.9 }}>
            Deudores y cuotas pagadas por cliente
          </Typography>
        </Box>
      </Paper>

      {resumen && (
        <Paper
          elevation={0}
          sx={{
            mt: 2,
            borderRadius: 3,
            p: 2,
            display: "flex",
            gap: 2,
            flexWrap: "wrap",
            border: `1px solid ${alpha("#0b4f6c", 0.12)}`,
          }}
        >
          <Chip label={`Debe: ${resumen.debe}`} color="error" />
          <Chip label={`Pagadas: ${resumen.pagadas}`} color="success" />
          <Chip label={`Total: ${resumen.total}`} />
        </Paper>
      )}

      <Paper sx={{ mt: 2, p: 2, borderRadius: 3 }}>
        <TextField
          fullWidth
          size="small"
          label="Buscar por CUIL o Nombre"
          value={search}
          onChange={handleSearch}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      
      <Paper
        elevation={0}
        sx={{
          mt: 2,
          borderRadius: 3,
          overflow: "hidden",
          border: `1px solid ${alpha("#0b4f6c", 0.12)}`,
        }}
      >
        <Divider />

        <TableContainer sx={{ maxHeight: "65vh" }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                {[
                  "CUIL/CUIT",
                  "NOMBRE",
                  "LIQUIDADAS",
                  "DEBE",
                  "PAGADAS",
                  "TOTAL DEVENGADO",
                  "TOTAL PAGADO",
                  "DEUDA",
                  "DETALLE",
                ].map((h) => (
                  <TableCell
                    key={h}
                    sx={{
                      backgroundColor: "#0799b6",
                      color: "#fff",
                      fontWeight: 900,
                    }}
                  >
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {filtered
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((c) => {
                  const rowKey = `${normDigits(c.cuil_cuit)}|${c.fraccion ?? ""}|${c.manzana ?? ""}|${c.parcela ?? ""}|${c.lote ?? ""}|${c.total_devengado ?? ""}|${c.pagado ?? ""}`;

                  return (
                    <TableRow
                      key={rowKey}
                      hover
                      sx={{
                        "&:nth-of-type(odd)": {
                          backgroundColor: alpha("#0f7f86", 0.03),
                        },
                      }}
                    >
                      <TableCell
                        sx={{ fontWeight: 700, color: "#063a52", cursor: "pointer" }}
                        onClick={() => navigate(`/usuario2/detallecliente/${c.cuil_cuit}`)}
                      >
                        {c.cuil_cuit}
                      </TableCell>

                      <TableCell>
                        {c.nombre} {c.apellido}
                      </TableCell>

                      <TableCell sx={{ color: "#1565c0", fontWeight: 700 }}>
                        {c.liquidadas}
                      </TableCell>

                      <TableCell sx={{ color: "#c62828", fontWeight: 700 }}>
                        {c.debe}
                      </TableCell>

                      <TableCell sx={{ color: "#2e7d32", fontWeight: 700 }}>
                        {c.pagadas}
                      </TableCell>

                      <TableCell sx={{ fontWeight: 700 }}>
                        {Number(c.total_devengado).toLocaleString("es-AR", {
                          style: "currency",
                          currency: "ARS",
                        })}
                      </TableCell>

                      <TableCell sx={{ fontWeight: 700 }}>
                        {Number(c.pagado).toLocaleString("es-AR", {
                          style: "currency",
                          currency: "ARS",
                        })}
                      </TableCell>

                      <TableCell sx={{ fontWeight: 700 }}>
                        {(Number(c.total_devengado) - Number(c.pagado)).toLocaleString("es-AR", {
                          style: "currency",
                          currency: "ARS",
                        })}
                      </TableCell>

                      <TableCell>
                                <Tooltip title="Ver cuotas adeudadas">
                            <IconButton size="small" onClick={() => handleOpenDetalle(c)}>
                              <ReceiptLongRoundedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 20]}
          component="div"
          count={filtered.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(e, n) => setPage(n)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          labelRowsPerPage="Filas por página:"
        />
      </Paper>

   
      <ModalDetalleDeudor
        open={openDetalle}
        onClose={handleCloseDetalle}
        clienteBase={detalleCliente}
        getDetalleCliente={getDetalleCliente}
      />
    </Box>
  );
};

export default Deudores;
