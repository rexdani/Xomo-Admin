// src/pages/Orders/OrderView.jsx
import React, { useEffect, useState, useCallback } from "react";
import { getOrderById, updateOrderStatus } from "../../services/api";
import { useParams, Link } from "react-router-dom";

const ORDER_STATUSES = [
  { value: "PENDING", label: "Pending" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "SHIPPED", label: "Shipped" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "CANCELLED", label: "Cancelled" }
];

export default function OrderView() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [error, setError] = useState(null);

  const loadOrder = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const res = await getOrderById(id);
      setOrder(res);
    } catch (err) {
      console.error(err);
      setError("Failed to load order. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    let cancelled = false;
    loadOrder();
    return () => { cancelled = true; };
  }, [loadOrder]);

  if (loading) {
    return <div className="loading-state">Loading order...</div>;
  }

  if (error || !order) {
    return (
      <div>
        <div className="error-state">
          <p>{error || "Order not found"}</p>
          <button onClick={loadOrder}>Retry</button>
          <Link to="/orders"><button>Back to Orders</button></Link>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateString;
    }
  };

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    const currentStatus = order.orderStatus || order.status;
    
    if (newStatus === currentStatus) return;
    
    if (!confirm(`Change order status from "${currentStatus}" to "${newStatus}"?`)) {
      e.target.value = currentStatus; // Reset dropdown
      return;
    }

    setUpdatingStatus(true);
    try {
      await updateOrderStatus(id, newStatus);
      // Update local state
      setOrder(prev => ({
        ...prev,
        orderStatus: newStatus,
        status: newStatus
      }));
    } catch (err) {
      console.error(err);
      alert("Failed to update order status: " + (err.response?.data?.message || "Unknown error"));
      e.target.value = currentStatus; // Reset dropdown on error
    } finally {
      setUpdatingStatus(false);
    }
  };

  const orderStatus = order.orderStatus || order.status || "PENDING";
  const totalAmount = order.totalAmount || order.totalPrice || 0;

  return (
    <div className="order-view">
      <div className="order-view-header">
        <h2>Order #{order.id}</h2>
        <div className="order-actions">
          <Link to="/orders"><button>Back to Orders</button></Link>
        </div>
      </div>

      <div className="order-details-grid">
        <div className="order-info-section">
          <h3>Order Information</h3>
          <div className="info-item">
            <label>Order ID:</label>
            <span>#{order.id}</span>
          </div>
          <div className="info-item">
            <label>Order Status:</label>
            <div className="status-update-container">
              <select
                value={orderStatus}
                onChange={handleStatusChange}
                disabled={updatingStatus}
                className="status-select"
              >
                {ORDER_STATUSES.map(status => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
              {updatingStatus && <span className="updating-text">Updating...</span>}
            </div>
          </div>
          <div className="info-item">
            <label>Order Date:</label>
            <span>{formatDate(order.orderDate)}</span>
          </div>
          <div className="info-item">
            <label>Delivery Date:</label>
            <span>{formatDate(order.deliveryDate)}</span>
          </div>
          <div className="info-item">
            <label>Payment Method:</label>
            <span>{order.payment || "Not specified"}</span>
          </div>
          <div className="info-item">
            <label>Total Amount:</label>
            <span className="price-value">₹{totalAmount}</span>
          </div>
        </div>

        <div className="order-info-section">
          <h3>Customer Information</h3>
          <div className="info-item">
            <label>User Email:</label>
            <span>{order.user?.email || "-"}</span>
          </div>
          <div className="info-item">
            <label>User Name:</label>
            <span>{order.user?.name || order.address?.fullName || "-"}</span>
          </div>
          {order.address && (
            <>
              <h4 style={{marginTop: '16px', marginBottom: '8px', color: 'var(--primary)'}}>Shipping Address</h4>
              <div className="address-info">
                {order.address.street && <p>{order.address.street}</p>}
                {order.address.city && <p>{order.address.city}</p>}
                {order.address.state && <p>{order.address.state}</p>}
                {order.address.country && <p>{order.address.country}</p>}
                {order.address.postalCode && <p>Postal Code: {order.address.postalCode}</p>}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="order-items-section">
        <h3>Order Items</h3>
        {order.items && order.items.length > 0 ? (
          <table className="table">
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map(it => {
                const subtotal = (it.quantity || 0) * (it.price || 0);
                return (
                  <tr key={it.id}>
                    <td>{it.product?.name || "-"}</td>
                    <td>{it.quantity || 0}</td>
                    <td>₹{it.price || "0"}</td>
                    <td>₹{subtotal}</td>
                  </tr>
                );
              })}
              <tr className="order-total-row">
                <td colSpan="3"><strong>Total Amount:</strong></td>
                <td><strong className="price-value">₹{totalAmount}</strong></td>
              </tr>
            </tbody>
          </table>
        ) : (
          <div className="empty-state">
            <p>No items in this order.</p>
          </div>
        )}
      </div>
    </div>
  );
}
