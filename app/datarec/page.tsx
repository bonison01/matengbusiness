'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import styles from './Orders.module.css';
import * as XLSX from 'xlsx';
import JsBarcode from 'jsbarcode';

interface Order {
  id: number;
  order_id: string;
  quantity: number;
  name: string;
  buyer_address: string;
  buyer_phone: string;
  created_at: string;
  status: string;
  item_list: { id: number; name: string; price: number; total: number; quantity: number }[];
  total_price: number;
  total_calculated_price: number;
}

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [showProducts, setShowProducts] = useState<number | null>(null);

  // Fetch data from Supabase on mount
  useEffect(() => {
    const fetchOrders = async () => {
      const { data, error } = await supabase.from('order_rec').select('*');

      if (error) {
        console.error('Error fetching data:', error.message);
      } else {
        setOrders(data || []);
        setFilteredOrders(data || []);
      }
    };

    fetchOrders();
  }, []);

  // Filter orders by date range
  useEffect(() => {
    if (startDate && endDate) {
      const filtered = orders.filter((order) => {
        const orderDate = new Date(order.created_at);
        return orderDate >= new Date(startDate) && orderDate <= new Date(endDate);
      });
      setFilteredOrders(filtered);
    } else {
      setFilteredOrders(orders);
    }
  }, [startDate, endDate, orders]);

  // Handle input changes
  const handleInputChange = (orderId: number, field: string, value: string | number) => {
    setFilteredOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.id === orderId
          ? {
              ...order,
              [field]: value, // Update the field dynamically
            }
          : order
      )
    );
  };
  const handleDateFilterChange = () => {
    if (startDate && endDate) {
      const filtered = orders.filter((order) => {
        const orderDate = new Date(order.created_at);
        return orderDate >= new Date(startDate) && orderDate <= new Date(endDate);
      });
      setFilteredOrders(filtered);
    } else {
      setFilteredOrders(orders);
    }
  };
  
  // Handle saving the order
  const handleSave = async (orderId: number) => {
    const updatedOrder = filteredOrders.find((order) => order.id === orderId);

    if (updatedOrder) {
      const { data, error } = await supabase
        .from('order_rec')
        .upsert([updatedOrder]);

      if (error) {
        console.error('Error saving order:', error.message);
      } else {
        console.log('Order saved successfully', data);
      }
    }
  };

  // Export to Excel function
  const exportToExcel = () => {
    const data = filteredOrders.map((order) => ({
      ID: order.id,
      'Order ID': order.order_id,
      Quantity: order.quantity,
      'Name': order.name,
      'Address': order.buyer_address,
      'Phone': order.buyer_phone,
      'Created At': new Date(order.created_at).toLocaleString(),
      Status: order.status,
      'Item List': order.item_list.map(item => `${item.name} (${item.quantity} x ₹${item.price})`).join(', '),
      'Total Price': order.total_price,
      'Total Calculated Price': order.total_calculated_price,
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Orders');
    XLSX.writeFile(wb, 'orders.xlsx');
  };

  // Print invoice function
  const printInvoice = (order: Order) => {
    const printWindow = window.open('', '_blank', 'width=800,height=600');

    if (!printWindow) return;

    const itemListHtml = order.item_list.map(item => {
      return `<tr>
                <td>${item.name} (qty-${item.quantity})</td>
                <td>₹${item.price}</td>
                <td>₹${item.total}</td>
              </tr>`;
    }).join('');

    const barcodeUrl = printBarcode(order.order_id);

    const invoiceHtml = `
      <html>
        <head>
          <title>Invoice - ${order.order_id}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { text-align: center; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .total { font-weight: bold; }
            .footer { text-align: center; font-size: 14px; margin-top: 40px; }
          </style>
        </head>
        <body>
          <div class="invoiceHeader">
            <h1>Mateng Marketplace</h1>
            <div class="barcode"><img src="${barcodeUrl}" alt="Barcode" /></div>
          </div>
          <p><strong>Name:</strong> ${order.name}</p>
          <p><strong>Address:</strong> ${order.buyer_address}</p>
          <p><strong>Phone:</strong> ${order.buyer_phone}</p>
          <p><strong>Created At:</strong> ${new Date(order.created_at).toLocaleString()}</p>
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemListHtml}
            </tbody>
          </table>
          <p class="total">Subtotal: ₹${order.total_price}</p>
          <p class="total">Total Calculated Price: ₹${order.total_calculated_price}</p>
          <div class="footer">
            <p>Thank you for your purchase!</p>
            <p>Contact us at: justmateng@gmail.com</p>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(invoiceHtml);
    printWindow.document.close();
    printWindow.print();
  };

  const printBarcode = (orderId: string) => {
    const barcodeCanvas = document.createElement('canvas');
    JsBarcode(barcodeCanvas, orderId, { format: 'CODE128' });
    return barcodeCanvas.toDataURL();
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Order List</h1>

      {/* Filter Section */}
      <div className={styles.filterSection}>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
        <button onClick={handleDateFilterChange}>Filter by Date</button>
      </div>

      <button className={styles.exportButton} onClick={exportToExcel}>Export to Excel</button>

      {filteredOrders.length > 0 ? (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Order ID</th>
              <th>Quantity</th>
              <th>Name</th>
              <th>Address</th>
              <th>Phone</th>
              <th>Created At</th>
              <th>Status</th>
              <th>Item List</th>
              <th>Total Price</th>
              <th>Total Calculated Price</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>{order.order_id}</td>

                {/* Editable Quantity */}
                <td>
                  <input
                    type="number"
                    value={order.quantity ?? ''}
                    onChange={(e) =>
                      handleInputChange(order.id, 'quantity', e.target.value)
                    }
                  />
                </td>

                {/* Editable Name */}
                <td>
                  <input
                    type="text"
                    value={order.name}
                    onChange={(e) =>
                      handleInputChange(order.id, 'name', e.target.value)
                    }
                  />
                </td>

                <td>{order.buyer_address}</td>
                <td>{order.buyer_phone}</td>
                <td>{new Date(order.created_at).toLocaleString()}</td>

                {/* Editable Status */}
                <td>
                  <select
                    value={order.status}
                    onChange={(e) =>
                      handleInputChange(order.id, 'status', e.target.value)
                    }
                  >
                    <option value="pending">Pending</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>

                {/* Item List */}
                <td>
                  {order.item_list.map((item) => (
                    <div key={item.id}>
                      <span>{item.name}</span> - 
                      <span>{item.quantity} x  ₹{item.price}</span> = 
                      <span>Rs.{item.total}</span>
                    </div>
                  ))}
                </td>

                <td>{order.total_price}</td>
                <td>{order.total_calculated_price}</td>

                {/* Save Button */}
                <td className={styles.actions}>
                  <button onClick={() => handleSave(order.id)}>Save</button>
                  {/* Print Invoice Button */}
                  <button onClick={() => printInvoice(order)}>Print Invoice</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No orders available</p>
      )}
    </div>
  );
};

export default Orders;
