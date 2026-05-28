import * as React from 'react';
import { useParams } from "react-router-dom"
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { useState, useEffect } from "react";
import servicionivel3 from '../../../services/nivel3'
import { useNavigate } from "react-router-dom";










export default function ModalIcc(props) {
    const navigate = useNavigate();
    let params = useParams()
    const [open, setOpen] = React.useState(false);
    const [form, setForm] = useState({
        cuil_cuit:props.cuil_cuit
    })
    const [cargado, setCargado] = useState(null)
    const [respuesta, setRespuesta] = useState()
    
    const handleChange = (e) => {
        console.log(form)
        setForm({ ...form, [e.target.name]: e.target.value })
     
    }
 
    const traer = async() => {
      
       const puede = await servicionivel3.nuevoicc(props.datos)
       setRespuesta(puede)
      
       setCargado(true)
        
        };  
    const handleClickOpen = () => {
        setOpen(true);
   
    };
    const handleDeterminar = async (event) => {
        event.preventDefault();
       await servicionivel3.asignarclave(form)
       window.location.reload();
     

        setOpen(false);
       
    };

    const handleClose = () => {
        setOpen(false);
    };

    return (
        <div>
            <Button variant="outlined" onClick={handleClickOpen}>
                Asignar numero a cliente 
            </Button>
              
         
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>  Agregar clave para acceso</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                    <TextField
         autoFocus
         margin="dense"
         id="name"
         label="cuil_cuit"
         name="cuil_cuit"
         onChange={handleChange}
         fullWidth
         variant="standard"
 
     />
                <TextField
         autoFocus
         margin="dense"
         id="name"
         label="Clave"
         name="clave_alta"
         onChange={handleChange}
         fullWidth
         variant="standard"
 
     />


                    </DialogContentText>
                  
                    <br/>
                     
                     

                        <DialogActions>
                            <Button onClick={handleClose}>Cancel</Button>
                            <Button onClick={handleDeterminar}>Asignar</Button>
                        </DialogActions>
                   
                </DialogContent>




            </Dialog>
        </div>
    );
}
