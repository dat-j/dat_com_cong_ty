import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';
import Button from '../components/Button';
import { menuService, orderService, settingsService } from '../api/services';
import { format } from 'date-fns';
import zaloPayQR from '../assets/zalopay_qr.jpeg';

// React Bits - Sparkles Effect Component
const Sparkles = ({ children }) => {
  return (
    <span className="sparkles-container" style={{ position: 'relative', display: 'inline-block' }}>
      {children}
      <style>{`
        .sparkles-container::before,
        .sparkles-container::after {
          content: '✨';
          position: absolute;
          font-size: 1.2rem;
          animation: sparkle 2s ease-in-out infinite;
        }
        .sparkles-container::before {
          top: -10px;
          right: -20px;
          animation-delay: 0s;
        }
        .sparkles-container::after {
          bottom: -10px;
          left: -20px;
          animation-delay: 1s;
        }
        @keyframes sparkle {
          0%, 100% { opacity: 0; transform: scale(0) rotate(0deg); }
          50% { opacity: 1; transform: scale(1) rotate(180deg); }
        }
      `}</style>
    </span>
  );
};

// React Bits Inspired - Shimmer Text Effect
const ShimmerText = ({ children, className = '', style = {} }) => {
  return (
    <span className={`shimmer-text ${className}`} style={style}>
      {children}
      <style>{`
        .shimmer-text {
          position: relative;
          display: inline-block;
          color: #ffffff;
          background: linear-gradient(90deg, 
            rgba(255,255,255,0.8) 0%, 
            rgba(255,255,255,1) 40%,
            rgba(255,255,255,1) 60%, 
            rgba(255,255,255,0.8) 100%
          );
          background-size: 200% 100%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 3s linear infinite;
        }
        /* Fallback for browsers that don't support background-clip */
        @supports not (-webkit-background-clip: text) {
          .shimmer-text {
            color: #ffffff;
            background: none;
          }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </span>
  );
};

// React Bits Inspired - Floating Particles Background
const FloatingParticles = () => {
  const particles = Array.from({ length: 20 }, (_, i) => i);
  
  return (
    <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
      {particles.map((i) => (
        <motion.div
          key={i}
          animate={{
            y: [0, -1000],
            x: [
              Math.random() * 100 - 50,
              Math.random() * 100 - 50,
            ],
            opacity: [0, 1, 0],
            scale: [0, 1.5, 0]
          }}
          transition={{
            duration: Math.random() * 10 + 10,
            repeat: Infinity,
            delay: Math.random() * 5,
            ease: 'linear'
          }}
          style={{
            position: 'absolute',
            bottom: '0',
            left: `${Math.random() * 100}%`,
            width: `${Math.random() * 4 + 2}px`,
            height: `${Math.random() * 4 + 2}px`,
            borderRadius: '50%',
            background: `hsla(${Math.random() * 60 + 180}, 70%, 60%, 0.6)`,
            filter: 'blur(1px)'
          }}
        />
      ))}
    </div>
  );
};

// MenuCard Component
const MenuCard = ({ item, index, handleOrder, isSpecial }) => {
  const getFoodImage = (itemName) => {
    const name = itemName.toLowerCase();
    if (name.includes('gà') || name.includes('chicken')) {
      return 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=800&q=80';
    } else if (name.includes('sườn') || name.includes('ribs')) {
      return 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80';
    } else if (name.includes('cá') || name.includes('fish')) {
      return 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800&q=80';
    } else if (name.includes('chiên') || name.includes('fried rice')) {
      return 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800&q=80';
    } else if (name.includes('thịt')) {
      return 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=800&q=80';
    } else if (name.includes('xá xíu')) {
      return 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=800&q=80';
    } else {
      return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80';
    }
  };

  const cardVariants = {
    hidden: { y: 40, opacity: 0, scale: 0.95 },
    visible: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 120,
        damping: 14
      }
    }
  };

  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -12, transition: { duration: 0.3 } }}
    >
      <motion.div
        whileHover={{ boxShadow: `0 25px 70px ${isSpecial ? 'rgba(251, 146, 60, 0.4)' : 'rgba(99, 102, 241, 0.4)'}` }}
        style={{
          position: 'relative',
          borderRadius: '28px',
          overflow: 'hidden',
          background: 'rgba(30, 41, 59, 0.4)',
          backdropFilter: 'blur(20px) saturate(180%)',
          border: `1px solid ${isSpecial ? 'rgba(251, 146, 60, 0.2)' : 'rgba(139, 92, 246, 0.2)'}`,
          boxShadow: `0 20px 60px rgba(0, 0, 0, 0.4), inset 0 0 80px ${isSpecial ? 'rgba(251, 146, 60, 0.05)' : 'rgba(139, 92, 246, 0.05)'}`,
          cursor: 'pointer',
          height: '100%',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Special Badge */}
        {isSpecial && (
          <div style={{
            position: 'absolute',
            top: '16px',
            left: '16px',
            zIndex: 2,
            background: 'linear-gradient(135deg, rgba(251, 146, 60, 0.95) 0%, rgba(249, 115, 22, 0.95) 100%)',
            padding: '0.4rem 0.9rem',
            borderRadius: '12px',
            border: '1.5px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 4px 16px rgba(251, 146, 60, 0.5)',
            fontSize: '0.75rem',
            fontWeight: '800',
            color: '#fff',
            letterSpacing: '0.5px'
          }}>
            ⭐ MỚI
          </div>
        )}

        {/* Food Image */}
        <div style={{ position: 'relative', height: '240px', overflow: 'hidden' }}>
          <motion.img
            whileHover={{ scale: 1.15 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            src={getFoodImage(item.name)}
            alt={item.name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '70%',
            background: 'linear-gradient(to top, rgba(10, 14, 39, 0.98) 0%, transparent 100%)'
          }} />
          
          {/* Price Badge */}
          <motion.div
            whileHover={{ scale: 1.08, rotate: -5 }}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.95) 0%, rgba(5, 150, 105, 0.95) 100%)',
              backdropFilter: 'blur(10px)',
              padding: '0.65rem 1.25rem',
              borderRadius: '16px',
              border: '1.5px solid rgba(255, 255, 255, 0.4)',
              boxShadow: '0 8px 24px rgba(16, 185, 129, 0.4), inset 0 1px 2px rgba(255,255,255,0.3)'
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: '0.25rem'
            }}>
              <ShimmerText style={{
                fontSize: '1.6rem',
                fontWeight: '900',
                lineHeight: 1
              }}>
                {parseInt(item.price)}.000đ
              </ShimmerText>
            </div>
          </motion.div>
        </div>

        {/* Content */}
        <div style={{
          padding: '1.75rem',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <h3 style={{
              fontSize: '1.35rem',
              fontWeight: '700',
              color: '#f8fafc',
              marginBottom: '1.75rem',
              lineHeight: '1.3'
            }}>
              {item.name}
            </h3>
          </div>

          {/* Order Button */}
          <motion.button
            whileHover={{
              scale: 1.03,
              boxShadow: `0 8px 30px ${isSpecial ? 'rgba(251, 146, 60, 0.6)' : 'rgba(99, 102, 241, 0.6)'}`
            }}
            whileTap={{ scale: 0.97 }}
            onClick={() => handleOrder(item)}
            style={{
              width: '100%',
              padding: '1.1rem',
              fontSize: '1.05rem',
              fontWeight: '800',
              color: '#fff',
              background: isSpecial 
                ? 'linear-gradient(135deg, #fb923c 0%, #f97316 100%)'
                : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              border: 'none',
              borderRadius: '16px',
              cursor: 'pointer',
              boxShadow: `0 4px 20px ${isSpecial ? 'rgba(251, 146, 60, 0.4)' : 'rgba(99, 102, 241, 0.4)'}, inset 0 1px 2px rgba(255,255,255,0.3)`,
              letterSpacing: '0.5px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
          >
            <span style={{ fontSize: '1.2rem' }}>🛒</span>
            Đặt Món Ngay
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

const UserDashboard = () => {
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showPayment, setShowPayment] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [paymentMethod, setPaymentMethod] = useState('immediate'); // 'immediate' or 'pay_later'
  const [selectedNoteOptions, setSelectedNoteOptions] = useState([]);
  const [customNote, setCustomNote] = useState('');
  const [orderingEnabled, setOrderingEnabled] = useState(true);
  const [checkingStatus, setCheckingStatus] = useState(true);

  // Predefined note options
  const noteOptions = [
    { id: 'less_rice_more_veg', label: '🥬 Ít cơm nhiều rau' },
    { id: 'more_rice', label: '🍚 Nhiều cơm' },
    { id: 'add_chili', label: '🌶️ Thêm ớt' },
    { id: 'add_fish_sauce', label: '🥄 Thêm nước mắm' },
  ];

  useEffect(() => {
    checkOrderingStatus();
    fetchTodayMenu();
  }, []);
  
  const checkOrderingStatus = async () => {
    try {
      setCheckingStatus(true);
      const data = await settingsService.getOrderingStatus();
      setOrderingEnabled(data.enabled);
    } catch (error) {
      console.error('Failed to check ordering status:', error);
      // If API fails, assume ordering is enabled
      setOrderingEnabled(true);
    } finally {
      setCheckingStatus(false);
    }
  };

  const fetchTodayMenu = async () => {
    try {
      setLoading(true);
      const data = await menuService.getTodayMenu();
      setMenu(data);
    } catch (error) {
      setMessage({ type: 'error', text: 'Không thể tải menu. Vui lòng thử lại.' });
    } finally {
      setLoading(false);
    }
  };

  const handleOrder = async (menuItem) => {
    try {
      setSelectedItem(menuItem);
      setShowPayment(true);
      setPaymentMethod('immediate'); // Reset to default
      setSelectedNoteOptions([]); // Reset notes
      setCustomNote(''); // Reset custom note
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Đặt món thất bại.' });
    }
  };

  const handleConfirmOrder = async () => {
    try {
      // Build notes string from selected options and custom note
      const notesParts = [];
      if (selectedNoteOptions.length > 0) {
        const selectedLabels = selectedNoteOptions.map(optionId => {
          const option = noteOptions.find(opt => opt.id === optionId);
          return option ? option.label : '';
        }).filter(Boolean);
        notesParts.push(...selectedLabels);
      }
      if (customNote.trim()) {
        notesParts.push(customNote.trim());
      }
      const notes = notesParts.length > 0 ? notesParts.join(', ') : null;

      await orderService.createOrder(selectedItem.id, paymentMethod, notes);
      
      setMessage({ 
        type: 'success', 
        text: `Đơn hàng đã được gửi! ${paymentMethod === 'pay_later' ? 'Yêu cầu thanh toán sau' : 'Thanh toán QR'} đang chờ admin xác nhận.` 
      });
      
      // Close modal and reset
      setShowPayment(false);
      setSelectedItem(null);
      setPaymentMethod('immediate');
      setSelectedNoteOptions([]);
      setCustomNote('');
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Đặt món thất bại.' });
    }
  };

  const getFoodImage = (itemName) => {
    const name = itemName.toLowerCase();
    if (name.includes('gà') || name.includes('chicken')) {
      return 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=800&q=80';
    } else if (name.includes('sườn') || name.includes('ribs')) {
      return 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80';
    } else if (name.includes('cá') || name.includes('fish')) {
      return 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800&q=80';
    } else if (name.includes('chiên') || name.includes('fried rice')) {
      return 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800&q=80';
    } else if (name.includes('thịt')) {
      return 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=800&q=80';
    } else if (name.includes('xá xíu')) {
      return 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=800&q=80';
    } else {
      return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80';
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { y: 40, opacity: 0, scale: 0.95 },
    visible: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 120,
        damping: 14
      }
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0e27 0%, #1a1d35 50%, #252845 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* React Bits - Floating Particles Background */}
      <FloatingParticles />

      {/* Ambient Glow */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.03, 0.06, 0.03]
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
        style={{
          position: 'fixed',
          top: '10%',
          right: '10%',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.3) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(80px)',
          zIndex: 0
        }}
      />

      <Navbar />

      <div className="container" style={{ paddingBottom: '3rem', position: 'relative', zIndex: 1 }}>
        {/* Hero Header with React Bits Effects */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
          style={{ padding: '2.5rem 1rem 2rem' }}
        >
          <Sparkles>
            <ShimmerText>
              <h1 style={{
                fontSize: '3rem',
                fontWeight: '900',
                marginBottom: '0.75rem',
                letterSpacing: '1px',
              }}>
              Menu
              </h1>
            </ShimmerText>
          </Sparkles>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            style={{
              color: 'rgba(199, 210, 254, 0.8)',
              fontSize: '1.1rem',
              fontWeight: '500'
            }}
          >
            {format(new Date(), 'EEEE, dd/MM/yyyy')}
          </motion.p>
        </motion.div>
        
        {/* Check if ordering is closed */}
        {checkingStatus ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center"
            style={{ padding: '4rem 0' }}
          >
            <motion.div
              animate={{ rotate: 360, scale: [1, 1.2, 1] }}
              transition={{
                rotate: { duration: 2, repeat: Infinity, ease: 'linear' },
                scale: { duration: 1, repeat: Infinity }
              }}
              style={{ fontSize: '3rem', marginBottom: '1rem' }}
            >
              🍱
            </motion.div>
            <p style={{ color: 'rgba(199, 210, 254, 0.7)' }}>Đang kiểm tra...</p>
          </motion.div>
        ) : !orderingEnabled ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              maxWidth: '700px',
              margin: '0 auto',
              padding: '3rem 2rem',
              borderRadius: '32px',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '2px solid rgba(239, 68, 68, 0.3)',
              backdropFilter: 'blur(20px)',
              textAlign: 'center',
              boxShadow: '0 30px 60px rgba(0, 0, 0, 0.4), 0 0 80px rgba(239, 68, 68, 0.2)'
            }}
          >
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, -5, 5, 0]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
              style={{ fontSize: '5rem', marginBottom: '1.5rem' }}
            >
              🔒
            </motion.div>
            <h2 style={{
              fontSize: '2rem',
              fontWeight: '900',
              color: '#fca5a5',
              marginBottom: '1rem',
              textShadow: '0 2px 10px rgba(239, 68, 68, 0.3)'
            }}>
              Admin đã đóng đặt cơm
            </h2>
            <div style={{
              fontSize: '1.2rem',
              color: 'rgba(252, 165, 165, 0.8)',
              lineHeight: '1.6',
              marginBottom: '1.5rem'
            }}>
              Hết thời gian đặt cơm rồi
            </div>
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
              style={{
                padding: '1rem 1.5rem',
                borderRadius: '16px',
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                fontSize: '1rem',
                color: 'rgba(248, 250, 252, 0.8)',
                display: 'inline-block'
              }}
            >
              ⏰ Vui lòng quay lại sau
            </motion.div>
          </motion.div>
        ) : (
          <> 
        {/* Message */}
        <AnimatePresence>
          {message.text && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              style={{
                padding: '1rem 1.5rem',
                borderRadius: '16px',
                background: message.type === 'error' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(34, 197, 94, 0.15)',
                border: `1px solid ${message.type === 'error' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(34, 197, 94, 0.3)'}`,
                color: message.type === 'error' ? '#fca5a5' : '#86efac',
                maxWidth: '700px',
                margin: '0 auto 2rem',
                backdropFilter: 'blur(10px)',
                fontWeight: '500'
              }}
            >
              {message.text}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading */}
        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center"
            style={{ padding: '4rem 0' }}
          >
            <motion.div
              animate={{ rotate: 360, scale: [1, 1.2, 1] }}
              transition={{
                rotate: { duration: 2, repeat: Infinity, ease: 'linear' },
                scale: { duration: 1, repeat: Infinity }
              }}
              style={{ fontSize: '3rem', marginBottom: '1rem' }}
            >
              🍱
            </motion.div>
            <p style={{ color: 'rgba(199, 210, 254, 0.7)' }}>Đang tải menu...</p>
          </motion.div>
        ) : menu.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              padding: '3rem',
              borderRadius: '24px',
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(20px)',
              textAlign: 'center',
              maxWidth: '600px',
              margin: '0 auto'
            }}
          >
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🍽️</div>
            <h3 style={{ color: '#c7d2fe' }}>Chưa có menu cho hôm nay</h3>
          </motion.div>
        ) : (
          <>
            {/* Daily Specials Section */}
            {menu.filter(item => !item.isDefaultMenu).length > 0 && (
              <div style={{ marginBottom: '4rem' }}>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  style={{ marginBottom: '2rem' }}
                >
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem 1.5rem',
                    background: 'linear-gradient(135deg, rgba(251, 146, 60, 0.2) 0%, rgba(249, 115, 22, 0.1) 100%)',
                    border: '1px solid rgba(251, 146, 60, 0.3)',
                    borderRadius: '16px',
                    backdropFilter: 'blur(10px)'
                  }}>
                    <span style={{ fontSize: '1.5rem' }}>⭐</span>
                    <h2 style={{
                      margin: 0,
                      fontSize: '1.5rem',
                      fontWeight: '800',
                      background: 'linear-gradient(135deg, #fb923c 0%, #f97316 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent'
                    }}>
                      Món Đặc Biệt Hôm Nay
                    </h2>
                  </div>
                </motion.div>

                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
                    gap: '2rem'
                  }}
                >
                  {menu.filter(item => !item.isDefaultMenu).map((item, index) => (
                    <MenuCard key={item.id} item={item} index={index} handleOrder={handleOrder} isSpecial={true} />
                  ))}
                </motion.div>
              </div>
            )}

            {/* Default Menu Section */}
            {menu.filter(item => item.isDefaultMenu).length > 0 && (
              <div>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  style={{ marginBottom: '2rem' }}
                >
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem 1.5rem',
                    background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(124, 58, 237, 0.1) 100%)',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                    borderRadius: '16px',
                    backdropFilter: 'blur(10px)'
                  }}>
                    <span style={{ fontSize: '1.5rem' }}>🍱</span>
                    <h2 style={{
                      margin: 0,
                      fontSize: '1.5rem',
                      fontWeight: '800',
                      background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent'
                    }}>
                      Menu Thường Xuyên
                    </h2>
                  </div>
                </motion.div>

                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
                    gap: '2rem'
                  }}
                >
                  {menu.filter(item => item.isDefaultMenu).map((item, index) => (
                    <MenuCard key={item.id} item={item} index={index} handleOrder={handleOrder} isSpecial={false} />
                  ))}
                </motion.div>
              </div>
            )}
          </>
        )}
        </>
        )}

        {/* Payment Modal */}
        <AnimatePresence>
          {showPayment && selectedItem && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.8)',
                backdropFilter: 'blur(12px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                padding: '2rem'
              }}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0, y: 100 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.8, opacity: 0, y: 100 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                style={{
                  maxWidth: '550px',
                  width: '100%',
                  maxHeight: '85vh',
                  borderRadius: '32px',
                  background: 'rgba(26, 32, 53, 0.95)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(139, 92, 246, 0.3)',
                  boxShadow: '0 30px 60px rgba(0, 0, 0, 0.6), 0 0 80px rgba(139, 92, 246, 0.2)',
                  padding: '2rem',
                  position: 'relative',
                  overflowY: 'auto'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Close Button */}
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    setShowPayment(false);
                    setPaymentMethod('immediate');
                    setSelectedNoteOptions([]);
                    setCustomNote('');
                  }}
                  style={{
                    position: 'absolute',
                    top: '1.5rem',
                    right: '1.5rem',
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    border: 'none',
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: '#e0e7ff',
                    fontSize: '1.5rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 10,
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
                >
                  ✕
                </motion.button>

                {/* Header */}
                <motion.h2
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  style={{
                    marginBottom: '1.5rem',
                    fontSize: '1.75rem',
                    textAlign: 'center',
                    color: '#e0e7ff',
                    fontWeight: '900'
                  }}
                >
                  💳 Thanh Toán
                </motion.h2>

                <div>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    style={{
                      padding: '1.25rem',
                      borderRadius: '16px',
                      background: 'rgba(139, 92, 246, 0.1)',
                      border: '1px solid rgba(139, 92, 246, 0.3)',
                      marginBottom: '1.5rem'
                    }}
                  >
                    <p style={{ marginBottom: '0.5rem', fontSize: '0.95rem', color: '#c7d2fe' }}>
                      <strong>Món:</strong> {selectedItem.name}
                    </p>
                    <p style={{ margin: 0, fontSize: '1.4rem', fontWeight: '900', color: '#86efac' }}>
                      <strong>Giá:</strong> {parseInt(selectedItem.price)}.000đ
                    </p>
                  </motion.div>

                  {/* Notes/Options Section */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    style={{ marginBottom: '1.5rem' }}
                  >
                    <p style={{ marginBottom: '1rem', color: '#c7d2fe', fontWeight: '600', fontSize: '1.05rem' }}>
                      🍴 Ghi chú cho món ăn:
                    </p>
                    
                    {/* Predefined Options */}
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(2, 1fr)', 
                      gap: '0.75rem',
                      marginBottom: '1rem'
                    }}>
                      {noteOptions.map((option) => {
                        const isSelected = selectedNoteOptions.includes(option.id);
                        return (
                          <motion.label
                            key={option.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                              padding: '0.85rem 1rem',
                              borderRadius: '12px',
                              background: isSelected ? 'rgba(139, 92, 246, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                              border: `2px solid ${isSelected ? 'rgba(139, 92, 246, 0.5)' : 'rgba(255, 255, 255, 0.1)'}`,
                              cursor: 'pointer',
                              transition: 'all 0.3s ease',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              fontSize: '0.9rem',
                              fontWeight: '600',
                              color: '#e0e7ff'
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedNoteOptions([...selectedNoteOptions, option.id]);
                                } else {
                                  setSelectedNoteOptions(selectedNoteOptions.filter(id => id !== option.id));
                                }
                              }}
                              style={{ 
                                width: '18px', 
                                height: '18px', 
                                cursor: 'pointer', 
                                accentColor: '#8b5cf6',
                                flexShrink: 0
                              }}
                            />
                            <span>{option.label}</span>
                          </motion.label>
                        );
                      })}
                    </div>

                    {/* Custom Note Textarea */}
                    <textarea
                      value={customNote}
                      onChange={(e) => setCustomNote(e.target.value)}
                      placeholder="Ghi chú thêm (nếu có)..."
                      style={{
                        width: '100%',
                        minHeight: '80px',
                        padding: '0.85rem',
                        borderRadius: '12px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '2px solid rgba(255, 255, 255, 0.1)',
                        color: '#e0e7ff',
                        fontSize: '0.9rem',
                        fontFamily: 'inherit',
                        resize: 'vertical',
                        outline: 'none',
                        transition: 'border-color 0.3s ease'
                      }}
                      onFocus={(e) => e.target.style.borderColor = 'rgba(139, 92, 246, 0.5)'}
                      onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
                    />
                  </motion.div>

                  {/* Payment Method Selection */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    style={{ marginBottom: '1.5rem' }}
                  >
                    <p style={{ marginBottom: '1rem', color: '#c7d2fe', fontWeight: '600', fontSize: '1.05rem' }}>
                      Chọn phương thức thanh toán:
                    </p>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <label 
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          flex: 1,
                          padding: '1rem',
                          borderRadius: '16px',
                          background: paymentMethod === 'immediate' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                          border: `2px solid ${paymentMethod === 'immediate' ? 'rgba(34, 197, 94, 0.5)' : 'rgba(255, 255, 255, 0.1)'}`,
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem'
                        }}>
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="immediate"
                          checked={paymentMethod === 'immediate'}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: '#22c55e' }}
                        />
                        <div>
                          <div style={{ fontSize: '1rem', fontWeight: '700', color: '#e0e7ff', marginBottom: '0.25rem' }}>
                            ⚡ Thanh toán QR
                          </div>
                          <div style={{ fontSize: '0.85rem', color: 'rgba(199, 210, 254, 0.6)' }}>
                            Quét mã và chuyển khoản
                          </div>
                        </div>
                      </label>

                      <label 
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          flex: 1,
                          padding: '1rem',
                          borderRadius: '16px',
                          background: paymentMethod === 'pay_later' ? 'rgba(251, 146, 60, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                          border: `2px solid ${paymentMethod === 'pay_later' ? 'rgba(251, 146, 60, 0.5)' : 'rgba(255, 255, 255, 0.1)'}`,
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem'
                        }}>
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="pay_later"
                          checked={paymentMethod === 'pay_later'}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: '#fb923c' }}
                        />
                        <div>
                          <div style={{ fontSize: '1rem', fontWeight: '700', color: '#e0e7ff', marginBottom: '0.25rem' }}>
                            📝 Thanh toán sau
                          </div>
                          <div style={{ fontSize: '0.85rem', color: 'rgba(199, 210, 254, 0.6)' }}>
                            Ghi nợ và trả sau
                          </div>
                        </div>
                      </label>
                    </div>
                    
                    {/* QR Code Display - Show when QR payment selected */}
                    {paymentMethod === 'immediate' && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        style={{ 
                          marginTop: '1.5rem',
                          textAlign: 'center'
                        }}
                      >
                        <p style={{ 
                          marginBottom: '1rem', 
                          color: 'rgba(199, 210, 254, 0.8)', 
                          fontSize: '1rem', 
                          fontWeight: '600' 
                        }}>
                          Quét mã QR để thanh toán
                        </p>
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          style={{
                            padding: '1rem',
                            borderRadius: '24px',
                            background: 'rgba(255, 255, 255, 0.98)',
                            border: '2px solid rgba(34, 197, 94, 0.3)',
                            display: 'inline-block',
                            boxShadow: '0 8px 32px rgba(34, 197, 94, 0.3)'
                          }}
                        >
                          <img
                            src={zaloPayQR}
                            alt="ZaloPay QR Code"
                            style={{
                              width: '200px',
                              height: '200px',
                              objectFit: 'cover',
                              borderRadius: '12px'
                            }}
                          />
                        </motion.div>
                        <p style={{ 
                          color: 'rgba(199, 210, 254, 0.6)', 
                          fontSize: '0.9rem', 
                          marginTop: '1rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.5rem'
                        }}>
                          <span style={{ fontSize: '1.1rem' }}>💰</span>
                          Chuyển khoản qua ZaloPay
                        </p>
                      </motion.div>
                    )}
                    
                    <div style={{
                      marginTop: '1rem',
                      padding: '1rem',
                      borderRadius: '12px',
                      background: 'rgba(99, 102, 241, 0.1)',
                      border: '1px solid rgba(99, 102, 241, 0.2)'
                    }}>
                      <p style={{ color: 'rgba(199, 210, 254, 0.7)', fontSize: '0.9rem', margin: 0 }}>
                        ℹ️ Đơn hàng sẽ chờ admin xác nhận trước khi gửi cho quán ăn
                      </p>
                    </div>
                  </motion.div>

                  {/* Buttons */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    style={{ display: 'flex', gap: '1rem' }}
                  >
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setShowPayment(false);
                        setPaymentMethod('immediate');
                      }}
                      style={{
                        flex: 1,
                        padding: '1rem',
                        fontSize: '1rem',
                        fontWeight: '600',
                        color: '#cbd5e1',
                        background: 'rgba(255, 255, 255, 0.08)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: '16px',
                        cursor: 'pointer'
                      }}
                    >
                      Hủy
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.02, boxShadow: '0 8px 30px rgba(99, 102, 241, 0.6)' }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleConfirmOrder}
                      style={{
                        flex: 1,
                        padding: '1rem',
                        fontSize: '1rem',
                        fontWeight: '800',
                        color: '#fff',
                        background: paymentMethod === 'pay_later'
                          ? 'linear-gradient(135deg, #fb923c 0%, #f97316 100%)'
                          : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                        border: 'none',
                        borderRadius: '16px',
                        cursor: 'pointer',
                        boxShadow: '0 4px 20px rgba(99, 102, 241, 0.4)'
                      }}
                    >
                      {paymentMethod === 'pay_later' ? '📝 Xác Nhận Ghi Nợ' : '⚡ Xác Nhận Đặt Món'}
                    </motion.button>
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default UserDashboard;
