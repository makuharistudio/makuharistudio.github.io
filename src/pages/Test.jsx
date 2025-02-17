import React, { useEffect, useRef } from 'react';
import '../App.css';
import { initSpaceBackground } from '../assets/theme/background/scripts/bg-space.js';

function Test() {
    const containerRef = useRef();

    useEffect(() => {
        let cleanup;
        if (containerRef.current) {
            cleanup = initSpaceBackground(containerRef.current);
        }
        return () => {
            if (cleanup) cleanup();
        };
    }, []);

    return (
        <div className="container page">
            <div className="interface">
            </div>
            <div className="bg-space" ref={containerRef}></div>
        </div>
    );
}

export default Test;
