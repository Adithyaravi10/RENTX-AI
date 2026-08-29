import { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    licenseNumber: user?.licenseNumber || '',
    emergencyContact: user?.emergencyContact || '',
  });
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      const { data } = await api.put('/users/profile', form);
      updateUser(data.user);
      toast.success('Profile updated');
    } catch {
      toast.error('Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="font-syne font-bold text-3xl text-white mb-8">Profile</h1>
      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-brand-violet flex items-center justify-center text-2xl font-bold text-white">
            {user?.name?.[0]}
          </div>
          <div>
            <p className="text-white font-medium">{user?.email}</p>
            <div className="flex gap-2 mt-1">
              <Badge variant="info">{user?.role}</Badge>
              {user?.aadhaarVerified && <Badge variant="success">Verified</Badge>}
            </div>
          </div>
        </div>
        {Object.entries(form).map(([key, val]) => (
          <div key={key}>
            <label className="text-sm text-gray-400 capitalize">{key.replace(/([A-Z])/g, ' $1')}</label>
            <input value={val} onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              className="w-full mt-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white" />
          </div>
        ))}
        <Button onClick={handleSave} loading={loading}>Save Changes</Button>
      </div>
    </div>
  );
}
