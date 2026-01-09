# Chatty 위젯 연동 가이드

## 1. 개요
이 문서는 **Chatty 채팅 솔루션**을 기존 웹사이트(프론트엔드)에 연동하기 위한 가이드입니다.
위젯 스크립트(`widget.js`)를 로드하고, 필요한 설정값(`window.params`)을 주입하는 것만으로 채팅 기능을 사용할 수 있습니다.

## 2. 프론트엔드 연동 절차

### Step 1: 환경 변수 및 인증 정보 설정
채팅 위젯이 로드되기 전에, 반드시 `window.params`와 `window.CHAT_SERVER_URL`이 설정되어 있어야 합니다.

```html
<script>
  // 1. 채팅 서버 주소 설정
  window.CHAT_SERVER_URL = "http://localhost:3000"; // 실제 운영 서버 주소로 변경

  // 2. 사용자 인증 정보 및 프로젝트 설정
  // 이 정보는 귀사의 백엔드 템플릿 엔진(JSP, Thymeleaf, EJS 등)에서 주입하거나,
  // API를 통해 받아와서 설정해야 합니다.
  window.params = {
    token: "eyJhbGciOiJIUzI1NiIsIn...", // [필수] Host 백엔드에서 발급한 JWT 토큰
    username: "User_Nickname",          // [선택] 현재 사용자 닉네임 (본인 메시지 식별용)
    projectId: "kimpga"                 // [참고] 토큰 내부에도 포함되어 있지만, 디버깅용으로 명시 가능
  };
</script>
```

> **JWT 토큰 주의사항**: `token`은 반드시 서버 사이드에서 비밀키(`JWT_SECRET`)로 서명된 것이어야 합니다. 프론트엔드에서 임의로 생성하면 안 됩니다.

### Step 2: 위젯 스크립트 로드
설정이 완료된 후, `widget.js` 파일을 로드합니다. `<body>` 태그 닫기 직전에 넣는 것을 권장합니다.

```html
<!-- 위젯 스크립트 로드 -->
<script src="http://localhost:3000/widget.js"></script>
```

### Step 3: 전체 예시 코드
```html
<!DOCTYPE html>
<html lang="ko">
<body>
    <!-- 본문 내용 -->
    <div id="app">...</div>

    <!-- 채팅 위젯 연동 -->
    <script>
        // 백엔드에서 전달받은 변수라고 가정
        const chatConfig = {
            serverUrl: "https://chat.example.com",
            jwtToken: "SERVER_GENERATED_JWT_TOKEN",
            currentUser: "홍길동"
        };

        // 위젯 설정
        window.CHAT_SERVER_URL = chatConfig.serverUrl;
        window.params = {
            token: chatConfig.jwtToken,
            username: chatConfig.currentUser
        };
    </script>
    <script src="https://chat.example.com/widget.js" async></script>
</body>
</html>
```