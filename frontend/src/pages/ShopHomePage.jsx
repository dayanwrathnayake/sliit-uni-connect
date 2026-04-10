import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import shopApi from '../api/shopApi';
import useCartStore from '../store/cartStore';
import PageLayout from '../components/layout/PageLayout';

const categories = [
  { id: 'ALL', name: 'All Categories' },
  { id: 'MERCHANDISE', name: 'Merchandise' },
  { id: 'EVENT_TICKETS', name: 'Tickets' },
  { id: 'STATIONERY', name: 'Stationery' },
  { id: 'OTHER', name: 'Other' }
];

export default function ShopHomePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [clubIdFilter, setClubIdFilter] = useState('');
  const [eventTagFilter, setEventTagFilter] = useState('');
  const addItem = useCartStore(state => state.addItem);

  useEffect(() => {
    fetchProducts();
  }, [activeCategory, clubIdFilter, eventTagFilter]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const cat = activeCategory === 'ALL' ? null : activeCategory;
      const cId = clubIdFilter.trim() === '' ? null : clubIdFilter.trim();
      const eTag = eventTagFilter.trim() === '' ? null : eventTagFilter.trim();

      const { data } = await shopApi.getProducts(cat, cId, eTag);
      setProducts(data);
    } catch (err) {
      console.error("Failed to fetch products", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (e, product) => {
    e.preventDefault();
    
    // 1. Logic for animation
    const btn = e.currentTarget;
    const cartIcon = document.getElementById('nav-cart-link');
    
    if (cartIcon && btn) {
      const btnRect = btn.getBoundingClientRect();
      const cartRect = cartIcon.getBoundingClientRect();
      
      // Create flying element
      const flyingImg = document.createElement('img');
      flyingImg.src = product.imageUrl || 'https://via.placeholder.com/50';
      flyingImg.className = 'flying-item';
      flyingImg.style.left = `${btnRect.left + btnRect.width / 2 - 25}px`;
      flyingImg.style.top = `${btnRect.top + btnRect.height / 2 - 25}px`;
      
      document.body.appendChild(flyingImg);
      
      // Trigger animation to cart icon
      setTimeout(() => {
        flyingImg.style.left = `${cartRect.left + cartRect.width / 2 - 25}px`;
        flyingImg.style.top = `${cartRect.top + cartRect.height / 2 - 25}px`;
        flyingImg.style.transform = 'scale(0.1) opacity(0.5)';
        flyingImg.style.opacity = '0';
      }, 10);
      
      // Cleanup
      setTimeout(() => {
        document.body.removeChild(flyingImg);
        addItem(product);
      }, 800);
    } else {
      addItem(product);
    }
  };

  return (
    <PageLayout title="E-Shop">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className="space-y-10">
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${activeCategory === cat.id
                      ? 'bg-amber-500 text-white shadow-lg'
                      : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                    }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            <div className="flex gap-2 w-full md:w-auto">
              <input
                type="text"
                placeholder="Filter by Club ID..."
                value={clubIdFilter}
                onChange={(e) => setClubIdFilter(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-sm text-white px-4 py-2 rounded-xl focus:outline-none focus:border-amber-500 w-full md:w-40"
              />
              {/* Event Tag filter UI included but hidden/optional as it relies on future event fields */}
              <input
                type="text"
                placeholder="Event Tag..."
                value={eventTagFilter}
                onChange={(e) => setEventTagFilter(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-sm text-white px-4 py-2 rounded-xl focus:outline-none focus:border-amber-500 w-full md:w-32"
              />
            </div>
          </div>

          {/* Product Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-80 bg-slate-800 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map(product => (
                <div key={product.id} className="group bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden hover:border-amber-500/50 transition-all duration-300 shadow-xl block cursor-pointer">
                  <Link to={`/shop/product/${product.id}`} className="block">
                    <div className="aspect-square relative overflow-hidden bg-slate-900">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-5xl opacity-20">🎁</div>
                      )}
                      <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-md px-2 py-1 rounded-lg text-xs font-bold text-amber-500 border border-amber-500/20">
                        {product.category}
                      </div>
                    </div>

                    <div className="p-4 space-y-3">
                      <div>
                        <h3 className="text-lg font-bold text-white line-clamp-1">{product.name}</h3>
                        <p className="text-sm text-slate-400 line-clamp-2 mt-1">{product.description}</p>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <span className="text-xl font-bold text-white">Rs. {product.price}</span>
                        <span className="text-xs text-slate-500">{product.stockQuantity} in stock</span>
                      </div>
                    </div>
                  </Link>

                  <div className="p-4 pt-0">
                    <button
                      onClick={(e) => handleAddToCart(e, product)}
                      disabled={product.stockQuantity === 0}
                      className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all ${product.stockQuantity > 0
                          ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 active:scale-95'
                          : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                        }`}
                    >
                      {product.stockQuantity > 0 ? 'Add to Cart' : 'Out of Stock'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-slate-800/50 rounded-3xl border-2 border-dashed border-slate-700">
              <p className="text-4xl mb-4">📦</p>
              <h3 className="text-xl font-bold text-white">No products found</h3>
              <p className="text-slate-400 mt-2">Check back later for more exciting items!</p>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
