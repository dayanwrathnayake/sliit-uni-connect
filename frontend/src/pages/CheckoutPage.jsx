import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useCartStore from '../store/cartStore';
import shopApi from '../api/shopApi';
import PageLayout from '../components/layout/PageLayout';
import { useAuth } from '../hooks/useAuth';

export default function CheckoutPage() {
  const { items, clearCart } = useCartStore();
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalAmount = subtotal + 50;

  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // State for form
  const [itNumber, setItNumber] = useState(user?.itNumber || '');
  const [telephone, setTelephone] = useState('');
  
  const navigate = useNavigate();

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (items.length === 0) return;

    // Validation
    const itRegex = /^IT\d{8}$/i;
    const phoneRegex = /^\d{10}$/;

    if (!itRegex.test(itNumber)) {
      setError("Invalid IT Number. Format: ITXXXXXXXX (e.g. IT21005544)");
      return;
    }

    if (!phoneRegex.test(telephone)) {
      setError("Invalid Telephone Number. Must be 10 digits (e.g. 0771234567)");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Create orders for each club (if multiple clubs)
      const clubIds = [...new Set(items.map(i => i.clubId))];
      
      for (const clubId of clubIds) {
        const clubItems = items.filter(i => i.clubId === clubId);
        await shopApi.placeOrder({
          clubId,
          telephoneNumber: telephone,
          items: clubItems.map(i => ({ productId: i.id, quantity: i.quantity }))
        });
      }

      clearCart();
      navigate('/profile/me', { state: { success: true } });
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to place order. Check stock levels.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout title="Checkout">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="max-w-3xl mx-auto">
          <div className="bg-slate-800 border border-slate-700 rounded-3xl p-8 shadow-xl">
            <h3 className="text-xl font-bold text-white mb-2">Confirm Your Details</h3>
            <p className="text-sm text-slate-400 mb-8">
              Once confirmed, an email receipt will be sent to your student email.
            </p>

            <form onSubmit={handleCheckout} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Confirm IT Number (ITXXXXXXXX)</label>
                  <input 
                    type="text"
                    required
                    maxLength={10}
                    value={itNumber}
                    onChange={(e) => setItNumber(e.target.value.toUpperCase())}
                    placeholder="e.g. IT23666610"
                    className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Telephone Number (10 digits)</label>
                  <input 
                    type="tel"
                    required
                    maxLength={10}
                    value={telephone}
                    onChange={(e) => setTelephone(e.target.value.replace(/\D/g, ''))}
                    placeholder="0771234567"
                    className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-4 flex gap-4 items-start my-8">
                <span className="text-2xl mt-1">📍</span>
                <div>
                  <h4 className="text-indigo-400 font-bold text-sm">Campus Pickup Only</h4>
                  <p className="text-slate-400 text-sm mt-1 leading-relaxed">
                    All items are available exclusively for physical collection at the SLIIT Campus premises. 
                    You will receive an email instructions once your order is READY for pickup. Payment should be made during collection.
                  </p>
                </div>
              </div>

              <div className="space-y-4 mb-6 pt-4 border-t border-slate-700">
                {items.map(item => (
                  <div key={item.id} className="flex justify-between items-center text-sm">
                    <span className="text-slate-300">{item.quantity}x {item.name}</span>
                    <span className="text-white font-medium">Rs. {item.price * item.quantity}</span>
                  </div>
                ))}
                <div className="flex justify-between text-2xl font-black text-white pt-4">
                  <span>Total Amount</span>
                  <span className="text-amber-500">Rs. {totalAmount}</span>
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl text-center">
                  {error}
                </div>
              )}

              <div className="grid gap-4 mt-8">
                <button 
                  type="submit"
                  disabled={loading || items.length === 0}
                  className="w-full py-4 bg-amber-500 hover:bg-amber-400 disabled:bg-slate-700 disabled:text-slate-500 text-slate-900 font-black text-lg rounded-2xl transition-all shadow-lg active:scale-[0.98]"
                >
                  {loading ? 'Processing...' : 'Place Order Now'}
                </button>
                <button 
                  type="button"
                  onClick={() => navigate('/shop/cart')}
                  className="w-full py-3 text-slate-400 hover:text-white transition-colors"
                >
                  Back to Cart
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
