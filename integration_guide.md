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

## 3. 커스터마이징 (스타일)
현재 위젯의 스타일은 `widget.js` 내부에 포함되어 있습니다.
디자인 변경이 필요한 경우:
1.  **CSS 오버라이드**: `#chatty-trigger`, `#chatty-window` 등의 ID 셀렉터를 사용하여 사이트 CSS에서 덮어씌울 수 있습니다.
2.  **직접 수정**: `widget.js` 파일을 전달받아 내부 CSS 문자열을 직접 수정한 후 귀사의 CDN에 호스팅하여 사용할 수 있습니다.

## 4. 트러블슈팅

**Q: 채팅 버튼이 안 보입니다.**
-   `widget.js`가 정상적으로 로드되었는지 네트워크 탭을 확인하세요.
-   `z-index` 문제일 수 있습니다. `#chatty-trigger`의 z-index가 다른 요소보다 낮은지 확인하세요.

**Q: 채팅 연결이 안 됩니다 (Console Error).**
-   `window.params.token`이 올바르게 설정되었는지 확인하세요.
-   `window.CHAT_SERVER_URL`이 채팅 서버 주소를 정확히 가리키고 있는지 확인하세요.
-   CORS 오류가 발생한다면 채팅 서버의 `cors` 설정을 확인해야 합니다.
