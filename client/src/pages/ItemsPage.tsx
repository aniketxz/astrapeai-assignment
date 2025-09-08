import React, { useState, useEffect } from 'react'
import { itemsAPI } from '../services/api'
import { useCart } from '../context/CartContext'

interface Item {
	id: string
	name: string
	description: string
	price: number
	category: string
	image: string
	stock: number
}

const ItemsPage: React.FC = () => {
	const [items, setItems] = useState<Item[]>([])
	const [loading, setLoading] = useState(true)
	const [filters, setFilters] = useState({
		category: 'all',
		minPrice: '',
		maxPrice: '',
		search: '',
	})
	const [categories, setCategories] = useState<string[]>([])
	const { addToCart } = useCart()

	useEffect(() => {
		fetchItems()
	}, [filters])

	const fetchItems = async () => {
		try {
			setLoading(true)
			const response = await itemsAPI.getItems(filters)
			setItems(response.data)

			// Extract unique categories
			const uniqueCategories = Array.from(
				new Set(response.data.map((item: Item) => item.category))
			) as string[]
			setCategories(uniqueCategories)
		} catch (error) {
			console.error('Error fetching items:', error)
		} finally {
			setLoading(false)
		}
	}

	const handleFilterChange = (key: string, value: string) => {
		setFilters((prev) => ({ ...prev, [key]: value }))
	}

	const handleAddToCart = (item: Item) => {
		addToCart(item.id, 1, item)
	}

	if (loading) {
		return (
			<div className='min-h-screen flex items-center justify-center'>
				<div className='text-xl'>Loading...</div>
			</div>
		)
	}

	return (
		<div className='min-h-screen bg-gray-50'>
			<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
				<h1 className='text-3xl font-bold text-gray-900 mb-8'>Products</h1>

				{/* Filters */}
				<div className='bg-white p-6 rounded-lg shadow mb-8'>
					<div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
						<div>
							<label className='block text-sm font-medium text-gray-700 mb-2'>
								Search
							</label>
							<input
								type='text'
								placeholder='Search products...'
								value={filters.search}
								onChange={(e) => handleFilterChange('search', e.target.value)}
								className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500'
							/>
						</div>

						<div>
							<label className='block text-sm font-medium text-gray-700 mb-2'>
								Category
							</label>
							<select
								value={filters.category}
								onChange={(e) => handleFilterChange('category', e.target.value)}
								className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500'
							>
								<option value='all'>All Categories</option>
								{categories.map((category) => (
									<option key={category} value={category}>
										{category}
									</option>
								))}
							</select>
						</div>

						<div>
							<label className='block text-sm font-medium text-gray-700 mb-2'>
								Min Price
							</label>
							<input
								type='number'
								placeholder='0'
								value={filters.minPrice}
								onChange={(e) => handleFilterChange('minPrice', e.target.value)}
								className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500'
							/>
						</div>

						<div>
							<label className='block text-sm font-medium text-gray-700 mb-2'>
								Max Price
							</label>
							<input
								type='number'
								placeholder='1000'
								value={filters.maxPrice}
								onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
								className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500'
							/>
						</div>
					</div>
				</div>

				{/* Items Grid */}
				<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
					{items.map((item) => (
						<div
							key={item.id}
							className='bg-white rounded-lg shadow-md overflow-hidden'
						>
							<img
								src={item.image}
								alt={item.name}
								className='w-full h-48 object-cover'
							/>
							<div className='p-4'>
								<h3 className='text-lg font-semibold text-gray-900 mb-2'>
									{item.name}
								</h3>
								<p className='text-gray-600 text-sm mb-2 line-clamp-2'>
									{item.description}
								</p>
								<div className='flex justify-between items-center mb-4 text-xl font-bold text-indigo-600'>
									${item.price}
								</div>
								<button
									onClick={() => handleAddToCart(item)}
									className='w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer'
								>
									Add to Cart
								</button>
							</div>
						</div>
					))}
				</div>

				{items.length === 0 && (
					<div className='text-center py-12'>
						<p className='text-gray-500 text-lg'>
							No products found matching your criteria.
						</p>
					</div>
				)}
			</div>
		</div>
	)
}

export default ItemsPage
