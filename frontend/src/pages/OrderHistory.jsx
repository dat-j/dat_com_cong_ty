import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import GlassCard from '../components/GlassCard';
import { orderService } from '../api/services';
import { format } from 'date-fns';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrderHistory();
  }, []);

  const fetchOrderHistory = async () => {
    try {
      setLoading(true);
      const data = await orderService.getUserOrderHistory();
      setOrders(data);
    } catch (error) {
      console.error('Failed to fetch order history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { class: 'badge-pending', text: 'Chờ xử lý' },
      paid: { class: 'badge-paid', text: 'Đã thanh toán' },
      confirmed: { class: 'badge-confirmed', text: 'Đã xác nhận' },
      cancelled: { class: 'badge-cancelled', text: 'Đã hủy' },
    };
    const statusInfo = statusMap[status] || statusMap.pending;
    return <span className={`badge ${statusInfo.class}`}>{statusInfo.text}</span>;
  };

  const groupOrdersByDate = (orders) => {
    const grouped = {};
    orders.forEach(order => {
      const date = format(new Date(order.orderDate), 'dd/MM/yyyy');
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(order);
    });
    return grouped;
  };

  const groupedOrders = groupOrdersByDate(orders);

  return (
    <div>
      <Navbar />
      
      <div className="container" style={{ paddingBottom: '3rem' }}>
        <div className="text-center mb-xl slide-up">
          <h1>📋 Lịch Sử Đặt Hàng</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Xem lại các đơn hàng của bạn
          </p>
        </div>

        {loading ? (
          <div className="text-center pulse">
            <p>Đang tải lịch sử...</p>
          </div>
        ) : orders.length === 0 ? (
          <GlassCard className="text-center">
            <h3>Chưa có đơn hàng nào</h3>
            <p style={{ color: 'var(--text-secondary)' }}>
              Các đơn hàng của bạn sẽ hiển thị ở đây.
            </p>
          </GlassCard>
        ) : (
          <div>
            {Object.entries(groupedOrders).map(([date, dateOrders], groupIndex) => (
              <div key={date} className="mb-xl">
                <h3 className="mb-lg" style={{ color: 'var(--text-secondary)' }}>
                  {date}
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                  {dateOrders.map((order, index) => (
                    <GlassCard 
                      key={order.id}
                      className="slide-up"
                      style={{ animationDelay: `${(groupIndex * 0.1) + (index * 0.05)}s` }}
                    >
                      <div className="flex justify-between items-center" style={{ flexWrap: 'wrap', gap: 'var(--spacing-md)' }}>
                        <div style={{ flex: 1, minWidth: '200px' }}>
                          <h4 style={{ marginBottom: 'var(--spacing-xs)' }}>
                            {order.menuItem?.name || 'Món ăn'}
                          </h4>
                          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
                            {format(new Date(order.createdAt), 'HH:mm')}
                          </p>
                        </div>
                        
                        <div className="text-center">
                          <p style={{ 
                            fontSize: '1.25rem', 
                            fontWeight: '700', 
                            margin: 0,
                            color: 'var(--text-primary)' 
                          }}>
                            {order.menuItem?.price?.toLocaleString('vi-VN')}đ
                          </p>
                        </div>
                        
                        <div>
                          {getStatusBadge(order.status)}
                        </div>
                      </div>
                    </GlassCard>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistory;
