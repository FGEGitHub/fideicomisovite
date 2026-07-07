import StorefrontIcon from "@mui/icons-material/Storefront";
import VentasDashboard from "./VentasDashboard";

export default function TablaVentas() {
  return (
    <VentasDashboard
      vendedor="Remax"
      titulo="Remax"
      icon={<StorefrontIcon />}
      accent="#e0294b"
    />
  );
}
