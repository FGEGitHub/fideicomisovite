import { useState, useEffect } from "react";

import { createTheme, ThemeProvider } from '@mui/material/styles';
import servicioPagos from '../../../services/pagos';
import { useNavigate } from "react-router-dom";
import BotonRechazo from './RechazoPagoInusual';
import ModalDetallePago from './Modaldetalle';

import Button from "@mui/material/Button";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Skeleton } from '@mui/material';
import { styled } from '@mui/material/styles';
import { tableCellClasses } from '@mui/material/TableCell';
import Modalveronline from './modalveronline'
import Modalveronline2 from './modalveronline2'
const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
        backgroundColor: '#326B6B',
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    [`&.${tableCellClasses.body}`]: {
        fontSize: 14,
        color: '#000000',
    },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
    '&:nth-of-type(odd)': {
        backgroundColor: '#E6F2F2',
    },
    '&:last-child td, &:last-child th': {
        border: 0,
    },
}));

const PagosInusuales = () => {
    const [pagos, setPagos] = useState([]);
    const [vista, setVista] = useState(true);
 
    const [openModal, setOpenModal] = useState(false);
    const [detalleSeleccionado, setDetalleSeleccionado] = useState(null);
       const navigate = useNavigate();
    const handleOpenModal = (row) => {
        setDetalleSeleccionado(row);
        setOpenModal(true);
    };
    
    const handleCloseModal = () => {
        setOpenModal(false);
        setDetalleSeleccionado(null);
    };
    useEffect(() => {
        getPagosi();
    }, []);

    const getPagosi = async () => {
        const pagos = await servicioPagos.pagosinusuales();
        setPagos(pagos);
    };

    const StyledTable = () =>
        createTheme({
            overrides: {
                MUIDataTableBodyRow: {
                    root: {
                        backgroundColor: "#f5f5f5",
                    }
                }
            }
        });

    const columns = [
        { name: "cuil_cuit", label: "Cuil/cuit" },
        {
            name: "Nombre",
            options: {
                customBodyRenderLite: (dataIndex) => (
                    <p onClick={() => navigate('/usuario2/detallecliente/' + pagos[dataIndex].cuil_cuit)}
                        style={{ marginRight: "10px", cursor: "pointer" }}>
                        {pagos[dataIndex].Nombre}
                    </p>
                )
            }
        },
        { name: "monto", label: "Monto" },
        { name: "ingresos", label: "Ingresos declarados" },
        { name: "riesgo", label: "riesgo" },
        {
            name: "ver pago online",
            options: {
                customBodyRenderLite: (dataIndex, rowIndex) =>
                    verFile(
                        dataIndex,
                        rowIndex,
                        // overbookingData,
                        // handleEditOpen
                    )
            }
  
        },
        {
            name: "ver justificacion online",
            options: {
                customBodyRenderLite: (dataIndex, rowIndex) =>
                    verFile2(
                        dataIndex,
                        rowIndex,
                        // overbookingData,
                        // handleEditOpen
                    )
            }
  
        },
        {
            name: "Actions",
            options: {
                customBodyRenderLite: (dataIndex) => (
                    <>
                        <BotonRechazo id={pagos[dataIndex].id} getPagosi={getPagosi} />
                        {/*     <BotonAprobado id={pagos[dataIndex].id} monto={pagos[dataIndex].monto} getPagosi={getPagosi} /> */}
                    </>
                )
            }
        },
        {
            name: "Descarga",
            options: {
                customBodyRenderLite: (dataIndex) => (
                    <Button onClick={() => navigate('/nivel3/cuota/' + pagos[dataIndex].id_cuota)}>Ver pagos de cuota</Button>
                )
            }
        },
    ];
    function verFile(index, rowIndex, data) {
    
   
        return (
            <>

<Modalveronline id={pagos[0][index].id} />

              {/*   <Button
                    onClick={() => veronline(index)}
                >Ver online</Button> */}


            </>
        );
    }
    function verFile2(index, rowIndex, data) {
    
   
        return (
            <>

<Modalveronline2 id={pagos[0][index].id} />

              {/*   <Button
                    onClick={() => veronline(index)}
                >Ver online</Button> */}


            </>
        );
    }
    return (
        <div>
            <Button variant="contained" onClick={() => setVista(!vista)}>
                Cambiar Vista
            </Button>
            
                <Paper sx={{
    width: "90%",
    margin: '20px auto',
    padding: '10px',
    backgroundColor: '#FFFFFF',
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
    borderRadius: '10px'
}}>
                    <TableContainer>
                        {pagos.length === 0 ? (
                            <p style={{ textAlign: 'center', fontSize: '18px', fontWeight: 'bold' }}>No hay elementos</p>
                        ) : (
                            <Table>
                                <TableHead>
                                    <TableRow>
                                    <StyledTableCell>Id</StyledTableCell>
                                    <StyledTableCell>Nombre y Apellido/Razon Social</StyledTableCell>
                                    <StyledTableCell>Cuil/Cuit</StyledTableCell>
                                    <StyledTableCell>Tipologia</StyledTableCell>

                                    <StyledTableCell>Fecha Notificacion</StyledTableCell>
                                        <StyledTableCell>Fecha Vencimiento</StyledTableCell>
                                        <StyledTableCell>Importe(Pesos)</StyledTableCell>
                                        <StyledTableCell>Riesgo</StyledTableCell>
                                        <StyledTableCell>Estado</StyledTableCell>
                                        <StyledTableCell>Constancia pago</StyledTableCell>
                                        <StyledTableCell>Constancia justificacion</StyledTableCell>
                                        <StyledTableCell>Acciones</StyledTableCell>
                                        <StyledTableCell>Ver Detalles</StyledTableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {pagos.map((row, index) => (
                                        <StyledTableRow key={index}>
                               <StyledTableCell>{row.id}</StyledTableCell>
                                              <StyledTableCell>{row.Nombre}</StyledTableCell>
                                              <StyledTableCell onClick={() => navigate('/usuario2/detallecliente/' + row.cuil_cuitc)}>{row.cuil_cuitc}</StyledTableCell>
                                              <StyledTableCell>{row.tipologia}</StyledTableCell>
                                              <StyledTableCell>{row.fechanotificacion}</StyledTableCell>
                                              <StyledTableCell>{row.fechavencimiento}</StyledTableCell>
                                              <StyledTableCell>
  {isNaN(Number(row.monto))
    ? `$${row.monto}`
    : `$${Number(row.monto).toFixed(2)}`}
</StyledTableCell>  <StyledTableCell>{row.riesgo}%</StyledTableCell>
<StyledTableCell>
  {row.proceso == 'averificarnivel2' && 'Pendiente carga de documentación'}
  {row.proceso == 'averificarnivel3' && 'Pendiente clasificación de Gerencia'}
  {row.proceso == 'Inusual' && 'Cerrado (Sin alerta)'}
  {row.proceso == 'Sospechoso' && 'Cerrado (Con Alerta)'}
</StyledTableCell>
                                            <StyledTableCell><Modalveronline id={row.id} /></StyledTableCell>
                                            <StyledTableCell><Modalveronline2 id={row.id} /></StyledTableCell>
                                            

                                          

                                            <StyledTableCell>
                                                <BotonRechazo id={row.id} getPagosi={getPagosi} />
                                                {/*  <BotonAprobado id={row.id} monto={row.monto} getPagosi={getPagosi} /> */}
                                            </StyledTableCell>
                                            <StyledTableCell>
  <Button variant="outlined" onClick={() => handleOpenModal(row)}>
    Ver Detalles
  </Button>
</StyledTableCell>
                                        </StyledTableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </TableContainer>
                </Paper>
                <ModalDetallePago open={openModal} handleClose={handleCloseModal} data={detalleSeleccionado} />

        </div>
    );
};

export default PagosInusuales;
