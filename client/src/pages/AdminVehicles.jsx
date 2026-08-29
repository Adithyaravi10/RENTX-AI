import { useEffect, useState } from 'react';
import api from '../utils/api';
import Badge from '../components/ui/Badge';

export default function AdminVehicles() {
  const [vehicles, setVehicles] = useState([]);

  useEffect(() => {
    api.get('/vehicles').then(({ data }) => setVehicles(data.vehicles || []));
  }, []);

  return (
    <div className="p-6">
      <h1 className="font-syne font-bold text-3xl text-white mb-8">Fleet Management</h1>
      <div className="overflow-x-auto glass-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-400 border-b border-white/10">
              <th className="text-left p-4">Vehicle</th>
              <th className="text-left p-4">Category</th>
              <th className="text-left p-4">Fuel</th>
              <th className="text-left p-4">Price/hr</th>
              <th className="text-left p-4">Health</th>
              <th className="text-left p-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map((v) => (
              <tr key={v.id} className="border-b border-white/5 hover:bg-white/5">
                <td className="p-4 text-white font-medium">{v.name}</td>
                <td className="p-4"><Badge variant="info">{v.category}</Badge></td>
                <td className="p-4 text-gray-300">{v.fuelType}</td>
                <td className="p-4 text-brand-cyan">₹{v.pricePerHour}</td>
                <td className="p-4">{v.healthScore}%</td>
                <td className="p-4">
                  <Badge variant={v.isAvailable ? 'success' : 'danger'}>
                    {v.engineStatus === 'WARNING' ? 'Maintenance' : v.isAvailable ? 'Available' : 'Booked'}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
