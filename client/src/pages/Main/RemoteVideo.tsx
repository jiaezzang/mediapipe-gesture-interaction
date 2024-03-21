import React, { useEffect } from 'react';
import Video from './Video';
import { RTCEvent } from '../../hooks/useSignaling';
import {
    chooseOX,
    drawMetalCat,
    grabObject,
    printPaw,
    removeCoin,
    setOX,
    thumbDown,
    thumbUp,
    tossCoin,
} from '../../utils/utils';

type TPostureEffectSignal = {
    type: 'postureEffect';
    data: TPostureEffect;
};

export default function RemoteVideo({
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
    /** RTCEvent 수신 Emit 등록 */
    useEffect(() => {
        const handleReceiveData = (receiveData: string): void => {
            const { type, data } = JSON.parse(receiveData);
            if (type === 'postureEffect') {
                switch (data.effect) {
                    case 'drawMetalCat':
                        drawMetalCat(data.props);
                        break;
                    case 'printPaw':
                        printPaw(data.props);
                        break;
                    case 'tossCoin':
                        tossCoin(data.props);
                        break;
                    case 'removeCoin':
                        removeCoin(data.props);
                        break;
                    case 'grabObject':
                        grabObject(data.props);
                        break;
                    case 'setOX':
                        setOX();
                        break;
                    case 'chooseOX':
                        chooseOX(data.props);
                        break;
                    case 'thumbUp':
                        thumbUp(data.props);
                        break;
                    case 'thumbDown':
                        thumbDown();
                        break;
                }
            }
        };

        RTCEvent.on('receive', handleReceiveData);
        return () => {
            RTCEvent.off('receive', handleReceiveData);
        };
    }, []);
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
