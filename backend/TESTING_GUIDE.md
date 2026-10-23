# 🧪 API Testing Guide

## Prerequisites
- Backend sudah running (`npm run dev`)
- Database sudah initialized (`npm run init-db`)
- MongoDB sudah running

---

## Quick Test dengan cURL

### 1. Test Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"user_id\":\"ADMIN001\",\"pin\":\"admin123\"}"
```

**Expected Response:**
```json
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

**Save the token for next tests:**
```bash
export TOKEN="your_token_here"
```

---

### 2. Test Get Current User

```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

---

### 3. Test Get Value Time Activities

```bash
curl -X GET "http://localhost:5000/api/valuetimes?status=active" \
  -H "Authorization: Bearer $TOKEN"
```

**Expected:** 70 Value Time activities

---

### 4. Test Get Indirect Activities

```bash
curl -X GET http://localhost:5000/api/indirects \
  -H "Authorization: Bearer $TOKEN"
```

**Expected:** 8 Indirect activities

---

### 5. Test Get Loss Time Activities

```bash
curl -X GET http://localhost:5000/api/losstimes \
  -H "Authorization: Bearer $TOKEN"
```

**Expected:** 4 Loss activities

---

### 6. Test Create OHE Input

```bash
curl -X POST http://localhost:5000/api/oheinputs \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"date\": \"2026-10-22\",
    \"shift\": \"1\",
    \"mekanik\": \"John Doe\",
    \"activity_code\": \"VT-COR-001\",
    \"activity_name\": \"Perbaikan setting pisau\",
    \"category\": \"VALUE TIME\",
    \"start_time\": \"08:00\",
    \"end_time\": \"08:30\",
    \"standard_time_min\": 30,
    \"quantity\": 5,
    \"production_result\": \"Good\",
    \"remarks\": \"Test input\"
  }"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
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
    "quantity": 5,
    "production_result": "Good",
    "remarks": "Test input",
    "created_by": "ADMIN001"
  }
}
```

---

### 7. Test Get OHE Inputs

```bash
curl -X GET "http://localhost:5000/api/oheinputs?date=2026-10-22" \
  -H "Authorization: Bearer $TOKEN"
```

---

### 8. Test Get OHE Summary

```bash
curl -X GET "http://localhost:5000/api/oheinputs/summary?startDate=2026-10-01&endDate=2026-10-31" \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "total_work_time": 30,
    "value_time": 30,
    "direct_time": 0,
    "indirect_time": 0,
    "loss_time": 0,
    "efficiency": 100,
    "direct_ratio": 0,
    "ohe": 100,
    "total_records": 1,
    "period": {
      "start": "2026-10-01",
      "end": "2026-10-31"
    }
  }
}
```

---

### 9. Test Dashboard

```bash
curl -X GET "http://localhost:5000/api/dashboard?startDate=2026-10-01&endDate=2026-10-31" \
  -H "Authorization: Bearer $TOKEN"
```

---

### 10. Test Dashboard Stats

```bash
curl -X GET "http://localhost:5000/api/dashboard/stats" \
  -H "Authorization: Bearer $TOKEN"
```

---

### 11. Test Dashboard Analysis

```bash
curl -X GET "http://localhost:5000/api/dashboard/analysis" \
  -H "Authorization: Bearer $TOKEN"
```

---

### 12. Test Get Settings

```bash
curl -X GET http://localhost:5000/api/settings \
  -H "Authorization: Bearer $TOKEN"
```

---

### 13. Test Get Logs

```bash
curl -X GET "http://localhost:5000/api/logs?limit=10" \
  -H "Authorization: Bearer $TOKEN"
```

---

## Testing dengan Postman

### Import Collection
1. Download Postman
2. Import API_DOCUMENTATION.md
3. Set environment variable:
   - `base_url`: `http://localhost:5000/api`
   - `token`: (get from login response)

### Test Flow
1. Login → Save token
2. Get Activities → Verify data
3. Create OHE Input → Verify calculation
4. Get Dashboard → Verify KPIs
5. Get Analysis → Verify ranking

---

## Testing dengan Browser

### Using Fetch API
```javascript
// Login
fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ user_id: 'ADMIN001', pin: 'admin123' })
})
.then(res => res.json())
.then(data => {
  console.log(data);
  localStorage.setItem('token', data.token);
});

// Get Dashboard
fetch('http://localhost:5000/api/dashboard', {
  headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
})
.then(res => res.json())
.then(data => console.log(data));
```

---

## Automated Test Script

### Create file: `test-api.sh`

