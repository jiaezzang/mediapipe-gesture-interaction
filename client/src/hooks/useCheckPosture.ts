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
import { postureAtom, postureEffectAtom } from '../atoms';
import {
    createFixedSizeArray,
    getRandomElement,
    getRandomNumber,
} from '../utils/utils';
import {
    getLandMarkPosition,
    drawMetalCat,
    grabObject,
    makeGestureRecognizer,
    printPaw,
    setOX,
    thumbDown,
    thumbUp,
    tossCoin,
} from '../utils/posture';

let lastWebcamTime = -1;
let runningMode: string = 'none';
let prevZ: number;
let prevCore: number;
const maxSize = 2;
const prevPosture = createFixedSizeArray<TPosture>(maxSize);
let prevTime: number;

export default function useCheckPosture({
    inputVideoRef,
}: {
    inputVideoRef: RefObject<HTMLVideoElement>;
}) {
    const setPosture = useSetAtom(postureAtom);
    const setPostureEffect = useSetAtom(postureEffectAtom);
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
            updatePostureEffect({ result, userType });
        }
        window.requestAnimationFrame(() => predictWebcam(userType));
        lastWebcamTime = inputVideoRef.current.currentTime;
    };

    /**
     * 포스쳐 인식에 따른 효과를 부여한다.
     */
    const updatePostureEffect = ({
        result,
        userType,
    }: {
        result: GestureRecognizerResult;
        userType: TUser;
    }) => {
        const prevPosArr = prevPosture.toArray();
        if (!inputVideoRef.current) return;
        if (!result || result.landmarks.length === 0) {
            prevPosture.push(null);
            setPosture(null);
            return;
        }
        const data = makeGestureRecognizer(result);
        if (prevPosArr[maxSize - 1] !== data.icon) {
            if (
                userType === 'teacher' &&
                prevPosArr[maxSize - 1] === '✊' &&
                data.icon === '🖐️'
            ) {
                const imgPositionY = getRandomNumber(0.25, 0.5);
                tossCoin({
                    position:
                        data.handedness === 'Left'
                            ? getLandMarkPosition(result, 5)
                            : getLandMarkPosition(result, 17),
                    ratio: getLandMarkPosition(result, 5).palmRatio,
                    imgPositionY,
                });
                setPostureEffect({
                    effect: 'tossCoin',
                    props: {
                        position:
                            data.handedness === 'Left'
                                ? getLandMarkPosition(result, 5)
                                : getLandMarkPosition(result, 17),
                        ratio: getLandMarkPosition(result, 5).palmRatio,
                        imgPositionY,
                    },
                });
            }
            if (
                userType === 'learner' &&
                prevPosArr[maxSize - 1] === '🖐️' &&
                data.icon === '✊'
            ) {
                grabObject({
                    pos0: getLandMarkPosition(result, 0),
                    pos5: getLandMarkPosition(result, 5),
                    pos17: getLandMarkPosition(result, 17),
                });
                setPostureEffect({
                    effect: 'grabObject',
                    props: {
                        pos0: getLandMarkPosition(result, 0),
                        pos5: getLandMarkPosition(result, 5),
                        pos17: getLandMarkPosition(result, 17),
                    },
                });
            }
            if (
                userType === 'teacher' &&
                prevPosArr[maxSize - 2] === '✌️' &&
                prevPosArr[maxSize - 1] === '✊' &&
                data.icon === '✌️'
            ) {
                setOX();
                setPostureEffect({ effect: 'setOX' });
            }
            if (data.icon === '🤟') {
                drawMetalCat({ userType });
                setPostureEffect({
                    effect: 'drawMetalCat',
                    props: { userType },
                });
            }
            if (data.icon === '👍') {
                thumbUp({ userType });
                setPostureEffect({ effect: 'thumbUp', props: { userType } });
            }
            if (userType === 'teacher' && data.icon === '👎') {
                thumbDown();
                setPostureEffect({ effect: 'thumbDown' });
            }
            if (
                data.icon !== null ||
                (data.icon === null && prevTime && Date.now() - prevTime >= 800)
            ) {
                setPosture(data.icon);
                prevPosture.push(data.icon);
                prevTime = Date.now();
            }
        }
        if (prevPosArr[maxSize - 1] === '☝️') {
            if (
                getLandMarkPosition(result, 8).z - prevZ < -0.035 &&
                Math.abs(getLandMarkPosition(result, 0).z - prevCore) < 0.01
            ) {
                /** 발자국 이미지 */
                const paw = [bearPaw, catPaw, dogPaw];
                const imgSrc = getRandomElement(paw);

                printPaw({
                    position: getLandMarkPosition(result, 8),
                    ratio: getLandMarkPosition(result, 8).palmRatio,
                    userType,
                    imgSrc,
                });
                setPostureEffect({
                    effect: 'printPaw',
                    props: {
                        position: getLandMarkPosition(result, 8),
                        ratio: getLandMarkPosition(result, 8).palmRatio,
                        userType,
                        imgSrc,
                    },
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
