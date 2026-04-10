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
  return <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${styles[status]}`}>{status}</span>;
};

export default function OrderManagement() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Placeholder clubId. Real app would fetch the clubManaged for the user.
    fetchOrders("65f1a2b3c4d5e6f7a8b9c0d1");
  }, []);

  const fetchOrders = async (clubId) => {
    try {
      const { data } = await shopApi.getClubOrders(clubId);
      setOrders(data.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId, status) => {
    try {
      await shopApi.updateOrderStatus(orderId, status);
      fetchOrders("65f1a2b3c4d5e6f7a8b9c0d1");
    } catch (err) {
      alert("Failed to update status");
    }
  };

  return (
    <PageLayout title="Order Management">
      <div className="bg-slate-800 border border-slate-700 rounded-3xl overflow-hidden shadow-xl">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-900/50 border-b border-slate-700">
              <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Order Info</th>
              <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Customer</th>
              <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Amount</th>
              <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Status</th>
              <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {orders.map(order => (
              <tr key={order.id} className="hover:bg-slate-700/30 transition-colors">
                <td className="px-6 py-4">
                   <p className="text-xs font-mono text-amber-500">#{order.id.slice(-8)}</p>
                   <p className="text-xs text-slate-400 mt-1">{new Date(order.createdAt).toLocaleString()}</p>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm font-bold text-white">{order.studentName}</p>
                </td>
                <td className="px-6 py-4 text-sm font-black text-white">Rs. {order.totalAmount}</td>
                <td className="px-6 py-4">
                  <StatusBadge status={order.status} />
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  {order.status === 'PENDING' && (
                    <button 
                      onClick={() => updateStatus(order.id, 'READY')}
                      className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg font-bold transition-all"
                    >
                      Ready for Collection
                    </button>
                  )}
                  {order.status === 'READY' && (
                    <button 
                      onClick={() => updateStatus(order.id, 'COLLECTED')}
                      className="text-xs bg-green-600 hover:bg-green-500 text-white px-3 py-1.5 rounded-lg font-bold transition-all"
                    >
                      Mark Collected
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && !loading && (
          <div className="py-20 text-center text-slate-500">
            No incoming orders yet.
          </div>
        )}
      </div>
    </PageLayout>
  );
}
