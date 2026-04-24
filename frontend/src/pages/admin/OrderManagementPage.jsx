import { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import {
  getAdminOrders,
  updateAdminOrderStatus
} from '../../api/adminApi';
import { useToast } from '../../hooks/useToast';

const STATUS_FLOW = ['PENDING', 'READY', 'COLLECTED', 'CANCELLED'];

export default function OrderManagementPage() {
  const { showToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const ordersRes = await getAdminOrders();
      setOrders(ordersRes.data);
    } catch (err) {
      showToast('Error', 'Failed to load orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await updateAdminOrderStatus(orderId, newStatus);
      showToast('Success', `Order marked as ${newStatus}`, 'success');
      fetchAll();
    } catch (err) {
      showToast('Error', 'Failed to update status', 'error');
    }
  };

  // Compute stats from orders
  const totalRevenue = orders.filter(o => o.status === 'COLLECTED').reduce((s, o) => s + (o.totalAmount || 0), 0);
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status === 'PENDING').length;
  const collectedOrders = orders.filter(o => o.status === 'COLLECTED').length;

  return (
    <AdminLayout>
      <div className="p-6 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Order Management</h1>
            <p className="text-gray-500 text-sm">Fulfill orders and track shop performance across all clubs.</p>
          </div>
          <button onClick={fetchAll} className="p-2 text-gray-400 hover:text-indigo-600 transition-colors text-xl" title="Refresh">
            🔄
          </button>
        </div>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <p className="text-xs font-bold text-gray-400 uppercase mb-1">Total Revenue</p>
            <p className="text-2xl font-black text-indigo-600">Rs. {totalRevenue}</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <p className="text-xs font-bold text-gray-400 uppercase mb-1">Total Orders</p>
            <p className="text-2xl font-black text-gray-800">{totalOrders}</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <p className="text-xs font-bold text-gray-400 uppercase mb-1">Pending</p>
            <p className="text-2xl font-black text-amber-500">{pendingOrders}</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <p className="text-xs font-bold text-gray-400 uppercase mb-1">Collected</p>
            <p className="text-2xl font-black text-green-500">{collectedOrders}</p>
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
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Order Details</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Student</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {orders.map(order => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-800 text-sm">#{order.id.slice(-6).toUpperCase()}</span>
                        <span className="text-xs text-gray-400">
                          {order.items.map(i => `${i.quantity}x ${i.productName}`).join(', ')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-gray-700">{order.studentName}</span>
                        <span className="text-[10px] text-indigo-400">{order.studentId}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-gray-900">Rs. {order.totalAmount}</span>
                        {order.paymentSlipUrl && (
                          <a
                            href={order.paymentSlipUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] text-indigo-500 hover:underline mt-1 flex items-center gap-1"
                          >
                            <span>📄</span> View Slip
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${order.status === 'PENDING' ? 'bg-amber-100 text-amber-600' :
                          order.status === 'READY' ? 'bg-indigo-100 text-indigo-600' :
                            order.status === 'COLLECTED' ? 'bg-green-100 text-green-600' :
                              'bg-gray-100 text-gray-600'
                        }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                        className="bg-gray-100 border-none rounded-lg text-xs font-bold px-2 py-1 text-gray-600 focus:ring-2 focus:ring-indigo-500"
                      >
                        {STATUS_FLOW.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-20 text-center text-gray-400 italic">No orders found in the database.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
