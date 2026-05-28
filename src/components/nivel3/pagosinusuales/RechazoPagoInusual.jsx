import * as React from 'react';
import { useState } from "react";
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import NativeSelect from '@mui/material/NativeSelect';
import InputLabel from '@mui/material/InputLabel';
import Tooltip from '@mui/material/Tooltip';

import servicioPagos from '../../../services/pagos';

export default function FormDialog(props) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    id: props.id,
    tipo: '',
    detalle: ''
  });

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "detalle" && value.length > 256) return;

    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const rta = await servicioPagos.rechazararpagoniv3(form);
    alert(rta);
    props.getPagosi();
    setOpen(false);
  };

  return (
    <div>
      <Tooltip title="Clasificar" arrow>
        <button onClick={handleClickOpen}>Clasificar</button>
      </Tooltip>

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>Clasificación del pago</DialogTitle>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <InputLabel htmlFor="tipo-select">Tipo de pago</InputLabel>
            <NativeSelect
              id="tipo-select"
              name="tipo"
              value={form.tipo}
              onChange={handleChange}
              fullWidth
            >
              <option value="">Seleccione una opción</option>
              <option value="Inusual">Cerrada sin Ros</option>
              <option value="Sospechoso">Registrado como Ros</option>
            </NativeSelect>

            <TextField
              margin="dense"
              id="detalle"
              name="detalle"
              label="Detalle del motivo"
              placeholder="Ingrese una descripción (máx. 256 caracteres)"
              multiline
              rows={4}
              value={form.detalle}
              onChange={handleChange}
              fullWidth
              inputProps={{ maxLength: 256 }}
              variant="outlined"
            />

            <DialogActions>
              <Button onClick={handleClose} color="secondary">
                Cancelar
              </Button>
              <Button type="submit" variant="contained" color="primary">
                Confirmar clasificación
              </Button>
            </DialogActions>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
