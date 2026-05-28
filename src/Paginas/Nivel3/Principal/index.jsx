import * as React from 'react';
import { useEffect, useState } from "react";

import Tarjetas from '../../../components/nivel3/principal/tarjetas';
import { useNavigate } from "react-router-dom";
import BarraLAteral from '../../../components/nivel3/Menuizq3'

import CssBaseline from '@mui/material/CssBaseline';



const drawerWidth = 240;

export default function DetalleCliente() {
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


  
  


 

  ////////

  return (

    <div> 
  { logueado ? <div> 
      <CssBaseline />
    <BarraLAteral>
    <Tarjetas/>
     
 </BarraLAteral>
 </div>   :<div></div> } </div>
  );
}