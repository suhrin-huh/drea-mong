const Button = ({ children, click, rounded = 'lg', isFilled = true, isFull = false, isShadow = false }) => {
  let buttonClasses = isFull === true ? 'w-full m-2 select-none px-2 py-3' : 'm-2 select-none px-6 py-3';

  // 자료형이 boolean일 때만 적용되도록 조건 직접 명시
  if (isFilled === true) {
    buttonClasses += ` rounded-${rounded} text-white bg-primary-500 hover:bg-primary-700`;
  } else if (isFilled === false) {
    buttonClasses += ` rounded-${rounded} text-black bg-white hover:bg-gray-100`;
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

export default Button;
