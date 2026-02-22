import StatusBadge from '../ui/StatusBadge';
import Button from '../ui/Button';
import { MapPin, Building2 } from 'lucide-react';

export default function ComplaintCard({ complaint, onView }) {
  const priorityColors = {
    1: 'text-green-600',
    2: 'text-amber-600',
    3: 'text-red-600'
  };

  return (
    <div className="glass rounded-lg shadow-md p-3 hover:shadow-lg transition-all duration-200">
      <div className="flex justify-between items-start mb-2">
        <div className="flex gap-2">
          {/* Ensure status exists before passing to StatusBadge */}
          <StatusBadge status={complaint.status || 'WAITING'} />
          <span className={`text-xs font-medium ${priorityColors[complaint.priority] || 'text-gray-600'}`}>
            P{complaint.priority}
          </span>
          <span className="text-xs font-mono text-gray-400 self-center">
            #{complaint._id ? complaint._id.slice(-6).toUpperCase() : '---'}
          </span>
        </div>
        <span className="text-xs text-gray-500">
          {complaint.createdAt ? new Date(complaint.createdAt).toLocaleDateString() : 'N/A'}
        </span>
      </div>

      <h3 className="font-semibold text-sm text-gray-900 mb-2">
        {complaint.description ? complaint.description.substring(0, 60) + (complaint.description.length > 60 ? '...' : '') : 'No description'}
      </h3>

      <div className="flex gap-3 text-xs text-gray-600 mb-3">
        <div className="flex items-center gap-1">
          <MapPin size={12} />
          <span>
            {complaint.location ||
              (complaint.latitude && complaint.longitude
                ? `${complaint.latitude.toFixed(4)}, ${complaint.longitude.toFixed(4)}`
                : 'Location N/A')}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Building2 size={12} />
          <span>{complaint.department || 'General'}</span>
        </div>
      </div>

      <Button variant="outline" onClick={() => onView(complaint._id || complaint.id)} className="w-full">
        View
      </Button>
    </div>
  );
}
