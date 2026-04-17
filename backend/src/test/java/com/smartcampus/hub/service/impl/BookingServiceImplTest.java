package com.smartcampus.hub.service.impl;

import com.smartcampus.hub.dto.BookingRequestDTO;
import com.smartcampus.hub.enums.BookingStatus;
import com.smartcampus.hub.enums.ResourceStatus;
import com.smartcampus.hub.exception.BookingConflictException;
import com.smartcampus.hub.model.Booking;
import com.smartcampus.hub.model.Resource;
import com.smartcampus.hub.model.User;
import com.smartcampus.hub.repository.BookingRepository;
import com.smartcampus.hub.repository.ResourceRepository;
import com.smartcampus.hub.repository.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BookingServiceImplTest {

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private ResourceRepository resourceRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private BookingServiceImpl bookingService;

    @BeforeEach
    void setUp() {
        UserDetails principal = org.springframework.security.core.userdetails.User
                .withUsername("user@campus.com")
                .password("password")
                .authorities("ROLE_USER")
                .build();

        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities())
        );
    }

    @AfterEach
    void clearContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void createBooking_shouldThrowConflict_whenOverlappingBookingExists() {
        BookingRequestDTO requestDTO = BookingRequestDTO.builder()
                .resourceId(1L)
                .bookingDate(LocalDate.now().plusDays(1))
                .startTime(LocalTime.of(9, 0))
                .endTime(LocalTime.of(10, 0))
                .purpose("Club meeting")
                .expectedAttendees(20)
                .build();

        Resource resource = new Resource();
        resource.setId(1L);
        resource.setName("Lecture Hall A");
        resource.setCapacity(100);
        resource.setStatus(ResourceStatus.ACTIVE);

        User user = new User();
        user.setId(1L);
        user.setEmail("user@campus.com");
        user.setRole("USER");

        Booking existing = Booking.builder()
                .id(99L)
                .status(BookingStatus.APPROVED)
                .build();

        when(resourceRepository.findById(1L)).thenReturn(Optional.of(resource));
        when(userRepository.findByEmail("user@campus.com")).thenReturn(Optional.of(user));
        when(bookingRepository.findConflictingBookings(any(), any(), any(), any(), any(), any())).thenReturn(List.of(existing));

        assertThrows(BookingConflictException.class, () -> bookingService.createBooking(requestDTO));
    }

    @Test
    void rejectBooking_shouldRequireReason() {
        User admin = new User();
        admin.setId(2L);
        admin.setEmail("user@campus.com");
        admin.setRole("ADMIN");

        when(userRepository.findByEmail("user@campus.com")).thenReturn(Optional.of(admin));

        IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class,
                () -> bookingService.rejectBooking(1L, "  ")
        );

        assertEquals("Rejection reason is required.", ex.getMessage());
    }

    @Test
    void cancelBooking_shouldFailWhenStatusIsNotApproved() {
        User owner = new User();
        owner.setId(5L);
        owner.setEmail("user@campus.com");
        owner.setRole("USER");

        Booking pendingBooking = Booking.builder()
                .id(20L)
                .user(owner)
                .status(BookingStatus.PENDING)
                .bookingDate(LocalDate.now().plusDays(1))
                .build();

        when(userRepository.findByEmail("user@campus.com")).thenReturn(Optional.of(owner));
        when(bookingRepository.findById(anyLong())).thenReturn(Optional.of(pendingBooking));

        IllegalStateException ex = assertThrows(
                IllegalStateException.class,
                () -> bookingService.cancelBooking(20L)
        );

        assertEquals("Only APPROVED bookings can be cancelled.", ex.getMessage());
    }
}
