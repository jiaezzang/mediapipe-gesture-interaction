import coin from '../assets/images/coin.png';
import metalCat from '../assets/images/metalcat.png';
import quizO from '../assets/images/quiz_o.png';
import quizX from '../assets/images/quiz_x.png';
import { GestureRecognizerResult } from '@mediapipe/tasks-vision';
import water from '../assets/sprite/water.png';
import amaizing from '../assets/sprite/amazing.png';
import heartPop from '../assets/sprite/heart_pop.png';
import fireWorks from '../assets/sprite/fire_works.png';
import { spriteAnimation } from './utils';

//GESTURE RECOGNITION
/**
 * 특정 랜드마크의 상대적인 위치와 손바닥 비율을 계산합니다.
 *
 * @param {GestureRecognizerResult} gestureRecognitionResult - 제스처 인식기의 결과 객체
 * @param {number} num - 가져올 랜드마크의 인덱스
 * @returns 지정된 랜드마크의 상대적인 x, y, z 위치 및 손바닥 비율(palmRatio)을 담은 객체를 반환
 */
export const getLandMarkPosition = (
    gestureRecognitionResult: GestureRecognizerResult,
    num: number
) => {
    const x = gestureRecognitionResult.landmarks[0][num].x;
    const y = gestureRecognitionResult.landmarks[0][num].y;
    const z = gestureRecognitionResult.landmarks[0][num].z;
    const palmRatio = Math.abs(
        gestureRecognitionResult.landmarks[0][5].x -
            gestureRecognitionResult.landmarks[0][17].x
    );
    return { x, y, z, palmRatio };
};

/**
 *
 * @param {GestureRecognizerResult} gestureRecognitionResult - 제스처 인식기의 결과 객체
 * @returns 손의 방향(handness)과 포스쳐에 해당하는 아이콘(icon)
 */
export const makeGestureRecognizer = (
    gestureRecognitionResult: GestureRecognizerResult
) => {
    let icon: null | '👍' | '👎' | '✌️' | '☝️' | '✊' | '🖐️' | '🤟' = null;

    const handedness = gestureRecognitionResult.handedness[0]?.[0].displayName;
    if (gestureRecognitionResult.gestures[0]?.[0].categoryName === 'Thumb_Up') {
        icon = '👍';
    } else if (
        gestureRecognitionResult.gestures[0]?.[0].categoryName === 'Thumb_Down'
    ) {
        icon = '👎';
    } else if (
        gestureRecognitionResult.gestures[0]?.[0].categoryName === 'Victory'
    ) {
        icon = '✌️';
    } else if (
        gestureRecognitionResult.gestures[0]?.[0].categoryName === 'Pointing_Up'
    ) {
        icon = '☝️';
    } else if (
        gestureRecognitionResult.gestures[0]?.[0].categoryName === 'ILoveYou'
    ) {
        icon = '🤟';
    } else if (
        gestureRecognitionResult.gestures[0]?.[0].categoryName === 'Open_Palm'
    ) {
        icon = '🖐️';
    } else if (
        gestureRecognitionResult.gestures[0]?.[0].categoryName === 'Closed_Fist'
    ) {
        icon = '✊';
    }

    return { handedness, icon };
};

// EFFECT
/**
 * 동전 던지기 효과를 제공한다.
 * @param {Object} param0.position - 동전의 좌표
 * @param {number} param0.ratio - 동전의 크기 비율
 * @param {number} param0.imgPositionY - 동전이 떨어지는 위치
 */
export const tossCoin = ({
    position,
    ratio,
    imgPositionY,
}: {
    position: landMarkPosition;
    ratio: number;
    imgPositionY: number;
}) => {
    const localCanvas = document.getElementById(
        'teacher-canvas'
    ) as HTMLCanvasElement;
    const remoteCanvas = document.getElementById(
        'learner-canvas'
    ) as HTMLCanvasElement;
    const teacherVideo = document.getElementById('teacher-video');
    if (!localCanvas || !remoteCanvas || !teacherVideo) return;
    const localCtx = localCanvas.getContext('2d');
    if (!localCtx) return;
    const img = new Image();
    img.src = coin;
    img.onload = () => {
        localCanvas.width = teacherVideo.offsetWidth;
        localCanvas.height = teacherVideo.offsetHeight;
        remoteCanvas.width = teacherVideo.offsetWidth;
        remoteCanvas.height = teacherVideo.offsetHeight;
        let animationId: any;
        const rewardSize = Math.round(localCanvas.width * ratio);
        const positionX = Math.round(localCanvas.width * position.x);
        let height = Math.round(localCanvas.height * position.y);
        /** local Video 영역에서 동전을 떨어뜨리는 애니메이션을 준다. */
        const animate = () => {
            if (!localCtx || !localCanvas) return;
            localCtx.clearRect(positionX, height - 8, rewardSize, rewardSize);
            localCtx.drawImage(img, positionX, height, rewardSize, rewardSize);
            height += 8;
            if (height > localCanvas.height) {
                localCtx.clearRect(
                    positionX,
                    height - 8,
                    rewardSize,
                    rewardSize
                );
                dropCoin({ x: positionX, width: rewardSize, imgPositionY });
                cancelAnimationFrame(animationId);
                return;
            }
            animationId = requestAnimationFrame(animate);
        };
        animate();
    };
};

