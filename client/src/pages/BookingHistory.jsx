import { useEffect, useState } from 'react';
import api from '../utils/api';
import InvoiceView from '../components/booking/InvoiceView';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { formatDateTime, getStatusColor } from '../utils/formatters';
import { formatPrice } from '../utils/pricing';
import toast from 'react-hot-toast';

export default function BookingHistory() {
  const [bookings, setBookings] = useState([]);
  const [selected, setSelected] = useState(null);

  const fetchBookings = () => {
    api.get('/bookings/my').then(({ data }) => setBookings(data.bookings || []));
  };

  useEffect(() => { fetchBookings(); }, []);

  const cancelBooking = async (id) => {
    if (!confirm('Cancel this booking?')) return;
    try {
      const { data } = await api.put(`/bookings/${id}/cancel`);
      toast.success(`Cancelled. Refund: ${data.refund?.percent}% (₹${data.refund?.amount})`);
      fetchBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cancel failed');
    }
  };

  return (
    <div className="p-6">
      <h1 className="font-syne font-bold text-3xl text-white mb-8">My Bookings</h1>
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          {bookings.map((b) => (
            <div key={b.id} onClick={() => setSelected(b)}
              className={`glass-card p-5 cursor-pointer transition hover:border-brand-cyan/30 ${selected?.id === b.id ? 'border-brand-cyan/50' : ''}`}>
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-white">{b.vehicle?.name}</p>
                  <p className="text-gray-400 text-sm">{formatDateTime(b.startTime)}</p>
                </div>
                <Badge className={getStatusColor(b.status)}>{b.status}</Badge>
              </div>
              <div className="flex justify-between items-center mt-3">
                <span className="text-brand-cyan font-bold">{formatPrice(b.totalPrice)}</span>
                {['PENDING', 'CONFIRMED'].includes(b.status) && (
                  <Button variant="danger" size="sm" onClick={(e) => { e.stopPropagation(); cancelBooking(b.id); }}>
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
        {selected && <InvoiceView booking={selected} />}
      </div>
    </div>
  );
}
