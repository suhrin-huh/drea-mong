const Button = ({
  children,
  variant,
  size = 'md',
  rounded = 'lg',
  fullWidth = false,
  shadow = false,
  className = '',
  ...props
}) => {
  const baseClasses = 'select-none transition-colors duration-200';

  const variantClasses = {
    primary: 'bg-primary-500 text-white hover:bg-primary-700',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
    success: 'bg-green-500 text-white hover:bg-green-600',
    danger: 'bg-red-500 text-white hover:bg-red-600',
    outline: 'bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-100',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const roundedClasses = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    full: 'rounded-full',
  };

  const classes = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${roundedClasses[rounded]}
    ${fullWidth ? 'w-full' : ''}
    ${shadow ? 'shadow-md' : ''}
    ${className}
  `.trim();

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
};

export default Button;
