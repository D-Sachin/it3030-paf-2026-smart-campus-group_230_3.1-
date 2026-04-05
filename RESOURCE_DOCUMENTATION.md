# Facilities & Assets Catalogue (Resource Management)

## 📋 Overview

The **Resource Management** module implements a complete **Facilities & Assets Catalogue** system for the Smart Campus Operations Hub. This module allows administrators to create, manage, and organize university resources including lecture halls, labs, meeting rooms, and equipment.

---

## 🏗️ Architecture

### Backend (Spring Boot)

```
com.smartcampus.hub
├── controller/
│   └── ResourceController.java
├── service/
│   ├── ResourceService.java
│   └── impl/
│       └── ResourceServiceImpl.java
├── repository/
│   └── ResourceRepository.java
├── dto/
│   ├── ResourceRequestDTO.java
│   └── ResourceResponseDTO.java
├── model/
│   └── Resource.java
└── enums/
    ├── ResourceType.java
    └── ResourceStatus.java
```

### Frontend (React + Tailwind CSS)

```
src/
├── components/
│   └── Resources/
│       ├── ResourceCard.jsx
│       ├── ResourceForm.jsx
│       └── FilterBar.jsx
├── pages/
│   └── Resources/
│       └── ResourceListPage.jsx
├── services/
│   └── resourceService.js
└── App.jsx
```

---

## ✅ REST API Endpoints

All endpoints are prefixed with `/api/resources`

### Create Resource (ADMIN ONLY)

```
POST /api/resources
Content-Type: application/json

{
  "name": "Room 101",
  "type": "LECTURE_HALL",
  "capacity": 100,
  "location": "Building A, 1st Floor",
  "description": "Large lecture hall with projection equipment",
  "status": "ACTIVE",
  "availableFrom": "08:00",
  "availableTo": "18:00"
}
```

### Get All Resources (PAGINATED)

```
GET /api/resources?page=0&size=10&sortBy=id&sortDirection=desc
```

### Search by Keyword

```
GET /api/resources/search?term=lecture&page=0&size=10
```

### Advanced Search with Filters

```
GET /api/resources/advanced-search
  ?type=LECTURE_HALL
  &status=ACTIVE
  &location=Building A
  &minCapacity=50
  &maxCapacity=200
  &term=room
  &page=0
  &size=10
```

---

## 🎨 Frontend Features

### 1. Resource List Page
- Responsive card grid for asset visualization
- Server-side pagination and sorting
- Real-time loading and empty states

### 2. Advanced Search & Filtering
- Dynamic full-text search
- Multi-criteria filtering (Type, Status, Location, Capacity)
- Active filter management

### 3. Asset Management (Admin)
- Unified form for Create and Edit operations
- Modal-based interaction flow
- Real-time validation and feedback

---

## 🔐 Security & Validation

- **RBAC**: Admin-level protection for mutating endpoints (POST, PUT, PATCH, DELETE)
- **Validation**: Strict server-side validation for capacity, unique naming, and time ranges
- **Error Handling**: Standardized JSON error responses for all failure cases

---

**Status:** ✅ Complete - Production Ready
