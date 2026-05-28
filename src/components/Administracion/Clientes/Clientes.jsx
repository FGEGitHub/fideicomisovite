import { useState, useEffect } from "react";
import servicioClientes from '../../../services/clientes'
import servicioAdmin from '../../../services/Administracion'
import MUIDataTable from "mui-datatables";
import Nuevo from '../../nivel2/listadeclientes/ClienteNuevo'
import CargaDeTabla from "../../CargaDeTabla"
import { useNavigate } from "react-router-dom";
import EditIcon from "@material-ui/icons/Edit";
import SearchIcon from '@mui/icons-material/Search';
import * as React from 'react';
import Stack from '@mui/material/Stack';
import MuiAlert from '@mui/material/Alert';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
//import overbookingData from "./overbooking";
const Alert = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
  });
const Clientes = () => {
    //configuracion de Hooks
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();


    

    const getClients = async () => {
        
        const clients = await servicioClientes.lista({

        })
        setClients(clients)
        setLoading(false);
    }
    const borrar = async (cuil_cuit) => {
        
        const rta = await servicioAdmin.borrar(cuil_cuit)
        alert(rta)
        getClients()
    }
    useEffect(() => {
        getClients()
    }, [])

    ///



    function CutomButtonsRenderer(dataIndex, rowIndex, data, onClick) {
        return (
          <>
            <EditIcon
             onClick={() =>  navigate('/admin/modificarcli/'+clients[dataIndex].cuil_cuit)}
              style={{ marginRight: "10px", cursor: "pointer" }}
            />
             <SearchIcon
             onClick={() =>  navigate('/admin/detallescliente/'+clients[dataIndex].cuil_cuit)}
             style={{ marginRight: "10px", cursor: "pointer" }}
            />

            <DeleteForeverIcon   onClick={() =>  borrar(clients[dataIndex].cuil_cuit)}
            
            />

           
          </>
        );
      }
    // definimos las columnas
    const columns = [
        {
            name: "id",
            label: "ID",

        },
        {
            name: "cuil_cuit",
            label: "Cuil/cuit",
        },
        {
            name: "Nombre",
            label: "Nombre",

        },
        {
            name: "razon",
            label: "Razon",
           
        },
        {
            name: "observaciones",
            label:"Observaciones",
           
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
            <Stack spacing={2} sx={{ width: '100%' }}>
 
 <Alert severity="info">Cantidad de clientes: {clients.length}</Alert>
    </Stack>
    <br/>
    <Nuevo
    getClients =  { async () => {
        const clients = await servicioClientes.lista({
        })
        setClients(clients)
    }}
    />
        <MUIDataTable
        
            title={"Lista de Clientes"}
            data={clients}
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

export default Clientes;