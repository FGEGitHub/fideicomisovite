import * as React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import CssBaseline from "@mui/material/CssBaseline";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Badge from "@mui/material/Badge";
import { alpha } from "@mui/material/styles";

import NfcIcon from "@mui/icons-material/Nfc";
import PriceCheckIcon from "@mui/icons-material/PriceCheck";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import QueryStatsIcon from "@mui/icons-material/QueryStats";
import PlagiarismIcon from "@mui/icons-material/Plagiarism";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import MoneyOffIcon from "@mui/icons-material/MoneyOff";
import PaidIcon from "@mui/icons-material/Paid";
import CloseIcon from "@mui/icons-material/Close";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";

import { useState, useEffect } from "react";
import useInusual from "../../hooks/useInusual";
import servicioPagos from "../../services/pagos";
import Navbar from "./Navbar3";

const drawerWidth = 240;

export default function MenuIzq2({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [notificaciones, setNotificaciones] = useState(0);
  const [menuVisible, setMenuVisible] = useState(true);

  const { cantidadInusual } = useInusual();

  const handleClick = (path) => {
    navigate(path);
  };

  useEffect(() => {
    cantidadnoti();
  }, []);

  const cantidadnoti = async () => {
    const notis = await servicioPagos.cantidadpendientesadmin();
    setNotificaciones(notis[0]);
  };

  const hanleLogout = () => {
    window.localStorage.removeItem("loggedNoteAppUser");
    window.location.reload(true);
  };

  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };

  const menuItems = [
    {
      text: "Lotes",
      icon: <NfcIcon />,
      path: "/nivel3/lotes",
    },
    {
      text: "Aprobación de Pagos",
      icon: <PriceCheckIcon />,
      path: "/nivel3/aprobacionesdepagos",
    },
    {
      text: "Pagos Inusuales",
      icon: (
        <Badge
          color="error"
          badgeContent={notificaciones > 0 ? notificaciones : null}
          sx={{
            "& .MuiBadge-badge": {
              fontWeight: 800,
            },
          }}
        >
          <PaidIcon />
        </Badge>
      ),
      path: "/nivel3/pagosinusuales",
    },
    {
      text: "Agregar ICC",
      icon: <QueryStatsIcon />,
      path: "/nivel3/icc",
    },
    {
      text: "Valor Metro Cuadrado",
      icon: <PlagiarismIcon />,
      path: "/nivel3/declaraciones",
    },
    {
      text: "Extracto",
      icon: <GroupAddIcon />,
      path: "/nivel3/extracto",
    },
    {
      text: "Agregar usuario",
      icon: <GroupAddIcon />,
      path: "/nivel3/agregarusuario",
    },
    {
      text: "Pagos Inusuales Mensuales",
      icon: <MoneyOffIcon />,
      path: "/nivel3/pagosmensualesinusuales",
    },
    {
      text: "Todos los pagos",
      icon: <MoneyOffIcon />,
      path: "/nivel3/pagos",
    },
    {
      text: "Agenda de novedades",
      icon: <AccountBalanceIcon />,
      path: "/nivel3/novedades",
    },
  ];

  return (
    <>
      <Box
        sx={{
          display: "flex",
          minHeight: "100vh",
          background:
            "linear-gradient(180deg, #eef4f7 0%, #f7fafb 45%, #eef3f5 100%)",
        }}
      >
        <CssBaseline />

        {menuVisible && (
          <Drawer
            variant="permanent"
            anchor="left"
            sx={{
              width: drawerWidth,
              flexShrink: 0,
              "& .MuiDrawer-paper": {
                width: drawerWidth,
                boxSizing: "border-box",
                background: "#ffffff",
                borderRight: `1px solid ${alpha("#0b4f6c", 0.08)}`,
                boxShadow: "8px 0 28px rgba(10, 59, 79, 0.06)",
                overflowX: "hidden",
              },
            }}
          >
            <Navbar logout={{ hanleLogout }} />

            {/* solo una compensación, no dos */}
            <Toolbar sx={{ minHeight: "64px !important" }} />

            <Divider sx={{ borderColor: alpha("#0b4f6c", 0.08) }} />

            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                height: "100%",
              }}
            >
              <List
                sx={{
                  px: 1.2,
                  py: 1,
                  pt: 0.75,
                  background: "transparent",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    mb: 0.5,
                  }}
                >
                  <IconButton
                    onClick={toggleMenu}
                    sx={{
                      color: "#1a303e",
                      borderRadius: "12px",
                      "&:hover": {
                        backgroundColor: alpha("#0b4f6c", 0.06),
                        color: "#0d3a49",
                      },
                    }}
                  >
                    <CloseIcon />
                  </IconButton>
                </Box>

                {menuItems.map((item) => {
                  const isActive = location.pathname === item.path;

                  return (
                    <ListItem
                      button
                      key={item.text}
                      onClick={() => handleClick(item.path)}
                      sx={{
                        my: 0.4,
                        px: 1.25,
                        py: 1.05,
                        borderRadius: 2.2,
                        transition: "all .18s ease",
                        border: "1px solid transparent",
                        cursor: "pointer",
                        backgroundColor: isActive
                          ? "rgba(20,141,141,0.18)"
                          : "transparent",
                        borderColor: isActive
                          ? "rgba(20,141,141,0.45)"
                          : "transparent",
                        boxShadow: isActive
                          ? "0 12px 26px rgba(20,141,141,0.18)"
                          : "none",
                        "&:hover": {
                          backgroundColor: isActive
                            ? "rgba(20,141,141,0.22)"
                            : "rgba(20,141,141,0.08)",
                          borderColor: "rgba(20,141,141,0.28)",
                          transform: "translateY(-1px)",
                        },
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          minWidth: 42,
                          "& svg": {
                            fontSize: 22,
                            color: isActive ? "#0d3a49" : "#1a303e",
                          },
                        }}
                      >
                        {item.icon}
                      </ListItemIcon>

                      <ListItemText
                        primary={item.text}
                        primaryTypographyProps={{
                          sx: {
                            fontFamily:
                              "system-ui, -apple-system, Segoe UI, Roboto, Arial",
                            fontWeight: isActive ? 800 : 700,
                            fontSize: 14.2,
                            color: isActive ? "#0d3a49" : "#0f2230",
                            letterSpacing: 0.15,
                          },
                        }}
                      />
                    </ListItem>
                  );
                })}
              </List>

              <Divider
                sx={{
                  mt: "auto",
                  borderColor: alpha("#0b4f6c", 0.08),
                }}
              />
            </Box>
          </Drawer>
        )}

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            minHeight: "100vh",
            background: "transparent",
            p: 3,
            transition: "all 0.3s ease-in-out",
          }}
        >
          <Toolbar sx={{ minHeight: "64px !important" }} />

          {!menuVisible && (
            <Button
              variant="contained"
              onClick={toggleMenu}
              startIcon={<MenuOpenIcon />}
              sx={{
                mb: 2,
                borderRadius: "14px",
                px: 2.2,
                py: 1,
                textTransform: "none",
                fontWeight: 800,
                fontSize: "0.95rem",
                background: "linear-gradient(90deg, #0a3b4f 0%, #148d8d 100%)",
                boxShadow: "0 10px 22px rgba(11, 79, 108, 0.18)",
                "&:hover": {
                  background: "linear-gradient(90deg, #093244 0%, #117878 100%)",
                },
              }}
            >
              Mostrar menú
            </Button>
          )}

          {children}
        </Box>
      </Box>
    </>
  );
}