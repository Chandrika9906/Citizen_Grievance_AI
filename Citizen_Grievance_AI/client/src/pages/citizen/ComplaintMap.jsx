import { MapContainer, TileLayer, Circle, Popup } from 'react-leaflet';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import PageContainer from '../../components/layout/PageContainer';
import Card from '../../components/ui/Card';
import { MapPin, Info, ArrowRight, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet default marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Tamil Nadu locations coordinates fallback
const LOCATION_COORDS = {
    'Chennai': [13.0827, 80.2707],
    'Coimbatore': [11.0168, 76.9558],
    'Madurai': [9.9252, 78.1198],
    'Tiruchirappalli': [10.7905, 78.7047],
    'Salem': [11.6643, 78.1460],
    'Tirunelveli': [8.7139, 77.7567],
    'Erode': [11.3410, 77.7172],
    'Vellore': [12.9165, 79.1325],
    'Thoothukudi': [8.7642, 78.1348],
    'Thanjavur': [10.7870, 79.1378],
    'Dindigul': [10.3673, 77.9803],
    'Kanchipuram': [12.8342, 79.7036],
    'Karur': [10.9601, 78.0766],
    'Rajapalayam': [9.4516, 77.5619],
    'Nagercoil': [8.1790, 77.4345]
};

export default function ComplaintMap() {
    const { complaints, loading } = useData();
    const { user } = useAuth();

    // Filter complaints for current user - robust matching
    const userComplaints = Array.isArray(complaints)
        ? complaints.filter(c => {
            const complUserId = (c.userId?._id || c.userId?.id || c.userId || c.citizenId)?.toString();
            const currentUserId = (user?._id || user?.id)?.toString();
            return complUserId === currentUserId;
        })
        : [];

    const getPriorityColor = (priority) => {
        if (priority >= 3) return '#ef4444'; // Red - High
        if (priority === 2) return '#f59e0b'; // Yellow - Medium
        return '#10b981'; // Green - Low
    };

    const getPriorityLabel = (priority) => {
        if (priority >= 3) return 'HIGH';
        if (priority === 2) return 'MEDIUM';
        return 'LOW';
    };

    if (loading) {
        return (
            <PageContainer>
                <div className="flex flex-col items-center justify-center h-96 space-y-4">
                    <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-600 rounded-full animate-spin"></div>
                    <p className="text-slate-500 font-medium">Loading interactive map...</p>
                </div>
            </PageContainer>
        );
    }

    return (
        <PageContainer>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <MapPin className="text-indigo-600" />
                    Complaint Insight Map
                </h1>
                <p className="text-slate-500 mt-1">
                    Visualizing the priority and distribution of your submitted grievances
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Sidebar Info */}
                <div className="lg:col-span-1 space-y-4">
                    <Card className="p-4 bg-indigo-50/50 border-indigo-100">
                        <h3 className="text-sm font-bold text-indigo-900 mb-3 flex items-center gap-2">
                            <Info size={16} />
                            Map Legend
                        </h3>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="w-4 h-4 rounded-full bg-red-500 shadow-sm shadow-red-200"></div>
                                <div>
                                    <p className="text-xs font-bold text-slate-900">High Priority</p>
                                    <p className="text-[10px] text-slate-500 leading-tight">Requires immediate attention</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-4 h-4 rounded-full bg-amber-500 shadow-sm shadow-amber-200"></div>
                                <div>
                                    <p className="text-xs font-bold text-slate-900">Medium Priority</p>
                                    <p className="text-[10px] text-slate-500 leading-tight">Standard resolution timeframe</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-4 h-4 rounded-full bg-emerald-500 shadow-sm shadow-emerald-200"></div>
                                <div>
                                    <p className="text-xs font-bold text-slate-900">Low Priority</p>
                                    <p className="text-[10px] text-slate-500 leading-tight">Minor concerns or inquiries</p>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-4 glass border-slate-100">
                        <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                            <ShieldAlert size={16} className="text-slate-400" />
                            Quick Summary
                        </h3>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="p-2 rounded-xl bg-slate-50 text-center">
                                <p className="text-xl font-black text-slate-900">{userComplaints.length}</p>
                                <p className="text-[10px] font-bold text-slate-500 uppercase">Total</p>
                            </div>
                            <div className="p-2 rounded-xl bg-emerald-50 text-center text-emerald-700">
                                <p className="text-xl font-black">{userComplaints.filter(c => c.status === 'RESOLVED').length}</p>
                                <p className="text-[10px] font-bold uppercase">Fixed</p>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Map Container */}
                <div className="lg:col-span-3">
                    <Card className="overflow-hidden border-slate-200 shadow-2xl rounded-3xl h-[600px] relative">
                        {userComplaints.length === 0 ? (
                            <div className="w-full h-full bg-slate-50 flex flex-col items-center justify-center text-center p-8">
                                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-4 shadow-xl">
                                    <MapPin className="text-slate-300 w-10 h-10" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900">No Geographic Data</h3>
                                <p className="text-slate-500 max-w-sm mt-2 font-medium">
                                    Submit a complaint with location tracking enabled to see it appearing on this map.
                                </p>
                                <Link to="/citizen/submit" className="mt-6 px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 hover:scale-105 transition-all">
                                    Register New Grievance
                                </Link>
                            </div>
                        ) : (
                            <MapContainer
                                center={[11.1271, 78.6569]}
                                zoom={7}
                                style={{ height: '100%', width: '100%' }}
                                className="z-0"
                            >
                                <TileLayer
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />

                                {userComplaints.map(complaint => {
                                    let position = [11.1271, 78.6569]; // Default TN center

                                    // 1. Use explicit coordinates if valid numbers
                                    if (complaint.latitude && complaint.longitude &&
                                        !isNaN(complaint.latitude) && !isNaN(complaint.longitude)) {
                                        position = [complaint.latitude, complaint.longitude];
                                    }
                                    // 2. Fallback to location name lookup
                                    else if (complaint.location && LOCATION_COORDS[complaint.location]) {
                                        position = LOCATION_COORDS[complaint.location];
                                    }

                                    const color = getPriorityColor(complaint.priority);

                                    return (
                                        <Circle
                                            key={complaint._id}
                                            center={position}
                                            radius={4000}
                                            pathOptions={{
                                                color: color,
                                                fillColor: color,
                                                fillOpacity: 0.6,
                                                weight: 4,
                                                className: 'animate-pulse hover:fill-opacity-80 transition-all'
                                            }}
                                        >
                                            <Popup className="premium-popup">
                                                <div className="p-1" style={{ minWidth: '220px' }}>
                                                    <div className="flex items-center gap-3 mb-3 pb-2 border-b border-slate-100">
                                                        <div
                                                            className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
                                                            style={{ backgroundColor: color }}
                                                        >
                                                            <ShieldAlert className="w-6 h-6 text-white" />
                                                        </div>
                                                        <div>
                                                            <p className="font-extrabold text-sm text-slate-900 leading-none">
                                                                {getPriorityLabel(complaint.priority)} Priority
                                                            </p>
                                                            <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest font-bold">
                                                                ID: #{complaint._id.slice(-6)}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="mb-4">
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1">Issue Preview</p>
                                                        <p className="text-sm text-slate-700 font-medium leading-relaxed italic line-clamp-3">
                                                            "{complaint.description}"
                                                        </p>
                                                    </div>

                                                    <Link
                                                        to={`/citizen/complaints/${complaint._id}`}
                                                        className="flex items-center justify-between p-3 bg-slate-900 text-white rounded-xl group transition-all hover:bg-black"
                                                    >
                                                        <span className="text-xs font-bold uppercase tracking-widest">Full Details</span>
                                                        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                                    </Link>
                                                </div>
                                            </Popup>
                                        </Circle>
                                    );
                                })}
                            </MapContainer>
                        )}
                    </Card>
                </div>
            </div>
        </PageContainer>
    );
}
