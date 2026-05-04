# ⚡ FitQuest — Your Ultimate AI-Powered Fitness Companion

> A full-stack fitness web application with AI coaching, BMI tracking, nutrition planning, workout management, and YouTube exercise tutorials.

---

## 🚀 Features

| Feature | Description |
|---|---|
| 🔐 **Authentication** | JWT-based signup/login with SQLite database |
| 📊 **BMI Tracker** | Visual gauge meter + history chart + health advice |
| 🥗 **Diet & Macros** | TDEE/BMR calculator, macro breakdown, daily logging, meal ideas |
| 🏋️ **Workout Planner** | Weekly planner, exercise builder, drag-to-apply templates |
| 🎥 **Exercise Videos** | YouTube-embedded form guides filtered by muscle/level |
| 🤖 **AI Coach (FitBot)** | Claude-powered chatbot for personalized workout & nutrition plans |
| 🌙 **Dark / Light Mode** | Persistent theme toggle with industrial-athletic design system |
| 📱 **Responsive Design** | Works on desktop, tablet, and mobile |

---

## 🛠️ Tech Stack

**Frontend**
- React 18 + React Router 6
- Recharts (charts & graphs)
- Framer Motion (animations)
- Lucide React (icons)
- Vite (build tool)

**Backend**
- Node.js + Express
- MongoDB + Mongoose (ODM)
- bcryptjs (password hashing)
- JSON Web Tokens (JWT)

**AI**
- Anthropic Claude API (`claude-sonnet-4-20250514`)

---

## 📁 Project Structure

```
FitQuest/
├── client/                    # React Frontend (Vite)
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── components/
│       │   ├── Auth/          # Login & Signup pages
│       │   ├── Dashboard/     # Main overview dashboard
│       │   ├── BMI/           # BMI calculator + gauge
│       │   ├── Diet/          # TDEE + macro planner + meal ideas
│       │   ├── Workout/       # Workout planner + exercise videos
│       │   ├── Chatbot/       # AI coach (FitBot)
│       │   └── Layout/        # Sidebar + Navbar
│       ├── context/
│       │   ├── AuthContext.jsx   # Auth state (login/logout/register)
│       │   └── ThemeContext.jsx  # Dark/light theme toggle
│       ├── App.jsx
│       └── main.jsx
│
├── server/                    # Node.js Backend (Express)
│   ├── models/
│   │   └── db.js              # SQLite setup + table init
│   ├── middleware/
│   │   └── auth.js            # JWT verification middleware
│   ├── routes/
│   │   ├── auth.js            # /api/auth/* endpoints
│   │   └── user.js            # /api/user/* endpoints
│   └── server.js              # Express app entry point
│
├── package.json               # Root scripts (concurrent dev)
└── README.md
```

---

## ⚙️ Setup Instructions

### Prerequisites
- **Node.js** v18+
- **npm** v9+
- **MongoDB** v4.4+ (local or remote)

---

### 1. MongoDB Setup

**Local MongoDB:**
```bash
# macOS with Homebrew
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community

# Ubuntu/Debian
curl https://www.mongodb.org/static/pgp/server-6.0.asc | apt-key add -
apt-get update && apt-get install -y mongodb-org
systemctl start mongod

# Windows
# Download from https://www.mongodb.com/try/download/community
```

**Or use MongoDB Atlas (Cloud):**
- Create free cluster at https://www.mongodb.com/cloud/atlas
- Get connection string: `mongodb+srv://username:password@cluster.mongodb.net/fitquest`

---

### 2. Clone & Install

```bash
# Clone the repository
git clone https://github.com/yourusername/fitquest.git
cd fitquest

# Install all dependencies (server + client)
npm run install:all
```

---

### 3. Configure Environment Variables

**Server** (`server/.env`):
```bash
cp server/.env.example server/.env
```
Edit `server/.env`:
```env
PORT=5000
JWT_SECRET=your_very_secret_key_here
CLIENT_URL=http://localhost:5173
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/fitquest
```

If using MongoDB Atlas:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/fitquest?retryWrites=true&w=majority
```

**Client** (`client/.env`):
```bash
cp client/.env.example client/.env
```

### 4. Run the Application

```bash
# From root directory — starts both server and client
npm run dev
```

Or run separately:
```bash
# Terminal 1: Backend (port 5000)
npm run dev:server

# Terminal 2: Frontend (port 5173)
npm run dev:client
```

---

### 5. Open in Browser

```
Frontend:  http://localhost:5173
API:       http://localhost:5000/api/health
```

Create an account, complete your profile, and start your FitQuest!

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Register new user |
| `POST` | `/api/auth/login` | Login user |
| `GET`  | `/api/auth/me` | Get current user |
| `PUT`  | `/api/auth/profile` | Update profile |

### User Data (all require JWT)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/user/bmi` | Save BMI record |
| `GET`  | `/api/user/bmi` | Get BMI history |
| `POST` | `/api/user/diet` | Log daily nutrition |
| `GET`  | `/api/user/diet` | Get diet history |
| `POST` | `/api/user/workouts` | Create workout plan |
| `GET`  | `/api/user/workouts` | Get all workout plans |
| `DELETE` | `/api/user/workouts/:id` | Delete workout plan |
| `GET`  | `/api/user/chat` | Get chat history |
| `POST` | `/api/user/chat` | Save chat message |
| `DELETE` | `/api/user/chat` | Clear chat history |

---

## 🤖 AI Chatbot (FitBot)

FitBot is powered by **Anthropic Claude** (`claude-sonnet-4-20250514`). It uses your profile data (gender, age, weight, height, goal, activity level) to give **personalized** advice.

Example things you can ask:
- *"Create a 7-day workout plan for me"*
- *"What should I eat to lose weight?"*
- *"Give me a HIIT routine for 20 minutes"*
- *"Calculate my exact macros for muscle gain"*

> **Note:** The FitBot makes calls to the Anthropic API directly from the frontend. In production, you should proxy this through your backend to protect API keys.

---

## 🎨 Design System

| Token | Value |
|---|---|
| Primary Font | Bebas Neue (headings) |
| Body Font | Barlow (body text) |
| Mono Font | JetBrains Mono (numbers) |
| Accent | `#c8f135` (Electric Lime) |
| Accent 2 | `#00e5ff` (Cyan) |
| Dark BG | `#0a0a0f` |
| Light BG | `#f4f4f8` |

---

## 📝 License

MIT License — feel free to use for personal and commercial projects.

---

**Built with ❤️ and 💪 — FitQuest by [Your Name]**
