# HGDGDS-Node

Mash-Up 15th 허거덩거덩스 백엔드 서버입니다.  
NestJS 11, TypeORM, PostgreSQL 기반으로 동작하며 인증, 유저, 예약, 파일 업로드용 presigned URL, Firebase 알림 기능을 제공합니다.

## Tech Stack

- Node.js 22 권장
- Yarn
- NestJS 11
- TypeORM
- PostgreSQL 17
- Swagger
- Firebase Admin SDK
- AWS S3 Presigned URL

## 주요 기능

- `auth`
  - 회원가입 및 JWT 기반 인증
- `users`
  - 내 정보 조회/수정
  - FCM 토큰 갱신
- `reservations`
  - 예약 생성, 참여, 수정, 상세 조회
  - 예약 참여자 상태 변경
  - 예약 결과 등록 및 조회
- `files`
  - S3 업로드/조회용 presigned URL 발급
- `firebase`
  - Firebase 푸시 알림 테스트 및 전송
- `codes`
  - 프로필 이미지 코드 조회
- `universal-links`
  - iOS Universal Link 대응

## 시작하기

### 1. 의존성 설치

```bash
yarn install
```

### 2. 환경변수 파일 준비

개발 환경에서는 루트에 `dev.env` 파일이 필요합니다.  
코드는 `APP_MODE=dev`일 때 자동으로 `dev.env`를 읽고, `APP_MODE=prod`일 때는 실행 환경 변수만 사용합니다.

기본 실행 예시:

```bash
APP_MODE=dev yarn start:dev
```

## 환경변수

### 필수

| 변수명 | 설명 |
| --- | --- |
| `APP_MODE` | 실행 모드. `dev` 또는 `prod` |
| `PORT` | 서버 포트. 기본값 `3000` |
| `DB_HOST` | PostgreSQL 호스트 |
| `DB_PORT` | PostgreSQL 포트 |
| `DB_USER` | PostgreSQL 사용자 |
| `DB_PASSWORD` | PostgreSQL 비밀번호 |
| `DB_NAME` | PostgreSQL 데이터베이스 이름 |
| `JWT_SECRET` | JWT 서명 시크릿 |
| `JWT_EXPIRE` | JWT 만료 기간. 미설정 시 `2y` |
| `AWS_S3_BUCKET` | S3 버킷 이름 |
| `AWS_REGION` | AWS 리전 |
| `AWS_S3_ACCESS_KEY` | S3 접근 키 |
| `AWS_S3_SECRET_KEY` | S3 비밀 키 |
| `FIREBASE_CONFIG` | Firebase 서비스 계정 JSON 문자열 |

### 선택

| 변수명 | 설명 |
| --- | --- |
| `SLACK_WEBHOOK_URL` | 예외 발생 시 Slack 알림 전송용 Webhook URL |

## 로컬 개발

### 데이터베이스 실행

로컬 개발용 DB는 Docker Compose로 실행할 수 있습니다.

```bash
yarn docker:up
```

종료 명령어:

```bash
yarn docker:down
```

볼륨까지 삭제:

```bash
yarn docker:down:volume
```

`docker-compose.yml` 기준으로 로컬 DB는 `postgres:17` 이미지를 사용합니다.

### 서버 실행

```bash
APP_MODE=dev yarn start:dev
```

디버그 모드:

```bash
APP_MODE=dev yarn start:debug
```

프로덕션 빌드:

```bash
yarn build
```

프로덕션 실행:

```bash
APP_MODE=prod yarn start:prod
```

## API 문서

서버 실행 후 Swagger 문서는 아래 경로에서 확인할 수 있습니다.

- `http://localhost:3000/api-docs`

## 데이터베이스 마이그레이션

이 프로젝트는 TypeORM 마이그레이션을 사용합니다.

마이그레이션 생성:

```bash
yarn migration:generate
```

마이그레이션 실행:

```bash
yarn migration:run
```

마이그레이션 롤백:

```bash
yarn migration:revert
```

참고:

- 마이그레이션 명령은 내부적으로 `build`를 먼저 수행합니다.
- 개발 모드에서는 `synchronize: true`가 활성화되어 있습니다.
- 마이그레이션 산출물은 빌드 후 `dist/migrations` 기준으로 사용됩니다.

## 자주 쓰는 스크립트

```bash
APP_MODE=dev yarn start:dev
APP_MODE=dev yarn start:debug
yarn build
yarn lint
yarn test
yarn test:e2e
```

## 공개 경로

- `GET /`
- `GET /.well-known/apple-app-site-association`
- `GET /invite`
- `POST /auth/signup`
- `GET /codes/profile-image-code`

인증이 필요한 API는 Swagger의 Bearer Token 또는 JWT 헤더 기준으로 호출하면 됩니다.

## 파일 업로드

파일 업로드는 서버를 통해 직접 바이너리를 받지 않고 S3 presigned URL 방식으로 처리합니다.

- 업로드 URL 발급: `POST /files/presigned-url/upload`
- 조회 URL 발급: `POST /files/presigned-url/access`

세부 플로우는 [docs/files.md](/Users/a2485/PJ/mashup/HGDGDS-Node/docs/files.md)에서 확인할 수 있습니다.

## 테스트

```bash
yarn test
yarn test:e2e
```

## 프로젝트 구조

```text
src/
  auth/
  codes/
  common/
  files/
  firebase/
  images/
  notification-logs/
  reservations/
  similar-groups/
  universal-links/
  users/
  migrations/
```

## 참고 사항

- 애플 유니버설 링크용 `apple-app-site-association` 엔드포인트가 포함되어 있습니다.
- `/invite` 경로는 현재 앱스토어 iOS 앱으로 리다이렉트됩니다.
- 서버 타임존은 `Asia/Seoul` 기준으로 동작합니다.
