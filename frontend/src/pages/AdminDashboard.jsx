import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';
import GlassCard from '../components/GlassCard';
import Input from '../components/Input';
import Button from '../components/Button';
import OrderCard from '../components/admin/OrderCard';
import { menuService, orderService, settingsService } from '../api/services';
import { format } from 'date-fns';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('pending');
  const [menuItems, setMenuItems] = useState([{ name: '', price: '' }]);
  const [bulkText, setBulkText] = useState('');
  const [inputMode, setInputMode] = useState('bulk');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Orders data
  const [pendingOrders, setPendingOrders] = useState([]);
  const [confirmedOrders, setConfirmedOrders] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [userDebtData, setUserDebtData] = useState([]);
  const [showPrintableList, setShowPrintableList] = useState(false);
  
  // Ordering status
  const [orderingEnabled, setOrderingEnabled] = useState(true);
  const [togglingStatus, setTogglingStatus] = useState(false);

  useEffect(() => {
    fetchData();
    fetchOrderingStatus();
  }, [activeTab]);
  
  const fetchOrderingStatus = async () => {
    try {
      const data = await settingsService.getOrderingStatus();
      setOrderingEnabled(data.enabled);
    } catch (error) {
      console.error('Failed to fetch ordering status:', error);
    }
  };
  
  const toggleOrderingStatus = async () => {
    try {
      setTogglingStatus(true);
      const newStatus = !orderingEnabled;
      await settingsService.updateOrderingStatus(newStatus);
      setOrderingEnabled(newStatus);
      setMessage({ 
        type: 'success', 
        text: newStatus ? '✅ Đã mở đặt cơm!' : '🔒 Đã đóng đặt cơm!' 
      });
    } catch (error) {
      setMessage({ type: 'error', text: 'Không thể thay đổi trạng thái đặt cơm.' });
    } finally {
      setTogglingStatus(false);
    }
  };

  const fetchData = async () => {
    try {
      if (activeTab === 'pending') {
        await fetchPendingOrders();
      } else if (activeTab === 'confirmed') {
        await fetchConfirmedOrders();
      } else if (activeTab === 'history') {
        await fetchAllOrders();
      } else if (activeTab === 'debt_tracking') {
        await fetchUserDebtData();
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  const fetchPendingOrders = async () => {
    const data = await orderService.getPendingOrders();
    setPendingOrders(data);
  };

  const fetchConfirmedOrders = async () => {
    try {
      // Get both confirmed and debt orders
      const allData = await orderService.getAllOrders();
      const confirmed = allData.filter(order => 
        order.status === 'confirmed' || order.status === 'debt'
      );
      setConfirmedOrders(confirmed);
    } catch (error) {
      console.error('Failed to fetch confirmed orders:', error);
    }
  };

  const fetchAllOrders = async () => {
    const data = await orderService.getAllOrders();
    setAllOrders(data);
  };

  const fetchUserDebtData = async () => {
    try {
      const allData = await orderService.getAllOrders();
      
      // Group orders by user and calculate debt/paid
      const userMap = {};
      
      allData.forEach(order => {
        const userId = order.user?.id;
        if (!userId) return;
        
        if (!userMap[userId]) {
          userMap[userId] = {
            user: order.user,
            totalDebt: 0,
            totalPaid: 0,
            debtOrders: [],
            paidOrders: [],
            allOrders: []
          };
        }
        
        userMap[userId].allOrders.push(order);
        
        // Calculate debt and paid amounts
        const price = Number(order.menuItem?.price) || 0; // Convert to number
        
        if (order.status === 'debt' || order.status === 'pay_later_approved') {
          userMap[userId].totalDebt += price;
          userMap[userId].debtOrders.push(order);
        } else if (order.status === 'confirmed') {
          userMap[userId].totalPaid += price;
          userMap[userId].paidOrders.push(order);
        }
      });
      
      setUserDebtData(Object.values(userMap));
    } catch (error) {
      console.error('Failed to fetch user debt data:', error);
    }
  };

  const handleConfirmOrder = async (order) => {
    try {
      // If pay_later, set status to debt, otherwise confirmed
      const newStatus = order.paymentMethod === 'pay_later' ? 'debt' : 'confirmed';
      await orderService.updateOrderStatus(order.id, newStatus);
      
      setMessage({ 
        type: 'success', 
        text: `Đã xác nhận đơn hàng${order.paymentMethod === 'pay_later' ? ' (ghi nợ)' : ''}!` 
      });
      
      fetchPendingOrders();
      fetchConfirmedOrders();
    } catch (error) {
      setMessage({ type: 'error', text: 'Không thể xác nhận đơn hàng.' });
    }
  };

  const handleRejectOrder = async (order) => {
    try {
      await orderService.updateOrderStatus(order.id, 'cancelled');
      setMessage({ type: 'success', text: 'Đã từ chối đơn hàng.' });
      fetchPendingOrders();
    } catch (error) {
      setMessage({ type: 'error', text: 'Không thể từ chối đơn hàng.' });
    }
  };

  const handleConfirmDebtPayment = async (order) => {
    try {
      await orderService.updateOrderStatus(order.id, 'confirmed');
      setMessage({ type: 'success', text: 'Đã xác nhận thanh toán!' });
      fetchConfirmedOrders();
      fetchUserDebtData(); // Also refresh debt tracking
    } catch (error) {
      setMessage({ type: 'error', text: 'Không thể xác nhận thanh toán.' });
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm('Bạn có chắc muốn xóa đơn hàng này?')) return;
    
    try {
      await orderService.deleteOrder(orderId);
      setMessage({ type: 'success', text: 'Đã xóa đơn hàng.' });
      fetchData(); // Refresh current tab
    } catch (error) {
      setMessage({ type: 'error', text: 'Không thể xóa đơn hàng.' });
    }
  };

  // Menu management functions
  const parseBulkText = (text) => {
    const lines = text.split('\n').filter(line => line.trim() !== '');
    const items = [];
    
    lines.forEach(line => {
      const trimmedLine = line.trim();
      const lastSpaceIndex = trimmedLine.lastIndexOf(' ');
      
      if (lastSpaceIndex > 0) {
        const name = trimmedLine.substring(0, lastSpaceIndex).trim();
        const priceStr = trimmedLine.substring(lastSpaceIndex + 1).trim();
        const price = parseFloat(priceStr);
        
        if (name && !isNaN(price)) {
          items.push({ name, price });
        }
      }
    });
    
    return items;
  };

  const handleSubmitMenu = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      let items = [];
      
      if (inputMode === 'bulk') {
        items = parseBulkText(bulkText);
        
        if (items.length === 0) {
          setMessage({ type: 'error', text: 'Vui lòng nhập danh sách món ăn theo định dạng: Tên món Giá' });
          setLoading(false);
          return;
        }
      } else {
        items = menuItems
          .filter(item => item.name && item.price)
          .map(item => ({
            name: item.name,
            price: parseFloat(item.price)
          }));

        if (items.length === 0) {
          setMessage({ type: 'error', text: 'Vui lòng nhập ít nhất một món ăn' });
          setLoading(false);
          return;
        }
      }

      await menuService.createMenuItems(items);
      setMessage({ type: 'success', text: `Đã thêm ${items.length} món ăn thành công!` });
      setMenuItems([{ name: '', price: '' }]);
      setBulkText('');
    } catch (error) {
      setMessage({ type: 'error', text: 'Không thể thêm menu. Vui lòng thử lại.' });
    } finally {
      setLoading(false);
    }
  };

  const handleAddMenuItem = () => {
    setMenuItems([...menuItems, { name: '', price: '' }]);
  };

  const handleRemoveMenuItem = (index) => {
    const updated = menuItems.filter((_, i) => i !== index);
    setMenuItems(updated.length > 0 ? updated : [{ name: '', price: '' }]);
  };

  const handleMenuItemChange = (index, field, value) => {
    const updated = [...menuItems];
    updated[index][field] = value;
    setMenuItems(updated);
  };

  const tabs = [
    { id: 'pending', label: '🔔 Chờ Xác Nhận', badge: pendingOrders.length },
    { id: 'confirmed', label: '✅ Đã Xác Nhận', badge: confirmedOrders.length },
    { id: 'debt_tracking', label: '💰 Theo Dõi Nợ' },
    { id: 'menu', label: '📝 Menu' },
    { id: 'history', label: '📋 Lịch Sử' }
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0a0e27 0%, #1a1d35 50%, #252845 100%)' }}>
      <Navbar />
      
      <div className="container" style={{ paddingBottom: '3rem' }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
          style={{ marginBottom: '2rem' }}
        >
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: '900',
            background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '0.5rem'
          }}>
            ⚙️ Admin Dashboard
          </h1>
          <p style={{ color: 'rgba(203, 213, 225, 0.7)' }}>
            Quản lý đơn hàng và menu
          </p>
        </motion.div>

        {/* Ordering Status Toggle */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ 
            maxWidth: '600px', 
            margin: '0 auto 2rem',
            textAlign: 'center'
          }}
        >
          <div style={{
            padding: '1.25rem',
            borderRadius: '16px',
            background: orderingEnabled 
              ? 'rgba(34, 197, 94, 0.1)' 
              : 'rgba(239, 68, 68, 0.1)',
            border: `2px solid ${orderingEnabled ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
            backdropFilter: 'blur(10px)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              flexWrap: 'wrap'
            }}>
              <div style={{ textAlign: 'left', flex: 1 }}>
                <div style={{
                  fontSize: '1.1rem',
                  fontWeight: '700',
                  color: '#e0e7ff',
                  marginBottom: '0.25rem'
                }}>
                  {orderingEnabled ? '✅ Đặt cơm đang mở' : '🔒 Đặt cơm đã đóng'}
                </div>
                <div style={{
                  fontSize: '0.9rem',
                  color: 'rgba(203, 213, 225, 0.7)'
                }}>
                  {orderingEnabled 
                    ? 'Người dùng có thể đặt cơm' 
                    : 'Người dùng không thể đặt cơm'}
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleOrderingStatus}
                disabled={togglingStatus}
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '12px',
                  border: 'none',
                  background: orderingEnabled
                    ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                    : 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                  color: '#fff',
                  fontSize: '1rem',
                  fontWeight: '700',
                  cursor: togglingStatus ? 'not-allowed' : 'pointer',
                  opacity: togglingStatus ? 0.6 : 1,
                  boxShadow: orderingEnabled
                    ? '0 4px 16px rgba(239, 68, 68, 0.4)'
                    : '0 4px 16px rgba(34, 197, 94, 0.4)',
                  minWidth: '140px'
                }}
              >
                {togglingStatus ? '⏳' : orderingEnabled ? '🔒 Đóng' : '✅ Mở'}
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          marginBottom: '2rem',
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '0.75rem 1.5rem',
                borderRadius: '12px',
                border: 'none',
                background: activeTab === tab.id
                  ? 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)'
                  : 'rgba(255, 255, 255, 0.05)',
                color: activeTab === tab.id ? '#fff' : 'rgba(203, 213, 225, 0.7)',
                fontWeight: '700',
                cursor: 'pointer',
                backdropFilter: 'blur(10px)',
                position: 'relative'
              }}
            >
              {tab.label}
              {tab.badge > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-8px',
                  right: '-8px',
                  background: '#ef4444',
                  color: '#fff',
                  fontSize: '0.75rem',
                  fontWeight: '800',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '10px',
                  minWidth: '20px',
                  textAlign: 'center'
                }}>
                  {tab.badge}
                </span>
              )}
            </motion.button>
          ))}
        </div>

        {/* Messages */}
        <AnimatePresence>
          {message.text && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              style={{
                padding: '1rem 1.5rem',
                borderRadius: '12px',
                background: message.type === 'error' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(34, 197, 94, 0.15)',
                border: `1px solid ${message.type === 'error' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(34, 197, 94, 0.3)'}`,
                color: message.type === 'error' ? '#fca5a5' : '#86efac',
                maxWidth: '800px',
                margin: '0 auto 2rem',
                textAlign: 'center',
                fontWeight: '500'
              }}
            >
              {message.text}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {/* Pending Orders Tab */}
          {activeTab === 'pending' && (
            <motion.div
              key="pending"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              style={{ maxWidth: '1000px', margin: '0 auto' }}
            >
              <h2 style={{
                fontSize: '1.75rem',
                fontWeight: '700',
                color: '#e0e7ff',
                marginBottom: '1.5rem'
              }}>
                🔔 Đơn Hàng Chờ Xác Nhận ({pendingOrders.length})
              </h2>
              
              {pendingOrders.length === 0 ? (
                <GlassCard style={{ textAlign: 'center', padding: '3rem' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
                  <p style={{ color: 'rgba(203, 213, 225, 0.7)', margin: 0 }}>
                    Không có đơn hàng chờ xác nhận
                  </p>
                </GlassCard>
              ) : (
                <div>
                  {pendingOrders.map((order, index) => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      index={index}
                      actions={[
                        {
                          label: '✓ Xác nhận',
                          variant: 'success',
                          onClick: handleConfirmOrder
                        },
                        {
                          label: '✗ Từ chối',
                          variant: 'danger',
                          onClick: handleRejectOrder
                        },
                        {
                          label: '🗑️ Xóa',
                          variant: 'secondary',
                          onClick: (order) => handleDeleteOrder(order.id)
                        }
                      ]}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Confirmed Orders Tab */}
          {activeTab === 'confirmed' && (
            <motion.div
              key="confirmed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              style={{ maxWidth: '1000px', margin: '0 auto' }}
            >
              <h2 style={{
                fontSize: '1.75rem',
                fontWeight: '700',
                color: '#e0e7ff',
                marginBottom: '1.5rem'
              }}>
                ✅ Đơn Hàng Đã Xác Nhận ({confirmedOrders.length})
              </h2>
              
              <div style={{
                padding: '1rem',
                marginBottom: '1.5rem',
                borderRadius: '12px',
                background: 'rgba(34, 197, 94, 0.1)',
                border: '1px solid rgba(34, 197, 94, 0.3)'
              }}>
                <p style={{ color: 'rgba(134, 239, 172, 0.9)', margin: 0, fontSize: '0.95rem' }}>
                  📋 Danh sách này sẵn sàng để gửi cho quán ăn
                </p>
              </div>
              
              {confirmedOrders.length === 0 ? (
                <GlassCard style={{ textAlign: 'center', padding: '3rem' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📦</div>
                  <p style={{ color: 'rgba(203, 213, 225, 0.7)', margin: 0 }}>
                    Chưa có đơn hàng được xác nhận
                  </p>
                </GlassCard>
              ) : (
                <div>
                  {confirmedOrders.map((order, index) => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      index={index}
                      actions={[
                        ...(order.status === 'debt' || order.status === 'pay_later_approved' ? [{
                          label: '💵 Xác nhận đã trả',
                          variant: 'success',
                          onClick: handleConfirmDebtPayment
                        }] : []),
                        {
                          label: '🗑️ Xóa',
                          variant: 'danger',
                          onClick: (order) => handleDeleteOrder(order.id)
                        }
                      ]}
                    />
                  ))}
                </div>
              )}
              
              {/* Export Button */}
              {confirmedOrders.length > 0 && (
                <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowPrintableList(true)}
                    style={{
                      padding: '1rem 2rem',
                      borderRadius: '16px',
                      border: 'none',
                      background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                      color: '#fff',
                      fontSize: '1.1rem',
                      fontWeight: '800',
                      cursor: 'pointer',
                      boxShadow: '0 4px 20px rgba(34, 197, 94, 0.4)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      margin: '0 auto'
                    }}
                  >
                    <span style={{ fontSize: '1.5rem' }}>📋</span>
                    Xuất Danh Sách Gửi Quán
                  </motion.button>
                </div>
              )}
            </motion.div>
          )}

          {/* Debt Tracking Tab */}
          {activeTab === 'debt_tracking' && (
            <motion.div
              key="debt_tracking"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              style={{ maxWidth: '1200px', margin: '0 auto' }}
            >
              <h2 style={{
                fontSize: '1.75rem',
                fontWeight: '700',
                color: '#e0e7ff',
                marginBottom: '1.5rem'
              }}>
                💰 Theo Dõi Nợ Người Dùng
              </h2>
              
              {userDebtData.length === 0 ? (
                <GlassCard style={{ textAlign: 'center', padding: '3rem' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
                  <p style={{ color: 'rgba(203, 213, 225, 0.7)', margin: 0 }}>
                    Chưa có dữ liệu
                  </p>
                </GlassCard>
              ) : (
                <GlassCard style={{ padding: '0', overflow: 'hidden' }}>
                  {/* Summary Statistics */}
                  <div style={{
                    padding: '1.5rem',
                    background: 'rgba(139, 92, 246, 0.1)',
                    borderBottom: '2px solid rgba(139, 92, 246, 0.3)',
                    display: 'flex',
                    gap: '2rem',
                    justifyContent: 'center'
                  }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '0.9rem', color: 'rgba(203, 213, 225, 0.7)', marginBottom: '0.5rem' }}>
                        Tổng số người dùng
                      </div>
                      <div style={{ fontSize: '2rem', fontWeight: '900', color: '#a5b4fc' }}>
                        {userDebtData.length}
                      </div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '0.9rem', color: 'rgba(203, 213, 225, 0.7)', marginBottom: '0.5rem' }}>
                        Tổng đã thu
                      </div>
                      <div style={{ fontSize: '2rem', fontWeight: '900', color: '#86efac' }}>
                        {userDebtData.reduce((sum, u) => sum + u.totalPaid, 0).toLocaleString('vi-VN')}.000đ
                      </div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '0.9rem', color: 'rgba(203, 213, 225, 0.7)', marginBottom: '0.5rem' }}>
                        Tổng nợ chưa thu
                      </div>
                      <div style={{ fontSize: '2rem', fontWeight: '900', color: '#fb923c' }}>
                        {userDebtData.reduce((sum, u) => sum + u.totalDebt, 0).toLocaleString('vi-VN')}.000đ
                      </div>
                    </div>
                  </div>

                  {/* User Table */}
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{
                      width: '100%',
                      borderCollapse: 'collapse'
                    }}>
                      <thead>
                        <tr style={{
                          background: 'rgba(139, 92, 246, 0.15)',
                          borderBottom: '2px solid rgba(139, 92, 246, 0.3)'
                        }}>
                          <th style={{ 
                            padding: '1rem', 
                            textAlign: 'left', 
                            color: '#c7d2fe', 
                            fontWeight: '700',
                            fontSize: '1rem'
                          }}>
                            👤 Tên người dùng
                          </th>
                          <th style={{ 
                            padding: '1rem', 
                            textAlign: 'right', 
                            color: '#c7d2fe', 
                            fontWeight: '700',
                            fontSize: '1rem'
                          }}>
                            💵 Tổng chi
                          </th>
                          <th style={{ 
                            padding: '1rem', 
                            textAlign: 'right', 
                            color: '#c7d2fe', 
                            fontWeight: '700',
                            fontSize: '1rem'
                          }}>
                            💰 Tổng nợ
                          </th>
                          <th style={{ 
                            padding: '1rem', 
                            textAlign: 'center',
                            color: '#c7d2fe', 
                            fontWeight: '700',
                            fontSize: '1rem',
                            width: '120px'
                          }}>
                            Thao tác
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {userDebtData
                          .sort((a, b) => b.totalDebt - a.totalDebt) // Sort by debt descending
                          .map((userData, index) => (
                          <motion.tr
                            key={userData.user.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.03 }}
                            style={{
                              borderBottom: '1px solid rgba(139, 92, 246, 0.1)',
                              background: index % 2 === 0 ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.1)',
                              cursor: 'pointer',
                              transition: 'background 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(139, 92, 246, 0.15)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = index % 2 === 0 ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.1)'}
                          >
                            <td style={{ padding: '1rem' }}>
                              <div>
                                <div style={{ 
                                  fontSize: '1.1rem', 
                                  fontWeight: '700', 
                                  color: '#e0e7ff',
                                  marginBottom: '0.25rem'
                                }}>
                                  {userData.user.fullName}
                                </div>
                                <div style={{ fontSize: '0.85rem', color: 'rgba(203, 213, 225, 0.5)' }}>
                                  {userData.user.email}
                                </div>
                              </div>
                            </td>
                            <td style={{ 
                              padding: '1rem', 
                              textAlign: 'right',
                              fontSize: '1.15rem',
                              fontWeight: '700',
                              color: '#86efac'
                            }}>
                              {(userData.totalPaid + userData.totalDebt).toLocaleString('vi-VN')}.000đ
                            </td>
                            <td style={{ 
                              padding: '1rem', 
                              textAlign: 'right'
                            }}>
                              {userData.totalDebt > 0 ? (
                                <span style={{
                                  fontSize: '1.15rem',
                                  fontWeight: '900',
                                  color: '#fb923c'
                                }}>
                                  {userData.totalDebt.toLocaleString('vi-VN')}.000đ
                                </span>
                              ) : (
                                <span style={{
                                  fontSize: '1rem',
                                  color: 'rgba(134, 239, 172, 0.7)'
                                }}>
                                  Không nợ
                                </span>
                              )}
                            </td>
                            <td style={{ padding: '1rem', textAlign: 'center' }}>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                  // Toggle expansion - we'll use a simple approach
                                  const row = document.getElementById(`detail-${userData.user.id}`);
                                  if (row) {
                                    row.style.display = row.style.display === 'none' ? 'table-row' : 'none';
                                  }
                                }}
                                style={{
                                  padding: '0.5rem 1rem',
                                  borderRadius: '8px',
                                  border: '1px solid rgba(139, 92, 246, 0.3)',
                                  background: 'rgba(139, 92, 246, 0.2)',
                                  color: '#c7d2fe',
                                  fontSize: '0.9rem',
                                  fontWeight: '600',
                                  cursor: 'pointer'
                                }}
                              >
                                📋 Chi tiết
                              </motion.button>
                            </td>
                          </motion.tr>
                        ))}
                        
                        {/* Detail rows (hidden by default) */}
                        {userDebtData.map((userData) => (
                          <tr 
                            key={`detail-${userData.user.id}`}
                            id={`detail-${userData.user.id}`}
                            style={{ display: 'none' }}
                          >
                            <td colSpan="4" style={{ 
                              padding: '1.5rem',
                              background: 'rgba(139, 92, 246, 0.05)',
                              borderBottom: '2px solid rgba(139, 92, 246, 0.2)'
                            }}>
                              <h4 style={{ 
                                color: '#c7d2fe', 
                                marginBottom: '1rem',
                                fontSize: '1.1rem',
                                fontWeight: '700'
                              }}>
                                📋 Lịch sử đặt món của {userData.user.name}
                              </h4>
                              <table style={{
                                width: '100%',
                                borderCollapse: 'collapse',
                                fontSize: '0.9rem'
                              }}>
                                <thead>
                                  <tr style={{
                                    background: 'rgba(99, 102, 241, 0.1)',
                                    borderBottom: '1px solid rgba(99, 102, 241, 0.2)'
                                  }}>
                                    <th style={{ padding: '0.75rem', textAlign: 'left', color: '#a5b4fc', fontWeight: '600' }}>
                                      Món ăn
                                    </th>
                                    <th style={{ padding: '0.75rem', textAlign: 'left', color: '#a5b4fc', fontWeight: '600' }}>
                                      Ngày đặt
                                    </th>
                                    <th style={{ padding: '0.75rem', textAlign: 'right', color: '#a5b4fc', fontWeight: '600' }}>
                                      Số tiền
                                    </th>
                                    <th style={{ padding: '0.75rem', textAlign: 'center', color: '#a5b4fc', fontWeight: '600' }}>
                                      Trạng thái
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {userData.allOrders
                                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                                    .map((order, idx) => (
                                    <tr key={order.id} style={{
                                      borderBottom: '1px solid rgba(99, 102, 241, 0.05)',
                                      background: idx % 2 === 0 ? 'rgba(0, 0, 0, 0.1)' : 'transparent'
                                    }}>
                                      <td style={{ padding: '0.75rem', color: '#e0e7ff' }}>
                                        {order.menuItem?.name || 'N/A'}
                                      </td>
                                      <td style={{ padding: '0.75rem', color: 'rgba(203, 213, 225, 0.7)' }}>
                                        {format(new Date(order.createdAt), 'dd/MM/yyyy HH:mm')}
                                      </td>
                                      <td style={{ 
                                        padding: '0.75rem', 
                                        textAlign: 'right',
                                        color: '#86efac',
                                        fontWeight: '600'
                                      }}>
                                        {(order.menuItem?.price || 0).toLocaleString('vi-VN')}.000đ
                                      </td>
                                      <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                                        <span style={{
                                          padding: '0.25rem 0.75rem',
                                          borderRadius: '12px',
                                          fontSize: '0.8rem',
                                          fontWeight: '600',
                                          background: 
                                            order.status === 'debt' || order.status === 'pay_later_approved' 
                                              ? 'rgba(251, 146, 60, 0.2)' 
                                              : order.status === 'confirmed'
                                              ? 'rgba(34, 197, 94, 0.2)'
                                              : order.status === 'cancelled'
                                              ? 'rgba(239, 68, 68, 0.2)'
                                              : 'rgba(99, 102, 241, 0.2)',
                                          color:
                                            order.status === 'debt' || order.status === 'pay_later_approved'
                                              ? '#fb923c'
                                              : order.status === 'confirmed'
                                              ? '#86efac'
                                              : order.status === 'cancelled'
                                              ? '#fca5a5'
                                              : '#a5b4fc',
                                          border: `1px solid ${
                                            order.status === 'debt' || order.status === 'pay_later_approved'
                                              ? 'rgba(251, 146, 60, 0.3)'
                                              : order.status === 'confirmed'
                                              ? 'rgba(34, 197, 94, 0.3)'
                                              : order.status === 'cancelled'
                                              ? 'rgba(239, 68, 68, 0.3)'
                                              : 'rgba(99, 102, 241, 0.3)'
                                          }`
                                        }}>
                                          {order.status === 'debt' || order.status === 'pay_later_approved' 
                                            ? '💰 Đang nợ'
                                            : order.status === 'confirmed'
                                            ? '✅ Đã trả'
                                            : order.status === 'cancelled'
                                            ? '❌ Đã hủy'
                                            : order.status === 'pending' || order.status === 'pay_later_pending'
                                            ? '⏳ Chờ duyệt'
                                            : order.status}
                                        </span>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </GlassCard>
              )}
            </motion.div>
          )}

          {/* Menu Management Tab */}
          {activeTab === 'menu' && (
            <motion.div
              key="menu"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <GlassCard style={{ maxWidth: '800px', margin: '0 auto' }}>
                <h2>Thêm Món Đặc Biệt Hôm Nay</h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--spacing-sm)' }}>
                  {format(new Date(), 'dd/MM/yyyy')}
                </p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 'var(--spacing-lg)' }}>
                  💡 Menu mặc định của quán luôn có sẵn. Thêm các món đặc biệt ngoài menu cho ngày hôm nay.
                </p>

                {/* Input Mode Toggle */}
                <div className="flex gap-md mb-lg" style={{ justifyContent: 'center' }}>
                  <Button
                    variant={inputMode === 'bulk' ? 'primary' : 'secondary'}
                    onClick={() => setInputMode('bulk')}
                    type="button"
                  >
                    📝 Paste Danh Sách
                  </Button>
                  <Button
                    variant={inputMode === 'form' ? 'primary' : 'secondary'}
                    onClick={() => setInputMode('form')}
                    type="button"
                  >
                    ➕ Nhập Từng Món
                  </Button>
                </div>

                <form onSubmit={handleSubmitMenu}>
                  {inputMode === 'bulk' ? (
                    <>
                      <div className="input-group">
                        <label className="input-label">
                          Danh Sách Món Ăn
                        </label>
                        <textarea
                          value={bulkText}
                          onChange={(e) => setBulkText(e.target.value)}
                          placeholder="Paste danh sách món ăn theo định dạng:&#10;Đậu thịt sốt cà chua 35&#10;Thịt viên sốt cà chua 35&#10;Gà rang gừng 35&#10;Thịt kho củ cải 35&#10;Bê xào 40&#10;Sườn 45"
                          className="input"
                          rows="12"
                          style={{
                            fontFamily: 'monospace',
                            fontSize: '0.95rem',
                            lineHeight: '1.6',
                            resize: 'vertical'
                          }}
                        />
                      </div>
                      <div className="glass-light" style={{
                        padding: 'var(--spacing-md)',
                        borderRadius: 'var(--radius-sm)',
                        marginBottom: 'var(--spacing-lg)'
                      }}>
                        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                          💡 <strong>Định dạng:</strong> Mỗi dòng một món, tên món và giá cách nhau bằng khoảng trắng. Giá là số cuối cùng trên dòng (đơn vị: 1000đ).
                        </p>
                        <p style={{ margin: '0.5rem 0 0', fontSize: '0.85rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                          Ví dụ: Cơm rang dưa bò 35 → Món "Cơm rang dưa bò" giá 35.000đ
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      {menuItems.map((item, index) => (
                        <div 
                          key={index} 
                          className="glass-light" 
                          style={{ 
                            padding: 'var(--spacing-lg)', 
                            borderRadius: 'var(--radius-md)', 
                            marginBottom: 'var(--spacing-md)' 
                          }}
                        >
                          <div className="flex gap-md items-center">
                            <div style={{ flex: 2 }}>
                              <Input
                                label="Tên món ăn"
                                type="text"
                                value={item.name}
                                onChange={(e) => handleMenuItemChange(index, 'name', e.target.value)}
                                placeholder="Ví dụ: Cơm rang dưa bò"
                              />
                            </div>
                            <div style={{ flex: 1 }}>
                              <Input
                                label="Giá (VNĐ)"
                                type="number"
                                value={item.price}
                                onChange={(e) => handleMenuItemChange(index, 'price', e.target.value)}
                                placeholder="35000"
                              />
                            </div>
                            {menuItems.length > 1 && (
                              <div style={{ paddingTop: '1.5rem' }}>
                                <Button
                                  variant="danger"
                                  type="button"
                                  onClick={() => handleRemoveMenuItem(index)}
                                >
                                  🗑️
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </>
                  )}

                  <div className="flex gap-md" style={{ marginTop: 'var(--spacing-lg)' }}>
                    {inputMode === 'form' && (
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={handleAddMenuItem}
                        style={{ flex: 1 }}
                      >
                        ➕ Thêm món
                      </Button>
                    )}
                    <Button
                      type="submit"
                      variant="success"
                      disabled={loading}
                      style={{ flex: inputMode === 'bulk' ? 'auto' : 1, width: inputMode === 'bulk' ? '100%' : 'auto' }}
                    >
                      {loading ? 'Đang lưu...' : '💾 Lưu Menu'}
                    </Button>
                  </div>
                </form>
              </GlassCard>
            </motion.div>
          )}

          {/* Order History Tab */}
          {activeTab === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              style={{ maxWidth: '1000px', margin: '0 auto' }}
            >
              <h2 style={{
                fontSize: '1.75rem',
                fontWeight: '700',
                color: '#e0e7ff',
                marginBottom: '1.5rem'
              }}>
                📋 Tất Cả Đơn Hàng ({allOrders.length})
              </h2>
              
              {allOrders.length === 0 ? (
                <GlassCard style={{ textAlign: 'center', padding: '3rem' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📦</div>
                  <p style={{ color: 'rgba(203, 213, 225, 0.7)', margin: 0 }}>
                    Chưa có đơn hàng nào
                  </p>
                </GlassCard>
              ) : (
                <div>
                  {allOrders.map((order, index) => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      index={index}
                      actions={[
                        {
                          label: '🗑️ Xóa',
                          variant: 'danger',
                          onClick: (order) => handleDeleteOrder(order.id)
                        }
                      ]}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Printable Order List Modal */}
        <AnimatePresence>
          {showPrintableList && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPrintableList(false)}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.8)',
                backdropFilter: 'blur(8px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                padding: '2rem'
              }}
            >
              <motion.div
                initial={{ scale: 0.9, y: 50 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 50 }}
                onClick={(e) => e.stopPropagation()}
                style={{
                  background: '#ffffff',
                  color: '#000000',
                  borderRadius: '16px',
                  padding: '2.5rem',
                  maxWidth: '800px',
                  width: '100%',
                  maxHeight: '85vh',
                  overflowY: 'auto',
                  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
                  position: 'relative'
                }}
              >
                {/* Close Button */}
                <button
                  onClick={() => setShowPrintableList(false)}
                  style={{
                    position: 'absolute',
                    top: '1rem',
                    right: '1rem',
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    border: '2px solid #000',
                    background: '#fff',
                    color: '#000',
                    fontSize: '1.5rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold'
                  }}
                >
                  ✕
                </button>

                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '2rem', borderBottom: '3px solid #000', paddingBottom: '1rem' }}>
                  <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: '900', color: '#000' }}>
                    DANH SÁCH ĐẶT SUẤT ĂN
                  </h1>
                  <p style={{ margin: '0.5rem 0 0', fontSize: '1.1rem', fontWeight: '600', color: '#333' }}>
                    Ngày: {format(new Date(), 'dd/MM/yyyy')}
                  </p>
                </div>

                {/* Order List - Grouped by Menu Item */}
                {(() => {
                  // Group orders by menu item
                  const groupedOrders = {};
                  confirmedOrders.forEach(order => {
                    const itemName = order.menuItem?.name || 'N/A';
                    if (!groupedOrders[itemName]) {
                      groupedOrders[itemName] = {
                        count: 0,
                        price: order.menuItem?.price || 0,
                        notesMap: {}
                      };
                    }
                    groupedOrders[itemName].count += 1;
                    
                    // Group by notes
                    const noteKey = order.notes || 'Không có ghi chú';
                    if (!groupedOrders[itemName].notesMap[noteKey]) {
                      groupedOrders[itemName].notesMap[noteKey] = 0;
                    }
                    groupedOrders[itemName].notesMap[noteKey] += 1;
                  });

                  return (
                    <div>
                      {Object.entries(groupedOrders).map(([itemName, data], index) => (
                        <div 
                          key={index}
                          style={{
                            marginBottom: '1.5rem',
                            padding: '1.25rem',
                            background: '#f9f9f9',
                            border: '2px solid #333',
                            borderRadius: '8px'
                          }}
                        >
                          <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            marginBottom: '0.75rem'
                          }}>
                            <h3 style={{ 
                              margin: 0, 
                              fontSize: '1.4rem', 
                              fontWeight: '900',
                              color: '#000'
                            }}>
                              {itemName}
                            </h3>
                            <div style={{
                              fontSize: '1.5rem',
                              fontWeight: '900',
                              color: '#000',
                              background: '#ffeb3b',
                              padding: '0.5rem 1rem',
                              borderRadius: '8px',
                              border: '2px solid #000'
                            }}>
                              ×{data.count}
                            </div>
                          </div>
                          
                          {/* Notes breakdown */}
                          {Object.entries(data.notesMap).length > 0 && (
                            <div style={{ marginTop: '0.75rem' }}>
                              {Object.entries(data.notesMap).map(([note, count], idx) => (
                                <div 
                                  key={idx}
                                  style={{
                                    padding: '0.5rem',
                                    marginTop: '0.5rem',
                                    background: note === 'Không có ghi chú' ? 'transparent' : '#fff',
                                    border: note === 'Không có ghi chú' ? 'none' : '1px solid #666',
                                    borderRadius: '4px',
                                    fontSize: '0.95rem',
                                    color: '#333'
                                  }}
                                >
                                  {note !== 'Không có ghi chú' && (
                                    <strong style={{ color: '#000' }}>
                                      📝 ({count}) {note}
                                    </strong>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                      
                      {/* Summary */}
                      <div style={{
                        marginTop: '2rem',
                        padding: '1.5rem',
                        background: '#000',
                        color: '#fff',
                        borderRadius: '12px',
                        textAlign: 'center'
                      }}>
                        <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.8rem', fontWeight: '900' }}>
                          TỔNG CỘNG
                        </h2>
                        <p style={{ margin: 0, fontSize: '2.5rem', fontWeight: '900' }}>
                          {confirmedOrders.length} SUẤT
                        </p>
                      </div>
                    </div>
                  );
                })()}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AdminDashboard;
