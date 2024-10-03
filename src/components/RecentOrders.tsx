import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient'; // Import your Supabase client

interface Order {
  id: number;
  customerName: string;
  totalAmount: number;
  createdAt: string;
}

const RecentOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data, error } = await supabase
          .from('orders') // Byt ut 'orders' till den tabell du använder
          .select('*')
          .order('createdAt', { ascending: false })
          .limit(5);
        
        if (error) throw error;
        setOrders(data);
      } catch (error) {
        setError('Fel vid hämtning av ordrar.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) return <div>Laddar...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h2>Senaste Ordrar</h2>
      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Kundnamn</th>
            <th>Totalt Belopp</th>
            <th>Datum</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td>{order.id}</td>
              <td>{order.customerName}</td>
              <td>{order.totalAmount} SEK</td>
              <td>{new Date(order.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RecentOrders;