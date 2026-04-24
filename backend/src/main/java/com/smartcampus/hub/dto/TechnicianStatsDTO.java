package com.smartcampus.hub.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TechnicianStatsDTO {
    private Long totalAssigned;
    private Long resolvedCount;
    private Long inProgressCount;
    private Long openCount;
    private Double resolutionRate;
    private Double averageResolutionTimeHours;
}
