import { useEffect } from 'react';

export default function Video({
    id,
    videoRef,
}: {
    id?: string;
    videoRef: React.RefObject<HTMLVideoElement>;
}) {
    return (
        <video
            id={id}
            className={`object-cover w-full h-full rounded-3xl`}
            ref={videoRef}
            autoPlay
        ></video>
    );
}
