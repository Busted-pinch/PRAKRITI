import React, { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial, Stars, PointMaterial, Points } from '@react-three/drei';
import { useLocation } from 'react-router-dom';
import * as THREE from 'three';
import { useTheme } from '../context/ThemeContext';
import { useEnvironment } from '../context/EnvironmentContext';
import VantaFog from './VantaFog';

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

// Interpolation helper
const lerp = (start, end, t) => start * (1 - t) + end * t;

function AnimatedGlobe({ isDarkMode, environmentalMode, isLandingPage }) {
    const sphereRef = useRef();
    const groupRef = useRef();

    // Refs for transition state
    const transitionRef = useRef({
        distort: 0.4,
        scale: 2.5,
        colorR: 0, colorG: 0, colorB: 0, // Will be set on first frame
        roughness: 0.7,
        metalness: 0.1,
        opacity: 0.1
    });

    useFrame((state, delta) => {
        if (!sphereRef.current) return;

        // constant rotation
        sphereRef.current.rotation.y += delta * 0.05;

        // Target values
        const targetDistort = environmentalMode ? 0 : 0.4;
        const targetScale = environmentalMode ? 2.8 : 2.5;
        const targetRoughness = environmentalMode ? 0.1 : 0.7;
        const targetMetalness = environmentalMode ? 0.9 : 0.1;

        // Colors
        // OFF (Depleted): #4b5563 (Dark) or #d6d3d1 (Light) -> RGB
        // ON (Healthy): #6ee7b7 (Dark) or #10b981 (Light - Brighter Emerald-500)
        const targetColor = new THREE.Color(
            environmentalMode
                ? (isDarkMode ? "#6ee7b7" : "#10b981")
                : (isDarkMode ? "#4b5563" : "#d6d3d1")
        );

        const targetOpacity = environmentalMode ? (isDarkMode ? 0.8 : 0.15) : 0.1;

        // Interpolation speed
        const speed = 2.0 * delta;

        // Smoothly update values
        const current = transitionRef.current;
        current.distort = lerp(current.distort, targetDistort, speed);
        current.scale = lerp(current.scale, targetScale, speed);
        current.roughness = lerp(current.roughness, targetRoughness, speed);
        current.metalness = lerp(current.metalness, targetMetalness, speed);
        current.opacity = lerp(current.opacity, targetOpacity, speed);

        // Update material properties
        const material = sphereRef.current.material;
        material.distort = current.distort;
        material.roughness = current.roughness;
        material.metalness = current.metalness;
        material.opacity = current.opacity;

        // Color interpolation
        material.color.lerp(targetColor, speed);

        // Group scale
        if (groupRef.current) {
            groupRef.current.scale.setScalar(current.scale);
            groupRef.current.rotation.z = Math.sin(state.clock.getElapsedTime() * 0.05) * 0.05;
        }
    });

    return (
        <group ref={groupRef}>
            <Sphere ref={sphereRef} args={[1, 64, 64]}>
                <MeshDistortMaterial
                    color={"#d6d3d1"} // Initial color, will be overridden by lerp
                    attach="material"
                    distort={0.4}
                    speed={environmentalMode ? 0 : 2} // Keep speed logic instant for now or interpolate too
                    roughness={0.7}
                    metalness={0.1}
                    wireframe={true}
                    transparent={true}
                    opacity={0.1}
                    toneMapped={false}
                />

                {/* Eco Points - Fade in/out could be added here, currently instant on/off */}
                {environmentalMode && <EcoPoints count={isDarkMode ? 150 : 80} />}
            </Sphere>

            {/* Subtle Atmosphere Halo */}
            {environmentalMode && (
                <mesh scale={[1.1, 1.1, 1.1]}>
                    <sphereGeometry args={[1, 32, 32]} />
                    <meshBasicMaterial
                        color={isDarkMode ? "#34d399" : "#10b981"}
                        transparent
                        opacity={isDarkMode ? 0.15 : 0.05}
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
    const location = useLocation();
    const isLandingPage = location.pathname === '/';

    return (
        <div className={`fixed inset-0 z-0 pointer-events-none transition-colors duration-2000 ${isDarkMode
            ? 'bg-gradient-to-b from-slate-900 to-slate-950'
            : (environmentalMode
                ? 'bg-gradient-to-br from-emerald-50 via-teal-50 to-sky-50'
                : 'bg-transparent')
            }`}>
            <div className={`absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] transition-opacity duration-1000 ${environmentalMode
                ? (isLandingPage && !isDarkMode ? 'opacity-0' : 'opacity-10')
                : 'opacity-40 brightness-50 contrast-150'
                } mix-blend-overlay`}></div>

            {/* Environmental Glow Overlay - Only in ON State - Hide for Vanta on Landing */}
            <div className={`absolute inset-0 transition-opacity duration-2000 ${environmentalMode && !(isLandingPage && !isDarkMode) ? 'opacity-40' : 'opacity-0'
                } ${isDarkMode
                    ? 'bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-900/40 via-transparent to-transparent'
                    : 'bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-300/30 via-transparent to-transparent'
                }`} />

            {/* Vanta Fog - Only in Light Mode + Environmental Mode */}
            {!isDarkMode && environmentalMode && (
                <div className="absolute inset-0 z-0 opacity-40">
                    <VantaFog />
                </div>
            )}

            {/* Depleted Shadow Overlay - Only in OFF State */}
            {!environmentalMode && (
                <div className="absolute inset-0 transition-opacity duration-2000 opacity-60 bg-black/20" />
            )}

            <Canvas camera={{ position: [0, 0, 5] }}>
                <ambientLight intensity={environmentalMode ? (isDarkMode ? 0.8 : 1.2) : 0.3} />
                <pointLight position={[10, 10, 10]} intensity={environmentalMode ? 1.5 : 0.5} />
                <Suspense fallback={null}>
                    <AnimatedGlobe isDarkMode={isDarkMode} environmentalMode={environmentalMode} isLandingPage={isLandingPage} />
                </Suspense>
                <FloatingParticles isDarkMode={isDarkMode} environmentalMode={environmentalMode} />
            </Canvas>
        </div>
    );
};

export default Background3D;
