import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import GlassCard from '../components/GlassCard';
import Input from '../components/Input';
import Button from '../components/Button';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(username, password);
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center" style={{ minHeight: '100vh', padding: '2rem' }}>
      <GlassCard className="fade-in" style={{ maxWidth: '450px', width: '100%' }} hover={false}>
        <div className="text-center mb-xl">
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🍱</h1>
          <h2 style={{ marginBottom: '0.5rem' }}>Đăng Nhập</h2>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
            Hệ thống đặt cơm công ty
          </p>
        </div>

        {error && (
          <div className="glass-light" style={{
            padding: '1rem',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '1.5rem',
            border: '1px solid var(--status-cancelled)',
            color: 'var(--status-cancelled)'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <Input
            label="Tên đăng nhập"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Nhập tên đăng nhập"
            required
          />

          <Input
            label="Mật khẩu"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Nhập mật khẩu"
            required
          />

          <Button type="submit" disabled={loading} style={{ width: '100%', marginTop: '1rem' }}>
            {loading ? 'Đang đăng nhập...' : 'Đăng Nhập'}
          </Button>
        </form>

        <div className="text-center mt-lg">
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
            Chưa có tài khoản?{' '}
            <Link to="/register" style={{ color: 'var(--text-primary)', fontWeight: '600' }}>
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </GlassCard>
    </div>
  );
};

export default Login;
