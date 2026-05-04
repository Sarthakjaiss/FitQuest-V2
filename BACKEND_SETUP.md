# FitQuest Backend Setup Guide

Complete guide to setting up the FitQuest Node.js + Express + MongoDB backend.

## Architecture Overview

```
Node.js + Express
    ↓
Routes (Auth, User Data)
    ↓
Middleware (JWT Auth, CORS)
    ↓
Mongoose Models (Schemas)
    ↓
MongoDB (Data Store)
```

## Prerequisites

```bash
# Check Node.js version (need v18+)
node --version

# Check npm version (need v9+)
npm --version

# MongoDB should be running (see MONGODB_SETUP.md)
mongosh  # Opens shell if MongoDB is running
```

## Installation

### 1. Navigate to Server Directory

```bash
cd FitQuest/server
```

### 2. Install Dependencies

```bash
npm install
```

This installs:
- `express` - Web framework
- `mongoose` - MongoDB ODM
- `bcryptjs` - Password hashing
- `jsonwebtoken` - JWT authentication
- `cors` - Cross-Origin Resource Sharing
- `dotenv` - Environment variables
- `nodemon` - Auto-restart on changes (dev only)

### 3. Create `.env` File

```bash
cp .env.example .env
```

Edit `server/.env`:

```env
# Server
PORT=5000
NODE_ENV=development

# Security
JWT_SECRET=your_secret_key_change_in_production

# CORS
CLIENT_URL=http://localhost:5173

# MongoDB (local)
MONGODB_URI=mongodb://localhost:27017/fitquest

# OR MongoDB Atlas (cloud)
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/fitquest?retryWrites=true&w=majority
```

## Running the Server

### Development Mode (with auto-reload)

```bash
npm run dev
```

Output:
```
✅ MongoDB connected successfully
🚀 Server running on http://localhost:5000
📦 Database: MongoDB
🔌 Ready to accept connections
```

### Production Mode

```bash
npm start
```

## API Testing

### Health Check

```bash
curl http://localhost:5000/api/health
```

Response:
```json
{
  "status": "OK",
  "message": "💪 FitQuest API is running",
  "timestamp": "2024-01-15T10:30:45.123Z"
}
```

### Register User

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Fitness",
    "email": "john@example.com",
    "password": "SecurePass123",
    "gender": "male",
    "age": 28,
    "weight": 75,
    "height": 180,
    "fitness_goal": "muscle_gain",
    "activity_level": "moderate"
  }'
```

Response:
```json
{
  "message": "Registration successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Fitness",
    "email": "john@example.com",
    "gender": "male",
    "age": 28,
    "weight": 75,
    "height": 180,
    "fitness_goal": "muscle_gain",
    "activity_level": "moderate"
  }
}
```

### Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123"
  }'
```

### Save BMI Record

```bash
curl -X POST http://localhost:5000/api/user/bmi \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "weight": 75,
    "height": 180
  }'
```

## Project Structure

```
server/
├── server.js                    ← Main app entry point
├── package.json                 ← Dependencies
├── .env                        ← Environment (GITIGNORED)
├── .env.example                ← Environment template
│
├── models/
│   └── db.js                   ← Mongoose schemas & models
│       ├── User Schema
│       ├── BMIRecord Schema
│       ├── DietLog Schema
│       ├── WorkoutPlan Schema
│       └── ChatHistory Schema
│
├── middleware/
│   └── auth.js                 ← JWT verification middleware
│
└── routes/
    ├── auth.js                 ← Auth endpoints (register, login, profile)
    └── user.js                 ← User data endpoints (BMI, diet, workouts, chat)
```

## Folder Structure Explanation

### `models/db.js`
- Defines all MongoDB schemas using Mongoose
- Exports models (User, BMIRecord, DietLog, WorkoutPlan, ChatHistory)
- Handles MongoDB connection with `.connectDB()`
- Includes field validation and indexes

### `middleware/auth.js`
- JWT authentication middleware
- Verifies token in `Authorization: Bearer {token}` header
- Attaches user info to `req.user`
- Used on protected routes

