import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import dotenv from 'dotenv'
import { config } from './config.js'

dotenv.config()

// Import routes
import authRoutes from './routes/auth.js'
import itemsRoutes from './routes/items.js'
import cartRoutes from './routes/cart.js'

const app = express()

// Middleware
app.use(cors())
app.use(express.json())

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/items', itemsRoutes)
app.use('/api/cart', cartRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ message: 'Server is running' })
})

app.get('/', (req, res) => {
  res.json({ message: 'Server is working' })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ message: 'Something went wrong!' })
})

const PORT = config.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
