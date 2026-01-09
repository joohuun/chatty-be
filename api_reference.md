# Chatty (Express Version) API Reference

이 문서는 **Chatty** 스타일의 독립형 채팅 서버 API 가이드입니다.
Host 웹사이트에 임베드되는 채팅 위젯 및 서버와의 통신 규격을 설명합니다.
토큰 발급용)와 **Socket.io** (실시간 통신용)를 모두 제공합니다.

## Base URL
- Docker/Local Environment: `http://localhost:3000`

---

## 1. Authentication (인증)

이 채팅 서버는 자체 회원가입 기능이 없습니다. **Host 웹사이트의 백엔드**가 사용자를 인증하고, **JWT (JSON Web Token)**을 생성하여 프론트엔드(위젯)에 전달해야 합니다.

### JWT 발급 방법 (Backend to Backend)
Host 백엔드 개발자는 `jsonwebtoken` 라이브러리 등을 사용하여 아래 클레임을 포함한 토큰을 생성해야 합니다.
(서버 간 공유된 `JWT_SECRET` 키 사용)

**Payload Claims:**
```json
{
  "username": "String (표시할 닉네임, 필수)",
  "avatar": "String (이미지 URL, 선택사항)",
  "projectId": "String (프로젝트 식별자, 필수 - 예: 'kimpga', 'myshop')",
  "exp": "Number (만료 시간)"
}
```

> **Note**: `/api/generate-token` 엔드포인트는 개발 및 테스트 목적으로 제공되는 것입니다. 실제 운영 환경에서는 Host 백엔드가 직접 토큰을 생성해야 합니다.

---

## 2. HTTP API

### 토큰 생성 (테스트/개발용)
실제 운영 환경에서는 Host 서버가 직접 토큰을 생성해야 하지만, 개발 편의를 위해 토큰 생성 API를 제공합니다.

**Endpoint:** `POST /api/generate-token`

**Request Body:**
```json
{
  "username": "사용자닉네임",
  "avatar": "https://example.com/image.png",
  "projectId": "my_project_v1"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsIn..."
}
```

---

## 3. Socket.io Events

실시간 통신을 위해 Socket.io 클라이언트(`socket.io-client`)를 사용합니다.

### 연결 (Connection)
연결 시 반드시 `auth` 객체에 토큰을 포함해야 합니다.

```javascript
const socket = io('SERVER_URL', {
  auth: {
    token: 'YOUR_JWT_TOKEN'
  }
});
```

### [Server -> Client] Events

#### `history`
연결 성공 직후, 최근 채팅 내역(기본 50개)을 수신합니다.

**Data Format (Array):**
```json
[
  {
    "id": 1,
    "username": "User1",
    "avatar": "...",
    "content": "안녕하세요!",
    "created_at": "2024-01-09T10:00:00.000Z"
  },
  ...
]
```

#### `chat message`
새로운 메시지가 도착했을 때 발생합니다.

**Data Format:**
```json
{
  "id": 2,
  "username": "User2",
  "avatar": "...",
  "content": "반갑습니다.",
  "created_at": "2024-01-09T10:05:00.000Z"
}
```

### [Client -> Server] Events

#### `chat message`
메시지를 전송할 때 사용합니다.

**Data Format (String):**
```text
"보낼 메시지 내용"
```

---

## 4. 데이터베이스 및 보존
-   **Engine**: PostgreSQL (Docker Container)
-   **Table**: `messages`
-   **보존 정책**: `docker-compose.yml`에 정의된 `pgdata` 볼륨을 통해 데이터가 영구 보존됩니다. 컨테이너를 삭제해도 볼륨이 남아있으면 데이터는 유지됩니다.
-   **데이터 초기화**:
    ```bash
    docker-compose down -v  # 볼륨까지 함께 삭제하여 초기화
    ```
