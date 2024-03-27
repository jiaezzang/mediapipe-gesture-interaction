import { useEffect, useRef, useState } from 'react';
import useSignaling, { RTCEvent } from '../../hooks/useSignaling';
import { useAtomValue, useSetAtom } from 'jotai';
import { localVideoRefAtom, postureAtom, remoteVideoRefAtom, streamingConfigAtom } from '../../atoms';
import useCheckPosture from '../../hooks/useCheckPosture';
import LocalVideo from './LocalVideo';
import RemoteVideo from './RemoteVideo';
import clsx from 'clsx';

/**
 * 비디오 콘텐츠가 있는 메인 컴포넌트
 * @returns {TSX.Element} Main 컴포넌트
 */
export default function Main(): JSX.Element {
    const posture = useAtomValue(postureAtom);
    const userType = sessionStorage.getItem('type') as TUser;
    const [stream, setStream] = useState<MediaStream>();
    const [rtcPeer, setRtcPeer] = useState<RTCPeerConnection>();
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const localCanvasRef = useRef<HTMLCanvasElement>(null);
    const remoteCanvasRef = useRef<HTMLCanvasElement>(null);
    const setRemoteVideoRefAtom = useSetAtom(remoteVideoRefAtom);
    const setLocalVideoRefAtom = useSetAtom(localVideoRefAtom);
    const { connectState } = useSignaling(rtcPeer);
    const streamingConfig = useAtomValue(streamingConfigAtom);
    const { startPostureRecognizer } = useCheckPosture({
        inputVideoRef: localVideoRef
    });

    const connectPeer = (stream: MediaStream) => {
        const config: RTCConfiguration = {
            iceServers: [
                {
                    urls: import.meta.env.VITE_APP_RTC_STUN ?? 'stun:stun.l.google.com:19302'
                }
            ]
        };
        const rtcPeer = new RTCPeerConnection(config);
        stream.getTracks().forEach((track) => rtcPeer.addTrack(track, stream));
        rtcPeer.ontrack = (e) => {
            if (!remoteVideoRef.current) return;
            remoteVideoRef.current.srcObject = e.streams[0];
            remoteVideoRef.current.play().catch((error) => {
                console.error(error);
            });
        };
        setRtcPeer(rtcPeer);
    };

    /** Local Video */
    useEffect(() => {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return;
        navigator.mediaDevices?.getUserMedia({ video: true, audio: true }).then(setStream);
    }, []);

    useEffect(() => {
        if (!localVideoRef.current || !stream) return;
        localVideoRef.current.srcObject = stream;
    }, [stream]);

    useEffect(() => {
        setLocalVideoRefAtom(localVideoRef);
    }, [localVideoRef, setLocalVideoRefAtom]);

    /** Remote Video */
    useEffect(() => {
        if (import.meta.env.DEV && connectState === 'connected') return;
        if (!stream) return;
        connectPeer(stream);
    }, [stream]);

    useEffect(() => {
        setRemoteVideoRefAtom(remoteVideoRef);
    }, [remoteVideoRef, setRemoteVideoRefAtom]);

    /**카메라, 영상 송출 관련 */
    useEffect(() => {
        if (!stream) return;
        stream.getVideoTracks().forEach((track) => {
            track.enabled = streamingConfig.video;
        });
        stream.getAudioTracks().forEach((track) => {
            track.enabled = streamingConfig.audio;
        });

        const _data = { type: 'video-config', config: streamingConfig };
        RTCEvent.emit('send', JSON.stringify(_data));
    }, [streamingConfig]);

    /** RTCEvent 수신 Emit 등록 */
    useEffect(() => {
        const receiveData = (data: string): void => {
            const parsedData = JSON.parse(data);

            if (parsedData.type === 'video-config' || parsedData.type === 'posture-effect') {
                return;
            }
        };

        RTCEvent.on('receive', receiveData);
        return () => {
            RTCEvent.off('receive', receiveData);
        };
    }, []);

    useEffect(() => {
        startPostureRecognizer(userType);
    }, [userType]);

    return (
        <div className={clsx('top-container relative w-full h-screen', userType === 'teacher' ? 'bg-green-100' : 'bg-[navy] bg-opacity-20')}>
            <main className="flex items-center h-full rounded m-auto gap-3 mb-5 mx-[32px]">
                <div className="flex flex-col flex-[1] h-full gap-3 justify-center items-center py-4">
                    {userType === 'teacher' ? (
                        <>
                            <LocalVideo videoRef={localVideoRef} canvasRef={localCanvasRef} id="teacher" posture={posture} />
                            <RemoteVideo videoRef={remoteVideoRef} canvasRef={remoteCanvasRef} id="learner" />
                        </>
                    ) : (
                        <>
                            <RemoteVideo videoRef={remoteVideoRef} canvasRef={remoteCanvasRef} id="teacher" />
                            <LocalVideo videoRef={localVideoRef} canvasRef={localCanvasRef} id="learner" posture={posture} />
                        </>
                    )}
                </div>
            </main>
        </div>
    );
}
