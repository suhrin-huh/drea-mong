const SpeechListeningOverlay = () => (
  <div className="fixed inset-0 z-30 flex w-full items-center justify-center">
    <div className="flex h-36 w-36 items-center justify-center rounded-full bg-white bg-opacity-60 backdrop-blur-sm">
      <div className="boxContainer">
        <div className="box box1"></div>
        <div className="box box2"></div>
        <div className="box box3"></div>
        <div className="box box4"></div>
        <div className="box box5"></div>
      </div>
    </div>
  </div>
);

export default SpeechListeningOverlay;
