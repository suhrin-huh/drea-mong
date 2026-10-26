import { fileURLToPath, URL } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
// import mkcert from 'vite-plugin-mkcert';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  return {
    resolve: {
      alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
    },
    server: {
      headers: {
        'Service-Worker-Allowed': '/',
      },
      proxy: {
        '/socket.io': {
          target: env.VITE_API_BASE_URL,
          changeOrigin: true,
          ws: true,
          secure: true,
          rewrite: (path) => path.replace(/^\/socket.io/, '/socket.io'),
        },
      },
    },
    plugins: [
      react(),
      // mkcert(),
      VitePWA({
        // PWA 플러그인 설정
        strategies: 'injectManifest', // 서비스 워커 전략: 사용자 정의 서비스 워커 사용
        srcDir: 'public', // 서비스 워커 파일 위치
        filename: './firebase-messaging-sw.js', // 서비스 워커 파일명
        injectManifest: {
          injectionPoint: undefined,
        },
        registerType: 'autoUpdate', // 서비스 워커 자동 업데이트 설정
        devOptions: {
          // 개발 환경 옵션
          enabled: env.VITE_API_MOCK === 'false', // 목 모드에서는 Firebase 서비스 워커 등록 생략
          type: 'module', // ES 모듈 형식 사용
        },
        // workbox: {
        //   // Workbox 설정
        //   cleanupOutdatedCaches: false, // 오래된 캐시 자동 정리 비활성화
        //   sourcemap: true, // 소스맵 생성 활성화
        // },
        includeAssets: ['apple-touch-icon.png'],
        manifest: {
          name: '드리-몽',
          short_name: '드리-몽',
          description: 'AI-based dream interpretation app',
          theme_color: '#737DFE',
          icons: [
            {
              src: '/drea-mong-192.png',
              type: 'image/png',
              sizes: '192x192',
            },
            {
              src: '/drea-mong-512.png',
              type: 'image/png',
              sizes: '512x512',
            },
            {
              src: '/apple-touch-icon.png',
              type: 'image/png',
              size: '180x180',
            },
          ],
        },
      }),
    ],
  };
});
