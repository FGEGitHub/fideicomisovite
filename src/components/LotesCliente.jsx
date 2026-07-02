import { useParams } from "react-router-dom";
import servicioLotes from "../services/lotes";
import servicioCuotas from "../services/cuotas";
import servicioAdmin from "../services/Administracion";
import servicio360 from "../services/pagos360";
import AgregarIcc from "./nivel2/Icc_cuota/AgregarICCCuota";
import AgregaraCuotas from "./nivel2/Asignarcuotasalote";
import BorrarCuotas from "./nivel2/borrarcuotas/BorrarCuotas";
import CancelarLote from "./pagarloteparque";
import Tooltip from "@mui/material/Tooltip";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Pagointeres from "./nivel2/pagarcuota/modalpagointeres";
import React, { useEffect, useState, Fragment } from "react";
import CurrencyExchangeIcon from "@mui/icons-material/CurrencyExchange";
import SearchIcon from "@mui/icons-material/Search";
import DeleteIcon from "@mui/icons-material/Delete";
import Button from "@mui/material/Button";

import { styled } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import Skeleton from "@mui/material/Skeleton";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { MenuItem, InputLabel } from "@mui/material";
import FormLabel from "@mui/material/FormLabel";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import Box from "@mui/material/Box";
import { alpha } from "@mui/material/styles";
import Grid from "@mui/material/Grid";
import Fab from "@mui/material/Fab";
import Stack from "@mui/material/Stack";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import Pagorapido from "./nivel2/pagarcuota/modalpagorapido";
import Adelantar from "./nivel2/pagarcuota/adelantarcuotaparque";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

////// TABLA CUOTAS (azul fijo)
const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: "#064B63",
    color: "#fff",
    fontWeight: 900,
    fontSize: 12.5,
    letterSpacing: 0.35,
    borderBottom: "0px",
    whiteSpace: "nowrap",
    paddingTop: 14,
    paddingBottom: 14,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 13.5,
    fontWeight: 650,
    color: "#0b2b3a",
    borderBottom: `1px solid ${alpha("#01567c", 0.10)}`,
    paddingTop: 14,
    paddingBottom: 14,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(even)": {
    backgroundColor: alpha("#148D8D", 0.04),
  },
  "&:hover td": {
    backgroundColor: `${alpha("#148D8D", 0.08)} !important`,
  },
  "&:last-child td, &:last-child th": {
    border: 0,
  },
}));


