# CargoX - Next Generation Logistics & Freight Network

CargoX is an enterprise-grade, real-time logistics and freight management platform inspired by Uber Freight and Convoy. It connects shippers and carriers through a seamless, automated, and visually premium interface.

## 🚀 Features

- **Role-Based Architecture**: Distinct workflows for Customers (Shippers), Truck Owners, Transport Owners, Drivers, and Admins.
- **Premium 3D UI**: Built with React 19, Framer Motion, and Three.js (React Three Fiber) featuring a dark-mode glassmorphism aesthetic.
- **Real-Time Tracking**: Geospatial mapping using Leaflet with real-time simulated telemetry.
- **Instant Chat & Notifications**: Real-time WebSockets communication (Socket.IO) between shippers and carriers.
- **Secure Authentication**: Firebase ID token validation paired with stateless JWT access tokens.
- **Scalable Backend**: Python Flask using the application factory pattern, SQLAlchemy ORM, and MySQL.

## 🛠️ Technology Stack

**Frontend**
- React 19 (Vite)
- Tailwind CSS v3
- Framer Motion
- React Three Fiber / Drei / Three.js
- React Hook Form
- React-Leaflet
- Axios
- Socket.IO Client

**Backend**
- Python 3.10+
- Flask (App Factory)
- Flask-SQLAlchemy (MySQL)
- Flask-JWT-Extended
- Flask-SocketIO
- Firebase Admin SDK
- PyMySQL

## 📦 Local Development

### Prerequisites
- Node.js v18+
- Python 3.10+
- MySQL Server (or Docker)

### 1. Database Setup
```bash
# Initialize MySQL Database using the provided script
mysql -u root -p < init.sql
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Configure Environment
cp .env.example .env
# Edit .env with your DB credentials and Firebase service account path

# Run Migrations and Server
flask db upgrade
flask run --port=5000
```

### 3. Frontend Setup
```bash
cd frontend
npm install
# Install additional dependencies added during development
npm install leaflet react-leaflet three @react-three/fiber @react-three/drei socket.io-client framer-motion lucide-react react-hook-form react-toastify axios

# Start Dev Server
npm run dev
```

## 🐳 Docker Deployment (Production)

To deploy the entire stack using Docker Compose:

```bash
docker-compose up --build -d
```
This will spin up:
- MySQL Database (Port 3306)
- Flask Backend (Port 5000)
- React Nginx Server (Port 80)

## 📁 Project Structure

```
cargox/
├── backend/            # Flask API & Socket Server
│   ├── app/            # Application Factory & Blueprints
│   │   ├── api/        # REST Controllers (auth, user, truck, shipment, chat)
│   │   ├── models/     # SQLAlchemy Models
│   │   └── ...
│   ├── tests/          # Pytest Suite
│   └── Dockerfile
├── frontend/           # React SPA
│   ├── src/
│   │   ├── components/ # Reusable UI components & 3D Scenes
│   │   ├── layouts/    # Auth, Main, and Dashboard Layouts
│   │   ├── pages/      # Role-based dashboard views
│   │   └── ...
│   └── Dockerfile
├── init.sql            # Database schema
└── docker-compose.yml  # Orchestration
```

## 📝 License

This project is intended for portfolio and demonstration purposes.
