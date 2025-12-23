# Automobile Service Station - Backend API

Backend API service for the Automobile Service Station Management System, built with NestJS, PostgreSQL, and Prisma ORM.

## 📋 Overview

This is the backend REST API that powers the automobile service station mobile application. It handles user authentication, service bookings, order management, accessories shop, and real-time notifications.

## 🛠️ Technology Stack

- **Framework**: NestJS
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT
- **Validation**: class-validator, class-transformer
- **Documentation**: Swagger/OpenAPI
- **Containerization**: Docker
- **Push Notifications**: Firebase Cloud Messaging / AWS SNS

## 📦 Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- PostgreSQL (v14 or higher)
- Docker & Docker Compose (optional)

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd automobile-service-backend
```

### 2. Install Dependencies

```bash
yarn install
```

### 3. Environment Configuration

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/auto_service_db?schema=public"

# JWT
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRATION="1d"

# Server
PORT=5353
NODE_ENV=development

# AWS (Optional)
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"

# Push Notifications
FCM_SERVER_KEY="your-fcm-server-key"

# CORS
CORS_ORIGIN="http://localhost:8100"
```

### 4. Database Setup

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed database (optional)
npx prisma db seed
```

### 5. Run the Application

```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod

# Debug mode
npm run start:debug
```

The API will be available at `http://localhost:3000`

## 🐳 Docker Setup

### Using Docker Compose

```bash
# Start all services (app + database)
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Docker Commands

```bash
# Build image
docker build -t auto-service-backend .

# Run container
docker run -p 3000:3000 auto-service-backend
```

## 📚 API Documentation

Once the server is running, access the Swagger documentation at:

```
http://localhost:3000/api/docs
```

## 🏗️ Project Structure

```
src/
├── modules/
│   ├── auth/              # Authentication & Authorization
│   ├── users/             # User management
│   ├── services/          # Service offerings
│   ├── orders/            # Order management
│   ├── vehicles/          # Vehicle information
│   ├── accessories/       # Accessories shop
│   ├── notifications/     # Push notifications
│   └── admin/             # Admin panel operations
├── common/
│   ├── decorators/        # Custom decorators
│   ├── guards/            # Auth guards
│   ├── interceptors/      # Request/response interceptors
│   ├── filters/           # Exception filters
│   └── pipes/             # Validation pipes
├── config/                # Configuration files
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── migrations/        # Database migrations
├── app.module.ts
└── main.ts
```

## 🗄️ Database Schema

### Core Tables

- **users** - User accounts (customers and admins)
- **services** - Available services
- **orders** - Service orders
- **vehicles** - Customer vehicles
- **accessories** - Shop items
- **notifications** - Notification logs
- **admin_users** - Admin-specific data


## 🔐 Authentication & Authorization

### User Roles

- **REGULAR_USER** - Standard customers
- **ADMIN** - Service administrators
- **SUPER_ADMIN** - System administrators

### Protected Routes

```typescript
// Example: Protect route with JWT
@UseGuards(JwtAuthGuard)
@Get('profile')
getProfile(@Request() req) {
  return req.user;
}

// Example: Role-based access
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'SUPER_ADMIN')
@Patch('orders/:id/status')
updateOrderStatus() {
  // Only admins can access
}
```

## 📡 API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - User login
- `POST /auth/verify-phone` - Verify phone number
- `POST /auth/refresh` - Refresh access token

### Services
- `GET /services` - List all services
- `GET /services/:id` - Get service details
- `POST /services` - Create service (Admin)
- `PATCH /services/:id` - Update service (Admin)

### Orders
- `GET /orders` - Get user orders
- `GET /orders/:id` - Get order details
- `POST /orders` - Create new order
- `PATCH /orders/:id/status` - Update order status (Admin)

### Accessories
- `GET /accessories` - List accessories
- `POST /accessories/order` - Order accessories

### Vehicles
- `GET /vehicles` - Get user vehicles
- `POST /vehicles` - Add vehicle
- `PATCH /vehicles/:id` - Update vehicle

### Admin
- `GET /admin/users` - List all users (Super Admin)
- `POST /admin/create-admin` - Add admin user (Super Admin)
- `GET /admin/orders` - View all orders (Admin)

## 🔔 Push Notifications

Notifications are sent when:
- Order status changes
- Order reminder (24 hours before)
- Booking confirmation
- Order completion

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 🚢 Deployment

### AWS Deployment

1. **Build Docker image**
```bash
docker build -t auto-service-backend:latest .
```

2. **Push to ECR**
```bash
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com
docker tag auto-service-backend:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/auto-service-backend:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/auto-service-backend:latest
```

3. **Deploy to ECS/EC2**
- Configure ECS task definition
- Set environment variables
- Configure load balancer
- Deploy service

### Environment Variables (Production)

Ensure all production environment variables are set:
- Database connection strings
- JWT secrets
- AWS credentials
- Push notification keys

## 📝 Scripts

```json
{
  "start": "nest start",
  "start:dev": "nest start --watch",
  "start:debug": "nest start --debug --watch",
  "start:prod": "node dist/main",
  "build": "nest build",
  "test": "jest",
  "test:watch": "jest --watch",
  "test:cov": "jest --coverage",
  "test:e2e": "jest --config ./test/jest-e2e.json",
  "prisma:generate": "prisma generate",
  "prisma:migrate": "prisma migrate dev",
  "prisma:studio": "prisma studio"
}
```

## 🔧 Prisma Commands

```bash
# Open Prisma Studio (Database GUI)
npx prisma studio

# Create a migration
npx prisma migrate dev --name migration_name

# Reset database
npx prisma migrate reset

# Generate Prisma Client
npx prisma generate
```

## 🐛 Troubleshooting

### Database Connection Issues
```bash
# Check PostgreSQL is running
pg_isready

# Test connection
psql -h localhost -U user -d auto_service_db
```

### Port Already in Use
```bash
# Kill process on port 5353
lsof -ti:5353 | xargs kill -9
```

### Prisma Client Not Generated
```bash
npx prisma generate
```


## 📄 License

[Specify your license]

## 📧 Support

For issues and questions, please open an issue in the repository.

---

**Frontend Repository**: [Link to mobile app repository]