/**
 * 코인이 학습자 비디오 캔버스로 떨어지는 효과를 준다.
 * @param {number} param0.x - 동전이 떨어지는 X 좌표
 * @param {number} param0.width - 동전의 사이즈
 */
export const dropCoin = ({
    x,
    width,
    imgPositionY,
}: {
    x: number;
    width: number;
    imgPositionY: number;
}) => {
    const learnerContainer = document.getElementById('learner-container');
    const learnerVideo = document.getElementById('learner-video');
    let animationId: any;
    let height = 0;
    const animate = () => {
        if (!learnerContainer || !learnerVideo) return;
        const coinElements = Array.from(
            learnerContainer.getElementsByClassName('coin')
        );
        const drawingElement = coinElements.filter((el) =>
            el.classList.contains('drawing')
        );
        for (let i = drawingElement.length - 1; i >= 0; i--) {
            const el = drawingElement[i];
            learnerContainer.removeChild(el);
        }
        const img = new Image();
        img.src = coin;
        img.width = width;
        img.height = width;
        img.classList.add(`drawing`, `coin`, `absolute`);
        img.style.left = x + 'px';
        img.style.top = height + 'px';
        learnerContainer.appendChild(img);
        height += 8;
        if (height > learnerVideo.offsetHeight * imgPositionY) {
            img.classList.remove('drawing');
            cancelAnimationFrame(animationId);
            return;
        }
        animationId = requestAnimationFrame(animate);
    };

    animate();
};

/**
 * 비디오 위 요소를 집는 모션을 했을 때 효과를 부여한다.
 * @param param0.pos0 Hand Landmark 0지점의 좌표
 * @param param0.pos5 Hand Landmark 5지점의 좌표
 * @param param0.pos17 Hand Landmark 17지점의 좌표
 * @return 지워지는 coin의 좌표
 */
export const grabObject = ({
    pos0,
    pos5,
    pos17,
}: {
    pos0: landMarkPosition;
    pos5: landMarkPosition;
    pos17: landMarkPosition;
}) => {
    const learnerContainer = document.getElementById(
        'learner-container'
    ) as HTMLDivElement;
    const learnerVideo = document.getElementById('learner-video');
    if (!learnerContainer || !learnerVideo) return;
    //OX를 선택하는 효과
    const centerX =
        ((pos0.x + pos5.x + pos17.x) * learnerContainer.offsetWidth) / 3;
    const centerY =
        ((pos0.y + pos5.y + pos17.y) * learnerContainer.offsetHeight) / 3;
    chooseOX({ x: centerX, y: centerY });
    //코인이 사라지는 효과
    const coinImg = learnerContainer.getElementsByClassName('coin');
    for (let i = coinImg.length - 1; i >= 0; i--) {
        const coin = coinImg[i] as HTMLImageElement;
        const coinLeft = Number(coin.style.left.replace('px', ''));
        const coinTop = Number(coin.style.top.replace('px', ''));
        const coinCenterX = coinLeft + coin.width / 2;
        const coinCenterY = coinTop + coin.width / 2;

        const highestY =
            pos5.y > pos17.y
                ? pos17.y * learnerVideo.offsetHeight
                : pos5.y * learnerVideo.offsetHeight;
        if (
            coinCenterY > highestY &&
            coinCenterY < pos0.y * learnerVideo.offsetHeight
        ) {
            if (
                pos5.x < pos17.x &&
                coinCenterX > pos5.x * learnerVideo.offsetWidth &&
                coinCenterX < pos17.x * learnerVideo.offsetWidth
            ) {
                coin.remove();
                return { x: coinCenterX, y: coinCenterY };
            } else if (
                pos17.x < pos5.x &&
                coinCenterX > pos17.x * learnerVideo.offsetWidth &&
                coinCenterX < pos5.x * learnerVideo.offsetWidth
            ) {
                coin.remove();
                return { x: coinCenterX, y: coinCenterY };
            }
        }
    }
};

