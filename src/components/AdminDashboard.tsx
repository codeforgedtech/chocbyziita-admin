import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { FaUsers, FaClipboardList, FaBoxOpen, FaPlusSquare } from 'react-icons/fa';
import RecentOrders from './RecentOrders';

const AdminDashboard: React.FC = () => {
  const location = useLocation();

  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      <nav className="sidebar bg-dark text-white p-3" style={{ width: '300px' }}>
        <h3 className="text-center">Panel</h3>
        <ul className="nav flex-column">
          <li className="nav-item">
            <Link className="nav-link text-white" to="/customers">
              <FaUsers className="me-2" /> Kunder
            </Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link text-white" to="/orders">
              <FaClipboardList className="me-2" /> Ordrar
            </Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link text-white" to="/products">
              <FaBoxOpen className="me-2" /> Produkter
            </Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link text-white" to="/add-product">
              <FaPlusSquare className="me-2" /> Lägg till Produkt
            </Link>
          </li>
        </ul>
      </nav>

      <div className="container mt-4 flex-grow-1">
        <h1 className="text-center">Kontrollpanel</h1>
        <div className="mt-4">
          {/* Rendera RecentOrders om användaren är på dashboarden */}
          {location.pathname === '/' ? <RecentOrders /> : <Outlet />}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
