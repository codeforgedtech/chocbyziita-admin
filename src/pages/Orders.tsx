import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { Button, Modal } from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify';
import { FaEdit, FaTrash, FaPrint } from 'react-icons/fa';
import jsPDF from 'jspdf';

import 'jspdf-autotable';
import 'react-toastify/dist/ReactToastify.css';
import { FaMagnifyingGlass } from 'react-icons/fa6';

interface User {
  first_name: string;
  last_name: string;
  email: string;
  customer_number: string;
}

interface Product {
  id: number;
  name: string;
  price: number;
  tax: number;
  quantity: number;
}

interface Order {
  invoice_number: string;
  id: number;
  user_id: string;
  total_price: number;
  status: string;
  created_at: string;
  products: Product[];
  shipping_address: string;
  shipping_method: string;
  user_email: string;

  shipping_cost: number;
  user?: User;
}

const OrdersList: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const printRef = useRef<HTMLDivElement>(null); // Reference for printing

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
        shipping_cost,
        invoice_number,
        users!orders_user_id_fkey (first_name, last_name, email, customer_number)
      `);
  
    if (error) {
      setError(error.message);
      toast.error("Kunde inte hämta ordrar: " + error.message);
    } else {
      const ordersWithUsers = data.map((order: any) => ({
        ...order,
        user: order.users ? {
          first_name: order.users.first_name,
          last_name: order.users.last_name,
          email: order.users.email,
          customer_number: order.users.customer_number,
        } : null,
      }));
      setOrders(ordersWithUsers);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleEditOrder = async () => {
    if (selectedOrder) {
      const updates: Partial<Order> = {
        id: selectedOrder.id,
        total_price: selectedOrder.total_price,
        status: selectedOrder.status,
        shipping_address: selectedOrder.shipping_address,
      };

      const { error: updateError } = await supabase
        .from('orders')
        .update(updates)
        .eq('id', selectedOrder.id);

      if (updateError) {
        setError(updateError.message);
        toast.error("Kunde inte uppdatera ordern: " + updateError.message);
      } else {
        setShowEditModal(false);
        setSelectedOrder(null);
        fetchOrders();
        toast.success("Ordern uppdaterades framgångsrikt!");
      }
    }
  };

  const handleDeleteOrder = async (id: number) => {
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', id);

    if (error) {
      setError(error.message);
      toast.error("Kunde inte ta bort ordern: " + error.message);
    } else {
      fetchOrders();
      toast.success("Ordern togs bort framgångsrikt!");
    }
  };

  const generateInvoiceData = () => {
    if (!selectedOrder) return null;
  
    const { products, user, total_price, shipping_address, invoice_number } = selectedOrder;
  
    return {
      title: 'Faktura',
      invoiceNumber: invoice_number, // Add invoice number to the data
      customerName: `${user?.first_name} ${user?.last_name}`,
      email: user?.email,
      shippingAddress: shipping_address,
      items: products.map(product => ({
        name: product.name,
        price: product.price.toFixed(2),
        tax: product.tax,
        quantity: product.quantity,
        total: (product.price * product.quantity).toFixed(2),
      })),
      totalPrice: total_price.toFixed(2),
    };
  };

  const handlePreviewInvoice = () => {
    setShowPreviewModal(true);
  };

  const handleDownloadInvoice = () => {
    const invoiceData = generateInvoiceData();
    if (!invoiceData) return;
  
    const doc = new jsPDF();
    const { title, customerName, email, shippingAddress, items, totalPrice, invoiceNumber } = invoiceData;
  
    // Add title and invoice number
    doc.setFontSize(22);
    doc.text(`${title} - ${invoiceNumber}`, 20, 20); // Include invoice number in the title
    
    // Customer details
    doc.setFontSize(12);
    doc.text(`Namn: ${customerName}`, 20, 40);
    doc.text(`Epost: ${email}`, 20, 50);
    doc.text(`Leveransadress: ${shippingAddress}`, 20, 60);
    
    // Product table
    doc.autoTable({
      startY: 70,
      head: [['Produkt', 'Pris (SEK)', 'Moms (%)', 'Kvantitet', 'Totalt (SEK)']],
      body: items.map(item => [
        item.name,
        item.price,
        item.tax,
        item.quantity,
        item.total,
      ]),
    });
  
    // Total price
    doc.text(`Totalt: ${totalPrice} SEK`, 20, doc.autoTable.previous.finalY + 10);
    
    // Save the PDF
    doc.save(`faktura_${selectedOrder.id}.pdf`);
    setShowPreviewModal(false);
  };

  if (error) return <div className="alert alert-danger">{error}</div>;

  const invoiceData = generateInvoiceData();

  return (
    <div className="container mt-4">
      <h2>Orderlista</h2>
      
      <table className="table table-striped">
        <thead>
          <tr>
            <th scope="col">Order ID</th>
            <th scope="col">Kundummer</th>
            <th scope="col">Faktura Nummer</th>
            <th scope="col">Pris (SEK)</th>
            <th scope="col">Status</th>
            <th scope="col">Kund</th>
            <th scope="col">Skapat</th>
            <th scope="col">Åtgärd</th>
          </tr>
        </thead>
        <tbody>
          {orders.length === 0 ? (
            <tr>
              <td colSpan={6} className="text-center">Inga ordrar hittades.</td>
            </tr>
          ) : (
            orders.map((order) => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>{order.user ? `${order.user.customer_number}` : 'Ej tillgängligt'}</td>
                <td>{order.invoice_number || 'Ej tillgängligt'}</td> {/* Display invoice number */}
                <td>{order.total_price.toFixed(2)}</td>
                <td>{order.status}</td>
                <td>{order.user ? `${order.user.first_name} ${order.user.last_name}` : 'Ej tillgängligt'}</td>
                <td>{new Date(order.created_at).toLocaleString()}</td>
                <td>
                  <div className="d-flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedOrder(order);
                        setShowEditModal(true);
                      }}
                      className="btn btn-link text-primary"
                    >
                      <FaEdit />
                    </button>
                    <button onClick={() => handleDeleteOrder(order.id)} className="btn btn-link text-danger">
                      <FaTrash />
                    </button>
                    <button onClick={() => {
                      setSelectedOrder(order);
                      handlePreviewInvoice(); // Show invoice preview
                    }} className="btn btn-link text-success">
                      <FaMagnifyingGlass />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Modal for editing the order */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Redigera Order</Modal.Title>
        </Modal.Header>
        <Modal.Body ref={printRef}>
          {/* Order details */}
          <h5>Orderdetaljer</h5>
          <p><strong>Order ID:</strong> {selectedOrder?.id}</p>
          <p><strong>Kundernummer:</strong>{selectedOrder?.user ? `${selectedOrder.user.customer_number} ` : 'Ej tillgängligt'}</p>
          <p><strong>Skapat:</strong> {new Date(selectedOrder?.created_at).toLocaleString()}</p>
          <h5>Produkter</h5>
          {selectedOrder?.products.length ? (
            <table className="table">
              <thead>
                <tr>
                  <th>Produkt</th>
                  <th>Pris (SEK)</th>
                  <th>Moms (%)</th>
                  <th>Kvantitet</th>
                  <th>Total (SEK)</th>
                </tr>
              </thead>
              <tbody>
                {selectedOrder.products.map((product) => (
                  <tr key={product.id}>
                    <td>{product.name}</td>
                    <td>{product.price.toFixed(2)}</td>
                    <td>{product.tax}%</td>
                    <td>{product.quantity}</td>
                    <td>{(product.price * product.quantity).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>Inga produkter.</p>
          )}

          <div className="mb-3">
            <label className="form-label">Pris (SEK)</label>
            <input
              type="number"
              className="form-control"
              value={selectedOrder?.total_price || 0}
              onChange={(e) => setSelectedOrder({ ...selectedOrder, total_price: parseFloat(e.target.value) } as Order)}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Status</label>
            <select
              className="form-select"
              value={selectedOrder?.status || ''}
              onChange={(e) => setSelectedOrder({ ...selectedOrder, status: e.target.value } as Order)}
            >
              <option value="pending">Pending</option>
              <option value="processing">Bearbetas</option>
              <option value="shipped">Skickad</option>
              <option value="delivered">Levererad</option>
              <option value="cancelled">Avbruten</option>
            </select>
          </div>
          <div className="mb-3">
            <label className="form-label">Leveransadress</label>
            <input
              type="text"
              className="form-control"
              value={selectedOrder?.shipping_address || ''}
              onChange={(e) => setSelectedOrder({ ...selectedOrder, shipping_address: e.target.value } as Order)}
            />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>Stäng</Button>
          <Button variant="primary" onClick={handleEditOrder}>Spara ändringar</Button>
          <Button variant="info" onClick={handlePreviewInvoice}>Förhandsgranska faktura</Button>
        </Modal.Footer>
      </Modal>

      {/* Modal for Invoice Preview */}
      <Modal show={showPreviewModal} onHide={() => setShowPreviewModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Faktura Förhandsvisning</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {invoiceData ? (
            <div>
              <h2>{invoiceData.title} {selectedOrder?.id}</h2>
              <p><strong>Kundnamn:</strong> {invoiceData.customerName}</p>
              <p><strong>Email:</strong> {invoiceData.email}</p>
              <p><strong>Leveransadress:</strong> {invoiceData.shippingAddress}</p>
              <h5>Produkter</h5>
              <table className="table">
                <thead>
                  <tr>
                    <th>Produkt</th>
                    <th>Pris (SEK)</th>
                    <th>Moms (%)</th>
                    <th>Kvantitet</th>
                    <th>Total (SEK)</th>
                  </tr>
                </thead>
                <tbody>
                  {invoiceData.items.map((item, index) => (
                    <tr key={index}>
                      <td>{item.name}</td>
                      <td>{item.price}</td>
                      <td>{item.tax}</td>
                      <td>{item.quantity}</td>
                      <td>{item.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p><strong>Total Pris:</strong> {invoiceData.totalPrice} SEK</p>
            </div>
          ) : (
            <p>Ingen fakturadata tillgänglig.</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPreviewModal(false)}>Stäng</Button>
          <Button variant="primary" onClick={handleDownloadInvoice}>Ladda ner Faktura</Button>
        </Modal.Footer>
      </Modal>

      {/* Toast Container */}
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} closeOnClick draggable pauseOnHover />
    </div>
  );
};

export default OrdersList;
