/**
 * 코인이 없어지는 효과를 준다.
 * @param 터치 좌표
 */
export const removeCoin = ({ x, y }: { x: number; y: number }) => {
    // coin 이미지 위를 탭한 경우 코인 이미지 제거
    const localContainer = document.getElementById(`learner-container`);
    if (!localContainer) return;
    const coinImg = localContainer.getElementsByClassName('coin');
    for (let i = coinImg.length - 1; i >= 0; i--) {
        // if(coinImg[i].)
        const coin = coinImg[i] as HTMLImageElement;
        const left = Number(coin.style.left.replace('px', ''));
        const top = Number(coin.style.top.replace('px', ''));
        const xRange = x > left && x < left + coin.width;
        const yRange = y > top && y < top + coin.height;
        if (xRange && yRange) {
            coin.remove();
        }
    }
};

/**
 * 발자국을 찍는 효과를 준다.
 * @param {Object} param0 - 함수에 전달되는 매개변수 객체
 * @param {number} param0.position - 발자국을 찍을 좌표
 * @param {number} param0.ratio - 발자국의 크기 비율
 * @param {string} param0.usrType - 유저 타입
 * @param {string} param0.imgSrc - 발자국 이미지 경로
 */
export const printPaw = ({
    position,
    ratio,
    userType,
    imgSrc,
}: {
    position: landMarkPosition;
    ratio: number;
    userType: string;
    imgSrc: string;
}) => {
    const localVideo = document.getElementById(`${userType}-video`);
    const localContainer = document.getElementById(`${userType}-container`);
    if (!localContainer || !localVideo) return;

    const img = new Image();
    img.src = imgSrc;
    img.width = (Math.round(localVideo.offsetWidth * ratio) * 2) / 3;
    img.height = (Math.round(localVideo.offsetWidth * ratio) * 2) / 3;
    img.classList.add('paw', 'absolute');
    img.style.left =
        Math.round(localVideo.offsetWidth * position.x) - img.width / 2 + 'px';
    img.style.top =
        Math.round(localVideo.offsetHeight * position.y) - img.width / 2 + 'px';
    localContainer.appendChild(img);

    const positionX = Number(img.style.left.replace('px', ''));
    const positionY = Number(img.style.top.replace('px', ''));
    if (userType === 'learner') {
        removeCoin({ x: positionX, y: positionY });
        chooseOX({ x: positionX, y: positionY });
        setTimeout(() => {
            img.remove();
        }, 2000);
        return { x: positionX, y: positionY };
    }
    setTimeout(() => {
        img.remove();
    }, 2000);
};

/**
 * 락앤롤 제스쳐를 한 고양이 손을 그린다.
 * @param {RefObject<HTMLCanvasElement>} param0.localCanvasRef - 로컬 캔버스에 대한 RefObject
 */
export const drawMetalCat = ({ userType }: { userType: TUser }) => {
    const container = document.getElementById(`${userType}-container`);
    const video = document.getElementById(
        `${userType}-video`
    ) as HTMLVideoElement;
    if (!container || !video) return;
    const imgSize = Math.round(video.offsetWidth / 3);
    let animationId: number;
    let height = video.offsetHeight + imgSize;
    let checkPoint = false;
    const animate = () => {
        const metalElements = Array.from(
            container.getElementsByClassName('metal')
        );
        const drawingElement = metalElements.filter((el) =>
            el.classList.contains('drawing')
        );
        for (let i = drawingElement.length - 1; i >= 0; i--) {
            const el = drawingElement[i];
            container.removeChild(el);
        }
        const img = new Image();
        img.src = metalCat;
        img.width = imgSize;
        img.height = imgSize;
        img.classList.add(`drawing`, `metal`, `absolute`);
        img.style.left = '0px';
        img.style.top = height + 'px';
        container.appendChild(img);
        if (checkPoint) {
            height += 8;
            if (height >= video.offsetHeight + imgSize) {
                img.remove();
                cancelAnimationFrame(animationId);
                return;
            }
        } else {
            if (height <= video.offsetHeight - imgSize + 8) {
                setTimeout(() => {
                    checkPoint = true;
                }, 1500);
            } else {
                height -= 8;
            }
        }
        animationId = requestAnimationFrame(animate);
    };
    animate();
};

