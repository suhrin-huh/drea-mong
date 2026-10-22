const SquareNavigationItem = ({ color }) => (
  <div className="flex flex-col items-center justify-center">
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M26 13.3334C26.0046 15.0932 25.5934 16.8292 24.8 18.4C23.8592 20.2823 22.413 21.8656 20.6232 22.9724C18.8335 24.0792 16.771 24.6659 14.6666 24.6667C12.9068 24.6713 11.1708 24.2601 9.59999 23.4667L2 26L4.53333 18.4C3.73991 16.8292 3.32874 15.0932 3.33333 13.3334C3.33415 11.229 3.92081 9.16649 5.02762 7.37676C6.13443 5.58703 7.71766 4.14079 9.59999 3.20004C11.1708 2.40661 12.9068 1.99545 14.6666 2.00004H15.3333C18.1124 2.15336 20.7374 3.32638 22.7055 5.29451C24.6736 7.26264 25.8466 9.88756 26 12.6667V13.3334Z"
        stroke={color}
        strokeWidth="3.45645"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>

    <p className="text-center text-[12px] text-black">SQUARE</p>
  </div>
);

export default SquareNavigationItem;
