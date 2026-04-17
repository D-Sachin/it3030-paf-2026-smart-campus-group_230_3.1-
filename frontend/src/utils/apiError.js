export const getApiErrorMessage = (error, fallbackMessage = "Request failed") => {
  if (error?.code === "ECONNABORTED") {
    return "Request timed out. Please try again.";
  }

  const status = error?.response?.status;
  const data = error?.response?.data;

  if (data?.errors && typeof data.errors === "object") {
    const firstError = Object.values(data.errors)[0];
    if (firstError) {
      return String(firstError);
    }
  }

  if (typeof data?.message === "string" && data.message.trim()) {
    return data.message;
  }

  if (status === 409) {
    return "Requested booking slot conflicts with an existing booking.";
  }

  if (status === 404) {
    return "Requested data was not found.";
  }

  if (!error?.response) {
    return "Cannot reach server. Please check backend is running on port 8080.";
  }

  return fallbackMessage;
};
