import { useParams } from "react-router-dom"
import servicioPagosInusuales from '../../services/pagosInusuales'
import React, { useEffect, useState, Fragment } from "react";
import NativeSelect from '@mui/material/NativeSelect';
import Button from '@mui/material/Button';

import { styled } from '@mui/material/styles';
import { useNavigate } from "react-router-dom";
import InputLabel from '@mui/material/InputLabel';
import VerConstancias from "../nivel2/nivel2Aprobaciondepagos/VerConstancias";
import TableBody from '@mui/material/TableBody';
import Skeleton from '@mui/material/Skeleton';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import Table from '@mui/material/Table';
import { Typography } from '@mui/material';
const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
        backgroundColor: theme.palette.common.black,
        color: theme.palette.common.white,
    },
    [`&.${tableCellClasses.body}`]: {
        fontSize: 14,
    },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
    '&:nth-of-type(odd)': {
        backgroundColor: theme.palette.action.hover,
    },
    // hide last border
    '&:last-child td, &:last-child th': {
        border: 0,
    },
}));





const MensualInusuales = (props) => {
    let params = useParams()
    const [FormFecha, setFormFecha] = useState({
        mes:1,
        anio:2015
        
    })
    const navigate = useNavigate();

    const [pagos, setPagos] = useState([''])
    const [vista, setVista] = useState(true)
    


    
    //////////servicioCuotas





    const buscar = async (e) => {
        e.preventDefault()
        const pagos  = await servicioPagosInusuales.buscar(FormFecha)
      console.log(pagos)
        setPagos(pagos)




    }


    function fecha(dataIndex, rowIndex, data, onClick) {

        return (
            <>
            {pagos[dataIndex].fecha}<br/>
           (  cuota:
           {pagos[dataIndex].mes}/ {pagos[dataIndex].anio})


            </>
        );
    }
    function estadoo(dataIndex, rowIndex, data, onClick) {

        return (
            <>
            
                                                <Button  onClick={() => navigate(pagos[dataIndex].zona === "IC3" ? `/nivel3/cuotaic3/${pagos[dataIndex].id_cuota}` : `/nivel3/cuota/${pagos[dataIndex].id_cuota}`)}>Ver pagos</Button>
                                      

            </>
        );
    }
    function verconstancias(dataIndex, rowIndex, data, onClick) {

        return (
            <>
        <VerConstancias
        id={pagos[dataIndex].id}
        />

            </>
        );
    }
    const columns = [
      
        {
            name: "Fecha",
            options: {
                customBodyRenderLite: (dataIndex, rowIndex) =>
                    fecha(
                        dataIndex,
                        rowIndex,
                        // overbookingData,
                        // handleEditOpen
                    )
            }

        },

        {
            name: "cuil_cuitc",
            label: "Cuil/Cuit",
        },
        {
            name: "nombreadmin",
            label: "Administrador",

        },
        {
            name: "monto",
            label: "Monto",

        },
        {
            name: "Nombre",
            label: "Nombre/Razon",

        },
      
        {
            name: "estado",
            options: {
                customBodyRenderLite: (dataIndex, rowIndex) =>
                    estadoo(
                        dataIndex,
                        rowIndex,
                        // overbookingData,
                        // handleEditOpen
                    )
            }

        },
       /*  {
            name: "Ver constancias",
            options: {
                customBodyRenderLite: (dataIndex, rowIndex) =>
                verconstancias(
                        dataIndex,
                        rowIndex,
                        // overbookingData,
                        // handleEditOpen
                    )
            }

        }, */
        
        {
            name: "proceso",
            label: "Clasificacion",

        },
      





    ];
    const options = {
    
        setTableProps: () => {
            return {
              style: {
                backgroundColor: "#e3f2fd", // Cambia el color de fondo de la tabla
              },
            };
          },
          customHeadRender: (columnMeta, handleToggleColumn) => ({
            TableCell: {
              style: {
                backgroundColor: '#1565c0', // Cambia el color de fondo del encabezado
                color: 'white', // Cambia el color del texto del encabezado
              },
            },
          }),
        selectableRows: false, // Desactivar la selección de filas
        stickyHeader: true,
        selectableRowsHeader: false,
        selectableRowsOnClick: true,
        responsive: 'scroll',
        rowsPerPage: 10,
        rowsPerPageOptions: [5, 10, 15],
        downloadOptions: { filename: 'tableDownload.csv', separator: ',' },
        print: true,
        filter: true,
        viewColumns: true,
        pagination: true,

        textLabels: {
          body: {
            noMatch: "No se encontraron registros de pagos inusuales para el mes seleccionado",
            toolTip: "Ordenar",
          },
          pagination: {
            next: "Siguiente",
            previous: "Anterior",
            rowsPerPage: "Filas por página:",
            displayRows: "de",
          },
          toolbar: {
            search: "Buscar",
            downloadCsv: "Descargar CSV",
            print: "Imprimir",
            viewColumns: "Ver columnas",
            filterTable: "Filtrar tabla",
          },
          filter: {
            all: "Todos",
            title: "FILTROS",
            reset: "RESETEAR",
          },
          viewColumns: {
            title: "Mostrar columnas",
            titleAria: "Mostrar/ocultar columnas de la tabla",
          },
          selectedRows: {
            text: "fila(s) seleccionada(s)",
            delete: "Eliminar",
            deleteAria: "Eliminar filas seleccionadas",
          },
        },
    
  };
    const handleChange = (e) => {
        console.log(FormFecha)
        setFormFecha({ ...FormFecha, [e.target.name]: e.target.value })
    }

   

    return (

        <Fragment>
            <br/> <br/> <br/> <br/>
            <Typography variant="h4" component="h1" align="center" color="primary">
      Buscar pagos inusuales por fecha
    </Typography>
    <Paper
        sx={{
          cursor: 'pointer',
          background: '#fafafa',
          width:'25%',
          color: '#bdbdbd',
          border: '1px dashed #ccc',
          '&:hover': { border: '1px solid #ccc' },
        }}
      >
                          <InputLabel  variant="standard" htmlFor="uncontrolled-native">
                           Mes
                        </InputLabel>
                        <NativeSelect
                            defaultValue={'1'}
                            onChange={handleChange}
                            inputProps={{
                                name: 'mes',
                                id: 'uncontrolled-native',
                               
                            }}
                        >   <option  value={'1'}>Enero</option>
                            <option   value={'2'}>Febrero</option>
                            <option  value={'3'}>Marzo</option>
                            <option  value={'4'}>Abril</option>
                            <option   value={'5'}>Mayo</option>
                            <option  value={'6'}>Junio</option>
                            <option  value={'7'}>Julio</option>
                            <option   value={'8'}>Agosto</option>
                            <option  value={'9'}>Septiembre</option>
                            <option  value={'10'}>Octubre</option>
                            <option   value={'11'}>Noviembre</option>
                            <option  value={'12'}>Diciembre</option>
                      
                         
                        </NativeSelect> 
                        <InputLabel  variant="standard" htmlFor="uncontrolled-native">
                           Año
                        </InputLabel>
                        <NativeSelect
                            defaultValue={'2015'}
                            onChange={handleChange}
                            inputProps={{
                                name: 'anio',
                                id: 'uncontrolled-native',
                               
                            }}
                        >   <option  value={'2015'}>2015</option>
                            <option   value={'2016'}>2016</option>
                            <option  value={'2017'}>2017</option>
                            <option   value={'2018'}>2018</option>
                            <option  value={'2019'}>2019</option>
                            <option   value={'2020'}>2020</option>
                            <option  value={'2021'}>2021</option>
                            <option  value={'2022'}>2022</option>
                            <option  value={'2023'}>2023</option>
                            <option  value={'2024'}>2024</option>
                            <option  value={'2025'}>2025</option>
                        </NativeSelect> 
                        

                        <Button onClick={buscar} >Buscar</Button>

                        </Paper>


            <div>
                <div>
                <br/> <br/>
                <Button variant="outlined" onClick={()=>{setVista(!vista)}}> Cambiar vista</Button>
                { vista  ? <>
                   tabla</>:<>
                      <Paper
                                    sx={{
                                        cursor: 'pointer',
                                        background: '#eeeeee',
                                        color: '#bdbdbd',
                                        border: '1px dashed #ccc',
                                        width: "90%",
                                        '&:hover': { border: '1px solid #ccc' },
                                        border: "1px solid black",
                                        margin: '75px',

                                    }}
                                >

                                    <TableContainer>
                                        {!pagos ? <Skeleton /> : <>
                                            <h1>CUOTAS</h1>
                                            <Table >
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell style={{ backgroundColor: "black", color: 'white' }} ><b>FECHA</b> <b /></TableCell>
                                                        <TableCell style={{ backgroundColor: "black", color: 'white' }}><b>CUIL/CUIT</b></TableCell>
                                                        <TableCell style={{ backgroundColor: "black", color: 'white' }}><b>INGRESOS</b></TableCell>
                                                        <TableCell style={{ backgroundColor: "black", color: 'white' }}><b>MONTO</b></TableCell>
                                                        <TableCell style={{ backgroundColor: "black", color: 'white' }} ><b>ESTADO</b></TableCell>
                                                        <TableCell style={{ backgroundColor: "black", color: 'white' }} ><b>Clasificacion</b></TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>



                                                    {pagos.map((row) => (
                                                        <StyledTableRow key={row.name}>
                                                            <StyledTableCell component="th" scope="row">{row.mes}/{row.anio} </StyledTableCell>
                                                            <StyledTableCell component="th" scope="row">{row.cuil_cuit} </StyledTableCell>
                                                            <StyledTableCell component="th" scope="row">{row.ingresos} </StyledTableCell>
                                                            <StyledTableCell component="th" scope="row">{row.monto} </StyledTableCell>
                                                            <StyledTableCell component="th" scope="row">{row.estado =='P' ? <>Pendiente</>:<>  Aprobado</>} </StyledTableCell>
                                                            <StyledTableCell component="th" scope="row">{row.proceso} </StyledTableCell>
                                                        </StyledTableRow>
                                                    ))}




                                                </TableBody>
                                            </Table>
                                        </>}

                                    </TableContainer>
                                </Paper>
                    
                    </>}
                </div>
            </div>
        </Fragment>

    )


}
export default MensualInusuales