"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const CartContext = createContext(null);

const emptyCart = { items: [], totalItems: 0, totalPrice: 0 };

export function CartProvider({ children }) {
  const { token } = useAuth();
  const [cart, setCart] = useState(emptyCart);
  const [loading, setLoading] = useState(false);

  // load the cart when the user logs in, clear it when the user logs out
  useEffect(() => {
    if (!token) {
      setCart(emptyCart);
      return;
    }

    setLoading(true);
    api("/cart", { token })
      .then((data) => setCart(data.cart))
      .catch(() => setCart(emptyCart))
      .finally(() => setLoading(false));
  }, [token]);

  // every cart api returns the new cart, so we just save it
  const addToCart = async (productId, quantity = 1) => {
    const data = await api("/cart", { method: "POST", body: { productId, quantity }, token });
    setCart(data.cart);
  };

  const updateItem = async (productId, quantity) => {
    const data = await api(`/cart/${productId}`, { method: "PUT", body: { quantity }, token });
    setCart(data.cart);
  };

  const removeItem = async (productId) => {
    const data = await api(`/cart/${productId}`, { method: "DELETE", token });
    setCart(data.cart);
  };

  const clearCart = async () => {
    const data = await api("/cart", { method: "DELETE", token });
    setCart(data.cart);
  };

  return (
    <CartContext.Provider value={{ cart, loading, addToCart, updateItem, removeItem, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);