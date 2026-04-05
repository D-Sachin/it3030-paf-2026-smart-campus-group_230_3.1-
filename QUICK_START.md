# Quick Start Reference

## 🚀 Fast Track (5 Minutes)

### Step 1: Build Backend

```bash
cd backend
mvn clean install -DskipTests -q
```

### Step 2: Install Frontend

```bash
cd frontend
npm install -q
```

### Step 3: Start Backend (Terminal 1)

```bash
cd backend
mvn spring-boot:run
# Wait for: "Started SmartCampusHubApplication in X.XXXs"
```

### Step 4: Start Frontend (Terminal 2)

```bash
cd frontend
npm run dev
# Shows: "Local: http://localhost:5173"
```

### Step 5: Open Browser

Go to: **http://localhost:5173**

---

## 📋 Command Reference

| Task                 | Command                         |
| -------------------- | ------------------------------- |
| **Build Backend**    | `mvn clean install -DskipTests` |
| **Run Backend**      | `mvn spring-boot:run`           |
| **Build Frontend**   | `npm install`                   |
| **Dev Server**       | `npm run dev`                   |
| **Build Production** | `npm run build`                 |
| **Test Backend**     | `mvn test`                      |
| **Check Java**       | `java -version`                 |
| **Check Maven**      | `mvn -version`                  |
| **Check Node**       | `node -v && npm -v`             |

---

## 🌐 API Endpoints (Localhost)

| Method     | Endpoint                                       | Purpose               |
| ---------- | ---------------------------------------------- | --------------------- |
| **POST**   | `/api/resources`                               | Create resource       |
| **GET**    | `/api/resources`                               | List all (paginated)  |
| **GET**    | `/api/resources/{id}`                          | Get by ID             |
| **GET**    | `/api/resources/active`                        | List active only      |
| **GET**    | `/api/resources/search?term=`                  | Full-text search      |
| **GET**    | `/api/resources/advanced-search?...`           | Multi-filter search   |
| **GET**    | `/api/resources/filter/by-type?type=`          | Filter by type        |
| **GET**    | `/api/resources/filter/by-location?location=`  | Filter by location    |
| **GET**    | `/api/resources/filter/by-capacity?capacity=`  | Filter by capacity    |
| **GET**    | `/api/resources/filter/by-status?status=`      | Filter by status      |
| **GET**    | `/api/resources/suggestions/locations?prefix=` | Location autocomplete |
| **PUT**    | `/api/resources/{id}`                          | Update resource       |
| **PATCH**  | `/api/resources/{id}/status?status=`           | Change status         |
| **DELETE** | `/api/resources/{id}`                          | Delete resource       |

---

## 🔑 Key Files & Locations

```
PAF-Assignment/
├── backend/
│   ├── src/main/java/com/smartcampus/hub/
│   │   ├── controller/
│   │   │   └── ResourceController.java                   (14 endpoints)
│   │   ├── service/
│   │   │   ├── ResourceService.java                      (Interface)
│   │   │   └── impl/ResourceServiceImpl.java             (Implementation)
│   │   ├── repository/
│   │   │   └── ResourceRepository.java                   (8+ queries)
│   │   ├── model/
│   │   │   └── Resource.java                             (JPA Entity)
│   │   ├── dto/
│   │   │   ├── ResourceRequestDTO.java                   (Validation)
│   │   │   └── ResourceResponseDTO.java
│   │   └── enums/
│   │       ├── ResourceType.java
│   │       └── ResourceStatus.java
│   └── pom.xml                                           (Dependencies)
│
├── frontend/
│   ├── src/
│   │   ├── components/Resources/
│   │   │   ├── ResourceCard.jsx
│   │   │   ├── ResourceForm.jsx
│   │   │   └── FilterBar.jsx
│   │   ├── pages/Resources/
│   │   │   └── ResourceListPage.jsx
│   │   ├── services/
│   │   │   └── resourceService.js                        (HTTP Client)
│   │   └── App.jsx
│   └── package.json
│
├── TESTING_GUIDE.md                                      (Comprehensive guide)
├── RESOURCE_DOCUMENTATION.md                             (API specs)
├── README.md                                             (Project info)
```

---

## ✅ Verification Checklist

After startup, verify:

- [ ] Backend compiles without errors
- [ ] Backend starts on port 8080
- [ ] Frontend npm install succeeds
- [ ] Frontend serves on port 5173
- [ ] Can access http://localhost:5173
- [ ] Resource list page loads
- [ ] Can create resource (admin)
- [ ] Can search resources
- [ ] Can filter by type/location
- [ ] Pagination works
- [ ] No console errors

---

## 📊 Resource Types & Status

**Types:**
- LECTURE_HALL
- LAB
- MEETING_ROOM
- EQUIPMENT

**Status:**
- ACTIVE
- OUT_OF_SERVICE
