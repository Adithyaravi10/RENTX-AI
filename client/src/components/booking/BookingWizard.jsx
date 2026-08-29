import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import StepWizard from '../ui/StepWizard';
import PricingBreakdown from './PricingBreakdown';
import Button from '../ui/Button';
import api from '../../utils/api';
import { calculateHours } from '../../utils/pricing';
import { useAuth } from '../../hooks/useAuth';

const STEPS = [
  { id: 'select', label: 'Select' },
  { id: 'details', label: 'Details' },
  { id: 'payment', label: 'Payment' },
  { id: 'confirm', label: 'Confirm' },
];

export default function BookingWizard({ vehicle, onComplete }) {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(false);
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signatureData, setSignatureData] = useState(null);

  const hours = startTime && endTime ? calculateHours(startTime, endTime) : 1;
  const surgeMultiplier = booking?.surgeMultiplier || 1.2;

  const startDrawing = (e) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.strokeStyle = '#00d4ff';
    ctx.lineWidth = 2;
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    if (canvasRef.current) {
      setSignatureData(canvasRef.current.toDataURL('image/png'));
    }
  };

  const createBooking = async () => {
    setLoading(true);
    try {
      const { data } = await api.post('/bookings', {
        vehicleId: vehicle.id,
        startTime,
        endTime,
        pickupLat: vehicle.locationLat,
        pickupLng: vehicle.locationLng,
        signatureData,
      });
      setBooking(data.booking);
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  const processPayment = async () => {
    setLoading(true);
    try {
      if (paymentMethod === 'WALLET') {
        await api.post('/payments/wallet-pay', { bookingId: booking.id });
        updateUser({ walletBalance: user.walletBalance - booking.totalPrice });
      } else {
        const { data: orderData } = await api.post('/payments/create-order', {
          bookingId: booking.id,
          method: paymentMethod,
        });
        await api.post('/payments/verify', {
          bookingId: booking.id,
          razorpay_order_id: orderData.orderId,
          razorpay_payment_id: `pay_sim_${Date.now()}`,
          razorpay_signature: 'simulated_signature',
        });
      }
      setStep(3);
      toast.success('Payment successful!');
      onComplete?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <StepWizard steps={STEPS} currentStep={step} />

      {step === 0 && (
        <div className="space-y-4">
          <p className="text-gray-400">Confirm vehicle: <strong className="text-white">{vehicle.name}</strong></p>
          <Button onClick={() => setStep(1)} className="w-full">Continue</Button>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-400">Start Time</label>
              <input type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)}
                className="w-full mt-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white" />
            </div>
            <div>
              <label className="text-sm text-gray-400">End Time</label>
              <input type="datetime-local" value={endTime} onChange={(e) => setEndTime(e.target.value)}
                className="w-full mt-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white" />
            </div>
          </div>
          <PricingBreakdown vehicle={vehicle} hours={hours} surgeMultiplier={surgeMultiplier} />
          <div>
            <label className="text-sm text-gray-400 mb-2 block">E-Signature</label>
            <canvas ref={canvasRef} width={400} height={100}
              className="w-full bg-white/5 border border-white/10 rounded-xl cursor-crosshair"
              onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={stopDrawing} onMouseLeave={stopDrawing} />
          </div>
          <Button onClick={createBooking} loading={loading} className="w-full">Create Booking</Button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <PricingBreakdown vehicle={vehicle} hours={hours} surgeMultiplier={booking?.surgeMultiplier || 1} />
          <div className="flex gap-3">
            {['UPI', 'CARD', 'WALLET'].map((m) => (
              <button key={m} onClick={() => setPaymentMethod(m)}
                className={`flex-1 py-3 rounded-xl text-sm font-medium transition ${
                  paymentMethod === m ? 'bg-brand-cyan text-black' : 'glass-card text-gray-400'
                }`}>{m}</button>
            ))}
          </div>
          <Button onClick={processPayment} loading={loading} className="w-full">Pay Now</Button>
        </div>
      )}

      {step === 3 && (
        <div className="text-center py-8">
          <div className="text-6xl mb-4">🎉</div>
          <h3 className="font-syne font-bold text-2xl text-white mb-2">Booking Confirmed!</h3>
          <p className="text-gray-400 mb-6">Your {vehicle.name} is ready for pickup.</p>
          <Button onClick={() => navigate('/bookings')}>View My Bookings</Button>
        </div>
      )}
    </div>
  );
}
