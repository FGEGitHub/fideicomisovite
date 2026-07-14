
import BarraLAteral from '../../../components/nivel6/menuizq6'
import Comparativo from '../../../components/resumenes/comparativo'
import CssBaseline from '@mui/material/CssBaseline';
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ComparativoIngresosEgresosPagina() {
  const navigate = useNavigate();
  const [logueado, setLogueado] = useState(false)

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedNoteAppUser')

    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      if (user.nivel != 6) {
        window.localStorage.removeItem('loggedNoteAppUser')
        navigate('/login')
      } else {
        setLogueado(true)
      }
    }
  }, [])

  return (
    <div>
      {logueado ? <div>
        <CssBaseline />
        <BarraLAteral>
          <Comparativo />
        </BarraLAteral>
      </div> : <div></div>}
    </div>
  );
}
