import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import Button from '../Button';

const DebtUserCard = ({ user, totalDebt, orders = [], onMarkPaid }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        borderRadius: '20px',
        background: 'rgba(30, 41, 59, 0.6)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(245, 158, 11, 0.3)',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
        marginBottom: '1rem',
        overflow: 'hidden'
      }}
    >
      {/* Header */}
      <div
        onClick={() => setExpanded(!expanded)}
        style={{
          padding: '1.5rem',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
          flexWrap: 'wrap'
        }}
      >
        <div style={{ flex: 1, minWidth: '200px' }}>
          <h4 style={{
            fontSize: '1.2rem',
            fontWeight: '700',
            color: '#f8fafc',
            marginBottom: '0.5rem'
          }}>
            {user.fullName || user.username}
          </h4>
          <p style={{
            color: 'rgba(203, 213, 225, 0.6)',
            fontSize: '0.9rem',
            margin: 0
          }}>
            {orders.length} đơn hàng chưa thanh toán
          </p>
        </div>
        
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <div style={{
            fontSize: '1.8rem',
            fontWeight: '900',
            color: '#fbbf24'
          }}>
            {totalDebt.toLocaleString('vi-VN')}đ
          </div>
          
          <motion.div
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.3 }}
            style={{
              fontSize: '1.5rem',
              color: 'rgba(203, 213, 225, 0.6)'
            }}
          >
            ▼
          </motion.div>
        </div>
      </div>

      {/* Expandable Order List */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              borderTop: '1px solid rgba(245, 158, 11, 0.2)',
              padding: '1rem 1.5rem',
              background: 'rgba(0, 0, 0, 0.2)'
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {orders.map((order) => (
                <div
                  key={order.id}
                  style={{
                    padding: '1rem',
                    borderRadius: '12px',
                    background: 'rgba(30, 41, 59, 0.5)',
                    border: '1px solid rgba(245, 158, 11, 0.2)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '1rem',
                    flexWrap: 'wrap'
                  }}
                >
                  <div style={{ flex: 1, minWidth: '150px' }}>
                    <p style={{
                      color: '#f8fafc',
                      fontWeight: '600',
                      margin: '0 0 0.25rem 0'
                    }}>
                      {order.menuItem?.name}
                    </p>
                    <p style={{
                      color: 'rgba(203, 213, 225, 0.6)',
                      fontSize: '0.85rem',
                      margin: 0
                    }}>
                      {order.orderDate ? format(new Date(order.orderDate), 'dd/MM/yyyy') : 'N/A'}
                    </p>
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem'
                  }}>
                    <div style={{
                      fontSize: '1.2rem',
                      fontWeight: '800',
                      color: '#fbbf24'
                    }}>
                      {order.menuItem?.price?.toLocaleString('vi-VN')}đ
                    </div>
                    
                    <Button
                      variant="success"
                      onClick={(e) => {
                        e.stopPropagation();
                        onMarkPaid(order.id);
                      }}
                    >
                      ✓ Đã trả
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default DebtUserCard;
