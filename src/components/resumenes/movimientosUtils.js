// Helpers compartidos entre carga.jsx, tablamovimientos.jsx y MovimientosDashboard.jsx
// para que el filtro de la tabla y las tarjetas de KPIs siempre miren exactamente
// los mismos datos.

export const FILTROS_INICIALES = {
  tipo: "",
  mes: "",
  anio: "",
  concepto: "",
  cuit: "",
  fecha: "",
};

export const hayFiltrosActivos = (filtros) =>
  Object.values(filtros).some((valor) => Boolean(valor));

// La fecha viene como "AAAA-MM-DD ..." o "DD/MM/AAAA ...", según el origen del movimiento.
export const parseFechaCorta = (fecha) => {
  if (!fecha) return { dia: "-", mes: "-", anio: "-" };
  const limpia = String(fecha).split(" ")[0];
  if (limpia.includes("-")) {
    const [anio, mes, dia] = limpia.split("-");
    return { dia, mes, anio };
  }
  if (limpia.includes("/")) {
    const [dia, mes, anio] = limpia.split("/");
    return { dia, mes, anio };
  }
  return { dia: "-", mes: "-", anio: "-" };
};

export const valorFecha = (fecha) => {
  if (!fecha) return 0;
  const limpia = String(fecha).replace("T", " ").split(".")[0];
  if (limpia.includes("-")) return new Date(limpia).getTime();
  if (limpia.includes("/")) {
    const [dia, mes, anio] = limpia.split(" ")[0].split("/");
    return new Date(`${anio}-${mes}-${dia}`).getTime();
  }
  return 0;
};

// El backend puede devolver el mismo movimiento más de una vez (ej. reimportaciones de Excel).
export const deduplicarMovimientos = (lista) => {
  const vistos = new Set();

  return lista.filter((m) => {
    const key = [
      String(m.fecha || "").replace("T", " ").split(".")[0].split(" ")[0].trim(),
      String(m.cuil_cuit || "").trim(),
      Number(m.debito || 0).toFixed(2),
      Number(m.credito || 0).toFixed(2),
      String(m.descripcion || "").trim().toLowerCase(),
      String(m.nombre_razon || "").trim().toLowerCase(),
    ].join("|");

    if (vistos.has(key)) return false;
    vistos.add(key);
    return true;
  });
};

// Mismo criterio de filtrado que usaba la tabla: se centraliza acá para que
// las tarjetas de KPIs reflejen exactamente lo que la tabla está mostrando.
export const filtrarMovimientos = (movimientos, filtros) =>
  movimientos.filter((m) => {
    const fecha = parseFechaCorta(m.fecha);

    const coincideTipo =
      !filtros.tipo ||
      (filtros.tipo === "INGRESO" && Number(m.credito) > 0) ||
      (filtros.tipo === "EGRESO" && Number(m.debito) > 0);

    const coincideMes = !filtros.mes || fecha.mes === filtros.mes;
    const coincideAnio = !filtros.anio || fecha.anio === filtros.anio;

    const coincideCuit =
      !filtros.cuit || (m.cuil_cuit || "").toString().includes(filtros.cuit);

    const coincideFecha =
      !filtros.fecha || valorFecha(m.fechacarga) === valorFecha(filtros.fecha);

    const coincideConcepto =
      !filtros.concepto || (m.concepto || "") === filtros.concepto;

    return (
      coincideTipo &&
      coincideMes &&
      coincideAnio &&
      coincideCuit &&
      coincideFecha &&
      coincideConcepto
    );
  });
