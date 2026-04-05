export const getBookingStatusColor = (status) => {
  switch (status?.toUpperCase()) {
    case "PENDING":
      return "bg-amber-50 text-amber-700 border-amber-100";
    case "APPROVED":
      return "bg-emerald-50 text-emerald-700 border-emerald-100";
    case "REJECTED":
      return "bg-red-50 text-red-700 border-red-100";
    case "CANCELLED":
      return "bg-slate-100 text-slate-600 border-slate-200";
    default:
      return "bg-slate-50 text-slate-600 border-slate-100";
  }
};

export const formatBookingSlot = (bookingDate, startTime, endTime) => {
  if (!bookingDate || !startTime || !endTime) {
    return "Time not specified";
  }
  return `${bookingDate} ${startTime} - ${endTime}`;
};
