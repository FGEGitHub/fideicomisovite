import * as React from 'react';
import { useParams } from "react-router-dom"
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { useState } from "react";
import servicionivel3 from '../../../services/nivel3'
import NativeSelect from '@mui/material/NativeSelect';
import InputLabel from '@mui/material/InputLabel';


export default function ModalIcc() {

    const [open, setOpen] = React.useState(false);
    const [form, setForm] = useState({


    })
  

    const handleClickOpen = () => {
        setOpen(true);
    };
    const borrar = async (event) => {
    
        const rta = await servicionivel3.borrarhistorial()  
        alert(rta.data)
        window.location.reload()

        setOpen(false);

    };

    const handleClose = () => {
        setOpen(false);
    };

    return (
        <div>
            <Button variant="outlined" onClick={handleClickOpen}>
                BORRAR HISTORIAL
            </Button>
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>   </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        ¿Estas seguro de borrar historial?
                    </DialogContentText>

                </DialogContent>


                <Button variant="contained" color="success" onClick={() => {
    borrar();
  }}>Si</Button>
                <Button variant="outlined" color="error"  onClick={() => {
    handleClose()
  }}>
                 No
                </Button>
            </Dialog>
        </div>
    );
}
