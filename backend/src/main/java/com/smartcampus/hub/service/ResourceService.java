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
 * Provides CRUD operations and advanced filtering for campus resources
 */
public interface ResourceService {

    /**
     * Create a new resource
     * @param requestDTO Resource creation request
     * @return Created resource details
     * @throws IllegalArgumentException if resource name already exists
     */
    ResourceResponseDTO createResource(ResourceRequestDTO requestDTO);

    /**
     * Retrieve resource by ID
     * @param id Resource ID
     * @return Resource details
     * @throws RuntimeException if resource not found
     */
    ResourceResponseDTO getResourceById(Long id);

    /**
     * Get all resources with pagination
     * @param pageable Pagination details
     * @return Paginated list of all resources
     */
    Page<ResourceResponseDTO> getAllResources(Pageable pageable);

    /**
     * Update existing resource
     * @param id Resource ID to update
     * @param requestDTO Updated resource data
     * @return Updated resource details
     */
    ResourceResponseDTO updateResource(Long id, ResourceRequestDTO requestDTO);

    /**
     * Delete resource by ID
     * @param id Resource ID
     */
    void deleteResource(Long id);

    /**
     * Update resource availability status
     * @param id Resource ID
     * @param status New status (ACTIVE or OUT_OF_SERVICE)
     * @return Updated resource
     */
    ResourceResponseDTO updateResourceStatus(Long id, ResourceStatus status);

    /**
     * Get all active/available resources
     * @return List of active resources
     */
    List<ResourceResponseDTO> getActiveResources();

    /**
     * Search resources by name or description
     * @param term Search term
     * @param pageable Pagination details
     * @return Paginated search results
     */
    Page<ResourceResponseDTO> searchResources(String term, Pageable pageable);

    /**
     * Filter resources by type
     * @param type Resource type to filter
     * @param pageable Pagination details
     * @return Paginated resources of specified type
     */
    Page<ResourceResponseDTO> filterByType(ResourceType type, Pageable pageable);

    Page<ResourceResponseDTO> filterByLocation(String location, Pageable pageable);

    Page<ResourceResponseDTO> filterByCapacity(Integer capacity, Pageable pageable);

    Page<ResourceResponseDTO> filterByStatus(ResourceStatus status, Pageable pageable);

    Page<ResourceResponseDTO> advancedSearch(
            String type,
            String status,
            String location,
            Integer minCapacity,
            Integer maxCapacity,
            String term,
            Pageable pageable
    );

    List<String> getLocationSuggestions(String prefix);
}
