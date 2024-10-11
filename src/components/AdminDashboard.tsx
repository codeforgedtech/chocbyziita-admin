import React, { useEffect, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { FaUsers, FaClipboardList, FaBoxOpen, FaPlusSquare, FaSignOutAlt } from 'react-icons/fa';
import RecentOrders from '../Widgets/RecentOrders';
// Importera försäljningsgrafen
import { supabase } from '../supabaseClient';
import { toast } from 'react-toastify';
import "./AdminDashboard.css"

const AdminDashboard: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [newOrders, setNewOrders] = useState<number>(0);
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    const fetchOrders = async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) {
        console.error('Error fetching orders:', error.message);
      } else {
        setOrders(data);
        const newOrderCount = data.filter((order: { status: string }) => order.status === 'pending').length;
        setNewOrders(newOrderCount);
      }
    };

    fetchOrders();
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error logging out:', error.message);
    } else {
      toast.success('Du har loggat ut!');
      navigate('/login');
    }
  };

  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      <nav className="sidebar bg-dark text-white p-3" style={{ width: '350px' }}>
        <Link className="nav-link text-white" to="/">
          <h3 className="text-center">Panel</h3>
        </Link>
        <ul className="nav flex-column">
          <li className="nav-item">
            <Link className="nav-link text-white" to="/customers">
              <FaUsers className="me-2" /> Kunder
            </Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link text-white" to="/orders">
              <FaClipboardList className="me-2" /> Ordrar
              {newOrders > 0 && (
                <span className="order">{newOrders}</span>
              )}
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
          <li className="nav-item">
            <button className="nav-link text-white btn btn-link" onClick={handleLogout}>
              <FaSignOutAlt className="me-2" /> Logga ut
            </button>
          </li>
        </ul>
      </nav>

      <div className="container mt-4 flex-grow-1">
        <h1 className="text-center">Kontrollpanel</h1>
        <div className="mt-4">
          {location.pathname === '/' ? (
            <>
              <RecentOrders />
               {/* Lägg till försäljningsgrafen */}
            </>
          ) : (
            <Outlet />
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;



