import Badge from '../ui/Badge';

export default function FraudAlerts({ alerts }) {
  if (!alerts?.length) {
    return <p className="text-gray-400 text-sm text-center py-8">No fraud alerts detected</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-gray-400 border-b border-white/10">
            <th className="text-left py-3 px-4">User</th>
            <th className="text-left py-3 px-4">Flag</th>
            <th className="text-left py-3 px-4">Details</th>
          </tr>
        </thead>
        <tbody>
          {alerts.map((alert, i) => (
            <tr key={i} className="border-b border-white/5 hover:bg-white/5">
              <td className="py-3 px-4">
                <p className="text-white font-medium">{alert.name}</p>
                <p className="text-gray-500 text-xs">{alert.email}</p>
              </td>
              <td className="py-3 px-4">
                <Badge variant={alert.flag === 'excessive_bookings' ? 'danger' : 'warning'}>
                  {alert.flag?.replace(/_/g, ' ')}
                </Badge>
              </td>
              <td className="py-3 px-4 text-gray-400">
                {alert.bookingsToday && `${alert.bookingsToday} bookings today`}
                {alert.cancelRate && `${alert.cancelRate}% cancel rate`}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
