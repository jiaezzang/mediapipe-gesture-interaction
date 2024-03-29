import React, { useEffect } from 'react';
import Video from './Video';
import { RTCEvent } from '../../hooks/useSignaling';
import { postureEffectHandler } from '../../utils/posture';
import { removeElement } from '../../utils/utils';

type TPostureEffectSignal = {
    type: 'posture-effect';
    data: TPostureEffect;
};

export default function RemoteVideo({
    videoRef,
    canvasRef,
    id,
    posture
}: {
    videoRef: React.RefObject<HTMLVideoElement>;
    canvasRef: React.RefObject<HTMLCanvasElement>;
    id: 'teacher' | 'learner';
    posture?: TPosture;
}) {
    /** RTCEvent 수신 Emit 등록 */
    useEffect(() => {
        const handleReceiveData = (receiveData: string): void => {
            const { type, data }: TPostureEffectSignal = JSON.parse(receiveData);
            if (type === 'posture-effect') {
                switch (data.effect) {
                    case 'drawMetalCat':
                        postureEffectHandler.drawMetalCat(data.props);
                        break;
                    case 'printPaw':
                        postureEffectHandler.printPaw(data.props);
                        break;
                    case 'tossCoin':
                        postureEffectHandler.tossCoin(data.props);
                        break;
                    case 'grabObject':
                        postureEffectHandler.grabObject(data.props);
                        break;
                    case 'setOX':
                        postureEffectHandler.setOX();
                        break;
                    case 'chooseOX':
                        postureEffectHandler.chooseOX(data.props);
                        break;
                    case 'thumbUp':
                        postureEffectHandler.thumbUp(data.props);
                        break;
                    case 'thumbDown':
                        postureEffectHandler.thumbDown();
                        break;
                    case 'removeCoin':
                        removeElement(data.props);
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
        <div id={`${id}-container`} className="relative aspect-w-3 aspect-h-2 overflow-hidden max-w-screen-md m-2 rounded-3xl shadow-xl">
            <Video id={`${id}-video`} videoRef={videoRef} />
            <canvas id={`${id}-canvas`} ref={canvasRef} className="absolute object-cover top-0 left-0 object w-full h-full rounded-3xl" />
            <div className="absolute top-5 left-5 z-99 text-5xl">{posture}</div>
        </div>
    );
}
