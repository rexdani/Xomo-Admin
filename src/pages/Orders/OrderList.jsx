// src/pages/Orders/OrderList.jsx
import React, { useEffect, useState } from "react";
import { getOrders } from "../../services/api";
import { Link } from "react-router-dom";

export default function OrderList() {
  const [orders, setOrders] = useState([]);

  async function load() {
    try {
      const list = await getOrders();
      setOrders(list || []);
    } catch (err) {
      console.error(err);
      alert("Failed to load orders");
    }
  }

  useEffect(() => { load(); }, []);

  return (
    <div>
      <h2>Orders</h2>
      <table className="table">
        <thead><tr><th>ID</th><th>User</th><th>Total</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>
          {orders.map(o => (
            <tr key={o.id}>
              <td>{o.id}</td>
              <td>{o.user?.email || o.user?.name || "-"}</td>
              <td>{o.totalPrice || "-"}</td>
              <td>{o.status || "PENDING"}</td>
              <td><Link to={`/orders/${o.id}`}>View</Link></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
