import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { orderService } from '../api/services';
import Button from './Button';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [debtInfo, setDebtInfo] = useState({ totalDebt: 0, orderCount: 0 });

  useEffect(() => {
    if (user && !isAdmin) {
      fetchDebtInfo();
    }
  }, [user, isAdmin]);

  const fetchDebtInfo = async () => {
    try {
      const data = await orderService.getMyDebt();
      setDebtInfo(data);
    } catch (error) {
      console.error('Failed to fetch debt info:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="glass-light" style={{ padding: '1rem 0', marginBottom: '2rem' }}>
      <div className="container flex items-center justify-between">
        <Link to={isAdmin ? '/admin' : '/dashboard'} style={{ textDecoration: 'none' }}>
          <h2 style={{ margin: 0, color: 'var(--text-primary)' }}>
            🍱 Đặt Cơm Công Ty
          </h2>
        </Link>
        
        <div className="flex items-center gap-md">
          <span style={{ color: 'var(--text-secondary)' }}>
            {user?.fullName} {isAdmin && '(Admin)'}
          </span>
          
          {!isAdmin && (
            <>
              <Link to="/history">
                <Button variant="secondary">Lịch Sử</Button>
              </Link>
              
              <Link to="/debt" style={{ position: 'relative', textDecoration: 'none' }}>
                <Button variant="secondary">
                  💰 Nợ
                </Button>
                {debtInfo.totalDebt > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    whileHover={{ scale: 1.1 }}
                    style={{
                      position: 'absolute',
                      top: '-8px',
                      right: '-8px',
                      background: 'linear-gradient(135deg, #fb923c 0%, #f97316 100%)',
                      color: '#fff',
                      fontSize: '0.7rem',
                      fontWeight: '800',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '12px',
                      border: '2px solid rgba(255, 255, 255, 0.3)',
                      boxShadow: '0 4px 12px rgba(251, 146, 60, 0.5)',
                      minWidth: '20px',
                      textAlign: 'center'
                    }}
                  >
                    {debtInfo.totalDebt.toLocaleString('vi-VN', { maximumFractionDigits: 0 })}
                  </motion.div>
                )}
              </Link>
            </>
          )}
          
          <Button variant="secondary" onClick={handleLogout}>
            Đăng Xuất
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
