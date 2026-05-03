# AI Interview Arena (Bravely)

An immersive AI interviewer application featuring real-time peer-to-peer mock interviews, group discussions, and live coding environments to help you land your dream job with confidence.

## 🚀 Features
- **Solo Interviews**: Practice 1-on-1 with AI interviewers.
- **Peer Arena (P2P)**: WebRTC-powered live video interviews with peers.
- **Live Coding**: Interactive code execution environments for technical rounds.
- **Group Discussions**: Join scalable WebRTC rooms for group interview prep.
- **Real-Time Analytics**: Get post-interview score breakdowns and analytics.

## 🛠 Tech Stack
- **Frontend**: React 18, Vite, React Router DOM, Socket.io-client
- **Backend (Signaling)**: Node.js, Express, Socket.io (WebRTC Signaling)
- **Networking**: P2P WebRTC with STUN Server standard (`stun:stun.l.google.com:19302`)

## 📁 Project Structure
- `/frontend` - The React Vite client app.
- `/server` - The Node.js WebRTC signaling server.

## 🏁 Getting Started

### 1. Start the Backend Signaling Server
```bash
cd server
npm install # if a package.json exists, otherwise skip
node index.js
```
*The signaling server typically runs on port 5000.*

### 2. Start the Frontend
```bash
cd frontend
npm install
npm run dev
```

### 3. Open the Application
Navigate to `http://localhost:5173` (or the port Vite provides) in your browser.
