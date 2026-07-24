# 🔍 FindIt — Lost & Found Platform

🔗 **Live Demo:** https://finditnoww.netlify.app
💻 **GitHub:** https://github.com/Myselfdheerajsingh/Lost-and-Found

> A full-stack web application to report and recover lost & found items.
> Built to solve a real-world problem faced in college campuses and public spaces.

---

## ✨ Features

- 🔐 JWT Authentication (Register / Login)
- 📋 Post Lost / Found items with photos
- 🔍 Search & Filter by category and type
- 💬 Real-time Chat via Socket.io
- 🗺️ Interactive Map (OpenStreetMap)
- 📷 Cloud Image Upload (Cloudinary)
- 🌙 Dark / Light Mode Toggle
- ✅ Mark items as Resolved

---

## 🛠️ Tech Stack

| Frontend | Backend | Database | Services |
|----------|---------|----------|----------|
| React.js | Node.js | MongoDB Atlas | Cloudinary |
| React Router v6 | Express.js | Mongoose ODM | OpenStreetMap |
| Axios | Socket.io | | JWT + Bcrypt |

---

## 📸 Screenshots

### 🏠 Home Page
<img src="./Project%20Images/home.png" width="900"/>

---

### 📄 Item Details
<img src="./Project%20Images/item.png" width="900"/>

---

### ➕ Post Item
<img src="./Project%20Images/post.png" width="900"/>

---

### 🗺️ Map View
<img src="./Project%20Images/map.png" width="900"/>

---

### 💬 Real-time Chat
<img src="./Project%20Images/chat.png" width="900"/>

---

### 👤 User Profile
<img src="./Project%20Images/Profile.png" width="900"/>

---

### 📝 Create Account
<img src="./Project%20Images/createaccount.png" width="900"/>

---

### 🔑 Login
<img src="./Project%20Images/login.png" width="900"/>

---

## 🚀 Run Locally

### Backend
```bash
cd backend
npm install
node server.js
```

### Frontend
```bash
cd frontend
npm install
npm start
```

---

## ⚙️ Environment Variables

### Backend `.env`
```
PORT=3001
MONGO_URI=your_mongodb_atlas_uri
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLIENT_URL=http://localhost:3000
```

### Frontend `.env`
```
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_SOCKET_URL=http://localhost:3001
```

---

## 📁 Project Structure

```
findit/
├── backend/
│   ├── models/        # User, Item, Message schemas
│   ├── routes/        # auth, items, messages, users
│   ├── middleware/    # JWT auth, Cloudinary upload
│   └── server.js      # Express + Socket.io entry point
└── frontend/
    └── src/
        ├── pages/     # Browse, Post, Map, Chat, Profile
        ├── components/ # Navbar
        ├── context/   # AuthContext
        └── utils/     # api.js, socket.js
```

---

## 🌐 Deployment

| Service | Platform | URL |
|---------|----------|-----|
| Frontend | Netlify | https://finditnoww.netlify.app |
| Backend | Render | https://lost-and-found-v7tb.onrender.com |
| Database | MongoDB Atlas | Cloud hosted |
| Images | Cloudinary | Cloud CDN |

---

## 🔌 APIs Used

| API | Purpose | Free? |
|-----|---------|-------|
| MongoDB Atlas | Cloud Database | ✅ |
| Cloudinary | Image Upload & Storage | ✅ |
| OpenStreetMap | Interactive Map | ✅ |
| Nominatim | Reverse Geocoding | ✅ |
| Socket.io | Real-time Chat | ✅ |
| JWT + Bcrypt | Authentication & Security | ✅ |

---

## 👨‍💻 Made by

**Dheeraj Singh**
B.Tech Computer Science and Engineering
Hemwati Nandan Bahuguna Garhwal University

[![GitHub](https://img.shields.io/badge/GitHub-Myselfdheerajsingh-black?logo=github)](https://github.com/Myselfdheerajsingh)
