import React, { useEffect } from 'react';
import Video from './Video';
import { useAtomValue } from 'jotai';
import { postureEffectAtom } from '../../atoms';
import { RTCEvent } from '../../hooks/useSignaling';

export default function LocalVideo({
    videoRef,
    canvasRef,
    id,
    posture,
}: {
    videoRef: React.RefObject<HTMLVideoElement>;
    canvasRef: React.RefObject<HTMLCanvasElement>;
    id: 'teacher' | 'learner';
    posture?: TPosture;
}) {
    const postureEffect = useAtomValue(postureEffectAtom);

    /** posture effect가 변경됨을 감지 및 관리한다  */
    useEffect(() => {
        RTCEvent.emit(
            'send',
            JSON.stringify({ type: 'postureEffect', data: postureEffect })
        );
    }, [postureEffect]);
    return (
        <div id={`${id}-container`} className='relative h-2/5 overflow-hidden'>
            <Video id={`${id}-video`} videoRef={videoRef} />
            <canvas
                id={`${id}-canvas`}
                ref={canvasRef}
                className='absolute object-cover top-0 left-0 object w-full h-full rounded-3xl'
            />
            <div className='absolute top-5 left-5 z-99 text-5xl'>{posture}</div>
        </div>
    );
}
