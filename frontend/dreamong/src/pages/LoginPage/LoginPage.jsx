// import backgroundImg from '../../assets/background.svg';
import googleLogo from '../../assets/logoSVG/btn_google.svg';
import naverLogo from '../../assets/logoSVG/btn_naver.svg';
import kakaoLogo from '../../assets/logoSVG/btn_kakao.svg';

const LoginPage = () => {
  const generateState = () => {
    return Math.random().toString(36).substring(2, 15);
  };

  const loginByGoogle = () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const redirectUri = `${window.location.origin}/oauth/callback/google`;
    const scope = 'email profile';
    const state = generateState();
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&state=${state}`;

    localStorage.setItem('googleStateToken', state);
    window.location.href = googleAuthUrl;
  };

  const loginByNaver = () => {
    const clientId = import.meta.env.VITE_NAVER_CLIENT_ID;
    const redirectUri = encodeURIComponent(`${window.location.origin}/oauth/callback/naver`);
    const state = generateState();
    const naverAuthUrl = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&state=${state}`;

    // 상태값을 저장. 이는 CSRF 공격을 방지하기 위함
    localStorage.setItem('naverStateToken', state);
    window.location.href = naverAuthUrl;
  };

  const loginByKakao = () => {
    const state = generateState();
    const kakaoAuthUrl = 'https://192.168.100.108:8080/oauth2/authorization/kakao';

    localStorage.setItem('accessToken', state);
    window.location.href = kakaoAuthUrl;
  };

  return (
    <div className="flex h-screen flex-col justify-end bg-[url('/src/assets/background.svg')]">
      <div className="pr-[10%] text-end">
        <h1 className="mb-12 text-5xl font-bold text-white">Drea-mong</h1>
        <p className="mb-3 text-2xl text-white">꿈의 비밀을 통해</p>
        <p className="text-2xl text-white">자신을 발견해 보세요</p>
      </div>
      <div className="mb-[10%] mt-72 flex flex-col items-center gap-y-4 text-lg">
        <button
          onClick={loginByGoogle}
          className="flex h-12 w-[80%] select-none items-center justify-center space-x-2 rounded-xl bg-white hover:bg-gray-200"
        >
          <img src={googleLogo} alt="google logo" className="mr-1 h-5 w-5" />
          <p className="font-medium">구글로 시작하기</p>
        </button>
        <button
          onClick={loginByNaver}
          className="flex h-12 w-[80%] select-none items-center justify-center space-x-2 rounded-xl bg-green-500 hover:bg-green-600"
        >
          <img src={naverLogo} alt="naver logo" className="h-8 w-8" />
          <p className="font-medium">네이버로 시작하기</p>
        </button>
        <button
          onClick={loginByKakao}
          className="flex h-12 w-[80%] select-none items-center justify-center space-x-2 rounded-xl bg-yellow-300 hover:bg-yellow-400"
        >
          <img src={kakaoLogo} alt="kakao logo" className="h-8 w-8" />
          <p className="font-medium">카카오로 시작하기</p>
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
