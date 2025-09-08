import express from 'express'
import User from '../models/User.js'
import { authenticateToken } from '../middleware/auth.js'

const router = express.Router()

// Get user's cart
router.get('/', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('cart')
    res.json(user.cart)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})

// Add item to cart
router.post('/add', authenticateToken, async (req, res) => {
  try {
    const { itemId, quantity = 1 } = req.body

    if (!itemId) {
      return res.status(400).json({ message: 'Item ID is required' })
    }

    const user = await User.findById(req.user._id)
    const existingItem = user.cart.find(item => item.itemId === itemId)

    if (existingItem) {
      existingItem.quantity += quantity
    } else {
      user.cart.push({ itemId, quantity })
    }

    await user.save()
    res.json({ message: 'Item added to cart', cart: user.cart })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})

// Update cart item quantity
router.put('/update', authenticateToken, async (req, res) => {
  try {
    const { itemId, quantity } = req.body

    if (!itemId || quantity < 1) {
      return res.status(400).json({ message: 'Valid item ID and quantity required' })
    }

    const user = await User.findById(req.user._id)
    const cartItem = user.cart.find(item => item.itemId === itemId)

    if (!cartItem) {
      return res.status(404).json({ message: 'Item not found in cart' })
    }

    cartItem.quantity = quantity
    await user.save()

    res.json({ message: 'Cart updated', cart: user.cart })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})

// Remove item from cart
router.delete('/remove/:itemId', authenticateToken, async (req, res) => {
  try {
    const { itemId } = req.params

    const user = await User.findById(req.user._id)
    user.cart = user.cart.filter(item => item.itemId !== parseInt(itemId))
    await user.save()

    res.json({ message: 'Item removed from cart', cart: user.cart })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})

// Clear entire cart
router.delete('/clear', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
    user.cart = []
    await user.save()

    res.json({ message: 'Cart cleared', cart: user.cart })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})

export default router
