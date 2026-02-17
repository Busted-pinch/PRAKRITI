import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial, Stars } from '@react-three/drei';
import { useTheme } from '../context/ThemeContext';

function AnimatedGlobe({ isDarkMode }) {
    const sphereRef = useRef();

    useFrame(({ clock }) => {
        if (sphereRef.current) {
            sphereRef.current.rotation.y = clock.getElapsedTime() * 0.05;
            sphereRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.1) * 0.1;
        }
    });

    return (
        <Sphere ref={sphereRef} args={[1, 64, 64]} scale={2.5}>
            <MeshDistortMaterial
                color={isDarkMode ? "#4ade80" : "#0d9488"} // Green-400 (Dark) vs Teal-600 (Light)
                attach="material"
                distort={0.4}
                speed={1.5}
                roughness={0.5}
                metalness={0.1}
                wireframe
                transparent
                opacity={isDarkMode ? 0.15 : 0.05} // Subtler in light mode
            />
        </Sphere>
    );
}

function FloatingParticles({ isDarkMode }) {
    const group = useRef();
    useFrame(({ clock }) => {
        if (group.current) {
            group.current.rotation.y = clock.getElapsedTime() * 0.02;
        }
    });

    return (
        <group ref={group}>
            <Stars
                radius={100}
                depth={50}
                count={5000}
                factor={4}
                saturation={0}
                fade
                speed={1}
            />
        </group>
    )
}

const Background3D = () => {
    const { isDarkMode } = useTheme();

    return (
        <div className={`fixed inset-0 z-0 pointer-events-none transition-colors duration-1000 ${isDarkMode
            ? 'bg-gradient-to-b from-gray-900 to-gray-800'
            : 'bg-transparent' // In light mode, let the parent gradient show through
            }`}>
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-100 mix-blend-overlay"></div>
            <Canvas camera={{ position: [0, 0, 5] }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} />
                <AnimatedGlobe isDarkMode={isDarkMode} />
                {isDarkMode && <FloatingParticles isDarkMode={isDarkMode} />}
            </Canvas>
        </div>
    );
};

export default Background3D;
