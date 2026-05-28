import { useState, useEffect } from "react";
import servicioAdmin from '../../../services/Administracion'
import MUIDataTable from "mui-datatables";
import CargaDeTabla from "../../CargaDeTabla"
import { useNavigate } from "react-router-dom";
import * as React from 'react';
import MuiAlert from '@mui/material/Alert';

//import overbookingData from "./overbooking";
const Alert = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
  });
const Lotes = () => {
    //configuracion de Hooks
    const [dats, setDats] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();


    

    const getClients = async () => {
        
        const datos = await servicioAdmin.estracto({

        })
        setDats(datos)
        setLoading(false);
    }

    useEffect(() => {
        getClients()
    }, [])

    ///
//opcionde click en el nombre
   
      //

   
    // definimos las columnas
    const columns = [
        {
            name: "descripcion",
            label: "descripcion",

        },
        {
            name: "referencia",
            label: "referencia",
        },
       
  
        {
            name: "debitos",
            label: "debitos",
           
        },
        {
            name: "creditos",
            label:"creditos",
           
        },
       
 

    ];

const options = {

    /*    rowsPerPage: 10,
       download: false, // hide csv download option
       onTableInit: this.handleTableInit,
       onTableChange: this.handleTableChange, */
};
// renderiza la data table
return (
    <>
    {loading ? (<CargaDeTabla/>)
        :(
    <div>
    <br/>
   
        <MUIDataTable
        
            title={"Tabla de estracto"}
            data={dats}
            columns={columns}
            actions={[
                {
                    icon: 'save',
                    tooltip: 'Save User',
                    onClick: (event, rowData) => alert("You saved " + rowData.name)
                }
            ]}
            options={options}


        />
    </div>
    )}
    </>


)
}

export default Lotes;