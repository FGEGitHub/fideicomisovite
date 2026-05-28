import { useState, useEffect } from "react";

import { useNavigate } from "react-router-dom";
import Button from '@mui/material/Button';

import servicionivel3 from '../../services/nivel3'


//import overbookingData from "./overbooking";

const Historial = () => {
    //configuracion de Hooks
    const [historial, setHistorial] = useState([]);
    const navigate = useNavigate();


    
const traer = async() => {
      console.log(5151)
    const historial = await servicionivel3.traerhistorial()
   
    setHistorial(historial)
  // 
    
    };  
    

    useEffect(() => {
        traer()
    }, [])
    ///


/* 
    function CutomButtonsRenderer(dataIndex, rowIndex, data, onClick) {
        return (
          <>
            <EditIcon
              onClick={() => onClick(data[dataIndex].id, dataIndex)}
              style={{ marginRight: "10px", cursor: "pointer" }}
            />
            <SearchIcon style={{ cursor: "pointer" }} 
            onClick={() =>  navigate('/')  }//Navigate('usuario2/detallecliente'+clients[dataIndex].cuil_cuit)
            />
          </>
        );
      } */
    // definimos las columnas
    const columns = [
        {
            name: "zona",
            label: "Zona",

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
            name: "ICC",
            label: "Valor",

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
        rowsPerPage: 5,
        rowsPerPageOptions: [5, 10, 15],
        downloadOptions: { filename: 'tableDownload.csv', separator: ',' },
        print: true,
        filter: true,
        viewColumns: true,
        pagination: true,

        textLabels: {
          body: {
            noMatch: "No se encontraron registros",
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

return (<>

    <button  onClick={() =>  navigate('/nivel3/agregaricc')}>Nuevo</button>
  
        </>
  
)
}

export default Historial;