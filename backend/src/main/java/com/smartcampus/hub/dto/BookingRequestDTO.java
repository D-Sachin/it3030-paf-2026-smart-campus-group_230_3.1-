package com.smartcampus.hub.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.smartcampus.hub.config.json.FlexibleLocalTimeDeserializer;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingRequestDTO {

    @NotNull(message = "Resource ID is required")
    private Long resourceId;

    @NotNull(message = "Booking date is required")
    @FutureOrPresent(message = "Booking date cannot be in the past")
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    @Schema(type = "string", format = "date", example = "2026-04-08")
    private LocalDate bookingDate;

    @NotNull(message = "Start time is required")
    @JsonDeserialize(using = FlexibleLocalTimeDeserializer.class)
    @Schema(type = "string", format = "time", example = "10:00")
    private LocalTime startTime;

    @NotNull(message = "End time is required")
    @JsonDeserialize(using = FlexibleLocalTimeDeserializer.class)
    @Schema(type = "string", format = "time", example = "11:00")
    private LocalTime endTime;

    @NotBlank(message = "Purpose is required")
    private String purpose;

    @NotNull(message = "Expected attendees is required")
    @Min(value = 1, message = "Expected attendees must be at least 1")
    private Integer expectedAttendees;
}
