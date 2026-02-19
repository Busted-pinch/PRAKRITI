import React, { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial, Stars, PointMaterial, Points } from '@react-three/drei';
import * as THREE from 'three';
import { useTheme } from '../context/ThemeContext';
import { useEnvironment } from '../context/EnvironmentContext';

function EcoPoints({ count = 100 }) {
    const points = useMemo(() => {
        const p = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            // Random point on sphere surface
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const r = 1.02; // Slightly above surface
            p[i * 3] = r * Math.sin(phi) * Math.cos(theta);
            p[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
            p[i * 3 + 2] = r * Math.cos(phi);
        }
        return p;
    }, [count]);

    return (
        <Points positions={points} stride={3}>
            <PointMaterial
                transparent
                color="#34d399" // Emerald-400
                size={0.03}
                sizeAttenuation={true}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
            />
        </Points>
    );
}

function AnimatedGlobe({ isDarkMode, environmentalMode }) {
    const sphereRef = useRef();
    const groupRef = useRef();

    useFrame((state, delta) => {
        if (sphereRef.current) {
            // Constant, slow, steady rotation for both modes
            // No wobble, no random speed. Just a planet rotating.
            sphereRef.current.rotation.y += delta * 0.05;
        }
        if (groupRef.current) {
            // Subtle floating for the whole group, very slow
            groupRef.current.rotation.z = Math.sin(state.clock.getElapsedTime() * 0.05) * 0.05;
        }
    });

    const getDistortColor = () => {
        if (environmentalMode) {
            // Healthy: Vibrant Emerald/Teal Mix
            // Dark mode: Uses a much lighter/brighter mint green for visibility against dark bg
            return isDarkMode ? "#6ee7b7" : "#059669"; // Emerald-300 (Dark) or Emerald-600 (Light)
        }
        // Depleted: Desaturated Brown/Grey
        return isDarkMode ? "#4b5563" : "#d6d3d1";
    };

    return (
        <group ref={groupRef} scale={environmentalMode ? 2.8 : 2.5}>
            <Sphere ref={sphereRef} args={[1, 64, 64]}>
                <MeshDistortMaterial
                    color={getDistortColor()}
                    attach="material"
                    distort={environmentalMode ? 0 : 0.4} // Stable in ON mode, Distorted in OFF
                    speed={environmentalMode ? 0 : 2} // No distortion movement in ON mode
                    roughness={environmentalMode ? 0.1 : 0.7}
                    metalness={environmentalMode ? 0.9 : 0.1}
                    wireframe={true} // WIREFRAME FOR BOTH
                    transparent={true}
                    opacity={environmentalMode ? (isDarkMode ? 0.8 : 0.15) : 0.1} // Reduced opacity for Light Mode Healthy (was 0.4)
                    toneMapped={false}
                />

                {/* Eco Points only in ON mode, attached to sphere to rotate with it */}
                {environmentalMode && <EcoPoints count={isDarkMode ? 150 : 80} />}
            </Sphere>

            {/* Subtle Atmosphere Halo - Fixed size, visible in ON mode */}
            {environmentalMode && (
                <mesh scale={[1.1, 1.1, 1.1]}>
                    <sphereGeometry args={[1, 32, 32]} />
                    <meshBasicMaterial
                        color={isDarkMode ? "#34d399" : "#10b981"} // Brighter Emerald-400 in Dark Mode
                        transparent
                        opacity={isDarkMode ? 0.15 : 0.05} // Increased opacity for visibility
                        side={THREE.BackSide}
                        wireframe={true}
                    />
                </mesh>
            )}
        </group>
    );
}

function FloatingParticles({ isDarkMode, environmentalMode }) {
    const group = useRef();
    useFrame(({ clock }) => {
        if (group.current) {
            group.current.rotation.y = clock.getElapsedTime() * 0.02;
        }
    });

    return (
        <group ref={group}>
            {/* Minimal particles */}
            <Stars
                radius={80}
                depth={20}
                count={environmentalMode ? 2000 : 500}
                factor={4}
                saturation={environmentalMode ? 0.9 : 0}
                fade
                speed={1}
            />
        </group>
    )
}

const Background3D = () => {
    const { isDarkMode } = useTheme();
    const { environmentalMode } = useEnvironment();

    return (
        <div className={`fixed inset-0 z-0 pointer-events-none transition-colors duration-2000 ${isDarkMode
            ? 'bg-gradient-to-b from-slate-900 to-slate-950'
            : 'bg-transparent'
            }`}>
            <div className={`absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] transition-opacity duration-1000 ${environmentalMode ? 'opacity-20' : 'opacity-40 brightness-50 contrast-150'} mix-blend-overlay`}></div>

            {/* Environmental Glow Overlay - Only in ON State */}
            <div className={`absolute inset-0 transition-opacity duration-2000 ${environmentalMode ? 'opacity-40' : 'opacity-0'} ${isDarkMode
                ? 'bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-900/40 via-transparent to-transparent'
                : 'bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-300/30 via-transparent to-transparent'
                }`} />

            {/* Depleted Shadow Overlay - Only in OFF State */}
            <div className={`absolute inset-0 transition-opacity duration-2000 ${!environmentalMode ? 'opacity-60' : 'opacity-0'} bg-black/20`} />

            <Canvas camera={{ position: [0, 0, 5] }}>
                <ambientLight intensity={environmentalMode ? (isDarkMode ? 0.8 : 1.2) : 0.3} />
                <pointLight position={[10, 10, 10]} intensity={environmentalMode ? 1.5 : 0.5} />
                <Suspense fallback={null}>
                    <AnimatedGlobe isDarkMode={isDarkMode} environmentalMode={environmentalMode} />
                </Suspense>
                <FloatingParticles isDarkMode={isDarkMode} environmentalMode={environmentalMode} />
            </Canvas>
        </div>
    );
};

export default Background3D;
