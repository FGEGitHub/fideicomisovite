import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import logo from '../../Assets/marcas.png';
import ModoOscuroContext, { PALETA_CLARA, PALETA_OSCURA } from "../../context/ModoOscuroContext";

import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import SummarizeIcon from '@mui/icons-material/Summarize';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import BarChartIcon from '@mui/icons-material/BarChart';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CloseIcon from '@mui/icons-material/Close';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';

import '../movimientos2/menuizq7.css';

const MODO_OSCURO_STORAGE_KEY = "nivel6_modo_oscuro";

const initialWidth = 260; // Ancho inicial del menú

const menuItems = [
  {
    text: 'Movimientos',
    icon: <CloudUploadIcon fontSize="small" />,
    path: '/nivel6/carga',
    accent: '#148d8d',
    accentSoft: 'rgba(20, 141, 141, 0.22)',
  },
  {
    text: 'General/Mensual',
    icon: <SummarizeIcon fontSize="small" />,
    path: '/nivel6/resumen1',
    accent: '#4fc3f7',
    accentSoft: 'rgba(79, 195, 247, 0.18)',
  },{
    text: 'Ingresos/Egresos',
    icon: <CompareArrowsIcon fontSize="small" />,
    path: '/nivel6/comparativo',
    accent: '#9b8bd4',
    accentSoft: 'rgba(155, 139, 212, 0.22)',
  },
   
  {
    text: 'Ingresos',
    icon: <TrendingUpIcon fontSize="small" />,
    path: '/nivel6/resumen6',
    accent: '#15803d',
    accentSoft: 'rgba(21, 128, 61, 0.18)',
  }, {
    text: 'Egresos',
    icon: <TrendingDownIcon fontSize="small" />,
    path: '/nivel6/resumen2',
    accent: '#dc2626',
    accentSoft: 'rgba(220, 38, 38, 0.18)',
  },
  {
    text: 'Analisis General',
    icon: <BarChartIcon fontSize="small" />,
    path: '/nivel6/resumen3',
    accent: '#2aaad1',
    accentSoft: 'rgba(42, 170, 209, 0.22)',
  },

];

export default function MenuIzq2({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState();
  const [drawerWidth, setDrawerWidth] = useState(initialWidth);
  const [resizing, setResizing] = useState(false);
  const [menuVisible, setMenuVisible] = useState(true);

  // Modo oscuro/claro de la sección nivel6. Por defecto arranca en claro;
  // se recuerda en localStorage para que no se resetee al navegar entre páginas
  // (cada página monta su propio MenuIzq2, así que el estado no persiste solo).
  const [oscuro, setOscuro] = useState(
    () => window.localStorage.getItem(MODO_OSCURO_STORAGE_KEY) === "true"
  );

  useEffect(() => {
    window.localStorage.setItem(MODO_OSCURO_STORAGE_KEY, String(oscuro));
  }, [oscuro]);

  const toggleOscuro = () => setOscuro((prev) => !prev);

  const colores = oscuro ? PALETA_OSCURA : PALETA_CLARA;

  // Tema MUI (respeta el tono azul marino del sidebar) para todos los componentes
  // MUI que se rendericen dentro de la sección nivel6 (Select, Dialog, Modal, Chip,
  // Button, etc.), ya que por defecto usan el theme claro de MUI.
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: oscuro ? "dark" : "light",
          background: {
            default: colores.BG_PAGE,
            paper: colores.BG_CARD,
          },
          primary: {
            main: colores.COLOR_TEAL,
          },
          text: oscuro
            ? { primary: "#eaf3f7", secondary: "rgba(234,243,247,0.62)" }
            : { primary: colores.COLOR_NAVY, secondary: colores.TEXT_MUTED },
        },
      }),
    [oscuro, colores]
  );

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedNoteAppUser')
    const useer = JSON.parse(loggedUserJSON)
    setUser(useer)
  }, [])

  const handleMouseMove = (e) => {
    if (resizing) {
      const newWidth = Math.max(200, Math.min(e.clientX, 500)); // Limita entre 200 y 500px
      setDrawerWidth(newWidth);
    }
  };

  const handleMouseUp = () => {
    setResizing(false);
  };
  useEffect(() => {
    if (resizing) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    } else {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [resizing]);

  const handleClick = (path) => {
    navigate(path);
  };

  const hanleLogout = () => {
    window.localStorage.removeItem('loggedNoteAppUser')
    window.location.href = '/login';
  }

  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };

  const iniciales = (user?.nombre || "U")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className={`mi-shell${oscuro ? " mi-shell--dark" : ""}`}>
      {menuVisible && (
        <aside
          className={`mi-sidebar${resizing ? " is-resizing" : ""}`}
          style={{ width: drawerWidth }}
        >
          <div className="mi-sidebar-brand">
            <img src={logo} alt="Santa Catalina Fideicomiso" className="mi-brand-logo" />
            <button className="mi-sidebar-close" onClick={toggleMenu} title="Ocultar menú">
              <CloseIcon fontSize="small" />
            </button>
          </div>

          <div className="mi-sidebar-divider" />

          {user && (
            <nav className="mi-sidebar-nav">
              {menuItems.map((item) => {
                const active = location.pathname === item.path;
                return (
                  <div
                    key={item.text}
                    className={`mi-nav-item${active ? " active" : ""}`}
                    style={{ "--accent": item.accent, "--accent-soft": item.accentSoft }}
                    onClick={() => handleClick(item.path)}
                  >
                    <span className="mi-nav-icon">{item.icon}</span>
                    <span className="mi-nav-title">{item.text}</span>
                    <ChevronRightIcon className="mi-nav-arrow" />
                  </div>
                );
              })}
            </nav>
          )}

          <div className="mi-sidebar-footer">
            <div className="mi-user-row">
              <div className="mi-user-avatar">{iniciales}</div>
              <div className="mi-user-info">
                <p className="mi-user-name">{user?.nombre || "Usuario"}</p>
                <p className="mi-user-role">Nivel {user?.nivel ?? "-"}</p>
              </div>
            </div>
            <button className="mi-modo-toggle-btn" onClick={toggleOscuro}>
              {oscuro ? <LightModeIcon sx={{ fontSize: 16 }} /> : <DarkModeIcon sx={{ fontSize: 16 }} />}
              {oscuro ? "Modo claro" : "Modo oscuro"}
            </button>

            <button className="mi-logout-btn" onClick={hanleLogout}>
              <LogoutIcon sx={{ fontSize: 16 }} />
              Cerrar sesión
            </button>
          </div>

          <div
            className="mi-resizer"
            onMouseDown={() => setResizing(true)}
          />
        </aside>
      )}

      <main className="mi-main" style={{ marginLeft: menuVisible ? drawerWidth : 0 }}>
        {!menuVisible && (
          <button className="mi-show-menu-btn" onClick={toggleMenu}>
            <MenuIcon sx={{ fontSize: 18 }} />
            Mostrar menú
          </button>
        )}

        <ThemeProvider theme={theme}>
          <ModoOscuroContext.Provider value={{ oscuro, toggleOscuro, colores }}>
            {children}
          </ModoOscuroContext.Provider>
        </ThemeProvider>
      </main>
    </div>
  );
}
