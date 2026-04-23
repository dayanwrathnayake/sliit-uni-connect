import { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { 
  getAdminProducts, 
  createAdminProduct, 
  updateAdminProduct, 
  deleteAdminProduct 
} from '../../api/adminApi';
import { getAllClubs } from '../../api/clubApi';
import { useAuthStore } from '../../store/authStore';
import { useToast } from '../../hooks/useToast';

const categories = ['MERCHANDISE', 'EVENT_TICKETS', 'STATIONERY', 'OTHER'];

export default function ProductManagementPage() {
  const { user } = useAuthStore();
  const { showToast } = useToast();
  const [products, setProducts] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [selectedClubId, setSelectedClubId] = useState('');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stockQuantity: '',
    category: 'MERCHANDISE',
    imageUrl: '',
    clubId: ''
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedClubId) {
      fetchProducts();
    }
  }, [selectedClubId]);

  const fetchInitialData = async () => {
    try {
      const clubList = await getAllClubs();
      setClubs(clubList);
      
      // If student has a clubId or if list is not empty, pick first for system admin
      if (clubList.length > 0) {
        setSelectedClubId(clubList[0].id);
      }
    } catch (err) {
      showToast('Error', 'Failed to load clubs', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data } = await getAdminProducts(selectedClubId);
      setProducts(data);
    } catch (err) {
      showToast('Error', 'Failed to load products', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData, clubId: selectedClubId };
      if (editingProduct) {
        await updateAdminProduct(editingProduct.id, payload);
        showToast('Success', 'Product updated successfully', 'success');
      } else {
        await createAdminProduct(payload);
        showToast('Success', 'Product created successfully', 'success');
      }
      setIsModalOpen(false);
      fetchProducts();
    } catch (err) {
      showToast('Error', 'Action failed', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to PERMANENTLY delete this product?')) return;
    try {
      await deleteAdminProduct(id);
      showToast('Success', 'Product deleted permanently', 'success');
      // Update local state immediately for better UX
      setProducts(products.filter(p => p.id !== id));
    } catch (err) {
      showToast('Error', 'Delete failed', 'error');
    }
  };

  const openModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price,
        stockQuantity: product.stockQuantity,
        category: product.category,
        imageUrl: product.imageUrl || '',
        clubId: product.clubId
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        stockQuantity: '',
        category: 'MERCHANDISE',
        imageUrl: '',
        clubId: selectedClubId
      });
    }
    setIsModalOpen(true);
  };

  return (
    <AdminLayout>
      <div className="h-full overflow-y-auto p-6 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Product Management</h1>
            <p className="text-gray-500 text-sm">Manage inventory and stock levels for your club products.</p>
          </div>
          
          <div className="flex gap-3 w-full md:w-auto">
            <select 
              value={selectedClubId}
              onChange={(e) => setSelectedClubId(e.target.value)}
              className="bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {clubs.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <button 
              onClick={() => openModal()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl text-sm font-bold transition-all"
            >
              + Add Product
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Stock</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {products.map(product => (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex-shrink-0 flex items-center justify-center overflow-hidden">
                          {product.imageUrl ? <img src={product.imageUrl} className="w-full h-full object-cover" /> : '🎁'}
                        </div>
                        <span className="font-semibold text-gray-800">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded uppercase tracking-tighter">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-700">Rs. {product.price}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-bold ${product.stockQuantity < 5 ? 'text-red-500' : 'text-gray-600'}`}>
                          {product.stockQuantity}
                        </span>
                        {product.stockQuantity < 5 && (
                          <span className="px-1.5 py-0.5 bg-red-100 text-red-600 text-[9px] font-bold rounded uppercase">Low</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`h-2 w-2 rounded-full inline-block mr-2 ${product.active ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                      <span className="text-xs text-gray-500">{product.active ? 'Active' : 'Inactive'}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => openModal(product)} className="text-indigo-600 hover:text-indigo-900 font-bold text-xs mr-4">Edit</button>
                      <button onClick={() => handleDelete(product.id)} className="text-red-600 hover:text-red-900 font-bold text-xs">Delete</button>
                    </td>
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-6 py-20 text-center text-gray-400 italic">No products found for this club.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl p-8">
              <h2 className="text-xl font-bold text-gray-800 mb-6">{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Product Name</label>
                    <input 
                      type="text" 
                      required 
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Price (Rs.)</label>
                    <input 
                      type="number" 
                      required 
                      value={formData.price}
                      onChange={e => setFormData({...formData, price: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Stock Quantity</label>
                    <input 
                      type="number" 
                      required 
                      value={formData.stockQuantity}
                      onChange={e => setFormData({...formData, stockQuantity: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Category</label>
                    <select 
                      value={formData.category}
                      onChange={e => setFormData({...formData, category: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Description</label>
                    <textarea 
                      rows="3"
                      value={formData.description}
                      onChange={e => setFormData({...formData, description: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    ></textarea>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Image URL</label>
                    <input 
                      type="text" 
                      value={formData.imageUrl}
                      onChange={e => setFormData({...formData, imageUrl: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 text-sm font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition-colors">Cancel</button>
                  <button type="submit" className="flex-1 py-3 bg-indigo-600 text-white text-sm font-bold rounded-xl shadow-lg hover:bg-indigo-700 transition-colors">
                    {editingProduct ? 'Save Changes' : 'Create Product'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
