MindBridge- AI Powered Support

MindBridge is an AI-powered mental health support platform designed to bridge the gap between patients and mental health professionals. It provides a safe and supportive digital space where users can interact with an AI therapist (Dr. Mind) through real-time chat and voice input, track their daily stress levels and mood patterns through visual graphs and streaks, and access a variety of wellness tools including relaxation music, calming games, breathing exercises, and mental health quizzes. The platform features role-based access for three types of users — Patients, Psychiatrists, and Admins. Patients can monitor their emotional wellbeing, log their moods, and receive personalized support. Psychiatrists can view their assigned patients, monitor stress reports, and communicate with them directly. Admins have full control over the platform, managing users, roles, and emergency SOS alerts. MindBridge combines the power of artificial intelligence, sentiment analysis, and compassionate design to make mental healthcare more accessible, interactive, and stigma-free for everyone.


Features:

1. Authentication
	
Role-based login (Patient, Psychiatrist, Admin)
Signup with confirm password validation
Forgot password and reset via email
JWT token authentication
Password hashing using bcrypt

2. AI Chat

Real-time chat with AI therapist (Dr. Mind)
Voice input using microphone
Text-to-speech bot responses
Chat history saved to database
Typing animation indicator

3. Wellness Tools

Relaxation music player with 20+ soothing tracks
Category filters (Nature, Rain, Meditation, Ambient)
Calming games for stress relief
Breathing and relaxation exercises
Mental health quizzes with scoring

4. Patient Dashboard

Personalized greeting with mood selector
Quick access to all wellness features
Recent activity log
Reminders and notifications

5.Psychiatrist Dashboard

Patient list with latest stress levels
Patient detail view with reports
Direct messaging with patients
Schedule and appointment management
Clinical notes

6. Admin Dashboard

Complete user management (add, delete, activate/deactivate)
Role management (Patient, Psychiatrist, Admin)
Search and filter users
Emergency SOS alerts and notifications
System statistics overview

7. AI & Analytics

Sentiment analysis on chat messages
Stress detection from text patterns
Emotion detection
Face detection for mood analysis
Stress history and trend generation

8. Security & Privacy

JWT protected routes
Role-based access control
Encrypted passwords
Secure API endpoints


Tech Stack

Layer                       | Technology
----------------------------|----------------------------------
Frontend                    | React.js, TypeScript, Tailwind CSS, Vite
UI Components               | Shadcn/UI, Lucide React
Backend                     | Node.js, Express.js
Database                    | MySQL
Authentication              | JWT (JSON Web Tokens), Bcrypt
AI Chat Model               | Ollama (Phi-3)
Sentiment Analysis          | Ollama (LLaVA)
Facial & Emotion Detection  | Ollama (LLaVA, Ollava)
Version Control             | Git, GitHub
Development Environment     | GitHub Codespaces, VS Code


Project Structure


mindbridge_psychiatrist_bot/
│
├── backend/
│   ├── config/
│   │   └── database.js          (MySQL connection & schema)
│   ├── middleware/
│   │   └── auth.js              (JWT authentication)
│   ├── routes/
│   │   ├── admin.js             (Admin APIs)
│   │   ├── auth.js              (Login, Register, Reset Password)
│   │   ├── chat.js              (AI Chat APIs)
│   │   ├── psychiatrist.js      (Psychiatrist APIs)
│   │   ├── stress.js            (Stress tracking APIs)
│   │   └── user.js              (User profile APIs)
│   ├── .env                     (Environment variables)
│   └── server.js                (Main backend server)
│
├── src/
│   ├── components/
│   │   ├── Navbar.tsx           (Navigation bar)
│   │   └── StressGauge.tsx      (Stress level component)
│   ├── pages/
│   │   ├── Landing.jsx          (Home page)
│   │   ├── Login.tsx            (Login & Signup)
│   │   ├── UserDashboard.tsx    (Patient dashboard)
│   │   ├── ChatPage.tsx         (AI chat interface)
│   │   ├── RelaxMusic.tsx       (Music player)
│   │   ├── StressCheck.tsx      (Stress analysis)
│   │   ├── PsychiatristDashboard.tsx  (Doctor dashboard)
│   │   └── AdminDashboard.tsx   (Admin panel)
│   ├── App.tsx                  (Main app & routes)
│   └── main.tsx                 (Entry point)
│
├── .env.local                   (Frontend environment variables)
├── package.json                 (Dependencies)
└── vite.config.ts               (Vite configuration)


Prerequisites


Make sure you have the following installed before proceeding:

1. Basic System Setup
   - Windows / Linux / macOS
   - Internet Connection

2. Node.js Environment
   - Node.js installed (v18 or above)
   - npm installed (comes with Node.js)
   - Verify: node --version && npm --version

3. Database
   - MySQL installed and running
   - MySQL Workbench (optional, for viewing data)

4. AI Models (Ollama)
   - Ollama installed
   - Phi-3 model downloaded (ollama pull phi3)
   - LLaVA model downloaded (ollama pull llava)

5. Development Environment
   - VS Code or GitHub Codespaces
   - Git installed


Installation & Setup Steps


Follow these steps in order to run the project successfully:

Step 1: Clone the Repository
        git clone https://github.com/Ipshita2884/mindbridge_psychiatrist_bot.git
        cd mindbridge_psychiatrist_bot

Step 2: Install Frontend Dependencies
        npm install

Step 3: Install Backend Dependencies
        cd backend
        npm install

Step 4: Setup MySQL Database
        - Start MySQL service
        - Create a database named: mindbridge
        - The tables will be created automatically when backend starts

Step 5: Configure Environment Variables
        - In backend/ create a .env file with:

        DB_HOST=localhost
        DB_USER=root
        DB_PASSWORD=your_password
        DB_NAME=mindbridge
        PORT=5000
        JWT_SECRET=your_secret_key

Step 6: Setup Ollama Models
        ollama pull phi3
        ollama pull llava
        ollama serve

Step 7:  7: Start the Backend
        cd backend
        node server.js

Step 8: Start the Frontend
        cd ..
        npm run dev

Step 9: Open in Browser
        Frontend runs on: http://localhost:8080
        (Note: If port 8080 is busy, Vite will automatically
        use the next available port - 8081, 8082, 8083, 8084 etc.
        Check your terminal for the exact URL after running npm run dev)


MindBrige Command List:

1. Patient
   - Login / Signup
   - Log daily mood
   - Chat with AI therapist (Dr. Mind)
   - View stress level and weekly graph
   - Play relaxation music
   - Take mental health quiz
   - Trigger SOS emergency alert

2. Psychiatrist
   - View patient list and stress reports
   - Send message to patient
   - Manage schedule and clinical notes

3. Admin
   - Manage users (add, delete, activate, deactivate)
   - Change user roles
   - View and resolve SOS alerts

4. Terminal Commands
   - Start backend:   cd backend && node server.js
   - Start frontend:  npm run dev
   - Start Ollama:    ollama serve
   - Pull models:     ollama pull phi3
                      ollama pull llava




 


