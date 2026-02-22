export default function Button({ children, variant = 'primary', onClick, disabled, className = '' }) {
  const variants = {
    primary: 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 shadow-md',
    outline: 'border border-gray-300 text-gray-700 hover:bg-white/50 hover:border-blue-500',
    danger: 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 shadow-md',
    success: 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 shadow-md'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`h-9 px-4 rounded-md text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}
