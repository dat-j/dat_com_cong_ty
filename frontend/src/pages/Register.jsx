import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import GlassCard from '../components/GlassCard';
import Input from '../components/Input';
import Button from '../components/Button';

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      setLoading(false);
      return;
    }

    try {
      await register(username, password, fullName);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center" style={{ minHeight: '100vh', padding: '2rem' }}>
      <GlassCard className="fade-in" style={{ maxWidth: '450px', width: '100%', padding: '3rem', borderRadius: '20px' }} hover={false}>
        <div className="text-center mb-xl">
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🍱</h1>
          <h2 style={{ marginBottom: '0.5rem' }}>Đăng Ký</h2>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
            Tạo tài khoản mới
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
            label="Họ và tên"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Nhập họ và tên"
            required
          />

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
            placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
            required
          />

          <Button type="submit" disabled={loading} style={{ width: '100%', marginTop: '1rem' }}>
            {loading ? 'Đang đăng ký...' : 'Đăng Ký'}
          </Button>
        </form>

        <div className="text-center mt-lg">
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
            Đã có tài khoản?{' '}
            <Link to="/login" style={{ color: 'var(--text-primary)', fontWeight: '600' }}>
              Đăng nhập ngay
            </Link>
          </p>
        </div>
      </GlassCard>
    </div>
  );
};

export default Register;
