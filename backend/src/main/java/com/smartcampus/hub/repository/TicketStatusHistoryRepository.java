package com.smartcampus.hub.repository;

import com.smartcampus.hub.model.Ticket;
import com.smartcampus.hub.model.TicketStatusHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketStatusHistoryRepository extends JpaRepository<TicketStatusHistory, Long> {
    List<TicketStatusHistory> findByTicketOrderByTimestampDesc(Ticket ticket);
}
