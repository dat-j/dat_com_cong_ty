import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import { orderService } from '../api/services';
import { format } from 'date-fns';

const UserDebt = () => {
  const [debtInfo, setDebtInfo] = useState({ totalDebt: 0, orderCount: 0 });
  const [debtOrders, setDebtOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDebtData();
  }, []);

  const fetchDebtData = async () => {
    try {
      setLoading(true);
      const [info, orders] = await Promise.all([
        orderService.getMyDebt(),
        orderService.getMyDebtOrders(),
      ]);
      setDebtInfo(info);
      setDebtOrders(orders);
    } catch (error) {
      console.error('Failed to fetch debt data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pay_later_approved: { label: 'Đã Duyệt', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.2)' },
      debt: { label: 'Đang Nợ', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.2)' },
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
        border: `1px solid ${config.color}40`
      }}>
        {config.label}
      </span>
    );
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0e27 0%, #1a1d35 50%, #252845 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Effect */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.03, 0.06, 0.03]
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
        style={{
          position: 'fixed',
          top: '10%',
          right: '10%',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(245, 158, 11, 0.4) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(80px)',
          zIndex: 0
        }}
      />

      <Navbar />

      <div className="container" style={{ paddingBottom: '3rem', position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
          style={{ padding: '2.5rem 1rem 2rem' }}
        >
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: '800',
            background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '0.75rem'
          }}>
            💰 Nợ Cần Thanh Toán
          </h1>
          <p style={{
            color: 'rgba(203, 213, 225, 0.8)',
            fontSize: '1.05rem'
          }}>
            Quản lý các khoản nợ của bạn
          </p>
        </motion.div>

        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center"
            style={{ padding: '4rem 0' }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              style={{ fontSize: '3rem', marginBottom: '1rem' }}
            >
              💰
            </motion.div>
            <p style={{ color: 'rgba(203, 213, 225, 0.7)' }}>Đang tải dữ liệu...</p>
          </motion.div>
        ) : (
          <>
            {/* Debt Summary Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              style={{
                padding: '2rem',
                borderRadius: '24px',
                background: debtInfo.totalDebt > 0
                  ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(249, 115, 22, 0.1) 100%)'
                  : 'linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(22, 163, 74, 0.1) 100%)',
                border: `1px solid ${debtInfo.totalDebt > 0 ? 'rgba(245, 158, 11, 0.3)' : 'rgba(34, 197, 94, 0.3)'}`,
                backdropFilter: 'blur(20px)',
                marginBottom: '2rem',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <p style={{ color: 'rgba(203, 213, 225, 0.8)', marginBottom: '1rem', fontSize: '1.1rem' }}>
                  Tổng Nợ Hiện Tại
                </p>
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  style={{
                    fontSize: '3rem',
                    fontWeight: '900',
                    color: debtInfo.totalDebt > 0 ? '#fbbf24' : '#22c55e',
                    marginBottom: '1rem'
                  }}
                >
                  {debtInfo.totalDebt.toLocaleString('vi-VN')}đ
                </motion.div>
                <p style={{ color: 'rgba(203, 213, 225, 0.7)', fontSize: '1rem' }}>
                  {debtInfo.orderCount > 0 ? `${debtInfo.orderCount} đơn hàng chưa thanh toán` : 'Không có nợ'}
                </p>
                
                {debtInfo.totalDebt > 100000 && (
                  <div style={{
                    marginTop: '1.5rem',
                    padding: '1rem',
                    borderRadius: '12px',
                    background: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid rgba(239, 68, 68, 0.3)'
                  }}>
                    <p style={{ color: '#fca5a5', fontSize: '0.95rem', margin: 0 }}>
                      ⚠️ Nợ cao! Vui lòng thanh toán sớm để tiếp tục đặt món
                    </p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Debt Orders List */}
            {debtOrders.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                  padding: '3rem',
                  borderRadius: '24px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(20px)',
                  textAlign: 'center'
                }}
              >
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
                <h3 style={{ color: '#c7d2fe', marginBottom: '0.5rem' }}>Không có nợ</h3>
                <p style={{ color: 'rgba(203, 213, 225, 0.6)' }}>
                  Bạn đã thanh toán hết tất cả các đơn hàng!
                </p>
              </motion.div>
            ) : (
              <div>
                <h2 style={{
                  fontSize: '1.5rem',
                  fontWeight: '700',
                  color: '#e0e7ff',
                  marginBottom: '1.5rem'
                }}>
                  Danh Sách Đơn Nợ
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {debtOrders.map((order, index) => (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      style={{
                        padding: '1.5rem',
                        borderRadius: '20px',
                        background: 'rgba(30, 41, 59, 0.6)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(245, 158, 11, 0.2)',
                        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)'
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
                            fontSize: '1.2rem',
                            fontWeight: '700',
                            color: '#f8fafc',
                            marginBottom: '0.5rem'
                          }}>
                            {order.menuItem.name}
                          </h4>
                          <p style={{
                            color: 'rgba(203, 213, 225, 0.6)',
                            fontSize: '0.9rem',
                            marginBottom: '0.5rem'
                          }}>
                            Ngày đặt: {format(new Date(order.orderDate), 'dd/MM/yyyy')}
                          </p>
                          {getStatusBadge(order.status)}
                        </div>
                        <div style={{
                          textAlign: 'right'
                        }}>
                          <div style={{
                            fontSize: '1.8rem',
                            fontWeight: '900',
                            color: '#fbbf24',
                            marginBottom: '0.5rem'
                          }}>
                            {order.menuItem.price.toLocaleString('vi-VN')}đ
                          </div>
                          {order.status === 'pay_later_approved' && (
                            <span style={{
                              fontSize: '0.85rem',
                              color: 'rgba(203, 213, 225, 0.6)'
                            }}>
                              Chờ chuyển sang nợ
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default UserDebt;
