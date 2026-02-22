import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Popup, Circle } from 'react-leaflet';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import PageContainer from '../../components/layout/PageContainer';
import StatCard from '../../components/ui/StatCard';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import {
  CheckSquare, Clock, CheckCircle, MapPin,
  ShieldAlert, AlertTriangle, Users, RefreshCcw,
  Navigation, ExternalLink, Activity
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { dashboardAPI } from '../../services/api';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet default marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const LOCATION_COORDS = {
  'Chennai': [13.0827, 80.2707],
  'Coimbatore': [11.0168, 76.9558],
  'Madurai': [9.9252, 78.1198],
  'Tiruchirappalli': [10.7905, 78.7047],
  'Salem': [11.6643, 78.1460],
  'Tirunelveli': [8.7139, 77.7567],
  'Erode': [11.3410, 77.7172],
  'Vellore': [12.9165, 79.1325]
};

export default function OfficerDashboard() {
  const { complaints, officers, loading, refreshData, triggerAutoAssign } = useData();
  const { user } = useAuth();
  const [assigning, setAssigning] = useState(false);
  const [dashStats, setDashStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Fetch real dashboard stats from backend
  useEffect(() => {
    const fetchStats = async () => {
      if (!user?._id && !user?.id) return;
      try {
        setStatsLoading(true);
        const res = await dashboardAPI.getOfficerStats(user._id || user.id);
        setDashStats(res.data.stats);
      } catch (err) {
        console.warn('[Dashboard] Stats API failed, using client-side fallback:', err.message);
      } finally {
        setStatsLoading(false);
      }
    };
    fetchStats();
  }, [user, complaints]); // Refresh when complaints change

  const handleAutoAssign = async () => {
    try {
      setAssigning(true);
      const res = await triggerAutoAssign();
      alert(res.message);
    } catch (err) {
      alert("Failed to run assignment sweep.");
    } finally {
      setAssigning(false);
    }
  };

  // 1. Filter complaints for officer's personal tasks - robust matching
  const myTasks = complaints.filter(c => {
    // Handle nested officer object or direct ID
    const complOfficerId = (c.officerId?._id || c.officerId?.id || c.officerId)?.toString();
    const currentUserId = (user?._id || user?.id)?.toString();

    // Debug log for mismatch (can be removed)
    // if (complOfficerId && complOfficerId !== currentUserId) console.log(`[OfficerDash] Mismatch: Task ${c._id} assigned to ${complOfficerId} vs Me ${currentUserId}`);

    return complOfficerId === currentUserId;
  });

  // 2. Map surveillance (Show EVERYTHING for "Full Data")
  const mapComplaints = complaints;

  // 3. High Critical Issues (Priority 4-5) - ALL unresolved critical issues
  const userDept = user?.department || "";
  const criticalIssues = complaints
    .filter(c => c.priority >= 4 && c.status !== 'RESOLVED' && c.status !== 'REJECTED')
    .sort((a, b) => b.priority - a.priority);

  const myDeptCritical = criticalIssues.filter(c =>
    !c.department || c.department.toLowerCase() === userDept.toLowerCase()
  );

  // 4. Department Officers for Assignment Status
  const deptOfficers = officers.filter(o =>
    o.department?.toLowerCase() === userDept.toLowerCase()
  );

  const getPriorityColor = (priority) => {
    if (priority >= 4) return '#f43f5e'; // Rose-500
    if (priority === 3) return '#f59e0b'; // Amber-500
    return '#10b981'; // Emerald-500
  };

  const getPriorityLabel = (priority) => {
    if (priority >= 4) return 'CRITICAL';
    if (priority === 3) return 'NORMAL';
    return 'STANDARD';
  };

  if (loading) {
    return (
      <PageContainer>
        <div className="flex flex-col items-center justify-center h-96 space-y-4">
          <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="text-slate-500 font-bold animate-pulse">Syncing Department Data...</p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black bg-gradient-to-r from-slate-900 to-indigo-700 bg-clip-text text-transparent">
            Officer Command Center
          </h1>
          <p className="text-slate-500 font-medium flex items-center gap-2 mt-1">
            <Activity size={16} className="text-emerald-500" />
            Active Surveillance: {complaints.length} Total Reports Swapped
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={refreshData} variant="outline" className="glass bg-white/50 border-white/20">
            <RefreshCcw size={16} className="mr-2" />
            Sync DB
          </Button>
        </div>
      </div>

      {/* Stats Summary - Real API Data */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="My Active Tasks"
          value={dashStats ? dashStats.myActiveTasks : myTasks.filter(t => t.status !== 'RESOLVED').length}
          icon={CheckSquare} color="indigo"
        />
        <StatCard
          title="🚨 Critical Alerts"
          value={dashStats ? dashStats.criticalCount : criticalIssues.length}
          icon={ShieldAlert} color="rose"
        />
        <StatCard
          title="Dept Critical"
          value={dashStats ? dashStats.deptCriticalCount : myDeptCritical.length}
          icon={AlertTriangle} color="amber"
        />
        <StatCard
          title="Resolution Rate"
          value={dashStats ? `${dashStats.resolutionRate}%` : `${deptOfficers.filter(o => o.status === 'BUSY').length} Busy`}
          icon={Activity} color="emerald"
        />
      </div>

      {/* CRITICAL ALERT BANNER */}
      {criticalIssues.length > 0 && (
        <div className="mb-6 p-4 bg-rose-600 rounded-2xl flex items-center gap-4 shadow-xl shadow-rose-200 animate-pulse">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <ShieldAlert size={22} className="text-white" />
          </div>
          <div className="flex-1">
            <p className="text-white font-black text-sm">🚨 {criticalIssues.length} CRITICAL ISSUE{criticalIssues.length > 1 ? 'S' : ''} REQUIRE IMMEDIATE ATTENTION</p>
            <p className="text-rose-200 text-xs font-bold">{myDeptCritical.length} in your department · {criticalIssues.filter(c => c.priority === 5).length} are P5 (Highest Priority)</p>
          </div>
          <span className="text-white text-xs font-black bg-white/20 px-3 py-1 rounded-full">ACTIVE EMERGENCY</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        {/* CRITICAL ISSUES LIST (Left column) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
              <AlertTriangle size={16} className="text-rose-500" />
              Critical Issues
            </h3>
            <span className="text-[10px] font-bold bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full">ACTION REQUIRED</span>
          </div>

          <div className="space-y-3 overflow-y-auto max-h-[600px] pr-2 custom-scrollbar">
            {criticalIssues.length === 0 ? (
              <Card className="p-8 text-center glass border-emerald-100 bg-emerald-50/20">
                <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
                <p className="text-sm font-bold text-emerald-600">Zero Critical Pending</p>
                <p className="text-xs text-slate-400">Department is in stable condition.</p>
              </Card>
            ) : (
              criticalIssues.map(issue => (
                <div key={issue._id} className="relative group">
                  <div className={`absolute -left-1 top-4 w-2 h-12 rounded-r-lg shadow-lg ${issue.priority === 5 ? 'bg-red-600 shadow-red-300 animate-pulse' : 'bg-rose-500 shadow-rose-200'}`}></div>
                  <Card className={`p-4 hover:bg-white/80 transition-all ${issue.priority === 5 ? 'border-red-200 bg-red-50/50' : 'border-rose-100/50 bg-white/40 glass'}`}>
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${issue.priority === 5 ? 'bg-red-600 text-white' : 'bg-rose-100 text-rose-600'}`}>
                          {issue.priority === 5 ? '🔴 P5 EMERGENCY' : '🟠 P4 CRITICAL'}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400">#{issue._id.slice(-6)}</span>
                    </div>
                    <p className="text-sm font-bold text-slate-900 line-clamp-2 leading-snug mb-2">
                      {issue.description}
                    </p>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{issue.department}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${issue.status === 'WAITING' ? 'bg-amber-100 text-amber-600' :
                        issue.status === 'ASSIGNED' ? 'bg-blue-100 text-blue-600' : 'bg-indigo-100 text-indigo-600'
                        }`}>{issue.status}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500">
                        <MapPin size={10} />
                        {issue.location || 'N/A'}
                      </div>
                      <Link to={`/citizen/complaints/${issue._id}`} className="p-2 bg-rose-600 text-white rounded-lg hover:scale-110 transition-transform">
                        <ExternalLink size={12} />
                      </Link>
                    </div>
                  </Card>
                </div>
              ))
            )}
          </div>
        </div>

        {/* MAP VIEW (Center column) */}
        <div className="lg:col-span-5 h-[620px]">
          <Card className="h-full overflow-hidden border-slate-200 shadow-2xl relative rounded-3xl group">
            <div className="absolute top-4 left-4 z-[400] glass px-4 py-2 rounded-xl flex items-center gap-2 border border-white/50 shadow-xl">
              <Navigation size={14} className="text-indigo-600 animate-pulse" />
              <span className="text-xs font-black text-indigo-900 uppercase">City Wide Surveillance</span>
            </div>

            <MapContainer
              center={[11.1271, 78.6569]}
              zoom={7}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; OpenStreetMap'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {mapComplaints.map(complaint => {
                let coords = complaint.latitude && complaint.longitude
                  ? [complaint.latitude, complaint.longitude]
                  : LOCATION_COORDS[complaint.location] || [11.1271, 78.6569];

                const color = getPriorityColor(complaint.priority);

                return (
                  <Circle
                    key={complaint._id}
                    center={coords}
                    radius={4000}
                    pathOptions={{
                      color: color,
                      fillColor: color,
                      fillOpacity: 0.7,
                      weight: 4,
                      className: 'hover:fill-opacity-100 transition-all cursor-pointer'
                    }}
                  >
                    <Popup className="premium-popup">
                      <div className="p-1 min-w-[200px]">
                        <div className="pb-2 border-b border-slate-100 mb-2">
                          <p className="font-black text-[10px] tracking-widest text-slate-400 uppercase">LOCATION</p>
                          <p className="font-bold text-sm text-slate-900">{complaint.location}</p>
                        </div>
                        <p className="text-xs text-slate-600 italic mb-3 line-clamp-2">"{complaint.description}"</p>
                        <div className="flex items-center justify-between bg-slate-50 p-2 rounded-lg mb-2">
                          <span className="text-[10px] font-bold text-slate-500 uppercase">Status</span>
                          <span className="text-[10px] font-black text-slate-900">{complaint.status}</span>
                        </div>
                        <div
                          className="w-full py-2 rounded-lg text-center text-xs font-black text-white"
                          style={{ backgroundColor: color }}
                        >
                          {getPriorityLabel(complaint.priority)}
                        </div>
                      </div>
                    </Popup>
                  </Circle>
                );
              })}
            </MapContainer>
          </Card>
        </div>

        {/* WORKFORCE STATUS (Right column) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
              <Users size={16} className="text-indigo-500" />
              Workforce status
            </h3>
          </div>

          <Card className="p-4 glass bg-indigo-50/20 border-indigo-100">
            <p className="text-[10px] font-black text-indigo-900 uppercase mb-4 tracking-tighter text-center">Department Readiness</p>
            <div className="space-y-4">
              {deptOfficers.map(officer => (
                <div key={officer._id} className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center font-bold text-slate-700 shadow-sm">
                      {officer.name.charAt(0)}
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${officer.status === 'FREE' ? 'bg-emerald-500' : 'bg-rose-500 animate-pulse'
                      }`}></div>
                  </div>
                  <div className="flex-1">
                    <p className="text-[11px] font-black text-slate-900 leading-none">{officer.name}</p>
                    <p className="text-[9px] font-bold text-slate-500 mt-1 uppercase tracking-tighter">
                      {officer.status === 'FREE' ? 'IDLE / AVAILABLE' : 'ON ACTIVE TASK'}
                    </p>
                  </div>
                  {officer.status === 'FREE' && (
                    <div className="w-6 h-6 rounded-lg bg-emerald-50 flex items-center justify-center">
                      <CheckCircle size={10} className="text-emerald-600" />
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-indigo-100/50">
              <Button
                onClick={handleAutoAssign}
                disabled={assigning}
                className="w-full bg-slate-900 text-white font-black text-[10px] uppercase shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
              >
                {assigning ? 'Syncing Queue...' : 'Trigger Department Sweep'}
              </Button>
              <p className="text-[9px] text-slate-400 mt-2 text-center italic">Manually matches pending reports to available officers</p>
            </div>
          </Card>

          <Card className="p-5 glass border-amber-100 bg-amber-50/10">
            <h4 className="text-xs font-black text-amber-700 uppercase mb-2">Protocol Note</h4>
            <p className="text-[10px] text-amber-600 font-medium leading-relaxed">
              Always prioritize RED circles on the map. These signify AI-validated High Priority emergencies.
            </p>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}

