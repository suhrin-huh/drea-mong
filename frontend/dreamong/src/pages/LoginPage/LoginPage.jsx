import googleLogo from '../../assets/logoSVG/btn_google.svg';
import naverLogo from '../../assets/logoSVG/btn_naver.svg';
import kakaoLogo from '../../assets/logoSVG/btn_kakao.svg';
import { useRecoilValue } from 'recoil';
import { baseURLState } from '../../recoil/atoms';

const LoginPage = () => {
  const baseURL = useRecoilValue(baseURLState);

  const onGoogleLogin = () => {
    window.location.href = `${baseURL}/oauth2/authorization/google`;
  };

  const onNaverLogin = () => {
    window.location.href = `${baseURL}/oauth2/authorization/naver`;
  };

  const onKakaoLogin = () => {
    window.location.href = `${baseURL}/oauth2/authorization/kakao`;
  };

  return (
    <div className="flex h-screen flex-col justify-end">
      <section className="pr-[10%] text-end">
        <h1 className="mb-12 text-5xl font-bold text-white">Drea-mong</h1>
        <p className="mb-3 text-2xl text-white">꿈의 비밀을 통해</p>
        <p className="text-2xl text-white">자신을 발견해 보세요</p>
      </section>
      <section className="mb-[10%] mt-60 flex flex-col items-center gap-y-4 text-lg">
        <button
          onClick={onGoogleLogin}
          className="flex h-12 w-[80%] select-none items-center justify-center space-x-2 rounded-xl bg-white hover:bg-gray-200"
        >
          <img src={googleLogo} alt="google logo" className="mr-1 h-5 w-5" />
          <p className="font-medium">구글로 시작하기</p>
        </button>
        <button
          onClick={onNaverLogin}
          className="flex h-12 w-[80%] select-none items-center justify-center space-x-2 rounded-xl bg-green-500 hover:bg-green-600"
        >
          <img src={naverLogo} alt="naver logo" className="h-8 w-8" />
          <p className="font-medium">네이버로 시작하기</p>
        </button>
        <button
          onClick={onKakaoLogin}
          className="flex h-12 w-[80%] select-none items-center justify-center space-x-2 rounded-xl bg-yellow-300 hover:bg-yellow-400"
        >
          <img src={kakaoLogo} alt="kakao logo" className="h-8 w-8" />
          <p className="font-medium">카카오로 시작하기</p>
        </button>
      </section>
    </div>
  );
};

export default LoginPage;
