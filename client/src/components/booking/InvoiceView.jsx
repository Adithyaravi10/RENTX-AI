import { Download } from 'lucide-react';
import Button from '../ui/Button';
import { formatDateTime, getStatusColor } from '../../utils/formatters';
import { formatPrice } from '../../utils/pricing';
import Badge from '../ui/Badge';

export default function InvoiceView({ booking }) {
  const downloadInvoice = () => {
    const token = localStorage.getItem('token');
    window.open(`/api/bookings/${booking.id}/invoice?token=${token}`, '_blank');
  };

  return (
    <div className="glass-card p-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="font-syne font-bold text-white text-xl">Booking Invoice</h3>
          <p className="text-gray-400 text-sm mt-1">ID: {booking.id?.slice(0, 12)}...</p>
        </div>
        <Badge className={getStatusColor(booking.status)}>{booking.status}</Badge>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm mb-6">
        <div>
          <p className="text-gray-400">Vehicle</p>
          <p className="text-white font-medium">{booking.vehicle?.name}</p>
        </div>
        <div>
          <p className="text-gray-400">Total</p>
          <p className="text-brand-cyan font-syne font-bold text-lg">{formatPrice(booking.totalPrice)}</p>
        </div>
        <div>
          <p className="text-gray-400">Start</p>
          <p className="text-white">{formatDateTime(booking.startTime)}</p>
        </div>
        <div>
          <p className="text-gray-400">End</p>
          <p className="text-white">{formatDateTime(booking.endTime)}</p>
        </div>
      </div>

      <Button onClick={downloadInvoice} variant="outline" className="w-full">
        <Download size={16} /> Download PDF Invoice
      </Button>
    </div>
  );
}
