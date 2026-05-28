/* import NotFound from '../Paginas/Notfound'; */
import Login from '../Paginas/Login';
import DetalleCliente from '../Paginas/Usuario2/DetalleCliente';

import Clientes from '../Paginas/Usuario2/MenuUsuario2';
import Lotes from '../Paginas/Usuario2/Lotes';
import LegajosCliente from '../Paginas/Usuario2/LegajoCliente';
import EditarCliente from '../Paginas/Usuario2/ModificarCliente';
import PagosCuotas from '../Paginas/Usuario2/PagosCuota';
import PagoscuotaIc3 from '../Paginas/Usuario2/pagosCuotaic3';
import AsignarLoteAUsuario from "../Paginas/Usuario2/AsignarLoteAUsuario"
import AprobacionesPagos from "../Paginas/Usuario2/AprobacionesPagos"
import PagosNvel2 from "../Paginas/Usuario2/PagarCuota"
import AgregarLegajo from "../Paginas/Usuario2/AgregarLegajo"
import AprobacionCbu from "../Paginas/Usuario2/AprobacionCbus"
import Extracto from "../Paginas/Usuario2/Extracto"
import AgregarVariascuotasL from "../Paginas/Usuario2/AgregarcuotasvariosL"
import Novedades from "../Paginas/Usuario2/Novedades"
import Chats from "../Paginas/Usuario2/chats"
import Comprobanteief from "../Paginas/Usuario2/comporbanteief"
import Mapaniv2 from '../Paginas/Usuario2/mapas';
import Agregarcuotas from '../Paginas/Usuario2/AgregarCuotas';
import Clientesic3 from '../Paginas/Usuario2/clientesic3';
import DetalleClienteic3 from '../Paginas/Usuario2/detalleclic3';
import Actualizarcomprobantes from '../Paginas/Usuario2/actualziarcomprobantes';
import Inusualesniv2 from '../Paginas/Usuario2/inusuales';
import NuevoCliente from '../Paginas/Usuario2/nuevocliente';
import Pagos2 from '../Paginas/Usuario2/pagos3';
import Deudores from '../Paginas/Usuario2/deudores';

import PagosInusuales from "../Paginas/Nivel3/PagosInusuales"
import PagosInusualesMensuales from "../Paginas/Nivel3/PagosInusualesMensuales"
import Principal from "../Paginas/Nivel3/Principal"
import Icc from "../Paginas/Nivel3/Icc"
import VerCliente from '../Paginas/Nivel3/verClientes';
import Lotes3 from '../Paginas/Nivel3/lotes';
import Aprobacion from '../Paginas/Nivel3/aprobacionPagos';
import AgregarICC from '../Paginas/Nivel3/AgregarIcc';
import Declaraciones from '../Paginas/Nivel3/Declaraciones';
import Agregarusuario from '../Paginas/Nivel3/AgregarUsuario';
import Pagos3 from '../Paginas/Nivel3/Pagos';
import Clientesniv3 from '../Paginas/Nivel3/Clientes';
import Novedades3 from '../Paginas/Nivel3/Novedades';
import Extractp from '../Paginas/Nivel3/extracto';
import Niv3Cuota from '../Paginas/Nivel3/cuota';
import Niv3CuotaIc3 from '../Paginas/Nivel3/cuotaic3';

import Resumenes from '../Paginas/Administracion/resumenes';
import Resumenes2 from '../Paginas/Administracion/resumenes2';
import Resumenes3 from '../Paginas/Administracion/resumenes3';
import Carga1 from '../Paginas/Administracion/carga';
 





import Navbar from "../components/Navbar";

import Mapassegundaparte from '../Paginas/mapas'



import NOtFound from '../Paginas/not found'

