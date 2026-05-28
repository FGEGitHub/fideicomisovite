import * as React from 'react';
import  { useEffect, useState } from "react";
import TableAxios from '../../../components/nivel2/listadeclientes/Table';
import Nuevo from '../../../components/nivel2/listadeclientes/ClienteNuevo';
import { useNavigate } from "react-router-dom";
import servicioUsuario from '../../../services/usuarios'
import  useUser from '../../../hooks/useUser'
import BarraLAteral from '../../../components/nivel3/Menuizq3'
import CssBaseline from '@mui/material/CssBaseline';



const drawerWidth = 240;

export default function VerCliente() {
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
   
    <BarraLAteral>
       <Nuevo/>
    <TableAxios/>
 </BarraLAteral>
 </div>   :<div></div> } </div>

  );
}
