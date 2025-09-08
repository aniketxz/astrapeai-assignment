import React from "react"
import { Link, useLocation } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useCart } from "../context/CartContext"

const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth()
  const { totalItems } = useCart()
  const location = useLocation()

  return (
    <nav className='bg-white shadow-lg'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex justify-between h-16'>
          <div className='flex items-center'>
            <Link to='/' className='text-xl font-bold text-blue-700'>
              Astrape.ai
            </Link>
          </div>

          <div className='flex items-center space-x-4'>
            <Link
              to='/'
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                location.pathname === "/"
                  ? "bg-indigo-100 text-indigo-700"
                  : "text-gray-700 hover:text-indigo-600"
              }`}
            >
              Products
            </Link>

            <Link
              to='/cart'
              className={`relative px-3 py-2 rounded-md text-sm font-medium ${
                location.pathname === "/cart"
                  ? "bg-indigo-100 text-indigo-700"
                  : "text-gray-700 hover:text-indigo-600"
              }`}
            >
              Cart
              {totalItems > 0 && (
                <span className='absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full size-5 flex items-center justify-center'>
                  {totalItems}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <div className='flex items-center space-x-4'>
                <span className='text-sm text-gray-700'>
                  Welcome, {user?.email.split("@")[0]}
                </span>
                <button
                  onClick={logout}
                  className='px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-indigo-600'
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                to='/login'
                className={`relative px-3 py-2 rounded-md text-sm font-medium ${
                  location.pathname === "/login"
                    ? "bg-indigo-100 text-indigo-700"
                    : "text-gray-700 hover:text-indigo-600"
                }`}
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
