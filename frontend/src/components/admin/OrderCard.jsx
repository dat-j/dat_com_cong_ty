import { motion } from 'framer-motion';
import { format } from 'date-fns';
import Button from '../Button';

const OrderCard = ({ order, actions = [], index = 0 }) => {
  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { label: 'Chờ xử lý', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.2)' },
      paid: { label: 'Đã thanh toán', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.2)' },
      confirmed: { label: 'Đã xác nhận', color: '#22c55e', bg: 'rgba(34, 197, 94, 0.2)' },
      cancelled: { label: 'Đã hủy', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.2)' },
      pay_later_pending: { label: 'Chờ duyệt nợ', color: '#f97316', bg: 'rgba(249, 115, 22, 0.2)' },
      pay_later_approved: { label: 'Đã duyệt nợ', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.2)' },
      debt: { label: 'Đang nợ', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.2)' }
    };
    const config = statusConfig[status] || { label: status, color: '#6b7280', bg: 'rgba(107, 114, 128, 0.2)' };
    
    return (
      <span style={{
        padding: '0.4rem 0.8rem',
        borderRadius: '8px',
        fontSize: '0.85rem',
        fontWeight: '700',
        color: config.color,
        background: config.bg,
        border: `1px solid ${config.color}40`,
        display: 'inline-block'
      }}>
        {config.label}
      </span>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      style={{
        padding: '1.5rem',
        borderRadius: '20px',
        background: 'rgba(30, 41, 59, 0.6)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(139, 92, 246, 0.2)',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
        marginBottom: '1rem'
      }}
    >
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <h4 style={{
            fontSize: '1.15rem',
            fontWeight: '700',
            color: '#f8fafc',
            marginBottom: '0.5rem'
          }}>
            {order.user?.fullName || order.user?.username || 'N/A'}
          </h4>
          <p style={{
            color: 'rgba(203, 213, 225, 0.8)',
            margin: '0.25rem 0',
            fontSize: '0.95rem'
          }}>
            {order.menuItem?.name || 'N/A'}
          </p>
          <p style={{
            color: 'rgba(203, 213, 225, 0.5)',
            fontSize: '0.85rem',
            margin: '0.25rem 0'
          }}>
            {order.createdAt ? format(new Date(order.createdAt), 'dd/MM/yyyy HH:mm') : 
             order.orderDate ? format(new Date(order.orderDate), 'dd/MM/yyyy') : 'N/A'}
          </p>
          <div style={{ marginTop: '0.5rem' }}>
            {getStatusBadge(order.status)}
          </div>
        </div>
        
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: '0.5rem'
        }}>
          <div style={{
            fontSize: '1.5rem',
            fontWeight: '900',
            color: '#22c55e',
            marginBottom: '0.5rem'
          }}>
            {order.menuItem?.price?.toLocaleString('vi-VN') || '0'}đ
          </div>
          
          {actions.length > 0 && (
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {actions.map((action, idx) => (
                <Button
                  key={idx}
                  variant={action.variant || 'primary'}
                  onClick={() => action.onClick(order)}
                  disabled={action.disabled}
                >
                  {action.label}
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default OrderCard;
