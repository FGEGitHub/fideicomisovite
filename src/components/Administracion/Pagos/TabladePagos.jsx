import { useParams } from "react-router-dom"
import ModalSeguro from './ModalSeguro'
import ServicioAdmin from '../../../services/Administracion'
import React, { useEffect, useState, Fragment } from "react";
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';
import SearchIcon from '@mui/icons-material/Search';

import Button from '@mui/material/Button';
import MUIDataTable from "mui-datatables";
import TextField from '@mui/material/TextField';
import { useNavigate } from "react-router-dom";
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';


//////

const LotesCliente = (props) => {
    let params = useParams()
    let cuil_cuit = params.cuil_cuit
    const navigate = useNavigate();

    useEffect(() => {

        traer()

    }, [])

    const [pagos, setPagos] = useState([''])
    const [cuotas, setCuotas] = useState([''])
    const [open, setOpen] = React.useState(false);

    const [idlote, setIdlote] = useState(null)


 
    //////////servicioCuotas


    const handleClose = () => {
        setOpen(false);
    };

    const handleOpen = () => {
        setOpen(true);
    };

    ///


    

    const traer = async () => {

        const pagos = await ServicioAdmin.traerPagos()
        console.log(pagos)
        setPagos(pagos)




    }
    const borrar = async (id) => {

        const rta = await ServicioAdmin.borrarPago(id)

        alert(rta)
    }

    const borrarTodas = async (id) => {

        const rta = await ServicioAdmin.borrarcuota(id)

        alert(rta)
    }  

    


    function CutomButtonsRenderer(dataIndex, rowIndex, data, onClick) {
        return (
            <>
            
            <div>
            < ModalSeguro
            id = {pagos[dataIndex].id}
            traer ={ async () => {

                const pagos = await ServicioAdmin.traerPagos()
                
                setPagos(pagos)}}
            
            />

           
           
         
            </div>
                <SearchIcon style={{ cursor: "pointer" }}
                    onClick={() => navigate('' + cuotas[dataIndex].id)}//Navigate('usuario2/detallecliente'+clients[dataIndex].cuil_cuit)
                />


              
            </>
        );
    }
 
    const columns = [
        {
            name: "id",
            label: "id",

        },
        {
            name: "mes",
            label: "Mes",

        },
        {
            name: "anio",
            label: "Año",

        },

  
        {
            name: "cuil_cuit",
            label: "cuil_cuit",

        },
     
        
    
        
     
    
        {
            name: "monto",
            label: "monto",

        },


        {
            name: "Acciones",
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

        <Fragment>
            <Button onClick={() => { borrarTodas() }} variant="contained" color="success">
                Borrar todos
            </Button>
            <br/> <br/>
           
         

            <div>

            
    
           
                  
                    <MUIDataTable
                        title={"Lista de cuotas"}
                        data={pagos}
                        columns={columns}
                        actions={[
                            {
                                icon: 'save',
                                tooltip: 'Save User',
                                onClick: (event, rowData) => alert("You saved " + rowData.name)
                            }
                        ]}
                    />
                  


                
                



            </div>

            <br /><br />


        </Fragment>

    )


}
export default LotesCliente

/* 
ANTE POSIBLE PROBLEMA AGREGAR EN LA LINEA 233
{
    lotes.map((item, index) =>

        <div>


            <Button key={index} variant="contained" onClick={() => { vercuotas(item['id']) }}> Ver cuotas del lote {item['zona']} Fraccion {item['fraccion']} - Manzana {item['manzana']} -Parcela {item['parcela']}</Button>
          
            <Button key={index} variant="contained" onClick={() => { navigate('/usuario2/agregarcuotas/' + item['id']) }} >
                Agregar cuotas al lote
            </Button>

            <BorrarCuotas
                id={item['id']} />

            <br /><br />
            <Button  key={index} variant="contained" onClick={() => { verief(item['id']) }} >
                Informe estado financiero
            </Button>

        </div>
    )
} */