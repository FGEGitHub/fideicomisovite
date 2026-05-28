import React, { useState } from "react";
import { Button, CircularProgress, Backdrop } from "@mui/material";
import servicioLegajos from "../../../services/legajos"; // Ajusta la ruta según sea necesario

const PdfViewer = ({ id }) => {
  const [loadingPdf, setLoadingPdf] = useState(false); // Estado para mostrar la pantalla de carga

  const handleClickOpen = async () => {
    setLoadingPdf(true); // Activar pantalla de carga
    try {
      const pdfBlob = await servicioLegajos.traerPdfConstanciadepagoinusual(id);
      const url = URL.createObjectURL(pdfBlob);
      window.open(url, "_blank");
    } catch (error) {
      console.error("Error al obtener el PDF:", error);
      alert("Error al cargar el PDF");
    }
    setLoadingPdf(false); // Desactivar pantalla de carga
  };

  return (
    <div>
      <Backdrop open={loadingPdf} style={{ color: "#fff", zIndex: 1301 }}>
        <div style={{ textAlign: "center" }}>
          <CircularProgress color="inherit" />
          <p>Cargando PDF...</p>
        </div>
      </Backdrop>

      <Button variant="outlined" onClick={handleClickOpen}>
        Ver 
      </Button>
    </div>
  );
};

export default PdfViewer;
