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

  const handlePrint = () => {
    // Create print content HTML
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Order Label - #${order.id}</title>
          <style>
            @page {
              margin: 15mm;
              size: A4;
            }
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: 'Arial', sans-serif;
              padding: 20mm;
              background: white;
              color: #000;
            }
            .label-header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              border-bottom: 3px solid #000;
              padding-bottom: 15px;
              margin-bottom: 20px;
            }
            .label-company-info h2 {
              margin: 0 0 5px 0;
              font-size: 32px;
              font-weight: 700;
              color: #000;
              letter-spacing: 2px;
            }
            .label-company-info p {
              margin: 0;
              font-size: 14px;
              color: #666;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            .label-order-info {
              text-align: right;
            }
            .label-field {
              display: block;
              margin-bottom: 8px;
              font-size: 14px;
            }
            .label-field-name {
              font-weight: 600;
              margin-right: 8px;
              color: #333;
            }
            .label-field-value {
              color: #000;
              font-weight: 500;
            }
            .label-body {
              margin-top: 20px;
            }
            .label-section {
              margin-bottom: 25px;
              page-break-inside: avoid;
            }
            .label-section h3 {
              margin: 0 0 12px 0;
              font-size: 16px;
              font-weight: 700;
              color: #000;
              text-transform: uppercase;
              letter-spacing: 1px;
              border-bottom: 2px solid #333;
              padding-bottom: 5px;
            }
            .label-address {
              line-height: 1.8;
              font-size: 14px;
            }
            .label-address-name {
              font-weight: 700;
              font-size: 16px;
              display: block;
              margin-bottom: 8px;
              color: #000;
            }
            .label-address p {
              margin: 4px 0;
              color: #333;
            }
            .label-items-table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 10px;
              font-size: 13px;
            }
            .label-items-table th {
              background: #f5f5f5;
              padding: 10px 8px;
              text-align: left;
              font-weight: 700;
              border-bottom: 2px solid #333;
              color: #000;
              text-transform: uppercase;
              font-size: 12px;
              letter-spacing: 0.5px;
            }
            .label-items-table td {
              padding: 8px;
              border-bottom: 1px solid #ddd;
              color: #333;
            }
            .label-items-table tfoot {
              border-top: 2px solid #333;
            }
            .label-items-table tfoot td {
              padding-top: 12px;
              font-weight: 700;
              font-size: 14px;
              color: #000;
            }
            .label-footer {
              margin-top: 30px;
              padding-top: 15px;
              border-top: 2px solid #333;
              display: flex;
              justify-content: space-between;
              font-size: 14px;
            }
            .label-payment, .label-delivery {
              color: #333;
            }
            .label-payment strong, .label-delivery strong {
              color: #000;
              margin-right: 8px;
            }
          </style>
        </head>
        <body>
          <div class="label-header">
            <div class="label-company-info">
              <h2>XOMO</h2>
              <p>Order Label</p>
            </div>
            <div class="label-order-info">
              <div class="label-field">
                <span class="label-field-name">Order ID:</span>
                <span class="label-field-value">#${order.id}</span>
              </div>
              <div class="label-field">
                <span class="label-field-name">Date:</span>
                <span class="label-field-value">${formatDate(order.orderDate)}</span>
              </div>
              
            </div>
          </div>
          <div class="label-body">
            <div class="label-section">
              <h3>SHIP TO:</h3>
              <div class="label-address">
                <p class="label-address-name">${order.address?.fullName || order.user?.name || "-"}</p>
                ${order.address?.street ? `<p>${order.address.street}</p>` : ""}
                ${order.address?.city ? `<p>${order.address.city}</p>` : ""}
                ${order.address?.state ? `<p>${order.address.state}</p>` : ""}
                ${order.address?.country ? `<p>${order.address.country}</p>` : ""}
                ${order.address?.postalCode ? `<p><strong>Postal Code:</strong> ${order.address.postalCode}</p>` : ""}
                ${order.user?.email ? `<p><strong>Email:</strong> ${order.user.email}</p>` : ""}
              </div>
            </div>
            <div class="label-section">
              <h3>ORDER ITEMS:</h3>
              <div class="label-items">
                ${order.items && order.items.length > 0 ? `
                  <table class="label-items-table">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Qty</th>
                        <th>Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${order.items.map(it => `
                        <tr>
                          <td>${it.product?.name || "-"}</td>
                          <td>${it.quantity || 0}</td>
                          <td>₹${it.price || "0"}</td>
                        </tr>
                      `).join("")}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colspan="2"><strong>TOTAL:</strong></td>
                        <td><strong>₹${totalAmount}</strong></td>
                      </tr>
                    </tfoot>
                  </table>
                ` : "<p>No items</p>"}
              </div>
            </div>
            <div class="label-footer">
              <div class="label-payment">
                <strong>Payment Method:</strong> ${order.payment || "Not specified"}
              </div>
              ${order.deliveryDate ? `
                <div class="label-delivery">
                  <strong>Expected Delivery:</strong> ${formatDate(order.deliveryDate)}
                </div>
              ` : ""}
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `;

    // Open print window
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      // Print after content loads
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
        }, 250);
      };
    }
  };

  return (
    <>
      {/* Print Label View - Outside main container */}
      <div className="order-label-print">
        <div className="label-header">
          <div className="label-company-info">
            <h2>XOMO</h2>
            <p>Order Label</p>
          </div>
          <div className="label-order-info">
            <div className="label-field">
              <span className="label-field-name">Order ID:</span>
              <span className="label-field-value">#{order.id}</span>
            </div>
            <div className="label-field">
              <span className="label-field-name">Date:</span>
              <span className="label-field-value">{formatDate(order.orderDate)}</span>
            </div>
            <div className="label-field">
              <span className="label-field-name">Status:</span>
              <span className="label-field-value">{orderStatus}</span>
            </div>
          </div>
        </div>

        <div className="label-body">
          <div className="label-section">
            <h3>SHIP TO:</h3>
            <div className="label-address">
              <p className="label-address-name">{order.address?.fullName || order.user?.name || "-"}</p>
              {order.address?.street && <p>{order.address.street}</p>}
              {order.address?.city && <p>{order.address.city}</p>}
              {order.address?.state && <p>{order.address.state}</p>}
              {order.address?.country && <p>{order.address.country}</p>}
              {order.address?.postalCode && <p><strong>Postal Code:</strong> {order.address.postalCode}</p>}
              {order.user?.email && <p><strong>Email:</strong> {order.user.email}</p>}
            </div>
          </div>

          <div className="label-section">
            <h3>ORDER ITEMS:</h3>
            <div className="label-items">
              {order.items && order.items.length > 0 ? (
                <table className="label-items-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Qty</th>
                      <th>Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((it, idx) => {
                      const subtotal = (it.quantity || 0) * (it.price || 0);
                      return (
                        <tr key={it.id || idx}>
                          <td>{it.product?.name || "-"}</td>
                          <td>{it.quantity || 0}</td>
                          <td>₹{it.price || "0"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan="2"><strong>TOTAL:</strong></td>
                      <td><strong>₹{totalAmount}</strong></td>
                    </tr>
                  </tfoot>
                </table>
              ) : (
                <p>No items</p>
              )}
            </div>
          </div>

          <div className="label-footer">
            <div className="label-payment">
              <strong>Payment Method:</strong> {order.payment || "Not specified"}
            </div>
            {order.deliveryDate && (
              <div className="label-delivery">
                <strong>Expected Delivery:</strong> {formatDate(order.deliveryDate)}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="order-view">
      <div className="order-view-header">
        <h2>Order #{order.id}</h2>
        <div className="order-actions">
          <button onClick={handlePrint} className="btn-primary" style={{ marginRight: '8px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 2V5H12V2H4ZM2 6V13C2 13.5523 2.44772 14 3 14H13C13.5523 14 14 13.5523 14 13V6H16V4H0V6H2ZM3 8H5V10H3V8ZM11 9C11.5523 9 12 9.44772 12 10C12 10.5523 11.5523 11 11 11C10.4477 11 10 10.5523 10 10C10 9.44772 10.4477 9 11 9Z" fill="currentColor"/>
            </svg>
            Print Label
          </button>
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
            <label>User Name:</label>
            <span>{order.user?.name || order.address?.fullName || "-"}</span>
          </div>
        
          <div className="info-item">
            <label>Phone Number:</label>
            <span>{order.address?.phoneNumber || "-"}</span>
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
    </>
  );
}
