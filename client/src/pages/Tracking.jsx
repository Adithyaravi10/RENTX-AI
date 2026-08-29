import LiveMap from '../components/map/LiveMap';

export default function Tracking() {
  return (
    <div className="p-6">
      <h1 className="font-syne font-bold text-3xl text-white mb-2">Live Vehicle Tracking</h1>
      <p className="text-gray-400 mb-6">Real-time fleet locations across Bengaluru</p>
      <LiveMap />
      <div className="flex gap-4 mt-4 text-sm">
        <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-brand-green" /> Available</span>
        <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-brand-red" /> Booked</span>
        <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-yellow-400" /> Maintenance</span>
        <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-blue-500" /> You</span>
      </div>
    </div>
  );
}
