package com.smartcampus.hub.service.impl;

import com.smartcampus.hub.dto.ResourceRequestDTO;
import com.smartcampus.hub.dto.ResourceResponseDTO;
import com.smartcampus.hub.enums.ResourceType;
import com.smartcampus.hub.enums.ResourceStatus;
import com.smartcampus.hub.model.Resource;
import com.smartcampus.hub.repository.ResourceRepository;
import com.smartcampus.hub.service.ResourceService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ResourceServiceImpl implements ResourceService {

    private static final Logger logger = LoggerFactory.getLogger(ResourceServiceImpl.class);
    private final ResourceRepository resourceRepository;

    @Override
    public ResourceResponseDTO createResource(ResourceRequestDTO requestDTO) {
        if (resourceRepository.existsByNameIgnoreCase(requestDTO.getName())) {
            throw new IllegalArgumentException("Resource with name already exists");
        }
        
        if (requestDTO.getAvailableFrom() != null && requestDTO.getAvailableTo() != null) {
            if (requestDTO.getAvailableFrom().isAfter(requestDTO.getAvailableTo())) {
                throw new IllegalArgumentException("Start time must be before end time");
            }
        }
        
        Resource resource = new Resource();
        resource.setName(requestDTO.getName());
        resource.setType(requestDTO.getType());
        resource.setCapacity(requestDTO.getCapacity());
        resource.setLocation(requestDTO.getLocation());
        resource.setDescription(requestDTO.getDescription());
        resource.setStatus(requestDTO.getStatus() != null ? requestDTO.getStatus() : ResourceStatus.ACTIVE);
        resource.setAvailableFrom(requestDTO.getAvailableFrom());
        resource.setAvailableTo(requestDTO.getAvailableTo());
        
        return mapToResponseDTO(resourceRepository.save(resource));
    }

    @Override
    @Transactional(readOnly = true)
    public ResourceResponseDTO getResourceById(Long id) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Resource not found"));
        return mapToResponseDTO(resource);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ResourceResponseDTO> getAllResources(Pageable pageable) {
        return resourceRepository.findAll(pageable).map(this::mapToResponseDTO);
    }

    @Override
    public ResourceResponseDTO updateResource(Long id, ResourceRequestDTO requestDTO) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Resource not found"));
        resource.setName(requestDTO.getName());
        resource.setType(requestDTO.getType());
        resource.setCapacity(requestDTO.getCapacity());
        resource.setLocation(requestDTO.getLocation());
        resource.setDescription(requestDTO.getDescription());
        resource.setStatus(requestDTO.getStatus());
        resource.setAvailableFrom(requestDTO.getAvailableFrom());
        resource.setAvailableTo(requestDTO.getAvailableTo());
        return mapToResponseDTO(resourceRepository.save(resource));
    }

    @Override
    public void deleteResource(Long id) {
        if (!resourceRepository.existsById(id)) {
            throw new RuntimeException("Resource not found");
        }
        resourceRepository.deleteById(id);
    }

    @Override
    public ResourceResponseDTO updateResourceStatus(Long id, ResourceStatus status) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Resource not found"));
        resource.setStatus(status);
        return mapToResponseDTO(resourceRepository.save(resource));
    }

    @Override
    @Transactional(readOnly = true)
    public List<ResourceResponseDTO> getActiveResources() {
        return resourceRepository.findByStatus(ResourceStatus.ACTIVE).stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ResourceResponseDTO> searchResources(String term, Pageable pageable) {
        return resourceRepository.searchByName(term, pageable).map(this::mapToResponseDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ResourceResponseDTO> filterByType(ResourceType type, Pageable pageable) {
        return resourceRepository.findByType(type, pageable).map(this::mapToResponseDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ResourceResponseDTO> filterByLocation(String location, Pageable pageable) {
        return resourceRepository.findByLocationIgnoreCase(location, pageable).map(this::mapToResponseDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ResourceResponseDTO> filterByCapacity(Integer capacity, Pageable pageable) {
        return resourceRepository.findByCapacityGreaterThanEqual(capacity, pageable).map(this::mapToResponseDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ResourceResponseDTO> filterByStatus(ResourceStatus status, Pageable pageable) {
        return resourceRepository.findByStatus(status, pageable).map(this::mapToResponseDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ResourceResponseDTO> advancedSearch(
            ResourceType type,
            ResourceStatus status,
            String location,
            Integer minCapacity,
            Integer maxCapacity,
            String term,
            Pageable pageable) {
        
        // Validate capacity range
        if (minCapacity != null && maxCapacity != null && minCapacity > maxCapacity) {
            logger.warn("Invalid capacity range: minCapacity={}, maxCapacity={}", minCapacity, maxCapacity);
            throw new IllegalArgumentException("minCapacity cannot be greater than maxCapacity");
        }
        
        logger.info("Advanced search: type={}, status={}, location={}, minCapacity={}, maxCapacity={}, term={}",
                type, status, location, minCapacity, maxCapacity, term);
        
        return resourceRepository.advancedSearch(type, status, location, minCapacity, maxCapacity, term, pageable)
                .map(this::mapToResponseDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public List<String> getLocationSuggestions(String prefix) {
        return resourceRepository.findLocationsByPrefix(prefix);
    }

    private ResourceResponseDTO mapToResponseDTO(Resource resource) {
        return ResourceResponseDTO.builder()
                .id(resource.getId())
                .name(resource.getName())
                .type(resource.getType())
                .capacity(resource.getCapacity())
                .location(resource.getLocation())
                .description(resource.getDescription())
                .status(resource.getStatus())
                .availableFrom(resource.getAvailableFrom())
                .availableTo(resource.getAvailableTo())
                .createdAt(resource.getCreatedAt())
                .updatedAt(resource.getUpdatedAt())
                .build();
    }
}