/**
 * O,X 팻말이미지 요소를 생성하거나 이미 해당 요소가 존재하는 경우 요소를 삭제한다.
 */
export const setOX = () => {
    const learnerContainer = document.getElementById(
        'learner-container'
    ) as HTMLDivElement;
    const oxImg = Array.from(learnerContainer.getElementsByClassName('quiz'));
    if (oxImg.length > 0) {
        oxImg.forEach((img) => img.remove());
    } else {
        const imgO = new Image();
        imgO.src = quizO;
        imgO.width = learnerContainer.offsetWidth / 3;
        imgO.style.top =
            (learnerContainer.offsetHeight - imgO.width) / 2 + 'px';
        imgO.classList.add('absolute', 'quiz-o', 'quiz', 'left-0');
        const imgX = new Image();
        imgX.src = quizX;
        imgX.width = learnerContainer.offsetWidth / 3;
        imgX.style.top =
            (learnerContainer.offsetHeight - imgX.width) / 2 + 'px';
        imgX.classList.add('absolute', 'quiz-x', 'quiz', 'right-0');
        learnerContainer.appendChild(imgO);
        learnerContainer.appendChild(imgX);
    }
};

/**
 * 주어진 x, y 좌표가 특정 이미지 범위 내에 있는지 확인하고, 해당 이미지에 효과를 준다.
 * @param {Object} param0 좌표 객체
 * @param {number} param0.x x 좌표값
 * @param {number} param0.y y 좌표값
 */
export const chooseOX = ({ x, y }: { x: number; y: number }) => {
    const learnerContainer = document.getElementById(
        'learner-container'
    ) as HTMLDivElement;
    const oxImg = Array.from(learnerContainer.getElementsByClassName('quiz'));
    if (oxImg.length === 0) return;
    const imgO = oxImg.find((el) =>
        el.classList.contains('quiz-o')
    ) as HTMLImageElement;
    const imgX = oxImg.find((el) =>
        el.classList.contains('quiz-x')
    ) as HTMLImageElement;
    const rectO = {
        left: 0,
        right: imgO.width,
        top: (learnerContainer.offsetHeight - imgO.width) / 2,
        bottom: (learnerContainer.offsetHeight - imgO.width) / 2 + imgO.height,
    };
    const rectX = {
        left: learnerContainer.offsetWidth - imgX.width,
        right: learnerContainer.offsetWidth,
        top: (learnerContainer.offsetHeight - imgX.width) / 2,
        bottom: (learnerContainer.offsetHeight - imgX.width) / 2 + imgX.height,
    };
    const isInsideO =
        x >= rectO.left &&
        x <= rectO.right &&
        y >= rectO.top &&
        y <= rectO.bottom;
    const isInsideX =
        x >= rectX.left &&
        x <= rectX.right &&
        y >= rectX.top &&
        y <= rectX.bottom;
    if (isInsideO) {
        imgO.style.opacity = '1';
        imgX.style.opacity = '0.5';
    } else if (isInsideX) {
        imgX.style.opacity = '1';
        imgO.style.opacity = '0.5';
    }
};

/**
 * userType에 따른 애니메이션을 생성한다.
 * @param userType posture를 실행한 사람의 userType
 */
export const thumbUp = ({ userType }: { userType: TUser }) => {
    const canvas =
        userType === 'teacher'
            ? (document.getElementById('learner-canvas') as HTMLCanvasElement)
            : (document.getElementById('teacher-canvas') as HTMLCanvasElement);
    if (!canvas) return;
    const imgSrc = userType === 'teacher' ? fireWorks : heartPop;
    const row = userType === 'teacher' ? 7 : 8;
    const col = 5;
    const repeatCount = 2;
    spriteAnimation({ canvas, imgSrc, row, col, repeatCount });
};

/**
 * learner Canvas에 물폭탄 애니메이션을 생성한다.
 */
export const thumbDown = () => {
    const canvas = document.getElementById(
        'learner-canvas'
    ) as HTMLCanvasElement;
    const imgSrc = water;
    const row = 20;
    const col = 5;
    const repeatCount = 1;
    spriteAnimation({ canvas, imgSrc, row, col, repeatCount });
};
