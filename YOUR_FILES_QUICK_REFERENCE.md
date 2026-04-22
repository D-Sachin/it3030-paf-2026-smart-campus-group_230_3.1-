# 🎯 YOUR MODULE A FILES - QUICK REFERENCE

## Member 01 (Kavin) - Facilities & Assets Catalogue

---

## 📁 BACKEND FILES (Java/Spring Boot)

### 🏗️ Model Layer

```
backend/src/main/java/com/smartcampus/hub/model/
├── Resource.java ⭐ MAIN ENTITY
│   └── Contains: id, name, type, capacity, location, description,
│       status, availableFrom, availableTo, createdAt, updatedAt
└── Purpose: Represents a physical resource that can be booked
```

### 📋 Enum Layer

```
backend/src/main/java/com/smartcampus/hub/enums/
├── ResourceType.java
│   └── Values: LECTURE_HALL, LAB, MEETING_ROOM, EQUIPMENT, etc.
└── ResourceStatus.java
    └── Values: ACTIVE, OUT_OF_SERVICE
```

### 🗄️ Data Layer

```
backend/src/main/java/com/smartcampus/hub/repository/
└── ResourceRepository.java ⭐ DATABASE QUERIES
    ├── CRUD Methods (from JpaRepository)
    │   ├── save(Resource)
    │   ├── findById(Long)
    │   ├── findAll()
    │   ├── delete(Resource)
    │   └── deleteById(Long)
    │
    ├── Custom Query Methods
    │   ├── existsByNameIgnoreCase(String name)
    │   ├── findByType(ResourceType, Pageable)
    │   ├── findByStatus(ResourceStatus, Pageable)
    │   ├── findByLocationIgnoreCase(String, Pageable)
    │   ├── findByCapacityGreaterThanEqual(Integer, Pageable)
    │   ├── searchByName(String term, Pageable)
    │   ├── advancedSearch(type, status, location, capacity, term, Pageable)
    │   └── findLocationsByPrefix(String prefix)
```

### 💼 Business Logic Layer

```
backend/src/main/java/com/smartcampus/hub/service/
├── ResourceService.java
│   └── Interface defining all service methods
│
└── impl/ResourceServiceImpl.java ⭐ BUSINESS LOGIC
    ├── createResource(ResourceRequestDTO)
    ├── getResourceById(Long)
    ├── getAllResources(Pageable)
    ├── updateResource(Long, ResourceRequestDTO)
    ├── deleteResource(Long)
    ├── updateResourceStatus(Long, ResourceStatus)
    ├── getActiveResources()
    ├── searchResources(String, Pageable)
    ├── filterByType(ResourceType, Pageable)
    ├── filterByLocation(String, Pageable)
    ├── filterByCapacity(Integer, Pageable)
    ├── filterByStatus(ResourceStatus, Pageable)
    ├── advancedSearch(...)
    └── getLocationSuggestions(String prefix)
```

### 🌐 API Layer

```
backend/src/main/java/com/smartcampus/hub/controller/
└── ResourceController.java ⭐ REST ENDPOINTS (Base: /api/resources)
    ├── POST   /api/resources              → createResource
    ├── GET    /api/resources              → getAllResources
    ├── GET    /api/resources/{id}         → getResourceById
    ├── GET    /api/resources/active       → getActiveResources
    ├── GET    /api/resources/search       → searchResources
    ├── GET    /api/resources/filter/by-type
    ├── GET    /api/resources/filter/by-location
    ├── GET    /api/resources/filter/by-capacity
    ├── GET    /api/resources/filter/by-status
    ├── GET    /api/resources/advanced-search
    ├── GET    /api/resources/suggestions/locations
    ├── PUT    /api/resources/{id}         → updateResource
    ├── PATCH  /api/resources/{id}/status  → updateResourceStatus
    └── DELETE /api/resources/{id}         → deleteResource
```

### 📦 Data Transfer Objects (DTOs)

```
backend/src/main/java/com/smartcampus/hub/dto/
├── ResourceRequestDTO.java
│   └── Used for: POST (create), PUT (update) requests
│       Fields: name, type, capacity, location, description,
│                status, availableFrom, availableTo
│
└── ResourceResponseDTO.java
    └── Used for: All API responses
        Fields: id, name, type, capacity, location, description,
                status, availableFrom, availableTo, createdAt, updatedAt
```

---

## 🎨 FRONTEND FILES (React/JavaScript)

### 📄 Pages

```
frontend/src/pages/Resources/
└── ResourceListPage.jsx
    ├── Route: /resources
    ├── Features:
    │   ├── Display all resources with pagination
    │   ├── Search functionality
    │   ├── Advanced filtering
    │   ├── Sort options
    │   └── Loading & error states
    │
    └── Components Used:
        ├── ResourceCard (for each resource)
        ├── FilterBar (for search & filters)
        └── Pagination
```

### 🧩 Reusable Components

