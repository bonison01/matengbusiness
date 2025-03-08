'use client';
import React, { useState } from 'react';
import { useCart } from '../business/context/CartContext';
import BuyNowForm from './BuyNowForm';

const CartPage: React.FC = () => {
  const { cart, updateQty, removeFromCart, clearCart, totalPrice } = useCart();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const onOrderPlaced = (generatedOrderId: string) => {
    setOrderId(generatedOrderId);
  };

  // Handling and delivery charges
  const handlingCharge = 6;
  const deliveryCharge = totalPrice && totalPrice < 300 ? 37 : 0;

  // Adjust total price calculation to include handling and delivery charges
  const adjustedTotalPrice = (totalPrice && !isNaN(totalPrice)) ? totalPrice + handlingCharge + deliveryCharge : 0;

  // Description message for the bill
  const deliveryMessage =
    totalPrice && totalPrice < 300
      ? `Add items worth ₹${(300 - totalPrice).toFixed(2)} more to get free delivery!`
      : 'Congratulations! You are eligible for free delivery.';

  return (
    <div className="max-w-6xl mx-auto p-5">
      <a
        href="/discover/product"
        className="inline-block text-center py-2 px-4 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        Back to All Products
      </a>

      <h1 className="text-2xl font-bold mb-5 text-white">Your Cart</h1>
      {cart.length === 0 ? (
        <p className="text-gray-500">Your cart is empty.</p>
      ) : (
        <>
          <ul className="space-y-4 mb-5">
            {cart.map((item) => (
              <li key={item.id} className="flex justify-between items-center bg-white-100 p-4 rounded shadow">
                <div>
                  <h2 className="font-semibold text-white py-1 px-3">{item.name}</h2>
                  <p className="font-semibold text-white py-1 px-2">Price: {item.discounted_price ? `₹${item.discounted_price}` : 'N/A'}</p>
                  <p className="font-semibold text-white py-1 px-2">Quantity: {item.qty}</p>
                  <p className="font-semibold text-white py-1 px-2">
                    Total: {item.discounted_price ? `₹${(parseFloat(item.discounted_price) * item.qty).toFixed(2)}` : 'N/A'}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    value={item.qty}
                    onChange={(e) => updateQty(item.id, Math.max(1, parseInt(e.target.value, 10)))}
                    className="border rounded p-1 w-16 text-black"
                  />
                  <button
                    className="bg-red-500 text-black py-1 px-3 rounded hover:bg-red-600"
                    onClick={() => removeFromCart(item.id)}
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-xl font-bold text-white">
              Total Price: ₹{adjustedTotalPrice.toFixed(2)}
            </h2>
            <div className="flex space-x-4">
              <button
                className="bg-red-500 text-black py-2 px-4 rounded hover:bg-red-600"
                onClick={clearCart}
              >
                Clear Cart
              </button>
              <button
                className="bg-green-500 text-black py-2 px-4 rounded hover:bg-green-600"
                onClick={openModal}
              >
                Buy All
              </button>
            </div>
          </div>

          {/* Bill Description */}
          <div className="text-white mt-4">
            <p>Handling Charge: ₹{handlingCharge}</p>
            {deliveryCharge > 0 && <p>Delivery Charge: ₹{deliveryCharge}</p>}
            <p>{deliveryMessage}</p>
          </div>
        </>
      )}

      {isModalOpen && (
        <BuyNowForm
          items={cart}
          totalPrice={adjustedTotalPrice} // Pass adjustedTotalPrice here
          onClose={closeModal}
          onOrderPlaced={onOrderPlaced}
        />
      )}

      {orderId && (
        <div className="mt-4 text-green-500 font-bold">
          <p>Your Order ID is: {orderId}</p>
        </div>
      )}
    </div>
  );
};

export default CartPage;
