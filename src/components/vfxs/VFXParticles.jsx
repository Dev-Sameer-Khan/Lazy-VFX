import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  AdditiveBlending,
  Color,
  DynamicDrawUsage,
  Euler,
  Matrix4,
  PlaneGeometry,
  Quaternion,
  Vector3,
} from "three";
import { useVFX } from "./VFXStore";
import vertex from "../shaders/vertex.glsl";
import fragment from "../shaders/fragment.glsl";

const tmpPosition = new Vector3();
const tmpRotationEuler = new Euler();
const tmpRotation = new Quaternion();
const tmpScale = new Vector3(1, 1, 1);
const tmpMatrix = new Matrix4();
const tmpColor = new Color();

/**
 * @typedef {Object} VFXParticlesSettings
 * @property {number} [nbParticles=1000]
 * @property {number} [intensity=1]
 * @property {"billboard"|"mesh"} [renderMode="mesh"]
 * @property {[number, number]} [fadeSize=[0.1, 0.9]]
 * @property {[number, number]} [fadeAlpha=[0, 1.0]]
 * @property {[number, number, number]} [gravity=[0, 0, 0]]
 */

/**
 * @typedef {Object} VFXParticlesProps
 * @property {string} name
 * @property {React.ReactElement} [geometry]
 * @property {THREE.Texture} [alphaMap]
 * @property {VFXParticlesSettings} settings
 */

/**
 * @type React.FC<VFXParticlesProps>
 */
