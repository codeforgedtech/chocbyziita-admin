import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Button, Modal } from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify';
import { FaEdit, FaPlus, FaTrash } from 'react-icons/fa';
import ReactQuill from 'react-quill';
import 'react-toastify/dist/ReactToastify.css';
import 'react-quill/dist/quill.snow.css'; 
import "./Products.css";

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  tax: number; // Tax will remain a decimal (e.g. 0.25 for 25%)
  image_url: string[]; // Changed to array
  ingredients: string[];
  categories: string[];
  description: string;
  sku: string; // Artikelnummer
}

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [categories, setCategories] = useState<string[]>([]); // Hantera kategorier som en array
  const [category, setCategory] = useState<string>(''); 
  const [imageFiles, setImageFiles] = useState<File[]>([]); // Changed to array
  const [ingredient, setIngredient] = useState<string>('');

  // Define available tax rates as an array of objects
  const taxRates = [
    { value: 0.0, label: '0%' },
    { value: 0.06, label: '6%' },
    { value: 0.12, label: '12%' },
    { value: 0.25, label: '25%' },
  ];

  const fetchProducts = async () => {
    const { data, error } = await supabase
        .from('products')
        .select('id, name, price, stock, tax, image_url, ingredients, categories , description, sku');

    if (error) {
        setError(error.message);
        toast.error("Kunde inte hämta produkter: " + error.message);
    } else {
        console.log('Fetched Products:', data); // Logga hämtade produkter
        const productsWithDefaultImage = data.map((product: Product) => ({
            ...product,
            image_url: Array.isArray(product.image_url) ? product.image_url : (product.image_url ? [product.image_url] : []),
        }));

        console.log('Processed Products:', productsWithDefaultImage); // Logga processade produkter
        setProducts(productsWithDefaultImage);
        
    }
};

  

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleEditProduct = async () => {
    if (selectedProduct) {
        const updates: Partial<Product> = {
            id: selectedProduct.id,
            name: selectedProduct.name,
            price: selectedProduct.price,
            stock: selectedProduct.stock,
            tax: selectedProduct.tax,
            ingredients: selectedProduct.ingredients,
            categories: selectedProduct.categories,
            description: selectedProduct.description,
            sku: selectedProduct.sku,
            image_url: selectedProduct.image_url || [], // Se till att image_url alltid är en array
        };
        console.log('Updating Product:', updates);
        // Hantera uppladdning av nya bilder
        if (imageFiles.length > 0) {
          const uploadedImageUrls: string[] = [];
          
          for (const file of imageFiles) {
              const fileName = `public/${selectedProduct.id}_${file.name}`;
              const { data, error: uploadError } = await supabase.storage
                  .from('products')
                  .upload(fileName, file);
      
              if (uploadError) {
                  setError(uploadError.message);
                  toast.error("Kunde inte ladda upp bilden: " + uploadError.message);
                  return;
              }
      
              const publicUrl = `https://ocvucsxitvcbsuqjoeqa.supabase.co/storage/v1/object/public/products/${fileName}`;
              uploadedImageUrls.push(publicUrl); // Spara den uppladdade URL:en
          }
      
          // Kombinera befintliga bilder med nya uppladdningar
          updates.image_url = [...(selectedProduct.image_url || []), ...uploadedImageUrls];
      }
    const { error: updateError } = await supabase
        .from('products')
        .update(updates)
        .eq('id', selectedProduct.id);

    if (updateError) {
        setError(updateError.message);
        toast.error("Kunde inte uppdatera produkten: " + updateError.message);
    } else {
        setShowEditModal(false);
        setImageFiles([]); // Töm filerna
        setSelectedProduct(null);
        fetchProducts();
        toast.success("Produkten uppdaterades framgångsrikt!");
    }
}
};

  const handleDeleteProduct = async (id: number) => {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      setError(error.message);
      toast.error("Kunde inte ta bort produkten: " + error.message);
    } else {
      fetchProducts();
      toast.success("Produkten togs bort framgångsrikt!");
    }
  };

  const handleDeleteImage = async (url: string) => { // Change to accept URL
    if (selectedProduct) {
      const filePath = url.split('/products/')[1];
      const { error } = await supabase.storage
        .from('products')
        .remove([filePath]);

      if (error) {
        setError(error.message);
        toast.error("Kunde inte ta bort bilden: " + error.message);
      } else {
        const updatedImageUrls = selectedProduct.image_url.filter(image => image !== url);
        
        await supabase
          .from('products')
          .update({ image_url: updatedImageUrls })
          .eq('id', selectedProduct.id);

        setImageFiles([]); // Clear image files
        fetchProducts();
        toast.success("Bilden togs bort framgångsrikt!");
      }
    }
  };

  const handleIngredientChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIngredient(e.target.value);
  };
  const handleCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCategory(e.target.value);
  };

  const addIngredient = () => {
    if (selectedProduct && ingredient) {
      setSelectedProduct({
        ...selectedProduct,
        ingredients: [...selectedProduct.ingredients, ingredient],
      });
      setIngredient('');
      toast.success("Ingrediens tillagd framgångsrikt!");
    }
  };
  const addCategory = () => {
    if (selectedProduct && category) {
      setSelectedProduct({
        ...selectedProduct,
        categories: [...selectedProduct.categories, category],
      });
      setIngredient('');
      toast.success("Kategori är tillagd framgångsrikt!");
    }
  };
  const removeIngredient = (index: number) => {
    if (selectedProduct) {
      const updatedIngredients = [...selectedProduct.ingredients];
      updatedIngredients.splice(index, 1);
      setSelectedProduct({
        ...selectedProduct,
        ingredients: updatedIngredients,
      });
      toast.success("Ingrediens borttagen framgångsrikt!");
    }
  };
  const removeCategory = (index: number) => {
    if (selectedProduct) {
      const updatedCategory = [...selectedProduct.categories];
      updatedCategory.splice(index, 1);
      setSelectedProduct({
        ...selectedProduct,
        categories: updatedCategory,
      });
      toast.success("Category borttagen framgångsrikt!");
    }
  };
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    console.log('Selected image files:', files); // Logga de valda bilderna
    setImageFiles(files); // Save multiple files
};

  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="container mt-4">
      <h2>Produktlista</h2>
      
      <table className="">
        <thead>
          <tr>
            <th>Namn</th>
            <th>Artikelnummer</th>
            <th>Pris (ex moms)</th>
            <th>Moms</th>
           <th>Kvantitet</th>
            <th>Åtgärd</th>
          </tr>
        </thead>
        <tbody>
          {products.length === 0 ? (
            <tr>
              <td colSpan={5} className="text-center">Inga produkter hittades.</td>
            </tr>
          ) : (
            products.map((product) => (
              <tr key={product.id}>
                <td>{product.name}</td>
                <td>{product.sku || 'Ej tillgängligt'}</td> {/* Artikelnummer */}
                <td>{product.price.toFixed(2)} kr</td>
                <td>{product.tax}%</td>
                <td>{product.stock}</td> 
                <td>
                  <div className="d-flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedProduct(product);
                        setShowEditModal(true);
                      }}
                      className="btn btn-link text-primary"
                    >
                      <FaEdit />
                    </button>
                    <button onClick={() => handleDeleteProduct(product.id)} className='btn btn-link text-danger'>
                      <FaTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
   
      {/* Modal för redigering av produkt */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Redigera Produkt</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-3">
            <label className="form-label">Namn</label>
            <input
              type="text"
              className="form-control"
              value={selectedProduct?.name || ''}
              onChange={(e) => setSelectedProduct({ ...selectedProduct!, name: e.target.value })}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Artikelnummer</label>
            <input
              type="text"
              className="form-control"
              value={selectedProduct?.sku || ''}
              onChange={(e) => setSelectedProduct({ ...selectedProduct!, sku: e.target.value })}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Beskrivning</label>
            <ReactQuill 
              value={selectedProduct?.description || ''}
              onChange={(value) => setSelectedProduct({ ...selectedProduct!, description: value })}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Ingredienser</label>
            <div className="d-flex mb-2">
              <input
                type="text"
                className="form-control"
                value={ingredient}
                onChange={handleIngredientChange}
              />
              <button className="btn btn-link text-primary" onClick={addIngredient}><FaPlus/></button>
            </div>
            <ul className="list-group">
              {selectedProduct?.ingredients.map((ingredient, index) => (
                <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                  {ingredient}
                  <button onClick={() => removeIngredient(index)} className="btn btn-link text-danger"><FaTrash/></button>
                </li>
              ))}
            </ul>
          </div>
          <div className="mb-3">
            <label className="form-label">Kategorier</label>
            <div className="d-flex mb-2">
              <input
                type="text"
                className="form-control"
                value={category}
                onChange={handleCategoryChange}
              />
              <button className="btn btn-link text-primary " onClick={addCategory}><FaPlus/></button>
            </div>
            <ul className="list-group">
              {selectedProduct?.categories.map((categories, index) => (
                <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                  {categories}
                  <button onClick={() => removeCategory(index)} className="btn btn-link text-danger"><FaTrash/></button>
                </li>
              ))}
            </ul>
          </div>
          <div className="mb-3">
            <label className="form-label">Pris (ex moms)</label>
            <input
              type="number"
              className="form-control"
              value={selectedProduct?.price || ''}
              onChange={(e) => setSelectedProduct({ ...selectedProduct!, price: parseFloat(e.target.value) })}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Lagerstatus</label>
            <input
              type="number"
              className="form-control"
              value={selectedProduct?.stock || ''}
              onChange={(e) => setSelectedProduct({ ...selectedProduct!, stock: parseInt(e.target.value) })}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Moms</label>
            <select
              className="form-control"
              value={selectedProduct?.tax || ''}
              onChange={(e) => setSelectedProduct({ ...selectedProduct!, tax: parseFloat(e.target.value) })}
            >
              {taxRates.map(rate => (
                <option key={rate.value} value={rate.value}>{rate.label}</option>
              ))}
            </select>
          </div>
          <div className="mb-3">
            <label className="form-label">Bilder</label>
            <input
              type="file"
              multiple
              className="form-control"
              accept="image/*"
              onChange={handleImageChange}
            />
       
       <div className="mt-2">
        {Array.isArray(selectedProduct?.image_url) && selectedProduct.image_url.length > 0 ? (
            selectedProduct.image_url.map((url: string, index: number) => (
                <div key={index} className="position-relative">
                    <img
                        src={url}
                        alt={`product-${index}`}
                        style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                    />
                    <button
                        className="btn btn-danger position-absolute"
                        style={{ top: 0, right: 0 }}
                        onClick={() => handleDeleteImage(url)}
                    >
                        X
                    </button>
                </div>
            ))
        ) : (
            <div>Inga bilder tillgängliga</div> // Meddelande om inga bilder finns
        )}
    </div>

          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Stäng
          </Button>
          <Button variant="primary" onClick={handleEditProduct}>
            Spara ändringar
          </Button>
        </Modal.Footer>
      </Modal>
      
      <ToastContainer />
    </div>
  );
};

export default Products;


















