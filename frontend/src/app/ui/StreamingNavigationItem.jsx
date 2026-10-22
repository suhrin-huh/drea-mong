const StreamingNavigationItem = ({ color }) => (
  <div className="flex flex-col items-center justify-center">
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M2 21.9995V13.9997C2 10.8172 3.26425 7.76502 5.51464 5.51464C7.76502 3.26425 10.8172 2 13.9997 2C17.1822 2 20.2344 3.26425 22.4848 5.51464C24.7352 7.76502 25.9994 10.8172 25.9994 13.9997V21.9995"
        stroke={color}
        strokeWidth="3.45645"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M25.9994 23.3335C25.9994 24.0407 25.7185 24.719 25.2184 25.2191C24.7183 25.7192 24.0401 26.0001 23.3328 26.0001H21.9995C21.2923 26.0001 20.614 25.7192 20.114 25.2191C19.6139 24.719 19.3329 24.0407 19.3329 23.3335V19.3336C19.3329 18.6264 19.6139 17.9481 20.114 17.448C20.614 16.9479 21.2923 16.667 21.9995 16.667H25.9994V23.3335ZM2 23.3335C2 24.0407 2.28094 24.719 2.78103 25.2191C3.28112 25.7192 3.95938 26.0001 4.6666 26.0001H5.99991C6.70713 26.0001 7.38539 25.7192 7.88548 25.2191C8.38557 24.719 8.66651 24.0407 8.66651 23.3335V19.3336C8.66651 18.6264 8.38557 17.9481 7.88548 17.448C7.38539 16.9479 6.70713 16.667 5.99991 16.667H2V23.3335Z"
        stroke={color}
        strokeWidth="3.45645"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>

    <p className="text-center text-[12px] text-black">MUSIC</p>
  </div>
);

export default StreamingNavigationItem;
