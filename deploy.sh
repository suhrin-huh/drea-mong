# Docker Compose 다운
docker compose down

# 백엔드 디렉토리로 이동
cd ~/project/S11P12C106/backend/dreamong/

# Gradle 빌드
./gradlew clean build

#
cd ../..

# Docker Compose 빌드 및 실행
docker compose build --no-cache
docker compose up -d
docker compose ps -a
