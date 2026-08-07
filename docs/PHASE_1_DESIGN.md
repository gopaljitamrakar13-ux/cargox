# Phase 1: CargoX Architecture & Design

## 1. Requirements Analysis
CargoX is a premium logistics platform connecting customers, truck owners, transport owners, and drivers. 
Key requirements:
- **Role-based Access**: Custom interfaces for Admin, Customer, Truck Owner, Transport Owner, Driver.
- **Shipment Management**: End-to-end cargo booking, tracking, and invoicing.
- **Real-Time Features**: Live tracking via WebSockets, real-time chat, notifications.
- **Premium UI**: Futuristic, glassmorphism, 3D elements via Three.js.
- **Security**: JWT, Firebase Auth, RBAC, Data encryption.

## 2. System Architecture
The system will follow a Modular Client-Server Architecture:
- **Frontend (Client)**: React 19 SPA served via Vite. Deployed on Vercel.
- **Backend (API)**: Python Flask REST API + WebSocket Server (Socket.IO). Deployed on Render.
- **Database**: MySQL relational database on Railway.
- **External Services**: 
  - Firebase (Auth)
  - Cloudinary (Document/Image Storage)
  - OpenStreetMap & Leaflet & OpenRouteService (Mapping, Routing, Geocoding)

## 3. Folder Structure

### Frontend Structure
```text
frontend/
├── public/
│   ├── assets/
│   │   ├── models/        # 3D models (GLTF/GLB)
│   │   └── textures/
├── src/
│   ├── api/               # Axios instances and API calls
│   ├── assets/            # Static assets (images, icons)
│   ├── components/        # Reusable UI components (Buttons, Inputs, Cards)
│   ├── context/           # React Context (Auth, Theme)
│   ├── hooks/             # Custom React hooks
│   ├── layouts/           # Dashboard, Auth, and Main layouts
│   ├── pages/             # Route pages (Landing, Login, Dashboards)
│   ├── routes/            # Route configurations
│   ├── store/             # Global state (if using Zustand/Redux)
│   ├── styles/            # Tailwind base, components, utilities
│   ├── utils/             # Helper functions, constants
│   ├── App.jsx
│   └── main.jsx
```

### Backend Structure
```text
backend/
├── app/
│   ├── __init__.py
│   ├── config.py
│   ├── api/               # API Blueprints (Controllers)
│   ├── models/            # SQLAlchemy Models
│   ├── schemas/           # Marshmallow/Pydantic validation
│   ├── services/          # Business logic
│   ├── sockets/           # Socket.IO event handlers
│   ├── utils/             # Security, Helpers, Decorators
│   └── middleware/        # Request interceptors
├── migrations/            # Flask-Migrate scripts
├── tests/                 # Unit and Integration tests
├── requirements.txt
└── run.py
```

## 4. API Design (RESTful)
- **Auth**: `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/verify`
- **Users**: `GET /api/users/profile`, `PUT /api/users/profile`
- **Shipments**: `POST /api/shipments`, `GET /api/shipments`, `GET /api/shipments/<id>`
- **Tracking**: `POST /api/tracking/update`, `GET /api/tracking/<shipment_id>`
- **Trucks**: `POST /api/trucks`, `GET /api/trucks`
- **Documents**: `POST /api/documents/upload`, `GET /api/documents`

## 5. Technology Decisions
- **Frontend**: React 19 + Vite (Fast HMR, latest React features).
- **Styling**: Tailwind CSS + GSAP + Framer Motion (Complex animations, Glassmorphism).
- **3D**: React Three Fiber + Drei (Easy 3D integration in React).
- **Backend**: Python Flask (Lightweight, modular, excellent WSGI support).
- **ORM**: SQLAlchemy (Robust DB interaction).
- **Sockets**: Flask-SocketIO (Real-time tracking and chat).
- **Storage**: Cloudinary (Optimized media delivery).
