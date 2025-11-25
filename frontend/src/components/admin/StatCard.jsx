import { motion } from 'framer-motion';

const StatCard = ({ title, value, icon, color = '#6366f1', trend }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, boxShadow: `0 20px 40px ${color}40` }}
      style={{
        padding: '1.5rem',
        borderRadius: '20px',
        background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
        border: `1px solid ${color}30`,
        backdropFilter: 'blur(20px)',
        boxShadow: `0 8px 24px rgba(0, 0, 0, 0.2)`,
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Background glow */}
      <div style={{
        position: 'absolute',
        top: '-50%',
        right: '-50%',
        width: '200%',
        height: '200%',
        background: `radial-gradient(circle, ${color}10 0%, transparent 70%)`,
        pointerEvents: 'none'
      }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '1rem'
        }}>
          <div>
            <p style={{
              color: 'rgba(203, 213, 225, 0.7)',
              fontSize: '0.9rem',
              margin: 0,
              marginBottom: '0.5rem',
              fontWeight: '500'
            }}>
              {title}
            </p>
            <h3 style={{
              fontSize: '2rem',
              fontWeight: '900',
              color: '#f8fafc',
              margin: 0
            }}>
              {value}
            </h3>
          </div>
          <div style={{
            fontSize: '2rem',
            opacity: 0.8
          }}>
            {icon}
          </div>
        </div>

        {trend && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.85rem',
            color: trend.change >= 0 ? '#22c55e' : '#ef4444',
            fontWeight: '600'
          }}>
            <span>{trend.change >= 0 ? '↑' : '↓'}</span>
            <span>{Math.abs(trend.change)}%</span>
            <span style={{ color: 'rgba(203, 213, 225, 0.6)', fontWeight: '400' }}>
              {trend.label}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default StatCard;
