import { useState, useEffect } from "react";


import { useNavigate } from "react-router-dom";
import Button from '@mui/material/Button';

import servicionivel3 from '../../../services/nivel3'


//import overbookingData from "./overbooking";

const Historial = () => {
    //configuracion de Hooks
    const [historial, setHistorial] = useState([]);
    const navigate = useNavigate();


    
const traer = async() => {
      
    const historial = await servicionivel3.traerhistorialvalor()
   
    setHistorial(historial)
  // 
    
    };  
    

    useEffect(() => {
        traer()
    }, [])
    ///



 
    // definimos las columnas
    const columns = [
        {
            name: "fecha",
            label: "Fecha",

        },
        {
            name: "valormetroparque",
            label: "Zona",

        },
        {
            name: "valormetrocuadrado",
            label: "Valor Metro Cuadrado",
        },
       
       
        
       
 

    ];

const options = {

    /*    rowsPerPage: 10,
       download: false, // hide csv download option
       onTableInit: this.handleTableInit,
       onTableChange: this.handleTableChange, */
};
// renderiza la data table
return (<>

        
        </>
  
)
}

export default Historial;