'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import styles from '../Orders.module.css';
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
  item_list: { 
    id: number; 
    name: string; 
    price: number; 
    total: number; 
    quantity: number;
    created_at: string; // added created_at for each item
  }[];
  total_price: number;
  total_calculated_price: number;
}

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

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

  // Handle date filter change
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

  // Function to export filtered orders to Excel
  const exportToExcel = () => {
    // Only filtered orders are mapped to the Excel data
    const data = filteredOrders.map((order) => ({
      ID: order.id,
      'Order ID': order.order_id,
      Quantity: order.quantity,
      'Name': order.name,
      'Buyer Address': order.buyer_address,
      'Buyer Phone': order.buyer_phone,
      'Created At': new Date(order.created_at).toLocaleString(),
      Status: order.status,
      'Item List': order.item_list.map(item => `${item.name} (${item.quantity} x ₹${item.price})`).join(', '),
      'Item Created Dates': order.item_list.map(item => new Date(item.created_at).toLocaleString()).join(', '),  // Added item created dates
      'Total Price': order.total_price,
      'Total Calculated Price': order.total_calculated_price,
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Orders');
    XLSX.writeFile(wb, 'orders.xlsx');
  };

  // Function to print the invoice (as before)
  const printInvoice = (order: Order) => {
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    
    if (!printWindow) return;

    const itemListHtml = order.item_list.map(item => {
      return `<tr>
                <td>${item.name} (qty-${item.quantity})</td>
                <td>₹${item.price}</td>
                <td>₹${item.total}</td>
                <td>${new Date(item.created_at).toLocaleString()}</td>  <!-- Item Created Date -->
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
          <p><strong>Buyer Address:</strong> ${order.buyer_address}</p>
          <p><strong>Buyer Phone:</strong> ${order.buyer_phone}</p>
          <p><strong>Created At:</strong> ${new Date(order.created_at).toLocaleString()}</p>
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Price</th>
                <th>Total</th>
                <th>Item Created Date</th> <!-- Added item created date column -->
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

  // Function to export filtered items to Excel
  const downloadItemsAsExcel = () => {
    // Only filtered orders are mapped to the Excel data for the items
    const itemDetails = filteredOrders.flatMap(order =>
      order.item_list.map(item => ({
        'Product Name': item.name,
        'Quantity': item.quantity,
        'Price (₹)': item.price,
        'Total (₹)': item.total,
        'Item Created Date': new Date(item.created_at).toLocaleString(),  // Added item created date
      }))
    );

    const ws = XLSX.utils.json_to_sheet(itemDetails);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Items');
    XLSX.writeFile(wb, 'items.xlsx');
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
      
      {/* Button to download items as Excel */}
      <button onClick={downloadItemsAsExcel}>Download Items as Excel</button>

      {filteredOrders.length > 0 ? (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Order ID</th>
              <th>Quantity</th>
              <th>Name</th>
              <th>Buyer Address</th>
              <th>Buyer Phone</th>
              <th>Created At</th>
              <th>Status</th>
              <th>Item List</th>
              <th>Item Created Date</th> {/* New column */}
              <th>Total Price</th>
              <th>Total Calculated Price</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>{order.order_id}</td>
                <td>{order.quantity}</td>
                <td>{order.name}</td>
                <td>{order.buyer_address}</td>
                <td>{order.buyer_phone}</td>
                <td>{new Date(order.created_at).toLocaleString()}</td>
                <td>{order.status}</td>
                <td>{order.item_list.map(item => `${item.name} (${item.quantity} x ₹${item.price})`).join(', ')}</td>
                <td>
                  {order.item_list.map(item => (
                    <div key={item.id}>
                      {new Date(item.created_at).toLocaleString()} {/* Item's created date */}
                    </div>
                  ))}
                </td>
                <td>{order.total_price}</td>
                <td>{order.total_calculated_price}</td>
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
