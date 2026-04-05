package com.smartcampus.hub.service;

import com.smartcampus.hub.dto.ResourceRequestDTO;
import com.smartcampus.hub.dto.ResourceResponseDTO;
import com.smartcampus.hub.enums.ResourceType;
import com.smartcampus.hub.enums.ResourceStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

/**
 * Service Interface for Resource Management
 */
public interface ResourceService {

    // Create
    ResourceResponseDTO createResource(ResourceRequestDTO requestDTO);

    // Read
    ResourceResponseDTO getResourceById(Long id);

    Page<ResourceResponseDTO> getAllResources(Pageable pageable);

    // Update
    ResourceResponseDTO updateResource(Long id, ResourceRequestDTO requestDTO);

    // Delete
    void deleteResource(Long id);

    // Status Update
    ResourceResponseDTO updateResourceStatus(Long id, ResourceStatus status);

    // Filtering & Search
    List<ResourceResponseDTO> getActiveResources();

    Page<ResourceResponseDTO> searchResources(String term, Pageable pageable);

    Page<ResourceResponseDTO> filterByType(ResourceType type, Pageable pageable);

    Page<ResourceResponseDTO> filterByLocation(String location, Pageable pageable);

    Page<ResourceResponseDTO> filterByCapacity(Integer capacity, Pageable pageable);

    Page<ResourceResponseDTO> filterByStatus(ResourceStatus status, Pageable pageable);

    Page<ResourceResponseDTO> advancedSearch(
            ResourceType type,
            ResourceStatus status,
            String location,
            Integer minCapacity,
            Integer maxCapacity,
            String term,
            Pageable pageable
    );

    List<String> getLocationSuggestions(String prefix);
}
