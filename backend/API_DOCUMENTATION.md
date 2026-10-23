# 📡 OHE MTC - API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "user_id": "ADMIN001",
  "pin": "admin123"
}

Response:
{
  "success": true,
  "_id": "...",
  "user_id": "ADMIN001",
  "name": "Administrator",
  "role": "ADMIN",
  "machine": "ALL",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

### Logout
```http
POST /api/auth/logout
Authorization: Bearer <token>
```

---

## Dashboard

### Get Dashboard Data
```http
GET /api/dashboard?startDate=2026-10-01&endDate=2026-10-31&mekanik=John&shift=1
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "summary": {
      "total_work_time": 420,
      "value_time": 200,
      "direct_time": 100,
      "indirect_time": 80,
      "loss_time": 40,
      "efficiency": 47.62,
      "direct_ratio": 23.81,
      "ohe": 47.62,
      "target_ohe": 85,
      "benchmark_ohe": 90,
      "achievement": 56.02,
      "status": "NOT ACHIEVED"
    },
    "machine_performance": [...],
    "period": {...},
    "total_records": 10
  }
}
```

### Get Dashboard Stats
```http
GET /api/dashboard/stats?startDate=2026-10-01&endDate=2026-10-31
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "by_category": {
      "VALUE TIME": 200,
      "DIRECT": 100,
      "INDIRECT": 80,
      "LOSS": 40
    },
    "trend": [
      {
        "date": "2026-10-01",
        "ohe": 45.5,
        "efficiency": 45.5,
        "value_time": 180,
        "direct_time": 90,
        "indirect_time": 70,
        "loss_time": 30,
        "total_time": 370
      }
    ],
    "total_records": 10
  }
}
```

### Get OHE Analysis
```http
GET /api/dashboard/analysis?startDate=2026-10-01&endDate=2026-10-31
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "mekanik_analysis": [
      {
        "mekanik": "John Doe",
        "total_work_time": 420,
        "value_time": 200,
        "direct_time": 100,
        "indirect_time": 80,
        "loss_time": 40,
        "efficiency": 47.62,
        "direct_ratio": 23.81,
        "ohe": 47.62,
        "total_activities": 10,
        "status": "NOT ACHIEVED"
      }
    ],
    "activity_analysis": [
      {
        "activity_code": "VT-COR-001",
        "activity_name": "Perbaikan setting pisau",
        "category": "VALUE TIME",
        "total_time": 60,
        "frequency": 2
      }
    ],
    "total_records": 10
  }
}
```

---

## Value Time Activities

### Get All Value Times
```http
GET /api/valuetimes?sub_category=Corrective&status=active&search=pisau
Authorization: Bearer <token>

Response:
{
  "success": true,
  "count": 53,
  "data": [
    {
      "_id": "...",
      "activity_code": "VT-COR-001",
      "activity_name": "Perbaikan setting pisau",
      "category": "VALUE TIME",
      "sub_category": "Corrective",
      "standard_time": 30,
      "unit": "minutes",
      "description": "Perbaikan dan setting pisau mesin",
      "status": "active"
    }
  ]
}
```

### Get Single Value Time
```http
GET /api/valuetimes/:id
Authorization: Bearer <token>
```

### Create Value Time (Admin Only)
```http
POST /api/valuetimes
Authorization: Bearer <token>
Content-Type: application/json

{
  "activity_code": "VT-COR-054",
  "activity_name": "New Activity",
  "category": "VALUE TIME",
  "sub_category": "Corrective",
  "standard_time": 45,
  "unit": "minutes",
  "description": "Description",
  "status": "active"
}
```

### Update Value Time (Admin Only)
```http
PUT /api/valuetimes/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "standard_time": 60
}
```

### Delete Value Time (Admin Only)
```http
DELETE /api/valuetimes/:id
Authorization: Bearer <token>
```

---

## Direct Activities

### Get All Directs
```http
GET /api/directs?status=active&search=loading
Authorization: Bearer <token>
```

### CRUD Operations
```http
GET    /api/directs/:id
POST   /api/directs          (Admin only)
PUT    /api/directs/:id      (Admin only)
DELETE /api/directs/:id      (Admin only)
```

---

## Indirect Activities

### Get All Indirects
```http
GET /api/indirects?status=active&search=briefing
Authorization: Bearer <token>
```

### CRUD Operations
```http
GET    /api/indirects/:id
POST   /api/indirects          (Admin only)
PUT    /api/indirects/:id      (Admin only)
DELETE /api/indirects/:id      (Admin only)
```

---

## Loss Time Activities

### Get All Loss Times
```http
GET /api/losstimes?status=active
Authorization: Bearer <token>
```

### CRUD Operations
```http
GET    /api/losstimes/:id
POST   /api/losstimes          (Admin only)
PUT    /api/losstimes/:id      (Admin only)
DELETE /api/losstimes/:id      (Admin only)
```

---

## OHE Input

### Get All OHE Inputs
```http
GET /api/oheinputs?date=2026-10-22&shift=1&mekanik=John&category=VALUE TIME
Authorization: Bearer <token>

Response:
{
  "success": true,
  "count": 5,
  "data": [
    {
      "_id": "...",
      "record_id": "OHE-20261022-0001",
      "date": "2026-10-22T00:00:00.000Z",
      "shift": "1",
      "mekanik": "John Doe",
      "activity_code": "VT-COR-001",
      "activity_name": "Perbaikan setting pisau",
      "category": "VALUE TIME",
      "start_time": "08:00",
      "end_time": "08:30",
      "actual_time_min": 30,
      "standard_time_min": 30,
      "quantity": 0,
      "production_result": "",
      "remarks": "",
      "created_by": "ADMIN001"
    }
  ]
}
```

### Get OHE Summary
```http
GET /api/oheinputs/summary?startDate=2026-10-01&endDate=2026-10-31&mekanik=John
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "total_work_time": 420,
    "value_time": 200,
    "direct_time": 100,
    "indirect_time": 80,
    "loss_time": 40,
    "efficiency": 47.62,
    "direct_ratio": 23.81,
    "ohe": 47.62,
    "total_records": 10,
    "period": {
      "start": "2026-10-01",
      "end": "2026-10-31"
    }
  }
}
```

### Create OHE Input
```http
POST /api/oheinputs
Authorization: Bearer <token>
Content-Type: application/json

{
  "date": "2026-10-22",
  "shift": "1",
  "mekanik": "John Doe",
  "activity_code": "VT-COR-001",
  "activity_name": "Perbaikan setting pisau",
  "category": "VALUE TIME",
  "start_time": "08:00",
  "end_time": "08:30",
  "standard_time_min": 30,
  "quantity": 5,
  "production_result": "Good",
  "remarks": "Completed on time"
}

Response:
{
  "success": true,
  "data": {
    "record_id": "OHE-20261022-0001",
    "actual_time_min": 30,  // Auto-calculated
    "created_by": "ADMIN001",
    ...
  }
}
```

### Update OHE Input
```http
PUT /api/oheinputs/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "end_time": "08:45",
  "remarks": "Updated"
}
```

### Delete OHE Input (Admin Only)
```http
DELETE /api/oheinputs/:id
Authorization: Bearer <token>
```

---

## Settings

### Get All Settings
```http
GET /api/settings
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "working_start_monday_thursday": "07:30",
    "working_end_monday_thursday": "15:00",
    "target_ohe": 85,
    "benchmark_ohe": 90,
    "application_name": "OHE MTC - Overall Human Efficiency"
  }
}
```

### Update Settings (Admin Only)
```http
PUT /api/settings
Authorization: Bearer <token>
Content-Type: application/json

{
  "target_ohe": 90,
  "benchmark_ohe": 95
}
```

---

## Logs (Admin Only)

### Get All Logs
```http
GET /api/logs?user=ADMIN001&action=login&module=auth&startDate=2026-10-01&limit=50
Authorization: Bearer <token>

Response:
{
  "success": true,
  "count": 10,
  "data": [
    {
      "_id": "...",
      "timestamp": "2026-10-22T08:00:00.000Z",
      "user": "ADMIN001",
      "action": "login",
      "module": "auth",
      "description": "User Administrator logged in"
    }
  ]
}
```

---

## User Management (Admin Only)

### Get All Users
```http
GET /api/auth/users
Authorization: Bearer <token>
```

### Create User
```http
POST /api/auth/users
Authorization: Bearer <token>
Content-Type: application/json

{
  "user_id": "MEK001",
  "pin": "1234",
  "name": "John Doe",
  "role": "MEKANIK",
  "machine": "CNC-001",
  "status": "active"
}
```

### Update User
```http
PUT /api/auth/users/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Doe Updated",
  "status": "inactive"
}
```

### Delete User
```http
DELETE /api/auth/users/:id
Authorization: Bearer <token>
```

---

## Error Responses

All endpoints return error in this format:

```json
{
  "success": false,
  "message": "Error message here"
}
```

### Common Error Codes
- `400` - Bad Request (validation error)
- `401` - Unauthorized (invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

---

## Role-Based Access

### ADMIN
- ✅ Access all endpoints
- ✅ Create, update, delete all data
- ✅ View all logs
- ✅ Manage users

### MEKANIK
- ✅ View own OHE inputs
- ✅ Create own OHE inputs
- ✅ Update own OHE inputs
- ❌ Cannot delete OHE inputs
- ❌ Cannot access admin endpoints
- ❌ Cannot view other mekanik's data

---

## Testing with cURL

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"user_id":"ADMIN001","pin":"admin123"}'
```

### Get Dashboard
```bash
curl -X GET "http://localhost:5000/api/dashboard?startDate=2026-10-01&endDate=2026-10-31" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Create OHE Input
```bash
curl -X POST http://localhost:5000/api/oheinputs \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2026-10-22",
    "shift": "1",
    "mekanik": "John Doe",
    "activity_code": "VT-COR-001",
    "activity_name": "Perbaikan setting pisau",
    "category": "VALUE TIME",
    "start_time": "08:00",
    "end_time": "08:30",
    "standard_time_min": 30
  }'
```

---

**Last Updated**: 22 Oktober 2026  
**API Version**: 2.0.0  
**Status**: ✅ Ready for Testing
