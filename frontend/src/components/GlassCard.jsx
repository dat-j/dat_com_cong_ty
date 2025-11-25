import PropTypes from 'prop-types';

const GlassCard = ({ children, className = '', hover = true, ...props }) => {
  const hoverClass = hover ? 'card' : '';
  
  return (
    <div 
      className={`glass ${hoverClass} ${className}`} 
      {...props}
    >
      {children}
    </div>
  );
};

GlassCard.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  hover: PropTypes.bool,
};

export default GlassCard;
