package com.smartcampus.hub.repository;

import com.smartcampus.hub.enums.BookingStatus;
import com.smartcampus.hub.model.Booking;
import com.smartcampus.hub.model.Resource;
import com.smartcampus.hub.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByUserOrderByBookingDateDescStartTimeDesc(User user);

    @Query("SELECT b FROM Booking b WHERE " +
            "b.resource = :resource AND " +
            "b.bookingDate = :bookingDate AND " +
            "b.status IN :statuses AND " +
            "(:bookingId IS NULL OR b.id <> :bookingId) AND " +
            "(b.startTime < :endTime AND b.endTime > :startTime)")
    List<Booking> findConflictingBookings(
            @Param("resource") Resource resource,
            @Param("bookingDate") LocalDate bookingDate,
            @Param("startTime") LocalTime startTime,
            @Param("endTime") LocalTime endTime,
            @Param("statuses") List<BookingStatus> statuses,
            @Param("bookingId") Long bookingId
    );

    List<Booking> findByStatusOrderByBookingDateDescStartTimeDesc(BookingStatus status);
}
