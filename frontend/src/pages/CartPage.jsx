import { Link, useNavigate } from 'react-router-dom';
import useCartStore from '../store/cartStore';
import PageLayout from '../components/layout/PageLayout';

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart } = useCartStore();
  const navigate = useNavigate();
  
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalAmount = subtotal + 50;

  if (items.length === 0) {
    return (
      <PageLayout title="Shopping Cart">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-center">
          <div className="py-20 bg-slate-800/50 rounded-3xl border-2 border-dashed border-slate-700">
            <p className="text-6xl mb-6">🛒</p>
            <h3 className="text-2xl font-bold text-white">Your cart is empty</h3>
            <p className="text-slate-400 mt-2 mb-8">Looks like you haven't added anything yet.</p>
            <Link 
              to="/shop" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold rounded-xl transition-all shadow-lg"
            >
              Start Shopping
            </Link>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Shopping Cart">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Item List */}
          <div className="lg:col-span-2 space-y-4">
            {items.map(item => (
              <div key={item.id} className="bg-slate-800 border border-slate-700 rounded-2xl p-4 flex gap-4 items-center">
                <div className="h-20 w-20 bg-slate-900 rounded-xl flex-shrink-0 overflow-hidden">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl opacity-20">🎁</div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="text-white font-bold truncate">{item.name}</h4>
                  <p className="text-slate-400 text-sm">{item.clubName}</p>
                  <div className="text-amber-500 font-bold mt-1">Rs. {item.price}</div>
                </div>
                
                <div className="flex items-center gap-3 bg-slate-900 rounded-lg p-1 border border-slate-700">
                  <button 
                    onClick={() => updateQuantity(item.id, item.quantity - 1, item.stockQuantity)}
                    className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                  >
                    -
                  </button>
                  <span className="w-4 text-center text-sm font-bold text-white">{item.quantity}</span>
                  <button 
                    onClick={() => updateQuantity(item.id, item.quantity + 1, item.stockQuantity)}
                    disabled={item.quantity >= item.stockQuantity}
                    className={`w-8 h-8 flex items-center justify-center transition-colors ${
                      item.quantity >= item.stockQuantity 
                        ? 'text-slate-600 cursor-not-allowed' 
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    +
                  </button>
                </div>
                
                <button 
                  onClick={() => removeItem(item.id)}
                  className="p-2 text-slate-500 hover:text-red-400 transition-colors"
                  title="Remove Item"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
            
            <button 
              onClick={clearCart}
              className="text-sm text-slate-500 hover:text-white transition-colors flex items-center gap-2 px-2"
            >
              Clear shopping cart
            </button>
          </div>

          {/* Summary Card */}
          <div className="space-y-6">
            <div className="bg-slate-800 border border-slate-700 rounded-3xl p-6 shadow-xl sticky top-24">
              <h3 className="text-xl font-bold text-white mb-6">Order Summary</h3>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal</span>
                  <span>Rs. {subtotal}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Service Fee</span>
                  <span>Rs. 50</span>
                </div>
                <div className="h-px bg-slate-700 my-2" />
                <div className="flex justify-between text-lg font-bold text-white">
                  <span>Total</span>
                  <span className="text-amber-500">Rs. {totalAmount}</span>
                </div>
              </div>
              
              <button 
                onClick={() => navigate('/shop/checkout')}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl transition-all shadow-lg shadow-indigo-500/20 active:scale-[0.98]"
              >
                Proceed to Checkout
              </button>
              
              <p className="text-[11px] text-center text-slate-500 mt-4 leading-relaxed">
                By proceeding, you agree to our terms of service. Product availability is confirmed upon payment.
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
