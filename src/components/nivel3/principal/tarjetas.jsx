import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Typography,
  Button,
  Modal,
  Box,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Divider,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import PaidRoundedIcon from "@mui/icons-material/PaidRounded";
import servicionivel3 from "../../../services/nivel3";

const MainMenu = () => {
  const [open, setOpen] = useState(false);
  const [datos, setDatos] = useState();
  const [form, setForm] = useState({});

  const fecha = new Date();
  const anio = fecha.getFullYear();
  const meses = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];
  const mesNombre = meses[fecha.getMonth()];

  useEffect(() => {
    traer();
  }, []);

  const traer = async () => {
    const historial = await servicionivel3.traerdatosdetarjetas();
    console.log(historial);
    setDatos(historial);
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleSubmit = async () => {
    const historial = await servicionivel3.enviardatosnuevosalario(form);
    alert(historial);
    traer();
    setOpen(false);
  };

  const handleSubmitfalso = () => {
    alert("Completa los campos");
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat("es-ES").format(num);
  };

  const salarioActual = datos?.[0]?.[0]?.valor;
  const fechaCarga = datos?.[0]?.[0]?.fecha;
  const iccActual = datos?.[1]?.length > 0 ? datos[1][0].ICC : null;
  const riesgos = datos?.[2] || [];

  const dashboardBg = `
    linear-gradient(180deg, #eef4f7 0%, #f7fafb 45%, #eef3f5 100%)
  `;

  const headerGradient =
    "linear-gradient(90deg, #0a3b4f 0%, #0b4f6c 55%, #148d8d 100%)";

  const cardBaseSx = {
    borderRadius: "22px",
    background: "rgba(255,255,255,0.82)",
    backdropFilter: "blur(10px)",
    border: `1px solid ${alpha("#0b4f6c", 0.08)}`,
    boxShadow: "0 12px 35px rgba(10, 59, 79, 0.10)",
    overflow: "hidden",
  };

  const sectionTitleSx = {
    fontSize: "1rem",
    fontWeight: 800,
    color: "#10384d",
    mb: 0.5,
  };

  const sectionSubSx = {
    fontSize: "0.92rem",
    color: alpha("#10384d", 0.72),
    fontWeight: 500,
  };

  const obtenerNivelRiesgo = (tipo = "") => {
    const texto = String(tipo).toLowerCase();

    if (
      texto.includes("alto") ||
      texto.includes("muy alto") ||
      texto.includes("critico") ||
      texto.includes("crítico")
    ) {
      return "alto";
    }

    if (
      texto.includes("medio") ||
      texto.includes("moderado") ||
      texto.includes("intermedio")
    ) {
      return "medio";
    }

    return "bajo";
  };

  const getRiskStyles = (tipo = "") => {
    const nivel = obtenerNivelRiesgo(tipo);

    if (nivel === "alto") {
      return {
        chipBg: alpha("#d32f2f", 0.14),
        chipColor: "#b71c1c",
        chipBorder: `1px solid ${alpha("#d32f2f", 0.28)}`,
        rowHover: alpha("#d32f2f", 0.035),
      };
    }

    if (nivel === "medio") {
      return {
        chipBg: alpha("#f57c00", 0.16),
        chipColor: "#c25e00",
        chipBorder: `1px solid ${alpha("#f57c00", 0.3)}`,
        rowHover: alpha("#f57c00", 0.05),
      };
    }

    return {
      chipBg: alpha("#2e7d32", 0.14),
      chipColor: "#1b5e20",
      chipBorder: `1px solid ${alpha("#2e7d32", 0.26)}`,
      rowHover: alpha("#2e7d32", 0.045),
    };
  };

  const riesgosPersona = riesgos.filter((item) =>
    String(item.tipo).toLowerCase().includes("persona")
  );

  const riesgosEmpresa = riesgos.filter((item) =>
    String(item.tipo).toLowerCase().includes("empresa")
  );

  const renderTablaRiesgo = (titulo, lista) => (
    <Box
      sx={{
        borderRadius: "18px",
        overflow: "hidden",
        border: `1px solid ${alpha("#0b4f6c", 0.08)}`,
        background: alpha("#ffffff", 0.7),
      }}
    >
      <Box
        sx={{
          px: 2,
          py: 1.4,
          background: alpha("#0b4f6c", 0.045),
          borderBottom: `1px solid ${alpha("#0b4f6c", 0.08)}`,
        }}
      >
        <Typography
          sx={{
            fontSize: "1rem",
            fontWeight: 800,
            color: "#10384d",
          }}
        >
          {titulo}
        </Typography>
      </Box>

      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          background: "transparent",
          borderRadius: 0,
        }}
      >
        <Table>
          <TableHead>
            <TableRow
              sx={{
                background: alpha("#148d8d", 0.08),
              }}
            >
              <TableCell
                sx={{
                  fontWeight: 800,
                  color: "#0b4f6c",
                  borderBottom: `1px solid ${alpha("#0b4f6c", 0.08)}`,
                }}
              >
                Categoría
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 800,
                  color: "#0b4f6c",
                  borderBottom: `1px solid ${alpha("#0b4f6c", 0.08)}`,
                }}
              >
                Cantidad
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {datos && lista.length > 0 ? (
              lista.map((pago, index) => {
                const riskStyles = getRiskStyles(pago.tipo);

                return (
                  <TableRow
                    key={index}
                    sx={{
                      "&:nth-of-type(even)": {
                        background: alpha("#0b4f6c", 0.018),
                      },
                      "&:hover": {
                        background: riskStyles.rowHover,
                      },
                    }}
                  >
                    <TableCell
                      sx={{
                        py: 2,
                        borderBottom: `1px solid ${alpha("#0b4f6c", 0.06)}`,
                        fontWeight: 700,
                        color: "#10384d",
                      }}
                    >
                      {pago.tipo}
                    </TableCell>

                    <TableCell
                      sx={{
                        py: 2,
                        borderBottom: `1px solid ${alpha("#0b4f6c", 0.06)}`,
                        color: "#10384d",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          flexWrap: "wrap",
                        }}
                      >
                        <Chip
                          label={`${pago.valor} salarios mínimos`}
                          sx={{
                            borderRadius: "999px",
                            fontWeight: 800,
                            background: riskStyles.chipBg,
                            color: riskStyles.chipColor,
                            border: riskStyles.chipBorder,
                          }}
                        />

                        <Typography sx={{ fontWeight: 700 }}>
                          ({formatNumber(pago.valor * datos[0][0]["valor"])} pesos)
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={2}
                  sx={{
                    textAlign: "center",
                    py: 4,
                    color: alpha("#10384d", 0.65),
                    fontWeight: 600,
                  }}
                >
                  Sin valores
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  return (
    <Box
      sx={{
        minHeight: "100vh",
        p: { xs: 2, md: 3 },
        background: dashboardBg,
      }}
    >
    <Box
  sx={{
    mb: 2.2,
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 1,
  }}
>
  <Chip
    label={`${mesNombre} ${anio}`}
    icon={<CalendarMonthRoundedIcon sx={{ color: "#fff !important" }} />}
    sx={{
      height: 44,
      px: 1.1,
      borderRadius: "999px",
      background: headerGradient,
      color: "#fff",
      fontWeight: 800,
      fontSize: "0.98rem",
      boxShadow: "0 10px 22px rgba(11, 79, 108, 0.16)",
      border: `1px solid ${alpha("#ffffff", 0.08)}`,
      "& .MuiChip-label": {
        px: 1.15,
      },
    }}
  />
</Box>
 <Box
  sx={{
    display: "grid",
    gridTemplateColumns: { xs: "1fr", lg: "1.1fr 0.9fr" },
    gap: 3,
    alignItems: "stretch",
  }}
>
  {/* SALARIO */}
  <Card sx={cardBaseSx}>
    <Box
      sx={{
        px: 2.5,
        py: 2,
        background: headerGradient,
        color: "#fff",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 1.5,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <Box
          sx={{
            width: 46,
            height: 46,
            borderRadius: "14px",
            background: alpha("#ffffff", 0.12),
            border: `1px solid ${alpha("#ffffff", 0.18)}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <PaidRoundedIcon sx={{ color: "#fff" }} />
        </Box>

        <Box>
          <Typography sx={{ fontWeight: 800, fontSize: "1.35rem" }}>
            Salario mínimo, vital y móvil
          </Typography>
          <Typography
            sx={{
              color: alpha("#ffffff", 0.86),
              fontSize: "0.95rem",
              fontWeight: 500,
            }}
          >
            Valor base configurado actualmente en el sistema
          </Typography>
        </Box>
      </Box>

      <Button
        variant="contained"
        onClick={handleOpen}
        startIcon={<EditRoundedIcon />}
        sx={{
          borderRadius: "14px",
          px: 2.3,
          py: 1,
          textTransform: "none",
          fontWeight: 800,
          fontSize: "0.95rem",
          color: "#fff",
          background: "linear-gradient(90deg, #2b8d9c 0%, #1aa0a5 100%)",
          boxShadow: "0 8px 18px rgba(13, 141, 141, 0.25)",
          "&:hover": {
            background: "linear-gradient(90deg, #257c89 0%, #148d8d 100%)",
          },
        }}
      >
        Modificar
      </Button>
    </Box>

    <CardContent sx={{ p: 3 }}>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
          gap: 2,
        }}
      >
        <Box
          sx={{
            p: 2.2,
            borderRadius: "18px",
            background: alpha("#148d8d", 0.07),
            border: `1px solid ${alpha("#148d8d", 0.12)}`,
          }}
        >
          <Typography sx={sectionSubSx}>Valor actual</Typography>
          <Typography
            sx={{
              mt: 0.8,
              fontSize: { xs: "1.7rem", md: "2.1rem" },
              fontWeight: 900,
              color: "#0b4f6c",
              lineHeight: 1.1,
            }}
          >
            ${salarioActual ? formatNumber(salarioActual) : "0"}
          </Typography>
          <Typography
            sx={{
              mt: 0.7,
              fontSize: "0.95rem",
              color: alpha("#10384d", 0.72),
            }}
          >
            ARS
          </Typography>
        </Box>

        <Box
          sx={{
            p: 2.2,
            borderRadius: "18px",
            background: alpha("#0b4f6c", 0.05),
            border: `1px solid ${alpha("#0b4f6c", 0.1)}`,
          }}
        >
          <Typography sx={sectionSubSx}>Fecha de carga</Typography>
          <Typography
            sx={{
              mt: 1,
              fontSize: "1.35rem",
              fontWeight: 800,
              color: "#10384d",
            }}
          >
            {fechaCarga || "Sin fecha"}
          </Typography>
        </Box>
      </Box>
    </CardContent>
  </Card>

  {/* ICC */}
<Card
  sx={{
    ...cardBaseSx,
    height: "100%",
  }}
>
  <Box
    sx={{
      px: 2.5,
      py: 2,
      background: headerGradient,
      color: "#fff",
      display: "flex",
      alignItems: "center",
      gap: 1.5,
    }}
  >
    <Box
      sx={{
        width: 46,
        height: 46,
        borderRadius: "14px",
        background: alpha("#ffffff", 0.12),
        border: `1px solid ${alpha("#ffffff", 0.18)}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <TrendingUpRoundedIcon sx={{ color: "#fff" }} />
    </Box>

    <Box>
      <Typography
        sx={{
          fontWeight: 800,
          fontSize: "1.35rem",
          color: "#fff",
          lineHeight: 1.15,
        }}
      >
        ICC
      </Typography>
      <Typography
        sx={{
          color: alpha("#ffffff", 0.86),
          fontSize: "0.95rem",
          fontWeight: 500,
        }}
      >
        Índice correspondiente al mes actual
      </Typography>
    </Box>
  </Box>

  <CardContent
    sx={{
      p: 3,
      display: "flex",
      flexDirection: "column",
      height: "calc(100% - 82px)",
    }}
  >
    <Box
      sx={{
        p: 2.2,
        borderRadius: "18px",
        background: alpha("#148d8d", 0.07),
        border: `1px solid ${alpha("#148d8d", 0.12)}`,
        flexGrow: 1,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <Box>
        <Typography
          sx={{
            fontSize: "0.94rem",
            fontWeight: 700,
            color: alpha("#10384d", 0.75),
          }}
        >
          Valor ICC
        </Typography>

        <Typography
          sx={{
            mt: 1,
            fontSize: { xs: "2rem", md: "2.45rem" },
            fontWeight: 900,
            color: "#0b4f6c",
            lineHeight: 1.05,
          }}
        >
          {iccActual ? iccActual : "Sin ICC en este mes"}
        </Typography>
      </Box>

      <Box sx={{ mt: 2 }}>
        <Divider sx={{ mb: 2, borderColor: alpha("#0b4f6c", 0.08) }} />

        <Chip
          label={`Mes: ${mesNombre} ${anio}`}
          sx={{
            borderRadius: "999px",
            fontWeight: 800,
            background: alpha("#0b4f6c", 0.08),
            color: "#10384d",
          }}
        />
      </Box>
    </Box>
  </CardContent>
</Card>

  {/* RIESGO ABAJO OCUPANDO TODO EL ANCHO */}
  <Card
    sx={{
      ...cardBaseSx,
      gridColumn: { xs: "auto", lg: "1 / -1" },
    }}
  >
    <Box
      sx={{
        px: 2.5,
        py: 2,
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        borderBottom: `1px solid ${alpha("#0b4f6c", 0.08)}`,
        background: alpha("#0b4f6c", 0.03),
      }}
    >
      <Box
        sx={{
          width: 46,
          height: 46,
          borderRadius: "14px",
          background: alpha("#148d8d", 0.12),
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <WarningAmberRoundedIcon sx={{ color: "#0b4f6c" }} />
      </Box>
      <Box>
        <Typography sx={sectionTitleSx}>Criterios de riesgo</Typography>
        <Typography sx={sectionSubSx}>
          Separado por persona y empresa, con colores por nivel de riesgo
        </Typography>
      </Box>
    </Box>

    <CardContent sx={{ p: 3 }}>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" },
          gap: 2.2,
          alignItems: "start",
        }}
      >
        {renderTablaRiesgo("Persona", riesgosPersona)}
        {renderTablaRiesgo("Empresa", riesgosEmpresa)}
      </Box>
    </CardContent>
  </Card>
</Box>

      <Modal open={open} onClose={handleClose}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: "92%", sm: 480 },
            borderRadius: "24px",
            overflow: "hidden",
            bgcolor: "#fff",
            boxShadow: "0 24px 60px rgba(10, 59, 79, 0.25)",
          }}
        >
          <Box
            sx={{
              px: 3,
              py: 2.2,
              background: headerGradient,
              color: "#fff",
            }}
          >
            <Typography sx={{ fontSize: "1.3rem", fontWeight: 800 }}>
              Modificar salario
            </Typography>
            <Typography
              sx={{
                mt: 0.4,
                fontSize: "0.92rem",
                color: alpha("#fff", 0.86),
              }}
            >
              Actualizá el valor y la fecha de carga
            </Typography>
          </Box>

          <Box sx={{ p: 3 }}>
            <Typography
              sx={{
                mb: 0.8,
                fontWeight: 700,
                color: "#10384d",
                fontSize: "0.95rem",
              }}
            >
              Nuevo salario
            </Typography>
            <TextField
              type="number"
              fullWidth
              name="valor"
              onChange={handleChange}
              placeholder="Ingrese el nuevo valor"
              sx={{
                mb: 2.2,
                "& .MuiOutlinedInput-root": {
                  borderRadius: "14px",
                  background: alpha("#0b4f6c", 0.02),
                },
              }}
            />

            <Typography
              sx={{
                mb: 0.8,
                fontWeight: 700,
                color: "#10384d",
                fontSize: "0.95rem",
              }}
            >
              Fecha
            </Typography>
            <TextField
              type="text"
              fullWidth
              name="fecha"
              onChange={handleChange}
              placeholder="17/02/2024"
              sx={{
                mb: 2.5,
                "& .MuiOutlinedInput-root": {
                  borderRadius: "14px",
                  background: alpha("#0b4f6c", 0.02),
                },
              }}
            />

            {form.valor && form.fecha ? (
              <Button
                variant="contained"
                fullWidth
                onClick={handleSubmit}
                sx={{
                  borderRadius: "14px",
                  py: 1.2,
                  textTransform: "none",
                  fontSize: "0.98rem",
                  fontWeight: 800,
                  background:
                    "linear-gradient(90deg, #0b4f6c 0%, #148d8d 100%)",
                  boxShadow: "0 10px 22px rgba(11, 79, 108, 0.22)",
                  "&:hover": {
                    background:
                      "linear-gradient(90deg, #093f57 0%, #117878 100%)",
                  },
                }}
              >
                Guardar
              </Button>
            ) : (
              <Button
                variant="contained"
                fullWidth
                onClick={handleSubmitfalso}
                sx={{
                  borderRadius: "14px",
                  py: 1.2,
                  textTransform: "none",
                  fontSize: "0.98rem",
                  fontWeight: 800,
                  background: alpha("#0b4f6c", 0.55),
                  "&:hover": {
                    background: alpha("#0b4f6c", 0.7),
                  },
                }}
              >
                Completar los datos
              </Button>
            )}
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default MainMenu;