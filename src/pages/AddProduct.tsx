import React, { useState } from 'react';
import { supabase } from '../supabaseClient'; // Import your Supabase client
import ReactQuill from 'react-quill'; // Import React Quill
import 'react-quill/dist/quill.snow.css'; // Import React Quill styles
import { FaArrowDown, FaArrowUp, FaPlus } from 'react-icons/fa';
import { FaTrash } from 'react-icons/fa6';

interface Product {
  name: string;
  price: number;
  stock: number;
  ingredients: string[];
  categories: string[];
  description: string;
  tax: number; // Tax as a number
  sku: string; // Article number
}

const AddProduct: React.FC = () => {
  const [product, setProduct] = useState<Product>({
    name: '',
    price: 0,
    stock: 0,
    ingredients: [],
    categories: [],
    description: '',
    tax: 0,
    sku: '', // Initialize article number
  });

  const [images, setImages] = useState<File[]>([]); // Hanterar upp till 4 bilder
  const [ingredient, setIngredient] = useState<string>(''); // State for the new ingredient
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]); // Hantera kategorier som en array
const [category, setCategory] = useState<string>(''); 
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    tax: '25', // Default tax value as a string
  });

  // Handle image selection, allowing up to 4 images
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;

    if (files) {
      const newImages: File[] = [...images];

      Array.from(files).forEach((file) => {
        if (newImages.length < 4) {
          if (file.size > 200 * 1024) {
            setError('Bildstorleken får inte överstiga 200 KB.');
          } else {
            setError(null);
            newImages.push(file);
          }
        } else {
          setError('Du kan bara ladda upp max 4 bilder.');
        }
      });

      setImages(newImages);
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
  };

  const moveImage = (fromIndex: number, toIndex: number) => {
    const newImages = [...images];
    const [movedImage] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, movedImage);
    setImages(newImages);
  };
  const addCategory = () => {
    if (category.trim() === '') {
      setError('Kategorin kan inte vara tom.');
      return;
    }
  
    setCategories((prev) => [...prev, category.trim()]); // Lägg till ny kategori
    setCategory(''); // Töm input-fältet
    setError(null);
  };
  
  // Funktion för att ta bort kategori
  const removeCategory = (index: number) => {
    setCategories((prev) => prev.filter((_, i) => i !== index));
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (name === 'tax') {
      const taxValue = parseFloat(value); // Use the value directly as a decimal
      setProduct((prev) => ({ ...prev, tax: taxValue }));
      setFormData((prev) => ({ ...prev, [name]: value })); // Keep the string value for form state
    } else {
      setProduct((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleTaxChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const taxValue = parseFloat(e.target.value);
    setProduct((prev) => ({ ...prev, tax: taxValue }));
    setFormData((prev) => ({ ...prev, tax: e.target.value }));
  };

  const handleIngredientChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIngredient(e.target.value);
  };

  const addIngredient = () => {
    if (ingredient.trim() === '') {
      setError('Ingrediensen kan inte vara tom.');
      return;
    }

    setProduct((prev) => ({
      ...prev,
      ingredients: [...prev.ingredients, ingredient.trim()],
    }));
    setIngredient(''); // Reset ingredient input
    setError(null);
  };

  const removeIngredient = (index: number) => {
    setProduct((prev) => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
  
    // Set the categories from the local state into the product state
    const updatedProduct = { ...product, categories: categories };
  
    if (
      !updatedProduct.name ||
      !updatedProduct.price ||
      !updatedProduct.stock ||
      updatedProduct.ingredients.length === 0 ||
      updatedProduct.categories.length === 0 || // Check if categories are empty
      !updatedProduct.description ||
      updatedProduct.tax === undefined ||
      !updatedProduct.sku ||
      images.length === 0
    ) {
      setError('Var vänlig fyll i alla fält.');
      return;
    }
  
    setError(null);
    setSuccess(null);
  
    const uploadedImageUrls: string[] = [];
  
    // Upload images to Supabase and get public URLs
    for (const image of images) {
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('products')
        .upload(`public/${image.name}`, image, {
          cacheControl: '3600',
          upsert: true,
        });
  
      if (uploadError) {
        setError(`Fel vid uppladdning av bild: ${uploadError.message}`);
        return;
      }
  
      const { data } = supabase.storage
        .from('products')
        .getPublicUrl(`public/${image.name}`);
  
      const publicURL = data?.publicUrl;
      if (!publicURL) {
        setError('Fel vid hämtning av bild-URL: Ingen giltig URL tillgänglig.');
        return;
      }
  
      uploadedImageUrls.push(publicURL); // Save each uploaded image URL
    }
  
    const { error: productError } = await supabase
      .from('products')
      .insert({
        name: updatedProduct.name,
        price: updatedProduct.price,
        stock: updatedProduct.stock,
        ingredients: updatedProduct.ingredients,
        description: updatedProduct.description,
        categories: updatedProduct.categories, // Insert the categories correctly
        tax: updatedProduct.tax,
        sku: updatedProduct.sku,
        image_url: uploadedImageUrls, // Save the image URLs in the database
      });
  
    if (productError) {
      setError(`Fel vid skapande av produkt: ${productError.message}`);
      return;
    }
  
    // Reset the product and form states
    setProduct({
      name: '',
      price: 0,
      stock: 0,
      ingredients: [],
      description: '',
      categories: [],
      tax: 0,
      sku: '',
    });
    setImages([]);
    setCategories([]); // Reset the categories
    setSuccess('Produkten har skapats framgångsrikt!');
  };

  // Define available tax rates
  const taxRates = [
    { value: 0.0, label: '0%' },
    { value: 0.06, label: '6%' },
    { value: 0.12, label: '12%' },
    { value: 0.25, label: '25%' },
  ];

  return (
    <div className="container mt-5">
      <h2>Lägg till Produkt</h2>
      <form onSubmit={handleSubmit}>
        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <div className="mb-3">
          <label htmlFor="name" className="form-label">Produktnamn</label>
          <input
            type="text"
            className="form-control"
            id="name"
            name="name"
            value={product.name}
            onChange={handleChange}
            placeholder="Ange produktnamn"
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor="articleNumber" className="form-label">Artikelnummer</label>
          <input
            type="text"
            className="form-control"
            id="sku"
            name="sku"
            value={product.sku}
            onChange={handleChange}
            placeholder="Ange artikelnummer"
            required
          />
        </div>
        <div className="mb-3">
  <label htmlFor="categories" className="form-label">Kategorier</label>
  <div className="d-flex mb-2">
    <input
      type="text"
      className="form-control me-2"
      id="category"
      value={category}
      onChange={(e) => setCategory(e.target.value)} // Uppdatera kategori-inputen
      placeholder="Lägg till kategori"
    />
    <button type="button" className="btn btn-link primary " onClick={addCategory}><FaPlus/></button>
  </div>
  <ul className="list-group">
    {categories.map((cat, index) => (
      <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
        {cat}
        <button type="button" className="btn btn-link text-danger" onClick={() => removeCategory(index)}><FaTrash/></button>
      </li>
    ))}
  </ul>
</div>

        <div className="mb-3">
          <label htmlFor="price" className="form-label">Pris (SEK)</label>
          <input
            type="number"
            className="form-control"
            id="price"
            name="price"
            value={product.price}
            onChange={handleChange}
            placeholder="Ange pris i SEK"
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor="stock" className="form-label">Lager</label>
          <input
            type="number"
            className="form-control"
            id="stock"
            name="stock"
            value={product.stock}
            onChange={handleChange}
            placeholder="Ange lagermängd"
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor="ingredients" className="form-label">Ingredienser</label>
          <div className="d-flex mb-2">
            <input
              type="text"
              className="form-control me-2"
              id="ingredient"
              value={ingredient}
              onChange={handleIngredientChange}
              placeholder="Lägg till ingrediens"
            />
            <button type="button" className="btn btn-link text-primary" onClick={addIngredient}><FaPlus/></button>
          </div>
          <ul className="list-group">
            {product.ingredients.map((ingredient, index) => (
              <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                {ingredient}
                <button type="button" className="btn btn-link text-danger" onClick={() => removeIngredient(index)}><FaTrash/></button>
              </li>
            ))}
          </ul>
        </div>

        <div className="mb-3">
          <label className="form-label">Produktbeskrivning</label>
          <ReactQuill
            value={product.description}
            onChange={(value) => setProduct((prev) => ({ ...prev, description: value }))}
            theme="snow"
            placeholder="Skriv produktbeskrivning här..."
          />
        </div>

        <div className="mb-3">
          <label htmlFor="tax" className="form-label">Moms</label>
          <select
            id="tax"
            name="tax"
            className="form-select"
            value={formData.tax}
            onChange={handleTaxChange}
            required
          >
            {taxRates.map((rate) => (
              <option key={rate.value} value={rate.value}>{rate.label}</option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <label className="form-label">Produktbilder</label>
          <input
            type="file"
            className="form-control"
            onChange={handleImageChange}
            multiple
            accept="image/*"
          />

          <div className="mt-3">
            {images.map((image, index) => (
              <div key={index} className="mb-2">
                <img
                  src={URL.createObjectURL(image)}
                  alt={`Bild ${index + 1}`}
                  className="img-thumbnail"
                  style={{ width: '150px', height: '150px' }}
                />
                <div>
                  {index > 0 && (
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => moveImage(index, index - 1)}
                    >
                     <FaArrowUp/>
                    </button>
                  )}
                  {index < images.length - 1 && (
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => moveImage(index, index + 1)}
                    >
                      <FaArrowDown/>
                    </button>
                  )}
                  <button
                    type="button"
                    className="btn btn-danger ms-2"
                    onClick={() => removeImage(index)}
                  >
                   <FaTrash/>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button type="submit" className="btn btn-primary">Lägg till Produkt</button>
      </form>
    </div>
  );
};

export default AddProduct;



