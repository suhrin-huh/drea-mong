const HomeNavigationItem = ({ color }) => (
  <div className="flex flex-col items-center justify-center">
    <svg width="26" height="28" viewBox="0 0 26 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M2 10.4L12.6667 2L23.3333 10.4V23.6C23.3333 24.2365 23.0836 24.847 22.6391 25.2971C22.1945 25.7471 21.5916 26 20.963 26H4.37037C3.74171 26 3.1388 25.7471 2.69427 25.2971C2.24973 24.847 2 24.2365 2 23.6V10.4Z"
        stroke={color}
        strokeWidth="3.45645"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.11133 26V14H16.2224V26"
        stroke={color}
        strokeWidth="3.45645"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>

    <p className="text-center text-[12px] text-black">HOME</p>
  </div>
);

export default HomeNavigationItem;
