package com.smartcampus.hub.dto;

import com.smartcampus.hub.enums.BookingStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingResponseDTO {

    private Long id;
    private Long resourceId;
    private String resourceName;
    private Long userId;
    private String userName;
    private LocalDate bookingDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private String purpose;
    private Integer expectedAttendees;
    private BookingStatus status;
    private String decisionReason;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}


    // private Long id;
    // private Long resourceId;
    // private String resourceName;
    // private Long userId;
    // private String userName;
    // private LocalDate bookingDate;
    // private LocalTime startTime;
    // private LocalTime endTime;
    // private String purpose;
    // private Integer expectedAttendees;
    // private BookingStatus status;
    // private String decisionReason;
    // private LocalDateTime createdAt;
    // private LocalDateTime updatedAt;