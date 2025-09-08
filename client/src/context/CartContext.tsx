import React, { createContext, useContext, useReducer, useEffect } from "react"

interface CartItem {
  itemId: string
  quantity: number
  item?: {
    id: number
    name: string
    price: number
    image: string
  }
}

interface CartState {
  items: CartItem[]
  totalItems: number
  totalPrice: number
}

type CartAction =
  | { type: "LOAD_CART"; payload: CartItem[] }
  | {
      type: "ADD_ITEM"
      payload: { itemId: string; quantity: number; item?: any }
    }
  | { type: "REMOVE_ITEM"; payload: string }
  | { type: "UPDATE_QUANTITY"; payload: { itemId: string; quantity: number } }
  | { type: "CLEAR_CART" }
  | { type: "MERGE_CART"; payload: CartItem[] }

// Initialize cart state from localStorage if available
const getInitialCartState = (): CartState => {
  try {
    const savedCart = localStorage.getItem("cart")
    if (savedCart) {
      const cartItems = JSON.parse(savedCart)
      const totalItems = cartItems.reduce(
        (sum: number, item: CartItem) => sum + item.quantity,
        0
      )
      const totalPrice = cartItems.reduce((sum: number, item: CartItem) => {
        const price = item.item?.price || 0
        return sum + price * item.quantity
      }, 0)
      return {
        items: cartItems,
        totalItems,
        totalPrice,
      }
    }
  } catch (error) {
    console.error("Error loading initial cart state:", error)
  }
  return {
    items: [],
    totalItems: 0,
    totalPrice: 0,
  }
}

const initialState: CartState = getInitialCartState()

const cartReducer = (state: CartState, action: CartAction): CartState => {
  let newItems: CartItem[]

  switch (action.type) {
    case "LOAD_CART":
      newItems = action.payload
      break
    case "ADD_ITEM": {
      const existingItem = state.items.find(
        (item) => item.itemId === action.payload.itemId
      )
      if (existingItem) {
        newItems = state.items.map((item) =>
          item.itemId === action.payload.itemId
            ? { ...item, quantity: item.quantity + action.payload.quantity }
            : item
        )
      } else {
        newItems = [...state.items, action.payload]
      }
      break
    }
    case "REMOVE_ITEM":
      newItems = state.items.filter((item) => item.itemId !== action.payload)
      break
    case "UPDATE_QUANTITY":
      newItems = state.items.map((item) =>
        item.itemId === action.payload.itemId
          ? { ...item, quantity: action.payload.quantity }
          : item
      )
      // Remove if quantity becomes 0 or less
      if (action.payload.quantity <= 0) {
        newItems = newItems.filter(
          (item) => item.itemId !== action.payload.itemId
        )
      }
      break
    case "CLEAR_CART":
      newItems = []
      break
    case "MERGE_CART": {
      // Merge server cart with local cart
      const localCart = state.items
      const serverCart = action.payload

      // If server cart is empty, keep local cart
      if (serverCart.length === 0) {
        newItems = localCart
      } else {
        // Create a map of server cart items
        const serverCartMap = new Map(
          serverCart.map((item) => [item.itemId, item])
        )

        // Merge: server items take precedence, add local items not in server
        newItems = [
          ...serverCart,
          ...localCart.filter((item) => !serverCartMap.has(item.itemId)),
        ]
      }
      break
    }
    default:
      newItems = state.items
  }

  const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = newItems.reduce((sum, item) => {
    const price = item.item?.price || 0
    return sum + price * item.quantity
  }, 0)

  return {
    items: newItems,
    totalItems,
    totalPrice,
  }
}

interface CartContextType extends CartState {
  addToCart: (itemId: string, quantity: number, item?: any) => void
  removeFromCart: (itemId: string) => void
  updateQuantity: (itemId: string, quantity: number) => void
  clearCart: () => void
  loadCart: (items: CartItem[]) => void
  mergeCart: (serverCart: CartItem[]) => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export const useCart = () => {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(cartReducer, initialState)

  // Cart is now initialized from localStorage in the initial state
  // No need for a separate useEffect to load it

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(state.items))
  }, [state.items])

  const addToCart = (itemId: string, quantity: number, item?: any) => {
    dispatch({ type: "ADD_ITEM", payload: { itemId, quantity, item } })
  }

  const removeFromCart = (itemId: string) => {
    dispatch({ type: "REMOVE_ITEM", payload: itemId })
  }

  const updateQuantity = (itemId: string, quantity: number) => {
    dispatch({ type: "UPDATE_QUANTITY", payload: { itemId, quantity } })
  }

  const clearCart = () => {
    dispatch({ type: "CLEAR_CART" })
  }

  const loadCart = (items: CartItem[]) => {
    dispatch({ type: "LOAD_CART", payload: items })
  }

  const mergeCart = (serverCart: CartItem[]) => {
    dispatch({ type: "MERGE_CART", payload: serverCart })
  }

  const value = {
    ...state,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    loadCart,
    mergeCart,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
