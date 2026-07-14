import React, { useEffect, useRef, useState } from "react";
import servicionivel3 from "../../services/nivel3";
import { useTemaColores } from "../../context/ModoOscuroContext";

export default function DashboardFinanciero() {

const colores = useTemaColores();
const styles = crearEstilos(colores);

const barRef = useRef(null);
const ingresosRef = useRef(null);
const gastosRef = useRef(null);

const COLORS = [
"#4fc3f7","#818cf8","#a78bfa","#f472b6",
"#f59e0b","#22c55e","#ef4444"
];

const [kpis,setKpis] = useState({
  ingresos:0,
  gastos:0,
  resultado:0,
  rentabilidad:0
});

const [ingresosCat,setIngresosCat] = useState([]);
const [gastosCat,setGastosCat] = useState([]);
const [movimientos,setMovimientos] = useState([]);

const [filtro,setFiltro] = useState({
  tipo:"todos", // 🔥 arranca mostrando todo
  mes:new Date().getMonth()+1,
  anio:new Date().getFullYear(),
  desde:"",
  hasta:""
});

/* ================= INIT ================= */

useEffect(()=>{
  traerDatos();
},[]);

useEffect(()=>{

  if(movimientos.length === 0) return;

  const filtrados = filtrarMovimientos();
  procesarDatos(filtrados);

},[movimientos,filtro,colores]);

/* ================= DATOS ================= */

const traerDatos = async () => {
  const resp = await servicionivel3.traermovimientos();
  setMovimientos(resp);
};

const filtrarMovimientos = () => {

  return movimientos.filter(mov=>{

    if(!mov.fecha) return false;

    if(filtro.tipo === "todos") return true;

    const fecha = new Date(mov.fecha);

    const mes = fecha.getMonth()+1;
    const anio = fecha.getFullYear();

    if(filtro.tipo === "mes"){
      return mes === Number(filtro.mes) && anio === Number(filtro.anio);
    }

    if(filtro.tipo === "anio"){
      return anio === Number(filtro.anio);
    }

    if(filtro.tipo === "rango"){
      if(!filtro.desde || !filtro.hasta) return true;

      const fDesde = new Date(filtro.desde);
      const fHasta = new Date(filtro.hasta);

      return fecha >= fDesde && fecha <= fHasta;
    }

    return true;

  });

};

const procesarDatos = (data) => {

  let ingresos = 0;
  let gastos = 0;

  const ing = {};
  const gas = {};

  data.forEach(mov=>{

    const c = Number(mov.credito)||0;
    const d = Number(mov.debito)||0;

    const concepto = mov.concepto || "Otros";

    ingresos += c;
    gastos += d;

    if(c>0){
      if(!ing[concepto]) ing[concepto]=0;
      ing[concepto]+=c;
    }

    if(d>0){
      if(!gas[concepto]) gas[concepto]=0;
      gas[concepto]+=d;
    }

  });

  const resultado = ingresos - gastos;
  const rentabilidad = ingresos>0 ? ((resultado/ingresos)*100).toFixed(2) : 0;

  const ingresosArray = Object.keys(ing).map(k=>({ tipo:k, valor:ing[k] }));
  const gastosArray = Object.keys(gas).map(k=>({ tipo:k, valor:gas[k] }));

  setKpis({ ingresos, gastos, resultado, rentabilidad });
  setIngresosCat(ingresosArray);
  setGastosCat(gastosArray);

  setTimeout(()=>{
    drawBars(ingresos,gastos,resultado);
    drawDonut(ingresosRef.current, ingresosArray);
    drawDonut(gastosRef.current, gastosArray);
  },200);
};

/* ================= GRAFICOS ================= */

function drawBars(ingresos,gastos,resultado){

const canvas = barRef.current;
if(!canvas) return;

const ctx = canvas.getContext("2d");
ctx.clearRect(0,0,400,260);

ctx.strokeStyle=colores.GRID_STROKE;

for(let i=0;i<5;i++){
  let y = 220 - i*40;
  ctx.beginPath();
  ctx.moveTo(40,y);
  ctx.lineTo(360,y);
  ctx.stroke();
}

const data = [
  {label:"Ingresos", value:ingresos, color:"#22c55e"},
  {label:"Egresos", value:gastos, color:"#ef4444"},
  {label:"Resultado", value:resultado, color:"#4fc3f7"}
];

const max = Math.max(...data.map(d=>d.value),1);

data.forEach((d,i)=>{

  const x = 70 + i*100;
  const h = (d.value/max)*160;
  const y = 220 - h;

  ctx.fillStyle=d.color;
  ctx.fillRect(x,y,50,h);

  ctx.fillStyle=colores.TOOLTIP_TEXT;
  ctx.font="bold 12px Arial";
  ctx.textAlign="center";
  ctx.fillText("$"+Math.round(d.value).toLocaleString(),x+25,y-5);
  ctx.fillText(d.label,x+25,240);

});

}

function drawDonut(canvas,data){

if(!canvas) return;

const ctx = canvas.getContext("2d");
ctx.clearRect(0,0,300,300);

const total = data.reduce((a,b)=>a+b.valor,0);
if(total === 0) return;

let start = 0;

data.forEach((item,i)=>{

  const slice = (item.valor/total)*Math.PI*2;

  ctx.beginPath();
  ctx.moveTo(150,150);
  ctx.arc(150,150,120,start,start+slice);
  ctx.closePath();

  ctx.fillStyle = COLORS[i % COLORS.length];
  ctx.fill();

  start+=slice;

});

ctx.beginPath();
ctx.arc(150,150,70,0,Math.PI*2);
ctx.fillStyle=colores.BG_CARD;
ctx.fill();

ctx.fillStyle=colores.TOOLTIP_TEXT;
ctx.font="bold 16px Arial";
ctx.textAlign="center";
ctx.fillText("$"+Math.round(total).toLocaleString(),150,155);

}

/* ================= UI ================= */

return(
<div style={styles.container}>

<h2 style={styles.title}>Panel Financiero</h2>

{/* FILTROS */}
<div style={styles.filtros}>

<select
  style={styles.filtroInput}
  value={filtro.tipo}
  onChange={e=>setFiltro({...filtro,tipo:e.target.value})}
>
  <option value="todos">Todos</option>
  <option value="mes">Mes</option>
  <option value="anio">Año</option>
  <option value="rango">Rango</option>
</select>

{filtro.tipo === "mes" && (
<>
<input style={styles.filtroInput} type="number" value={filtro.mes}
onChange={e=>setFiltro({...filtro,mes:e.target.value})}/>
<input style={styles.filtroInput} type="number" value={filtro.anio}
onChange={e=>setFiltro({...filtro,anio:e.target.value})}/>
</>
)}

{filtro.tipo === "anio" && (
<input style={styles.filtroInput} type="number" value={filtro.anio}
onChange={e=>setFiltro({...filtro,anio:e.target.value})}/>
)}

{filtro.tipo === "rango" && (
<>
<input style={styles.filtroInput} type="date" value={filtro.desde}
onChange={e=>setFiltro({...filtro,desde:e.target.value})}/>
<input style={styles.filtroInput} type="date" value={filtro.hasta}
onChange={e=>setFiltro({...filtro,hasta:e.target.value})}/>
</>
)}

</div>

{/* KPIs */}
<div style={styles.kpis}>
<Kpi titulo="Ingresos" valor={kpis.ingresos} color="#22c55e"/>
<Kpi titulo="Egresos" valor={kpis.gastos} color="#ef4444"/>
<Kpi titulo="Resultado" valor={kpis.resultado} color="#4fc3f7"/>
<Kpi titulo="Rentabilidad" valor={kpis.rentabilidad+"%"} color="#a78bfa"/>
</div>

<div style={styles.grid}>

<div style={styles.card}>
<h4>Totales</h4>
<canvas ref={barRef} width={400} height={260}/>
</div>

<div style={styles.card}>
<div style={styles.cardTitle}>Ingresos por Categoría</div>
<canvas ref={ingresosRef} width={300} height={300}/>
<Leyenda data={ingresosCat} colors={COLORS}/>
</div>

<div style={styles.card}>
<div style={styles.cardTitle}>Gastos por Categoría</div>
<canvas ref={gastosRef} width={300} height={300}/>
<Leyenda data={gastosCat} colors={COLORS}/>
</div>

</div>

</div>
);
}
function Leyenda({data, colors}){

const styles = crearEstilos(useTemaColores());
const total = data.reduce((a,b)=>a+b.valor,0);

return(
<div style={styles.leyenda}>

{data.map((item,i)=>{

  const porcentaje = total>0 
    ? ((item.valor/total)*100).toFixed(1)
    : 0;

  return(
    <div key={i} style={styles.itemLeyenda}>

      <div 
        style={{
          ...styles.colorBox,
          background: colors[i % colors.length]
        }}
      />

      <div style={{flex:1}}>
        <div style={styles.nombre}>{item.tipo}</div>
        <div style={styles.valor}>
          ${Math.round(item.valor).toLocaleString()} ({porcentaje}%)
        </div>
      </div>

    </div>
  );

})}

</div>
);
}
/* KPI */
function Kpi({titulo,valor,color}){

const styles = crearEstilos(useTemaColores());
const [num,setNum]=useState(0);

useEffect(()=>{
  let i=0;
  const inc = (typeof valor==="number"?valor:0)/40;

  const t = setInterval(()=>{
    i+=inc;
    if(i>=valor){
      i=valor;
      clearInterval(t);
    }
    setNum(Math.floor(i));
  },20);

},[valor]);

return(
<div style={{...styles.kpi,borderTop:`4px solid ${color}`}}>
<div>{titulo}</div>
<div>{typeof valor==="number"?"$"+num.toLocaleString():valor}</div>
</div>
);
}

