import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
// We need to ensure window.THREE is available for Vanta
if (typeof window !== 'undefined') {
    window.THREE = THREE;
}

import FOG from 'vanta/dist/vanta.fog.min';

const VantaFog = () => {
    const vantaRef = useRef(null);
    const [vantaEffect, setVantaEffect] = useState(null);

    useEffect(() => {
        if (!vantaEffect && vantaRef.current) {
            try {
                const effect = FOG({
                    el: vantaRef.current,
                    THREE: THREE,
                    mouseControls: true,
                    touchControls: true,
                    gyroControls: false,
                    minHeight: 200.00,
                    minWidth: 200.00,
                    highlightColor: 0x13ed5a,
                    midtoneColor: 0x36caca,
                    lowlightColor: 0xb3f7d9,
                    baseColor: 0xb8ffc8
                });
                setVantaEffect(effect);
            } catch (error) {
                console.error("Failed to initialize Vanta Fog:", error);
            }
        }
        return () => {
            if (vantaEffect) vantaEffect.destroy();
        };
    }, [vantaEffect]);

    return (
        <div ref={vantaRef} className="absolute inset-0 z-0 h-full w-full" style={{ pointerEvents: 'none' }} />
    );
};

export default VantaFog;
