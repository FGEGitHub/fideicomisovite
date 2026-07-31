import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, GeoJSON, Marker, useMap } from "react-leaflet";
import { useMapEvents } from "react-leaflet";

import "leaflet/dist/leaflet.css";
import "./MapaConCapas.css";
import parcasLogo from "../../Assets/marcas.png";
import L from "leaflet";
import serviciolotes from "../../services/lotes";
import { centerOfMass, pointOnFeature, booleanPointInPolygon } from "@turf/turf";
import TablaReferencias from "./tablaReferencias";
import TablaReferencias2 from "./TablaReferencias2";

const MapaConCapas = () => {
    //  Helper: inyecta properties.id si no existe (para area1..4 y cualquier capa que venga sin id)
    const normalizarGeojsonConIds = (data, nombreCapa) => {
        if (!data?.features) return data;

        return {
            ...data,
            features: data.features.map((f, idx) => {
                const yaTieneId =
                    f?.properties?.id ??
                    f?.properties?.ID ??
                    f?.properties?.Id ??
                    f?.properties?.id_mapa ??
                    f?.id ??
                    null;

                // ✅ SI NO VIENE ID, GENERO NUMÉRICO SIEMPRE
                const idGenerado = idx + 1;

                // ✅ fuerza a número cuando se pueda
                const idFinal = yaTieneId ?? idGenerado;
                const idNumerico = Number.isNaN(Number(idFinal)) ? idFinal : Number(idFinal);

                return {
                    ...f,
                    properties: {
                        ...f.properties,
                        id: idNumerico,
                    },
                };
            }),
        };
    };



    const [zoomActual, setZoomActual] = useState(14);

    const ZoomWatcher = () => {
        useMapEvents({
            zoomend: (e) => setZoomActual(e.target.getZoom()),
        });
        return null;
    };

    const [capasActivas, setCapasActivas] = useState({
        Manzanas: false,
        "Plan Especial": false,
        Barrios: false,
        "Planificación Sección Sur": false,
        "Zonificación Sta Catalina": false,
        "ZRU Predios La Caja": false,

        area1: false,
        area2: false,
        zonaesperanza: false,
        area4: false,
        area5: false,
        area6: false,
        invicoresidencial: false,
        invico2: false,
        parc1: false,
        parc2: false,
        parc3: false,
        ic3: false,
        ic4: false,
        ic42: false,
        restante: false,
        zonapirayui: false,
        Mensura30922U: false,
        mensura31548Unuevo: false,
        ib5: false,
        ib2: false,
        ib3: false,
        "unidad-ejecutora1": false,
        "unidad-ejecutora2": false,
        "unidad-ejecutora3": false,
        "unidad-ejecutora2y3": false,
        zona_municipal: false,
        rutas1: false,
        calleYRutas: false,
        IB: false,
        otras: false,
        fraccionIC: false,
        fraccionIG: false,
        invicomontana: false,
        nuevazona: false,
    });

    const [subCapasActivas, setSubCapasActivas] = useState({
        planespecial1: false,
        planespecial2: false,
        planespecial3: false,
        planespecial4: false,
        planespecial5: false,
    });

const zonasConfig = [
  { key: "ic3", label: "IC3" },
  { key: "ic4", label: "IC4" },
  { key: "ic42", label: "IC4.2" },
  { key: "area5", label: "IB4" },
  { key: "ib5", label: "IB5" },
  { key: "ib2", label: "IB2" },
  { key: "ib3", label: "IB3" },
  { key: "unidad-ejecutora1", label: "Unidad Ejecutora 1" },
  { key: "unidad-ejecutora2", label: "Unidad Ejecutora 2" },
  { key: "unidad-ejecutora3", label: "Unidad Ejecutora 3" },
    { key: "unidad-ejecutora2y3", label: "Unidad Ejecutora 2 y 3" },

  { key: "area6", label: "IB6" },
  { key: "invicoresidencial", label: "Invico - Residencial" },
    { key: "invico2", label: "Invico - Otros" },
    { key: "invicomontana", label: "INVICO - Barrio Dr Montaña" },
    { key: "parc1", label: "Parcela 1" },
    { key: "parc2", label: "Parcela 2" },
    { key: "parc3", label: "Parcela 3" },
  { key: "area1", label: "Zona Hípico" },
  { key: "area2", label: "Zona Clubes/Gremio B/Traza" },
  { key: "area4", label: "Zona Clubes/Gremio S/Traza" },
  { key: "mensura31548Unuevo", label: "Mensura 31548-U" },
  { key: "Mensura30922U", label: "Mensura 30922-U" },
  { key: "zonapirayui", label: "Zona Pirayui" },
  { key: "zonaesperanza", label: "Zona Esperanza" },
  { key: "nuevazona", label: "Nueva Zona" },
];
const clavesZonas = [
  "ic3", "ic4", "ic42",
  "unidad-ejecutora1", "unidad-ejecutora2", "unidad-ejecutora3", "unidad-ejecutora2y3",
  "ib2", "ib3", "area5", "ib5", "area6",
  "invicoresidencial", "invico2", "invicomontana", "parc1", "parc2", "parc3", "area1", "area2", "zonaesperanza", "area4",
  "mensura31548Unuevo", "Mensura30922U", "zonapirayui", "nuevazona",
];
const todasLasZonasActivas = [...clavesZonas, "fraccionIC", "IB", "otras", "fraccionIG", "ZRU Predios La Caja", "Planificación Sección Sur"].every((key) => !!capasActivas[key]);
const zonasActivasCount = clavesZonas.filter((k) => !!capasActivas[k]).length;
const planEspecialCount = Object.values(subCapasActivas).filter(Boolean).length;
const otrosCount = ["calleYRutas", "zona_municipal", "Manzanas", "Zonificación Sta Catalina"].filter((k) => !!capasActivas[k]).length;

const toggleTodasLasZonas = () => {
  const nuevoEstado = !todasLasZonasActivas;
  setCapasActivas((prev) => ({
    ...prev,
    fraccionIC: nuevoEstado,
    IB: nuevoEstado,
    otras: nuevoEstado,
    fraccionIG: nuevoEstado,
    "ZRU Predios La Caja": nuevoEstado,
    "Planificación Sección Sur": nuevoEstado,
    ...clavesZonas.reduce((acc, key) => {
      acc[key] = nuevoEstado;
      return acc;
    }, {}),
  }));
  setSubCapasSur((prev) => Object.fromEntries(Object.keys(prev).map((k) => [k, nuevoEstado])));
};

    const opcionesSubclasificacion = [
        "C1-Corredor de densidad 1",
        "C2-Corredor de densidad 2",
        "C3-Corredor comercial, logistico y productivo",
        "AI1-Area inferior - Densidad media baja",
        "AI2-Area inferior - Densidad baja",
        "AI3-Area inferior de densidad media baja",
        "AIE-Area inferior Especial - Densidad alta",
        "AM1-Area Mixta 1 - Densidad alta",
        "AM1-Area Mixta 2 - Densidad alta",
        "AR-Area Residencial de baja densidad",
        "ARP-Area Residencial y agroproductiva complementaria",
        "CC-Corredor Comercial mixto",
        "EDR-Equipamiento Deportivo Recreativo",
        "EP-Equipamiento Publico",
        "EVP-Espacio Verde Publico",
        // PLAN ESPECIAL - ETAPA 1
        "UG1-Distrito Administrativo",
        "UG2-Areas Residenciales y Mixtas/Conjuntos Habitacionales PROCREAR, INVICO y Lotes con Serivicios de oferta municipal",
        "UG3-Areas Residenciales, Mixtas y Paseo de borde del B° PIRAYUI",
        "UG4-Areas Recreativas, Residenciales y Mixtas - Reordenamiento Urbano y Parque de Bosque Nativo",
        // PLAN ESPECIAL - ETAPA 2
        "UG1-Areas Residenciales y Mixtas/Conjuntos Habitacionales del Estado",
        "UG2-Areas Residenciales y Mixtas - Parque Metropolitano",
        "UG3-Areas Mixtas y Equipamientos generales - Zona de borde costero del Rio Parana",
        "UG4-Areas de actividades productivas y logisticas, vinculadas a residencias de baja densidad",
        // PLAN ESPECIAL - ETAPA 3
        "UG1-Areas Residenciales, Mixtas y Paseo de borde del Arroyo PIRAYUI",
        "UG2-Area Residencial Suburbana y de Actividades Agro productivas y Recreativas",
        "UG3-Areas de Clubes y Equipamientos Generales",
        "UG4-Reordenamiento Urbano de Asentamientos",
        // PLAN ESPECIAL - ETAPA 4
        "UG1-Area Residencial Suburbana y de Usos Recreativos, Sociales y Deportivos",
        "UG2-Area Residencial Suburbana de baja densidad y Paseo Publico",
        // PLAN ESPECIAL - ETAPA 5
        "UG1-Reordenamiento Urbano y lotes con servicios en zona de interes social; y Parque Lineal Ex Via FF.CC Urquiza",
        "UG2-Areas Residenciales y Mixtas, Equipamientos Generales y Parque Lineal Ex Via FF.CC Urquiza",
        // PLANIFICACION SECCION SUR
        "PIT-Parque Industrial Tecnologico - FASE 1",
        "PIT-Parque Industrial Tecnologico - FASE 2",
        "PIT-Parque Industrial Tecnologico - FASE 3",
        "PLC-Planta de Liquidos Cloacales",
        "PLC-Zona Fuelle",
        "ZPA-Zona de Proteccion Ambiental-Reserva Natural Santa Catalina",
        // NUEVAS REFERENCIAS
        "I",
        "II",
        "III",
        "IV",
        "V",
        "VI",
        "VII",
        "VIII",
        "IX",
        "X",
        "XI",
        "XII",
        "XIII",
        "XIV",
        "IA",
        "IB",

        "Reserva Municipal I",
        "Reserva Municipal II",
        "Reserva Municipal 1",
        "Reserva Municipal 2",
        "Reserva Municipal 3",
        "Reserva Municipal 4",
        "Reserva Municipal",

    ];



    const coloresPorSubclasificacion = {
        "C1-Corredor de densidad 1": "#ffbc8e",
        "C2-Corredor de densidad 2": "#efc700",
        "C3-Corredor comercial, logistico y productivo": "#fca24c",
        "AI1-Area inferior - Densidad media baja": "#6d4692",
        "AI2-Area inferior - Densidad baja": "#bda7d3",
        "AI3-Area inferior de densidad media baja": "#d64ebd",
        "AIE-Area inferior Especial - Densidad alta": "#40a7e9",
        "AM1-Area Mixta 1 - Densidad alta": "#c14e4e",
        "AM1-Area Mixta 2 - Densidad alta": "#f0abab",
        "AR-Area Residencial de baja densidad": "#debf6f",
        "ARP-Area Residencial y agroproductiva complementaria": "#e4eeb1",
        "CC-Corredor Comercial mixto": "#9bcfed",
        "EDR-Equipamiento Deportivo Recreativo": "#bfd1f0",
        "EP-Equipamiento Publico": "#9c9c9c",
        "EVP-Espacio Verde Publico": "#afd9b7",
        // PLAN ESPECIAL - ETAPA 1
        "UG1-Distrito Administrativo": "#b2a792",
        "UG2-Areas Residenciales y Mixtas/Conjuntos Habitacionales PROCREAR, INVICO y Lotes con Serivicios de oferta municipal":
            "#dccfb6",
        "UG3-Areas Residenciales, Mixtas y Paseo de borde del B° PIRAYUI": "#e8e1d2",
        "UG4-Areas Recreativas, Residenciales y Mixtas - Reordenamiento Urbano y Parque de Bosque Nativo": "#f5eee0",
        // PLAN ESPECIAL - ETAPA 2
        "UG1-Areas Residenciales y Mixtas/Conjuntos Habitacionales del Estado": "#c89132",
        "UG2-Areas Residenciales y Mixtas - Parque Metropolitano": "#e3a53a",
        "UG3-Areas Mixtas y Equipamientos generales - Zona de borde costero del Rio Parana": "#eeba5f",
        "UG4-Areas de actividades productivas y logisticas, vinculadas a residencias de baja densidad": "#eccb78",
        // PLAN ESPECIAL - ETAPA 3
        "UG1-Areas Residenciales, Mixtas y Paseo de borde del Arroyo PIRAYUI": "#8d3774",
        "UG2-Area Residencial Suburbana y de Actividades Agro productivas y Recreativas": "#b55d9b",
        "UG3-Areas de Clubes y Equipamientos Generales": "#ca7cb3",
        "UG4-Reordenamiento Urbano de Asentamientos": "#e0a3ce",
        // PLAN ESPECIAL - ETAPA 4
        "UG1-Area Residencial Suburbana y de Usos Recreativos, Sociales y Deportivos": "#ee7562",
        "UG2-Area Residencial Suburbana de baja densidad y Paseo Publico": "#f6b2a7",
        // PLAN ESPECIAL - ETAPA 5
        "UG1-Reordenamiento Urbano y lotes con servicios en zona de interes social; y Parque Lineal Ex Via FF.CC Urquiza": "#8a8a8a",
        "UG2-Areas Residenciales y Mixtas, Equipamientos Generales y Parque Lineal Ex Via FF.CC Urquiza": "#c2c1c1",
        // PLANIFICACION SECCION SUR
        "PIT-Parque Industrial Tecnologico - FASE 1": "#d0d0d0",
        "PIT-Parque Industrial Tecnologico - FASE 2": "#d0d0d0",
        "PIT-Parque Industrial Tecnologico - FASE 3": "#d0d0d0",
        "PLC-Planta de Liquidos Cloacales": "#c85b01",
        "PLC-Zona Fuelle": "#f1a465",
        "ZPA-Zona de Proteccion Ambiental-Reserva Natural Santa Catalina": "#7a9e6e",
        "Reserva Municipal": "#e08c3a",
        "Reserva Municipal I": "#e08c3a",
        "Reserva Municipal II": "#e08c3a",
        "Reserva Municipal 1": "#e08c3a",
        "Reserva Municipal 2": "#e08c3a",
        "Reserva Municipal 3": "#e08c3a",
        "Reserva Municipal 4": "#e08c3a",
        "": "red",
        null: "red",
        undefined: "red",
    };
    const [verPublicoPrivado, setVerPublicoPrivado] = useState(false);
    const [geojsonData, setGeojsonData] = useState({});
    const [modalDetalleAbierto, setModalDetalleAbierto] = useState(false);
    const [modalAbierto, setModalAbierto] = useState(false);
    const [texto, setTexto] = useState("");
    const [idSeleccionado, setIdSeleccionado] = useState(null);
    const [nombreCapaSeleccionada, setNombreCapaSeleccionada] = useState("");
    const [centroSeleccionado, setCentroSeleccionado] = useState(null);
    const [poligonosGuardados, setPoligonosGuardados] = useState([]);
    const poligonosRef = React.useRef([]);
    useEffect(() => { poligonosRef.current = poligonosGuardados; }, [poligonosGuardados]);
    const idsDesdeBase = (poligonosGuardados || []).map((p) => p.id_mapa);
    const [mapa, setMapa] = useState(null);
    const [subclasificacion, setSubclasificacion] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [verReferencias, setVerReferencias] = useState(false);
    const [verReferenciasTabla, setVerReferenciasTabla] = useState(false);
    const [verReferenciasTabla2, setVerReferenciasTabla2] = useState(false);
    const [mostrarEtiquetas, setMostrarEtiquetas] = useState(false);
    const mostrarEtiquetasRef = React.useRef(false);
    useEffect(() => { mostrarEtiquetasRef.current = mostrarEtiquetas; }, [mostrarEtiquetas]);
    const [datosZonaSeleccionada, setDatosZonaSeleccionada] = useState(null);
    const [judicializado, setJudicializado] = useState("");
    const [adrema, setAdrema] = useState("");
    const [privado, setPrivado] = useState("");
    const [superficie, setSuperficie] = useState("");
    const [tipoMapa, setTipoMapa] = useState("satelite");
    const [panelColapsado, setPanelColapsado] = useState(false);
    const [geoJsonKey, setGeoJsonKey] = useState(0);
    const [mensura, setMensura] = useState("");
    const [vendido, setVendido] = useState(false);
    const esVendido = (v) => v === true || v === "true" || v === 1 || v === "1";
    const [subCapasSur, setSubCapasSur] = useState({
        PIT: false,
        "PLC-C": false,
        "PLC-F": false,
        ZPA: false
    });
    const esAreaEspecial = ["area1", "area2", "zonaesperanza", "area4", "area5", "area6", "ic3", "ic4", "ic42", "mensura31548Unuevo", "ib5","ib2","ib3", "unidad-ejecutora1", "unidad-ejecutora2", "unidad-ejecutora3","unidad-ejecutora2y3", "zona_municipal", "invicoresidencial", "invico2", "invicomontana", "parc1", "parc2", "parc3", "zonapirayui", "Mensura30922U", "nuevazona"].includes(nombreCapaSeleccionada
    );
    // Carga inicial de datos guardados desde backend



 useEffect(() => {
  fetch("/juicios-poligonos.geojson")
    .then((r) => r.json())
    .then((data) => {
      const normalizado = normalizarGeojsonConIds(data, "judicializados");
      setGeojsonData((prev) => ({
        ...prev,
        judicializados: normalizado,
      }));
    })
    .catch(console.error);
}, []);
    useEffect(() => {
        serviciolotes
            .poligonosguardados()
            .then((data) => {
                console.log("Polígonos guardados:", data);
                setPoligonosGuardados(data);
            })
            .catch(console.error);
    }, []);

    // Carga de geojson
    useEffect(() => {
        // Manzanas
        fetch("/manazanasmates.geojson")
            .then((r) => r.json())
            .then((data) => {
                // manzanas normalmente ya trae id; igual no molesta normalizar
                const normalizado = normalizarGeojsonConIds(data, "Manzanas");
                setGeojsonData((prev) => ({ ...prev, Manzanas: normalizado }));
            })
            .catch(console.error);

        // Planes especiales
        const planesEspeciales = ["planespecial1", "planespecial2", "planespecial3", "planespecial4", "planespecial5"];
        planesEspeciales.forEach((plan) => {
            fetch(`/${plan}.geojson`)
                .then((r) => r.json())
                .then((data) => {
                    const normalizado = normalizarGeojsonConIds(data, plan);
                    setGeojsonData((prev) => ({ ...prev, [plan]: normalizado }));
                })
                .catch((error) => console.error(`Error cargando ${plan}:`, error));
        });
     
        // Barrios / Calles
        fetch("/calles.geojson")
            .then((r) => r.json())
            .then((data) => {
                const normalizado = normalizarGeojsonConIds(data, "Barrios");
                setGeojsonData((prev) => ({ ...prev, Barrios: normalizado }));
            })
            .catch(console.error);

        //  Areas nuevas (NO traen properties.id: lo inyectamos)
        fetch("/area1.geojson")
            .then((r) => r.json())
            .then((data) => {
                const normalizado = normalizarGeojsonConIds(data, "area1");
                setGeojsonData((prev) => ({ ...prev, area1: normalizado }));
            })
            .catch(console.error);

        fetch("/area2.geojson")
            .then((r) => r.json())
            .then((data) => {
                const normalizado = normalizarGeojsonConIds(data, "area2");
                setGeojsonData((prev) => ({ ...prev, area2: normalizado }));
            })
            .catch(console.error);

        fetch("/zonaesperanza.geojson")
            .then((r) => r.json())
            .then((data) => {
                const normalizado = normalizarGeojsonConIds(data, "zonaesperanza");
                setGeojsonData((prev) => ({ ...prev, zonaesperanza: normalizado }));
            })
            .catch(console.error);

        fetch("/nueva%20zona.geojson")
            .then((r) => r.json())
            .then((data) => {
                const normalizado = normalizarGeojsonConIds(data, "nuevazona");
                setGeojsonData((prev) => ({ ...prev, nuevazona: normalizado }));
            })
            .catch(console.error);

        fetch("/area4.geojson")
            .then((r) => r.json())
            .then((data) => {
                const normalizado = normalizarGeojsonConIds(data, "area4");
                setGeojsonData((prev) => ({ ...prev, area4: normalizado }));
            })
            .catch(console.error);
        fetch("/area5.geojson")
            .then((r) => r.json())
            .then((data) => {
                const normalizado = normalizarGeojsonConIds(data, "area5");
                setGeojsonData((prev) => ({ ...prev, area5: normalizado }));
            })
            .catch(console.error);
        fetch("/area6.geojson")
            .then((r) => r.json())
            .then((data) => {
                const normalizado = normalizarGeojsonConIds(data, "area6");
                setGeojsonData((prev) => ({ ...prev, area6: normalizado }));
            })
            .catch(console.error);
        // Otras capas
        fetch("/ic3.geojson")
            .then((r) => r.json())
            .then((data) => {
                const normalizado = normalizarGeojsonConIds(data, "ic3");
                setGeojsonData((prev) => ({ ...prev, ic3: normalizado }));
            })
            .catch(console.error);

        fetch("/ic4.geojson")
            .then((r) => r.json())
            .then((data) => {
                const normalizado = normalizarGeojsonConIds(data, "ic4");
                setGeojsonData((prev) => ({ ...prev, ic4: normalizado }));
            })
            .catch(console.error);
        fetch("/ic42.geojson")
            .then((r) => r.json())
            .then((data) => {
                const normalizado = normalizarGeojsonConIds(data, "ic42");
                setGeojsonData((prev) => ({ ...prev, ic42: normalizado }));
            })
            .catch(console.error);
        fetch("/mensura31548Unuevo.geojson")
            .then((r) => r.json())
            .then((data) => {
                const normalizado = normalizarGeojsonConIds(data, "mensura31548Unuevo");
                setGeojsonData((prev) => ({ ...prev, mensura31548Unuevo: normalizado }));
            })
            .catch(console.error);

        fetch("/ib5.geojson")
            .then((r) => r.json())
            .then((data) => {
                const normalizado = normalizarGeojsonConIds(data, "ib5");
                setGeojsonData((prev) => ({ ...prev, ib5: normalizado }));
            })
            .catch(console.error);
   fetch("/ib2.geojson")
            .then((r) => r.json())
            .then((data) => {
                const normalizado = normalizarGeojsonConIds(data, "ib2");
                setGeojsonData((prev) => ({ ...prev, ib2: normalizado }));
            })
            .catch(console.error);
            fetch("/ib3.geojson")
            .then((r) => r.json())
            .then((data) => {
                const normalizado = normalizarGeojsonConIds(data, "ib3");
                setGeojsonData((prev) => ({ ...prev, ib3: normalizado }));
            })
                fetch("/unidad-ejecutora1.geojson")
            .then((r) => r.json())
            .then((data) => {
                const normalizado = normalizarGeojsonConIds(data, "unidad-ejecutora1");
                setGeojsonData((prev) => ({ ...prev, "unidad-ejecutora1": normalizado }));
            })
                fetch("/unidad-ejecutora2.geojson")
            .then((r) => r.json())
            .then((data) => {
                const normalizado = normalizarGeojsonConIds(data, "unidad-ejecutora2");
                setGeojsonData((prev) => ({ ...prev, "unidad-ejecutora2": normalizado }));
            })
                fetch("/unidad-ejecutora3.geojson")
            .then((r) => r.json())
            .then((data) => {
                const normalizado = normalizarGeojsonConIds(data, "unidad-ejecutora3");
                setGeojsonData((prev) => ({ ...prev, "unidad-ejecutora3": normalizado }));
            })
                  fetch("/unidad2y3.geojson")
            .then((r) => r.json())
            .then((data) => {
                const normalizado = normalizarGeojsonConIds(data, "unidad-ejecutora2y3");
                setGeojsonData((prev) => ({ ...prev, "unidad-ejecutora2y3": normalizado }));
            })
            .catch(console.error);
               fetch("/zona_municipal.geojson")
            .then((r) => r.json())
            .then((data) => {
                const normalizado = normalizarGeojsonConIds(data, "zona_municipal");
                setGeojsonData((prev) => ({ ...prev, zona_municipal: normalizado }));
            })
            .catch(console.error);
                       fetch("/invico2.geojson")
            .then((r) => r.json())
            .then((data) => {
                const normalizado = normalizarGeojsonConIds(data, "invico2");
                setGeojsonData((prev) => ({ ...prev, invico2: normalizado }));
            })
            .catch(console.error);

        fetch("/invicomontaña.geojson")
            .then((r) => r.json())
            .then((data) => {
                const normalizado = normalizarGeojsonConIds(data, "invicomontana");
                setGeojsonData((prev) => ({ ...prev, invicomontana: normalizado }));
            })
            .catch(console.error);

        fetch("/parc1.geojson")
            .then((r) => r.json())
            .then((data) => {
                const normalizado = normalizarGeojsonConIds(data, "parc1");
                setGeojsonData((prev) => ({ ...prev, parc1: normalizado }));
            })
            .catch(console.error);

        fetch("/parc2.geojson")
            .then((r) => r.json())
            .then((data) => {
                const normalizado = normalizarGeojsonConIds(data, "parc2");
                setGeojsonData((prev) => ({ ...prev, parc2: normalizado }));
            })
            .catch(console.error);

        fetch("/parc3.geojson")
            .then((r) => r.json())
            .then((data) => {
                const normalizado = normalizarGeojsonConIds(data, "parc3");
                setGeojsonData((prev) => ({ ...prev, parc3: normalizado }));
            })
            .catch(console.error);

        fetch("/invicoresidencial.geojson")
            .then((r) => r.json())
            .then((data) => {
                const normalizado = normalizarGeojsonConIds(data, "invicoresidencial");
                setGeojsonData((prev) => ({ ...prev, invicoresidencial: normalizado }));
            })
            .catch(console.error);


        fetch("/Mensura30922U.geojson")
            .then((r) => r.json())
            .then((data) => {
                const normalizado = normalizarGeojsonConIds(data, "Mensura30922U");
                setGeojsonData((prev) => ({ ...prev, "Mensura30922U": normalizado }));
            })
            .catch(console.error);
        fetch("/zonapirayui.geojson")
            .then((r) => r.json())
            .then((data) => {
                const normalizado = normalizarGeojsonConIds(data, "zonapirayui");
                setGeojsonData((prev) => ({ ...prev, "zonapirayui": normalizado }));
            })
            .catch(console.error);
        fetch("/rutas1.geojson")

            .then((r) => r.json())
            .then((data) => {
                const normalizado = normalizarGeojsonConIds(data, "rutas1");
                setGeojsonData((prev) => ({ ...prev, rutas1: normalizado }));
            })
            .catch(console.error);
        const nuevasCapas = [
            { nombre: "Zonificación Sta Catalina", archivo: "zonificacion_stacatalina.geojson" },
            { nombre: "ZRU Predios La Caja", archivo: "zru_prediosdelacaja.geojson" },
        ];

        const capasSeccionSur = [
            { nombre: "PIT", archivo: "pitfases.geojson" },
            { nombre: "PLC-C", archivo: "plc-c.geojson" },
            { nombre: "PLC-F", archivo: "plc-f.geojson" },
            { nombre: "ZPA", archivo: "zpa.geojson" },
        ];

        capasSeccionSur.forEach((capa) => {
            fetch(`/${capa.archivo}`)
                .then((r) => r.json())
                .then((data) => {
                    const normalizado = normalizarGeojsonConIds(data, capa.nombre);
                    setGeojsonData((prev) => ({ ...prev, [capa.nombre]: normalizado }));
                })
                .catch((error) => console.error(`Error cargando ${capa.nombre}:`, error));
        });

        nuevasCapas.forEach((capa) => {
            fetch(`/${capa.archivo}`)
                .then((r) => r.json())
                .then((data) => {
                    const normalizado = normalizarGeojsonConIds(data, capa.nombre);
                    setGeojsonData((prev) => ({ ...prev, [capa.nombre]: normalizado }));
                })
                .catch((error) => console.error(`Error cargando ${capa.nombre}:`, error));
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Click en polígono → abre detalle (si no hay datos, muestra “sin información”)
    // helper (pegalo arriba de handleFeatureClick, dentro del componente)

    // match recomendado: id_mapa + capa
    const buscarPoligonoDB = (arr, id, capa) => {
        const matchExacto = (arr || []).find(
            (p) => String(p.id_mapa) === String(id) && String(p.capa || "") === String(capa || "")
        );
        if (matchExacto) return matchExacto;

        const fallback = (arr || []).find((p) => String(p.id_mapa) === String(id));
        return fallback || null;
    };




    const handleFeatureClick = (e) => {
        const feature = e.target.feature;
        const layer = e.target;
        const center = layer.getBounds().getCenter();

        const nombreCapa =
            Object.entries(geojsonData).find(([_, data]) =>
                data?.features?.includes(feature)
            )?.[0] || "Desconocido";

        if (nombreCapa === "Barrios") return;

        const id =
            feature?.properties?.id ??
            feature?.properties?.ID ??
            feature?.properties?.Id ??
            feature?.properties?.id_mapa ??
            feature?.id ??
            null;

        if (id == null) return;

        const datosBase = buscarPoligonoDB(poligonosGuardados, id, nombreCapa);

        setIdSeleccionado(id);
        setCentroSeleccionado(center);
        setNombreCapaSeleccionada(nombreCapa);

        setDatosZonaSeleccionada(datosBase);

        setTexto(datosBase?.dato1 ?? "");
        setSubclasificacion(datosBase?.subclasificacion ?? "");
        setDescripcion(datosBase?.descripcion ?? "");
        setPrivado(datosBase?.privado ?? "");
        setAdrema(datosBase?.adrema ?? "");
        setSuperficie(datosBase?.superficie ?? "");
        setJudicializado(datosBase?.judicializado ?? "");
        setMensura(datosBase?.mensura ?? "");
        setVendido(esVendido(datosBase?.vendido));
        setModalDetalleAbierto(true);
        setModalAbierto(false);
    };


    const InstanciaDelMapa = ({ setMapa }) => {
        const map = useMap();
        useEffect(() => {
            setMapa(map);
        }, [map, setMapa]);
        return null;
    };

    const onEachFeature = (feature, layer) => {
        layer.on({ click: handleFeatureClick });
    };

    const crearOnEachFeature = (nombreCapa) => (feature, layer) => {
        layer.on({ click: handleFeatureClick });
        if (nombreCapa === "Barrios" || nombreCapa === "rutas1") return;
        layer.bindTooltip(() => {
            if (mostrarEtiquetasRef.current) return "";
            const id =
                feature?.properties?.id ??
                feature?.properties?.ID ??
                feature?.properties?.Id ??
                feature?.id ??
                null;
            if (id == null) return "";
            const poligono = buscarPoligonoDB(poligonosRef.current, id, nombreCapa);
            return poligono?.dato1 || "";
        }, { permanent: false, direction: "top", className: "sc-tooltipHover", sticky: true });
    };
    const MapResizer = () => {
        const map = useMap();

        useEffect(() => {
            const handleResize = () => {
                setTimeout(() => {
                    map.invalidateSize();
                }, 150);
            };

            handleResize();
            window.addEventListener("resize", handleResize);

            return () => {
                window.removeEventListener("resize", handleResize);
            };
        }, [map]);

        return null;
    };


    const toggleCapaPrincipal = (nombre) => {
        const nuevoEstado = !capasActivas[nombre];

        setCapasActivas((prev) => {
            const updates = { ...prev, [nombre]: nuevoEstado };

            if (nombre === "fraccionIC") {
                updates.ic3 = nuevoEstado;
                updates.ic4 = nuevoEstado;
                updates.ic42 = nuevoEstado;
                updates["unidad-ejecutora1"] = nuevoEstado;
                updates["unidad-ejecutora2"] = nuevoEstado;
                updates["unidad-ejecutora3"] = nuevoEstado;
                updates["unidad-ejecutora2y3"] = nuevoEstado;
            }
            if (nombre === "ic4") {
                updates.ic42 = nuevoEstado;
                if (nuevoEstado) {
                    updates["unidad-ejecutora1"] = true;
                    updates["unidad-ejecutora2"] = true;
                    updates["unidad-ejecutora3"] = true;
                    updates["unidad-ejecutora2y3"] = true;
                }
            }
            if (nombre === "mensura31548Unuevo" && nuevoEstado) {
                updates.invico2 = true;
            }
            if (nombre === "unidad-ejecutora2" || nombre === "unidad-ejecutora3") {
                const ue2 = nombre === "unidad-ejecutora2" ? nuevoEstado : !!prev["unidad-ejecutora2"];
                const ue3 = nombre === "unidad-ejecutora3" ? nuevoEstado : !!prev["unidad-ejecutora3"];
                updates["unidad-ejecutora2y3"] = ue2 && ue3;
            }
            if (nombre === "IB") {
                updates.ib2 = nuevoEstado;
                updates.ib3 = nuevoEstado;
                updates.area5 = nuevoEstado;
                updates.ib5 = nuevoEstado;
                updates.area6 = nuevoEstado;
            }
            if (nombre === "fraccionIG") {
                updates.invicomontana = nuevoEstado;
                updates.parc1 = nuevoEstado;
                updates.parc2 = nuevoEstado;
                updates.parc3 = nuevoEstado;
            }
            if (nombre === "otras") {
                updates.invicoresidencial = nuevoEstado;
                updates.area1 = nuevoEstado;
                updates.area2 = nuevoEstado;
                updates.zonaesperanza = nuevoEstado;
                updates.area4 = nuevoEstado;
                updates.mensura31548Unuevo = nuevoEstado;
                updates.Mensura30922U = nuevoEstado;
                updates.zonapirayui = nuevoEstado;
                updates["ZRU Predios La Caja"] = nuevoEstado;
                updates["Planificación Sección Sur"] = nuevoEstado;
            }
            if (nombre === "calleYRutas") {
                updates.Barrios = nuevoEstado;
                updates.rutas1 = nuevoEstado;
            }

            return updates;
        });

        if (nombre === "Plan Especial") {
            const nuevoEstadoSubcapas = {};
            Object.keys(subCapasActivas).forEach((key) => {
                nuevoEstadoSubcapas[key] = nuevoEstado;
            });
            setSubCapasActivas(nuevoEstadoSubcapas);
        }

        if (nombre === "Planificación Sección Sur") {
            const nuevoEstadoSubcapasSur = {};
            Object.keys(subCapasSur).forEach((key) => {
                nuevoEstadoSubcapasSur[key] = nuevoEstado;
            });
            setSubCapasSur(nuevoEstadoSubcapasSur);
        }
    };

    const toggleSubCapa = (nombre) => {
        setSubCapasActivas((prev) => ({ ...prev, [nombre]: !prev[nombre] }));

        if (Object.values(subCapasActivas).every((val) => val)) {
            setCapasActivas((prev) => ({ ...prev, "Plan Especial": true }));
        }
    };

    const getCentroideAproximado = (geometry) => {
        try {
            const centroVisual = centerOfMass(geometry);
            const [lng, lat] = centroVisual.geometry.coordinates;

            const estaDentro = booleanPointInPolygon(centroVisual, geometry);
            if (estaDentro) return { lat, lng };

            const puntoSeguro = pointOnFeature(geometry).geometry.coordinates;
            return { lat: puntoSeguro[1], lng: puntoSeguro[0] };
        } catch (err) {
            console.error("Error calculando centroide:", err);
            return null;
        }
    };

    const EtiquetasPoligonos = ({
        geojsonData,
        poligonosGuardados,
        capasActivas,
        subCapasActivas,
        subCapasSur,
        mostrarEtiquetas,
        zoomActual,
    }) => {
        if (!mostrarEtiquetas) return null;
        const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

        const fontSize = clamp(7 + (zoomActual - 16) * 1.5, 7, 14);
        const paddingY = clamp(2 + (zoomActual - 16) * 0.8, 2, 8);
        const paddingX = clamp(3 + (zoomActual - 16) * 0.6, 3, 10);
        const maxWidth = clamp(60 + (zoomActual - 16) * 15, 60, 120);

        return (
            <>
                {Object.entries(geojsonData).map(([nombreCapa, geojson]) => {
                    const esSubcapa = nombreCapa.startsWith("planespecial");
                    const esSubcapaSur = ["PIT", "PLC-C", "PLC-F", "ZPA"].includes(nombreCapa);

                    const estaActiva = esSubcapa
                        ? subCapasActivas[nombreCapa]
                        : esSubcapaSur
                            ? subCapasSur[nombreCapa]
                            : capasActivas[nombreCapa];

                    if (!estaActiva) return null;

                    return geojson?.features?.map((feature) => {
                        const id = feature.properties?.id;
                        const poligonoDB = buscarPoligonoDB(poligonosGuardados, id, nombreCapa);


                        if (!poligonoDB || !feature.geometry) return null;

                        try {
                            const center = getCentroideAproximado(feature.geometry);
                            if (!center) return null;

                            return (
                                <Marker
                                    key={`etiqueta-${nombreCapa}-${id}`}
                                    position={center}
                                    icon={L.divIcon({
                                        className: "sc-labelIcon",
                                        html: `
    <div class="sc-labelBubble" style="
      font-size:${fontSize}px;
      padding:${paddingY}px ${paddingX}px;
      max-width:${maxWidth}px;
    ">
      ${poligonoDB.dato1}
    </div>
  `,
                                        iconSize: [0, 0],
                                        iconAnchor: [0, 0],
                                    })}


                                />
                            );
                        } catch (error) {
                            console.error("Error al calcular centro:", error);
                            return null;
                        }
                    });
                })}
            </>
        );
    };


    const getStylePoligono = (feature, nombreCapa) => {
        const id = feature.properties?.id;

        const poligono = buscarPoligonoDB(poligonosGuardados, id, nombreCapa);

        let fillColor = "white";
        let fillOpacity = 0.2;

        if (!poligono) {
            return {
                fillColor,
                weight: 1,
                opacity: 0.5,
                color: "black",
                fillOpacity,
            };
        }

        const sub = poligono.subclasificacion;
        fillColor = coloresPorSubclasificacion[sub] || "gray";
        fillOpacity = 0.8;

        const isGray = fillColor === "gray";
        return {
            fillColor,
            weight: isGray ? 0 : 1,
            opacity: isGray ? 0 : 0.5,
            color: isGray ? "transparent" : "black",
            fillOpacity,
        };
    };

    const getStyleAreaEspecial = (feature, nombreCapa) => {
        const id = feature?.properties?.id;

        const poligono = buscarPoligonoDB(poligonosGuardados, id, nombreCapa);

        const pesoBorde = ["ic3", "ic4", "ic42", "mensura31548Unuevo", "invicoresidencial","invico2", "restante"].includes(nombreCapa) ? 3 : 2;

        // SIN datos en base
        if (!poligono) {
            return {
                fillColor: "grey",
                fillOpacity: 0.15,
                color: "transparent",
                weight: 0,
                opacity: 0,
            };
        }

        // MODO PÚBLICO / PRIVADO
        if (verPublicoPrivado) {
            let colorBase = "#9e9e9e";

            if (poligono.privado === "privado") colorBase = "#d32f2f";
            if (poligono.privado === "publico") colorBase = "#00e000";

            return {
                fillColor: colorBase,
                fillOpacity: 0.35,
                color: colorBase, // borde también rojo/verde
                weight: pesoBorde,
                opacity: 1,
            };
        }

        // MODO NORMAL
        return {
            fillColor: "grey",
            fillOpacity: 0.15,
            color: "transparent",
            weight: 0,
            opacity: 0,
        };
    };
useEffect(() => {
    if (!mapa) return;

    if (!mapa.getPane("judicializadosPane")) {
        const pane = mapa.createPane("judicializadosPane");
        pane.style.zIndex = 1000;
    }
}, [mapa]);
    return (
        <div className="mapa-contenedor">
            <div className={`panel-lateral${panelColapsado ? " panel-colapsado" : ""}`}>

                {/* LOGO */}

                <div className="logo-container">
                    <img src={parcasLogo} alt="Logo PARCAS" className="logo-parcas" />
                </div>


                {/* VISUALIZACION */}

                <div className="grupo-capas">

                    <div className="grupo-titulo">VISUALIZACIÓN</div>
                    <div className="capa-item">
                        <div className="tipo-mapa-toggle">
                            <button
                                className={`tipo-mapa-btn${tipoMapa === "normal" ? " activo" : ""}`}
                                onClick={() => setTipoMapa("normal")}
                            >
                                Mapa
                            </button>
                            <button
                                className={`tipo-mapa-btn${tipoMapa === "satelite" ? " activo" : ""}`}
                                onClick={() => setTipoMapa("satelite")}
                            >
                                Satélite
                            </button>
                        </div>
                    </div>
                    <div className="capa-item">
    <label>
        <input
            type="checkbox"
            checked={!!capasActivas.judicializados}
            onChange={() => toggleCapaPrincipal("judicializados")}
        />
        <strong>Juicios en Trámite</strong>
    </label>
</div>
                    <div className="capa-item">
                        <label>
                            <input
                                type="checkbox"
                                checked={verReferenciasTabla || verReferenciasTabla2}
                                onChange={() => {
                                    const nuevoEstado = !(verReferenciasTabla || verReferenciasTabla2);
                                    setVerReferenciasTabla(nuevoEstado);
                                    setVerReferenciasTabla2(nuevoEstado);
                                }}
                            />
                            <strong>Ver tabla de referencias</strong>
                        </label>
                    </div>
                    <div className="capa-item">
                        <label>
                            <input
                                type="checkbox"
                                checked={mostrarEtiquetas}
                                onChange={() => setMostrarEtiquetas(p => !p)}
                            />
                            <strong>Mostrar leyenda</strong>
                        </label>
                    </div>

                </div>


                <h3 className="panel-titulo"></h3>


                {/* ZONAS */}

               <div className="grupo-capas">
  <div className="grupo-titulo">ZONAS <span className={`grupo-badge${zonasActivasCount === 0 ? " cero" : ""}`}>{zonasActivasCount}</span></div>

  <div className="capa-item capa-item-todas-zonas">
    <label>
      <input
        type="checkbox"
        checked={todasLasZonasActivas}
        onChange={toggleTodasLasZonas}
      />
      <strong>Todas</strong>
    </label>
  </div>

  {/* Fracción IC */}
  <div className="capa-item">
    <label>
      <input
        type="checkbox"
        checked={!!capasActivas.fraccionIC}
        onChange={() => toggleCapaPrincipal("fraccionIC")}
      />
      <strong>Fracción IC</strong>
    </label>
    <div className="subcapas">
      <div>
        <label>
          <input
            type="checkbox"
            checked={!!capasActivas.ic3}
            onChange={() => toggleCapaPrincipal("ic3")}
          />
          <strong>IC3</strong>
        </label>
      </div>
      <div>
        <label>
          <input
            type="checkbox"
            checked={!!capasActivas.ic4}
            onChange={() => toggleCapaPrincipal("ic4")}
          />
          <strong>IC4</strong>
        </label>
        <div className="subcapas">
          {[
            { key: "unidad-ejecutora1", label: "Unidad Ejecutora 1" },
            { key: "unidad-ejecutora2", label: "Unidad Ejecutora 2" },
            { key: "unidad-ejecutora3", label: "Unidad Ejecutora 3" },
          ].map(({ key, label }) => (
            <div key={key}>
              <label>
                <input
                  type="checkbox"
                  checked={!!capasActivas[key]}
                  onChange={() => toggleCapaPrincipal(key)}
                />
                {label}
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>

  {/* Fracción IB */}
  <div className="capa-item">
    <label>
      <input
        type="checkbox"
        checked={!!capasActivas.IB}
        onChange={() => toggleCapaPrincipal("IB")}
      />
      <strong>Fracción IB</strong>
    </label>
    <div className="subcapas">
      {[
        { key: "ib2", label: "IB2" },
        { key: "ib3", label: "IB3" },
        { key: "area5", label: "IB4" },
        { key: "ib5", label: "IB5" },
        { key: "area6", label: "IB6" },
      ].map(({ key, label }) => (
        <div key={key}>
          <label>
            <input
              type="checkbox"
              checked={!!capasActivas[key]}
              onChange={() => toggleCapaPrincipal(key)}
            />
            {label}
          </label>
        </div>
      ))}
    </div>
  </div>

  {/* Fracción IG */}
  <div className="capa-item">
    <label>
      <input
        type="checkbox"
        checked={!!capasActivas.fraccionIG}
        onChange={() => toggleCapaPrincipal("fraccionIG")}
      />
      <strong>Fracción IG</strong>
    </label>
    <div className="subcapas">
      {[
        { key: "invicomontana", label: "INVICO - B° Dr Montaña" },
        { key: "parc1", label: "Parcela 1" },
        { key: "parc2", label: "Parcela 2" },
        { key: "parc3", label: "Parcela 3" },
      ].map(({ key, label }) => (
        <div key={key}>
          <label>
            <input
              type="checkbox"
              checked={!!capasActivas[key]}
              onChange={() => toggleCapaPrincipal(key)}
            />
            {label}
          </label>
        </div>
      ))}
    </div>
  </div>

  {/* Otras con subcapas */}
  <div className="capa-item">
    <label>
      <input
        type="checkbox"
        checked={!!capasActivas.otras}
        onChange={() => toggleCapaPrincipal("otras")}
      />
      <strong>Otras</strong>
    </label>
    <div className="subcapas">
      {[
        { key: "invicoresidencial", label: "Invico - Residencial" },
        { key: "invico2", label: "Invico 2" },
        { key: "area1", label: "Zona Hípico" },
        { key: "area2", label: "Zona Clubes/Gremio B/Traza" },
        { key: "area4", label: "Zona Clubes/Gremio S/Traza" },
        { key: "mensura31548Unuevo", label: "Mensura 31548-U" },
        { key: "Mensura30922U", label: "Mensura 30922-U" },
        { key: "zonapirayui", label: "Zona Pirayui" },
        { key: "zonaesperanza", label: "Zona Esperanza" },
      ].map(({ key, label }) => (
        <div key={key}>
          <label>
            <input
              type="checkbox"
              checked={!!capasActivas[key]}
              onChange={() => toggleCapaPrincipal(key)}
            />
            {label}
          </label>
        </div>
      ))}
      <div>
        <label>
          <input
            type="checkbox"
            checked={!!capasActivas["ZRU Predios La Caja"]}
            onChange={() => toggleCapaPrincipal("ZRU Predios La Caja")}
          />
          ZRU
        </label>
      </div>
      <div>
        <label>
          <input
            type="checkbox"
            checked={!!capasActivas["Planificación Sección Sur"]}
            onChange={() => toggleCapaPrincipal("Planificación Sección Sur")}
          />
          Planificación Sección Sur
        </label>
        {capasActivas["Planificación Sección Sur"] && (
          <div className="subcapas">
            {Object.keys(subCapasSur).map(nombre => (
              <div key={nombre}>
                <label>
                  <input
                    type="checkbox"
                    checked={!!subCapasSur[nombre]}
                    onChange={() => setSubCapasSur(prev => ({ ...prev, [nombre]: !prev[nombre] }))}
                  />
                  {nombre}
                </label>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  </div>

  {/* Nueva Zona */}
  <div className="capa-item">
    <label>
      <input
        type="checkbox"
        checked={!!capasActivas.nuevazona}
        onChange={() => toggleCapaPrincipal("nuevazona")}
      />
      <strong>Nueva Zona</strong>
    </label>
  </div>

</div>


                {/* PLAN ESPECIAL */}

                <div className="grupo-capas">

                    <div className="grupo-titulo">PLAN ESPECIAL <span className={`grupo-badge${planEspecialCount === 0 ? " cero" : ""}`}>{planEspecialCount}</span></div>

                    <div className="capa-item">

                        <label>

                            <input
                                type="checkbox"
                                checked={!!capasActivas["Plan Especial"]}
                                onChange={() => toggleCapaPrincipal("Plan Especial")}
                            />

                            <strong>Plan Especial</strong>

                        </label>

                        {capasActivas["Plan Especial"] && (

                            <div className="subcapas">

                                {[1, 2, 3, 4, 5].map(num => (

                                    <div key={`planespecial${num}`}>

                                        <label>

                                            <input
                                                type="checkbox"
                                                checked={!!subCapasActivas[`planespecial${num}`]}
                                                onChange={() => toggleSubCapa(`planespecial${num}`)}
                                            />

                                            Plan Especial {num}

                                        </label>

                                    </div>

                                ))}

                            </div>

                        )}

                    </div>

                </div>


                {/* OTROS */}

                <div className="grupo-capas">

                    <div className="grupo-titulo">OTROS <span className={`grupo-badge${otrosCount === 0 ? " cero" : ""}`}>{otrosCount}</span></div>


                    <div className="capa-item">
                        <label>
                            <input
                                type="checkbox"
                                checked={!!capasActivas.calleYRutas}
                                onChange={() => toggleCapaPrincipal("calleYRutas")}
                            />
                            <strong>Calle y Rutas</strong>
                        </label>
                        <div className="subcapas">
                            <div>
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={!!capasActivas.Barrios}
                                        onChange={() => toggleCapaPrincipal("Barrios")}
                                    />
                                    Calles
                                </label>
                            </div>
                            <div>
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={!!capasActivas.rutas1}
                                        onChange={() => toggleCapaPrincipal("rutas1")}
                                    />
                                    Rutas + Traza Segundo Puente Chaco-Ctes
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="capa-item">
                        <label>
                            <input
                                type="checkbox"
                                checked={!!capasActivas.zona_municipal}
                                onChange={() => toggleCapaPrincipal("zona_municipal")}
                            />
                            Zona Municipal
                        </label>
                    </div>

                    <div className="capa-item">
                        <label>
                            <input
                                type="checkbox"
                                checked={!!capasActivas.Manzanas}
                                onChange={() => toggleCapaPrincipal("Manzanas")}
                            />
                            Manzanas
                        </label>
                    </div>

                    <div className="capa-item">
                        <label>
                            <input
                                type="checkbox"
                                checked={!!capasActivas["Zonificación Sta Catalina"]}
                                onChange={() => toggleCapaPrincipal("Zonificación Sta Catalina")}
                            />
                            Zonificación
                        </label>
                    </div>


                </div>


                <hr />


                {/* REFERENCIAS */}

                <div className="capa-item">

                    <label>

                        <input
                            type="checkbox"
                            checked={verReferencias}
                            onChange={() => setVerReferencias(p => !p)}
                        />

                        Ver referencias en mapa

                    </label>

                </div>

                {/* Toggle solo mobile: barra al pie del panel */}
                <button
                    className="panel-toggle-mobile"
                    onClick={() => setPanelColapsado((p) => !p)}
                >
                    {panelColapsado ? "▼ Ver opciones" : "▲ Ver mapa completo"}
                </button>

            </div>

            {(verReferenciasTabla || verReferenciasTabla2) && (
                <div className="tabla-referencias-flotante tabla-referencias-doble">
                    {verReferenciasTabla && <TablaReferencias />}
                    {verReferenciasTabla2 && <TablaReferencias2 />}
                </div>
            )}

            {/* Toggle desktop: borde derecho del panel */}
            <button
                className="panel-toggle-btn panel-toggle-desktop"
                style={{ left: panelColapsado ? 0 : 270 }}
                onClick={() => setPanelColapsado((p) => !p)}
                title={panelColapsado ? "Mostrar panel" : "Ocultar panel"}
            >
                {panelColapsado ? "›" : "‹"}
            </button>

            <div className="mapa-area">
                <MapContainer
                    center={[-27.5298, -58.8044]}
                    zoom={14}
                    className="mapa-leaflet"
                >
                    <ZoomWatcher />
                    <MapResizer />

                    <InstanciaDelMapa setMapa={setMapa} />

                    <TileLayer
                        attribution="Map data"
                        url={
                            tipoMapa === "normal"
                                ? "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                : "https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"

                        }
                    />



                    {/* Manzanas */}
                    {capasActivas.Manzanas && geojsonData.Manzanas && (
                        <GeoJSON
                            key={`Manzanas-${geoJsonKey}`}
                            data={geojsonData.Manzanas}
                            style={(feature) => {
                                const id = feature?.properties?.id;

                                // ✅ Excepción especial SIEMPRE primero
                                if (String(id) === "5347") {
                                    return {
                                        fillColor: "yellow",
                                        color: "red",
                                        weight: 3,
                                        opacity: 1,
                                        fillOpacity: 1,
                                    };
                                }

                                // 🔄 Resto de polígonos usan la función general
                                return getStylePoligono(feature, "Manzanas");
                            }}
                            onEachFeature={crearOnEachFeature("Manzanas")}
                        />
                    )}

                    {/* Plan Especial */}
                    {Object.entries(subCapasActivas).map(
                        ([nombre, activa]) =>
                            activa &&
                            geojsonData[nombre] && (
                                <GeoJSON
                                    key={`${nombre}-${geoJsonKey}`}
                                    data={geojsonData[nombre]}
                                    style={(feature) => {
                                        const id = feature.properties?.id;
                                        const poligono = poligonosGuardados.find(
                                            (p) => String(p.id_mapa) === String(id)
                                        );

                                        const color = poligono
                                            ? coloresPorSubclasificacion[poligono.subclasificacion] || "gray"
                                            : "white";

                                        if (verPublicoPrivado) {
                                            return {
                                                fillColor: "transparent",
                                                fillOpacity: 0,
                                                color,
                                                weight: 3,
                                                opacity: 1,
                                            };
                                        }

                                        const isGray = color === "gray";
                                        return {
                                            fillColor: color,
                                            fillOpacity: 0.65,
                                            color: isGray ? "transparent" : "black",
                                            weight: isGray ? 0 : 1,
                                            opacity: isGray ? 0 : 0.5,
                                        };
                                    }}
                                    onEachFeature={crearOnEachFeature(nombre)}
                                />
                            )
                    )}

                    {/* Barrios / Calles */}
                    {capasActivas.Barrios && geojsonData.Barrios && (
                        <GeoJSON
                            key={`Barrios-${geoJsonKey}`}
                            data={geojsonData.Barrios}
                            style={() => ({
                                fillColor: "none",
                                weight: 1,
                                opacity: 1,
                                color: "white",
                                fillOpacity: 0,
                            })}
                            onEachFeature={onEachFeature}
                        />
                    )}

                    {/* Zonificación Sta Catalina */}
                    {capasActivas["Zonificación Sta Catalina"] && geojsonData["Zonificación Sta Catalina"] && (
                        <GeoJSON
                            key={`Zonificación Sta Catalina-${geoJsonKey}`}
                            data={geojsonData["Zonificación Sta Catalina"]}
                            style={(feature) => {
                                const id = feature.properties?.id;

                                const poligono = poligonosGuardados.find(
                                    (p) => String(p.id_mapa) === String(id)
                                );

                                let fillColor = "gray";
                                let fillOpacity = 0.8;

                                if (poligono) {
                                    const sub = poligono.subclasificacion;
                                    fillColor = coloresPorSubclasificacion[sub] || "gray";
                                    fillOpacity = 0.95;
                                }

                                const isGray = fillColor === "gray";
                                return {
                                    fillColor,
                                    color: isGray ? "transparent" : "black",
                                    weight: isGray ? 0 : 1,
                                    opacity: isGray ? 0 : 1,
                                    fillOpacity,
                                };
                            }}
                            onEachFeature={crearOnEachFeature("Zonificación Sta Catalina")}
                        />
                    )}

                    {/* Zona Hípico superpuesta en Zonificación */}
                    {capasActivas["Zonificación Sta Catalina"] && geojsonData.area1 && (
                        <GeoJSON
                            key={`area1-zonificacion-${geoJsonKey}`}
                            data={geojsonData.area1}
                            style={(feature) => {
                                const id = feature?.properties?.id;
                                const poligono = buscarPoligonoDB(poligonosGuardados, id, "area1");
                                const fillColor = poligono
                                    ? coloresPorSubclasificacion[poligono.subclasificacion] || "gray"
                                    : "gray";
                                return {
                                    fillColor,
                                    fillOpacity: 0.95,
                                    color: "black",
                                    weight: 1,
                                    opacity: 1,
                                };
                            }}
                            onEachFeature={crearOnEachFeature("area1")}
                        />
                    )}

                    {/* ZRU Predios La Caja */}
                    {capasActivas["ZRU Predios La Caja"] && geojsonData["ZRU Predios La Caja"] && (
                        <GeoJSON
                            key={`ZRU Predios La Caja-${geoJsonKey}`}
                            data={geojsonData["ZRU Predios La Caja"]}
                            style={{
                                fillColor: "#e05c5c",
                                fillOpacity: 0.72,
                                color: "red",
                                weight: 0.4,
                                opacity: 0.35,
                            }}
                            onEachFeature={crearOnEachFeature("ZRU Predios La Caja")}
                        />
                    )}

                    {/* Sección Sur (subcapas) */}
                    {Object.entries(subCapasSur).map(
                        ([nombre, activa]) =>
                            activa &&
                            geojsonData[nombre] && (
                                <GeoJSON
                                    key={`${nombre}-${geoJsonKey}`}
                                    data={geojsonData[nombre]}
                                    style={(feature) => {
                                        const id = feature.properties?.id;

                                        const poligono = poligonosGuardados.find(
                                            (p) => String(p.id_mapa) === String(id)
                                        );

                                        let fillColor = "white";
                                        let fillOpacity = 0.2;

                                        if (poligono) {
                                            const sub = poligono.subclasificacion;
                                            fillColor = coloresPorSubclasificacion[sub] || "gray";
                                            fillOpacity = 0.8;
                                        }

                                        const isGray2 = fillColor === "gray";
                                        return {
                                            fillColor,
                                            weight: isGray2 ? 0 : 1,
                                            opacity: isGray2 ? 0 : 0.5,
                                            color: isGray2 ? "transparent" : "black",
                                            fillOpacity,
                                        };
                                    }}
                                    onEachFeature={crearOnEachFeature(nombre)}
                                />
                            )
                    )}

                    {["area1", "area2", "zonaesperanza", "area4", "area5", "area6", "rutas1", "ic3", "ic4", "ic42", "mensura31548Unuevo", "invicoresidencial", "invico2", "invicomontana", "parc1", "parc2", "parc3", "nuevazona", "ib5", "ib2", "ib3","unidad-ejecutora1","unidad-ejecutora2","unidad-ejecutora3","unidad-ejecutora2y3","zona_municipal", "Mensura30922U", "zonapirayui"].map(
                        (nombre) => {
                            if (!capasActivas[nombre] || !geojsonData[nombre]) return null;

                            // ic4 no se pinta como capa propia; ic42 y las UE cubren sus sub-áreas
                            if (nombre === "ic4") return null;

                            // Capas de borde/outline: no deben capturar clicks para no interferir con la capa de abajo
                            if (nombre === "unidad-ejecutora2y3" || nombre === "invico2") {
                                return (
                                    <GeoJSON
                                        key={`${nombre}-${geoJsonKey}`}
                                        data={geojsonData[nombre]}
                                        style={{
                                            fillColor: "red",
                                            fillOpacity: 0.25,
                                            color: "red",
                                            weight: 1.5,
                                            opacity: 0.8,
                                        }}
                                        onEachFeature={(feature, layer) => {
                                            layer.options.interactive = false;
                                        }}
                                    />
                                );
                            }

                            // IC3 e INVICO RESIDENCIAL: fondo rojo + líneas rojas finas
                            if (nombre === "ic3" || nombre === "invicoresidencial") {
                                return (
                                    <GeoJSON
                                        key={`${nombre}-${geoJsonKey}`}
                                        data={geojsonData[nombre]}
                                        style={{
                                            fillColor: "#e05c5c",
                                            fillOpacity: 0.72,
                                            color: "red",
                                            weight: 0.4,
                                            opacity: 0.35,
                                        }}
                                        onEachFeature={crearOnEachFeature(nombre)}
                                    />
                                );
                            }

                            // 🔴 CASO ESPECIAL rutas
                            if (nombre === "rutas1") {
                                return (
                                    <GeoJSON
                                        key={`${nombre}-${geoJsonKey}`}
                                        data={geojsonData[nombre]}
                                        style={{
                                            fillColor: "red",
                                            fillOpacity: 0.15,
                                            color: "red",
                                            weight: 2,
                                            opacity: 1,
                                        }}
                                        onEachFeature={crearOnEachFeature(nombre)}
                                    />
                                );
                            }

                            return (
                                <GeoJSON
                                    key={`${nombre}-${geoJsonKey}`}
                                    data={geojsonData[nombre]}
                                    style={(feature) => {

                                        if (nombre === "zona_municipal") {
                                            return {
                                                fillColor: "#4a7c4e",
                                                fillOpacity: 0.72,
                                                color: "#2a4a2e",
                                                weight: 3,
                                                opacity: 1,
                                            };
                                        }

                                        if (["unidad-ejecutora1", "unidad-ejecutora2", "unidad-ejecutora3"].includes(nombre)) {
                                            const id = feature?.properties?.id;
                                            const poligono = buscarPoligonoDB(poligonosGuardados, id, nombre);
                                            const bordeUE = { color: "rgba(0,0,0,0.55)", weight: 0.5, opacity: zoomActual >= 15 ? 0.6 : 0 };

                                            // UE1: colores por subclasificación de zonificación
                                            if (nombre === "unidad-ejecutora1") {
                                                if (!poligono) return { fillColor: "#cccccc", fillOpacity: 0.35, ...bordeUE };
                                                const fillColor = coloresPorSubclasificacion[poligono.subclasificacion] || "#cccccc";
                                                return { fillColor, fillOpacity: 0.72, ...bordeUE };
                                            }

                                            // UE2/3: colores por disponibilidad (privado)
                                            if (poligono?.privado === "reserva municipal")
                                                return { fillColor: "#e08c3a", fillOpacity: 0.72, color: "#e08c3a", weight: 0.4, opacity: 0.35 };
                                            if (poligono?.privado === "equipamiento publico")
                                                return { fillColor: "#d4c83a", fillOpacity: 0.72, color: "#d4c83a", weight: 0.4, opacity: 0.35 };
                                            if (poligono?.privado === "privado")
                                                return { fillColor: "#e05c5c", fillOpacity: 0.72, color: "red", weight: 0.4, opacity: 0.35 };
                                            if (poligono?.privado === "publico")
                                                return { fillColor: "#5db862", fillOpacity: 0.72, color: "green", weight: 0.4, opacity: 0.35 };
                                            return { fillColor: "#5db862", fillOpacity: 0.72, color: "green", weight: 0.4, opacity: 0.35 };
                                        }

                                        if (nombre === "unidad-ejecutora2y3" || nombre === "invico2") {
                                            return {
                                                fillColor: "white",
                                                fillOpacity: 0.18,
                                                color: "transparent",
                                                weight: 0,
                                                opacity: 0,
                                                interactive: false,
                                            };
                                        }

                                        const id = feature?.properties?.id;

                                        const poligono = buscarPoligonoDB(poligonosGuardados, id, nombre);

                                        const borde = { color: "rgba(0,0,0,0.55)", weight: 1.5, opacity: 1 };
                                        const bordeRojo = { color: "red", weight: 0.4, opacity: 0.35 };

                                        // 🔴 no existe
                                        if (!poligono) {
                                            return { fillColor: "#e05c5c", fillOpacity: 0.72, ...bordeRojo };
                                        }

                                        // 🟠 reserva municipal
                                        if (poligono.privado === "reserva municipal") {
                                            return { fillColor: "#e08c3a", fillOpacity: 0.72, color: "#e08c3a", weight: 0.4, opacity: 0.35 };
                                        }

                                        // 🟡 equipamiento publico
                                        if (poligono.privado === "equipamiento publico") {
                                            return { fillColor: "#d4c83a", fillOpacity: 0.72, color: "#d4c83a", weight: 0.4, opacity: 0.35 };
                                        }

                                        // 🔴 privado
                                        if (poligono.privado === "privado") {
                                            return { fillColor: "#e05c5c", fillOpacity: 0.72, ...bordeRojo };
                                        }

                                        // 🟢 publico
                                        if (poligono.privado === "publico") {
                                            return { fillColor: "#5db862", fillOpacity: 0.72, color: "green", weight: 0.4, opacity: 0.35 };
                                        }

                                        return {
                                            fillColor: "#9e9e9e",
                                            fillOpacity: 0.9,
                                            color: "black",
                                            weight: 3,
                                            opacity: 1,
                                        };
                                    }}
                                    onEachFeature={crearOnEachFeature(nombre)}
                                />
                            );
                        }
                    )}
                    {/* Pines de "vendido" sobre UE1 */}
                    {capasActivas["unidad-ejecutora1"] && geojsonData["unidad-ejecutora1"] && zoomActual >= 17 &&
                        geojsonData["unidad-ejecutora1"].features.map((feature) => {
                            const id = feature?.properties?.id;
                            const poligono = buscarPoligonoDB(poligonosGuardados, id, "unidad-ejecutora1");
                            if (!poligono || !esVendido(poligono.vendido)) return null;
                            const center = getCentroideAproximado(feature.geometry);
                            if (!center) return null;
                            return (
                                <Marker
                                    key={`vendido-ue1-${id}-${geoJsonKey}`}
                                    position={center}
                                    interactive={false}
                                    icon={L.divIcon({
                                        className: "",
                                        html: `<div style="font-size:18px;line-height:1;filter:drop-shadow(0 1px 2px rgba(0,0,0,0.6))">📌</div>`,
                                        iconSize: [20, 20],
                                        iconAnchor: [10, 20],
                                    })}
                                />
                            );
                        })
                    }

                   {capasActivas.judicializados &&
    geojsonData.judicializados && (
        <GeoJSON
            key={`judicializados-${geoJsonKey}`}
            pane="judicializadosPane"
            data={geojsonData.judicializados}
            style={{
                fillOpacity: 0,
                fillColor: "transparent",
                color: "#ffff00",
                weight: 6,
                opacity: 1,
            }}
        />
)}
                {zoomActual >= 15 && (
                    <EtiquetasPoligonos
                        geojsonData={geojsonData}
                        poligonosGuardados={poligonosGuardados}
                        capasActivas={capasActivas}
                        subCapasActivas={subCapasActivas}
                        subCapasSur={subCapasSur}
                        mostrarEtiquetas={mostrarEtiquetas}
                        zoomActual={zoomActual}
                    />
                )}
                </MapContainer>
            </div>


            {modalDetalleAbierto && (
                <div className="sc-modalOverlay" onClick={() => setModalDetalleAbierto(false)}>
                    <div className="sc-modalCard" onClick={(e) => e.stopPropagation()}>
                        <div className="sc-modalHeader">
                            <div>
                                <div className="sc-modalTitle">Detalle de zona</div>
                            </div>

                            <button
                                className="sc-iconBtn"
                                onClick={() => setModalDetalleAbierto(false)}
                                aria-label="Cerrar"
                                title="Cerrar"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="sc-modalBody">
                            {datosZonaSeleccionada?.judicializado === "Si" && (
                                <div className="judicializado-warning">
                                    <span className="judicializado-warning-icon">⚠</span>
                                    Este polígono tiene un juicio en trámite
                                </div>
                            )}
                            {datosZonaSeleccionada ? (
                                <div className="sc-grid2">
                                    <div className="sc-infoItem">
                                        <div className="sc-infoLabel">Dato</div>
                                        <div className="sc-infoValue">{datosZonaSeleccionada.dato1 || "-"}</div>
                                    </div>

                                    <div className="sc-infoItem">
                                        <div className="sc-infoLabel">Subclasificación</div>
                                        <div className="sc-infoValue">{datosZonaSeleccionada.subclasificacion || "-"}</div>
                                    </div>

                                    <div className="sc-infoItem sc-span2">
                                        <div className="sc-infoLabel">Descripción</div>
                                        <div className="sc-infoValue">{datosZonaSeleccionada.descripcion || "-"}</div>
                                    </div>
                                    <div className="sc-infoItem">
                                        <div className="sc-infoLabel">Estado</div>
                                        <div className="sc-infoValue">
                                            {datosZonaSeleccionada.privado === "publico" && (
                                                <span className="disponibilidad-pill pill-verde">● Disponible</span>
                                            )}
                                            {datosZonaSeleccionada.privado === "privado" && (
                                                <span className="disponibilidad-pill pill-rojo">● No disponible</span>
                                            )}
                                            {datosZonaSeleccionada.privado === "reserva municipal" && (
                                                <span className="disponibilidad-pill pill-naranja">● Reserva municipal</span>
                                            )}
                                            {datosZonaSeleccionada.privado === "equipamiento publico" && (
                                                <span className="disponibilidad-pill pill-amarillo">● Equipamiento público</span>
                                            )}
                                            {!datosZonaSeleccionada.privado && (
                                                <span className="disponibilidad-pill pill-gris">— Sin definir</span>
                                            )}
                                        </div>
                                    </div>
                                    {nombreCapaSeleccionada === "unidad-ejecutora1" && (
                                        <div className="sc-infoItem">
                                            <div className="sc-infoLabel">Vendido</div>
                                            <div className="sc-infoValue">
                                                {esVendido(datosZonaSeleccionada.vendido)
                                                    ? <span className="disponibilidad-pill pill-rojo">📌 Vendido</span>
                                                    : <span className="disponibilidad-pill pill-gris">— No vendido</span>
                                                }
                                            </div>
                                        </div>
                                    )}
                                    {esAreaEspecial && (
                                        <>
                                            {/* Fila 1: Nombre + CUIL/CUIT (en sc-grid2 = 2 cols) */}


                                            {/* Fila 2: 3 columnas dentro de una fila que ocupa 2 columnas del grid principal */}
                                            <div className="sc-span2" style={{ width: "100%" }}>
                                                <div
                                                    style={{
                                                        display: "grid",
                                                        gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                                                        gap: 12,
                                                    }}
                                                >
                                                    <div className="sc-infoItem" style={{ margin: 0 }}>
                                                        <div className="sc-infoLabel">Superficie</div>
                                                        <div className="sc-infoValue">{datosZonaSeleccionada.superficie || "-"}</div>
                                                    </div>

                                                    <div className="sc-infoItem" style={{ margin: 0 }}>
                                                        <div className="sc-infoLabel">Mensura</div>
                                                        <div className="sc-infoValue">{datosZonaSeleccionada.mensura || "-"}</div>
                                                    </div>

                                                    <div className="sc-infoItem" style={{ margin: 0 }}>
                                                        <div className="sc-infoLabel">Adrema</div>
                                                        <div className="sc-infoValue">{datosZonaSeleccionada.adrema || "-"}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ) : (
                                <div className="sc-emptyState">
                                    <div className="sc-emptyTitle">Sin información cargada</div>
                                    <div className="sc-emptyText">Todavía no hay datos guardados para esta zona.</div>
                                </div>
                            )}
                        </div>

                        <div className="sc-modalFooter">
                            <button className="sc-btn sc-btnGhost" onClick={() => setModalDetalleAbierto(false)}>
                                Cerrar
                            </button>

                            <button
                                className="sc-btn sc-btnPrimary"
                                onClick={() => {
                                    setModalDetalleAbierto(false);
                                    setModalAbierto(true);
                                }}
                            >
                                Agregar / Editar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {modalAbierto && (
                <div className="sc-modalOverlay" onClick={() => setModalAbierto(false)}>
                    <div className="sc-modalCard" onClick={(e) => e.stopPropagation()}>
                        <div className="sc-modalHeader">
                            <div>
                                <div className="sc-modalTitle">Agregar / Editar información</div>
                                <div className="sc-modalSubtitle">
                                    <span className="sc-badge">ID {idSeleccionado}</span>
                                    <span className="sc-dot">•</span>
                                    <span className="sc-muted">{nombreCapaSeleccionada || "Capa"}</span>
                                </div>
                            </div>

                            <button className="sc-iconBtn" onClick={() => setModalAbierto(false)} aria-label="Cerrar" title="Cerrar">
                                ✕
                            </button>
                        </div>

                        <div className="sc-modalBody">
                            <div className="sc-formGrid">
                                <div className="sc-field">
                                    <label className="sc-label">Dato</label>
                                    <input
                                        className="sc-input"
                                        type="text"
                                        value={texto}
                                        onChange={(e) => setTexto(e.target.value)}
                                        placeholder="Ej: Hípico"
                                    />
                                </div>

                                <div className="sc-field">
                                    <label className="sc-label">Subclasificación</label>
                                    <select className="sc-select" value={subclasificacion} onChange={(e) => setSubclasificacion(e.target.value)}>
                                        <option value="">Selecciona una opción</option>
                                        {opcionesSubclasificacion.map((opcion, index) => (
                                            <option key={index} value={opcion}>
                                                {opcion}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="sc-field">
                                    <label className="sc-label">Disponible/No disponible</label>
                                    <select
                                        className="sc-select"
                                        value={privado}
                                        onChange={(e) => setPrivado(e.target.value)}
                                    >
                                        <option value="">Selecciona una opción</option>

                                        <option value="publico">
                                            Disponible
                                        </option>

                                        <option value="privado">
                                            No disponible
                                        </option>

                                        <option value="reserva municipal">
                                            Reserva municipal
                                        </option>

                                        <option value="equipamiento publico">
                                            Equipamiento público
                                        </option>

                                    </select>
                                </div>
                                <div className="sc-field">
                                    <label className="sc-label">Judicializado</label>
                                    <select className="sc-select" value={judicializado} onChange={(e) => setJudicializado(e.target.value)}>
                                        <option value="">Selecciona una opción</option>

                                        <option value={"No"}>
                                            No
                                        </option>
                                        <option value={"Si"}>
                                            Si
                                        </option>
                                    </select>
                                </div>
                                <div className="sc-field sc-span2">
                                    <label className="sc-label">Descripción</label>
                                    <input
                                        className="sc-input"
                                        type="text"
                                        value={descripcion}
                                        onChange={(e) => setDescripcion(e.target.value)}
                                        placeholder="Breve descripción…"
                                    />
                                </div>
                            </div>
                            {/* ✅ REORDENADO SOLO FRONTEND (layout) */}

                            {/* Fila 2: Superficie + Mensura + Adrema (3 columnas) */}
                            <div
                                className="sc-formGrid"
                                style={{ gridTemplateColumns: "repeat(3, 1fr)" }}
                            >
                                <div className="sc-field">
                                    <label className="sc-label">Superficie</label>
                                    <input
                                        className="sc-input"
                                        value={superficie}
                                        onChange={(e) => setSuperficie(e.target.value)}
                                    />
                                </div>

                                <div className="sc-field">
                                    <label className="sc-label">Mensura</label>
                                    <input
                                        className="sc-input"
                                        value={mensura}
                                        onChange={(e) => setMensura(e.target.value)}
                                    />
                                </div>

                                <div className="sc-field">
                                    <label className="sc-label">Adrema</label>
                                    <input
                                        className="sc-input"
                                        value={adrema}
                                        onChange={(e) => setAdrema(e.target.value)}
                                    />
                                </div>
                            </div>
                            {nombreCapaSeleccionada === "unidad-ejecutora1" && (
                                <div className="sc-field sc-span2" style={{ marginTop: 8 }}>
                                    <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontWeight: 600, fontSize: 13 }}>
                                        <input
                                            type="checkbox"
                                            checked={vendido}
                                            onChange={(e) => setVendido(e.target.checked)}
                                            style={{ width: 16, height: 16, accentColor: "#e05c5c", cursor: "pointer" }}
                                        />
                                        <span>📌 Vendido</span>
                                        <span style={{ fontWeight: 400, color: "#888", fontSize: 12 }}>(marca el lote con un pin en el mapa)</span>
                                    </label>
                                </div>
                            )}

                            <div className="sc-hint">
                                Se guardará asociado a <b>{nombreCapaSeleccionada}</b> con ID <b>{idSeleccionado}</b>.
                            </div>
                        </div>

                        <div className="sc-modalFooter">
                            <button
                                className="sc-btn sc-btnGhost"
                                onClick={() => {
                                    setModalAbierto(false);
                                    setModalDetalleAbierto(true);
                                }}
                            >
                                Volver
                            </button>

                            <button
                                className="sc-btn sc-btnPrimary"
                                onClick={async () => {
                                    try {
                                        console.log("Guardando:", {
                                            id_mapa: idSeleccionado,
                                            dato1: texto,
                                            descripcion,
                                            subclasificacion,
                                            capa: nombreCapaSeleccionada,
                                        });
                                        await serviciolotes.guardarpoligono({
                                            id_mapa: String(idSeleccionado),
                                            dato1: texto,
                                            descripcion,
                                            subclasificacion,
                                            capa: nombreCapaSeleccionada,
                                            privado,
                                            adrema,
                                            superficie,
                                            judicializado,
                                            mensura,
                                            vendido,
                                        });



                                        const nuevos = await serviciolotes.poligonosguardados();
                                        setPoligonosGuardados(nuevos);
                                        setGeoJsonKey((k) => k + 1);

                                        const actualizado = buscarPoligonoDB(nuevos, idSeleccionado, nombreCapaSeleccionada);
                                        setDatosZonaSeleccionada(actualizado);

                                        setModalAbierto(false);
                                        setModalDetalleAbierto(true);
                                    } catch (err) {
                                        console.error("Error guardando polígono:", err);
                                        alert("No se pudo guardar. Revisá la consola (Network/Console) para ver el error.");
                                    }
                                }}

                            >
                                Guardar cambios
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MapaConCapas;
