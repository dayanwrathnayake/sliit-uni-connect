import { useState, useEffect } from 'react';
import shopApi from '../api/shopApi';
import PageLayout from '../components/layout/PageLayout';
import { useAuthStore } from '../store/authStore';

export default function ProductManagement() {
  const { userId } = useAuthStore();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '', description: '', price: '', stockQuantity: '', category: 'MERCHANDISE', clubId: '', imageUrl: ''
  });

  useEffect(() => {
    // In a real app, we would fetch the club managed by this user first.
    // For this prototype, we'll assume a dummy club ID or fetch all for now.
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data } = await shopApi.getProducts();
      setProducts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      // Need a real clubId here. For the demo, we'll try to find any club or use a placeholder.
      await shopApi.createProduct({
        ...newProduct,
        price: parseFloat(newProduct.price),
        stockQuantity: parseInt(newProduct.stockQuantity),
        clubId: "65f1a2b3c4d5e6f7a8b9c0d1" // Placeholder club ID
      });
      setShowAddForm(false);
      fetchProducts();
    } catch (err) {
      alert("Failed to create product. Make sure all fields are valid.");
    }
  };

  return (
    <PageLayout title="Product Management">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Inventory</h2>
          <button 
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold rounded-xl transition-all shadow-lg"
          >
            + Add New Product
          </button>
        </div>

        {showAddForm && (
          <div className="bg-slate-800 border border-slate-700 rounded-3xl p-6 shadow-2xl animate-in slide-in-from-top duration-300">
            <h3 className="text-lg font-bold text-white mb-6">Create Product</h3>
            <form onSubmit={handleCreateProduct} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input 
                placeholder="Product Name" 
                className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-amber-500 outline-none"
                value={newProduct.name}
                onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                required
              />
              <select 
                className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-amber-500 outline-none"
                value={newProduct.category}
                onChange={e => setNewProduct({...newProduct, category: e.target.value})}
              >
                <option value="MERCHANDISE">Merchandise</option>
                <option value="EVENT_TICKETS">Event Tickets</option>
                <option value="STATIONERY">Stationery</option>
                <option value="OTHER">Other</option>
              </select>
              <input 
                type="number" 
                placeholder="Price (Rs.)" 
                className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-amber-500 outline-none"
                value={newProduct.price}
                onChange={e => setNewProduct({...newProduct, price: e.target.value})}
                required min="0"
              />
              <input 
                type="number" 
                placeholder="Stock Quantity" 
                className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-amber-500 outline-none"
                value={newProduct.stockQuantity}
                onChange={e => setNewProduct({...newProduct, stockQuantity: e.target.value})}
                required min="0"
              />
              <textarea 
                placeholder="Description" 
                className="md:col-span-2 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-amber-500 outline-none h-24"
                value={newProduct.description}
                onChange={e => setNewProduct({...newProduct, description: e.target.value})}
              />
              <input 
                placeholder="Image URL" 
                className="md:col-span-2 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-amber-500 outline-none"
                value={newProduct.imageUrl}
                onChange={e => setNewProduct({...newProduct, imageUrl: e.target.value})}
              />
              <div className="md:col-span-2 flex justify-end gap-3 mt-4">
                <button type="button" onClick={() => setShowAddForm(false)} className="px-6 py-2.5 text-slate-400 hover:text-white transition-colors">Cancel</button>
                <button type="submit" className="px-8 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20">Save Product</button>
              </div>
            </form>
          </div>
        )}

        {/* Product List */}
        <div className="bg-slate-800 border border-slate-700 rounded-3xl overflow-hidden shadow-xl">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-900/50 border-b border-slate-700">
                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Product</th>
                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Category</th>
                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Price</th>
                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Stock</th>
                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {products.map(product => (
                <tr key={product.id} className="hover:bg-slate-700/30 transition-colors">
                  <td className="px-6 py-4 flex items-center gap-3">
                    <div className="h-10 w-10 bg-slate-900 rounded-lg overflow-hidden flex-shrink-0">
                      {product.imageUrl ? <img src={product.imageUrl} className="w-full h-full object-cover" /> : null}
                    </div>
                    <span className="text-sm font-bold text-white">{product.name}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-300">{product.category}</td>
                  <td className="px-6 py-4 text-sm font-bold text-amber-500">Rs. {product.price}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                       <span className={`h-2 w-2 rounded-full ${product.stockQuantity < 10 ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`} />
                       <span className="text-sm text-white font-mono">{product.stockQuantity}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-slate-400 hover:text-indigo-400 p-2 transition-colors">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button className="text-slate-400 hover:text-red-400 p-2 transition-colors">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </PageLayout>
  );
}
