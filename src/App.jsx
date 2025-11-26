import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ProductList from "./pages/Products/ProductList";
import ProductForm from "./pages/Products/ProductForm";
import ProductView from "./pages/Products/ProductView";
import CategoryList from "./pages/Categories/CategoryList";
import CategoryForm from "./pages/Categories/CategoryForm";
import UserList from "./pages/Users/UserList";
import OrderList from "./pages/Orders/OrderList";
import OrderView from "./pages/Orders/OrderView";
import { PrivateRoute } from "./routes/PrivateRoute";
import Layout from "./components/Layout";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/Dashboard" element={<PrivateRoute><Layout><Dashboard/></Layout></PrivateRoute>} />
      <Route path="/products" element={<PrivateRoute><Layout><ProductList/></Layout></PrivateRoute>} />
      <Route path="/products/new" element={<PrivateRoute><Layout><ProductForm/></Layout></PrivateRoute>} />
      <Route path="/products/:id" element={<PrivateRoute><Layout><ProductView/></Layout></PrivateRoute>} />
      <Route path="/products/:id/edit" element={<PrivateRoute><Layout><ProductForm edit/></Layout></PrivateRoute>} />
      <Route path="/categories" element={<PrivateRoute><Layout><CategoryList/></Layout></PrivateRoute>} />
      <Route path="/categories/new" element={<PrivateRoute><Layout><CategoryForm/></Layout></PrivateRoute>} />
      <Route path="/categories/:id/edit" element={<PrivateRoute><Layout><CategoryForm edit/></Layout></PrivateRoute>} />
      <Route path="/users" element={<PrivateRoute><Layout><UserList/></Layout></PrivateRoute>} />
      <Route path="/orders" element={<PrivateRoute><Layout><OrderList/></Layout></PrivateRoute>} />
      <Route path="/orders/:id" element={<PrivateRoute><Layout><OrderView/></Layout></PrivateRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
