import React, { useEffect, useState } from "react"
import { useCart } from "../context/CartContext"
import { useAuth } from "../context/AuthContext"
import { cartAPI } from "../services/api"

const CartPage: React.FC = () => {
  const {
    items,
    totalItems,
    totalPrice,
    updateQuantity,
    removeFromCart,
    clearCart,
    mergeCart,
  } = useCart()
  const { isAuthenticated } = useAuth()
  const [loading, setLoading] = useState(false)

  // Load server cart when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadServerCart()
    }
  }, [isAuthenticated])

  const loadServerCart = async () => {
    try {
      setLoading(true)
      const response = await cartAPI.getCart()
      mergeCart(response.data)
    } catch (error) {
      console.error("Error loading server cart:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleQuantityChange = async (itemId: string, newQuantity: number) => {
    const existsLocally = items.some((i) => i.itemId === itemId)

    if (isAuthenticated) {
      try {
        if (newQuantity <= 0) {
          await cartAPI.removeFromCart(itemId)
          removeFromCart(itemId)
          return
        }

        // Avoid 404 by choosing proper endpoint based on local presence
        if (!existsLocally) {
          await cartAPI.addToCart(itemId, newQuantity)
        } else {
          await cartAPI.updateCartItem(itemId, newQuantity)
        }
        updateQuantity(itemId, newQuantity)
      } catch (error: any) {
        const status = error?.response?.status
        if (newQuantity > 0 && status === 404) {
          try {
            await cartAPI.addToCart(itemId, newQuantity)
            updateQuantity(itemId, newQuantity)
            return
          } catch (_) {}
        }
        // Fallback local state to keep UI responsive
        if (newQuantity <= 0) {
          removeFromCart(itemId)
        } else {
          updateQuantity(itemId, newQuantity)
        }
        console.error("Error updating cart item:", error)
      }
    } else {
      if (newQuantity <= 0) {
        removeFromCart(itemId)
      } else {
        updateQuantity(itemId, newQuantity)
      }
    }
  }

  const handleRemoveItem = async (itemId: string) => {
    if (isAuthenticated) {
      try {
        await cartAPI.removeFromCart(itemId)
        removeFromCart(itemId)
      } catch (error) {
        console.error("Error removing cart item:", error)
      }
    } else {
      removeFromCart(itemId)
    }
  }

  const handleClearCart = async () => {
    if (isAuthenticated) {
      try {
        await cartAPI.clearCart()
        clearCart()
      } catch (error) {
        console.error("Error clearing cart:", error)
      }
    } else {
      clearCart()
    }
  }

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-xl'>Loading cart...</div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        <h1 className='text-3xl font-bold text-gray-900 mb-8'>Shopping Cart</h1>

        {items.length === 0 ? (
          <div className='text-center py-12'>
            <p className='text-gray-500 text-lg'>Your cart is empty.</p>
          </div>
        ) : (
          <div className='bg-white rounded-lg shadow'>
            <div className='px-6 py-4 border-b border-gray-200'>
              <div className='flex justify-between items-center'>
                <h2 className='text-lg font-medium text-gray-900'>
                  {totalItems} {totalItems === 1 ? "item" : "items"} in your
                  cart
                </h2>
                <button
                  onClick={handleClearCart}
                  className='text-red-600 hover:text-red-500 text-sm font-medium cursor-pointer'
                >
                  Clear Cart
                </button>
              </div>
            </div>

            <div className='divide-y divide-gray-200'>
              {items.map((item) => (
                <div
                  key={item.itemId}
                  className='px-6 py-4 flex items-center space-x-4'
                >
                  <img
                    src={
                      item.item?.image ||
                      "https://images.pexels.com/photos/4439444/pexels-photo-4439444.jpeg"
                    }
                    alt={item.item?.name || "Product"}
                    className='w-20 h-20 object-cover rounded-md'
                  />

                  <div className='flex-1 min-w-0'>
                    <h3 className='text-lg font-medium text-gray-900 truncate'>
                      {item.item?.name || `Item ${item.itemId}`}
                    </h3>
                    <p className='text-gray-500'>
                      ${item.item?.price || 0} each
                    </p>
                  </div>

                  <div className='flex items-center space-x-2'>
                    <button
                      onClick={() =>
                        handleQuantityChange(item.itemId, item.quantity - 1)
                      }
                      className='w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 cursor-pointer'
                    >
                      -
                    </button>
                    <span className='w-12 text-center'>{item.quantity}</span>
                    <button
                      onClick={() =>
                        handleQuantityChange(item.itemId, item.quantity + 1)
                      }
                      className='w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 cursor-pointer'
                    >
                      +
                    </button>
                  </div>

                  <div className='text-lg font-medium text-gray-900'>
                    ${((item.item?.price || 0) * item.quantity).toFixed(2)}
                  </div>

                  <button
                    onClick={() => handleRemoveItem(item.itemId)}
                    className='text-red-600 hover:text-red-500 p-2 cursor-pointer'
                  >
                    <svg
                      className='w-5 h-5'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            <div className='px-6 py-4 bg-gray-50 border-t border-gray-200'>
              <div className='flex justify-between items-center'>
                <span className='text-lg font-medium text-gray-900'>
                  Total:
                </span>
                <span className='text-2xl font-bold text-gray-900'>
                  ${totalPrice.toFixed(2)}
                </span>
              </div>
              <button className='w-full mt-4 bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer'>
                Proceed to Checkout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CartPage
