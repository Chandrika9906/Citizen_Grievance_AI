import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { complaintAPI } from '../../services/api';
import PageContainer from '../../components/layout/PageContainer';
import Card from '../../components/ui/Card';
import { MapPin, Calendar, CheckCircle2, Loader2, AlertCircle, Clock, Zap, CheckCheck } from 'lucide-react';

const PROGRESS_STAGES = [
  { key: 'ASSIGNED', label: 'Assigned', icon: Clock, color: 'blue', desc: 'Task received, not started' },
  { key: 'IN_PROGRESS', label: 'In Progress', icon: Loader2, color: 'indigo', desc: 'Work has begun' },
  { key: 'ONGOING', label: 'Ongoing', icon: Zap, color: 'violet', desc: 'Actively working on site' },
  { key: 'ALMOST_DONE', label: 'Almost Done', icon: CheckCircle2, color: 'orange', desc: 'Final checks remaining' },
  { key: 'RESOLVED', label: 'Done', icon: CheckCheck, color: 'green', desc: 'Issue fully resolved' },
];

const stageIndex = (status) => PROGRESS_STAGES.findIndex(s => s.key === status);

const colorMap = {
  blue: { bg: 'bg-blue-500', ring: 'ring-blue-300', text: 'text-blue-600', light: 'bg-blue-50', border: 'border-blue-200' },
  indigo: { bg: 'bg-indigo-500', ring: 'ring-indigo-300', text: 'text-indigo-600', light: 'bg-indigo-50', border: 'border-indigo-200' },
  violet: { bg: 'bg-violet-500', ring: 'ring-violet-300', text: 'text-violet-600', light: 'bg-violet-50', border: 'border-violet-200' },
  orange: { bg: 'bg-orange-500', ring: 'ring-orange-300', text: 'text-orange-600', light: 'bg-orange-50', border: 'border-orange-200' },
  green: { bg: 'bg-green-500', ring: 'ring-green-300', text: 'text-green-600', light: 'bg-green-50', border: 'border-green-200' },
};

