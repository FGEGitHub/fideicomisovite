import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import VentasDashboard from "./VentasDashboard";

export default function TablaVentas() {
  return (
    <VentasDashboard
      vendedor="Fideicomiso Santa Catalina"
      titulo="Fideicomiso Santa Catalina"
      icon={<AccountBalanceIcon />}
      accent="#148d8d"
    />
  );
}
