// src/pages/Orders/OrderView.jsx
import React, { useEffect, useState } from "react";
import { getOrderById } from "../../services/api";
import { useParams } from "react-router-dom";

export default function OrderView() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    if (!id) return;
    getOrderById(id).then(res => setOrder(res)).catch(err => {
      console.error(err);
      alert("Failed to load order");
    });
  }, [id]);

  if (!order) return <div>Loading...</div>;

  return (
    <div>
      <h2>Order #{order.id}</h2>
      <p>User: {order.user?.email}</p>
      <p>Total: {order.totalPrice}</p>
      <p>Status: {order.status}</p>
      <h3>Items</h3>
      <ul>
        {order.items?.map(it => (
          <li key={it.id}>{it.product?.name} — {it.quantity} × {it.price}</li>
        ))}
      </ul>
    </div>
  );
}
