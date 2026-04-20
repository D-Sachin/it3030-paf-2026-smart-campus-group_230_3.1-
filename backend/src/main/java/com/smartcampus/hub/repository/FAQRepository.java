package com.smartcampus.hub.repository;

import com.smartcampus.hub.model.FAQ;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FAQRepository extends JpaRepository<FAQ, Long> {
    List<FAQ> findAllByOrderByCreatedAtDesc();
}
