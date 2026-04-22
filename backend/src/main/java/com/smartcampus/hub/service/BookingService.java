package com.smartcampus.hub.service;

import com.smartcampus.hub.dto.BookingRequestDTO;
import com.smartcampus.hub.dto.BookingResponseDTO;
import com.smartcampus.hub.enums.BookingStatus;

import java.util.List;

public interface BookingService {
    BookingResponseDTO createBooking(BookingRequestDTO requestDTO);
    List<BookingResponseDTO> getMyBookings(BookingStatus status);
    List<BookingResponseDTO> getAdminBookings(BookingStatus status);
    BookingResponseDTO getBookingById(Long bookingId);
    BookingResponseDTO approveBooking(Long bookingId, String reason);
    BookingResponseDTO rejectBooking(Long bookingId, String reason);
    BookingResponseDTO cancelBooking(Long bookingId);
    void deleteBooking(Long bookingId);
}
