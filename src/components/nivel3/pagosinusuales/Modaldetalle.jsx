import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';

const ModalDetallePago = ({ open, handleClose, data }) => {
  if (!data) return null; // Si no hay datos, no renderiza nada

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Detalle del Pago</DialogTitle>
      <DialogContent dividers>
        <Typography variant="subtitle1" gutterBottom><strong>Nombre:</strong> {data.Nombre}</Typography>
        <Typography variant="subtitle1" gutterBottom><strong>CUIL/CUIT:</strong> {data.cuil_cuitc}</Typography>
        <Typography variant="subtitle1" gutterBottom><strong>Tipología:</strong> {data.tipologia}</Typography>
        <Typography variant="subtitle1" gutterBottom><strong>Fecha Notificación:</strong> {data.fechanotificacion}</Typography>
        <Typography variant="subtitle1" gutterBottom><strong>Fecha Vencimiento:</strong> {data.fechavencimiento}</Typography>
        <Typography variant="subtitle1" gutterBottom><strong>Importe:</strong> ${Number(data.monto).toFixed(2)}</Typography>
        <Typography variant="subtitle1" gutterBottom><strong>Riesgo:</strong> {data.riesgo}%</Typography>
        <Typography variant="subtitle1" gutterBottom><strong>Estado:</strong> 
          {data.proceso === 'averificarnivel2' && ' Pendiente carga de documentación'}
          {data.proceso === 'averificarnivel3' && ' Pendiente clasificación de Gerencia'}
          {data.proceso === 'Inusual' && ' Cerrado (Sin alerta)'}
          {data.proceso === 'Sospechoso' && ' Cerrado (Con Alerta)'}
        </Typography>
        <Typography variant="subtitle1" gutterBottom><strong>Detalle:</strong> {data.detalle}</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary">Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ModalDetallePago;
