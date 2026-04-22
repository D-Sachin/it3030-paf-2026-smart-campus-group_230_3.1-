# Module A - Facilities & Assets Catalogue Verification Test Plan

## Test Date: April 22, 2026

## Member: Member 01 (Kavin)

## Module: Module A - Facilities & Assets Catalogue

---

## ✅ BACKEND API ENDPOINTS TO TEST

### Resource Management Endpoints:

#### 1. **POST /api/resources** - Create Resource

- **HTTP Method:** POST
- **Expected Status:** 201/200
- **Required Role:** ADMIN
- **Test Data:**

```json
{
  "name": "Lecture Hall A101",
  "type": "LECTURE_HALL",
  "capacity": 100,
  "location": "Building A, Floor 1",
  "description": "Main lecture hall with projector and whiteboard",
  "status": "ACTIVE",
  "availableFrom": "08:00:00",
  "availableTo": "18:00:00"
}
```

#### 2. **GET /api/resources** - Get All Resources

- **HTTP Method:** GET
- **Expected Status:** 200
- **Query Params:** page=0, size=10
- **Expected:** Paginated list of resources

#### 3. **GET /api/resources/{id}** - Get Single Resource

- **HTTP Method:** GET
- **Expected Status:** 200
- **Expected:** Single resource object

#### 4. **GET /api/resources/active** - Get Active Resources

- **HTTP Method:** GET
- **Expected Status:** 200
- **Expected:** List of only ACTIVE resources

#### 5. **GET /api/resources/search** - Search Resources

- **HTTP Method:** GET
- **Query Params:** term="Lecture"
- **Expected Status:** 200

#### 6. **GET /api/resources/filter/by-type** - Filter by Type

- **HTTP Method:** GET
- **Query Params:** type="LECTURE_HALL"
- **Expected Status:** 200

#### 7. **GET /api/resources/filter/by-location** - Filter by Location

- **HTTP Method:** GET
- **Query Params:** location="Building A"
- **Expected Status:** 200

#### 8. **GET /api/resources/filter/by-capacity** - Filter by Capacity

- **HTTP Method:** GET
- **Query Params:** capacity=100
- **Expected Status:** 200

#### 9. **GET /api/resources/filter/by-status** - Filter by Status

- **HTTP Method:** GET
- **Query Params:** status="ACTIVE"
- **Expected Status:** 200

#### 10. **GET /api/resources/advanced-search** - Advanced Search

- **HTTP Method:** GET
- **Query Params:** type=LECTURE_HALL&status=ACTIVE&location=Building A&minCapacity=50
- **Expected Status:** 200

#### 11. **GET /api/resources/suggestions/locations** - Get Location Suggestions

- **HTTP Method:** GET
- **Query Params:** prefix="Building"
- **Expected Status:** 200

#### 12. **PUT /api/resources/{id}** - Update Resource

- **HTTP Method:** PUT
- **Required Role:** ADMIN
- **Expected Status:** 200

#### 13. **PATCH /api/resources/{id}/status** - Update Resource Status

- **HTTP Method:** PATCH
- **Query Params:** status="OUT_OF_SERVICE"
- **Required Role:** ADMIN
- **Expected Status:** 200

#### 14. **DELETE /api/resources/{id}** - Delete Resource

- **HTTP Method:** DELETE
- **Required Role:** ADMIN
- **Expected Status:** 200

---

## ✅ FRONTEND PAGES TO TEST

### Pages:

1. **Resource List Page** - `/resources`
   - [ ] Load all resources
   - [ ] Display resource cards
   - [ ] Search functionality works
   - [ ] Filter by type works
   - [ ] Filter by location works
   - [ ] Filter by capacity works
   - [ ] Filter by status works
   - [ ] Pagination works

2. **Resource Card Component**
   - [ ] Display resource name
   - [ ] Display resource type
   - [ ] Display capacity
   - [ ] Display location
   - [ ] Display status badge with color
   - [ ] Display available hours

3. **Filter Bar Component**
   - [ ] Type filter dropdown loads
   - [ ] Location autocomplete works
   - [ ] Capacity input works
   - [ ] Status filter dropdown loads
   - [ ] Advanced search button works

---

## ✅ DATABASE CHECKS

### Tables to Verify:

1. **resources** table
   - [ ] Columns: id, name, type, capacity, location, description, status, available_from, available_to, created_at, updated_at
   - [ ] Constraints: Unique name, NOT NULL fields
   - [ ] Data types correct

### Enum Values:

1. **ResourceType:** LECTURE_HALL, LAB, MEETING_ROOM, EQUIPMENT, etc.
2. **ResourceStatus:** ACTIVE, OUT_OF_SERVICE

---

## TEST RESULTS

(To be filled during testing)

### Backend Status:

- Server Running: [ ]
- Port 8080 Accessible: [ ]
- Database Connected: [ ]

### Frontend Status:

- Dev Server Running: [ ]
- Port 5173 Accessible: [ ]
- React App Loads: [ ]

### API Tests Passed: 0/14

### Frontend Tests Passed: 0/11

---

## NOTES

- Requires PostgreSQL running locally
- Default demo users created by DataInitializer
- Admin credentials: admin@smartcampus.com / password123
- Student credentials: student@smartcampus.com / password123
