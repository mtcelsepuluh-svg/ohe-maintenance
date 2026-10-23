# Production Deployment Guide

## 🚀 Local Production Deployment

This guide will help you deploy the OHE Maintenance application for production use on your local machine.

## Prerequisites

- **Node.js** v18 or higher
- **MongoDB** installed and running
- **Git** (optional, for updates)

## Quick Deployment

### Option 1: Automated Deployment (Recommended)

1. **Run the deployment script:**
   ```bash
   deploy-production.bat
   ```

2. **Wait for completion** - The script will:
   - Install all dependencies
   - Build the frontend
   - Start MongoDB
   - Launch backend and frontend servers

3. **Access the application:**
   - Frontend: http://localhost:4173
   - Backend API: http://localhost:5000

### Option 2: Manual Deployment

#### Step 1: Install Backend Dependencies

```bash
cd backend
npm install --production
```

#### Step 2: Configure Environment

Edit `backend/.env` and update:

```env
# Change this to a secure random string
JWT_SECRET=your-secure-production-secret-key-here

# Set to production
NODE_ENV=production

# Verify MongoDB URI
MONGODB_URI=mongodb://localhost:27017/ohe-maintenance
```

#### Step 3: Build Frontend

```bash
cd frontend
npm run build
```

This creates an optimized production build in `frontend/dist/`.

#### Step 4: Start MongoDB

```bash
# Windows
net start MongoDB

# Or if MongoDB is not installed as a service
# Start mongod manually
```

#### Step 5: Start Backend Server

```bash
cd backend
npm start
```

Backend will run on http://localhost:5000

#### Step 6: Start Frontend Server

```bash
cd frontend
npm run preview
```

Frontend will run on http://localhost:4173

## Production Startup Script

For easy startup after initial deployment:

```bash
start-production.bat
```

This script:
- Starts MongoDB
- Launches backend server
- Launches frontend server
- Opens both in separate windows

## Accessing the Application

1. Open your browser
2. Navigate to: http://localhost:4173
3. Login with default credentials:
   - **User ID:** ADMIN001
   - **PIN:** admin123

## Security Checklist

Before deploying to production:

- [ ] Change `JWT_SECRET` in `backend/.env` to a secure random string
- [ ] Change default admin password after first login
- [ ] Ensure MongoDB authentication is enabled
- [ ] Configure firewall rules if exposing to network
- [ ] Enable HTTPS for production use
- [ ] Set up regular backups

## Generating a Secure JWT Secret

Generate a secure random string for JWT_SECRET:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Copy the output and use it as your JWT_SECRET in `.env`.

## MongoDB Production Setup

### Option 1: MongoDB as Windows Service (Recommended)

MongoDB is already installed as a Windows service and will auto-start.

**Check status:**
```bash
sc query MongoDB
```

**Start service:**
```bash
net start MongoDB
```

**Stop service:**
```bash
net stop MongoDB
```

### Option 2: Manual MongoDB Startup

If not using as a service:

```bash
"C:\Program Files\MongoDB\Server\9.0\bin\mongod.exe" --dbpath "C:\ProgramData\MongoDB\Server\9.0\data"
```

## Troubleshooting

### Port Already in Use

If ports 5000 or 4173 are already in use:

1. **Find the process:**
   ```bash
   netstat -ano | findstr :5000
   netstat -ano | findstr :4173
   ```

2. **Kill the process:**
   ```bash
   taskkill /F /PID <PID>
   ```

3. **Or change the port** in `backend/.env` or `frontend/vite.config.ts`

### MongoDB Connection Failed

1. **Check if MongoDB is running:**
   ```bash
   sc query MongoDB
   ```

2. **Start MongoDB:**
   ```bash
   net start MongoDB
   ```

3. **Verify connection:**
   ```bash
   "C:\MongoDB\mongosh\mongosh-2.3.0-win32-x64\bin\mongosh.exe"
   ```

### Build Errors

If frontend build fails:

1. **Clear cache:**
   ```bash
   cd frontend
   rmdir /s /q node_modules
   npm install
   ```

2. **Rebuild:**
   ```bash
   npm run build
   ```

## Updating the Application

### From Git Repository

```bash
# Pull latest changes
git pull origin main

# Reinstall dependencies
cd backend && npm install --production && cd ..
cd frontend && npm install && npm run build && cd ..

# Restart servers
# (Close existing server windows and run start-production.bat again)
```

### Manual Updates

1. Stop all servers
2. Pull/apply updates
3. Run `deploy-production.bat` again

## Backup and Restore

### Backup MongoDB Database

```bash
mongodump --uri mongodb://localhost:27017/ohe-maintenance --out backup-folder
```

### Restore MongoDB Database

```bash
mongorestore --uri mongodb://localhost:27017/ohe-maintenance backup-folder/ohe-maintenance
```

## Performance Optimization

### Frontend

The production build is already optimized with:
- Minified JavaScript and CSS
- Code splitting
- Tree shaking
- Gzip compression

### Backend

For better performance:
- Enable MongoDB indexing
- Use connection pooling
- Implement caching (Redis)
- Use a reverse proxy (nginx)

## Monitoring

### Check Server Status

**Backend:**
```bash
netstat -ano | findstr :5000
```

**Frontend:**
```bash
netstat -ano | findstr :4173
```

**MongoDB:**
```bash
sc query MongoDB
```

### View Logs

**Backend logs:** Check the backend server window
**Frontend logs:** Check the frontend server window
**MongoDB logs:** `C:\ProgramData\MongoDB\Server\9.0\data\mongod.log`

## Support

For issues or questions:
- Check the logs in the server windows
- Review `backend/API_DOCUMENTATION.md`
- Check `README.md` for general information

## Production URLs

After deployment:
- **Main Application:** http://localhost:4173
- **API Endpoint:** http://localhost:5000
- **API Documentation:** http://localhost:5000/api/test

---

**Note:** For external access, configure your firewall and consider using a reverse proxy with SSL/TLS certificates.
