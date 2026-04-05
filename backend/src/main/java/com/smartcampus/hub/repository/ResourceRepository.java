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

    // Check if resource exists by name
    boolean existsByNameIgnoreCase(String name);

    // Find by type with pagination
    Page<Resource> findByType(ResourceType type, Pageable pageable);

    // Find by status with pagination
    Page<Resource> findByStatus(ResourceStatus status, Pageable pageable);

    // Find by location with pagination
    Page<Resource> findByLocationIgnoreCase(String location, Pageable pageable);

    // Find by capacity greater than or equal
    Page<Resource> findByCapacityGreaterThanEqual(Integer capacity, Pageable pageable);

    // Find all active resources
    List<Resource> findByStatus(ResourceStatus status);

    // Search by name (contains)
    @Query("SELECT r FROM Resource r WHERE LOWER(r.name) LIKE LOWER(CONCAT('%', :term, '%'))")
    Page<Resource> searchByName(@Param("term") String term, Pageable pageable);

    // Advanced search with multiple filters
    @Query("SELECT r FROM Resource r WHERE " +
            "(:type IS NULL OR r.type = :type) AND " +
            "(:status IS NULL OR r.status = :status) AND " +
            "(:location IS NULL OR LOWER(r.location) LIKE LOWER(CONCAT('%', :location, '%'))) AND " +
            "(:minCapacity IS NULL OR r.capacity >= :minCapacity) AND " +
            "(:maxCapacity IS NULL OR r.capacity <= :maxCapacity) AND " +
            "(:term IS NULL OR LOWER(r.name) LIKE LOWER(CONCAT('%', :term, '%')))")
    Page<Resource> advancedSearch(
            @Param("type") ResourceType type,
            @Param("status") ResourceStatus status,
            @Param("location") String location,
            @Param("minCapacity") Integer minCapacity,
            @Param("maxCapacity") Integer maxCapacity,
            @Param("term") String term,
            Pageable pageable
    );

    // Find resources by location prefix (for location suggestions)
    @Query("SELECT DISTINCT r.location FROM Resource r WHERE LOWER(r.location) LIKE LOWER(CONCAT(:prefix, '%'))")
    List<String> findLocationsByPrefix(@Param("prefix") String prefix);
}
