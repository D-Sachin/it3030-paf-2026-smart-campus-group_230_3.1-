package com.smartcampus.hub.controller;

import com.smartcampus.hub.dto.ResourceRequestDTO;
import com.smartcampus.hub.dto.ResourceResponseDTO;
import com.smartcampus.hub.enums.ResourceType;
import com.smartcampus.hub.enums.ResourceStatus;
import com.smartcampus.hub.service.ResourceService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/resources")
public class ResourceController {

    private final ResourceService resourceService;

    public ResourceController(ResourceService resourceService) {
        this.resourceService = resourceService;
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> createResource(@Valid @RequestBody ResourceRequestDTO requestDTO) {
        try {
            ResourceResponseDTO response = resourceService.createResource(requestDTO);
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("message", "Resource created successfully");
            result.put("data", response);
            return ResponseEntity.status(HttpStatus.CREATED).body(result);
        } catch (IllegalArgumentException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllResources(
            @PageableDefault(size = 10, sort = "id", direction = Sort.Direction.DESC) Pageable pageable) {
        Page<ResourceResponseDTO> page = resourceService.getAllResources(pageable);
        Map<String, Object> paginationMap = new HashMap<>();
        paginationMap.put("currentPage", page.getNumber());
        paginationMap.put("totalPages", page.getTotalPages());
        paginationMap.put("totalElements", page.getTotalElements());
        paginationMap.put("pageSize", page.getSize());
        
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("message", "Resources retrieved successfully");
        result.put("data", page.getContent());
        result.put("pagination", paginationMap);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getResourceById(@PathVariable Long id) {
        try {
            ResourceResponseDTO response = resourceService.getResourceById(id);
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("message", "Resource retrieved successfully");
            result.put("data", response);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }

    @GetMapping("/active")
    public ResponseEntity<Map<String, Object>> getActiveResources() {
        List<ResourceResponseDTO> resources = resourceService.getActiveResources();
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("message", "Active resources retrieved successfully");
        result.put("data", resources);
        return ResponseEntity.ok(result);
    }

    /**
     * Search resources by name or description
     * @param term Search term to find in resource name or description
     * @param pageable Pagination parameters
     * @return Paginated list of resources matching search term
     */
    @GetMapping("/search")
    public ResponseEntity<Map<String, Object>> searchResources(
            @RequestParam String term,
            @PageableDefault(size = 10, sort = "id", direction = Sort.Direction.DESC) Pageable pageable) {
        Page<ResourceResponseDTO> page = resourceService.searchResources(term, pageable);
        Map<String, Object> paginationMap = new HashMap<>();
        paginationMap.put("currentPage", page.getNumber());
        paginationMap.put("totalPages", page.getTotalPages());
        paginationMap.put("totalElements", page.getTotalElements());
        paginationMap.put("pageSize", page.getSize());
        
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("message", "Search completed successfully");
        result.put("data", page.getContent());
        result.put("pagination", paginationMap);
        return ResponseEntity.ok(result);
    }

    /**
     * Advanced search with multiple filter parameters
     * @param type Resource type filter (optional)
     * @param status Resource status filter (optional)
     * @param location Location filter (optional, case-insensitive)
     * @param minCapacity Minimum capacity filter (optional)
     * @param maxCapacity Maximum capacity filter (optional)
     * @param term Search term for resource name/description (optional)
     * @param pageable Pagination parameters
     * @return Paginated list of resources matching all filters
     */
    @GetMapping("/advanced-search")
    public ResponseEntity<Map<String, Object>> advancedSearch(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) Integer minCapacity,
            @RequestParam(required = false) Integer maxCapacity,
            @RequestParam(required = false) String term,
            @PageableDefault(size = 10, sort = "id", direction = Sort.Direction.DESC) Pageable pageable) {
        
        try {
            // Convert empty strings to null for optional enums
            ResourceType resourceType = (type == null || type.isEmpty()) ? null : ResourceType.valueOf(type);
            ResourceStatus resourceStatus = (status == null || status.isEmpty()) ? null : ResourceStatus.valueOf(status);
            location = (location != null && location.isEmpty()) ? null : location;
            
            Page<ResourceResponseDTO> page = resourceService.advancedSearch(
                    resourceType, resourceStatus, location, minCapacity, maxCapacity, term, pageable);
            Map<String, Object> paginationMap = new HashMap<>();
            paginationMap.put("currentPage", page.getNumber());
            paginationMap.put("totalPages", page.getTotalPages());
            paginationMap.put("totalElements", page.getTotalElements());
            paginationMap.put("pageSize", page.getSize());
            
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("message", "Advanced search completed successfully");
            result.put("data", page.getContent());
            result.put("pagination", paginationMap);
            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Invalid filter parameter: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Filter resources by type
     * @param type Resource type to filter (LECTURE_HALL, LAB, MEETING_ROOM, EQUIPMENT)
     * @param pageable Pagination parameters
     * @return Paginated list of resources of specified type
     */
    @GetMapping("/filter/by-type")
    public ResponseEntity<Map<String, Object>> filterByType(
            @RequestParam ResourceType type,
            @PageableDefault(size = 10, sort = "id", direction = Sort.Direction.DESC) Pageable pageable) {
        Page<ResourceResponseDTO> page = resourceService.filterByType(type, pageable);
        Map<String, Object> paginationMap = new HashMap<>();
        paginationMap.put("currentPage", page.getNumber());
        paginationMap.put("totalPages", page.getTotalPages());
        paginationMap.put("totalElements", page.getTotalElements());
        paginationMap.put("pageSize", page.getSize());
        
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("message", "Filtered by type successfully");
        result.put("data", page.getContent());
        result.put("pagination", paginationMap);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/filter/by-location")
    public ResponseEntity<Map<String, Object>> filterByLocation(
            @RequestParam String location,
            @PageableDefault(size = 10, sort = "id", direction = Sort.Direction.DESC) Pageable pageable) {
        Page<ResourceResponseDTO> page = resourceService.filterByLocation(location, pageable);
        Map<String, Object> paginationMap = new HashMap<>();
        paginationMap.put("currentPage", page.getNumber());
        paginationMap.put("totalPages", page.getTotalPages());
        paginationMap.put("totalElements", page.getTotalElements());
        paginationMap.put("pageSize", page.getSize());
        
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("message", "Filtered by location successfully");
        result.put("data", page.getContent());
        result.put("pagination", paginationMap);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/filter/by-capacity")
    public ResponseEntity<Map<String, Object>> filterByCapacity(
            @RequestParam Integer capacity,
            @PageableDefault(size = 10, sort = "id", direction = Sort.Direction.DESC) Pageable pageable) {
        Page<ResourceResponseDTO> page = resourceService.filterByCapacity(capacity, pageable);
        Map<String, Object> paginationMap = new HashMap<>();
        paginationMap.put("currentPage", page.getNumber());
        paginationMap.put("totalPages", page.getTotalPages());
        paginationMap.put("totalElements", page.getTotalElements());
        paginationMap.put("pageSize", page.getSize());
        
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("message", "Filtered by capacity successfully");
        result.put("data", page.getContent());
        result.put("pagination", paginationMap);
        return ResponseEntity.ok(result);
    }

    /**
     * Filter resources by status
     * @param status Resource status (ACTIVE, OUT_OF_SERVICE)
     * @param pageable Pagination parameters
     * @return Paginated list of resources with specified status
     */
    @GetMapping("/filter/by-status")
    public ResponseEntity<Map<String, Object>> filterByStatus(
            @RequestParam ResourceStatus status,
            @PageableDefault(size = 10, sort = "id", direction = Sort.Direction.DESC) Pageable pageable) {
        Page<ResourceResponseDTO> page = resourceService.filterByStatus(status, pageable);
        Map<String, Object> paginationMap = new HashMap<>();
        paginationMap.put("currentPage", page.getNumber());
        paginationMap.put("totalPages", page.getTotalPages());
        paginationMap.put("totalElements", page.getTotalElements());
        paginationMap.put("pageSize", page.getSize());
        
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("message", "Filtered by status successfully");
        result.put("data", page.getContent());
        result.put("pagination", paginationMap);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/suggestions/locations")
    public ResponseEntity<Map<String, Object>> getLocationSuggestions(@RequestParam String prefix) {
        List<String> suggestions = resourceService.getLocationSuggestions(prefix);
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("message", "Location suggestions retrieved successfully");
        result.put("data", suggestions);
        return ResponseEntity.ok(result);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> updateResource(
            @PathVariable Long id,
            @Valid @RequestBody ResourceRequestDTO requestDTO) {
        try {
            ResourceResponseDTO response = resourceService.updateResource(id, requestDTO);
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("message", "Resource updated successfully");
            result.put("data", response);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> updateResourceStatus(
            @PathVariable Long id,
            @RequestParam ResourceStatus status) {
        try {
            ResourceResponseDTO response = resourceService.updateResourceStatus(id, status);
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("message", "Resource status updated successfully");
            result.put("data", response);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> deleteResource(@PathVariable Long id) {
        try {
            resourceService.deleteResource(id);
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("message", "Resource deleted successfully");
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }
}
