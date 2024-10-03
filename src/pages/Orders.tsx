import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient'; // Justera importen enligt din struktur
import 'bootstrap/dist/css/bootstrap.min.css'; // Se till att bootstrap är importerat

// Definiera User-gränssnittet
interface User {
  first_name: string; // Användarens förnamn
  last_name: string;  // Användarens efternamn
  email: string;      // Användarens e-post
}

// Definiera Order-gränssnittet som inkluderar en User
interface Order {
  id: number;
  user_id: string; // UUID som string
  total_price: number;
  status: string;
  created_at: string; // ISO-format
  products: {        // Definiera struktur för produkter
    id: number;
    tax: number;
    name: string;
    price: number;
    quantity: number;
  }[]; // Array av produktobjekt
  shipping_address: string;
  shipping_method: string;
  user_email: string;
  shipping_cost: number;
  user?: User;  // Gör user valfri här
}

const OrdersList: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          user_id,
          total_price,
          status,
          created_at,
          products,
          shipping_address,
          shipping_method,
          user_email,
          shipping_cost,
          users (first_name, last_name, email) // Hämta användardetaljer från users-tabellen
        `);

      if (error) {
        setError(error.message);
      } else {
        // Kontrollera om data är definierad och är en array
        if (data && Array.isArray(data)) {
          // Mappa data för att inkludera användardetaljer
          const ordersWithUsers = data.map((order) => ({
            ...order,
            user: {
              first_name: order.users?.first_name,
              last_name: order.users?.last_name,
              email: order.users?.email,
            },
          }));

          setOrders(ordersWithUsers); // Sätt ordrarna med användare
        }
      }
    };

    fetchOrders();
  }, []);

  if (error) return <div className="alert alert-danger">{error}</div>;

  // Funktion för att rendera produkter
  const renderProducts = (products: { id: number; tax: number; name: string; price: number; quantity: number; }[]) => {
    return (
      <ul className="list-unstyled">
        {products.map((product) => (
          <li key={product.id} className="mb-1">
            <strong>{product.name}</strong>: {product.quantity} st
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="container-fluid custom-container mt-5 p-4 border rounded bg-light shadow">
      <h2 className="text-center mb-4">Ordrar</h2>
      {orders.length === 0 ? (
        <div className="alert alert-warning text-center">Inga ordrar hittades.</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover table-bordered">
            <thead className="table-light">
              <tr>
                <th>ID</th>
           
                <th>Användare</th>
                <th>Total Pris</th>
                <th>Status</th>
                <th>Skapat Datum</th>
                <th>Produkter</th>
                <th>Leveransadress</th>
                <th>Fraktmetod</th>
                <th>E-post</th>
                <th>Fraktkostnad</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>{order.id}</td>
                 
                  <td>{order.user ? `${order.user.first_name} ${order.user.last_name}` : 'N/A'}</td>
                  <td>{order.total_price.toFixed(2)} SEK</td>
                  <td>{order.status}</td>
                  <td>{new Date(order.created_at).toLocaleString()}</td>
                  <td>{renderProducts(order.products)}</td> 
                  <td>{order.shipping_address}</td>
                  <td>{order.shipping_method}</td>
                   <td>{order.user ? `${order.user.email}` : 'N/A'}</td>
                  <td>{order.shipping_cost.toFixed(2)} SEK</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default OrdersList;







