import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import { Button } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';

import NativeSelect from '@mui/material/NativeSelect';
import useUser from '../../../hooks/useUser'
import servicioAdmin from '../../../services/Administracion'
import Tooltip from '@material-ui/core/Tooltip';
import EditIcon from "@material-ui/icons/Edit";
import React, { useEffect, useState, Fragment } from "react";
const currencies = [
  {
    value: 'DISPONIBLE',
    label: 'DISPONIBLE',
  },
  {
    value: 'VENDIDO',
    label: 'VENDIDO',
  },
  {
    value: 'RESERVADO',
    label: 'RESERVADO',
  },

  
];



export default function SelectTextFields(props) {
  const [open, setOpen] = React.useState(false);
  //const usuario  = useUser().userContext


  const preba = JSON.parse(window.localStorage.getItem('loggedNoteAppUser'))
  const cuil_cuit = preba.cuil_cuit

  const [pago, setPago] = useState({

    id:props.id


  })


  const handleClickOpen = () => {
    setOpen(true);
   
  };

  const handleClose = () => {
    setOpen(false);
  };

  
  const handleChange = (e) => {
 
    setPago({ ...pago, [e.target.name]: e.target.value })
  

  }
  
  ////

  const [currency, setCurrency] = React.useState('EUR');

  /*   const handleChange = (event) => {
      setCurrency(event.target.value);
    }; */
    const enviar = async () => {

    
       await servicioAdmin.cambiarestado(pago)
     
        handleClose()
    
        
    
      }

  return (


    
    
    <Box

      sx={{
        '& .MuiTextField-root': { m: 1, width: '25ch' },
      }}
      noValidate
      autoComplete="off"
    >
       < Tooltip title="Cambiar">
      <EditIcon variant="outlined" onClick={handleClickOpen}/>
      </Tooltip>
      <Dialog open={open} onClose={handleClose}>
        <DialogContent>
           Cambiar Estado
            <TextField component="form"
              sx={{
                '& > :not(style)': { m: 1, width: '25ch' },
              }}
              noValidate
              autoComplete="off"

              id="outlined-select-currency"
              select
              label="estado"
              value={currency}
              name="estado"
              onChange={handleChange}
              helperText="Por favor ingrese su CBU"
            >
              {currencies.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
         <Button  onClick={() => enviar()} >Aceptar</Button>
        </DialogContent>
      </Dialog>
    </Box >

   
  );
}