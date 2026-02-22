export default function Textarea({ placeholder, value, onChange, rows = 4, className = '' }) {
  return (
    <textarea
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      rows={rows}
      className={`w-full px-4 py-3 glass rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition-all duration-300 ${className}`}
    />
  );
}
