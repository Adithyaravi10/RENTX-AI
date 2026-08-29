export default function Badge({ children, variant = 'default', className = '' }) {
  const variants = {
    default: 'bg-white/10 text-gray-300',
    success: 'bg-brand-green/10 text-brand-green',
    warning: 'bg-yellow-400/10 text-yellow-400',
    danger: 'bg-brand-red/10 text-brand-red',
    info: 'bg-brand-cyan/10 text-brand-cyan',
    violet: 'bg-brand-violet/10 text-brand-violet',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}
