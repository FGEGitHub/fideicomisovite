import { useState, useCallback } from 'react';
import { Paper, Button, TextField, Box, Modal, Typography } from '@mui/material';
import { useDropzone } from 'react-dropzone';
import BackupIcon from '@mui/icons-material/Backup';
import servicioAdministracion from '../../../services/Administracion';

const SubirLegajo = () => {
  const [file, setFile] = useState(null);
  const [pago, setPago] = useState({ fecha: new Date().toISOString().slice(0, 7) });
  const [open, setOpen] = useState(false);

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, acceptedFiles } = useDropzone({
    onDrop,
    multiple: false,
    accept: '.xls,.xlsx',
  });

  const handleChange = (e) => {
    setPago({ ...pago, [e.target.name]: e.target.value });
  };

  const enviar = async () => {
    if (!file || !pago.fecha) return;

    const formData = new FormData();
    formData.append('image', file)
    formData.append('datos', [pago.fecha])

    await servicioAdministracion.subirprueba(formData);

    if (!file) {
      alert('No seleccionaste el archivo')
      return

  }



    setOpen(false); // Cierra el modal después de enviar
  };

  return (
    <>
      <Button variant="contained" onClick={() => setOpen(true)}>
        Subir Extracto
      </Button>

      <Modal open={open} onClose={() => setOpen(false)}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" sx={{ mb: 2 }}>Subir Archivo de Legajo</Typography>

          <Paper
            sx={{
              cursor: 'pointer',
              background: '#fafafa',
              color: '#bdbdbd',
              border: '1px dashed #ccc',
              '&:hover': { border: '1px solid #ccc' },
              p: 2,
            }}
            {...getRootProps()}
          >
            <input {...getInputProps()} />
            <p>{acceptedFiles.length > 0 ? 'Archivo listo para subir' : 'Arrastra aquí un archivo Excel o haz clic para seleccionarlo'}</p>
            <em>(Solo se aceptan archivos .xls y .xlsx)</em>
          </Paper>

          <Box sx={{ mt: 2 }}>
            <TextField
              onChange={handleChange}
              name="fecha"
              id="date"
              label="Fecha de pago"
              type="month"
              value={pago.fecha}
              sx={{ width: '100%' }}
              InputLabelProps={{ shrink: true }}
            />
          </Box>

          <Box sx={{ mt: 3, textAlign: 'right' }}>
            <Button onClick={() => setOpen(false)} sx={{ mr: 1 }}>Cancelar</Button>
            <Button onClick={enviar} variant="contained" color="primary" disabled={!file || !pago.fecha}>
              Enviar
            </Button>
          </Box>
        </Box>
      </Modal>
    </>
  );
};

export default SubirLegajo;
