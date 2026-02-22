import { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import PageContainer from '../../components/layout/PageContainer';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import {
  Bell, CheckCheck, Trash2, AlertCircle, Info,
  CheckCircle, Clock, Filter, Sparkles, Megaphone,
  ShieldCheck, MessageSquare
} from 'lucide-react';

export default function Notifications() {
  const { notifications, markNotificationRead, deleteNotification, loading } = useData();
  const [filter, setFilter] = useState('all');

  const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);

  const stats = useMemo(() => {
    return {
      total: notifications.length,
      unread: unreadCount,
      updates: notifications.filter(n => n.type === 'success' || n.type === 'info').length,
      alerts: notifications.filter(n => n.type === 'error' || n.type === 'warning').length
    };
  }, [notifications, unreadCount]);

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.read;
    if (filter === 'read') return n.read;
    return true;
  });

  const markAllAsRead = async () => {
    const unread = notifications.filter(n => !n.read);
    for (const notif of unread) {
      await markNotificationRead(notif._id);
    }
  };

  const clearAll = async () => {
    if (window.confirm('Are you sure you want to delete all notifications?')) {
      for (const notif of notifications) {
        await deleteNotification(notif._id);
      }
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-emerald-600" />;
      case 'warning': return <AlertCircle className="w-5 h-5 text-amber-600" />;
      case 'info': return <Info className="w-5 h-5 text-indigo-600" />;
      case 'error': return <AlertCircle className="w-5 h-5 text-rose-600" />;
      default: return <Bell className="w-5 h-5 text-slate-600" />;
    }
  };

  const getIconBg = (type) => {
    switch (type) {
      case 'success': return 'bg-emerald-100/50';
      case 'warning': return 'bg-amber-100/50';
      case 'info': return 'bg-indigo-100/50';
      case 'error': return 'bg-rose-100/50';
      default: return 'bg-slate-100/50';
    }
  };

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString();
  };

  if (loading) {
    return (
      <PageContainer>
        <div className="flex flex-col items-center justify-center h-96 space-y-4">
          <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium animate-pulse">Syncing your activity...</p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              Activity Center
            </h1>
            <p className="text-slate-500 mt-1 flex items-center gap-2">
              <Sparkles size={14} className="text-amber-500" />
              Stay updated with your complaint progress and system alerts
            </p>
          </div>
          <div className="flex items-center gap-3">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl hover:bg-indigo-100 transition-all text-sm font-semibold border border-indigo-100"
              >
                <CheckCheck size={16} />
                Catch Up All
              </button>
            )}
            <button
              onClick={clearAll}
              className="flex items-center gap-2 px-4 py-2 bg-white text-slate-600 rounded-xl hover:bg-slate-50 transition-all text-sm font-semibold border border-slate-200"
            >
              <Trash2 size={16} />
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Summary Stats Card */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Logs', value: stats.total, icon: Bell, color: 'text-slate-600', bg: 'bg-slate-50' },
          { label: 'Pending', value: stats.unread, icon: Clock, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Updates', value: stats.updates, icon: Megaphone, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Alerts', value: stats.alerts, icon: ShieldCheck, color: 'text-rose-600', bg: 'bg-rose-50' },
        ].map((stat, i) => (
          <div key={i} className={`${stat.bg} p-4 rounded-2xl border border-white/50 shadow-sm transition-transform hover:-translate-y-1`}>
            <div className="flex items-center justify-between mb-2">
              <stat.icon size={18} className={stat.color} />
              <span className={`text-lg font-bold ${stat.color}`}>{stat.value}</span>
            </div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-6 p-1 bg-slate-100/80 rounded-xl w-fit">
        {['all', 'unread', 'read'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${filter === f
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
              }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Notification List */}
      {filteredNotifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 glass rounded-3xl border-2 border-dashed border-slate-200 text-center">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
            <MessageSquare className="w-8 h-8 text-slate-300" />
          </div>
          <h3 className="text-slate-900 font-bold text-lg">Clean Slate!</h3>
          <p className="text-slate-500 max-w-xs mx-auto">
            You don't have any {filter === 'all' ? '' : filter} notifications at the moment.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filteredNotifications.map(notif => (
            <div
              key={notif._id}
              className={`group flex items-center gap-4 p-4 glass rounded-2xl border transition-all hover:bg-white/80 hover:shadow-xl hover:scale-[1.01] ${!notif.read ? 'border-l-4 border-l-indigo-500 border-indigo-100 bg-indigo-50/20' : 'border-slate-100 bg-white/50'
                }`}
            >
              <div className={`w-12 h-12 rounded-xl ${getIconBg(notif.type)} flex items-center justify-center flex-shrink-0 transition-transform group-hover:rotate-12`}>
                {getIcon(notif.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <h3 className={`text-sm tracking-tight ${!notif.read ? 'font-bold text-slate-900' : 'font-semibold text-slate-700'}`}>
                      {notif.title}
                    </h3>
                    {!notif.read && <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>}
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                    {getTimeAgo(notif.createdAt)}
                  </span>
                </div>
                <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">{notif.message}</p>
              </div>

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {!notif.read && (
                  <button
                    onClick={() => markNotificationRead(notif._id)}
                    className="p-2 hover:bg-indigo-100 text-indigo-600 rounded-lg transition-colors"
                  >
                    <CheckCheck size={18} />
                  </button>
                )}
                <button
                  onClick={() => deleteNotification(notif._id)}
                  className="p-2 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </PageContainer>
  );
}

