import React, { useState } from "react";
import servicionivel3 from "../../services/nivel3";
import { useTemaColores } from "../../context/ModoOscuroContext";

const headerGradient =
  "linear-gradient(90deg, #0a3b4f 0%, #0b4f6c 55%, #148D8D 100%)";

const crearEstilos = (c) => ({
  seccion: {
    background: c.BG_CARD,
    borderRadius: 22,
    marginBottom: 22,
    boxShadow: c.SHADOW_CARD,
    border: `1px solid ${c.BORDER}`,
    overflow: "hidden",
  },

  seccionHeader: {
    background: headerGradient,
    padding: "16px 20px",
    color: "#fff",
  },

  seccionBody: {
    padding: 20,
    color: c.TEXT_FUERTE,
  },

  subtitulo: {
    margin: 0,
    fontSize: 22,
    fontWeight: 800,
    color: "#ffffff",
  },

  dropzone: {
    border: `2px dashed ${c.BORDER_INPUT}`,
    borderRadius: 16,
    padding: 30,
    textAlign: "center",
    background: c.BG_INPUT,
    cursor: "pointer",
    transition: "0.2s",
  },

  kpis: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px,1fr))",
    gap: 16,
    marginTop: 20,
  },

  kpiCard: {
    background: c.BG_INPUT,
    borderRadius: 16,
    padding: 16,
    border: `1px solid ${c.BORDER}`,
    boxShadow: c.SHADOW_CARD,
    position: "relative",
  },

  kpiAccent: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 5,
  },

  kpiLabel: {
    fontSize: 13,
    color: c.TEXT_MUTED,
    fontWeight: 700,
  },

  kpiValue: {
    fontSize: 28,
    fontWeight: 800,
    marginTop: 8,
    color: c.TEXT_FUERTE,
  },
});

export default function SubirExcelMovimientos({ onSuccess }) {
  const colores = useTemaColores();
  const styles = crearEstilos(colores);

  const [archivo, setArchivo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [progreso, setProgreso] = useState(0);

  const handleDrop = (e) => {
    e.preventDefault();
    setArchivo(e.dataTransfer.files[0]);
  };

  const handleSubmit = async () => {
    if (!archivo) return alert("Seleccioná un archivo");

    setLoading(true);
    setProgreso(10);

    try {
      const formData = new FormData();
      formData.append("file", archivo);

      const interval = setInterval(() => {
        setProgreso((p) => (p < 90 ? p + 10 : p));
      }, 200);

      const resp = await servicionivel3.subirexceldemovimientos(formData);

      clearInterval(interval);
      setProgreso(100);

      setResultado(resp);
      setArchivo(null);
      onSuccess?.();
    } catch (e) {
      alert("Error");
    }

    setLoading(false);
  };

  const duplicadosExcel =
    resultado?.duplicados_detalle?.filter((d) => d.tipo === "EXCEL") || [];

  const duplicadosBD =
    resultado?.duplicados_detalle?.filter((d) => d.tipo === "BD") || [];

  return (
    <div>
      
     

      {/* BODY */}
      <div style={styles.seccionBody}>

        {/* DROPZONE */}
        <div
          style={styles.dropzone}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          <div style={{ fontWeight: 700 }}>
            {archivo ? archivo.name : "Arrastrá tu Excel o hacé click"}
          </div>

         <div
  style={{
    marginTop: 14,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    flexWrap: "wrap",
  }}
>
 <label
  style={{
    background: "transparent",
    color: "#14919B",

    borderRadius: "5px",
    border: "1.5px solid #9fd4d7",

    fontWeight: 700,
    fontSize: "13px",

    minWidth: 130,
    height: 25,

    padding: "0 16px",

    display: "flex",
    alignItems: "center",
    justifyContent: "center",

    cursor: "pointer",

    transition: "0.2s",
  }}

  onMouseOver={(e) => {
    e.currentTarget.style.background =
      "rgba(20,145,155,0.08)";
  }}

  onMouseOut={(e) => {
    e.currentTarget.style.background =
      "transparent";
  }}
>
    Seleccionar archivo

    <input
      type="file"
      hidden
      onChange={(e) =>
        setArchivo(e.target.files[0])
      }
    />
  </label>

  <span
    style={{
      fontSize: 13,
      color: colores.TEXT_MUTED,
      fontWeight: 500,
    }}
  >
    {archivo
      ? archivo.name
      : "Ningún archivo seleccionado"}
  </span>
</div>
</div>
        {/* PROGRESO */}
        {loading && (
          <div style={{ marginTop: 15 }}>
            <div
              style={{
                height: 8,
                borderRadius: 6,
                background: colores.BORDER_INPUT,
              }}
            >
              <div
                style={{
                  width: progreso + "%",
                  height: "100%",
                  background: "#148D8D",
                  borderRadius: 6,
                  transition: "0.2s",
                }}
              />
            </div>
            <div style={{ fontSize: 12, marginTop: 5 }}>
              Procesando {progreso}%
            </div>
          </div>
        )}

        {/* BOTÓN */}
<button
  onClick={handleSubmit}
  disabled={loading}
  style={{
    marginTop: 20,

    background: "#14919B",
    color: "#fff",

    borderRadius: "10px",
    border: "none",

    fontWeight: 700,
    fontSize: "13px",

    minWidth: 140,
    width: "fit-content",
    height: 34,

    padding: "0 16px",

    display: "flex",
    alignItems: "center",
    justifyContent: "center",

    cursor: "pointer",

    boxShadow: "none",

    marginLeft: "auto",
    marginRight: "auto",

    transition: "0.2s",
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.background =
      "#117C85";
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.background =
      "#14919B";
  }}
>
  {loading ? "Subiendo..." : "Subir Excel"}
</button>

        {/* KPIs */}
        {resultado && (
          <div style={styles.kpis}>
            <KPI label="Total" value={resultado.total} color="#148D8D" />
            <KPI label="Insertados" value={resultado.insertados} color="#22C55E" />
            <KPI label="Duplicados" value={resultado.duplicados} color="#EF4444" />
          </div>
        )}

        {/* DUPLICADOS */}
        <Modulo titulo="Duplicados BD" data={duplicadosBD} />
        <Modulo titulo="Duplicados Excel" data={duplicadosExcel} />

      </div>
    </div>
  );
}

/* KPI */
function KPI({ label, value, color }) {
  const styles = crearEstilos(useTemaColores());

  return (
    <div style={styles.kpiCard}>
      <div style={{ ...styles.kpiAccent, background: color }} />
      <div style={styles.kpiLabel}>{label}</div>
      <div style={styles.kpiValue}>{value}</div>
    </div>
  );
}

/* LISTA */
function Modulo({ titulo, data }) {
  const colores = useTemaColores();

  if (!data.length) return null;

  return (
    <div style={{ marginTop: 20 }}>
      <strong>{titulo} ({data.length})</strong>

      <div
        style={{
          maxHeight: 200,
          overflow: "auto",
          marginTop: 8,
          border: `1px solid ${colores.BORDER}`,
          borderRadius: 10,
          background: colores.BG_INPUT,
        }}
      >
        {data.map((d, i) => (
          <div key={i} style={{ padding: 8, borderBottom: `1px solid ${colores.BORDER}` }}>
            <strong>{d.fecha}</strong> | {d.cuit} | ${d.monto}
            <div style={{ fontSize: 12 }}>{d.descripcion}</div>
          </div>
        ))}
      </div>
    </div>
  );
}