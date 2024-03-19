import bearPaw from '../assets/images/bear_paw.png';
import catPaw from '../assets/images/cat_paw.png';
import dogPaw from '../assets/images/dog_paw.png';
import {
    FilesetResolver,
    GestureRecognizer,
    GestureRecognizerResult,
} from '@mediapipe/tasks-vision';
import { useSetAtom } from 'jotai';
import { RefObject, useMemo } from 'react';
import { postureAtom } from '../atoms';
import {
    drawMetalCat,
    getLandMarkPosition,
    getRandomElement,
    makeGestureRecognizer,
    printPaw,
    tossCoin,
} from '../utils/utils';

let lastWebcamTime = -1;
let runningMode: string = 'none';
let prevZ: number;
let prevCore: number;
let prevPosture: TPosture;
let prevTime: number;

export default function useCheckPosture({
    inputVideoRef,
    localCanvasRef,
    remoteCanvasRef,
}: {
    inputVideoRef: RefObject<HTMLVideoElement>;
    localCanvasRef: RefObject<HTMLCanvasElement>;
    remoteCanvasRef: RefObject<HTMLCanvasElement>;
}) {
    const setPosture = useSetAtom(postureAtom);
    const vision = useMemo(
        async () =>
            FilesetResolver.forVisionTasks(
                'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
            ),
        []
    );
    const gestureRecognizer = useMemo(
        async () =>
            await GestureRecognizer.createFromOptions(await vision, {
                baseOptions: {
                    modelAssetPath:
                        'https://storage.googleapis.com/mediapipe-tasks/gesture_recognizer/gesture_recognizer.task',
                },
                numHands: 2,
                cannedGesturesClassifierOptions: {
                    categoryAllowlist: [
                        'Closed_Fist',
                        'Open_Palm',
                        'Pointing_Up',
                        'Thumb_Down',
                        'Thumb_Up',
                        'Victory',
                        'ILoveYou',
                    ],
                },
            }),
        [vision]
    );

    /**
     * 비디오 웹캠을 예측한다.
     */
    const predictWebcam = async (userType: TUser) => {
        if (!inputVideoRef.current) return;
        if (runningMode === 'none') {
            runningMode = 'VIDEO';
            (await gestureRecognizer).setOptions({ runningMode: 'VIDEO' });
        }
        if (inputVideoRef.current.currentTime !== lastWebcamTime) {
            const result = (await gestureRecognizer).recognizeForVideo(
                inputVideoRef.current,
                Date.now(),
                {}
            );
            setPostureEffect({ result, userType });
        }
        window.requestAnimationFrame(() => predictWebcam(userType));
        lastWebcamTime = inputVideoRef.current.currentTime;
    };

    const setPostureEffect = ({
        result,
        userType,
    }: {
        result: GestureRecognizerResult;
        userType: TUser;
    }) => {
        if (!inputVideoRef.current) return;
        if (!result || result.landmarks.length === 0) {
            prevPosture = null;
            setPosture(null);
            return;
        }
        const data = makeGestureRecognizer(result);
        if (prevPosture !== data.icon) {
            if (
                // userType === 'teacher' &&
                prevPosture === '✊' &&
                data.icon === '🖐️'
            ) {
                tossCoin({
                    x:
                        data.handedness === 'Left'
                            ? getLandMarkPosition(result, 5).x
                            : getLandMarkPosition(result, 17).x,
                    y:
                        data.handedness === 'Left'
                            ? getLandMarkPosition(result, 5).y
                            : getLandMarkPosition(result, 17).y,
                    ratio: getLandMarkPosition(result, 5).palmRatio,
                });
            }
            if (data.icon === '🤟') {
                drawMetalCat(userType);
            }
            if (
                data.icon !== null ||
                (data.icon === null && prevTime && Date.now() - prevTime >= 700)
            ) {
                setPosture(data.icon);
                prevPosture = data.icon;
                prevTime = Date.now();
            }
        }
        if (prevPosture === '☝️') {
            if (
                getLandMarkPosition(result, 8).z - prevZ < -0.035 &&
                Math.abs(getLandMarkPosition(result, 0).z - prevCore) < 0.01
            ) {
                /** 발자국 이미지 */
                const paw = [bearPaw, catPaw, dogPaw];
                const imgSrc = getRandomElement(paw);

                printPaw({
                    localVideoRef: inputVideoRef,
                    x: getLandMarkPosition(result, 8).x,
                    y: getLandMarkPosition(result, 8).y,
                    ratio: getLandMarkPosition(result, 8).palmRatio,
                    userType,
                    imgSrc,
                });
            }
            prevZ = getLandMarkPosition(result, 8).z;
            prevCore = getLandMarkPosition(result, 0).z;
        }
    };

    /**
     * 포스쳐 인식을 시작한다.
     */
    const startPostureRecognizer = (userType: TUser) => {
        if (userType) {
            navigator.mediaDevices
                .getUserMedia({ video: true })
                .then(function (stream) {
                    if (!inputVideoRef.current) return;
                    inputVideoRef.current.srcObject = stream;
                    inputVideoRef.current.addEventListener('loadeddata', () =>
                        predictWebcam(userType)
                    );
                });
        }
    };

    return { startPostureRecognizer };
}
