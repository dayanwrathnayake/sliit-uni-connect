import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import shopApi from '../api/shopApi';
import useCartStore from '../store/cartStore';
import PageLayout from '../components/layout/PageLayout';
import { useToast } from '../hooks/useToast';

export default function ProductDetailPage() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const addItem = useCartStore(state => state.addItem);
  const { showToast } = useToast();

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      const { data } = await shopApi.getProduct(productId);
      setProduct(data);
    } catch (err) {
      showToast('Error', 'Failed to load product details.', 'error');
      navigate('/shop');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!product || product.stockQuantity === 0) return;
    addItem(product);
    showToast('Success', `${product.name} added to your cart.`, 'success');
  };

  if (loading) {
    return (
      <PageLayout title="Loading Product...">
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
        </div>
      </PageLayout>
    );
  }

  if (!product) return null;

  return (
    <PageLayout title={product.name}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-6">
          <Link to="/shop" className="text-slate-400 hover:text-white transition-colors flex items-center gap-2">
            ← Back to Shop
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Product Image */}
          <div className="bg-slate-800 rounded-3xl overflow-hidden border border-slate-700 aspect-square relative flex items-center justify-center">
            {product.imageUrl ? (
              <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="text-8xl opacity-20">🎁</div>
            )}
            <div className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl text-sm font-bold text-amber-500 border border-amber-500/20">
              {product.category}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">{product.name}</h1>
              <p className="text-lg text-slate-400">Sold by <span className="text-indigo-400">{product.clubName}</span></p>
            </div>

            <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-2">Description</h3>
              <p className="text-slate-400 leading-relaxed">
                {product.description || "No description provided."}
              </p>
            </div>

            <div className="flex items-end justify-between border-t border-slate-700 pt-6">
              <div>
                <p className="text-sm text-slate-500 mb-1">Price</p>
                <p className="text-4xl font-bold text-white">Rs. {product.price}</p>
              </div>
              <div className="text-right">
                {product.stockQuantity > 0 ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-500/10 text-green-400 rounded-full text-sm font-medium border border-green-500/20">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    {product.stockQuantity} in stock
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-500/10 text-red-400 rounded-full text-sm font-medium border border-red-500/20">
                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                    Out of stock
                  </span>
                )}
              </div>
            </div>

            <div className="pt-4">
              <button
                onClick={handleAddToCart}
                disabled={product.stockQuantity === 0}
                className={`w-full py-4 rounded-xl text-lg font-bold transition-all ${
                  product.stockQuantity > 0
                    ? 'bg-amber-500 hover:bg-amber-400 text-slate-900 shadow-lg shadow-amber-500/20 active:scale-[0.98]'
                    : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                }`}
              >
                {product.stockQuantity > 0 ? 'Add to Cart' : 'Currently Unavailable'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
