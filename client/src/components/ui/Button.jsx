export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  loading = false,
  disabled,
  ...props
}) {
  const variants = {
    primary: 'neon-button',
    secondary: 'glass-card text-brand-cyan hover:bg-white/10 px-6 py-2.5 rounded-xl font-medium',
    danger: 'bg-brand-red text-white font-bold px-6 py-2.5 rounded-xl hover:opacity-90',
    ghost: 'text-gray-400 hover:text-white px-4 py-2',
    outline: 'border border-brand-cyan/50 text-brand-cyan px-6 py-2.5 rounded-xl hover:bg-brand-cyan/10',
  };

  const sizes = {
    sm: 'text-sm px-4 py-1.5',
    md: '',
    lg: 'text-lg px-8 py-3',
  };

  return (
    <button
      className={`${variants[variant]} ${sizes[size]} ${className} disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 transition-all`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {children}
    </button>
  );
}
