import { useState, useEffect } from "react";

import { createTheme, ThemeProvider } from '@mui/material/styles';
import servicioNivel3 from '../../../services/nivel3'
import { useNavigate } from "react-router-dom";

import Button from '@mui/material/Button';
import {  CircularProgress } from '@mui/material';
import TextField from '@mui/material/TextField'
import NativeSelect from '@mui/material/NativeSelect';
import InputLabel from '@mui/material/InputLabel';





const Valormetro = () => {
    const [valor, setValor] = useState({
      zona:'PIT'
      })
      const [loading, setLoading] = useState(false)
   
      const handleChange = (e) =>{
      setValor({  ...valor, [e.target.name]: e.target.value })
        console.log(valor)}



      const handleDeterminar = async (event) => {
        setLoading(true)
        event.preventDefault();
        try {
    
          await servicioNivel3.valormetrocuadrado(
            valor
          )
          window.location.reload(true)
         
         } catch (error) {
           console.error(error);
           console.log('Error algo sucedio')
       
         
         }
    
     
      };


return (
    

    <div>
       
        <br/>   <br/>   
        <InputLabel  variant="standard" htmlFor="uncontrolled-native">
                           Mes
                        </InputLabel>
                        <NativeSelect
                            defaultValue={30}
                            onChange={handleChange}
                            inputProps={{
                                name: 'zona',
                                id: 'uncontrolled-native',
                               
                            }}
                        >   <option  value={'PIT'}>PIT</option>
                            <option   value={'IC3'}>Resto</option>
                          
                      
                         
                        </NativeSelect>    <br/>

      <br/>
        <TextField
            autoFocus
           // margin="dense"
            type={'number'}
            id="name"
            label="Valor Metro cuadrado"
            name="valor"
            onChange={handleChange}
          //  fullWidth
            //variant="filled"
         //   width= '50%'
          />
            <br/>
           <Button variant="contained" onClick={handleDeterminar} > {loading ? (
                          <CircularProgress color="inherit" size={25} />
                        ) : (
                          "Enviar"
                        )}</Button>
        
    </div>
)
}

export default Valormetro;