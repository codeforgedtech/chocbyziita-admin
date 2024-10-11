
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AdminDashboard from './components/AdminDashboard';
import Customers from './pages/Customers';
import Orders from './pages/Orders';
import Products from './pages/Products';
import AddProduct from './pages/AddProduct';
import Login from './components/Login';
// Importera din ProtectRouter
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-toastify/dist/ReactToastify.css';
import ProtectedRoute from './components/ProtectedRouter';
import RecentOrders from './Widgets/RecentOrders';
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Skydda rutter med ProtectRouter */}
        <Route path="/" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>}>
        <Route index element={<RecentOrders />} />
            <Route path="customers" element={<Customers />} />
            <Route path="orders" element={<Orders />} />
            <Route path="products" element={<Products />} />
            <Route path="add-product" element={<AddProduct />} />
          </Route>
        
      </Routes>
    </Router>
  );
}

export default App;



