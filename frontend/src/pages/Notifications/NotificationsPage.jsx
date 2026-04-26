import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell, CheckCircle2, XCircle, Wrench, MessageSquare, Ticket,
  CalendarCheck, Clock3, Loader2, CheckCheck, Trash2, Filter
} from 'lucide-react';
import notificationService from '../../services/notificationService';

const TYPE_CONFIG = {
  BOOKING_APPROVED: { Icon: CheckCircle2, color: '#22c55e', bg: 'rgba(34,197,94,0.12)', label: 'Booking' },
  BOOKING_REJECTED: { Icon: XCircle,       color: '#ef4444', bg: 'rgba(239,68,68,0.12)',  label: 'Booking' },
  BOOKING_CREATED:  { Icon: CalendarCheck, color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', label: 'Booking' },
  TICKET_CREATED:   { Icon: Ticket,        color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', label: 'Ticket'  },
  TICKET_ASSIGNED:  { Icon: Wrench,        color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', label: 'Ticket'  },
  TICKET_UPDATED:   { Icon: Wrench,        color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', label: 'Ticket'  },
  TICKET_COMMENTED: { Icon: MessageSquare, color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)', label: 'Ticket'  },
};

const FILTERS = ['All', 'Unread', 'Bookings', 'Tickets'];

const groupByDate = (notifications) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const groups = { Today: [], Yesterday: [], Earlier: [] };
  notifications.forEach((n) => {
    const d = new Date(n.createdAt);
    d.setHours(0, 0, 0, 0);
    if (d.getTime() === today.getTime()) groups.Today.push(n);
    else if (d.getTime() === yesterday.getTime()) groups.Yesterday.push(n);
    else groups.Earlier.push(n);
  });
  return groups;
};

const NotificationsPage = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [markingAll, setMarkingAll] = useState(false);
  const [clearing, setClearing] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await notificationService.getNotifications();
      setNotifications(response.data?.data || []);
    } catch {
      setError('Failed to load notifications. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const filtered = notifications.filter((n) => {
    if (activeFilter === 'Unread') return !n.isRead;
    if (activeFilter === 'Bookings') return n.type?.startsWith('BOOKING');
    if (activeFilter === 'Tickets') return n.type?.startsWith('TICKET');
    return true;
  });

  const groups = groupByDate(filtered);
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleClick = async (n) => {
    if (!n.isRead) {
      try {
        await notificationService.markAsRead(n.id);
        setNotifications((prev) =>
          prev.map((item) => (item.id === n.id ? { ...item, isRead: true } : item))
        );
      } catch { /* non-blocking */ }
    }
    if (n.relatedEntityId) {
      if (n.type?.startsWith('BOOKING')) navigate(`/bookings/${n.relatedEntityId}`);
      else navigate(`/tickets/${n.relatedEntityId}`);
    }
  };

  const handleMarkAllRead = async () => {
    setMarkingAll(true);
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch { /* non-blocking */ }
    finally { setMarkingAll(false); }
  };

  const handleClearAll = async () => {
    setClearing(true);
    try {
      await notificationService.deleteAllNotifications();
      setNotifications([]);
    } catch { /* non-blocking */ }
    finally { setClearing(false); }
  };

  const NotificationItem = ({ n }) => {
    const cfg = TYPE_CONFIG[n.type] || { Icon: Bell, color: '#9BA8AB', bg: 'rgba(155,168,171,0.1)' };
    const { Icon, color, bg } = cfg;
    return (
      <div
        onClick={() => handleClick(n)}
        className="flex gap-4 p-5 cursor-pointer transition-all rounded-2xl mb-2"
        style={{
          backgroundColor: n.isRead ? 'transparent' : 'rgba(28,79,120,0.08)',
          border: `1px solid ${n.isRead ? '#1a2e3a' : '#1c4f78'}`,
        }}
        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#11212D'; }}
        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = n.isRead ? 'transparent' : 'rgba(28,79,120,0.08)'; }}
      >
        <div className="shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center" style={{ backgroundColor: bg }}>
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className={`text-sm ${n.isRead ? 'font-medium' : 'font-bold'}`} style={{ color: '#CCD0CF' }}>
              {n.title}
            </p>
            {!n.isRead && (
              <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-black uppercase" style={{ backgroundColor: color, color: '#fff' }}>
                NEW
              </span>
            )}
          </div>
          <p className="text-sm leading-relaxed" style={{ color: '#9BA8AB' }}>{n.message}</p>
          <div className="flex items-center gap-2 mt-2">
            <Clock3 className="w-3 h-3" style={{ color: '#4A5C6A' }} />
            <span className="text-[11px] font-semibold" style={{ color: '#4A5C6A' }}>
              {new Date(n.createdAt).toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: '#06141B' }}>
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black" style={{ color: '#CCD0CF' }}>Notifications</h1>
          <p className="text-sm mt-1 font-medium" style={{ color: '#9BA8AB' }}>
            {unreadCount > 0 ? `${unreadCount} unread alert${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleMarkAllRead}
            disabled={markingAll || unreadCount === 0}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-40"
            style={{ backgroundColor: '#11212D', border: '1px solid #253745', color: '#CCD0CF' }}
          >
            {markingAll ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCheck className="w-4 h-4" />}
            Mark all read
          </button>
          <button
            onClick={handleClearAll}
            disabled={clearing || notifications.length === 0}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-40"
            style={{ backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444' }}
          >
            {clearing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            Clear all
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-6 p-1 rounded-2xl w-fit" style={{ backgroundColor: '#11212D', border: '1px solid #253745' }}>
        <Filter className="w-4 h-4 ml-3" style={{ color: '#4A5C6A' }} />
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className="px-4 py-2 rounded-xl text-sm font-bold transition-all"
            style={{
              backgroundColor: activeFilter === f ? '#1c4f78' : 'transparent',
              color: activeFilter === f ? '#CCD0CF' : '#9BA8AB',
              border: activeFilter === f ? '1px solid #4A5C6A' : '1px solid transparent',
            }}
          >
            {f}
            {f === 'Unread' && unreadCount > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-black bg-red-500 text-white">{unreadCount}</span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <Loader2 className="w-10 h-10 animate-spin" style={{ color: '#1c4f78' }} />
          <p className="text-sm font-bold uppercase tracking-widest" style={{ color: '#4A5C6A' }}>Loading alerts...</p>
        </div>
      ) : error ? (
        <div className="text-center py-20">
          <p className="text-sm font-bold" style={{ color: '#ef4444' }}>{error}</p>
          <button onClick={fetchNotifications} className="mt-4 text-sm font-bold underline" style={{ color: '#1c4f78' }}>Retry</button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <div className="w-16 h-16 rounded-3xl flex items-center justify-center" style={{ backgroundColor: '#11212D' }}>
            <Bell className="w-8 h-8" style={{ color: '#253745' }} />
          </div>
          <p className="text-base font-bold" style={{ color: '#4A5C6A' }}>No {activeFilter !== 'All' ? activeFilter.toLowerCase() : ''} notifications found.</p>
        </div>
      ) : (
        <div className="max-w-3xl">
          {Object.entries(groups).map(([group, items]) =>
            items.length === 0 ? null : (
              <div key={group} className="mb-8">
                <p className="text-[11px] font-black uppercase tracking-widest mb-3" style={{ color: '#4A5C6A' }}>{group}</p>
                {items.map((n) => <NotificationItem key={n.id} n={n} />)}
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
