import * as React from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import ThumbDownAltIcon from '@mui/icons-material/ThumbDownAlt';

import servicioCuotas from '../../../services/cuotas'
import { useState } from "react";
import Tooltip from '@material-ui/core/Tooltip';
import InputLabel from '@mui/material/InputLabel';
import NativeSelect from '@mui/material/NativeSelect';
import IconButton from '@mui/material/IconButton';

export default function FormDialog(props) {
  const [open, setOpen] = React.useState(false);
  const [form, setForm] = useState()

  const handleClickOpen = () => {

    setOpen(true);
    traer()
  };

  const handleClose = () => {
    setOpen(false);
  };

  const traer = async () => {
    console.log(props.id)
    const cuo = await servicioCuotas.traercuota(props.id)
    console.log(cuo)
    setForm({
      id: props.id,
      saldo_inicial: cuo[0].saldo_inicial,
      cuota_con_ajuste: cuo[0].cuota_con_ajuste,
      Ajuste_ICC: cuo[0].Ajuste_ICC,
      Saldo_real: cuo[0].Saldo_real,
    })


    // window.location.reload(true)
  }
  const cambiar = async (id) => {
    await servicioCuotas.actualizarcuota(form)
    setOpen(false)
    window.location.reload(true);

    // window.location.reload(true)
  }
  const handleChange = (e) => {
    console.log(form)
    setForm({ ...form, [e.target.name]: e.target.value })
  }
  return (
    <div><Tooltip title="Pedir documentacion/Rechazar" arrow>
      <IconButton>
        <Button onClick={handleClickOpen}>
          modificar
        </Button>
      </IconButton>
    </Tooltip>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Rechazar</DialogTitle>
        <DialogContent>

          <form onSubmit={cambiar}>
            {form ? <>
        
            

          



              <TextField
              
                autoFocus
                margin="dense"
                id="name"
                value={form.Ajuste_ICC}
                label="Ajuste_ICC"
                name="Ajuste_ICC"
                multiline
                rows={4}
                onChange={handleChange}

                fullWidth
                variant="standard"
              />
    <TextField
              
              autoFocus
              margin="dense"
              id="name"
              value={form.cuota_con_ajuste}
              label="cuota_con_ajuste"
              name="cuota_con_ajuste"
              multiline
              rows={4}
              onChange={handleChange}

              fullWidth
              variant="standard"
            />

           
              <Button onClick={() => { cambiar() }}>Enviar </Button>
            </> : <></>}
          </form>


        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>

        </DialogActions>

      </Dialog>
    </div>
  );
}
