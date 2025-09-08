# E-Commerce Web Application

A single-page e-commerce application with authentication, product listing, filtering, and cart functionality.

## Features

### Backend

- **Authentication**: JWT-based authentication with email/password
- **Items API**: Get products with filtering (category, price range, search)
- **Cart API**: Add, remove, update cart items
- **Database**: MongoDB with Mongoose for user data
- **Static Data**: Products stored in JSON file

### Frontend

- **Authentication**: Login and signup pages
- **Product Listing**: Browse products with filters
- **Cart**: Add/remove items, quantity management
- **Persistence**: Cart persists in localStorage when logged out
- **Responsive**: Mobile-friendly design with Tailwind CSS

## Tech Stack

### Backend

- Node.js + Express.js 5
- MongoDB + Mongoose
- JWT for authentication
- CORS enabled

### Frontend

- React + TypeScript
- Vite for build tooling
- React Router for navigation
- Tailwind CSS v4 for styling
- Axios for API calls

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud)

### Backend Setup

1. Navigate to the server directory:

   ```bash
   cd server
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start MongoDB (if running locally):

   ```bash
   mongod
   ```

4. Start the server:
   ```bash
   npm run dev
   ```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the client directory:

   ```bash
   cd client
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create environment file:

   ```bash
   # Create .env file in client directory
   echo "VITE_API_BASE_URL=http://localhost:5000/api" > .env
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

The frontend will run on `http://localhost:5173`

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Items

- `GET /api/items` - Get all items (with filters)
- `GET /api/items/:id` - Get single item

### Cart (Protected)

- `GET /api/cart` - Get user's cart
- `POST /api/cart/add` - Add item to cart
- `PUT /api/cart/update` - Update cart item quantity
- `DELETE /api/cart/remove/:itemId` - Remove item from cart
- `DELETE /api/cart/clear` - Clear entire cart

## Usage

1. **Browse Products**: Visit the home page to see all products
2. **Filter Products**: Use the filter options (category, price range, search)
3. **Add to Cart**: Click "Add to Cart" on any product
4. **View Cart**: Click the cart icon in the navigation
5. **Authentication**:
   - Click "Login" to sign in
   - Click "Sign up" to create a new account
   - Cart persists even when logged out

## Cart Persistence

- When logged out: Cart is stored in localStorage
- When logged in: Cart is synced with the server
- When logging in: Local cart is merged with server cart

## Project Structure

```
├── server/
│   ├── data/
│   │   └── items.json          # Static product data
│   ├── middleware/
│   │   └── auth.js             # JWT authentication middleware
│   ├── models/
│   │   └── User.js             # User model
│   ├── routes/
│   │   ├── auth.js             # Authentication routes
│   │   ├── items.js            # Items routes
│   │   └── cart.js             # Cart routes
│   ├── config.js               # Configuration
│   └── server.js               # Main server file
├── client/
│   ├── src/
│   │   ├── components/         # React components
│   │   ├── context/            # React contexts
│   │   ├── pages/              # Page components
│   │   ├── services/           # API services
│   │   └── App.tsx             # Main app component
│   └── package.json
└── README.md
```
