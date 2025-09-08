import express from 'express'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const router = express.Router()
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Get all items with filters
router.get('/', async (req, res) => {
  try {
    const { category, minPrice, maxPrice, search } = req.query

    // Read items from JSON file
    const data = await fs.readFile(path.join(__dirname, '../data/items.json'), 'utf8')
    let items = JSON.parse(data)

    // Apply filters
    if (category && category !== 'all') {
      items = items.filter(item => item.category.toLowerCase() === category.toLowerCase())
    }

    if (minPrice) {
      items = items.filter(item => item.price >= parseFloat(minPrice))
    }

    if (maxPrice) {
      items = items.filter(item => item.price <= parseFloat(maxPrice))
    }

    if (search) {
      const searchTerm = search.toLowerCase()
      items = items.filter(item =>
        item.name.toLowerCase().includes(searchTerm) ||
        item.description.toLowerCase().includes(searchTerm)
      )
    }

    res.json(items)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})

// Get single item
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params

    const data = await fs.readFile(path.join(__dirname, '../data/items.json'), 'utf8')
    const items = JSON.parse(data)
    const item = items.find(item => item.id === parseInt(id))

    if (!item) {
      return res.status(404).json({ message: 'Item not found' })
    }

    res.json(item)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})

export default router
