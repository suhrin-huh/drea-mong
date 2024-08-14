## Node.js 20.15 이미지 사용
#FROM node:20.15-alpine AS build
#
## 작업 디렉토리 설정
#WORKDIR /app
#
## package.json과 package-lock.json을 복사하고 npm 설치
#COPY package*.json ./
#RUN npm install
#
## 나머지 애플리케이션 소스 복사
#COPY . .
#
## 애플리케이션 빌드
#RUN npm run build
#
## Nginx를 사용하여 정적 파일 제공
#FROM nginx:alpine
#
## 빌드된 파일을 Nginx 디렉토리로 복사
#COPY --from=build /app/dist /usr/share/nginx/html
#
## Nginx 설정 파일 복사
#COPY nginx.conf /etc/nginx/conf.d/default.conf
#
## Nginx 실행
#CMD ["nginx", "-g", "daemon off;"]

# 1단계: React 앱 빌드
FROM node:20.15-alpine AS build

# 작업 디렉토리 설정
WORKDIR /app

# package.json 및 package-lock.json 파일 복사
COPY package*.json ./

# 종속성 설치
RUN npm install

# 애플리케이션 코드 복사
COPY . .

# React 앱 빌드
RUN npm run build

# dist 디렉토리의 내용 확인
RUN ls -la /app/dist

# Stage 2: Node.js 서버로 React 앱 제공
FROM node:20.15-alpine

# 작업 디렉토리 설정
WORKDIR /app

# serve 패키지 전역 설치
RUN npm install -g serve

# 이전 단계에서 빌드된 출력물 복사
COPY --from=build /app/dist /app/dist

# 포트 5173 노출
EXPOSE 5173

# 서버 시작
CMD ["serve", "-s", "dist", "-l", "5173"]