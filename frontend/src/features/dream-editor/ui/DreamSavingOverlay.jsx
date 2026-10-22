const DreamSavingOverlay = () => (
  <div className="absolute inset-0 z-10 flex h-full w-full items-center justify-center bg-black bg-opacity-30 backdrop-blur-sm">
    <div className="scale-150">
      <span className="save-loader z-20"></span>
    </div>
  </div>
);

export default DreamSavingOverlay;
