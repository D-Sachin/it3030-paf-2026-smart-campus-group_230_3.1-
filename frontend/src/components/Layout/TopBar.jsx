import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Bell, Search, User, ChevronDown, Clock3, Loader2, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import ThemeToggle from '../Theme/ThemeToggle';
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationLoading, setNotificationLoading] = useState(false);
  const [notificationError, setNotificationError] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const [approvalPopupQueue, setApprovalPopupQueue] = useState([]);
  const [activeApprovalPopup, setActiveApprovalPopup] = useState(null);
  const approvalQueueRef = useRef([]);
  const activeApprovalRef = useRef(null);
  const navigate = useNavigate();

  if (!user) return null;

  const getInitials = (name) => {
    if (!name) return '??';
    const parts = name.split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const initials = getInitials(user.name);

  const canUseNotifications = ['ADMIN', 'USER'].includes(user?.role);
  const isAdmin = user?.role === 'ADMIN';
  const isStudent = user?.role === 'USER';

  useEffect(() => {
    approvalQueueRef.current = approvalPopupQueue;
  }, [approvalPopupQueue]);

  useEffect(() => {
    activeApprovalRef.current = activeApprovalPopup;
  }, [activeApprovalPopup]);

  const fetchStudentBookingNotifications = useCallback(async () => {
    const response = await bookingService.getMyBookings();
    const bookings = response.data?.data || [];
    const readMap = getStudentReadMap();

    const decisionNotifications = bookings
      .filter((booking) => booking.status === 'APPROVED' || booking.status === 'REJECTED')
      .map((booking) => {
        const isRejected = booking.status === 'REJECTED';
        const reason = booking.decisionReason?.trim();

        return {
          id: `booking-${booking.id}`,
          relatedEntityId: booking.id,
          title: isRejected ? 'Booking Rejected' : 'Booking Approved',
          message: isRejected
            ? `Your booking for ${booking.resourceName} on ${booking.bookingDate} was rejected.${reason ? ` Reason: ${reason}` : ''}`
            : `Your booking for ${booking.resourceName} on ${booking.bookingDate} was approved.`,
          isRead: Boolean(readMap[String(booking.id)]),
          createdAt: booking.updatedAt || booking.createdAt,
          type: isRejected ? 'BOOKING_REJECTED' : 'BOOKING_APPROVED',
        };
      })
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

    const shownPopupMap = getStudentApprovalPopupShownMap();
    const queuedIds = new Set(
      approvalQueueRef.current
        .map((item) => item.relatedEntityId)
        .filter((id) => id !== null && id !== undefined)
        .map((id) => String(id))
    );

    if (activeApprovalRef.current?.relatedEntityId !== null && activeApprovalRef.current?.relatedEntityId !== undefined) {
      queuedIds.add(String(activeApprovalRef.current.relatedEntityId));
    }

    const newApprovalPopups = decisionNotifications.filter((item) => {
      if (item.type !== 'BOOKING_APPROVED') {
        return false;
      }

      const bookingId = String(item.relatedEntityId);
      return !shownPopupMap[bookingId] && !queuedIds.has(bookingId);
    });

    if (newApprovalPopups.length > 0) {
      setApprovalPopupQueue((prev) => [...prev, ...newApprovalPopups]);
    }

    setNotifications(decisionNotifications);
    setUnreadCount(decisionNotifications.filter((item) => !item.isRead).length);
  }, []);

  const fetchNotifications = useCallback(async ({ silent = false } = {}) => {
    if (!canUseNotifications) {
      return;
    }

    if (!silent) {
      setNotificationLoading(true);
    }
    setNotificationError("");

    try {
      if (isAdmin) {
        const response = await notificationService.getNotifications();
        const items = response.data?.data || [];
        const serverUnreadCount = Number(response.data?.unreadCount);

        setNotifications(items);
        setUnreadCount(Number.isFinite(serverUnreadCount) ? serverUnreadCount : items.filter((item) => !item.isRead).length);
      } else if (isStudent) {
        await fetchStudentBookingNotifications();
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
  }, [canUseNotifications, isAdmin, isStudent, fetchStudentBookingNotifications]);

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

      if (!notification.isRead && isAdmin) {
        const response = await notificationService.markAsRead(notification.id);
        const serverUnreadCount = Number(response.data?.unreadCount);
        nextUnreadCount = Number.isFinite(serverUnreadCount) ? serverUnreadCount : Math.max(0, unreadCount - 1);
        setNotifications((prev) => prev.map((item) => (item.id === notification.id ? { ...item, isRead: true } : item)));
        setUnreadCount(nextUnreadCount);
      } else if (!notification.isRead && isStudent) {
        const readMap = getStudentReadMap();
        const bookingId = String(notification.relatedEntityId);
        readMap[bookingId] = true;
        saveStudentReadMap(readMap);

        setNotifications((prev) => prev.map((item) => (
          item.id === notification.id ? { ...item, isRead: true } : item
        )));
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }

      if (notification.relatedEntityId) {
        navigate(`/bookings/${notification.relatedEntityId}`);
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
      if (isAdmin) {
        const response = await notificationService.markAllAsRead();
        const serverUnreadCount = Number(response.data?.unreadCount);
        setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
        setUnreadCount(Number.isFinite(serverUnreadCount) ? serverUnreadCount : 0);
      } else if (isStudent) {
        const readMap = getStudentReadMap();
        notifications.forEach((notification) => {
          if (notification.relatedEntityId) {
            readMap[String(notification.relatedEntityId)] = true;
          }
        });
        saveStudentReadMap(readMap);
        setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
        setUnreadCount(0);
      }
    } catch (error) {
      setNotificationError("Failed to mark notifications as read.");
    }
  };

  const handleApprovalPopupClose = () => {
    if (activeApprovalPopup?.relatedEntityId !== null && activeApprovalPopup?.relatedEntityId !== undefined) {
      const shownPopupMap = getStudentApprovalPopupShownMap();
      shownPopupMap[String(activeApprovalPopup.relatedEntityId)] = true;
      saveStudentApprovalPopupShownMap(shownPopupMap);
    }

    setActiveApprovalPopup(null);
  };

  return (
    <>
      <header className="h-[72px] bg-gradient-to-r from-primary-700 to-primary-600 dark:from-primary-800 dark:to-primary-700 border-b border-primary-500/40 dark:border-primary-600/60 shadow-sm sticky top-0 z-40 px-8 flex items-center justify-between">
        {/* Search Bar */}
        <div className="flex-1 max-w-md">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/70 group-focus-within:text-white transition-colors" />
            <input 
              type="text" 
              placeholder="Search for resources, tickets..." 
              className="w-full bg-white/15 border border-white/25 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-white/70 focus:ring-2 focus:ring-white/35 focus:border-white/50 outline-none transition-all"
            />
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
        <ThemeToggle className="border-white/30 bg-white/15 text-white hover:bg-white/25 hover:border-white/40 dark:border-white/30 dark:bg-white/15 dark:text-white dark:hover:bg-white/25 dark:hover:border-white/40" />

        <div className="relative">
          <button
            onClick={handleNotificationToggle}
            className="p-2.5 rounded-xl text-white/85 hover:bg-white/15 relative group transition-all border border-transparent hover:border-white/30"
          >
            <Bell className="w-5 h-5" />
            {canUseNotifications && unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-primary-700">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {isNotificationOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setIsNotificationOpen(false)}></div>
              <div className="absolute right-0 mt-3 w-96 bg-slate-50/95 border border-slate-200 rounded-2xl shadow-xl shadow-slate-900/20 z-20 overflow-hidden animate-scale-in">
                <div className="p-4 bg-white/80 border-b border-slate-200 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                      <Clock3 className="w-3.5 h-3.5" /> Notifications
                    </p>
                    <p className="text-sm font-bold text-slate-900 mt-1">{isAdmin ? 'Admin Updates' : 'My Booking Updates'}</p>
                  </div>
                  {notifications.some((item) => !item.isRead) && (
                    <button
                      onClick={handleMarkAllAsRead}
                      className="text-xs font-bold text-primary-600 hover:text-primary-700"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                <div className="max-h-96 overflow-y-auto">
                  {notificationLoading ? (
                    <div className="p-8 flex flex-col items-center justify-center text-slate-500">
                      <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
                      <p className="text-sm mt-2">Loading notifications...</p>
                    </div>
                  ) : notificationError ? (
                    <div className="p-4 text-sm text-red-600 bg-red-50">{notificationError}</div>
                  ) : notifications.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 text-sm">No notifications yet.</div>
                  ) : (
                    <div className="p-2 space-y-2">
                      {notifications.map((notification) => {
                        const isApproved = notification.type === 'BOOKING_APPROVED';
                        const isRejected = notification.type === 'BOOKING_REJECTED';
                        
                        let statusColor = 'primary'; // default color
                        if (isApproved) statusColor = 'green';
                        if (isRejected) statusColor = 'red';

                        const colorClasses = {
                          bg: {
                            read: statusColor === 'red' ? 'bg-white' : statusColor === 'green' ? 'bg-white' : 'bg-white',
                            unread: statusColor === 'red' ? 'bg-red-50' : statusColor === 'green' ? 'bg-green-50' : 'bg-primary-50'
                          },
                          border: {
                            read: 'border-slate-200',
                            unread: statusColor === 'red' ? 'border-red-100' : statusColor === 'green' ? 'border-green-100' : 'border-primary-100'
                          },
                          hover: {
                            read: 'hover:bg-slate-100',
                            unread: statusColor === 'red' ? 'hover:bg-red-100' : statusColor === 'green' ? 'hover:bg-green-100' : 'hover:bg-primary-100'
                          },
                          dot: {
                            read: 'bg-slate-300',
                            unread: statusColor === 'red' ? 'bg-red-500' : statusColor === 'green' ? 'bg-green-500' : 'bg-primary-500'
                          },
                          icon: {
                            unread: statusColor === 'red' ? 'text-red-500' : statusColor === 'green' ? 'text-green-500' : 'text-primary-500'
                          }
                        };

                        return (
                          <button
                            key={notification.id}
                            onClick={() => handleNotificationClick(notification)}
                            className={`w-full text-left rounded-xl border p-3 transition-all ${
                              notification.isRead
                                ? `${colorClasses.bg.read} ${colorClasses.border.read} ${colorClasses.hover.read}`
                                : `${colorClasses.bg.unread} ${colorClasses.border.unread} ${colorClasses.hover.unread}`
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`mt-1 w-2.5 h-2.5 rounded-full ${notification.isRead ? colorClasses.dot.read : colorClasses.dot.unread}`} />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-3">
                                  <p className="text-sm font-bold text-slate-900 truncate">{notification.title}</p>
                                  {!notification.isRead && <CheckCircle2 className={`w-4 h-4 ${colorClasses.icon.unread} shrink-0`} />}
                                </div>
                                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{notification.message}</p>
                                <p className="text-[11px] text-slate-400 mt-2">
                                  {notification.createdAt ? new Date(notification.createdAt).toLocaleString() : 'Just now'}
                                </p>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="h-8 w-[1px] bg-white/30 mx-2"></div>

        {/* User Profile */}
        <div className="relative">
          <button 
            onClick={() => {
              setIsMenuOpen(!isMenuOpen);
              setIsNotificationOpen(false);
            }}
            className={`flex items-center gap-3 p-1.5 pr-3 rounded-xl transition-all border ${
              isMenuOpen ? 'bg-white/20 border-white/35 shadow-sm' : 'border-transparent hover:bg-white/15 hover:border-white/30'
            }`}
          >
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-white shadow-sm transition-colors ${
              user.role === 'ADMIN' ? 'bg-primary-600' : 
              user.role === 'TECHNICIAN' ? 'bg-orange-500' : 'bg-green-500'
            }`}>
              {initials}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-sm font-semibold text-white leading-none">{user.name}</p>
              <p className="text-[10px] font-bold text-white/70 mt-1 uppercase tracking-wider">{user.role}</p>
            </div>
            <ChevronDown className={`w-4 h-4 text-white/70 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* User Menu */}
          {isMenuOpen && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setIsMenuOpen(false)}
              ></div>
              <div className="absolute right-0 mt-3 w-56 bg-slate-50/95 dark:bg-slate-200 border border-slate-200 dark:border-slate-300 rounded-2xl shadow-xl shadow-slate-900/20 z-20 overflow-hidden animate-scale-in">
                <div className="p-4 bg-white/70 dark:bg-slate-100 border-b border-slate-100 dark:border-slate-300">
                  <p className="text-[10px] font-bold text-slate-500 dark:text-slate-700 uppercase tracking-widest">Signed in as</p>
                  <p className="text-xs font-bold text-slate-900 truncate mt-1">{user.email}</p>
                </div>
                <div className="p-2">
                  <button className="w-full flex items-center gap-3 p-3 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-800 hover:bg-slate-100 dark:hover:bg-slate-100 transition-all">
                    <User className="w-4 h-4 text-slate-500 dark:text-slate-700" />
                    My Profile
                  </button>
                  <button 
                    onClick={() => {
                      logout();
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 p-3 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-100 transition-all mt-1"
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

      {isStudent && activeApprovalPopup && (
        <div className="fixed inset-0 z-[120] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border border-emerald-100 rounded-3xl shadow-2xl p-6 animate-scale-in">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-600">Booking Update</p>
                <h3 className="text-lg font-bold text-slate-900 mt-1">Booking Approved</h3>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                  {activeApprovalPopup.message}
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={handleApprovalPopupClose}
                className="px-5 py-2.5 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-700 font-bold text-sm"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TopBar;
