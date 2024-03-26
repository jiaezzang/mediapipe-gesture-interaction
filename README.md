# mediapipe-gesture-interaction🤟

- MediaPipe의 Gesture Recognition Model을 이용한 WebRTC 화상 비디오 상호작용 프로젝트
- Notion: **[MediaPipe-Gesture-Interaction (240306~240326)](https://jiaezzang.notion.site/MediaPipe-Gesture-Interaction-240306-240326-6281c7b5705949748a277c546ca9fef7?pvs=4)**

# 개발환경

![ye...png](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FmTqc7%2FbtsFyyohIz3%2FNQySudSgBHLIkTgraMRBNk%2Fimg.png)

# 시작하기

## Clone Repository

```bash
$ git clone https://github.com/jiaezzang/mediapipe-gesture-interaction.git
```

## **Installation**

- Server
    
    ```bash
    $ cd server
    
    $ npm ci
    
    $ npm start
    ```
    

- Client
    
    ```bash
    $ cd client
    
    $ npm ci
    
    $ npm run dev
    ```
    

## WebSocket

- `client/src/hooks/useSignaling.ts`
- useEffect 내부에서 WebSocket 주소 설정 (localhost ⇒ server를 연 PC의 IPv4 주소)
    
    ```tsx
    ws.current = new WebSocket('ws://localhost:3000');
    ```
    

# 프레임워크

## ***Google’s Open Source Framework <MediaPipe>***

[Gesture recognition task guide  |  MediaPipe  |  Google for Developers](https://developers.google.com/mediapipe/solutions/vision/gesture_recognizer)

# 구성

## Home

![Home.png](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FcahoLt%2FbtsF7QIVeDT%2Fx2YD2Dm71UG4kY82Q2tvfK%2Fimg.png)

- 선생님 1인, 학생 1인 입장
- 선생님 우선 진입 후에 학생이 진입해야 더 원활히 연결 가능

## Main

### 선생님으로 진입한 경우
![선생님으로 진입한 경우](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FTOIKk%2FbtsF8lopOPs%2FuHCRJ1AIC56qHxaRtau2a1%2Fimg.png)

### 학생으로 진입한 경우 

![학생으로 진입한 경우](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2Fbnm1m3%2FbtsF58Kwhhh%2FKsYn3d7PNW76rmVQVYt0K1%2Fimg.png)


### 사용 가능 Gesture

- 공통
    - 🤟 : 동일한 제스쳐를 한 고양이 발이 나타난다.
    - ☝️Tab! : 검지로 허공에 Tab할 경우 Tab한 지점에 동물의 발바닥 모양이 찍힌다.
    - 👍 : 상대방 비디오 영역에 특정 애니메이션을 보여준다.
- 선생님
    - ✊➡️🖐️ : 두 제스쳐를 연속으로 취했을 때 손바닥에서 동전이 떨어진다.
    - ✌️➡️✊➡️✌️ : 세 제스쳐를 연속으로 취했을 때 학생 비디오 창에 OX 팻말이 나타난다.
    - 👎 : 학생 비디에 영역에 물폭탄 애니메이션을 보여준다.
- 학생
    - ☝️Tab! : 학습자가 동전 위에 Tab 할 경우 동전이 사라지고, OX 팻말 위에서 Tab 할 경우 팻말이 선택된다.
    - ✋➡️✊ : 손바닥 위에 동전을 놓고 두 제스쳐를 연달아 취할 경우에 동전이 사라지고, OX 팻말 위에서 두 제스쳐를 연달아 취할 경우 팻말이 선택된다.
