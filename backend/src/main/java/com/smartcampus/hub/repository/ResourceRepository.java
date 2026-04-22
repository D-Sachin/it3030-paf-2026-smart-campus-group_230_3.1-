package com.smartcampus.hub.repository;

import com.smartcampus.hub.model.Resource;
import com.smartcampus.hub.enums.ResourceType;
import com.smartcampus.hub.enums.ResourceStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for Resource - Facilities & Assets Catalogue
 * Provides CRUD operations and custom queries for resource management
 */
@Repository
public interface ResourceRepository extends JpaRepository<Resource, Long> {

    /**
     * Check if a resource with the given name already exists (case-insensitive)
     * @param name Resource name to check
     * @return true if resource exists, false otherwise
     */
    boolean existsByNameIgnoreCase(String name);

    /**
     * Find resources by type with pagination
     * @param type Resource type filter
     * @param pageable Pagination details
     * @return Page of resources of specified type
     */
    Page<Resource> findByType(ResourceType type, Pageable pageable);

    /**
     * Find resources by status with pagination
     * @param status Resource status filter
     * @param pageable Pagination details
     * @return Page of resources with specified status
     */
    Page<Resource> findByStatus(ResourceStatus status, Pageable pageable);

    /**
     * Find resources by location with pagination (case-insensitive)
     * @param location Location to search (partial match allowed)
     * @param pageable Pagination details
     * @return Page of resources in specified location
     */
    Page<Resource> findByLocationIgnoreCase(String location, Pageable pageable);

    /**
     * Find resources with capacity greater than or equal to specified value
     * @param capacity Minimum capacity
     * @param pageable Pagination details
     * @return Page of resources meeting capacity requirement
     */
    Page<Resource> findByCapacityGreaterThanEqual(Integer capacity, Pageable pageable);

    /**
     * Find all resources with specific status
     * @param status Resource status filter
     * @return List of all resources with specified status
     */
    List<Resource> findByStatus(ResourceStatus status);

    /**
     * Search resources by name (contains search, case-insensitive)
     * @param term Search term
     * @param pageable Pagination details
     * @return Page of resources matching search term
     */
    @Query("SELECT r FROM Resource r WHERE LOWER(CAST(r.name AS string)) LIKE LOWER(CONCAT('%', CAST(:term AS string), '%'))")
    Page<Resource> searchByName(@Param("term") String term, Pageable pageable);

    /**
     * Advanced search with multiple optional filters
     * All parameters are optional (null means filter is not applied)
     * @param type Resource type filter (optional)
     * @param status Resource status filter (optional)
     * @param location Location filter (optional, partial match)
     * @param minCapacity Minimum capacity filter (optional)
     * @param maxCapacity Maximum capacity filter (optional)
     * @param term Search term in name/description (optional)
     * @param pageable Pagination details
     * @return Page of resources matching all applied filters
     */
    @Query("SELECT r FROM Resource r WHERE " +
            "(:type IS NULL OR r.type = :type) AND " +
            "(:status IS NULL OR r.status = :status) AND " +
            "(:location IS NULL OR LOWER(CAST(r.location AS string)) LIKE LOWER(CONCAT('%', CAST(:location AS string), '%'))) AND " +
            "(:minCapacity IS NULL OR r.capacity >= :minCapacity) AND " +
            "(:maxCapacity IS NULL OR r.capacity <= :maxCapacity) AND " +
            "(:term IS NULL OR LOWER(CAST(r.name AS string)) LIKE LOWER(CONCAT('%', CAST(:term AS string), '%')))")
    Page<Resource> advancedSearch(
            @Param("type") ResourceType type,
            @Param("status") ResourceStatus status,
            @Param("location") String location,
            @Param("minCapacity") Integer minCapacity,
            @Param("maxCapacity") Integer maxCapacity,
            @Param("term") String term,
            Pageable pageable
    );

    /**
     * Find all unique locations matching a prefix (for location autocomplete suggestions)
     * @param prefix Location prefix to search
     * @return List of distinct locations matching prefix
     */
    @Query("SELECT DISTINCT r.location FROM Resource r WHERE LOWER(CAST(r.location AS string)) LIKE LOWER(CONCAT(CAST(:prefix AS string), '%'))")
    List<String> findLocationsByPrefix(@Param("prefix") String prefix);
}
