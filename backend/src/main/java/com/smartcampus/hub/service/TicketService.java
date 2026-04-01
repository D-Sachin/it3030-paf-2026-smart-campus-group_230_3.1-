package com.smartcampus.hub.service;

import com.smartcampus.hub.dto.TicketRequestDTO;
import com.smartcampus.hub.dto.TicketResponseDTO;
import com.smartcampus.hub.enums.Priority;
import com.smartcampus.hub.enums.TicketStatus;

import java.util.List;

public interface TicketService {
    TicketResponseDTO createTicket(TicketRequestDTO dto);
    List<TicketResponseDTO> getAllTickets(TicketStatus status, Priority priority);
    List<TicketResponseDTO> getTicketsByUserId(Long userId, TicketStatus status, Priority priority);
}