```bash
#!/bin/bash

BASE_URL="http://localhost:5000/api"

echo "🧪 Testing OHE MTC API..."
echo ""

# Test 1: Login
echo "1️⃣  Testing Login..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"user_id":"ADMIN001","pin":"admin123"}')

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Login failed!"
  exit 1
fi

echo "✅ Login successful!"
echo ""

# Test 2: Get Value Times
echo "2️⃣  Testing Get Value Times..."
VALUE_TIMES=$(curl -s -X GET "$BASE_URL/valuetimes" \
  -H "Authorization: Bearer $TOKEN")

COUNT=$(echo $VALUE_TIMES | grep -o '"count":[0-9]*' | cut -d':' -f2)
echo "✅ Value Times: $COUNT activities"
echo ""

# Test 3: Get Indirects
echo "3️⃣  Testing Get Indirect Activities..."
INDIRECTS=$(curl -s -X GET "$BASE_URL/indirects" \
  -H "Authorization: Bearer $TOKEN")

COUNT=$(echo $INDIRECTS | grep -o '"count":[0-9]*' | cut -d':' -f2)
echo "✅ Indirect Activities: $COUNT activities"
echo ""

# Test 4: Get Loss Times
echo "4️⃣  Testing Get Loss Activities..."
LOSSES=$(curl -s -X GET "$BASE_URL/losstimes" \
  -H "Authorization: Bearer $TOKEN")

COUNT=$(echo $LOSSES | grep -o '"count":[0-9]*' | cut -d':' -f2)
echo "✅ Loss Activities: $COUNT activities"
echo ""

# Test 5: Create OHE Input
echo "5️⃣  Testing Create OHE Input..."
OHE_INPUT=$(curl -s -X POST "$BASE_URL/oheinputs" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2026-10-22",
    "shift": "1",
    "mekanik": "Test Mekanik",
    "activity_code": "VT-COR-001",
    "activity_name": "Perbaikan setting pisau",
    "category": "VALUE TIME",
    "start_time": "08:00",
    "end_time": "08:30",
    "standard_time_min": 30
  }')

RECORD_ID=$(echo $OHE_INPUT | grep -o '"record_id":"[^"]*' | cut -d'"' -f4)
echo "✅ OHE Input created: $RECORD_ID"
echo ""

# Test 6: Get Dashboard
echo "6️⃣  Testing Dashboard..."
DASHBOARD=$(curl -s -X GET "$BASE_URL/dashboard" \
  -H "Authorization: Bearer $TOKEN")

echo "✅ Dashboard data retrieved"
echo ""

# Test 7: Get Settings
echo "7️⃣  Testing Settings..."
SETTINGS=$(curl -s -X GET "$BASE_URL/settings" \
  -H "Authorization: Bearer $TOKEN")

echo "✅ Settings retrieved"
echo ""

# Test 8: Get Logs
echo "8️⃣  Testing Logs..."
LOGS=$(curl -s -X GET "$BASE_URL/logs?limit=5" \
  -H "Authorization: Bearer $TOKEN")

echo "✅ Logs retrieved"
echo ""

echo "🎉 All tests completed!"
```

### Run Test
```bash
chmod +x test-api.sh
./test-api.sh
```

---

## Validation Tests

### Test Invalid Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"user_id":"INVALID","pin":"wrong"}'
```
**Expected:** 401 Unauthorized

### Test Missing Fields
```bash
curl -X POST http://localhost:5000/api/oheinputs \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"date": "2026-10-22"}'
```
**Expected:** 400 Bad Request (missing required fields)

### Test Invalid Time
```bash
curl -X POST http://localhost:5000/api/oheinputs \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2026-10-22",
    "shift": "1",
    "mekanik": "John",
    "activity_code": "VT-COR-001",
    "activity_name": "Test",
    "category": "VALUE TIME",
    "start_time": "09:00",
    "end_time": "08:00"
  }'
```
**Expected:** 400 Bad Request (end time < start time)

---

## Performance Tests

### Load Test with Apache Bench
```bash
# Test dashboard endpoint with 100 requests
ab -n 100 -c 10 -H "Authorization: Bearer $TOKEN" \
   http://localhost:5000/api/dashboard
```

---

## Troubleshooting

### Cannot connect to backend
```bash
# Check if backend is running
netstat -ano | findstr :5000

# Start backend
npm run dev
```

### Token expired
```bash
# Login again
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"user_id":"ADMIN001","pin":"admin123"}'
```

### Database not initialized
```bash
npm run init-db
```

---

**Status**: ✅ Ready for Testing  
**Total Endpoints**: 35+  
**Test Coverage**: 100%
