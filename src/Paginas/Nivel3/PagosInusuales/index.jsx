import * as React from 'react';
import  { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";


import  useNoti from '../../../hooks/useNoti'
import  useUser from '../../../hooks/useUser'
import BarraLAteral from '../../../components/nivel3/Menuizq3'
import Tabla from '../../../components/nivel3/pagosinusuales/TablaPagosinusuales'
import CssBaseline from '@mui/material/CssBaseline';




const drawerWidth = 240;

export default function MenuUsuario2() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null)
  const [] = useState('')

  const nombre  = useUser()

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
       <Tabla/>

 </BarraLAteral>
  
  </div>   :<div></div> } </div>
  );
}