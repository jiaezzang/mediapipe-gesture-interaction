import { GestureRecognizerResult } from '@mediapipe/tasks-vision';
import { atom } from 'jotai';

/** 스트리밍 설정 관련 정의 */
export const streamingConfigAtom = atom<{ [key: string]: boolean }>({
    video: true,
    mic: false,
});

/** Local Video Ref */
export const localVideoRefAtom = atom<React.RefObject<HTMLVideoElement> | null>(
    null
);

/** Remote Video Ref */
export const remoteVideoRefAtom =
    atom<React.RefObject<HTMLVideoElement> | null>(null);

/** local 사용자의 포스쳐 정의 */
export const postureAtom = atom<TPosture>(null);

/** 포스쳐 effect 종류 및 매개변수 */
export const postureEffectAtom = atom<TPostureEffect>({ effect: '' });