import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient'; // Justera sökvägen enligt din struktur
import { Modal, Button } from 'react-bootstrap'; // Importera Modal och Button

// Definiera gränssnittet för Produkt
interface Product {
  id: number; // ID som nummer
  name: string;
  price: number;
  stock: number;
  tax: number;
  image_url?: string; // Lägga till en eventuell bild-URL
}

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [newProduct, setNewProduct] = useState<Product>({
    id: 0,
    name: '',
    price: 0,
    stock: 0,
    tax: 0,
    image_url: '',
  });

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, price, stock, tax, image_url'); // Hämta bild-URL

      if (error) {
        setError(error.message);
      } else {
        setProducts(data as Product[]);
      }
    };

    fetchProducts();
  }, []);

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setShowEditModal(true);
  };

  const handleDelete = async (id: number) => {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      setError(error.message);
    } else {
      setProducts(products.filter(product => product.id !== id));
    }
  };

  const handleUpdateProduct = async () => {
    if (selectedProduct) {
      const { error } = await supabase
        .from('products')
        .update({
          name: selectedProduct.name,
          price: selectedProduct.price,
          stock: selectedProduct.stock,
          tax: selectedProduct.tax,
          image_url: selectedProduct.image_url,
        })
        .eq('id', selectedProduct.id);

      if (error) {
        setError(error.message);
      } else {
        setProducts(products.map(product => product.id === selectedProduct.id ? selectedProduct : product));
        setShowEditModal(false);
        setSelectedProduct(null);
      }
    }
  };

  const handleAddProduct = async () => {
    const { error } = await supabase
      .from('products')
      .insert([newProduct]);

    if (error) {
      setError(error.message);
    } else {
      setProducts([...products, newProduct]);
      setShowAddModal(false);
      setNewProduct({ id: 0, name: '', price: 0, stock: 0, tax: 0, image_url: '' }); // Reset newProduct
    }
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSelectedProduct(null);
  };

  const handleCloseAddModal = () => {
    setShowAddModal(false);
    setNewProduct({ id: 0, name: '', price: 0, stock: 0, tax: 0, image_url: '' }); // Reset newProduct
  };

  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="container mt-5">
      <h2>Produkter</h2>
      <Button variant="primary" onClick={() => setShowAddModal(true)}>Lägg till Produkt</Button>
      {products.length === 0 ? (
        <p>Inga produkter hittades.</p>
      ) : (
        <table className="table table-striped">
          <thead>
            <tr>
              <th>ID</th>
              <th>Namn</th>
              <th>Pris (SEK)</th>
              <th>Kvantitet</th>
              <th>Moms (%)</th>
              <th>Bild</th>
              <th>Åtgärder</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td>{product.id}</td>
                <td>{product.name}</td>
                <td>{product.price.toFixed(2)} SEK</td>
                <td>{product.stock}</td>
                <td>{(product.tax * 100).toFixed(0)}%</td>
                <td>
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name} style={{ width: '50px', height: '50px' }} />
                  ) : (
                    'Ingen bild'
                  )}
                </td>
                <td>
                  <Button variant="warning" onClick={() => handleEdit(product)}>Redigera</Button>
                  <Button variant="danger" onClick={() => handleDelete(product.id)}>Ta bort</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Redigera Modal */}
      <Modal show={showEditModal} onHide={handleCloseEditModal}>
        <Modal.Header closeButton>
          <Modal.Title>Redigera Produkt</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedProduct && (
            <div>
              <div className="mb-3">
                <label className="form-label">Namn</label>
                <input
                  type="text"
                  className="form-control"
                  value={selectedProduct.name}
                  onChange={(e) => setSelectedProduct({ ...selectedProduct, name: e.target.value })}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Pris (SEK)</label>
                <input
                  type="number"
                  className="form-control"
                  value={selectedProduct.price}
                  onChange={(e) => setSelectedProduct({ ...selectedProduct, price: parseFloat(e.target.value) })}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Kvantitet</label>
                <input
                  type="number"
                  className="form-control"
                  value={selectedProduct.stock}
                  onChange={(e) => setSelectedProduct({ ...selectedProduct, stock: parseInt(e.target.value) })}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Moms (%)</label>
                <input
                  type="number"
                  className="form-control"
                  value={selectedProduct.tax * 100}
                  onChange={(e) => setSelectedProduct({ ...selectedProduct, tax: parseFloat(e.target.value) / 100 })}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Bild-URL</label>
                <input
                  type="text"
                  className="form-control"
                  value={selectedProduct.image_url}
                  onChange={(e) => setSelectedProduct({ ...selectedProduct, image_url: e.target.value })}
                />
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseEditModal}>Stäng</Button>
          <Button variant="primary" onClick={handleUpdateProduct}>Spara ändringar</Button>
        </Modal.Footer>
      </Modal>

      {/* Lägg till Modal */}
      <Modal show={showAddModal} onHide={handleCloseAddModal}>
        <Modal.Header closeButton>
          <Modal.Title>Lägg till Produkt</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-3">
            <label className="form-label">Namn</label>
            <input
              type="text"
              className="form-control"
              value={newProduct.name}
              onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Pris (SEK)</label>
            <input
              type="number"
              className="form-control"
              value={newProduct.price}
              onChange={(e) => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) })}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Kvantitet</label>
            <input
              type="number"
              className="form-control"
              value={newProduct.stock}
              onChange={(e) => setNewProduct({ ...newProduct, stock: parseInt(e.target.value) })}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Moms (%)</label>
            <input
              type="number"
              className="form-control"
              value={newProduct.tax * 100}
              onChange={(e) => setNewProduct({ ...newProduct, tax: parseFloat(e.target.value) / 100 })}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Bild-URL</label>
            <input
              type="text"
              className="form-control"
              value={newProduct.image_url}
              onChange={(e) => setNewProduct({ ...newProduct, image_url: e.target.value })}
            />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseAddModal}>Stäng</Button>
          <Button variant="primary" onClick={handleAddProduct}>Lägg till produkt</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Products;


