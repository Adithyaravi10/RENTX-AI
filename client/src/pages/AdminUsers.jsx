import { useEffect, useState } from 'react';
import api from '../utils/api';
import Badge from '../components/ui/Badge';
import { formatPrice } from '../utils/pricing';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    api.get('/admin/users').then(({ data }) => setUsers(data.users || []));
  }, []);

  return (
    <div className="p-6">
      <h1 className="font-syne font-bold text-3xl text-white mb-8">User Management</h1>
      <div className="overflow-x-auto glass-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-400 border-b border-white/10">
              <th className="text-left p-4">Name</th>
              <th className="text-left p-4">Email</th>
              <th className="text-left p-4">Role</th>
              <th className="text-left p-4">Wallet</th>
              <th className="text-left p-4">Eco Score</th>
              <th className="text-left p-4">Bookings</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-white/5 hover:bg-white/5">
                <td className="p-4 text-white">{u.name}</td>
                <td className="p-4 text-gray-400">{u.email}</td>
                <td className="p-4"><Badge>{u.role}</Badge></td>
                <td className="p-4 text-brand-green">{formatPrice(u.walletBalance)}</td>
                <td className="p-4 text-brand-cyan">{u.ecoScore}</td>
                <td className="p-4">{u._count?.bookings || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
