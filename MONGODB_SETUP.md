# MongoDB Setup Guide for FitQuest

This guide walks you through setting up MongoDB for the FitQuest application.

## Option 1: Local MongoDB Installation (Recommended for Development)

### macOS (using Homebrew)

```bash
# Install Homebrew if not already installed
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Tap the MongoDB brew repository
brew tap mongodb/brew

# Install MongoDB Community Edition
brew install mongodb-community

# Start MongoDB service
brew services start mongodb-community

# Verify MongoDB is running
mongosh  # Opens MongoDB shell
```

### Ubuntu/Debian Linux

```bash
# Add MongoDB GPG key
curl https://www.mongodb.org/static/pgp/server-6.0.asc | apt-key add -

# Add MongoDB repository
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Update package index
apt-get update

# Install MongoDB
apt-get install -y mongodb-org

# Start MongoDB service
systemctl start mongod
systemctl enable mongod  # Auto-start on boot

# Verify MongoDB is running
mongosh
```

### Windows

1. Download MongoDB from: https://www.mongodb.com/try/download/community
2. Run the installer and follow the setup wizard
3. Choose "Install MongoDB as a Service" (recommended)
4. MongoDB will automatically start after installation
5. Open Command Prompt and verify:
   ```bash
   mongosh
   ```

### Verify Installation

Once installed, verify MongoDB is running:

```bash
mongosh  # Opens MongoDB interactive shell
> db.version()  # Should display version number
> exit  # Exit shell
```

---

## Option 2: MongoDB Atlas (Cloud) - Recommended for Production

### Create a Free Cluster

1. Go to: https://www.mongodb.com/cloud/atlas
2. Click "Try Free" and create an account
3. Create an organization and project
4. Click "Build a Database" and select "M0 (Free)" tier
5. Choose your region (select closest to your location)
6. Complete setup

### Get Connection String

1. In Atlas dashboard, click "Databases"
2. Click "Connect" on your cluster
3. Select "Drivers"
4. Copy the connection string (looks like):
   ```
   mongodb+srv://username:password@cluster.mongodb.net/fitquest?retryWrites=true&w=majority
   ```

### Update FitQuest `.env`

Replace `server/.env`:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/fitquest?retryWrites=true&w=majority
```

---

## Verify FitQuest Database

Once your server starts, MongoDB will automatically create the database and collections:

```bash
# Connect to MongoDB
mongosh

# Select FitQuest database
use fitquest

# View collections
show collections
# Should show: users, bmirecords, dietlogs, workoutplans, chathistories

# View sample user
db.users.findOne()
```

---

## Common MongoDB Commands

```bash
# Connect to MongoDB
mongosh

# List all databases
show databases

# Switch to FitQuest database
use fitquest

# View all users
db.users.find()

# View a specific user
db.users.findOne({ email: "user@example.com" })

# Delete a user
db.users.deleteOne({ email: "user@example.com" })

# Count total users
db.users.countDocuments()

# View all BMI records
db.bmirecords.find()

# Exit
exit
```

---

## Troubleshooting

### MongoDB won't start on macOS
```bash
brew services restart mongodb-community
```

### MongoDB won't start on Linux
```bash
sudo systemctl restart mongod
sudo systemctl status mongod
```

### Connection refused error
- Make sure MongoDB is running (check `mongodb://localhost:27017`)
- Check firewall settings
- Verify MONGODB_URI in `.env` is correct

### Remote connection failing (Atlas)
- Check IP whitelist in MongoDB Atlas (Security → Network Access)
- Add your IP address or `0.0.0.0/0` for development
- Verify username and password in connection string

---

## Resources

- [MongoDB Official Docs](https://docs.mongodb.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [MongoDB Atlas Guide](https://docs.atlas.mongodb.com/)
- [Mongosh Documentation](https://www.mongodb.com/docs/mongodb-shell/)
