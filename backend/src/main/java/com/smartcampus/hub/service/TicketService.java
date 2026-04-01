package com.smartcampus.hub.service;

import com.smartcampus.hub.dto.TicketRequestDTO;
import com.smartcampus.hub.dto.TicketResponseDTO;

public interface TicketService {
    TicketResponseDTO createTicket(TicketRequestDTO dto);
}
