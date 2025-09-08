import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom"
import "./App.css"
import { AuthProvider } from "./context/AuthContext"
import { CartProvider } from "./context/CartContext"
import Navbar from "./components/Navbar"
import LoginPage from "./pages/LoginPage"
import ItemsPage from "./pages/ItemsPage"
import CartPage from "./pages/CartPage"
import ProtectedRoute from "./components/ProtectedRoute"

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <div className='min-h-screen bg-gray-50'>
            <Navbar />
            <Routes>
              <Route path='/login' element={<LoginPage />} />
              <Route path='/' element={<ItemsPage />} />
              <Route
                path='/cart'
                element={
                  <ProtectedRoute>
                    <CartPage />
                  </ProtectedRoute>
                }
              />
              <Route path='*' element={<Navigate to='/' replace />} />
            </Routes>
          </div>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  )
}

export default App
