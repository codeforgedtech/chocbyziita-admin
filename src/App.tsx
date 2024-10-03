import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AdminDashboard from './components/AdminDashboard';
import Customers from './pages/Customers';
import Orders from './pages/Orders';
import Products from './pages/Products';
import AddProduct from './pages/AddProduct';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AdminDashboard />}>
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
