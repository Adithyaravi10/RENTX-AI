import GaugeChart from '../ui/GaugeChart';
import Badge from '../ui/Badge';

export default function DigitalTwinDashboard({ vehicle }) {
  if (!vehicle) return null;

  return (
    <div className="glass-card p-6">
      <h3 className="font-syne font-bold text-white mb-6">Digital Twin</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="relative flex justify-center">
          <GaugeChart
            value={vehicle.healthScore || 100}
            label="Health"
            color={vehicle.healthScore < 40 ? '#ff3b5c' : '#00ff87'}
          />
        </div>
        {vehicle.batteryLevel != null && (
          <div className="relative flex justify-center">
            <GaugeChart value={vehicle.batteryLevel} label="Battery" color="#00d4ff" />
          </div>
        )}
        {vehicle.fuelLevel != null && (
          <div className="relative flex justify-center">
            <GaugeChart value={vehicle.fuelLevel} label="Fuel" color="#fbbf24" />
          </div>
        )}
        <div className="flex flex-col justify-center gap-2">
          <Badge variant={vehicle.engineStatus === 'OK' ? 'success' : 'warning'}>
            Engine: {vehicle.engineStatus}
          </Badge>
          <p className="text-sm text-gray-400">Odometer: {Math.round(vehicle.odometer || 0)} km</p>
          {vehicle.lastServiced && (
            <p className="text-sm text-gray-400">
              Last serviced: {new Date(vehicle.lastServiced).toLocaleDateString('en-IN')}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