const LotesCliente = (props) => {
  let params = useParams();
  let cuil_cuit = params.cuil_cuit;
  const navigate = useNavigate();

  useEffect(() => {
    traer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
const [loteSeleccionado, setLoteSeleccionado] = useState(null);
  const [lotes, setLotes] = useState([""]);
  const [cuotas, setCuotas] = useState([""]);
  const [open, setOpen] = React.useState(false);
  const [deudaExigible, setDeudaExigible] = useState([""]);
  const [detallePendiente, setDetallePendiente] = useState([""]);
  const [idlote, setIdlote] = useState(null);
  const [selectedValue, setSelectedValue] = useState();
  const [act, setAct] = useState(false);
  const [act2, setAct2] = useState(false);
  const [vista1, setVista1] = useState(false);
  const [cargalink, setCargalink] = useState(false);
  const [verDetalles, setVerDetalles] = useState(false);
  const [openCompensar, setOpenCompensar] = useState(false);
  const [cuotaOrigen, setCuotaOrigen] = useState(null);
  const [cuotaCompensada, setCuotaCompensada] = useState("");
  const toggleDetalles = () => setVerDetalles(!verDetalles);

const vercuotas = async (index) => {
  const cuotas = await servicioCuotas.vercuotas(index);
  setCuotas(cuotas);
  setIdlote(index);
  setAct(true);
  const lote = lotes.find((l) => l.id == index);
  setLoteSeleccionado(lote);

  verief(index);
  setOpen(false);
};

  const abrirCompensar = (id_cuota) => {
    setCuotaOrigen(id_cuota);
    setCuotaCompensada("");
    setOpenCompensar(true);
  };

  const cerrarCompensar = () => {
    setOpenCompensar(false);
  };
  const confirmarCompensar = async () => {
    if (!cuotaCompensada) return alert("Seleccione una cuota");

    const rta = await servicioCuotas.compensar({
      id_compensada: cuotaCompensada,
      id_dedonde: cuotaOrigen
    });

    alert(rta);

    // refresca tabla
    const cuotasActualizadas = await servicioCuotas.vercuotas(idlote);
    setCuotas(cuotasActualizadas);
    verief(idlote);

    setOpenCompensar(false);
  };
  const handleChangeratio = (event) => setSelectedValue(event.target.value);

  const verief = async (index) => {
    const dde = await servicioCuotas.verief(index);
    setDeudaExigible(dde[0]);
    setDetallePendiente(dde[1]);
    setAct2(true);
    setOpen(false);
  };

  const traer = async () => {
    const lotes = await servicioLotes.lotesCliente(props.cuil_cuit);
    console.log(lotes);
    setLotes(lotes);
  };

  const borrar = async (id) => {
    const rta = await servicioCuotas.borrarcuota(id);
    alert(rta);
  };
const obtenerCuotaQueCancelo = (idCuotaCancelada) => {
  if (
    !idCuotaCancelada ||
    idCuotaCancelada === "No" ||
    idCuotaCancelada === "0"
  ) {
    return null;
  }

  return cuotas.find(
    (cuota) => String(cuota.id) === String(idCuotaCancelada)
  );
};
  const traerlink = async (index) => {
    const dde = await servicioAdmin.traerlinkcuota(index);
    window.open(dde);
  };

  const traerlink360 = async (index) => {
    setCargalink(true);
    const dde = await servicio360.traerlink360(index);
    window.open(dde);
    setCargalink(false);
  };

  const crearsolicituddebito = async (index) => {
    const dde = await servicio360.crearsolicituddebito({ id_cuota: index });
    alert(dde);
  };
  const obtenerCuotaCompensadora = (idCompensada) => {
    if (!idCompensada || idCompensada === "No") return null;
    return cuotas?.find((c) => c.id === Number(idCompensada));
  };
const obtenerCuotaCompensada = (idCompensada) => {
  if (
    !idCompensada ||
    idCompensada === "No" ||
    idCompensada === "0"
  ) {
    return null;
  }

  return cuotas.find(
    (cuota) => String(cuota.id) === String(idCompensada)
  );
};
  function saldoReal(dataIndex) {
    return (
      <>
        {cuotas[dataIndex].parcialidad === "Final" ? (
          "$ " +
          new Intl.NumberFormat("de-DE").format(cuotas[dataIndex].Saldo_real)
        ) : (
          <div>No Calculado</div>
        )}
      </>
    );
  }

  function pago(dataIndex) {
    return (
      <>
        {cuotas[dataIndex].parcialidad === "Final" ? (
          "$ " + new Intl.NumberFormat("de-DE").format(cuotas[dataIndex].pago)
        ) : (
          <div>No Calculado</div>
        )}
      </>
    );
  }

  function saldoInicial(dataIndex) {
    return (
      <>
        {cuotas[dataIndex].parcialidad === "Final" ? (
          "$ " +
          new Intl.NumberFormat("de-DE").format(cuotas[dataIndex].saldo_inicial)
        ) : (
          <div>No Calculado</div>
        )}
      </>
    );
  }

  function cuotaConAjuste(dataIndex) {
    return (
      <>
        {cuotas[dataIndex].parcialidad === "Final" ? (
          "$ " +
          new Intl.NumberFormat("de-DE").format(
            cuotas[dataIndex].cuota_con_ajuste
          )
        ) : (
          <div>No Calculado</div>
        )}
      </>
    );
  }

  function fecha(dataIndex) {
    return <>{cuotas[dataIndex].mes + "/" + cuotas[dataIndex].anio}</>;
  }

  function diferencia(dataIndex) {
    return (
      <>
        {cuotas[dataIndex].diferencia >= 0 ? (
          <p style={{ color: "#148D8D", fontWeight: 900, margin: 0 }}>
            {new Intl.NumberFormat("de-DE").format(cuotas[dataIndex].diferencia)}
          </p>
        ) : (
          <p style={{ color: "#d32f2f", fontWeight: 900, margin: 0 }}>
            {new Intl.NumberFormat("de-DE").format(cuotas[dataIndex].diferencia)}
          </p>
        )}
      </>
    );
  }

  function PagomercadoP(dataIndex) {
    return (
      <>
        <Button onClick={() => traerlink(cuotas[dataIndex].id)}>
          Pagar mercado Pago
        </Button>
      </>
    );
  }

  function Pago360(dataIndex) {
    return (
      <>
        <Button onClick={() => traerlink360(cuotas[dataIndex].id)}>
          Pagar 360
        </Button>
      </>
    );
  }

  function Pagodebito360(dataIndex) {
    return (
      <>
        <Button onClick={() => crearsolicituddebito(cuotas[dataIndex].id)}>
          debito en 360
        </Button>
      </>
    );
  }

  function CutomButtonsRenderer(dataIndex) {
    return (
      <>
        <CurrencyExchangeIcon
          onClick={() => navigate("/usuario2/pagarcuota/" + cuotas[dataIndex].id)}
          style={{ marginRight: "10px", cursor: "pointer" }}
        />
        <SearchIcon
          style={{ cursor: "pointer" }}
          onClick={() => navigate("/usuario2/pagoscuotas/" + cuotas[dataIndex].id)}
        />
        <DeleteIcon
          style={{ cursor: "pointer" }}
          onClick={() => borrar(cuotas[dataIndex].id)}
        />
        <AgregarIcc
          id={cuotas[dataIndex].id}
          traer={async () => {
            const lotes = await servicioLotes.lotesCliente(props.cuil_cuit);
            setLotes(lotes);
          }}
        />
      </>
    );
  }

const exportarExcel = () => {
  if (!cuotas || cuotas.length === 0) {
    alert("No hay cuotas para exportar");
    return;
  }

  // Transformamos los datos (podés agregar/quitar campos)
  const data = cuotas.map((c) => ({
    Fecha: `${String(c.mes).padStart(2, "0")}/${c.anio}`,
    "Saldo Inicial": c.saldo_inicial,
    Amortizacion: c.Amortizacion,
    ICC: c.ICC,
    "Ajuste ICC": c.Ajuste_ICC,
    "Cuota con ajuste": c.cuota_con_ajuste,
    "Saldo Cierre": c.saldo_cierre,
    Pago: c.pago,
    "Saldo Real": c.Saldo_real,
    Diferencia: c.diferencia,
    Interes: c.interes,
    "Pago Interes": c.pago_interes,
    "ID Cuota": c.id,
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Cuotas");

  const excelBuffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array",
  });

  const file = new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  saveAs(file, `Cuotas_Lote_${idlote}.xlsx`);
};



  const sxCard = {
    borderRadius: 4,
    overflow: "hidden",
    border: `1px solid ${alpha("#0b4f6c", 0.14)}`,
    background: "rgba(255,255,255,0.92)",
    backdropFilter: "blur(10px)",
    boxShadow: "0 22px 55px rgba(15, 127, 134, 0.10)",
  };

  const sxHeader = {
    px: { xs: 2, md: 3 },
    py: { xs: 2, md: 2.5 },
    background: "linear-gradient(90deg, #0a3b4f 0%, #0b4f6c 55%, #0f7f86 100%)",
    color: "#fff",
    display: "flex",
    alignItems: { xs: "flex-start", md: "center" },
    justifyContent: "space-between",
    gap: 2,
    flexWrap: "wrap",
  };

  const sxTitle = { fontWeight: 900, fontSize: { xs: 18, md: 22 }, lineHeight: 1.1 };
  const sxSub = { mt: 0.35, fontWeight: 650, opacity: 0.9, fontSize: 13.5 };

  const sxBody = {
    px: { xs: 2, md: 3 },
    py: 2,
    background:
      "linear-gradient(180deg, rgba(20,141,141,0.06) 0%, rgba(255,255,255,0.95) 55%, #fff 100%)",
  };

  const sxSelect = {
    minWidth: 260,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.92)",
    "& .MuiOutlinedInput-notchedOutline": { borderColor: alpha("#0b4f6c", 0.20) },
    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: alpha("#0b4f6c", 0.35) },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: "#148D8D",
      boxShadow: "0 0 0 3px rgba(20,141,141,0.12)",
    },
  };

  const sxMiniHeader = {
    px: 2.2,
    py: 1.4,
    backgroundColor: "#014A6B",
    color: "#fff",
    fontWeight: 900,
    fontSize: 14.5,
    letterSpacing: "0.02em",
  };

  const sxInnerCard = {
    borderRadius: 3,
    overflow: "hidden",
    border: `1px solid ${alpha("#0b4f6c", 0.12)}`,
    background: "#fff",
    boxShadow: "0 18px 45px rgba(10,59,79,0.10)",
  };

  const sxBtnPrimary = {
    mb: 2,
    px: 2.2,
    py: 1.1,
    borderRadius: 2,
    textTransform: 'none',
    fontWeight: 700,
    backgroundColor: '#01567c',
    boxShadow: '0 10px 25px rgba(1,86,124,0.25)',
    '&:hover': { backgroundColor: '#014a6b' }
  };


  const sxBtnAccent = {
    px: 2.2,
    py: 1.1,
    borderRadius: 2,
    textTransform: "none",
    fontWeight: 900,
    backgroundColor: "#148D8D",
    boxShadow: "0 10px 25px rgba(20,141,141,0.22)",
    "&:hover": { backgroundColor: "#0f7a7a" },
  };

  const sxBtnDanger = {
    px: 2.2,
    py: 1.1,
    borderRadius: 2,
    textTransform: "none",
    fontWeight: 900,
    backgroundColor: "#d32f2f",
    boxShadow: "0 10px 25px rgba(211,47,47,0.22)",
    "&:hover": { backgroundColor: "#b71c1c" },
  };
  return (
    <Fragment>
      <Box sx={{ width: "100%", maxWidth: "100%", minWidth: 0 }}>
        {/* =========================
          PAPER 1: CUADRO DE CUOTAS + SELECT LOTE
      ========================== */}
        <Paper elevation={0} sx={sxCard}>
          <Box sx={sxHeader}>
            {loteSeleccionado && (
  <Typography sx={{ fontWeight: 800 }}>
    Valor del lote: ${" "}
   
    {new Intl.NumberFormat("de-DE").format(loteSeleccionado.valor_total)}
  </Typography>
)}
            <Box>
              <Typography sx={sxTitle}>CUADRO DE CUOTAS</Typography>
              <Typography sx={sxSub}>Seleccioná un lote para ver sus cuotas.</Typography>
            </Box>
<Button
  variant="contained"
  sx={sxBtnAccent}
  onClick={exportarExcel}
>
  Descargar Excel
</Button>
            <Chip
              label={`Registros: ${Array.isArray(cuotas) && cuotas.length > 0 && cuotas[0] !== "" ? cuotas.length : 0
                }`}
              sx={{
                fontWeight: 900,
                borderRadius: 999,
                background: "rgba(255,255,255,0.18)",
                border: "1px solid rgba(255,255,255,0.35)",
                color: "#fff",
              }}
            />
          </Box>

          <Box sx={sxBody}>
            {lotes && lotes.length > 0 ? (
              <Box sx={{ display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap" }}>
                <FormControl size="small" sx={{ minWidth: 280 }}>
                  <InputLabel id="lotes-select-label">Lote</InputLabel>
                  <Select
                    labelId="lotes-select-label"
                    label="Lote"
                    value={selectedValue || ""}
                    onChange={handleChangeratio}
                    sx={sxSelect}
                  >
                    {lotes.map((item, index) => (
                      <MenuItem
                        key={index}
                        value={`Fraccion: ${item.fraccion} - Manzana: ${item.manzana} - Parcela: ${item.parcela}${item.tiene_cuotas === "Si" ? " - Cuotas" : ""
                          }`}
                        onClick={() => vercuotas(item.id)}
                      >
                        Fraccion: {item.fraccion} - Manzana: {item.manzana} - Parcela: {item.parcela}
                        {item.tiene_cuotas === "Si" ? " - Cuotas" : ""}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Box sx={{ flex: 1 }} />

                {/* ✅ BOTÓN MOVIDO: ya NO va acá */}
              </Box>
            ) : null}

            <Box
              sx={{
                mt: 2,
                height: 1,
                background: alpha("#0b4f6c", 0.10),
                borderRadius: 99,
              }}
            />
          </Box>
        </Paper>

        {/* =========================
          PAPER 2: 2 CUADROS + BOTONES (misma vista)
      ========================== */}
        {act ? (
          <Paper elevation={0} sx={{ ...sxCard, mt: { xs: 2, md: 3 } }}>
            <Box sx={sxHeader}>
              <Box>
                <Typography sx={sxTitle} style={{ fontSize: 18 }}>
                  Resumen y acciones
                </Typography>
                <Typography sx={sxSub}>
                  {selectedValue ? selectedValue : "Seleccioná un lote para ver datos."}
                </Typography>
              </Box>
            </Box>

            <Box sx={sxBody}>
              {/* Cuadros (solo si act2 y hay data) */}
              {act2 && cuotas !== "" ? (
                <Grid container spacing={2.5} sx={{ mb: 2 }}>
                  <Grid item xs={12} md={6}>
                    <Paper elevation={0} sx={sxInnerCard}>
                      <Box sx={sxMiniHeader}>Detalles de Deuda Exigible</Box>

                      <TableContainer>
                        <Table>
                          <TableBody>
                            {deudaExigible.map((row, index) => (
                              <TableRow key={row.name || index}>
                                <TableCell
                                  align="left"
                                  sx={{
                                    fontWeight: 800,
                                    color: "#0a3b4f",
                                    borderBottom: "1px solid #eef3f7",
                                    py: 1.6,
                                    fontSize: 13.5,
                                  }}
                                >
                                  {row.datoa}
                                </TableCell>

                                <TableCell
                                  align="right"
                                  sx={{
                                    borderBottom: "1px solid #eef3f7",
                                    py: 1.6,
                                    fontSize: 13.5,
                                    fontWeight: 900,
                                    color: "#01567c",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {index > 0
                                    ? `$ ${new Intl.NumberFormat("de-DE").format(row.datob)}`
                                    : new Intl.NumberFormat("de-DE").format(row.datob)}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Paper>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Paper elevation={0} sx={sxInnerCard}>
                      <Box sx={sxMiniHeader}>Detalle de Cuotas Pendientes</Box>

                      <TableContainer>
                        <Table>
                          <TableBody>
                            {detallePendiente.map((row, index) => (
                              <TableRow key={row.name || index}>
                                <TableCell
                                  align="left"
                                  sx={{
                                    fontWeight: 800,
                                    color: "#0a3b4f",
                                    borderBottom: "1px solid #eef3f7",
                                    py: 1.6,
                                    fontSize: 13.5,
                                  }}
                                >
                                  {row.datoa}
                                </TableCell>

                                <TableCell
                                  align="right"
                                  sx={{
                                    borderBottom: "1px solid #eef3f7",
                                    py: 1.6,
                                    fontSize: 13.5,
                                    fontWeight: 900,
                                    color: "#148D8D",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {index > 0
                                    ? `$ ${new Intl.NumberFormat("de-DE").format(row.datob)}`
                                    : new Intl.NumberFormat("de-DE").format(row.datob)}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Paper>
                  </Grid>
                </Grid>
              ) : null}

              {/* BOTONES (todos acá adentro, como pediste) */}
              <Divider sx={{ my: 2, borderColor: alpha("#0b4f6c", 0.12) }} />
              <Box
                sx={{
                  display: "flex",
                  gap: 1.5,
                  justifyContent: "flex-end",
                  flexWrap: "wrap",
                  pt: 1,
                }}
              >
                <Button
                  variant="contained"
                  sx={sxBtnPrimary}
                  onClick={() => navigate("/usuario2/agregarcuotas/" + idlote)}
                >
                  Agregar cuotas al lote
                </Button>

                {/* Estos componentes ya existen: no se cambia lógica */}
                <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
                  <AgregaraCuotas id_origen={idlote} lotes={lotes} />
                  <BorrarCuotas id={idlote} />
                  <CancelarLote id_lote={idlote} cuotas={cuotas} />

                  {cuotas && (
                    <Adelantar
                      id_lote={idlote}
                      cuotas={cuotas}
                      traerr={async () => {
                        const cuotas = await servicioCuotas.vercuotas(idlote);
                        setCuotas(cuotas);
                        setAct(true);
                        verief(idlote);
                        setOpen(false);
                      }}
                    />
                  )}
                </Box>
              </Box>

              <Fab
                variant="extended"
                onClick={() => {
                  window.open("/usuario2/comprobanteief/" + idlote);
                }}
                sx={{
                  borderRadius: 2,
                  px: 2,
                  textTransform: "none",
                  fontWeight: 900,
                  backgroundColor: "#148D8D",
                  color: "#fff",
                  boxShadow: "0 10px 25px rgba(20,141,141,0.22)",
                  "&:hover": { backgroundColor: "#0f7a7a" },
                }}
              >
                Imprimir comprobante
              </Fab>

              {/* ✅✅ BOTÓN REUBICADO: abajo de imprimir comprobante y arriba de la tabla */}
              {act ? (
                <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
                  <Button variant="contained" sx={sxBtnDanger} onClick={toggleDetalles}>
                    {verDetalles ? "Restaurar" : "Ver interés"}
                  </Button>
                </Box>
              ) : null}
            </Box>
          </Paper>
        ) : null}

        {/* =========================
          TABLA (Paper separado, luego de los botones)
      ========================== */}
        {act ? (
          <Paper
            elevation={0}
            sx={{
              mt: { xs: 2, md: 3 },
              width: "100%",
              borderRadius: 4,
              overflow: "hidden",
              border: `1px solid ${alpha("#0b4f6c", 0.12)}`,
              background: "#ffffff",
              boxShadow: "0 18px 45px rgba(10,59,79,0.10)",
            }}
          >
            <TableContainer
              sx={{
                height: "80vh",
                backgroundColor: "#ffffff",
                "&::-webkit-scrollbar": { height: 10, width: 10 },
                "&::-webkit-scrollbar-thumb": {
                  background: alpha("#0b4f6c", 0.25),
                  borderRadius: 999,
                },
              }}
            >
              {!cuotas ? (
                <Skeleton />
              ) : (
               <Table stickyHeader sx={{ minWidth: 1200 }}>
  <TableHead>
    <TableRow>
      <StyledTableCell>FECHA</StyledTableCell>

      {verDetalles && (
        <StyledTableCell>SALDO INICIAL</StyledTableCell>
      )}

      <StyledTableCell>AMORTIZACIÓN</StyledTableCell>
      <StyledTableCell>ICC</StyledTableCell>
      <StyledTableCell>AJUSTE ICC</StyledTableCell>
      <StyledTableCell>CUOTA AJUSTADA</StyledTableCell>

      {verDetalles && (
        <StyledTableCell>SALDO CIERRE</StyledTableCell>
      )}

      <StyledTableCell>PAGO</StyledTableCell>
      <StyledTableCell>DIFERENCIA</StyledTableCell>
      <StyledTableCell>SALDO REAL</StyledTableCell>
      <StyledTableCell>ACCIONES</StyledTableCell>
    </TableRow>
  </TableHead>

  <TableBody>
    {Array.isArray(cuotas) &&
      cuotas.map((row) => (
        <StyledTableRow key={row.id} hover>

          {/* FECHA */}
          <StyledTableCell>
            {String(row.mes).padStart(2, "0")}/{row.anio}
          </StyledTableCell>

          {/* SALDO INICIAL */}
          {verDetalles && (
            <StyledTableCell>
              $
              {new Intl.NumberFormat("de-DE").format(
                row.saldo_inicial || 0
              )}
            </StyledTableCell>
          )}

          {/* AMORTIZACION */}
          <StyledTableCell>
            $
            {new Intl.NumberFormat("de-DE").format(
              row.Amortizacion || 0
            )}
          </StyledTableCell>

          {/* ICC */}
          <StyledTableCell>
            {row.ICC}
          </StyledTableCell>

          {/* AJUSTE ICC */}
          <StyledTableCell>
            {row.Ajuste_ICC}
          </StyledTableCell>

          {/* CUOTA AJUSTADA */}
          <StyledTableCell>
            $
            {new Intl.NumberFormat("de-DE").format(
              row.cuota_con_ajuste || 0
            )}
          </StyledTableCell>

          {/* SALDO CIERRE */}
          {verDetalles && (
            <StyledTableCell>
              $
              {new Intl.NumberFormat("de-DE").format(
                row.saldo_cierre || 0
              )}
            </StyledTableCell>
          )}

          {/* PAGO */}
          <StyledTableCell>
            $
            {new Intl.NumberFormat("de-DE").format(
              row.pago || 0
            )}
          </StyledTableCell>

          {/* DIFERENCIA */}
    <StyledTableCell>
  {(() => {
    const cuotaCompensada = obtenerCuotaCompensada(row.compensada);

    return (
      <>
        <Typography
          sx={{
            fontWeight: 900,
            color: row.diferencia >= 0 ? "#148D8D" : "#d32f2f",
          }}
        >
          $
          {new Intl.NumberFormat("de-DE").format(row.diferencia || 0)}
        </Typography>

        {cuotaCompensada && (
          <Typography
            variant="caption"
            sx={{
              display: "block",
              color: "#01567c",
              fontWeight: 700,
            }}
          >
            (Compensada {String(cuotaCompensada.mes).padStart(2, "0")}/
            {cuotaCompensada.anio})
          </Typography>
        )}
      </>
    );
  })()}
</StyledTableCell>

          {/* SALDO REAL */}
<StyledTableCell>
  {row.cuota_cancelada && row.cuota_cancelada !== "No" ? (
    (() => {
      const cuotaQueCancelo = obtenerCuotaQueCancelo(row.cuota_cancelada);

      return cuotaQueCancelo ? (
        <>
          Cuota cancelada por la cuota de{" "}
          <strong>
            {cuotaQueCancelo.mes}/{cuotaQueCancelo.anio}
          </strong>
          <br />
          <small>ID cuota: {cuotaQueCancelo.id}</small>
        </>
      ) : (
        <>
          Cuota cancelada
          <br />
          <small>ID: {row.cuota_cancelada}</small>
        </>
      );
    })()
  ) : (
    <>
      $
      {new Intl.NumberFormat("de-DE").format(row.Saldo_real || 0)}
    </>
  )}
</StyledTableCell>
          {/* ACCIONES */}
          <StyledTableCell>
            <Box
              sx={{
                display: "flex",
                gap: 1,
                flexWrap: "wrap",
              }}
            >
              <Button
                size="small"
                variant="contained"
                sx={{
                  background: "#148D8D",
                  textTransform: "none",
                }}
                onClick={() =>
                  navigate(
                    "/usuario2/pagarcuota/" + row.id
                  )
                }
              >
                Pagar
              </Button>

              <Button
                size="small"
                variant="outlined"
                onClick={() =>
                  navigate(
                    "/usuario2/pagoscuotas/" + row.id
                  )
                }
              >
                Ver pagos
              </Button>

            {row.diferencia < 0 && (
  <Button
    size="small"
    color="warning"
    variant="contained"
    onClick={() => abrirCompensar(row.id)}
  >
    Compensar
  </Button>
)}
            </Box>
          </StyledTableCell>

        </StyledTableRow>
      ))}
  </TableBody>
</Table>
              )}
            </TableContainer>
          </Paper>
        ) : null}
      </Box>

     <Dialog
  open={openCompensar}
  onClose={cerrarCompensar}
  maxWidth="sm"
  fullWidth
  PaperProps={{
    sx: {
      borderRadius: 4,
      overflow: "hidden",
      
      background: "rgba(255,255,255,0.94)",
      backdropFilter: "blur(10px)",
      boxShadow: "0 28px 80px rgba(0,0,0,0.28)",
    },
  }}
  BackdropProps={{
    sx: {
      backgroundColor: "rgba(0,0,0,0.55)",
      backdropFilter: "blur(6px)",
    },
  }}
>
  <DialogTitle
    sx={{
      px: 3,
      py: 2.2,
      color: "#fff",
      fontWeight: 900,
      letterSpacing: 0.2,
      background:
        "linear-gradient(90deg, #0a3b4f 0%, #0b4f6c 55%, #0f7f86 100%)",
      textShadow: "0 2px 10px rgba(0,0,0,0.35)",
    }}
  >
    Compensar cuota
  </DialogTitle>

  <DialogContent
    dividers
    sx={{
      px: 3,
      py: 2.5,
      background:
        "linear-gradient(180deg, rgba(20,141,141,0.06) 0%, rgba(255,255,255,0.96) 55%, #fff 100%)",
      borderColor: alpha("#0b4f6c", 0.10),
    }}
  >
    <FormControl
      fullWidth
      size="small"
      sx={{
        "& .MuiInputLabel-root": {
          color: alpha("#0b4f6c", 0.85),
          fontWeight: 900,
        },
        "& .MuiOutlinedInput-root": {
          borderRadius: 2,
          background: "rgba(255,255,255,0.92)",
          boxShadow: "0 12px 22px rgba(11,79,108,0.10)",
          "& fieldset": { borderColor: alpha("#0b4f6c", 0.18) },
          "&:hover fieldset": { borderColor: alpha("#0b4f6c", 0.35) },
          "&.Mui-focused fieldset": {
            borderColor: "#148D8D",
            borderWidth: 2,
          },
        },
      }}
    >
      <InputLabel>Seleccione cuota destino</InputLabel>

      <Select
        label="Seleccione cuota destino"
        value={cuotaCompensada}
        onChange={(e) => setCuotaCompensada(e.target.value)}
        MenuProps={{
          PaperProps: {
            sx: {
              borderRadius: 2,
              mt: 1,
              border: `1px solid ${alpha("#0b4f6c", 0.12)}`,
              boxShadow: "0 18px 45px rgba(0,0,0,0.14)",
              overflow: "hidden",
            },
          },
        }}
      >
        {Array.isArray(cuotas) &&
          cuotas
            .filter((c) => c && c.id && c.id !== cuotaOrigen)
            .map((c) => (
              <MenuItem
                key={c.id}
                value={c.id}
                sx={{
                  fontWeight: 850,
                  color: "#0b2b3a",
                  "&.Mui-selected": {
                    backgroundColor: alpha("#148D8D", 0.12),
                  },
                  "&.Mui-selected:hover": {
                    backgroundColor: alpha("#148D8D", 0.16),
                  },
                }}
              >
                {`${String(c.mes).padStart(2, "0")}/${c.anio}  -  Diferencia: ${new Intl.NumberFormat(
                  "de-DE"
                ).format(c.diferencia)}`}
              </MenuItem>
            ))}
      </Select>

      <Typography
        sx={{
          mt: 1.2,
          fontSize: 12.5,
          fontWeight: 750,
          color: alpha("#0b4f6c", 0.75),
        }}
      >
        Seleccioná la cuota destino para compensar la cuota elegida.
      </Typography>
    </FormControl>
  </DialogContent>

  <DialogActions
    sx={{
      px: 3,
      py: 2,
      backgroundColor: "rgba(255,255,255,0.92)",
      borderTop: `1px solid ${alpha("#0b4f6c", 0.10)}`,
      gap: 1,
    }}
  >
    <Button
      onClick={cerrarCompensar}
      variant="outlined"
      sx={{
        borderRadius: 2,
        textTransform: "none",
        fontWeight: 900,
        px: 2.2,
        py: 1.05,
        borderColor: alpha("#0b4f6c", 0.35),
        color: "#0b4f6c",
        "&:hover": {
          borderColor: alpha("#0b4f6c", 0.55),
          backgroundColor: alpha("#0b4f6c", 0.06),
        },
      }}
    >
      Cancelar
    </Button>

    <Button
      variant="contained"
      sx={{
        fontWeight: 900,
        borderRadius: 2,
        textTransform: "none",
        px: 2.2,
        py: 1.05,
        background: "linear-gradient(135deg, #148D8D 0%, #01567c 100%)",
        boxShadow: "0 12px 26px rgba(1,86,124,0.22)",
        "&:hover": {
          background: "linear-gradient(135deg, #0f7a7a 0%, #014a6b 100%)",
        },
      }}
      onClick={confirmarCompensar}
    >
      Aceptar
    </Button>
  </DialogActions>
</Dialog>

    </Fragment>
  );

};
export default LotesCliente;