### `routes/auth.js`
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Sign in
- `GET /api/auth/me` - Current user (protected)
- `PUT /api/auth/profile` - Update profile (protected)

### `routes/user.js`
- `POST /api/user/bmi` - Save BMI record
- `GET /api/user/bmi` - Get BMI history
- `POST /api/user/diet` - Log nutrition
- `GET /api/user/diet` - Get diet logs
- `POST /api/user/workouts` - Create workout plan
- `GET /api/user/workouts` - Get all plans
- `DELETE /api/user/workouts/:id` - Delete plan
- `GET /api/user/chat` - Get chat history
- `POST /api/user/chat` - Save chat message
- `DELETE /api/user/chat` - Clear chat

## Environment Variables Reference

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 5000 | Server port |
| `NODE_ENV` | development | Environment |
| `JWT_SECRET` | (required) | Secret for signing tokens |
| `CLIENT_URL` | http://localhost:5173 | CORS origin |
| `MONGODB_URI` | mongodb://localhost:27017/fitquest | Database connection |

## Database Connection

### Local MongoDB

```env
MONGODB_URI=mongodb://localhost:27017/fitquest
```

Requires MongoDB running locally on port 27017.

### MongoDB Atlas (Recommended for Production)

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/fitquest?retryWrites=true&w=majority
```

1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a free M0 cluster
3. Get connection string from Connect menu

## Common Issues & Solutions

### Error: "Cannot connect to MongoDB"

**Problem:** MongoDB is not running or connection string is wrong

**Solution:**
```bash
# Check if MongoDB is running
mongosh

# Update MONGODB_URI in .env
MONGODB_URI=mongodb://localhost:27017/fitquest

# Restart server
npm run dev
```

### Error: "JWT token invalid"

**Problem:** Token expired or wrong secret

**Solution:**
```bash
# Make sure JWT_SECRET in .env is correct
JWT_SECRET=your_super_secret_key

# Login again to get new token
```

### Error: "CORS error"

**Problem:** Frontend and backend have different origins

**Solution:**
```env
# Update in server/.env
CLIENT_URL=http://localhost:5173
```

### Error: "Port 5000 already in use"

**Problem:** Another process is using port 5000

**Solution:**
```bash
# Change PORT in .env
PORT=5001

# Or kill the existing process
# macOS/Linux
lsof -i :5000
kill -9 <PID>

# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

## Database Inspection

### Using MongoDB Shell

```bash
# Connect to local MongoDB
mongosh

# Select FitQuest database
use fitquest

# View all collections
show collections

# View sample user
db.users.findOne()

# Count records
db.bmirecords.countDocuments()

# View all with filtering
db.dietlogs.find({ userId: ObjectId("...") })
```

### Using MongoDB Compass (GUI)

1. Download: https://www.mongodb.com/products/compass
2. Connect to `mongodb://localhost:27017`
3. Browse databases and collections visually

## Performance Tips

1. **Use indexes** - Already configured on userId, date fields
2. **Limit queries** - Use `.limit(100)` for large datasets
3. **Select fields** - Use `.select('-password')` to exclude sensitive data
4. **Connection pooling** - Mongoose handles automatically
5. **Error handling** - Always wrap async routes in try-catch

## Security Best Practices

1. **Change JWT_SECRET** - Use strong random value in production
2. **Validate input** - Check required fields before saving
3. **Hash passwords** - Using bcryptjs with salt rounds 12
4. **HTTPS** - Use in production (not needed for local testing)
5. **CORS** - Only allow trusted CLIENT_URL
6. **Environment** - Never commit .env to version control

## Next Steps

1. ✅ Start MongoDB
2. ✅ Install dependencies (`npm install`)
3. ✅ Configure `.env`
4. ✅ Start server (`npm run dev`)
5. ✅ Test health endpoint
6. ✅ Start frontend client (`npm run dev` in `client/` folder)
7. ✅ Create account and test app

---

For more details on MongoDB setup, see [MONGODB_SETUP.md](./MONGODB_SETUP.md)
