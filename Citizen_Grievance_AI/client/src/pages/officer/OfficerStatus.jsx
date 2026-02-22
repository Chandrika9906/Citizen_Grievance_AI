import { useState } from 'react';
import { useData } from '../../context/DataContext';
import PageContainer from '../../components/layout/PageContainer';
import Card from '../../components/ui/Card';
import { complaintAPI } from '../../services/api';
import {
  User, Shield, CheckCircle, Clock, MapPin,
  AlertTriangle, Navigation, Activity, Info,
  Briefcase, Calendar, ExternalLink, UserPlus, Loader2, X
} from 'lucide-react';

export default function OfficerStatus() {
  const { officers, complaints, loading, refreshData } = useData();
  const [assignModal, setAssignModal] = useState(null); // { officer }
  const [selectedComplaint, setSelectedComplaint] = useState('');
  const [assigning, setAssigning] = useState(false);

  if (loading) {
    return (
      <PageContainer>
        <div className="flex flex-col items-center justify-center h-96 space-y-4">
          <div className="w-12 h-12 border-4 border-indigo-500/10 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="text-slate-400 font-black tracking-widest uppercase text-[10px] animate-pulse">Syncing Tactical Roster...</p>
        </div>
      </PageContainer>
    );
  }

  const getActiveComplaint = (officerId) => {
    if (!officerId) return null;
    return complaints.find(c => {
      const cOffId = c.officerId?._id || c.officerId;
      if (!cOffId) return false;
      return String(cOffId) === String(officerId) &&
        (c.status === 'ASSIGNED' || c.status === 'IN_PROGRESS' || c.status === 'ONGOING' || c.status === 'ALMOST_DONE');
    });
  };

  const getDueTime = (assignedDate, priority) => {
    if (!assignedDate) return "ASAP";
    const date = new Date(assignedDate);
    const hours = { 5: 2, 4: 6, 3: 12, 2: 24, 1: 48 };
    date.setHours(date.getHours() + (hours[priority] || 24));
    return date.toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  // Waiting complaints for manual assignment
  const waitingComplaints = complaints.filter(c => c.status === 'WAITING');

  const handleManualAssign = async () => {
    if (!selectedComplaint || !assignModal) return;
    try {
      setAssigning(true);
      await complaintAPI.assignOfficer(selectedComplaint, assignModal.officer._id);
      await refreshData();
      setAssignModal(null);
      setSelectedComplaint('');
    } catch (err) {
      alert('Assignment failed. Please try again.');
    } finally {
      setAssigning(false);
    }
  };

  const freeCount = officers.filter(o => o.status === 'FREE').length;
  const busyCount = officers.filter(o => o.status === 'BUSY').length;

  return (
    <PageContainer>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase flex items-center gap-3">
            <div className="w-1.5 h-6 bg-indigo-600 rounded-full"></div>
            Live <span className="text-indigo-600">Operations</span> Monitor
          </h1>
          <p className="text-slate-500 text-xs font-bold ml-5 uppercase tracking-widest mt-1 opacity-70">Tactical Deployments & Workforce Status</p>
        </div>
        <div className="flex gap-3">
          <div className="px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
            <p className="text-xl font-black text-emerald-600">{freeCount}</p>
            <p className="text-[9px] font-bold text-emerald-500 uppercase">Free</p>
          </div>
          <div className="px-4 py-2 bg-rose-50 border border-rose-200 rounded-xl text-center">
            <p className="text-xl font-black text-rose-600">{busyCount}</p>
            <p className="text-[9px] font-bold text-rose-500 uppercase">Busy</p>
          </div>
          <div className="px-4 py-2 bg-amber-50 border border-amber-200 rounded-xl text-center">
            <p className="text-xl font-black text-amber-600">{waitingComplaints.length}</p>
            <p className="text-[9px] font-bold text-amber-500 uppercase">Waiting</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {officers.map(officer => {
          const activeTask = getActiveComplaint(officer._id);
          const isBusy = officer.status === 'BUSY';
          const isCritical = isBusy && activeTask && activeTask.priority >= 4;

          return (
            <Card key={officer._id} className={`group overflow-hidden rounded-3xl border transition-all duration-300 ${isBusy
              ? (isCritical ? 'bg-white border-rose-200 shadow-xl shadow-rose-100' : 'bg-white border-indigo-100 shadow-xl')
              : 'bg-slate-50/50 border-slate-100'
              }`}>
              {/* Header */}
              <div className={`p-5 border-b flex items-center justify-between ${isCritical ? 'bg-rose-50 border-rose-100' : 'bg-white border-slate-50'}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm ${isBusy
                    ? (isCritical ? 'bg-rose-500 text-white animate-pulse' : 'bg-indigo-600 text-white')
                    : 'bg-slate-200 text-slate-500'
                    }`}>
                    {officer.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className={`text-sm font-black leading-tight ${isCritical ? 'text-rose-900' : 'text-slate-900'}`}>{officer.name}</h3>
                    <p className={`text-[10px] font-bold uppercase tracking-tighter ${isCritical ? 'text-rose-400' : 'text-slate-400'}`}>{officer.department} Division</p>
                  </div>
                </div>
                <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest border ${isBusy
                  ? (isCritical ? 'bg-rose-500 border-rose-600 text-white' : 'bg-rose-50 border-rose-100 text-rose-600')
                  : 'bg-emerald-50 border-emerald-100 text-emerald-600'
                  }`}>
                  {isCritical ? 'CRITICAL OPS' : officer.status}
                </span>
              </div>

              {/* Deployment Details */}
              <div className="p-5">
                {isBusy && activeTask ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-[9px] font-black uppercase ${isCritical ? 'text-rose-500' : 'text-indigo-500'}`}>
                        {isCritical ? '⚠️ High Risk Operation' : 'Active Operation'}
                      </span>
                      <span className="text-[9px] font-bold text-slate-300">#GRV-{activeTask._id.slice(-6)}</span>
                    </div>
                    <p className="text-xs font-bold text-slate-800 line-clamp-2 leading-relaxed">"{activeTask.description}"</p>
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div className="space-y-1">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter flex items-center gap-1">
                          <MapPin size={10} className={isCritical ? "text-rose-500" : "text-rose-400"} /> Location
                        </p>
                        <p className="text-[10px] font-black text-slate-700 truncate">{activeTask.location || "Sector Sync..."}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter flex items-center gap-1">
                          <Briefcase size={10} className="text-indigo-400" /> Dept
                        </p>
                        <p className="text-[10px] font-black text-slate-700 truncate">{activeTask.department}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter flex items-center gap-1">
                          <Calendar size={10} className="text-slate-400" /> Filed Date
                        </p>
                        <p className="text-[10px] font-black text-slate-700">{formatDate(activeTask.createdAt)}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[8px] font-black text-rose-400 uppercase tracking-tighter flex items-center gap-1">
                          <Clock size={10} /> Due Date
                        </p>
                        <p className={`text-[10px] font-black ${isCritical ? 'text-rose-600 animate-pulse' : 'text-rose-600'}`}>
                          {getDueTime(activeTask.assignedDate, activeTask.priority)}
                        </p>
                      </div>
                    </div>
                    <button className={`w-full py-2.5 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:opacity-90 transition-all ${isCritical ? 'bg-rose-600 shadow-lg shadow-rose-200' : 'bg-slate-900'}`}>
                      <ExternalLink size={12} /> {isCritical ? 'Emergency Intel' : 'Full Intel'}
                    </button>
                  </div>
                ) : (
                  <div className="py-4 text-center space-y-3">
                    <Activity size={20} className="text-slate-200 mx-auto" />
                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Awaiting Dispatch</p>
                    {waitingComplaints.length > 0 && (
                      <button
                        onClick={() => setAssignModal({ officer })}
                        className="w-full py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all"
                      >
                        <UserPlus size={12} /> Assign Task
                      </button>
                    )}
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Manual Assignment Modal */}
      {assignModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-black text-slate-900">Assign Task to {assignModal.officer.name}</h3>
              <button onClick={() => setAssignModal(null)} className="p-1 hover:bg-slate-100 rounded-lg"><X size={18} /></button>
            </div>
            <p className="text-sm text-slate-500 mb-4">Select a waiting complaint to assign to this officer.</p>
            <select
              className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 mb-4"
              value={selectedComplaint}
              onChange={e => setSelectedComplaint(e.target.value)}
            >
              <option value="">-- Select a complaint --</option>
              {waitingComplaints.map(c => (
                <option key={c._id} value={c._id}>
                  [{c.department}] P{c.priority} - {c.description?.substring(0, 50)}...
                </option>
              ))}
            </select>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setAssignModal(null)} className="px-4 py-2 text-sm font-bold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200">Cancel</button>
              <button
                onClick={handleManualAssign}
                disabled={!selectedComplaint || assigning}
                className="px-6 py-2 text-sm font-black text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center gap-2"
              >
                {assigning ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} />}
                Assign Now
              </button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
