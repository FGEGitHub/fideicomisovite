

import ValorMetro  from "../../../components/nivel3/declaraciones/Valormetro";
import BarraLAteral from '../../../components/nivel3/Menuizq3'
import AgregarIcc from '../../../components/nivel3/ModalIcc'
import BorrarIcc from '../../../components/nivel3/borrarhistorialicc/BorrarHistorialICC'
import CssBaseline from '@mui/material/CssBaseline';
import Button from '@mui/material/Button';
import Tabla from "../../../components/nivel3/declaraciones/ModalAsignacion"; 
import Historial from "../../../components/nivel3/declaraciones/HistorialValorMetro"; 
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Paper } from '@mui/material';





export default function Legajos() {
  const navigate = useNavigate();
  const [logueado, setLogueado] = useState(false) 


useEffect(() => {
  const loggedUserJSON = window.localStorage.getItem('loggedNoteAppUser')
  
  if (loggedUserJSON) {
    const user = JSON.parse(loggedUserJSON)
    if (user.nivel != 3){
      window.localStorage.removeItem('loggedNoteAppUser')
   navigate('/login')

    }else{

      setLogueado(true)
    }
  
    //servicioUsuario.setToken(user.token)  
   
    
  }
 
}, [])
    return (

      <div> 
  { logueado ? <div>
            <CssBaseline />
       <BarraLAteral>
       <Paper
        sx={{
          cursor: 'pointer',
          background: '#fafafa',
          color: '#bdbdbd',
          border: '1px dashed #ccc',
          '&:hover': { border: '1px solid #ccc' },
        }}
      >
       < ValorMetro/>
       </Paper>
       <br/> 
       <Historial/>
      </BarraLAteral>
         </div>   :<div></div> } </div>
    
    );

}