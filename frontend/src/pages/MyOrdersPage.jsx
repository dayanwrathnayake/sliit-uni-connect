import { useState, useEffect } from 'react';
import shopApi from '../api/shopApi';
import PageLayout from '../components/layout/PageLayout';

const StatusBadge = ({ status }) => {
  const styles = {
    PENDING: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    READY: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
    COLLECTED: 'bg-green-500/10 text-green-500 border-green-500/20',
    CANCELLED: 'bg-red-500/10 text-red-500 border-red-500/20'
  };
  
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${styles[status]}`}>
      {status}
    </span>
  );
};

export default function MyOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data } = await shopApi.getMyOrders();
      setOrders(data.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (err) {
      console.error("Failed to fetch orders", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout title="My Orders">
      <div className="max-w-4xl mx-auto space-y-6">
        {loading ? (
          <div className="space-y-4">
            {[1, 2].map(i => (
              <div key={i} className="h-40 bg-slate-800 rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : orders.length > 0 ? (
          orders.map(order => (
            <div key={order.id} className="bg-slate-800 border border-slate-700 rounded-3xl overflow-hidden shadow-xl">
              <div className="bg-slate-900/50 px-6 py-4 flex flex-wrap justify-between items-center gap-4">
                <div className="flex gap-4 items-center">
                  <div className="text-sm">
                    <p className="text-slate-500 font-medium">Order ID</p>
                    <p className="text-white font-mono uppercase text-xs">#{order.id.slice(-8)}</p>
                  </div>
                  <div className="h-8 w-px bg-slate-700 mx-2" />
                  <div className="text-sm">
                    <p className="text-slate-500 font-medium">Placed on</p>
                    <p className="text-white">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <StatusBadge status={order.status} />
              </div>
              
              <div className="p-6 space-y-4">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center">
                    <div className="flex gap-3 items-center">
                      <div className="h-10 w-10 bg-slate-900 rounded-lg flex items-center justify-center text-lg">🎁</div>
                      <div>
                        <p className="text-sm font-bold text-white">{item.productName}</p>
                        <p className="text-xs text-slate-500">Qty: {item.quantity} x Rs. {item.price}</p>
                      </div>
                    </div>
                    <p className="text-sm font-bold text-white">Rs. {item.price * item.quantity}</p>
                  </div>
                ))}
              </div>
              
              <div className="bg-slate-900/30 px-6 py-4 border-t border-slate-700 flex justify-between items-center">
                <p className="text-sm text-slate-400">Merchant: <span className="text-slate-200">{order.clubName}</span></p>
                <p className="text-lg font-black text-amber-500">Total: Rs. {order.totalAmount}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-20 bg-slate-800/50 rounded-3xl border-2 border-dashed border-slate-700">
            <p className="text-5xl mb-4">📦</p>
            <h3 className="text-xl font-bold text-white">No orders yet</h3>
            <p className="text-slate-400 mt-2">Your purchase history will appear here.</p>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