```
frontend/src/components/Resources/

1. ResourceCard.jsx
   ├── Props: resource (object)
   ├── Displays:
   │   ├── Resource name
   │   ├── Type badge
   │   ├── Capacity
   │   ├── Location
   │   ├── Status (with color coding)
   │   ├── Available hours
   │   └── Action buttons (view, edit, delete)
   └── Styling: Tailwind CSS

2. ResourceForm.jsx
   ├── Props: resourceId? (optional, for edit mode)
   ├── Features:
   │   ├── Create new resource (Admin only)
   │   ├── Edit existing resource (Admin only)
   │   ├── Form validation
   │   ├── Type selection dropdown
   │   ├── Location input
   │   ├── Capacity input
   │   ├── Availability time picker
   │   └── Submit/Cancel buttons
   └── Styling: Tailwind CSS

3. FilterBar.jsx
   ├── State: All filter criteria
   ├── Features:
   │   ├── Search by name/keyword
   │   ├── Filter by type (dropdown)
   │   ├── Filter by location (autocomplete)
   │   ├── Filter by capacity (range input)
   │   ├── Filter by status (dropdown)
   │   ├── Advanced search button
   │   └── Clear/Reset button
   └── Styling: Tailwind CSS
```

### 🔌 API Service

```
frontend/src/services/
└── resourceService.js ⭐ ALL API CALLS
    ├── GET Methods
    │   ├── getAllResources(page, size, sortBy, sortDirection)
    │   ├── getResourceById(id)
    │   ├── getActiveResources()
    │   ├── searchResources(term, page, size)
    │   ├── filterByType(type, page, size)
    │   ├── filterByLocation(location, page, size)
    │   ├── filterByCapacity(capacity, page, size)
    │   ├── filterByStatus(status, page, size)
    │   ├── advancedSearch(filters, page, size)
    │   ├── getLocationSuggestions(prefix)
    │   └── (all methods return Promise via axios)
    │
    ├── POST Methods
    │   └── createResource(resourceData)
    │
    ├── PUT Methods
    │   ├── updateResource(id, resourceData)
    │   └── updateResourceStatus(id, status)
    │
    └── DELETE Methods
        └── deleteResource(id)
```

---

## 📊 API ENDPOINTS REFERENCE

### Resource Management

| HTTP   | Endpoint                     | Purpose             | Auth   | Status |
| ------ | ---------------------------- | ------------------- | ------ | ------ |
| GET    | `/api/resources`             | List all resources  | Public | ✅     |
| GET    | `/api/resources/{id}`        | Get single resource | Public | ✅     |
| GET    | `/api/resources/active`      | List active only    | Public | ✅     |
| POST   | `/api/resources`             | Create resource     | Admin  | ✅     |
| PUT    | `/api/resources/{id}`        | Update resource     | Admin  | ✅     |
| PATCH  | `/api/resources/{id}/status` | Update status       | Admin  | ✅     |
| DELETE | `/api/resources/{id}`        | Delete resource     | Admin  | ✅     |

### Search & Filter

| HTTP | Endpoint                               | Purpose               | Auth   | Status |
| ---- | -------------------------------------- | --------------------- | ------ | ------ |
| GET  | `/api/resources/search`                | Search by name        | Public | ✅     |
| GET  | `/api/resources/filter/by-type`        | Filter by type        | Public | ✅     |
| GET  | `/api/resources/filter/by-location`    | Filter by location    | Public | ✅     |
| GET  | `/api/resources/filter/by-capacity`    | Filter by capacity    | Public | ✅     |
| GET  | `/api/resources/filter/by-status`      | Filter by status      | Public | ✅     |
| GET  | `/api/resources/advanced-search`       | Multi-filter search   | Public | ✅     |
| GET  | `/api/resources/suggestions/locations` | Location autocomplete | Public | ✅     |

---

## 🔑 KEY STATISTICS

- **Total Backend Files:** 11
- **Total Frontend Files:** 5
- **REST API Endpoints:** 14+
- **Database Queries:** 10+
- **React Components:** 4
- **Data Models:** 4 (1 Entity + 2 DTOs + 1 Enum for type + 1 Enum for status)
- **HTTP Methods Used:** GET, POST, PUT, PATCH, DELETE ✅

---

## ✅ YOUR CONTRIBUTION CHECKLIST

- ✅ Implemented Resource Entity with all metadata
- ✅ Created ResourceType and ResourceStatus enums
- ✅ Built ResourceRepository with custom queries
- ✅ Developed ResourceService with business logic
- ✅ Created ResourceController with 14+ REST endpoints
- ✅ Designed ResourceRequestDTO and ResourceResponseDTO
- ✅ Built ResourceListPage frontend
- ✅ Created ResourceCard component
- ✅ Implemented FilterBar component
- ✅ Developed ResourceForm component
- ✅ Implemented resourceService.js for API calls
- ✅ Added proper error handling
- ✅ Implemented role-based access control
- ✅ Applied input validation
- ✅ Followed Spring Boot best practices
- ✅ Used React best practices
- ✅ Professional UI/UX design
- ✅ Database schema design
- ✅ API documentation

---

## 🚀 READY FOR VIVA/DEMO

You can confidently explain:

1. **Resource Entity Design** - Why each field is necessary
2. **API Architecture** - How controllers, services, and repositories work together
3. **Search & Filtering** - Advanced query implementation
4. **Frontend Integration** - How React components consume API
5. **Error Handling** - Validation and exception handling
6. **Security** - Role-based access control
7. **Database Design** - Table structure and relationships
8. **Code Quality** - Layered architecture and best practices

---

**All your Module A files are production-ready! 🎉**
