import { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { useAuth } from '../hooks/useAuth';
import { formatPrice } from '../utils/pricing';
import Button from '../components/ui/Button';

export default function Wallet() {
  const { user, updateUser } = useAuth();
  const [amount, setAmount] = useState(500);
  const [loading, setLoading] = useState(false);

  const addFunds = async () => {
    setLoading(true);
    try {
      const { data } = await api.post('/payments/wallet/add', { amount });
      updateUser({ walletBalance: data.walletBalance });
      toast.success(`Added ${formatPrice(amount)} to wallet`);
    } catch {
      toast.error('Failed to add funds');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-lg">
      <h1 className="font-syne font-bold text-3xl text-white mb-8">Wallet</h1>
      <div className="glass-card p-8 text-center gradient-border">
        <p className="text-gray-400 text-sm">Available Balance</p>
        <p className="font-syne font-extrabold text-5xl text-brand-green mt-2">
          {formatPrice(user?.walletBalance || 0)}
        </p>
      </div>
      <div className="glass-card p-6 mt-6 space-y-4">
        <h3 className="font-syne font-bold text-white">Add Funds</h3>
        <div className="flex gap-2">
          {[500, 1000, 2000, 5000].map((a) => (
            <button key={a} onClick={() => setAmount(a)}
              className={`flex-1 py-2 rounded-xl text-sm transition ${amount === a ? 'bg-brand-cyan text-black' : 'bg-white/5 text-gray-400'}`}>
              ₹{a}
            </button>
          ))}
        </div>
        <Button onClick={addFunds} loading={loading} className="w-full">Add {formatPrice(amount)}</Button>
        <p className="text-xs text-gray-500 text-center">Test mode — simulated wallet top-up</p>
      </div>
    </div>
  );
}
