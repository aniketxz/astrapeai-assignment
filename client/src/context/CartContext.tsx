import React, { createContext, useContext, useReducer, useEffect } from "react"

interface CartItem {
  itemId: number
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
      payload: { itemId: number; quantity: number; item?: any }
    }
  | { type: "REMOVE_ITEM"; payload: number }
  | { type: "UPDATE_QUANTITY"; payload: { itemId: number; quantity: number } }
  | { type: "CLEAR_CART" }
  | { type: "MERGE_CART"; payload: CartItem[] }

const initialState: CartState = {
  items: [],
  totalItems: 0,
  totalPrice: 0,
}

const cartReducer = (state: CartState, action: CartAction): CartState => {
  let newItems: CartItem[]

  switch (action.type) {
    case "LOAD_CART":
      newItems = action.payload
      break
    case "ADD_ITEM":
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
    case "REMOVE_ITEM":
      newItems = state.items.filter((item) => item.itemId !== action.payload)
      break
    case "UPDATE_QUANTITY":
      newItems = state.items
        .map((item) =>
          item.itemId === action.payload.itemId
            ? { ...item, quantity: action.payload.quantity }
            : item
        )
        .filter((item) => item.quantity > 0)
      break
    case "CLEAR_CART":
      newItems = []
      break
    case "MERGE_CART":
      // Merge server cart with local cart
      const localCart = state.items
      const serverCart = action.payload

      // Create a map of server cart items
      const serverCartMap = new Map(
        serverCart.map((item) => [item.itemId, item])
      )

      // Merge: server items take precedence, add local items not in server
      newItems = [
        ...serverCart,
        ...localCart.filter((item) => !serverCartMap.has(item.itemId)),
      ]
      break
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
  addToCart: (itemId: number, quantity: number, item?: any) => void
  removeFromCart: (itemId: number) => void
  updateQuantity: (itemId: number, quantity: number) => void
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

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("cart")
    if (savedCart) {
      try {
        const cartItems = JSON.parse(savedCart)
        dispatch({ type: "LOAD_CART", payload: cartItems })
      } catch (error) {
        console.error("Error loading cart from localStorage:", error)
      }
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(state.items))
  }, [state.items])

  const addToCart = (itemId: number, quantity: number, item?: any) => {
    dispatch({ type: "ADD_ITEM", payload: { itemId, quantity, item } })
  }

  const removeFromCart = (itemId: number) => {
    dispatch({ type: "REMOVE_ITEM", payload: itemId })
  }

  const updateQuantity = (itemId: number, quantity: number) => {
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
