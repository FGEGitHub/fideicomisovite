import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import loginService from '../../services/login';
import servicioUsuario from '../../services/usuarios';

import {
  Button,
  Box,
  Card,
  Grid,
  TextField,
  Typography,
  CircularProgress,
  Avatar,
  Link,
  InputAdornment
} from "@mui/material";

import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';

/* import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline'; */


import marcas from '../../Assets/marcas.png';

const Login = () => {

  const [errorCredenciales, setErrorCredenciales] = useState("");

  const [usuario, setUsuario] = useState({
    cuil_cuit: "",
    password: "",
  });

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedNoteAppUser');

    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON);

      switch (user.nivel) {
        case 1:
          navigate('/usuario/menu');
          break;

        case 2:
          navigate('/usuario2/clientes');
          break;

        case 3:
          navigate('/nivel3/');
          break;

        case 4:
          navigate('/legales/clientes');
          break;

        case 5:
          navigate('/usuariomapas/inicio');
          break;

        case 6:
          navigate('/nivel6/carga');
          break;

        default:
          break;
      }
    }
  }, [navigate]);

  const handleLogout = () => {
    setUser(null);

    if (user?.token) {
      servicioUsuario.setToken(user.token);
    }

    window.localStorage.removeItem('loggedNoteAppUser');
  };

  const loginSubmit = async (event) => {
    event.preventDefault();

    setLoading(true);
    setErrorCredenciales("");

    try {

      const user = await loginService.login({
        cuil_cuit: usuario.cuil_cuit,
        password: usuario.password
      });

      window.localStorage.setItem(
        'loggedNoteAppUser',
        JSON.stringify(user)
      );

      servicioUsuario.setToken(user.token);

      setUser(user);

      setLoading(false);

      switch (user.nivel) {

        case 1:
          navigate('/usuario/menu');
          window.location.reload();
          break;

        case 2:
          navigate('/usuario2/clientes');
          window.location.reload();
          break;

        case 3:
          navigate('/nivel3');
          window.location.reload();
          break;

        case 4:
          navigate('/legales/clientes');
          window.location.reload();
          break;

        case 5:
          navigate('/usuariomapas/inicio');
          window.location.reload();
          break;

        case 6:
          navigate('/nivel6/carga');
          window.location.reload();
          break;

        case 10:
          navigate('/admin/usuarios');
          window.location.reload();
          break;

        default:
          break;
      }

    } catch (error) {

      console.error(error);

      setLoading(false);

      setErrorCredenciales(
        "Cuil/Cuit y/o contraseña incorrectos"
      );
    }
  };

  const handleChange = (e) => {
    setUsuario({
      ...usuario,
      [e.target.name]: e.target.value
    });
  };

  return (

    <Grid
      container
      component="main"
      sx={{
        height: '100vh',
        background: '#051821'
      }}
    >

      {/* Columna izquierda */}
      <Grid
        item
        xs={false}
        md={6}
        sx={{
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          p: 4,
          textAlign: 'center',
          background: '#051821',
          color: 'white',
        }}
      >

        <Box
          component="img"
          src={marcas}
          alt="Logo"
          sx={{
            width: 700,
            maxWidth: '100%'
          }}
        />

      </Grid>

      {/* Columna derecha */}
      <Grid
        item
        xs={12}
        md={6}
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          background: '#051821'
        }}
      >

        <Box
          sx={{
            width: '100%',
            maxWidth: 420,
            mx: 4,
          }}
        >

          <Card
            elevation={8}
            sx={{
              p: 4,
              backgroundColor: '#ffffff',
              borderRadius: 3
            }}
          >

            {/* Header */}
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}
            >

              <Avatar
                sx={{
                  m: 1,
                  bgcolor: '#002d57'
                }}
              >
            {/*     <LockOutlinedIcon /> */}
              </Avatar>

              <Typography
                component="h1"
                variant="h5"
                fontWeight="bold"
              >
                BIENVENIDO
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  mt: 1,
                  mb: 3,
                  textAlign: 'center',
                  color: '#666'
                }}
              >
                Iniciar Sesión
              </Typography>

            </Box>

            {/* Formulario */}
            <Box
              component="form"
              onSubmit={loginSubmit}
              noValidate
            >

              {/* Usuario */}
              <TextField
                fullWidth
                margin="normal"
                label="Cuil/Cuit"
                name="cuil_cuit"
                value={usuario.cuil_cuit}
                onChange={handleChange}
                variant="outlined"
                error={!!errorCredenciales}
                helperText={" "}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
            {/*           <PersonOutlineIcon /> */}
                    </InputAdornment>
                  ),
                }}
              />

              {/* Password */}
              <TextField
                fullWidth
                margin="normal"
                label="Contraseña"
                type="password"
                name="password"
                value={usuario.password}
                onChange={handleChange}
                variant="outlined"
                error={!!errorCredenciales}
                helperText={errorCredenciales || " "}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                  {/*     <LockOutlinedIcon /> */}
                    </InputAdornment>
                  ),
                }}
              />

              {/* Recuperar contraseña */}
              <Link
                href="#"
                variant="body2"
                underline="hover"
              >
                ¿Olvidaste tu contraseña?
              </Link>

              {/* Recordarme */}
              <FormControlLabel
                control={<Checkbox color="primary" />}
                label="Recordarme"
                sx={{ mt: 1 }}
              />

              {/* Botón */}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{
                  background: '#148D8D',
                  mt: 2,
                  mb: 2,
                  height: 45,
                  fontWeight: 'bold',
                  '&:hover': {
                    background: '#0f7373'
                  }
                }}
              >

                {loading ? (
                  <CircularProgress
                    size={25}
                    sx={{ color: '#fff' }}
                  />
                ) : (
                  "Ingresar"
                )}

              </Button>

            </Box>

          </Card>

        </Box>

      </Grid>

    </Grid>
  );
};

export default Login;