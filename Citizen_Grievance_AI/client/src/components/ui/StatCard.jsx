export default function StatCard({ title, value, icon: Icon }) {
  return (
    <div className="glass rounded-lg shadow-md p-4 hover:shadow-lg transition-all duration-300">
      <div className="flex items-center justify-between mb-2">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white shadow-md">
          {Icon && <Icon className="w-5 h-5" />}
        </div>
      </div>
      <p className="text-xs text-gray-600 mb-1">{title}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}
