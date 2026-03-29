import { useFrame } from "@react-three/fiber";
import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import { useMemo } from "react";
import { useRef } from "react";
import * as THREE from "three";
import { useVFX } from "./VFXStore";
import vertex from "../shaders/vertex.glsl";
import fragment from "../shaders/fragment.glsl";

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

const tempPosition = new THREE.Vector3();
const tempuRotationEuler = new THREE.Euler();
const tempQuaternion = new THREE.Quaternion();
const tempScale = new THREE.Vector3(1, 1, 1);
const tempMatrix = new THREE.Matrix4();
const tempColor = new THREE.Color();

const VFXParticals = ({ name, settings = {}, alphaMap, geometry }) => {
  const { nParticals = 1000, intensity = 1, renderMode = "mesh", fadeSize= [0.1,0.9], fadeAlpha= [0,1], gravity = [0, 0, 0]} = settings;
  const Geometry = new THREE.PlaneGeometry();
  const mesh = useRef();

  const [attributesArray] = useState({
    instanceColor: new Float32Array(nParticals * 3),
    instanceColorEnd: new Float32Array(nParticals * 3),
    instanceDirection: new Float32Array(nParticals * 3),
    instanceLifetime: new Float32Array(nParticals * 2),
    instanceSpeed: new Float32Array(nParticals * 1),
    instanceRotationSpeed: new Float32Array(nParticals * 3),
  });

  const cursor = useRef(0);
  const lastCursor = useRef(0);
  const needsUpdate = useRef(false);

  const emit = (count, setup) => {
    const instenceColor = mesh.current.geometry.getAttribute("instanceColor");
    const instenceColorEnd =
      mesh.current.geometry.getAttribute("instanceColorEnd");
    const instenceDirection =
      mesh.current.geometry.getAttribute("instanceDirection");
    const instenceLifetime =
      mesh.current.geometry.getAttribute("instanceLifetime");
    const instenceSpeed = mesh.current.geometry.getAttribute("instanceSpeed");
    const instenceRotationSpeed = mesh.current.geometry.getAttribute(
      "instanceRotationSpeed",
    );

    for (let i = 0; i < count; i++) {
      if (cursor.current >= nParticals) {
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

      tempPosition.set(...position);
      tempuRotationEuler.set(...rotation);
      tempQuaternion.setFromEuler(tempuRotationEuler);
      tempScale.set(...scale);
      tempMatrix.compose(tempPosition, tempQuaternion, tempScale);
      tempColor.set(colorStart);
      tempColor.set(colorEnd);

      instenceDirection.set(direction, cursor.current * 3);
      instenceLifetime.set(lifetime, cursor.current * 2);
      instenceSpeed.set([speed], cursor.current);
      instenceRotationSpeed.set(rotationSpeed, cursor.current * 3);
      instenceColor.set(
        [tempColor.r, tempColor.g, tempColor.b],
        cursor.current * 3,
      );
      instenceColorEnd.set(
        [tempColor.r, tempColor.g, tempColor.b],
        cursor.current * 3,
      );

      mesh.current.setMatrixAt(cursor.current, tempMatrix);
    }
    needsUpdate.current = true;

    cursor.current++;
    cursor.current = cursor.current % nParticals;
  };

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
          nParticals * attribute.itemSize -
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
    <instancedMesh
      ref={mesh}
      args={[Geometry, null, nParticals]}
      onBeforeRender={onBeforeRender}
    >
      {geometry}
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={vertex}
        fragmentShader={fragment}
        blending={THREE.AdditiveBlending}
        depthTest={false}
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
        args={[attributesArray.instanceColor]}
        itemSize={3}
        count={nParticals}
        usage={THREE.DynamicDrawUsage}
      />
      <instancedBufferAttribute
        attach={"geometry-attributes-instanceColorEnd"}
        args={[attributesArray.instanceColorEnd]}
        itemSize={3}
        count={nParticals}
        usage={THREE.DynamicDrawUsage}
      />
      <instancedBufferAttribute
        attach={"geometry-attributes-instanceDirection"}
        args={[attributesArray.instanceDirection]}
        itemSize={3}
        count={nParticals}
        usage={THREE.DynamicDrawUsage}
      />
      <instancedBufferAttribute
        attach={"geometry-attributes-instanceLifetime"}
        args={[attributesArray.instanceLifetime]}
        itemSize={2}
        count={nParticals}
        usage={THREE.DynamicDrawUsage}
      />
      <instancedBufferAttribute
        attach={"geometry-attributes-instanceSpeed"}
        args={[attributesArray.instanceSpeed]}
        itemSize={1}
        count={nParticals}
        usage={THREE.DynamicDrawUsage}
      />
      <instancedBufferAttribute
        attach={"geometry-attributes-instanceRotationSpeed"}
        args={[attributesArray.instanceRotationSpeed]}
        itemSize={3}
        count={nParticals}
        usage={THREE.DynamicDrawUsage}
      />
    </instancedMesh>
  );
};

export default VFXParticals;
