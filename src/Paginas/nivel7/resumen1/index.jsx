
import BarraLAteral from "../../../components/movimientos2/menuizq7";
import AgregarIcc from "../../../components/movimientos2/resumen1";
import CssBaseline from "@mui/material/CssBaseline";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Legajos() {
  const navigate = useNavigate();
  const [logueado, setLogueado] = useState(true);

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem(
      "loggedNoteAppUser"
    );

    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON);
      if (user.nivel != 7) {
        window.localStorage.removeItem("loggedNoteAppUser");
        navigate("/login");
      } else {
        setLogueado(true);
      }
    }
  }, []);

  return (
    <div>
      {logueado ? (
        <>
          <CssBaseline />

          <BarraLAteral>
            <AgregarIcc />
          </BarraLAteral>
        </>
      ) : (
        <div></div>
      )}
    </div>
  );
}