export default function Tasks() {
  const { complaints, loading, refreshData } = useData();
  const { user } = useAuth();
  const [updating, setUpdating] = useState(null);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [resolveTarget, setResolveTarget] = useState(null);
  const [resolveNotes, setResolveNotes] = useState('');

  const myId = (user?._id || user?.id)?.toString();

  const myTasks = complaints.filter(c => {
    const officerId = (c.officerId?._id || c.officerId?.id || c.officerId)?.toString();
    return officerId === myId && c.status !== 'RESOLVED' && c.status !== 'REJECTED';
  });

  const handleProgressUpdate = async (taskId, newStatus) => {
    if (newStatus === 'RESOLVED') {
      setResolveTarget(taskId);
      setShowResolveModal(true);
      return;
    }
    try {
      setUpdating(taskId + newStatus);
      await complaintAPI.updateStatus(taskId, newStatus);
      await refreshData();
    } catch (err) {
      alert('Failed to update. Please try again.');
    } finally {
      setUpdating(null);
    }
  };

  const submitResolve = async () => {
    try {
      setUpdating(resolveTarget);
      await complaintAPI.resolve(resolveTarget, resolveNotes);
      await refreshData();
      setShowResolveModal(false);
      setResolveNotes('');
      setResolveTarget(null);
    } catch (err) {
      alert('Failed to resolve. Please try again.');
    } finally {
      setUpdating(null);
    }
  };

  if (loading) return (
    <PageContainer>
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-indigo-600" size={32} />
      </div>
    </PageContainer>
  );

  return (
    <PageContainer>
      <div className="mb-6">
        <h1 className="text-2xl font-black text-slate-900">My Tasks</h1>
        <p className="text-sm text-slate-500 mt-1">Track and update progress on your active assignments</p>
      </div>

      {/* Summary Bar */}
      <div className="grid grid-cols-5 gap-2 mb-6">
        {PROGRESS_STAGES.map(stage => {
          const count = myTasks.filter(t => t.status === stage.key).length;
          const c = colorMap[stage.color];
          return (
            <div key={stage.key} className={`p-3 rounded-xl ${c.light} ${c.border} border text-center`}>
              <p className={`text-2xl font-black ${c.text}`}>{count}</p>
              <p className={`text-[10px] font-bold uppercase tracking-wider ${c.text} opacity-70`}>{stage.label}</p>
            </div>
          );
        })}
      </div>

      {/* Task Cards */}
      <div className="space-y-4">
        {myTasks.length === 0 ? (
          <div className="text-center py-16 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
            <AlertCircle className="mx-auto h-12 w-12 text-slate-300 mb-3" />
            <h3 className="text-sm font-bold text-slate-700">No active tasks</h3>
            <p className="mt-1 text-sm text-slate-400">You have no pending assignments right now.</p>
          </div>
        ) : (
          myTasks.map(task => {
            const currentIdx = stageIndex(task.status);
            const currentStage = PROGRESS_STAGES[currentIdx] || PROGRESS_STAGES[0];
            const c = colorMap[currentStage.color];
            const nextStage = PROGRESS_STAGES[currentIdx + 1];
            const prevStage = PROGRESS_STAGES[currentIdx - 1];

            return (
              <Card key={task._id} className={`p-0 overflow-hidden border-l-4 ${c.border} shadow-md`}>
                {/* Header */}
                <div className={`px-5 py-3 ${c.light} flex items-center justify-between`}>
                  <div className="flex items-center gap-2">
                    <currentStage.icon size={16} className={c.text} />
                    <span className={`text-xs font-black uppercase tracking-widest ${c.text}`}>{currentStage.label}</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400">#{task._id.slice(-6).toUpperCase()}</span>
                </div>

                {/* Progress Pipeline */}
                <div className="px-5 py-3 border-b border-slate-100">
                  <div className="flex items-center gap-1">
                    {PROGRESS_STAGES.map((stage, idx) => {
                      const done = idx <= currentIdx;
                      const sc = colorMap[stage.color];
                      return (
                        <div key={stage.key} className="flex items-center flex-1">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-black transition-all ${done ? sc.bg : 'bg-slate-200'}`}>
                            {idx + 1}
                          </div>
                          {idx < PROGRESS_STAGES.length - 1 && (
                            <div className={`flex-1 h-1 mx-1 rounded-full transition-all ${idx < currentIdx ? sc.bg : 'bg-slate-200'}`} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex justify-between mt-1">
                    {PROGRESS_STAGES.map((stage, idx) => (
                      <span key={stage.key} className={`text-[9px] font-bold ${idx <= currentIdx ? colorMap[stage.color].text : 'text-slate-300'}`}>
                        {stage.label}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Body */}
                <div className="px-5 py-4">
                  <p className="font-semibold text-slate-900 mb-3 leading-snug">{task.description}</p>
                  <div className="flex flex-wrap gap-3 text-xs text-slate-500 mb-4">
                    <span className="flex items-center gap-1"><MapPin size={12} />{task.location || 'Location N/A'}</span>
                    <span className="flex items-center gap-1"><Calendar size={12} />{new Date(task.createdAt).toLocaleDateString()}</span>
                    <span className={`px-2 py-0.5 rounded-full font-bold ${task.priority >= 4 ? 'bg-red-100 text-red-600' : task.priority === 3 ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'}`}>
                      P{task.priority} {task.priority >= 4 ? '🔴 CRITICAL' : task.priority === 3 ? '🟡 NORMAL' : '🟢 LOW'}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 flex-wrap">
                    {prevStage && currentIdx > 0 && (
                      <button
                        onClick={() => handleProgressUpdate(task._id, prevStage.key)}
                        disabled={!!updating}
                        className="px-3 py-1.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-all"
                      >
                        ← Back to {prevStage.label}
                      </button>
                    )}
                    {nextStage && (
                      <button
                        onClick={() => handleProgressUpdate(task._id, nextStage.key)}
                        disabled={!!updating}
                        className={`flex-1 px-4 py-2 text-xs font-black text-white rounded-xl transition-all hover:scale-105 shadow-md ${colorMap[nextStage.color].bg}`}
                      >
                        {updating === task._id + nextStage.key ? (
                          <Loader2 size={14} className="animate-spin mx-auto" />
                        ) : (
                          `Mark as ${nextStage.label} →`
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Resolve Modal */}
      {showResolveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-lg font-black text-slate-900 mb-1">✅ Confirm Resolution</h3>
            <p className="text-sm text-slate-500 mb-4">Add closing notes to complete this task.</p>
            <textarea
              className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 min-h-[100px] text-sm"
              placeholder="e.g. Pothole filled and road surface leveled. Verified by supervisor."
              value={resolveNotes}
              onChange={e => setResolveNotes(e.target.value)}
              autoFocus
            />
            <div className="flex gap-3 mt-4 justify-end">
              <button onClick={() => setShowResolveModal(false)} className="px-4 py-2 text-sm font-bold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200">Cancel</button>
              <button
                onClick={submitResolve}
                disabled={!resolveNotes.trim() || !!updating}
                className="px-6 py-2 text-sm font-black text-white bg-green-500 rounded-xl hover:bg-green-600 disabled:opacity-50 transition-all"
              >
                {updating ? <Loader2 size={14} className="animate-spin" /> : 'Complete Task ✓'}
              </button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
