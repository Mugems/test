import PropTypes from 'prop-types';

const Avatar = ({ 
  name, 
  size = 32, 
  backgroundColor = '#1890ff', 
  textColor = '#ffffff',
  className = '',
  style = {}
}) => {
  // Generate initials from name
  const getInitials = (fullName) => {
    if (!fullName) return 'U';
    
    const names = fullName.trim().split(' ');
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  const initials = getInitials(name);
  const bgColor = backgroundColor;

  const avatarStyle = {
    width: size,
    height: size,
    borderRadius: '50%',
    backgroundColor: bgColor,
    color: textColor,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: size * 0.4,
    fontWeight: '600',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    textTransform: 'uppercase',
    userSelect: 'none',
    ...style
  };

  return (
    <div 
      className={`avatar ${className}`}
      style={avatarStyle}
      title={name || 'User'}
    >
      {initials}
    </div>
  );
};

Avatar.propTypes = {
  name: PropTypes.string,
  size: PropTypes.number,
  backgroundColor: PropTypes.string,
  textColor: PropTypes.string,
  className: PropTypes.string,
  style: PropTypes.object
};

export default Avatar;