/* 
import Usuario1 from "../Paginas/usuario1/menuusuario1";
import Nosotros from "../Paginas/usuario1/nosotros";
import Contacto from "../Paginas/usuario1/contacto";
import Cuotas from "../Paginas/usuario1/Cuotas";
import Aprobaciones from "../Paginas/Aprobaciones"
import Legajos from "../Paginas/usuario1/Legajos"
import IngresosDeclarados from "../Paginas/usuario1/IngresosDeclarados"
import Notificaciones from "../Paginas/usuario1/Notificaciones"
import DeclaracionesJuradas from "../Paginas/usuario1/declaracionesJuradas"
import Asociar1 from "../Paginas/usuario1/debitoaut"
import CBU from "../Paginas/usuario1/SubirCbu"
import AsociarCBU from "../Paginas/usuario1/AsociarCbu"
import Constancias from "../Paginas/usuario1/Constancias"
import DatosEmpresa from '../Paginas/usuario1/DatosEmpresa'
import DatosPer from '../Paginas/usuario1/ModificarDatosPers'


import Transferencias from '../Paginas/usuario1/Transferencias';
import RespuestaNoti from '../Paginas/usuario1/Respuesta';


import PagosInusuales from "../Paginas/Nivel3/PagosInusuales"
import PagosInusualesMensuales from "../Paginas/Nivel3/PagosInusualesMensuales"
import Principal from "../Paginas/Nivel3/Principal"
import Icc from "../Paginas/Nivel3/Icc"
import VerCliente from '../Paginas/Nivel3/verClientes';
import Lotes3 from '../Paginas/Nivel3/lotes';
import Aprobacion from '../Paginas/Nivel3/aprobacionPagos';
import AgregarICC from '../Paginas/Nivel3/AgregarIcc';
import Declaraciones from '../Paginas/Nivel3/Declaraciones';
import Agregarusuario from '../Paginas/Nivel3/AgregarUsuario';
import Pagos3 from '../Paginas/Nivel3/Pagos';
import Clientesniv3 from '../Paginas/Nivel3/Clientes';
import Novedades3 from '../Paginas/Nivel3/Novedades';
import Extractp from '../Paginas/Nivel3/extracto';
import Niv3Cuota from '../Paginas/Nivel3/cuota';
import Niv3CuotaIc3 from '../Paginas/Nivel3/cuotaic3';

import Resumenes from '../Paginas/Administracion/resumenes';
import Resumenes2 from '../Paginas/Administracion/resumenes2';
import Resumenes3 from '../Paginas/Administracion/resumenes3';
import Carga1 from '../Paginas/Administracion/carga';
 
import Menu4 from '../Paginas/Nivel4/Menu';
import DetalleExp from '../Paginas/Nivel4/DetalleExp';
import Estadisticas1 from '../Paginas/Nivel4/Relevamiento';
import CargaRelev from '../Paginas/Nivel4/CargaRelev';
import Clientesleg from '../Paginas/Nivel4/clientes';
import Lotesleg from '../Paginas/Nivel4/lotes';
import DetalleClienteleg from '../Paginas/Nivel4/DetalleCliente';
import Legajoslegales from '../Paginas/Nivel4/legajos';
import Asignarlotes2 from '../Paginas/Nivel4/asignarlote';
import Asignarvariasc from '../Paginas/Nivel4/agregarviarias';
import Agregarcuotasleg from '../Paginas/Nivel4/agregarcuotas';
import Perfilleg from '../Paginas/Nivel4/Perfil';
import PagosNvel4 from '../Paginas/Nivel4/pagarcuota';
import Comprobantepag from '../Paginas/Nivel4/comprobante';
import Resumen4 from '../Paginas/Nivel4/resumen';
import Mapalegales from '../Paginas/Nivel4/mapas';


/////////// Administracion
import Usuarios from '../Paginas/Administracion/Menu';
import AdminClientes from '../Paginas/Administracion/Clientes';
import ModificarCli from '../Paginas/Administracion/ModificarCliente';
import EstractoAdmin from '../Paginas/Administracion/Extracto';
import PagosAdmin from '../Paginas/Administracion/Pagos';
import LotesAdmin from '../Paginas/Administracion/Lotes';
import Detalleclienteadmin from '../Paginas/Administracion/Detallecliente';

//////////esme


import Home from '../Paginas/Home/Home'
import HomeCalculo from '../Paginas/Home/Calculo'
import Mapaarg from '../Paginas/maparg'


import Mapasusuario from '../Paginas/usuariomapas/inicio'

import NOtFound from '../Paginas/not found'
import Subirexcell from '../Paginas/subirexcel';


import Mapassegundaparte from '../Paginas/mapas'
*/
import Cargaa1 from '../Paginas/nivel6/carga'
import Resumeness from '../Paginas/nivel6/resumen1'
import Resumeness2 from '../Paginas/nivel6/resumen2'
import Resumeness3 from '../Paginas/nivel6/resumen3'
import Resumeness4 from '../Paginas/nivel6/resumen4'
import Resumeness5 from '../Paginas/nivel6/resumen5'
import Resumeness6 from '../Paginas/nivel6/resumen6' 
const Rutas = [
	 <Navbar/> ,
	 
/* 	
	 {path: '/home',element: (<Home />)}, */
	/*  {path: '/home/calcular',element: (<HomeCalculo />)}, */
	/*  {path: '/home/maparg',element: (<Mapaarg />)}, */

	 
	 

		{path: '/mapasegundaparte',element: (<Mapassegundaparte />)},


	{path: '/',element: (<Login />)},
	{path: '/login',element: (<Login />)},


	
	
/* 	{ : '/usuario2/clientess', render={()=>{ return user?  <Clientes /> : <Clientes />}}  }, 
*/

	{ path: '/usuario2/clientes', element: <Clientes /> },
	{ path: '/usuario2/lotes', element: <Lotes /> },
	{ path: '/usuario2/detallecliente/:cuil_cuit', element: <DetalleCliente /> },
	{ path: '/usuario2/detalleclic3/:cuil_cuit', element: <DetalleClienteic3 /> },

{ path: '/usuario2/inusuales', element: <Inusualesniv2 /> },
	{ path: '/usuario2/agregarcuotas/:id', element: <Agregarcuotas /> },
	{ path: '/usuario2/asignarloteausuario/:cuil_cuit', element: <AsignarLoteAUsuario /> },
/* 	{ path: '/usuario2/aprobaciones', element: <Aprobaciones /> },
	{ path: '/usuario2/aprobacionesdepagos', element: <AprobacionesPagos /> },
	{ path: '/usuario2/aprobacioncbu', element: <AprobacionCbu /> }, */
	{ path: '/usuario2/legajoscliente/:cuil_cuit', element: <LegajosCliente /> },
	{ path: '/usuario2/modificarcliente/:cuil_cuit', element: <EditarCliente /> },
	{ path: '/usuario2/agregarlegajo/:cuil_cut', element: <AgregarLegajo /> },
	{ path: '/usuario2/pagarcuota/:id', element: <PagosNvel2 /> },
	{ path: '/usuario2/pagoscuotas/:id', element: <PagosCuotas /> },
	{ path: '/usuario2/pagoscuotasic3/:id', element: <PagoscuotaIc3 /> },
	{ path: '/usuario2/extracto', element: <Extracto /> },
	{ path: '/usuario2/agregarviarias/:cuil_cuit', element: <AgregarVariascuotasL /> },
	{ path: '/usuario2/novedades', element: <Novedades /> },
	{ path: '/usuario2/consultas', element: <Chats /> },
	{ path: '/usuario2/comprobanteief/:id', element: <Comprobanteief /> },
	{ path: '/usuario2/mapas', element: <Mapaniv2 /> },
	{ path: '/usuario2/clientesic3', element: <Clientesic3 /> },
	{ path: '/usuario2/nuevocliente', element: <NuevoCliente /> },
	{ path: '/usuario2/pagos', element: <Pagos2 /> },
	{ path: '/usuario2/deudores', element: <Deudores /> },

	{ path: '/nivel3/pagosinusuales', element: <PagosInusuales /> },
	{ path: '/nivel3/clientes', element: <Clientesniv3 /> },
	{ path: '/nivel3/pagosmensualesinusuales', element: <PagosInusualesMensuales /> },
	{ path: '/nivel3/', element: <Principal /> },
	{ path: '/nivel3/icc', element: <Icc /> },
	{ path: '/nivel3/agregaricc', element: <AgregarICC /> },
	{ path: '/nivel3/clientes', element: <VerCliente /> },
	{ path: '/nivel3/lotes', element: <Lotes3 /> },
	{ path: '/nivel3/aprobacionesdepagos', element: <Aprobacion /> },
	{ path: '/nivel3/declaraciones', element: <Declaraciones /> },
	{ path: '/nivel3/agregarusuario', element: <Agregarusuario /> },
	{ path: '/nivel3/pagos', element: <Pagos3 /> },
	{ path: '/nivel3/novedades', element: <Novedades3 /> },
	{ path: '/nivel3/cuota/:id', element: <Niv3Cuota /> },
	{ path: '/nivel3/cuotaic3/:id', element: <Niv3CuotaIc3 /> },
	{ path: '/nivel3/extracto', element: <Extractp /> },
	{ path: '/nivel3/resumenes', element: <Resumenes /> },
	{ path: '/nivel3/resumenes2', element: <Resumenes2 /> },
	{ path: '/nivel3/resumenes3', element: <Resumenes3 /> },
	{ path: '/nivel3/carga1', element: <Carga1 /> },


	
{ path: '/nivel6/resumen1', element: <Resumeness /> },
{ path: '/nivel6/resumen2', element: <Resumeness2 /> },
{ path: '/nivel6/resumen3', element: <Resumeness3 /> },
{ path: '/nivel6/resumen4', element: <Resumeness4 /> },
{ path: '/nivel6/resumen5', element: <Resumeness5 /> },
{ path: '/nivel6/resumen6', element: <Resumeness6 /> },

{ path: '/nivel6/carga', element: <Cargaa1 /> },




	{ path: '*', element: <NOtFound /> },

];

export default Rutas;