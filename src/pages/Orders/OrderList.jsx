// src/pages/Orders/OrderList.jsx
import React, { useEffect, useState, useCallback } from "react";
import { getOrders, updateOrderStatus } from "../../services/api";
import { Link } from "react-router-dom";

const ORDER_STATUSES = [
  { value: "PENDING", label: "Pending" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "SHIPPED", label: "Shipped" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "CANCELLED", label: "Cancelled" }
];

export default function OrderList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState({});

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const list = await getOrders();
      setOrders(list || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load orders. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleStatusChange = useCallback(async (orderId, newStatus) => {
    const order = orders.find(o => o.id === orderId);
    const currentStatus = order?.orderStatus || order?.status;
    
    if (newStatus === currentStatus) return;
    
    if (!confirm(`Change order #${orderId} status from "${currentStatus}" to "${newStatus}"?`)) {
      return;
    }

    setUpdatingStatus(prev => ({ ...prev, [orderId]: true }));
    try {
      await updateOrderStatus(orderId, newStatus);
      // Update local state
      setOrders(prev => prev.map(o => 
        o.id === orderId 
          ? { ...o, orderStatus: newStatus, status: newStatus }
          : o
      ));
    } catch (err) {
      console.error(err);
      alert("Failed to update order status: " + (err.response?.data?.message || "Unknown error"));
    } finally {
      setUpdatingStatus(prev => ({ ...prev, [orderId]: false }));
    }
  }, [orders]);

  if (loading) {
    return (
      <div>
        <h2>Orders</h2>
        <div className="loading-state">Loading orders...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h2>Orders</h2>
        <div className="error-state">
          <p>{error}</p>
          <button onClick={load}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2>Orders</h2>
      {orders.length === 0 ? (
        <div className="empty-state">
          <p>No orders found.</p>
        </div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>User</th>
              <th>Total Amount</th>
              <th>Status</th>
              <th>Order Date</th>
              <th>Payment</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(o => (
              <tr key={o.id}>
                <td>#{o.id}</td>
                <td>{o.user?.email || o.address?.fullName || "-"}</td>
                <td>₹{o.totalAmount || o.totalPrice || "0"}</td>
                <td>
                  <select
                    value={o.orderStatus || o.status || "PENDING"}
                    onChange={(e) => handleStatusChange(o.id, e.target.value)}
                    disabled={updatingStatus[o.id]}
                    className="status-select-inline"
                  >
                    {ORDER_STATUSES.map(status => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                  {updatingStatus[o.id] && <span className="updating-text-small">Updating...</span>}
                </td>
                <td>
                  {o.orderDate 
                    ? new Date(o.orderDate).toLocaleDateString('en-IN', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                    : "-"}
                </td>
                <td>{o.payment || "-"}</td>
                <td><Link to={`/orders/${o.id}`}>View Details</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
