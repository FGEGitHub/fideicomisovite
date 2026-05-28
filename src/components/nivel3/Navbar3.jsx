import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../Assets/marcas.png";
import useUser from "../../hooks/useUser";
import {
  AppBar,
  Button,
  Box,
  Toolbar,
  useMediaQuery,
  useTheme,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import DrawerNav from "../DrawerNav";

const Navbar = () => {
  const usuario = useUser().userContext;

  const [user, setUser] = useState(null);
  const [value, setValue] = useState();
  const theme = useTheme();
  const isMatch = useMediaQuery(theme.breakpoints.down("md"));

  const navigate = useNavigate();

  const islogo = {
    width: "100px",
    marginRight: "16px",
    filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.5))",
    cursor: "pointer",
  };

  const handleClick = () => {
    navigate("/login");
  };

  const irNosotros = () => {
    navigate("/usuario/nosotros");
  };

  const irContacto = () => {
    navigate("/usuario/contacto");
  };

  const irAyuda = () => {
    navigate("/usuario/menu");
  };

  const hanleLogout = () => {
    window.localStorage.removeItem("loggedNoteAppUser");
    navigate("/login");
  };

  const inicio = () => {
    navigate("/usuario/menu");
  };

  const navButtonSx = {
    ml: 1.2,
    px: 1.8,
    py: 0.9,
    minWidth: "auto",
    borderRadius: "12px",
    textTransform: "none",
    fontWeight: 800,
    fontSize: "0.92rem",
    color: "#ffffff",
    border: `1px solid ${alpha("#ffffff", 0.14)}`,
    backgroundColor: "transparent",
    transition: "all .18s ease",
    "&:hover": {
      backgroundColor: alpha("#ffffff", 0.08),
      borderColor: alpha("#ffffff", 0.24),
      transform: "translateY(-1px)",
    },
  };

  const primaryActionSx = {
    ml: 1.2,
    px: 2,
    py: 0.95,
    minWidth: "auto",
    borderRadius: "12px",
    textTransform: "none",
    fontWeight: 800,
    fontSize: "0.92rem",
    color: "#ffffff",
    background: "linear-gradient(90deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.16) 100%)",
    border: `1px solid ${alpha("#ffffff", 0.16)}`,
    boxShadow: "0 6px 16px rgba(0,0,0,0.12)",
    "&:hover": {
      background: "linear-gradient(90deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.22) 100%)",
      transform: "translateY(-1px)",
    },
  };

  return (
    <React.Fragment>
      <AppBar
        sx={{
          background:
            "linear-gradient(90deg, #051821 0%, #051821 30%, #0b2a3a 45%, #01567c 65%, #148D8D 100%)",
          boxShadow: "0 3px 10px rgba(0,0,0,0.35)",
        }}
      >
        <Toolbar sx={{ minHeight: "72px !important" }}>
          <Box
            component="img"
            src={logo}
            alt="logo"
            style={islogo}
            onClick={inicio}
          />

          {isMatch ? (
            <Box sx={{ ml: "auto" }}>
              <DrawerNav />
            </Box>
          ) : (
            <>
              <Box
                sx={{
                  ml: "auto",
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  flexWrap: "wrap",
                }}
              >
                {usuario && (
                  <Button
                    sx={navButtonSx}
                    onClick={() => navigate("../Paginas/Nivel3/Principal")}
                  >
                    Inicio
                  </Button>
                )}

                <Button sx={navButtonSx} onClick={irAyuda}>
                  Ayuda
                </Button>

                {usuario && (
                  <Button onClick={hanleLogout} sx={primaryActionSx}>
                    Cerrar Sesión
                  </Button>
                )}

                {!usuario && (
                  <>
                    <Button sx={navButtonSx}>Registrarse</Button>
                    <Button onClick={handleClick} sx={primaryActionSx}>
                      Ingresar
                    </Button>
                  </>
                )}
              </Box>
            </>
          )}
        </Toolbar>
      </AppBar>
    </React.Fragment>
  );
};

export default Navbar;