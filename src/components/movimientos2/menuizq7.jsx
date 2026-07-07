import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import logo from '../../Assets/marcas.png';

import StorefrontIcon from '@mui/icons-material/Storefront';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CloseIcon from '@mui/icons-material/Close';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';

import './menuizq7.css';

const initialWidth = 260; // Ancho inicial del menú

const menuItems = [
  {
    text: 'Remax',
    icon: <StorefrontIcon fontSize="small" />,
    path: '/mov2/remax',
    accent: '#e0294b',
    accentSoft: 'rgba(224, 41, 75, 0.22)',
  },
  {
    text: 'Fideicomiso',
    icon: <AccountBalanceIcon fontSize="small" />,
    path: '/mov2/fideicomiso',
    accent: '#148d8d',
    accentSoft: 'rgba(20, 141, 141, 0.22)',
  },
];

export default function MenuIzq2({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState();
  const [drawerWidth, setDrawerWidth] = useState(initialWidth);
  const [resizing, setResizing] = useState(false);
  const [menuVisible, setMenuVisible] = useState(true);

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
    <div className="mi-shell">
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

        {children}
      </main>
    </div>
  );
}
