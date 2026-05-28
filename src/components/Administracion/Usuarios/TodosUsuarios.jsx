import * as React from 'react';
import { useParams } from "react-router-dom"
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { useState, useEffect } from "react";
import servicioNivel3 from '../../../services/nivel3'
import servicioAdmin from '../../../services/Administracion'


import DeleteForeverIcon from '@mui/icons-material/DeleteForever';

export default function Ingresos() {
    let params = useParams()


    const [usuarios, setUsuarios] = useState([]);





    useEffect(() => {
        traer()
    }, [])
    const traer = async () => {
 console.log('Historial')
        const historial = await servicioNivel3.traerUsuarios()
       
  
        setUsuarios(historial)
        // 

    };
    const borrar = async (cuil_cuit) => {
        
        const rta = await servicioAdmin.borrarusuario(cuil_cuit)
        alert(rta)
        traer()
    }

   function CutomButtonsRenderer(dataIndex) {
  return (
    <div>
      <button>Editar</button>

      <button>Buscar</button>

      <button
        onClick={() => borrar(usuarios[dataIndex].cuil_cuit)}
      >
        Borrar
      </button>
    </div>
  );
}
    const columns = [
        {
            name: "cuil_cuit",
            label: "cuil_cuit",

        },
        {
            name: "nombre",
            label: "nombre",
        },
        {
            name: "nivel",
            label: "nivel",

        },


        {
            name: "Actions",
            options: {
                customBodyRenderLite: (dataIndex, rowIndex) =>
                    CutomButtonsRenderer(
                        dataIndex,
                        rowIndex,
                        // overbookingData,
                        // handleEditOpen
                    )
            }

        },


    ];



    return (
        <div>

 
        tabla
          
        </div>
    );
}
