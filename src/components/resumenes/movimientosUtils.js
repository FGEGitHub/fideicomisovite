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

// La fecha viene en dos formatos según el origen del movimiento:
//  - "AAAA-MM-DD ..." (ISO, sin ambigüedad) para los registros que vienen directo de la base.
//  - ".../.../AAAA" para los importados desde Excel, en formato ARGENTINO (DD/MM/AAAA)
//    — confirmado contra los extractos reales del Banco Hipotecario (ej. "8/6/2026" es
//    el 8 de junio, no el 6 de agosto). Si el "mes" asumido da inválido pero el otro
//    número sí es un mes válido, se invierten (cubre los pocos registros que vinieran
//    en MM/DD).
const invertirSiMesInvalido = (primero, segundo) => {
  let dia = primero;
  let mes = segundo;
  if (Number(mes) > 12 && Number(dia) >= 1 && Number(dia) <= 12) {
    [dia, mes] = [mes, dia];
  }
  return { dia, mes };
};

export const parseFechaCorta = (fecha) => {
  if (!fecha) return { dia: "-", mes: "-", anio: "-" };
  const limpia = String(fecha).split(" ")[0];
  if (limpia.includes("-")) {
    const [anio, mes, dia] = limpia.split("-");
    return { dia, mes, anio };
  }
  if (limpia.includes("/")) {
    const [primero, segundo, anio] = limpia.split("/");
    const { dia, mes } = invertirSiMesInvalido(primero, segundo);
    return { dia, mes, anio };
  }
  return { dia: "-", mes: "-", anio: "-" };
};

export const valorFecha = (fecha) => {
  if (!fecha) return 0;
  const limpia = String(fecha).replace("T", " ").split(".")[0];
  if (limpia.includes("-")) return new Date(limpia).getTime();
  if (limpia.includes("/")) {
    const [primero, segundo, anio] = limpia.split(" ")[0].split("/");
    const { dia, mes } = invertirSiMesInvalido(primero, segundo);
    return new Date(`${anio}-${mes}-${dia}`).getTime();
  }
  return 0;
};

// Reemplazo de `new Date(mov.fecha)`: el constructor nativo de Date asume
// MM/DD/AAAA para fechas con "/", lo que rompe los registros importados de
// Excel (formato argentino DD/MM/AAAA). Usar esto en vez de `new Date(...)`
// en cualquier lado que agrupe/filtre movimientos por mes o rango de fechas.
export const aFechaValida = (fecha) => new Date(valorFecha(fecha));

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
