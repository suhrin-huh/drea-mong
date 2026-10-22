const ScrollDownButton = ({ scrollDown }) => {
  return (
    <div
      className="absolute top-[500px]"
      onClick={() => {
        scrollDown();
      }}
    >
      <button className="mb-2 h-14 w-8 rounded-full border border-white opacity-90">
        <span className="scroll-loader"></span>
      </button>
      <p className="animate-bounce text-center text-lg">CLICK</p>
    </div>
  );
};

export default ScrollDownButton;
