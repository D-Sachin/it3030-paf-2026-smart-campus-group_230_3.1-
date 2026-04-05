/**
 * Utility functions for Ticket Styling
 */

export const getPriorityColor = (priority) => {
  switch (priority?.toUpperCase()) {
    case 'CRITICAL':
      return 'bg-red-50 text-red-700 border-red-100';
    case 'HIGH':
      return 'bg-orange-50 text-orange-700 border-orange-100';
    case 'MEDIUM':
      return 'bg-blue-50 text-blue-700 border-blue-100';
    case 'LOW':
      return 'bg-slate-50 text-slate-600 border-slate-100';
    default:
      return 'bg-slate-50 text-slate-600 border-slate-100';
  }
};

export const getStatusColor = (status) => {
  switch (status?.toUpperCase()) {
    case 'OPEN':
      return 'bg-blue-50 text-blue-700 border-blue-100';
    case 'IN_PROGRESS':
      return 'bg-amber-50 text-amber-700 border-amber-100';
    case 'RESOLVED':
      return 'bg-emerald-50 text-emerald-700 border-emerald-100';
    case 'CLOSED':
      return 'bg-slate-100 text-slate-600 border-slate-200';
    case 'REJECTED':
      return 'bg-red-50 text-red-700 border-red-100';
    default:
      return 'bg-slate-50 text-slate-600 border-slate-100';
  }
};
