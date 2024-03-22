//UTILITIES
/**
 * 두 숫자 사이에 있는 정수 중에 랜덤으로 정수 하나를 반환한다.
 * @param min 최소값
 * @param max 최대값
 * @returns 최소값과 최대값 사이에서 랜덤하게 뽑은 정수
 */
export const getRandomInteger = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * 특정 배열에서 요소 하나를 랜덤으로 추출한다.
 * @param arr - 배열
 * @returns 배열 내에서 랜덤으로 추출한 요소
 */
export const getRandomElement = (arr: any[]) => {
    return arr[Math.floor(Math.random() * arr.length)];
};

/**
 * 고정된 크기의 배열을 생성하며 배열의 크기가 maxSize를 초과할 경우 가장 오래된 요소를 제거한다.
 * @param maxSize 배열의 최대 크기
 * @returns 배열에 요소를 추가하는 push 함수와 배열을 반환하는 toArray 함수를 포함한 객체
 */
export const createFixedSizeArray = <T>(maxSize: number) => {
    const array: T[] = [];

    const push = (item: T) => {
        if (array.length === maxSize) {
            array.shift();
        }
        array.push(item);
    };

    const toArray = () => array;

    return { push, toArray };
};

/**
 * 세 지점의 중심점을 구한다.
 * @param 세 점의 좌표
 * @returns 세 점의 중심점의 좌표
 */
export const calculateTriangleCenter = (
    x0: number,
    y0: number,
    x5: number,
    y5: number,
    x17: number,
    y17: number
) => {
    const centerX = (x0 + x5 + x17) / 3;
    const centerY = (y0 + y5 + y17) / 3;

    return { x: centerX, y: centerY };
};

/** 스프라이트 애니메이션을 실행한다.
 * @param param0 애니메이션 실행을 위해 필요한 객체
 * @param param0.canvas 애니메이션을 그릴 canvas
 * @param param0.imgSrc sprite 이미지의 경로
 * @param param0.row sprite 이미지의 행
 * @param param0.col sprite 이미지의 열
 * @param param0.repeatCount sprite animation을 반복 실행할 횟수
 */
export const spriteAnimation = ({
    canvas,
    imgSrc,
    row,
    col,
    repeatCount,
}: {
    canvas: HTMLCanvasElement;
    imgSrc: string;
    row: number;
    col: number;
    repeatCount: number;
}) => {
    const sprite = new Image();
    sprite.src = imgSrc;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    sprite.onload = () => {
        let animationId: number;
        const frameWidth = sprite.width / col;
        const frameHeight = sprite.height / row;
        const ratio = frameHeight / frameWidth;
        const frameCount = row * col;
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        let frame = 0;
        let repeatCounter = 0; // 반복 횟수를 추적하기 위한 변수 추가
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const _row = Math.floor(frame / col);
            const _col = frame % col;
            const sx = _col * frameWidth;
            const sy = _row * frameHeight;

            ctx.drawImage(
                sprite,
                sx,
                sy,
                frameWidth,
                frameHeight,
                0,
                0,
                canvas.width,
                canvas.width * ratio
            );
            if (frame === frameCount - 1) {
                if (repeatCounter < repeatCount - 1) {
                    frame = 0;
                    repeatCounter++;
                } else {
                    ctx.clearRect(
                        0,
                        0,
                        canvas.offsetWidth,
                        canvas.offsetHeight
                    );
                    cancelAnimationFrame(animationId);
                    return;
                }
            } else {
                frame = (frame + 1) % frameCount;
            }
            animationId = requestAnimationFrame(animate);
        };

        animate();
    };
};
