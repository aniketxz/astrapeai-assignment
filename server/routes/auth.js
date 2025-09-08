import express from 'express'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import { config } from '../config.js'

const router = express.Router()

// Register
router.post('/register', async (req, res) => {
	try {
		const { email, password } = req.body

		if (!email || !password) {
			return res
				.status(400)
				.json({ message: 'Email and password are required' })
		}

		if (password.length < 6) {
			return res
				.status(400)
				.json({ message: 'Password must be at least 6 characters' })
		}

		const existingUser = await User.findOne({ email })
		if (existingUser) {
			return res.status(400).json({ message: 'User already exists' })
		}

		const user = new User({ email, password })
		await user.save()

		const token = jwt.sign({ userId: user._id }, config.JWT_SECRET, {
			expiresIn: '7d',
		})

		res.status(201).json({
			message: 'User created successfully',
			token,
			user: { id: user._id, email: user.email },
		})
	} catch (error) {
		res.status(500).json({ message: 'Server error', error: error.message })
	}
})

// Login
router.post('/login', async (req, res) => {
	try {
		const { email, password } = req.body

		if (!email || !password) {
			return res
				.status(400)
				.json({ message: 'Email and password are required' })
		}

		const user = await User.findOne({ email })
		if (!user) {
			return res.status(401).json({ message: 'Invalid credentials' })
		}

		const isMatch = await user.comparePassword(password)
		if (!isMatch) {
			return res.status(401).json({ message: 'Invalid credentials' })
		}

		const token = jwt.sign({ userId: user._id }, config.JWT_SECRET, {
			expiresIn: '7d',
		})

		res.json({
			message: 'Login successful',
			token,
			user: { id: user._id, email: user.email },
		})
	} catch (error) {
		res.status(500).json({ message: 'Server error', error: error.message })
	}
})

export default router
