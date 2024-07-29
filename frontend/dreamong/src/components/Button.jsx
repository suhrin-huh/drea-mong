const Button = ({ children, click, rounded, isFilled, isFull, isShadow }) => {
  let buttonClasses = isFull === true ? 'w-full m-2 select-none px-2 py-3' : 'm-2 select-none px-6 py-3';

  // 자료형이 boolean일 때만 적용되도록 조건 직접 명시
  if (isFilled === true) {
    buttonClasses += ` rounded-${rounded} text-white bg-indigo-700 hover:bg-indigo-900 hover:ring-2 hover:ring-offset-2 hover:ring-offset-slate-50 hover:ring-indigo-300`;
  } else if (isFilled === false) {
    buttonClasses += ` rounded-${rounded} text-black bg-white hover:bg-gray-100 hover:ring-2 hover:ring-offset-2 hover:ring-offset-slate-50 hover:ring-gray-300`;
  }

  if (isShadow === true) {
    buttonClasses += ' shadow-md shadow-gray-400';
  }

  return (
    <button className={buttonClasses} onClick={click}>
      {children}
    </button>
  );
};

Button.defaultProps = { rounded: 'lg', isFilled: true, isFull: false, isShadow: false };

export default Button;
