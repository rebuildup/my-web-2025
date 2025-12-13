"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

// Vertex Shader
const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 1.0);
}
`;

// Fragment Shader: Grainy Diffused Light (ざらついた光の拡散)
const fragmentShader = `
uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorBg;
uniform vec3 uColor1; // Deep Purple
uniform vec3 uColor2; // Teal
uniform vec3 uColor3; // Warm Amber

varying vec2 vUv;

// 擬似乱数生成 (High frequency noise for grain)
float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

// 2D Noise
float noise(in vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

void main() {
    vec2 st = vUv;
    float aspect = uResolution.x / uResolution.y;
    vec2 center = vec2(0.5);
    vec2 p = st - center;
    p.x *= aspect; 

    float dist = length(p);

    // 512pxの固定幅に拡散を制限
    // p.x *= aspect で幅方向が拡大されているため、
    // 512pxを画面幅で割った値をaspectで割る（または直接高さで割る）
    float maxWidth = 512.0;
    // 正規化された座標系での512px相当の距離
    // 幅方向がaspect倍されているので、高さ基準で計算
    float normalizedMaxDist = maxWidth / uResolution.y;
    
    // 時間によるゆっくりとした色の変化用のノイズ
    float time = uTime * 0.2;
    float n1 = noise(p * 2.0 + time);
    float n2 = noise(p * 3.0 - time * 1.5);

    // 1. 光の拡散ベース (Radial Gradient)
    // 1024pxの範囲内でのみ拡散するように制限
    float glow = 1.0 - smoothstep(0.0, normalizedMaxDist, dist);
    
    // 2. 色の合成
    vec3 color = uColorBg;
    
    // 中心付近の強い光 (Core)
    vec3 coreColor = mix(uColor1, uColor2, n1); 
    // 外側のアクセント (Outer)
    vec3 outerColor = mix(uColor1, uColor3, n2); 

    // 距離に応じて色を混ぜる
    vec3 lightColor = mix(coreColor, outerColor, smoothstep(0.1, 0.6, dist));
    
    // ベースカラーに光を加算
    // 強度を0.8から0.4に下げて「薄く」する
    color += lightColor * glow * 0.4; 

    // 3. ざらつき (Grain) の付与
    float grain = random(st * time * 0.01 + st); 
    float grainStrength = 0.12;
    
    color += (grain - 0.5) * grainStrength;

    // 4. ヴィネット
    float vignette = 1.0 - smoothstep(0.5, 1.5, length(st - 0.5));
    color *= vignette;

    gl_FragColor = vec4(color, 1.0);
}
`;

function GradientBackground() {
	const mesh = useRef<THREE.Mesh>(null);
	const { size } = useThree();

	const uniforms = useMemo(
		() => ({
			uTime: { value: 0 },
			uResolution: { value: new THREE.Vector2(size.width, size.height) },
			uColorBg: { value: new THREE.Color("#020202") },
			uColor1: { value: new THREE.Color("#5b21b6") }, // Deep Purple
			uColor2: { value: new THREE.Color("#2dd4bf") }, // Teal
			uColor3: { value: new THREE.Color("#f59e0b") }, // Warm Amber
		}),
		[size],
	);

	useFrame((state) => {
		if (mesh.current) {
			const material = mesh.current.material as THREE.ShaderMaterial;
			material.uniforms.uTime.value = state.clock.getElapsedTime();
			material.uniforms.uResolution.value.set(
				state.size.width,
				state.size.height,
			);
		}
	});

	return (
		<mesh ref={mesh}>
			<planeGeometry args={[2, 2]} />
			<shaderMaterial
				vertexShader={vertexShader}
				fragmentShader={fragmentShader}
				uniforms={uniforms}
				transparent={true}
			/>
		</mesh>
	);
}

export default function HomeBackground() {
	return (
		<div className="fixed inset-0 bg-[#020202]" style={{ zIndex: 0 }}>
			<Canvas
				camera={{ position: [0, 0, 1], fov: 75 }}
				dpr={[1, 1.5]}
				gl={{
					powerPreference: "high-performance",
					alpha: true,
					antialias: false,
					stencil: false,
					depth: false,
				}}
				style={{ pointerEvents: "none" }}
			>
				<GradientBackground />
			</Canvas>
		</div>
	);
}
