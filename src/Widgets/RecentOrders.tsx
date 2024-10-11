import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient'; // Adjust the import according to your file structure

// Definiera gränssnittet för Order
interface Order {
  id: string;                // Order ID
  created_at: string;        // Skapad datum och tid
  first_name: string;        // Kundens förnamn
  last_name: string;         // Kundens efternamn
  status: string;            // Status för ordern
  total_price: number | null; // Totalt belopp för ordern kan vara null
}

const RecentOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          created_at,
          status,
          total_price,
          users (
            first_name,
            last_name
          )
        `);

      if (error) {
        setError(error.message);
      } else {
        const ordersWithUser = data.map((order: any) => ({
          ...order,
          first_name: order.users.first_name,
          last_name: order.users.last_name,
        }));
        setOrders(ordersWithUser);
      }
    };

    fetchOrders();
  }, []);

  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="container mt-4">
      <h2>Senaste Ordrar</h2>
      {orders.length === 0 ? (
        <div className="alert alert-warning">Inga senaste ordrar att visa.</div>
      ) : (
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Skapad</th>
              <th>Kund</th>
              <th>Status</th>
              <th>Totalt Belopp</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>{new Date(order.created_at).toLocaleString()}</td>
                <td>{`${order.first_name} ${order.last_name}` || 'Ej angivet'}</td>
                <td>{order.status}</td>
                <td>
                  {order.total_price != null ? order.total_price.toFixed(2) + ' SEK' : 'Ej angivet'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default RecentOrders;




