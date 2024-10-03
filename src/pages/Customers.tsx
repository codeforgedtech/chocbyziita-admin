import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient'; // Justera sökvägen enligt din struktur

// Definiera gränssnittet för Kund
interface User {
  id: string; // UUID som sträng
  first_name: string;
  last_name: string;
  phone_number: string;
  address: string;
  postal_code: string;
  city: string;
  email: string;
}

const Customers: React.FC = () => {
  const [customers, setCustomers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCustomers = async () => {
      const { data, error } = await supabase
        .from('users')
        .select('id, first_name, last_name, email, phone_number, address, city, postal_code');

      if (error) {
        setError(error.message);
      } else {
        setCustomers(data as User[]); // Anta att data är av typen User[]
      }
    };

    fetchCustomers();
  }, []);

  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="container-fluid custom-container mt-5 p-4 border rounded bg-light shadow">
     <h2 className="text-center mb-4">Kunder</h2>
      {customers.length === 0 ? (
        <p>Inga kunder hittades.</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover table-bordered">
          <thead className="table-light">
            <tr>
            
              <th>Namn</th>
              <th>E-post</th>
              <th>Telefon</th>
              <th>Adress</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <tr key={customer.id}>
                
                <td>{`${customer.first_name} ${customer.last_name}`}</td>
                <td>{customer.email}</td>
                <td>{customer.phone_number}</td>
                <td>{`${customer.address}, ${customer.postal_code} ${customer.city}`}</td>
              </tr>
            ))}
          </tbody>
    
        </table>
        </div>
      )}
    </div>
    
  );
};

export default Customers;

