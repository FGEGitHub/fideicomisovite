

import PagosInusuales  from "../../../components/nivel3/MensualesInusuales";
import BarraLAteral from '../../../components/nivel3/Menuizq3'
import { useEffect, useState } from "react";
import CssBaseline from '@mui/material/CssBaseline';
import { useNavigate } from "react-router-dom";







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
  <PagosInusuales/>
     
      </BarraLAteral>
     </div>   :<div></div> } </div>
    );

}