const VFXParticles = ({ name, settings = {}, alphaMap, geometry }) => {
  const {
    nbParticles = 1000,
    intensity = 2,
    renderMode = "mesh",
    fadeSize = [0.1, 0.9],
    fadeAlpha = [0, 1.0],
    gravity = [0, 0, 0],
  } = settings;
  const mesh = useRef();
  const defaultGeometry = useMemo(() => new PlaneGeometry(0.5, 0.5), []);

  const onBeforeRender = () => {
    if (!needsUpdate.current || !mesh.current) {
      return;
    }
    const attributes = [
      mesh.current.instanceMatrix,
      mesh.current.geometry.getAttribute("instanceColor"),
      mesh.current.geometry.getAttribute("instanceColorEnd"),
      mesh.current.geometry.getAttribute("instanceDirection"),
      mesh.current.geometry.getAttribute("instanceLifetime"),
      mesh.current.geometry.getAttribute("instanceSpeed"),
      mesh.current.geometry.getAttribute("instanceRotationSpeed"),
    ];
    attributes.forEach((attribute) => {
      attribute.clearUpdateRanges();
      if (lastCursor.current > cursor.current) {
        attribute.addUpdateRange(0, cursor.current * attribute.itemSize);
        attribute.addUpdateRange(
          lastCursor.current * attribute.itemSize,
          nbParticles * attribute.itemSize -
            lastCursor.current * attribute.itemSize,
        );
      } else {
        attribute.addUpdateRange(
          lastCursor.current * attribute.itemSize,
          cursor.current * attribute.itemSize -
            lastCursor.current * attribute.itemSize,
        );
      }
      attribute.needsUpdate = true;
    });
    lastCursor.current = cursor.current;
    needsUpdate.current = false;
  };

  const cursor = useRef(0);
  const lastCursor = useRef(0);
  const needsUpdate = useRef(false);

  const emit = (count, setup) => {
    const instanceColor = mesh.current.geometry.getAttribute("instanceColor");
    const instanceColorEnd =
      mesh.current.geometry.getAttribute("instanceColorEnd");
    const instanceDirection =
      mesh.current.geometry.getAttribute("instanceDirection");
    const instanceLifetime =
      mesh.current.geometry.getAttribute("instanceLifetime");
    const instanceSpeed = mesh.current.geometry.getAttribute("instanceSpeed");
    const instanceRotationSpeed = mesh.current.geometry.getAttribute(
      "instanceRotationSpeed",
    );

    for (let i = 0; i < count; i++) {
      if (cursor.current >= nbParticles) {
        cursor.current = 0;
      }
      const {
        scale,
        rotation,
        rotationSpeed,
        position,
        direction,
        lifetime,
        colorStart,
        colorEnd,
        speed,
      } = setup();

      tmpPosition.set(...position);
      tmpRotationEuler.set(...rotation);
      tmpRotation.setFromEuler(tmpRotationEuler);
      tmpScale.set(...scale);
      tmpMatrix.compose(tmpPosition, tmpRotation, tmpScale);
      mesh.current.setMatrixAt(cursor.current, tmpMatrix);

      tmpColor.set(colorStart);
      instanceColor.set(
        [tmpColor.r, tmpColor.g, tmpColor.b],
        cursor.current * 3,
      );
      tmpColor.set(colorEnd);
      instanceColorEnd.set(
        [tmpColor.r, tmpColor.g, tmpColor.b],
        cursor.current * 3,
      );
      instanceDirection.set(direction, cursor.current * 3);
      instanceLifetime.set(lifetime, cursor.current * 2);
      instanceSpeed.set([speed], cursor.current);
      instanceRotationSpeed.set(rotationSpeed, cursor.current * 3);
      cursor.current++;
      cursor.current = cursor.current % nbParticles;
    }

    mesh.current.instanceMatrix.needsUpdate = true;
    instanceColor.needsUpdate = true;
    instanceColorEnd.needsUpdate = true;
    instanceDirection.needsUpdate = true;
    instanceLifetime.needsUpdate = true;
    instanceSpeed.needsUpdate = true;
    instanceRotationSpeed.needsUpdate = true;
    needsUpdate.current = true;
  };

  const [attributeArrays] = useState({
    instanceColor: new Float32Array(nbParticles * 3),
    instanceColorEnd: new Float32Array(nbParticles * 3),
    instanceDirection: new Float32Array(nbParticles * 3),
    instanceLifetime: new Float32Array(nbParticles * 2),
    instanceSpeed: new Float32Array(nbParticles * 1),
    instanceRotationSpeed: new Float32Array(nbParticles * 3),
  });

  const registerEmitter = useVFX((state) => state.registerEmitter);
  const unregisterEmitter = useVFX((state) => state.unregisterEmitter);

  useEffect(() => {
    registerEmitter(name, emit);
    return () => {
      unregisterEmitter(name);
    };
  }, []);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uIntensity: { value: intensity },
      uFadeSize: { value: fadeSize },
      uFadeAlpha: { value: fadeAlpha },
      uGravity: { value: gravity },
      uAlphaMap: { value: alphaMap },
    }),
    [],
  );

  useFrame(({ clock }) => {
    if (uniforms) {
      uniforms.uTime.value = clock.elapsedTime;
    }
  });

  return (
    <>
      <instancedMesh
        args={[defaultGeometry, null, nbParticles]}
        ref={mesh}
        onBeforeRender={onBeforeRender}
      >
        {geometry}
        <shaderMaterial
        uniforms={uniforms}
        vertexShader={vertex}
        fragmentShader={fragment}
        blending={AdditiveBlending}
        depthWrite={false}
        transparent
        defines={{
          BILLBOARD_MODE: renderMode === "billboard",
          MESH_MODE: renderMode === "mesh",
          ALPHAMAP : alphaMap ? true : false
        }}
      />
        <instancedBufferAttribute
          attach={"geometry-attributes-instanceColor"}
          args={[attributeArrays.instanceColor]}
          itemSize={3}
          count={nbParticles}
          usage={DynamicDrawUsage}
        />
        <instancedBufferAttribute
          attach={"geometry-attributes-instanceColorEnd"}
          args={[attributeArrays.instanceColorEnd]}
          itemSize={3}
          count={nbParticles}
          usage={DynamicDrawUsage}
        />
        <instancedBufferAttribute
          attach={"geometry-attributes-instanceDirection"}
          args={[attributeArrays.instanceDirection]}
          itemSize={3}
          count={nbParticles}
          usage={DynamicDrawUsage}
        />
        <instancedBufferAttribute
          attach={"geometry-attributes-instanceLifetime"}
          args={[attributeArrays.instanceLifetime]}
          itemSize={2}
          count={nbParticles}
          usage={DynamicDrawUsage}
        />
        <instancedBufferAttribute
          attach={"geometry-attributes-instanceSpeed"}
          args={[attributeArrays.instanceSpeed]}
          itemSize={1}
          count={nbParticles}
          usage={DynamicDrawUsage}
        />
        <instancedBufferAttribute
          attach={"geometry-attributes-instanceRotationSpeed"}
          args={[attributeArrays.instanceRotationSpeed]}
          itemSize={3}
          count={nbParticles}
          usage={DynamicDrawUsage}
        />
      </instancedMesh>
    </>
  );
};

export default VFXParticles;
