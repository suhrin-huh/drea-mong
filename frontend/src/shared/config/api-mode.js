// 개발 서버에서 기본 활성화. 실제 서버 연결 시 VITE_API_MOCK=false로 전환한다.
export const isMockMode = import.meta.env.DEV && import.meta.env.VITE_API_MOCK !== 'false';

// 데모 세션은 실제 토큰을 만들거나 저장하지 않는다.
export const hasApiSession = () => isMockMode || Boolean(localStorage.getItem('accessToken'));
