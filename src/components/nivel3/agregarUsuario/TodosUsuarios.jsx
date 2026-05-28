import * as React from 'react';
import { useParams } from "react-router-dom"
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { useState, useEffect } from "react";
import servicioNivel3 from '../../../services/nivel3'
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';

import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';



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
  

/* 
    function CutomButtonsRenderer(dataIndex, rowIndex, data, onClick) {
        return (
            <>
                <EditIcon
                    onClick={() => onClick(data[dataIndex].id, dataIndex)}
                    style={{ marginRight: "10px", cursor: "pointer" }}
                />

            </>
        );
    } */
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

 
      
        </div>
    );
}
