import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Button, Modal, Table } from 'react-bootstrap';
import { FaEdit, FaTrash } from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';

interface User {
  id: string;
  customer_number: string;
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
  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState<User | null>(null);

  useEffect(() => {
    const fetchCustomers = async () => {
      const { data, error } = await supabase
        .from('users')
        .select('id, customer_number, first_name, last_name, email, phone_number, address, city, postal_code');

      if (error) {
        setError(error.message);
      } else {
        setCustomers(data as User[]);
      }
    };

    fetchCustomers();
  }, []);

  if (error) return <div className="alert alert-danger">{error}</div>;

  const handleDeleteCustomer = async (id: string) => {
    const { error } = await supabase.from('users').delete().eq('id', id);
    if (error) {
      setError(error.message);
    } else {
      setCustomers(customers.filter(customer => customer.id !== id));
    }
  };

  const handleEditCustomer = (customer: User) => {
    setFormData(customer);
    setShowEditModal(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (formData) {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSave = async () => {
    if (formData) {
      const { error } = await supabase
        .from('users')
        .update(formData)
        .eq('id', formData.id);

      if (error) {
        setError(error.message);
      } else {
        setCustomers(customers.map(customer => (customer.id === formData.id ? formData : customer)));
        setShowEditModal(false);
        setFormData(null);
      }
    }
  };

  return (
    <div className="container mt-4">
      <h2>Kunder</h2>
      
      <table className="table table-striped">
          <thead>
            <tr>
              <th>Kundnummer</th>
              <th>Kund</th>
              
              <th>E-post</th>
              <th>Telefon</th>
              <th>Adress</th>
              <th>Åtgärder</th>
            </tr>
          </thead>
          <tbody>
            {customers.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center">Inga kunder hittades.</td>
              </tr>
            ) : (
              customers.map(customer => (
                <tr key={customer.id}>
                  <td>{customer.customer_number}</td>
                  <td>{customer.first_name} {customer.last_name}</td>
                  
                  <td>{customer.email}</td>
                  <td>{customer.phone_number}</td>
                  <td>{`${customer.address}, ${customer.postal_code} ${customer.city}`}</td>
                  <td>
                    <div className="d-flex gap-2">
                      <button onClick={() => handleEditCustomer(customer)} className="btn btn-link text-primary">
                        <FaEdit /> 
                      </button>
                      <button  onClick={() => handleDeleteCustomer(customer.id)} className="btn btn-link text-danger">
                        <FaTrash /> 
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
 

      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Redigera Kund</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {formData && (
            <form>
              <div className="mb-3">
                <label htmlFor="customer_number" className="form-label">Kundnummer</label>
                <input
                  type="text"
                  className="form-control"
                  id="customer_number"
                  name="customer_number"
                  value={formData.customer_number}
                  onChange={handleChange}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="first_name" className="form-label">Förnamn</label>
                <input
                  type="text"
                  className="form-control"
                  id="first_name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="last_name" className="form-label">Efternamn</label>
                <input
                  type="text"
                  className="form-control"
                  id="last_name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="email" className="form-label">E-post</label>
                <input
                  type="email"
                  className="form-control"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="phone_number" className="form-label">Telefon</label>
                <input
                  type="text"
                  className="form-control"
                  id="phone_number"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleChange}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="address" className="form-label">Adress</label>
                <input
                  type="text"
                  className="form-control"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="postal_code" className="form-label">Postnummer</label>
                <input
                  type="text"
                  className="form-control"
                  id="postal_code"
                  name="postal_code"
                  value={formData.postal_code}
                  onChange={handleChange}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="city" className="form-label">Stad</label>
                <input
                  type="text"
                  className="form-control"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                />
              </div>
            </form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>Stäng</Button>
          <Button variant="primary" onClick={handleSave}>Spara ändringar</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Customers;





