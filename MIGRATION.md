# Backend Migration: SQLite to MongoDB

This document explains the changes made to migrate the FitQuest backend from SQLite to MongoDB.

## Overview

The FitQuest backend has been refactored to use **MongoDB** with **Mongoose ODM** instead of SQLite with `better-sqlite3`. The API endpoints remain **100% identical**, so the frontend code requires **zero changes**.

## Changes Made

### Database Layer

| Aspect | SQLite | MongoDB |
|--------|--------|---------|
| Driver | `better-sqlite3` | `mongoose` |
| Data Format | SQL tables | JSON documents |
| Schema | Fixed schema | Flexible with validation |
| Queries | SQL statements | Mongoose methods |
| Transactions | Limited | Full ACID support |
| Cloud | File-based | Atlas cloud support |

### File Changes

**Deleted:**
- `server/models/db.js` (SQLite initialization)

**Replaced with:**
- `server/models/db.js` (Mongoose schemas + models)

**Updated:**
- `server/routes/auth.js` - Mongoose queries instead of SQL
- `server/routes/user.js` - Mongoose queries instead of SQL
- `server/server.js` - MongoDB connection instead of SQLite
- `server/.env` - Added `MONGODB_URI`
- `server/package.json` - Replaced `better-sqlite3` with `mongoose`

### Package Changes

```diff
- "better-sqlite3": "^9.4.3"
+ "mongoose": "^7.8.0"
```

## Database Schemas

All schemas automatically create collections on first use.

### User Schema
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  gender: String (male|female|other),
  age: Number,
  weight: Number,
  height: Number,
  fitness_goal: String,
  activity_level: String,
  createdAt: Date,
  updatedAt: Date
}
```

### BMI Record Schema
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  weight: Number,
  height: Number,
  bmi: Number,
  category: String,
  recordedAt: Date
}
```

### Diet Log Schema
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  date: String (YYYY-MM-DD),
  calories_target: Number,
  calories_consumed: Number,
  protein_g: Number,
  carbs_g: Number,
  fat_g: Number,
  water_ml: Number,
  notes: String,
  createdAt: Date
}
```

### Workout Plan Schema
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  name: String,
  description: String,
  day_of_week: String,
  exercises: [
    {
      name: String,
      sets: Number,
      reps: String,
      rest: Number,
      muscle: String
    }
  ],
  duration_minutes: Number,
  intensity: String,
  createdAt: Date
}
```

### Chat History Schema
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  role: String (user|assistant),
  content: String,
  createdAt: Date
}
```

## API Compatibility

✅ **All API endpoints remain identical:**

```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me
PUT    /api/auth/profile

POST   /api/user/bmi
GET    /api/user/bmi
POST   /api/user/diet
GET    /api/user/diet
POST   /api/user/workouts
GET    /api/user/workouts
DELETE /api/user/workouts/:id
GET    /api/user/chat
POST   /api/user/chat
DELETE /api/user/chat
```

**Frontend code requires NO changes!** 🎉

## Advantages of MongoDB

1. **Scalability** - Horizontal scaling with sharding
2. **Flexibility** - Schema can evolve without migrations
3. **Cloud Support** - Atlas provides free managed hosting
4. **Performance** - Optimized for document queries
5. **Developer Experience** - JSON-like documents feel natural in JavaScript
6. **Transactions** - Full ACID support in recent versions
7. **Replication** - Built-in replica sets for high availability

## Local Testing

### Using Local MongoDB

```bash
# 1. Start MongoDB locally
mongod

# 2. Update .env
MONGODB_URI=mongodb://localhost:27017/fitquest

# 3. Start FitQuest server
npm run dev:server

# 4. Test health endpoint
curl http://localhost:5000/api/health
```

### Using MongoDB Atlas (Cloud)

```bash
# 1. Get connection string from Atlas
mongodb+srv://username:password@cluster.mongodb.net/fitquest

# 2. Update .env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/fitquest?retryWrites=true&w=majority

# 3. Start FitQuest server
npm run dev:server

# 4. Test health endpoint
curl http://localhost:5000/api/health
```

## Performance Notes

- **Indexes**: Automatically created on frequently queried fields (userId, date, etc.)
- **Queries**: Optimized with `.sort()`, `.limit()`, `.select()`
- **Memory**: Mongoose caches connections, efficient for concurrent requests
- **Scalability**: Ready for horizontal scaling with MongoDB sharding

## Migration Checklist

- ✅ Replaced SQLite with MongoDB + Mongoose
- ✅ Migrated all database schemas
- ✅ Updated authentication routes
- ✅ Updated user data routes
- ✅ Updated server initialization
- ✅ Added MongoDB documentation
- ✅ Maintained 100% API compatibility
- ✅ Frontend code unchanged

## Rollback (if needed)

If you need to revert to SQLite:
1. Check git history for original SQLite version
2. Restore `server/models/db.js` (SQLite)
3. Revert `server/routes/auth.js` and `server/routes/user.js`
4. Update `server/package.json` to use `better-sqlite3`
5. No frontend changes needed

---

For detailed MongoDB setup, see [MONGODB_SETUP.md](./MONGODB_SETUP.md)
