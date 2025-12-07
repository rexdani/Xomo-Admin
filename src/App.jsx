import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import { PrivateRoute } from "./routes/PrivateRoute";
import Layout from "./components/Layout";

// Lazy load components for better performance
const Dashboard = lazy(() => import("./pages/Dashboard"));
const ProductList = lazy(() => import("./pages/Products/ProductList"));
const ProductForm = lazy(() => import("./pages/Products/ProductForm"));
const ProductView = lazy(() => import("./pages/Products/ProductView"));
const CategoryList = lazy(() => import("./pages/Categories/CategoryList"));
const CategoryForm = lazy(() => import("./pages/Categories/CategoryForm"));
const UserList = lazy(() => import("./pages/Users/UserList"));
const UserView = lazy(() => import("./pages/Users/UserView"));
const OrderList = lazy(() => import("./pages/Orders/OrderList"));
const OrderView = lazy(() => import("./pages/Orders/OrderView"));
const HomeAdList = lazy(() => import("./pages/HomeAds/HomeAdList"));
const HomeAdForm = lazy(() => import("./pages/HomeAds/HomeAdForm"));

const LoadingFallback = () => (
  <div className="loading-state">Loading...</div>
);

const LazyWrapper = ({ children }) => (
  <Suspense fallback={<LoadingFallback />}>
    {children}
  </Suspense>
);

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route 
        path="/Dashboard" 
        element={
          <PrivateRoute>
            <Layout>
              <LazyWrapper><Dashboard /></LazyWrapper>
            </Layout>
          </PrivateRoute>
        } 
      />
      <Route 
        path="/products" 
        element={
          <PrivateRoute>
            <Layout>
              <LazyWrapper><ProductList /></LazyWrapper>
            </Layout>
          </PrivateRoute>
        } 
      />
      <Route 
        path="/products/new" 
        element={
          <PrivateRoute>
            <Layout>
              <LazyWrapper><ProductForm /></LazyWrapper>
            </Layout>
          </PrivateRoute>
        } 
      />
      <Route 
        path="/products/:id" 
        element={
          <PrivateRoute>
            <Layout>
              <LazyWrapper><ProductView /></LazyWrapper>
            </Layout>
          </PrivateRoute>
        } 
      />
      <Route 
        path="/products/:id/edit" 
        element={
          <PrivateRoute>
            <Layout>
              <LazyWrapper><ProductForm edit /></LazyWrapper>
            </Layout>
          </PrivateRoute>
        } 
      />
      <Route 
        path="/categories" 
        element={
          <PrivateRoute>
            <Layout>
              <LazyWrapper><CategoryList /></LazyWrapper>
            </Layout>
          </PrivateRoute>
        } 
      />
      <Route 
        path="/categories/new" 
        element={
          <PrivateRoute>
            <Layout>
              <LazyWrapper><CategoryForm /></LazyWrapper>
            </Layout>
          </PrivateRoute>
        } 
      />
      <Route 
        path="/categories/:id/edit" 
        element={
          <PrivateRoute>
            <Layout>
              <LazyWrapper><CategoryForm edit /></LazyWrapper>
            </Layout>
          </PrivateRoute>
        } 
      />
      <Route 
        path="/users" 
        element={
          <PrivateRoute>
            <Layout>
              <LazyWrapper><UserList /></LazyWrapper>
            </Layout>
          </PrivateRoute>
        } 
      />
      <Route 
        path="/users/:id" 
        element={
          <PrivateRoute>
            <Layout>
              <LazyWrapper><UserView /></LazyWrapper>
            </Layout>
          </PrivateRoute>
        } 
      />
      <Route 
        path="/orders" 
        element={
          <PrivateRoute>
            <Layout>
              <LazyWrapper><OrderList /></LazyWrapper>
            </Layout>
          </PrivateRoute>
        } 
      />
      <Route 
        path="/orders/:id" 
        element={
          <PrivateRoute>
            <Layout>
              <LazyWrapper><OrderView /></LazyWrapper>
            </Layout>
          </PrivateRoute>
        } 
      />
      <Route 
        path="/home-ads" 
        element={
          <PrivateRoute>
            <Layout>
              <LazyWrapper><HomeAdList /></LazyWrapper>
            </Layout>
          </PrivateRoute>
        } 
      />
      <Route 
        path="/home-ads/new" 
        element={
          <PrivateRoute>
            <Layout>
              <LazyWrapper><HomeAdForm /></LazyWrapper>
            </Layout>
          </PrivateRoute>
        } 
      />
      <Route 
        path="/home-ads/:id/edit" 
        element={
          <PrivateRoute>
            <Layout>
              <LazyWrapper><HomeAdForm edit /></LazyWrapper>
            </Layout>
          </PrivateRoute>
        } 
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
