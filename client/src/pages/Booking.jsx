import { useParams } from 'react-router-dom';
import VehicleDetail from './VehicleDetail';

export default function Booking() {
  const { vehicleId } = useParams();
  return <VehicleDetail key={vehicleId} />;
}
