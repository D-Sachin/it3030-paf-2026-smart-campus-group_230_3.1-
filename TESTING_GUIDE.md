# Resource Module - Testing & Running Guide

## Prerequisites

- Java 21+ installed
- Maven 3.9.8+ installed
- Node.js 18+ installed
- npm 9+ installed
- MySQL running on `localhost:3306`

---

## Part 1: Backend Setup & Testing

### Step 1: Configure Database Connection

**File:** `backend/src/main/resources/application.properties`

```properties
# Database Configuration
spring.datasource.url=jdbc:mysql://localhost:3306/smartcampus_db?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=your_password
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# Hibernate Configuration
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect

# Logging
logging.level.root=INFO
logging.level.com.smartcampus=DEBUG

# Server Port
server.port=8080
server.servlet.context-path=/

# JWT Configuration (if using)
app.jwt.secret=your-secret-key-change-this-in-production
app.jwt.expiration=86400000
```

### Step 2: Build the Backend

```bash
mvn clean install -DskipTests
```

**Expected Output:**

```
[INFO] BUILD SUCCESS
[INFO] Total time: XX.XXXs
```

### Step 3: Run Backend Server

```bash
mvn spring-boot:run
```

**Expected Output:**

```
Started SmartCampusHubApplication in X.XXX seconds
```

The backend will be available at: **http://localhost:8080**

---

## Part 2: Frontend Setup & Testing

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Configure API Base URL

**File:** `frontend/src/services/resourceService.js`

Verify the base URL matches your backend:

```javascript
const BASE_URL = "http://localhost:8080/api/resources";
```

### Step 3: Start Development Server

```bash
npm run dev
```

**Expected Output:**

```
VITE v4.x.x  ready in XXX ms

➜  Local:   http://localhost:5173/
```

Frontend will be available at: **http://localhost:5173**

---

## Part 3: Testing the API Endpoints

### Using PowerShell (Built-in Testing)

#### Test 1: Create a Resource (POST)

```bash
$token = "your-jwt-token" # Replace with actual token from auth module
$headers = @{
    "Content-Type" = "application/json"
    "Authorization" = "Bearer $token"
}

$body = @{
    name = "Lecture Hall A101"
    type = "LECTURE_HALL"
    capacity = 100
    location = "Building A, Floor 1"
    description = "Main lecture hall with projector"
    status = "ACTIVE"
    availableFrom = "09:00:00"
    availableTo = "17:00:00"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8080/api/resources" `
    -Method POST `
    -Headers $headers `
    -Body $body
```

#### Test 2: Get All Resources (PAGINATED)

```bash
$headers = @{
    "Authorization" = "Bearer $token"
}

Invoke-RestMethod -Uri "http://localhost:8080/api/resources?page=0&size=10&sort=id,desc" `
    -Method GET `
    -Headers $headers | ConvertTo-Json
```

#### Test 3: Search Resources

```bash
Invoke-RestMethod -Uri "http://localhost:8080/api/resources/search?term=lecture" `
    -Method GET `
    -Headers $headers | ConvertTo-Json
```

#### Test 4: Advanced Filter

```bash
# Filter by type and minimum capacity
Invoke-RestMethod -Uri "http://localhost:8080/api/resources/advanced-search?type=LECTURE_HALL&minCapacity=50" `
    -Method GET `
    -Headers $headers | ConvertTo-Json
```

#### Test 5: Get by ID

```bash
Invoke-RestMethod -Uri "http://localhost:8080/api/resources/1" `
    -Method GET `
    -Headers $headers | ConvertTo-Json
```

#### Test 6: Update Resource (PUT)

```bash
$body = @{
    name = "Lecture Hall A101 - Updated"
    type = "LECTURE_HALL"
    capacity = 120
    location = "Building A, Floor 1"
    description = "Updated description"
    status = "ACTIVE"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8080/api/resources/1" `
    -Method PUT `
    -Headers $headers `
    -Body $body
```

#### Test 7: Update Status (PATCH)

```bash
Invoke-RestMethod -Uri "http://localhost:8080/api/resources/1/status?status=OUT_OF_SERVICE" `
    -Method PATCH `
    -Headers $headers
```

#### Test 8: Delete Resource

```bash
Invoke-RestMethod -Uri "http://localhost:8080/api/resources/1" `
    -Method DELETE `
    -Headers $headers
```

---

## Part 4: Using Postman for Testing

### Import Collection

- File: `API_TESTING.postman_collection.json`
- Import into Postman
- Create environment variable: `{{baseUrl}}` = `http://localhost:8080`
- Create environment variable: `{{token}}` = Your JWT token

### Test Endpoints

1. **Create Resource** - POST `/api/resources`
2. **List Resources** - GET `/api/resources?page=0&size=10`
3. **Search** - GET `/api/resources/search?term=lecture`
4. **Filter by Type** - GET `/api/resources/filter/by-type?type=LECTURE_HALL`
5. **Filter by Location** - GET `/api/resources/filter/by-location?location=Building`
6. **Filter by Capacity** - GET `/api/resources/filter/by-capacity?capacity=50`
7. **Advanced Search** - GET `/api/resources/advanced-search?type=LAB&minCapacity=30`
8. **Get Resource** - GET `/api/resources/{id}`
9. **Update Resource** - PUT `/api/resources/{id}`
10. **Update Status** - PATCH `/api/resources/{id}/status?status=ACTIVE`
11. **Delete Resource** - DELETE `/api/resources/{id}`
12. **Location Suggestions** - GET `/api/resources/suggestions/locations?prefix=Build`
13. **Get Active Resources** - GET `/api/resources/active`

---

## Part 5: Frontend Manual Testing

### Access Application

Go to: **http://localhost:5173/**

### Test Workflow

#### 1. View Resource List

- Page loads and displays resources in paginated grid
- Pagination controls at bottom (size: 5, 10, 20 items/page)

#### 2. Test Search

- Click search bar
- Type "lecture"
- Results filter in real-time

#### 3. Test Advanced Filters

- Click "Filters" toggle
- Select Type: "LECTURE_HALL"
- Enter Min Capacity: "50"
- View filtered results

#### 4. Create Resource (Admin Only)

- Click "Register Asset" button (if logged in as ADMIN)
- Fill form:
  - Name: "Lab Room 201"
  - Type: "LAB"
  - Capacity: "30"
  - Location: "Building B, Floor 2"
  - Status: "ACTIVE"
  - Available From: "08:00"
  - Available To: "18:00"
- Click "Register Resource"
- Verify success notification
- Check resource appears in list

#### 5. Edit Resource (Admin Only)

- Click "Edit" button on a resource
- Modify any field
- Click "Save Changes"
- Verify changes persist

#### 6. Delete Resource (Admin Only)

- Click "Delete" button
- Confirm deletion
- Verify resource removed from list
