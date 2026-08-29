import { format, formatDistanceToNow } from 'date-fns';

export const formatDate = (date) => format(new Date(date), 'dd MMM yyyy');
export const formatDateTime = (date) => format(new Date(date), 'dd MMM yyyy, hh:mm a');
export const formatRelative = (date) => formatDistanceToNow(new Date(date), { addSuffix: true });

export const formatCategory = (cat) =>
  cat?.charAt(0) + cat?.slice(1).toLowerCase().replace('_', ' ');

export const formatBodyType = (type) =>
  type
    ? type.charAt(0) + type.slice(1).toLowerCase().replace('_', ' ')
    : '';

export const getStatusColor = (status) => {
  const colors = {
    PENDING: 'text-yellow-400 bg-yellow-400/10',
    CONFIRMED: 'text-brand-cyan bg-brand-cyan/10',
    ACTIVE: 'text-brand-green bg-brand-green/10',
    COMPLETED: 'text-gray-400 bg-gray-400/10',
    CANCELLED: 'text-brand-red bg-brand-red/10',
  };
  return colors[status] || colors.PENDING;
};

export const getVehicleStatusColor = (status) => {
  const colors = {
    available: '#00ff87',
    booked: '#ff3b5c',
    maintenance: '#fbbf24',
  };
  return colors[status] || colors.available;
};
