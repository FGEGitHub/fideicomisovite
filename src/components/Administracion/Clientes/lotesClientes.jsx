import { useParams } from "react-router-dom"
import servicioLotes from '../../../services/lotes'
import servicioCuotas from '../../../services/cuotas'
import ModificarCuota from './ModificarCuota'

import BorrarCuotas from '../../nivel2/borrarcuotas/BorrarCuotas'
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import React, { useEffect, useState, Fragment } from "react";
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import Button from '@mui/material/Button';
import MUIDataTable from "mui-datatables";
import { styled } from '@mui/material/styles';
import { useNavigate } from "react-router-dom";
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import Skeleton from '@mui/material/Skeleton';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import { Box } from "@material-ui/core";
import Grid from '@mui/material/Grid';
import Fab from '@mui/material/Fab';
import Stack from '@mui/material/Stack';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';

//////
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


const LotesCliente = (props) => {
    let params = useParams()
    let cuil_cuit = params.cuil_cuit
    const navigate = useNavigate();

    useEffect(() => {

        traer()

    }, [])

    const [lotes, setLotes] = useState([''])
    const [cuotas, setCuotas] = useState([''])
    const [open, setOpen] = React.useState(false);
    const [deudaExigible, setDeudaExigible] = useState([''])
    const [detallePendiente, setDetallePendiente] = useState([''])
    const [idlote, setIdlote] = useState(null)

    const [act, setAct] = useState(false)
    const [act2, setAct2] = useState(false)
    const [vista1, setVista1] = useState(true)
    const [state, setState] = React.useState({
        gilad: true,
        jason: false,
        antoine: true,
    });
    const vercuotas = async (index) => {
        
        const cuotas = await servicioCuotas.vercuotas(index)
        console.log(cuotas)
        setCuotas(cuotas)
        setIdlote(index)
        setAct(true)
        verief(index)
        setOpen(false)

    };
    //////////servicioCuotas


    const handleClose = () => {
        setOpen(false);
    };

    const handleOpen = () => {
        setOpen(true);
    };

    ///
    const handleChange = () => {
        setAct(!act);
    };
    const handleChange2 = () => {
        setAct2(!act2);
    };
    const Vista1 = () => {
        setVista1(!vista1);
    };

    const verief = async (index) => {

        const dde = await servicioCuotas.verief(index)
        setDeudaExigible(dde[0])
        setDetallePendiente(dde[1])
        setAct2(true)
        setOpen(false)



    };

    const traer = async () => {

        const lotes = await servicioLotes.lotesCliente(cuil_cuit)
        console.log(lotes)
        setLotes(lotes)




    }
    const borrar = async (id) => {

        const rta = await servicioCuotas.borrarcuota(id)

        alert(rta)

    }
    function saldoReal(dataIndex, rowIndex, data, onClick) {
        return (
            <>
                {cuotas[dataIndex].parcialidad === 'Final' ? '$ ' +  new Intl.NumberFormat('de-DE').format(cuotas[dataIndex].Saldo_real ) : <div> No Calculado </div>}

            </>
        );
    }
    function pago(dataIndex, rowIndex, data, onClick) {
        return (
            <>
                {cuotas[dataIndex].parcialidad === 'Final' ? '$ ' +  new Intl.NumberFormat('de-DE').format(cuotas[dataIndex].pago ) : <div> No Calculado </div>}

            </>
        );
    }
    function saldoInicial(dataIndex, rowIndex, data, onClick) {
        return (
            <>
                {cuotas[dataIndex].parcialidad === 'Final' ? '$ ' +  new Intl.NumberFormat('de-DE').format(cuotas[dataIndex].saldo_inicial  ) : <div> No Calculado </div>}

            </>
        );
    }
    function cuotaConAjuste(dataIndex, rowIndex, data, onClick) {
        return (
            <>
                {cuotas[dataIndex].parcialidad === 'Final' ? '$ ' + (cuotas[dataIndex].cuota_con_ajuste)  : <div> No Calculado </div>}

            </>
        );
    }
    function fecha(dataIndex, rowIndex, data, onClick) {
        return (
            <>
                {cuotas[dataIndex].mes + '/' + cuotas[dataIndex].anio}

            </>
        );
    }
    function diferencia(dataIndex, rowIndex, data, onClick) {
        return (
            <>
                {(cuotas[dataIndex].diferencia >= 0) ? <> <p style={{ color: 'green' }} > {new Intl.NumberFormat('de-DE').format(cuotas[dataIndex].diferencia )} </p> </> : <><p style={{ color: 'red' }} > {new Intl.NumberFormat('de-DE').format(cuotas[dataIndex].diferencia )}</p></>}

               
            </>
        );
    }
    function CutomButtonsRenderer(dataIndex, rowIndex, data, onClick) {
        return (
            <>

                <CurrencyExchangeIcon
                    onClick={() => navigate('/usuario2/pagarcuota/' + cuotas[dataIndex].id)}
                    style={{ marginRight: "10px", cursor: "pointer" }}
                />
                <SearchIcon style={{ cursor: "pointer" }}
                    onClick={() => navigate('/usuario2/pagoscuotas/' + cuotas[dataIndex].id)}//Navigate('usuario2/detallecliente'+clients[dataIndex].cuil_cuit)
                />


                <DeleteIcon style={{ cursor: "pointer" }}
                    onClick={() => borrar(cuotas[dataIndex].id)}//Navigate('usuario2/detallecliente'+clients[dataIndex].cuil_cuit)
                />

                <ModificarCuota
                id = {cuotas[dataIndex].id}
                />
                {/*   <AgregarIcc
                    id={cuotas[dataIndex].id}
                    traer={async () => {

                        const lotes = await servicioLotes.lotesCliente(props.cuil_cuit)
                        console.log(lotes)
                        setLotes(lotes)
                    }}

                />  */}



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
            name: "Saldo Inicial",
            options: {
                customBodyRenderLite: (dataIndex, rowIndex) =>
                    saldoInicial(
                        dataIndex,
                        rowIndex,
                        // overbookingData,
                        // handleEditOpen
                    )
            }

        },
        {
            name: "Amortizacion",
            label: "Amortizacion",

        },
        {
            name: "ICC",
            label: "ICC",

        },
        {
            name: "Ajuste_ICC",
            label: "Ajuste ICC",

        },
        {
            name: "Cuota con ajuste",
            options: {
                customBodyRenderLite: (dataIndex, rowIndex) =>
                    cuotaConAjuste(
                        dataIndex,
                        rowIndex,
                        // overbookingData,
                        // handleEditOpen
                    )
            }

        },
        {
            name: "Pago",
            options: {
                customBodyRenderLite: (dataIndex, rowIndex) =>
                    pago(
                        dataIndex,
                        rowIndex,
                        // overbookingData,
                        // handleEditOpen
                    )
            }

        },

        {
            name: "Saldo Real",
            options: {
                customBodyRenderLite: (dataIndex, rowIndex) =>
                    saldoReal(
                        dataIndex,
                        rowIndex,
                        // overbookingData,
                        // handleEditOpen
                    )
            }

        },
        {
            name: "Diferencia",
            options: {
                customBodyRenderLite: (dataIndex, rowIndex) =>
                    diferencia(
                        dataIndex,
                        rowIndex,
                        // overbookingData,
                        // handleEditOpen
                    )
            }

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
            <Button onClick={() => { navigate('/usuario2/asignarloteausuario/' + cuil_cuit) }} variant="contained" color="success">
                Asignar lote a usuario
            </Button>
            <br /> <br />
            <Button onClick={() => { navigate('/usuario2/agregarviarias/' + cuil_cuit) }} variant="contained" color="success" >Agregar cuotas a varios lotes</Button><br />
            <FormControl sx={{ m: 1, minWidth: 140 }}>
                <InputLabel > LOTE</InputLabel>

                <Select


                    open={open}
                    onClose={handleClose}
                    onOpen={handleOpen}
                    label="Lote"

                >
                    {
                        lotes.map((item, index) =>
                            <div>

                                <MenuItem key={index} onClick={() => { vercuotas(item['id']) }}>{item['zona']} Fraccion {item['fraccion']} - Manzana {item['manzana']} -Parcela {item['parcela']}</MenuItem>

                            </div>
                        )
                    }
                </Select>
                <h3>  {cuotas ? <>{cuotas[0].zona} Fraccion {cuotas[0].fraccion} Manzana {cuotas[0].manzana} {cuotas[0].zona === 'PIT' ? <>Parcela {cuotas[0].parcela}</> : <>Lote {cuotas[0].lote}</>}  </> : <></>}</h3>
                <FormControlLabel
                    control={
                        <Switch checked={act2} onChange={handleChange2} />
                    }
                    label="IEF"
                />
                <FormControlLabel
                    control={
                        <Switch checked={act} onChange={handleChange} />
                    }
                    label="Cuotas"
                />


            </FormControl>





            {/*  {act ?
            <div> 
               <h2> Lote {lotes[0]['zona']} Fraccion {lotes[0]['fraccion']} - Manzana {lotes[0]['manzana']} -Parcela {lotes[0]['parcela']} </h2>

            <BorrarCuotas 
            id={lotes[0]['id']} />
            </div>   : <div> </div>} */}

            <div>

                {act ? <div>
                    <Button variant="contained" onClick={() => { navigate('/usuario2/agregarcuotas/' + idlote) }} >
                        Agregar cuotas al lote
                    </Button>
                    <BorrarCuotas
                        id={idlote} />

                    {act2 ?

                        <div>





                            {cuotas  ? <>

                                <div>
                                    <Box
                                        sx={{
                                            display: 'flex'
                                        }}
                                    >
                                        <Grid container columnSpacing={{ xs: 1, sm: 2, md: 3 }}>

                                            <Paper
                                                sx={{
                                                    cursor: 'pointer',
                                                    background: '#eeeeee',
                                                    color: '#bdbdbd',
                                                    border: '1px dashed #ccc',
                                                    width: "40%",
                                                    '&:hover': { border: '1px solid #ccc' },
                                                    border: "1px solid black",
                                                    margin: '75px',
                                                    display: 'flex'

                                                }}
                                            >

                                                <TableContainer >
                                                    <Table sx={{ minWidth: 650 }} aria-label="simple table">
                                                        <TableHead>
                                                            <TableRow>
                                                                <TableCell>Detalles de Deuda Exigible </TableCell>


                                                            </TableRow>
                                                        </TableHead>
                                                        <TableBody>
                                                            {deudaExigible.map((row) => (
                                                                <TableRow
                                                                    key={row.name}
                                                                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                                                >

                                                                    <TableCell align="left">{row.datoa}</TableCell>
                                                                    <TableCell align="left">{new Intl.NumberFormat('de-DE').format(row.datob)}</TableCell>

                                                                </TableRow>
                                                            ))}
                                                        </TableBody>
                                                    </Table>
                                                </TableContainer>
                                            </Paper>


                                            <Paper
                                                sx={{
                                                    cursor: 'pointer',
                                                    background: '#eeeeee',
                                                    color: '#bdbdbd',
                                                    border: '1px dashed #ccc',
                                                    width: "40%",
                                                    '&:hover': { border: '1px solid #ccc' },
                                                    border: "1px solid black",
                                                    margin: '75px',
                                                    display: 'flex'

                                                }}
                                            >

                                                <TableContainer >
                                                    <Table sx={{ minWidth: 650 }} aria-label="simple table">
                                                        <TableHead>
                                                            <TableRow>
                                                                <TableCell>Detalle de Cuotas Pendientes </TableCell>


                                                            </TableRow>
                                                        </TableHead>
                                                        <TableBody>
                                                            {detallePendiente.map((row) => (
                                                                <TableRow
                                                                    key={row.name}
                                                                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                                                >

                                                                    <TableCell align="left">{row.datoa}</TableCell>
                                                                    <TableCell align="left">{new Intl.NumberFormat('de-DE').format(row.datob)}</TableCell>

                                                                </TableRow>
                                                            ))}
                                                        </TableBody>
                                                    </Table>
                                                </TableContainer>
                                            </Paper>

                                            <Fab sx={{ margin: '75px', }} variant="extended" onClick={() => { handleChange2() }}  ><VisibilityOffIcon sx={{ mr: 1 }} /> Ocultar IEF</Fab>
                                        </Grid>
                                    </Box>
                                </div>


                            </> : <></>}
                        </div>
                        : <div></div>}






                    {cuotas  ? <>

                        <Stack spacing={2} direction="row">
                            <Fab variant="extended" onClick={() => { Vista1() }}><RemoveRedEyeIcon sx={{ mr: 1 }} /> Cambiar vista

                            </Fab>
                            {/*  <Button  key= {index} variant="contained"onClick={()=>{agregar(item['id'])}}> Agregar Cuotas</Button> */}

                            <br />

                            {/* <Button key={index} variant="contained" onClick={() => { verief(item['id']) }}> Estado financiero </Button> */}





                        </Stack>


                      
                            <MUIDataTable
                                title={"Lista de cuotas"}
                                data={cuotas}
                                columns={columns}
                                actions={[
                                    {
                                        icon: 'save',
                                        tooltip: 'Save User',
                                        onClick: (event, rowData) => alert("You saved " + rowData.name)
                                    }
                                ]}
                            />


                    </> : <> Lote sin cuotas</>}


                </div> : <div> Seleccione un Lote </div>}



            </div>

            <br /><br /><br /><br />






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