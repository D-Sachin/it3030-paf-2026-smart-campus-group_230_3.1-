package com.smartcampus.hub.dto;

import com.smartcampus.hub.enums.TicketStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StatusHistoryDTO {
    private Long id;
    private TicketStatus status;
    private String changedByName;
    private String changedByEmail;
    private LocalDateTime timestamp;
}
