package com.smartcampus.hub.service.impl;

import com.smartcampus.hub.dto.BookingRequestDTO;
import com.smartcampus.hub.dto.BookingResponseDTO;
import com.smartcampus.hub.enums.BookingStatus;
import com.smartcampus.hub.enums.ResourceStatus;
import com.smartcampus.hub.exception.BookingConflictException;
import com.smartcampus.hub.model.Booking;
import com.smartcampus.hub.model.Resource;
import com.smartcampus.hub.model.User;
import com.smartcampus.hub.repository.BookingRepository;
import com.smartcampus.hub.repository.ResourceRepository;
import com.smartcampus.hub.repository.UserRepository;
import com.smartcampus.hub.service.BookingService;
import com.smartcampus.hub.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {

    private static final List<BookingStatus> ACTIVE_BOOKING_STATUSES = Arrays.asList(BookingStatus.PENDING, BookingStatus.APPROVED);

    private final BookingRepository bookingRepository;
    private final ResourceRepository resourceRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Override
    @Transactional
    public BookingResponseDTO createBooking(BookingRequestDTO requestDTO) {
        validateBookingTimeRange(requestDTO.getStartTime(), requestDTO.getEndTime());

        Resource resource = resourceRepository.findById(requestDTO.getResourceId())
                .orElseThrow(() -> new RuntimeException("Resource not found with id: " + requestDTO.getResourceId()));

        if (resource.getStatus() != ResourceStatus.ACTIVE) {
            throw new IllegalStateException("Resource is not currently available for booking.");
        }

        if (requestDTO.getExpectedAttendees() > resource.getCapacity()) {
            throw new IllegalArgumentException("Expected attendees exceed resource capacity.");
        }

        User currentUser = resolveBookingUser();

        List<Booking> conflicts = bookingRepository.findConflictingBookings(
                resource,
                requestDTO.getBookingDate(),
                requestDTO.getStartTime(),
                requestDTO.getEndTime(),
                ACTIVE_BOOKING_STATUSES,
                null
        );

        if (!conflicts.isEmpty()) {
            throw new BookingConflictException("Booking conflict detected for this resource and time slot.");
        }

        Booking booking = Booking.builder()
                .resource(resource)
                .user(currentUser)
                .bookingDate(requestDTO.getBookingDate())
                .startTime(requestDTO.getStartTime())
                .endTime(requestDTO.getEndTime())
                .purpose(requestDTO.getPurpose())
                .expectedAttendees(requestDTO.getExpectedAttendees())
                .status(BookingStatus.PENDING)
                .build();

        Booking savedBooking = bookingRepository.save(booking);

        if (!"ADMIN".equalsIgnoreCase(currentUser.getRole())) {
            try {
                notificationService.createAdminBookingNotification(savedBooking);
            } catch (Exception ex) {
                System.err.println("Failed to create booking notification: " + ex.getMessage());
            }
        }

        return mapToResponseDTO(savedBooking);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingResponseDTO> getMyBookings(BookingStatus status) {
        User currentUser = resolveBookingUser();

        return bookingRepository.findByUserOrderByBookingDateDescStartTimeDesc(currentUser).stream()
                .filter(booking -> status == null || booking.getStatus() == status)
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingResponseDTO> getAdminBookings(BookingStatus status) {
        List<Booking> bookings = status == null
                ? bookingRepository.findAll()
                : bookingRepository.findByStatusOrderByBookingDateDescStartTimeDesc(status);

        return bookings.stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public BookingResponseDTO getBookingById(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new NoSuchElementException("Booking not found with id: " + bookingId));

        return mapToResponseDTO(booking);
    }

    @Override
    @Transactional
    public BookingResponseDTO approveBooking(Long bookingId, String reason) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new NoSuchElementException("Booking not found with id: " + bookingId));

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new IllegalStateException("Only PENDING bookings can be approved.");
        }

        List<Booking> conflicts = bookingRepository.findConflictingBookings(
                booking.getResource(),
                booking.getBookingDate(),
                booking.getStartTime(),
                booking.getEndTime(),
                Arrays.asList(BookingStatus.APPROVED),
                booking.getId()
        );

        if (!conflicts.isEmpty()) {
            throw new BookingConflictException("Cannot approve booking due to an overlapping APPROVED booking.");
        }

        booking.setStatus(BookingStatus.APPROVED);
        booking.setDecisionReason(reason);

        Booking savedBooking = bookingRepository.save(booking);

        try {
            String recipientEmail = resolveBookingUserEmail(savedBooking);
            String resourceName = resolveBookingResourceName(savedBooking);

            notificationService.createUserBookingApprovedNotification(
                    savedBooking.getId(),
                recipientEmail,
                resourceName,
                    savedBooking.getBookingDate(),
                    savedBooking.getStartTime(),
                    savedBooking.getEndTime()
            );
        } catch (Exception ex) {
            System.err.println("Failed to create approved booking notification: " + ex.getMessage());
        }

        return mapToResponseDTO(savedBooking);
    }

    @Override
    @Transactional
    public BookingResponseDTO rejectBooking(Long bookingId, String reason) {
        if (reason == null || reason.trim().isEmpty()) {
            throw new IllegalArgumentException("Rejection reason is required.");
        }

        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new NoSuchElementException("Booking not found with id: " + bookingId));

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new IllegalStateException("Only PENDING bookings can be rejected.");
        }

        booking.setStatus(BookingStatus.REJECTED);
        booking.setDecisionReason(reason);

        Booking savedBooking = bookingRepository.save(booking);

        try {
            String recipientEmail = resolveBookingUserEmail(savedBooking);
            String resourceName = resolveBookingResourceName(savedBooking);

            notificationService.createUserBookingRejectedNotification(
                    savedBooking.getId(),
                recipientEmail,
                resourceName,
                    savedBooking.getBookingDate(),
                    savedBooking.getStartTime(),
                    savedBooking.getEndTime(),
                    savedBooking.getDecisionReason()
            );
        } catch (Exception ex) {
            System.err.println("Failed to create rejected booking notification: " + ex.getMessage());
        }

        return mapToResponseDTO(savedBooking);
    }

    @Override
    @Transactional
    public BookingResponseDTO cancelBooking(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new NoSuchElementException("Booking not found with id: " + bookingId));

        if (booking.getStatus() != BookingStatus.APPROVED && booking.getStatus() != BookingStatus.REJECTED) {
            throw new IllegalStateException("Only APPROVED or REJECTED bookings can be removed.");
        }

        if (booking.getStatus() == BookingStatus.APPROVED && booking.getBookingDate().isBefore(LocalDate.now())) {
            throw new IllegalStateException("Past bookings cannot be cancelled.");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        return mapToResponseDTO(bookingRepository.save(booking));
    }

    @Override
    @Transactional
    public void deleteBooking(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new NoSuchElementException("Booking not found with id: " + bookingId));

        User currentUser = resolveBookingUser();
        Long bookingUserId = booking.getUser() != null ? booking.getUser().getId() : null;

        boolean isOwner = bookingUserId != null && bookingUserId.equals(currentUser.getId());
        boolean isAdmin = "ADMIN".equalsIgnoreCase(currentUser.getRole());

        if (!isOwner && !isAdmin) {
            throw new SecurityException("You can only delete your own bookings.");
        }

        bookingRepository.delete(booking);
    }

    private User resolveBookingUser() {
        try {
            if (SecurityContextHolder.getContext().getAuthentication() != null
                    && !(SecurityContextHolder.getContext().getAuthentication() instanceof AnonymousAuthenticationToken)) {
                Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
                final String email;

                if (principal instanceof UserDetails) {
                    email = ((UserDetails) principal).getUsername();
                } else {
                    email = principal.toString();
                }

                return userRepository.findByEmail(email).orElseGet(this::createOrGetGuestUser);
            }
        } catch (Exception ignored) {
            // Fall through to guest user for unauthenticated booking mode.
        }

        return createOrGetGuestUser();
    }

    private User createOrGetGuestUser() {
        return userRepository.findByEmail("guest@smartcampus.local").orElseGet(() -> {
            User guest = new User();
            guest.setName("Guest User");
            guest.setEmail("guest@smartcampus.local");
            guest.setRole("USER");
            return userRepository.save(guest);
        });
    }

    private void validateBookingTimeRange(java.time.LocalTime startTime, java.time.LocalTime endTime) {
        if (startTime == null || endTime == null || !startTime.isBefore(endTime)) {
            throw new IllegalArgumentException("Start time must be earlier than end time.");
        }
    }

    private String resolveBookingUserEmail(Booking booking) {
        Long userId = booking.getUser() != null ? booking.getUser().getId() : null;
        if (userId == null) {
            throw new IllegalStateException("Booking user is missing");
        }

        return userRepository.findById(userId)
                .map(User::getEmail)
                .orElseThrow(() -> new IllegalStateException("Booking user email not found for user id: " + userId));
    }

    private String resolveBookingResourceName(Booking booking) {
        Long resourceId = booking.getResource() != null ? booking.getResource().getId() : null;
        if (resourceId == null) {
            throw new IllegalStateException("Booking resource is missing");
        }

        return resourceRepository.findById(resourceId)
                .map(Resource::getName)
                .orElseThrow(() -> new IllegalStateException("Booking resource not found for resource id: " + resourceId));
    }

    private BookingResponseDTO mapToResponseDTO(Booking booking) {
        return BookingResponseDTO.builder()
                .id(booking.getId())
                .resourceId(booking.getResource().getId())
                .resourceName(booking.getResource().getName())
                .userId(booking.getUser().getId())
                .userName(booking.getUser().getName())
                .bookingDate(booking.getBookingDate())
                .startTime(booking.getStartTime())
                .endTime(booking.getEndTime())
                .purpose(booking.getPurpose())
                .expectedAttendees(booking.getExpectedAttendees())
                .status(booking.getStatus())
                .decisionReason(booking.getDecisionReason())
                .createdAt(booking.getCreatedAt())
                .updatedAt(booking.getUpdatedAt())
                .build();
    }
}
