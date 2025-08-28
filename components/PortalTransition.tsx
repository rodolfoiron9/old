import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
// FIX: Use namespace import for robust type augmentation.
import * as ReactThreeFiber from '@react-three/fiber';
import { Tube, Stars } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
// FIX: Replace `* as THREE` with named imports from `three` to resolve type errors.
import { Group, Curve, Vector3, BackSide } from 'three';

// FIX: Manually augment JSX namespace to include react-three-fiber components.
// This is a workaround for a potential tsconfig issue that prevents automatic type recognition.
declare global {
  namespace JSX {
    // FIX: Use explicit namespace to ensure types are resolved for JSX intrinsics.
    // FIX: Corrected the type from `IntrinsicElements` to `ThreeElements` to match the export from @react-three/fiber.
    interface IntrinsicElements extends ReactThreeFiber.ThreeElements {}
  }
}

const PortalTunnel: React.FC<{ onAnimationEnd: () => void }> = ({ onAnimationEnd }) => {
    const { camera } = useThree();
    // FIX: Changed THREE.Group to Group.
    const group = useRef<Group>(null!);
    const progress = useRef(0);

    const curve = useMemo(() => {
        // FIX: Changed THREE.Curve and THREE.Vector3 to named imports.
        class CustomSinCurve extends Curve<Vector3> {
            constructor(public scale = 1) {
                super();
            }
            getPoint(t: number) {
                const tx = t * 3 - 1.5;
                const ty = Math.sin(2 * Math.PI * t);
                const tz = 0;
                // FIX: Changed THREE.Vector3 to Vector3.
                return new Vector3(tx, ty, tz).multiplyScalar(this.scale).setZ(-t * 30);
            }
        }
        return new CustomSinCurve(2);
    }, []);

    useFrame((state, delta) => {
        progress.current = Math.min(progress.current + delta * 0.4, 1);

        if (progress.current >= 1) {
            onAnimationEnd();
            return;
        }

        // FIX: Changed `getPointAt` to `getPoint` as per THREE.Curve method signature.
        const newPos = curve.getPoint(progress.current);
        // FIX: Changed `getPointAt` to `getPoint` as per THREE.Curve method signature.
        const lookAtPos = curve.getPoint(Math.min(progress.current + 0.01, 1));
        
        camera.position.copy(newPos);
        camera.lookAt(lookAtPos);
        
        if (group.current) {
            group.current.rotation.z += delta * 0.5;
        }
    });

    return (
        <group ref={group}>
            <Tube args={[curve, 64, 0.5, 8, false]}>
                <meshStandardMaterial
                    color="#9f7aea"
                    // FIX: Changed THREE.BackSide to BackSide.
                    side={BackSide}
                    wireframe
                    emissive="#9f7aea"
                    emissiveIntensity={2}
                />
            </Tube>
            <Stars radius={100} depth={50} count={5000} factor={10} saturation={0} fade speed={2} />
        </group>
    );
};

export const Portal: React.FC<{ onCompleted: () => void }> = ({ onCompleted }) => {
    return (
        <div className="fixed inset-0 z-50 bg-black animate-fade-in">
            <Canvas>
                <PortalTunnel onAnimationEnd={onCompleted} />
                <EffectComposer>
                    <Bloom luminanceThreshold={0.2} luminanceSmoothing={0.9} height={300} intensity={1.5} />
                </EffectComposer>
            </Canvas>
        </div>
    );
};