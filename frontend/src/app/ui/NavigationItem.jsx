const NavigationItem = ({ label, children }) => (
  <div className="flex flex-col items-center justify-center">
    {children}
    <p className="text-center text-[11px] text-black">{label}</p>
  </div>
);

export default NavigationItem;
