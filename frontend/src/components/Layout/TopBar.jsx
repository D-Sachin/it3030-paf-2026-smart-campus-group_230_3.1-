import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Bell, Search, User, ChevronDown, Clock3, Loader2, CheckCircle2, XCircle, Wrench, MessageSquare, Ticket, CalendarCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import ThemeToggle from '../Theme/ThemeToggle';
import NotificationPopup from '../Shared/NotificationPopup';
import notificationService from '../../services/notificationService';
import bookingService from '../../services/bookingService';

const STUDENT_READ_STORAGE_KEY = 'studentBookingNotificationReads';
const STUDENT_APPROVAL_POPUP_STORAGE_KEY = 'studentBookingApprovalPopupShown';

const getStudentReadMap = () => {
  try {
    const raw = localStorage.getItem(STUDENT_READ_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch (error) {
    return {};
  }
};

const saveStudentReadMap = (map) => {
  localStorage.setItem(STUDENT_READ_STORAGE_KEY, JSON.stringify(map));
};

const getStudentApprovalPopupShownMap = () => {
  try {
    const raw = localStorage.getItem(STUDENT_APPROVAL_POPUP_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch (error) {
    return {};
  }
};

const saveStudentApprovalPopupShownMap = (map) => {
  localStorage.setItem(STUDENT_APPROVAL_POPUP_STORAGE_KEY, JSON.stringify(map));
};

const TopBar = () => {
  const { user, logout } = useUser();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationLoading, setNotificationLoading] = useState(false);
  const [notificationError, setNotificationError] = useState("");
  
  const [approvalPopupQueue, setApprovalPopupQueue] = useState([]);
  const [activeApprovalPopup, setActiveApprovalPopup] = useState(null);
  
  const approvalQueueRef = useRef([]);
  const activeApprovalRef = useRef(null);
  const approvalRedirectTimerRef = useRef(null);

  if (!user) return null;

  const getInitials = (name) => {
    if (!name) return '??';
    const parts = name.split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const initials = getInitials(user.name);

  const avatarBg = user.role === 'ADMIN' ? '#1c4f78' : user.role === 'TECHNICIAN' ? '#b45309' : '#15803d';
  const canUseNotifications = ['ADMIN', 'TECHNICIAN', 'USER'].includes(user?.role);
  const isAdmin = user?.role === 'ADMIN';
  const isTechnician = user?.role === 'TECHNICIAN';
  const isStudent = user?.role === 'USER';

  useEffect(() => {
    approvalQueueRef.current = approvalPopupQueue;
  }, [approvalPopupQueue]);

  useEffect(() => {
    activeApprovalRef.current = activeApprovalPopup;
  }, [activeApprovalPopup]);

  const fetchNotifications = useCallback(async ({ silent = false } = {}) => {
    if (!canUseNotifications) {
      return;
    }

    if (!silent) {
      setNotificationLoading(true);
    }
    setNotificationError("");

    try {
      // All roles (ADMIN, TECHNICIAN, USER) now use the server API
      const response = await notificationService.getNotifications();
      const items = response.data?.data || [];
      const serverUnreadCount = Number(response.data?.unreadCount);

      setNotifications(items);
      setUnreadCount(Number.isFinite(serverUnreadCount) ? serverUnreadCount : items.filter((item) => !item.isRead).length);

      // Queue approval popups for students on new BOOKING_APPROVED notifications
      if (isStudent) {
        const shownPopupMap = getStudentApprovalPopupShownMap();
        const queuedIds = new Set(
          approvalQueueRef.current
            .map((item) => item.relatedEntityId)
            .filter((id) => id !== null && id !== undefined)
            .map((id) => String(id))
        );
        if (activeApprovalRef.current?.relatedEntityId != null) {
          queuedIds.add(String(activeApprovalRef.current.relatedEntityId));
        }
        const newApprovalPopups = items.filter((item) => {
          if (item.type !== 'BOOKING_APPROVED') return false;
          const entityId = String(item.relatedEntityId);
          return !shownPopupMap[entityId] && !queuedIds.has(entityId);
        });
        if (newApprovalPopups.length > 0) {
          setApprovalPopupQueue((prev) => [...prev, ...newApprovalPopups]);
        }
      }
    } catch (error) {
      if (!silent) {
        setNotificationError("Failed to load notifications.");
      }
    } finally {
      if (!silent) {
        setNotificationLoading(false);
      }
    }
  }, [canUseNotifications, isStudent]);

  useEffect(() => {
    if (canUseNotifications) {
      fetchNotifications();
    } else {
      setNotifications([]);
      setUnreadCount(0);
      setApprovalPopupQueue([]);
      setActiveApprovalPopup(null);
    }
  }, [canUseNotifications, fetchNotifications]);

  useEffect(() => {
    if (!isStudent) {
      setApprovalPopupQueue([]);
      setActiveApprovalPopup(null);
    }
  }, [isStudent]);

  useEffect(() => {
    if (!activeApprovalPopup && approvalPopupQueue.length > 0) {
      const [nextPopup, ...rest] = approvalPopupQueue;
      setActiveApprovalPopup(nextPopup);
      setApprovalPopupQueue(rest);
    }
  }, [approvalPopupQueue, activeApprovalPopup]);

  useEffect(() => {
    return () => {
      if (approvalRedirectTimerRef.current) {
        window.clearTimeout(approvalRedirectTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isNotificationOpen && canUseNotifications) {
      fetchNotifications();
    }
  }, [isNotificationOpen, canUseNotifications, fetchNotifications]);

  useEffect(() => {
    if (!canUseNotifications) {
      return undefined;
    }

    const refreshNotifications = () => {
      if (!isNotificationOpen) {
        fetchNotifications({ silent: true });
      }
    };

    const intervalId = window.setInterval(refreshNotifications, 30000);
    window.addEventListener('focus', refreshNotifications);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('focus', refreshNotifications);
    };
  }, [canUseNotifications, isNotificationOpen, fetchNotifications]);

  const handleNotificationToggle = () => {
    if (!canUseNotifications) {
      return;
    }

    setIsMenuOpen(false);
    setIsNotificationOpen((prev) => !prev);
  };

  const handleNotificationClick = async (notification) => {
    try {
      let nextUnreadCount = unreadCount;
      if (!notification.isRead) {
        // All roles mark as read via server API
        const response = await notificationService.markAsRead(notification.id);
        const serverUnreadCount = Number(response.data?.unreadCount);
        nextUnreadCount = Number.isFinite(serverUnreadCount) ? serverUnreadCount : Math.max(0, unreadCount - 1);
        setNotifications((prev) => prev.map((item) => (item.id === notification.id ? { ...item, isRead: true } : item)));
        setUnreadCount(nextUnreadCount);
      }

      if (notification.relatedEntityId) {
        // Redirection logic
        if (notification.type?.startsWith('BOOKING')) {
          navigate(`/bookings/${notification.relatedEntityId}`);
        } else if (notification.type === 'TICKET_UPDATED') {
          navigate(`/tickets/${notification.relatedEntityId}`);
        } else {
          // Fallback or generic redirection
          navigate(`/tickets/${notification.relatedEntityId}`);
        }
      }

      if (!notification.isRead) {
        fetchNotifications({ silent: true });
      }

      setIsNotificationOpen(false);
    } catch (error) {
      setNotificationError("Failed to update notification.");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      // All roles use server API
      const response = await notificationService.markAllAsRead();
      const serverUnreadCount = Number(response.data?.unreadCount);
      setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
      setUnreadCount(Number.isFinite(serverUnreadCount) ? serverUnreadCount : 0);
    } catch (error) {
      setNotificationError("Failed to mark notifications as read.");
    }
  };

  const handleClearAll = async () => {
    try {
      if (isAdmin || isTechnician) {
        await notificationService.deleteAllNotifications();
        setNotifications([]);
        setUnreadCount(0);
      } else if (isStudent) {
        saveStudentReadMap({});
        setNotifications([]);
        setUnreadCount(0);
      }
    } catch (error) {
      setNotificationError("Failed to clear notifications.");
    }
  };

  const handleApprovalPopupClose = () => {
    if (approvalRedirectTimerRef.current) {
      window.clearTimeout(approvalRedirectTimerRef.current);
      approvalRedirectTimerRef.current = null;
    }

    if (activeApprovalPopup?.relatedEntityId !== null && activeApprovalPopup?.relatedEntityId !== undefined) {
      const shownPopupMap = getStudentApprovalPopupShownMap();
      shownPopupMap[String(activeApprovalPopup.relatedEntityId)] = true;
      saveStudentApprovalPopupShownMap(shownPopupMap);
    }

    setActiveApprovalPopup(null);
  };

  useEffect(() => {
    if (!isStudent || !activeApprovalPopup) {
      return undefined;
    }

    if (approvalRedirectTimerRef.current) {
      window.clearTimeout(approvalRedirectTimerRef.current);
    }

    approvalRedirectTimerRef.current = window.setTimeout(() => {
      handleApprovalPopupClose();
    }, 5000);

    return () => {
      if (approvalRedirectTimerRef.current) {
        window.clearTimeout(approvalRedirectTimerRef.current);
        approvalRedirectTimerRef.current = null;
      }
    };
  }, [activeApprovalPopup, isStudent]);

  return (
    <>
      <header
        className="h-[72px] sticky top-0 z-40 px-8 flex items-center justify-between backdrop-blur-md"
        style={{ backgroundColor: 'rgba(6, 20, 27, 0.92)', borderBottom: '1px solid #253745' }}
      >
        {/* Search Bar */}
        <div className="flex-1 max-w-md">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#9BA8AB' }} />
            <input
              type="text"
              placeholder="Search for resources, tickets..."
              className="w-full rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none transition-all"
              style={{ backgroundColor: '#11212D', border: '1px solid #253745', color: '#CCD0CF' }}
            />
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleNotificationToggle}
            className="p-2.5 rounded-xl relative group transition-all"
            style={{ 
              color: isNotificationOpen ? '#CCD0CF' : '#9BA8AB',
              backgroundColor: isNotificationOpen ? '#253745' : 'transparent',
              border: isNotificationOpen ? '1px solid #4A5C6A' : '1px solid transparent'
            }}
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full" style={{ border: '2px solid #06141B' }}></span>
            )}
            
            {/* Notification Dropdown */}
            {isNotificationOpen && (
              <div 
                className="absolute right-0 mt-3 w-[400px] rounded-2xl shadow-xl z-50 overflow-hidden text-left" 
                onClick={e => e.stopPropagation()}
                style={{ backgroundColor: '#11212D', border: '1px solid #253745' }}
              >
                <div className="p-4 flex items-center justify-between" style={{ backgroundColor: '#06141B', borderBottom: '1px solid #253745' }}>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#CCD0CF' }}>Notifications</span>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500 text-white">
                        {unreadCount} NEW
                      </span>
                    )}
                  </div>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={handleMarkAllAsRead}
                        className="text-[10px] font-black uppercase tracking-widest hover:opacity-80 transition-opacity"
                        style={{ color: '#1c4f78' }}
                      >
                        Mark all read
                      </button>
                      <span className="h-3 w-[1px]" style={{ backgroundColor: '#253745' }}></span>
                      <button 
                        onClick={handleClearAll}
                        className="text-[10px] font-black uppercase tracking-widest hover:opacity-80 transition-opacity text-red-500"
                      >
                        Clear all
                      </button>
                    </div>
                </div>
                
                <div className="max-h-[480px] overflow-y-auto custom-scrollbar">
                  {notificationLoading && notifications.length === 0 ? (
                    <div className="p-12 flex flex-col items-center justify-center gap-4">
                      <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#1c4f78' }} />
                      <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#4A5C6A' }}>Syncing alerts...</p>
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="p-12 text-center">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#06141B' }}>
                        <Bell className="w-6 h-6" style={{ color: '#253745' }} />
                      </div>
                      <p className="text-xs font-bold" style={{ color: '#4A5C6A' }}>No alerts found in the ledger.</p>
                    </div>
                  ) : (
                    <div className="divide-y" style={{ divideColor: '#253745' }}>
                      {notifications.map((n) => {
                        // Determine icon and accent colour per notification type
                        const typeConfig = {
                          BOOKING_APPROVED: { Icon: CheckCircle2, color: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
                          BOOKING_REJECTED: { Icon: XCircle, color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
                          BOOKING_CREATED:  { Icon: CalendarCheck, color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
                          TICKET_CREATED:   { Icon: Ticket, color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
                          TICKET_ASSIGNED:  { Icon: Wrench, color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
                          TICKET_UPDATED:   { Icon: Wrench, color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
                          TICKET_COMMENTED: { Icon: MessageSquare, color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)' },
                        }[n.type] || { Icon: Bell, color: '#9BA8AB', bg: 'rgba(155,168,171,0.1)' };
                        const { Icon, color, bg } = typeConfig;
                        return (
                        <div 
                          key={n.id} 
                          onClick={() => handleNotificationClick(n)}
                          className="p-4 transition-all hover:bg-[#253745] cursor-pointer group"
                          style={{ borderBottom: '1px solid #1a2e3a' }}
                        >
                          <div className="flex gap-3">
                            {/* Type icon */}
                            <div className="shrink-0 w-8 h-8 rounded-xl flex items-center justify-center mt-0.5" style={{ backgroundColor: bg }}>
                              <Icon className="w-4 h-4" style={{ color }} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className={`text-sm ${!n.isRead ? 'font-black' : 'font-medium'} truncate`} style={{ color: '#CCD0CF' }}>{n.title}</p>
                                {!n.isRead && <span className="shrink-0 w-2 h-2 rounded-full" style={{ backgroundColor: color }} />}
                              </div>
                              <p className="text-xs mt-1 leading-relaxed" style={{ color: '#9BA8AB' }}>{n.message}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <Clock3 className="w-3 h-3" style={{ color: '#4A5C6A' }} />
                                <span className="text-[10px] font-bold" style={{ color: '#4A5C6A' }}>
                                  {new Date(n.createdAt).toLocaleString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </button>

          <div className="h-8 w-[1px]" style={{ backgroundColor: '#253745' }}></div>

          {/* User Profile */}
          <div className="relative">
            <button
              onClick={() => { setIsMenuOpen(!isMenuOpen); setIsNotificationOpen(false); }}
              className="flex items-center gap-3 p-1.5 pr-3 rounded-xl transition-all"
              style={isMenuOpen
                ? { backgroundColor: '#253745', border: '1px solid #4A5C6A' }
                : { border: '1px solid transparent' }}
            >
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm shadow-sm"
                style={{ backgroundColor: avatarBg, color: '#CCD0CF' }}
              >
                {initials}
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-sm font-semibold leading-none" style={{ color: '#CCD0CF' }}>{user.name}</p>
                <p className="text-[10px] font-bold mt-1 uppercase tracking-wider" style={{ color: '#9BA8AB' }}>{user.role}</p>
              </div>
              <ChevronDown className={`w-4 h-4 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} style={{ color: '#9BA8AB' }} />
            </button>

            {/* Dropdown Menu */}
            {isMenuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setIsMenuOpen(false)}></div>
                <div
                  className="absolute right-0 mt-3 w-56 rounded-2xl shadow-xl z-20 overflow-hidden"
                  style={{ backgroundColor: '#11212D', border: '1px solid #253745' }}
                >
                  <div className="p-4" style={{ backgroundColor: '#06141B', borderBottom: '1px solid #253745' }}>
                    <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#4A5C6A' }}>Signed in as</p>
                    <p className="text-xs font-bold truncate mt-1" style={{ color: '#CCD0CF' }}>{user.email}</p>
                  </div>
                  <div className="p-2">
                    <button
                      className="w-full flex items-center gap-3 p-3 rounded-xl text-sm font-medium transition-all"
                      style={{ color: '#9BA8AB' }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = '#253745'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                      onClick={() => { navigate('/profile'); setIsMenuOpen(false); }}
                    >
                      <User className="w-4 h-4" />
                      My Profile
                    </button>
                    <button
                      onClick={() => { logout(); setIsMenuOpen(false); }}
                      className="w-full flex items-center gap-3 p-3 rounded-xl text-sm font-bold transition-all mt-1"
                      style={{ color: '#ef4444' }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.1)'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </header>
      
      {/* Student Approval Popup */}
      <NotificationPopup 
        notification={activeApprovalPopup}
        onClose={handleApprovalPopupClose}
      />
    </>
);
};

export default TopBar;