/* ESTILOS */
const crearEstilos = (c) => ({

container:{
  padding:30,
  fontFamily:"Inter, Arial",
  background:c.BG_PAGE,
  minHeight:"100vh"
},

title:{
  marginBottom:25,
  fontSize:24,
  fontWeight:700,
  color:c.TEXT_FUERTE
},

filtros:{
  display:"flex",
  gap:10,
  marginBottom:25,
  background:c.BG_CARD,
  padding:12,
  borderRadius:12,
  boxShadow:c.SHADOW_CARD,
  border:`1px solid ${c.BORDER}`,
  alignItems:"center",
  flexWrap:"wrap"
},

filtroInput:{
  padding:"7px 10px",
  borderRadius:8,
  border:`1px solid ${c.BORDER_INPUT}`,
  background:c.BG_INPUT,
  color:c.TEXT_FUERTE,
  colorScheme:c.MODO,
  fontSize:13,
  outline:"none",
},

kpis:{
  display:"flex",
  gap:20,
  marginBottom:30,
  flexWrap:"wrap"
},

kpi:{
  background:c.BG_CARD,
  padding:18,
  borderRadius:14,
  width:200,
  color:c.TEXT_FUERTE,
  border:`1px solid ${c.BORDER}`,
  boxShadow:c.SHADOW_CARD,
  transition:"all .2s ease"
},

grid:{
  display:"grid",
  gridTemplateColumns:"repeat(auto-fit,minmax(320px,1fr))",
  gap:25
},

card:{
  background:c.BG_CARD,
  padding:25,
  borderRadius:16,
  color:c.TEXT_FUERTE,
  border:`1px solid ${c.BORDER}`,
  boxShadow:c.SHADOW_CARD,
  transition:"all .25s ease",
  position:"relative"
},

cardTitle:{
  fontSize:14,
  fontWeight:600,
  color:c.TEXT_FUERTE,
  marginBottom:10
},
leyenda:{
  marginTop:15,
  display:"flex",
  flexDirection:"column",
  gap:10
},

itemLeyenda:{
  display:"flex",
  alignItems:"center",
  gap:10,
  fontSize:13,
  padding:"6px 8px",
  borderRadius:8,
  transition:"all .2s"
},

colorBox:{
  width:12,
  height:12,
  borderRadius:3
},

nombre:{
  fontWeight:"600",
  color:c.TEXT_FUERTE
},

valor:{
  color:c.TEXT_MUTED,
  fontSize:12
}


});