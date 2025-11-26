"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

interface VisualTimerProps {
	timeLeft: number; // in seconds (with decimals)
	totalDuration: number; // in seconds
	isRunning: boolean;
	sessionType: "work" | "shortBreak" | "longBreak";
}

export default function VisualTimer({
	timeLeft,
	totalDuration,
	isRunning,
	sessionType,
}: VisualTimerProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const sceneRef = useRef<THREE.Scene | null>(null);
	const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
	const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
	const ringRef = useRef<THREE.Mesh | null>(null);
	const animationFrameRef = useRef<number | null>(null);
	const timeLeftRef = useRef(timeLeft);
	const totalDurationRef = useRef(totalDuration);

	useEffect(() => {
		if (!containerRef.current) return;

		const container = containerRef.current;
		const width = container.clientWidth;
		const height = container.clientHeight;

		// Scene setup
		const scene = new THREE.Scene();
		const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
		camera.position.z = 5;

		const renderer = new THREE.WebGLRenderer({
			antialias: true,
			alpha: true,
		});
		renderer.setSize(width, height);
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
		container.appendChild(renderer.domElement);

		// Outer ring (background) - static
		const ringGeometry = new THREE.RingGeometry(1.8, 2.2, 128);
		const ringMaterial = new THREE.MeshBasicMaterial({
			color: sessionType === "work" ? 0x4a90e2 : 0x50c878,
			side: THREE.DoubleSide,
			transparent: true,
			opacity: 0.2,
		});
		const ring = new THREE.Mesh(ringGeometry, ringMaterial);
		scene.add(ring);

		// Progress ring (inner) - will be updated dynamically
		const progressGeometry = new THREE.RingGeometry(1.8, 2.0, 128);
		const progressMaterial = new THREE.MeshBasicMaterial({
			color: sessionType === "work" ? 0x2e5c8a : 0x3da35d,
			side: THREE.DoubleSide,
			transparent: true,
			opacity: 0.9,
		});
		const progressRing = new THREE.Mesh(progressGeometry, progressMaterial);
		scene.add(progressRing);

		// Particles for visual effect
		const particles: THREE.Mesh[] = [];
		const particleCount = 60;
		const particleGeometry = new THREE.SphereGeometry(0.03, 8, 8);
		const particleMaterial = new THREE.MeshBasicMaterial({
			color: sessionType === "work" ? 0x6bb6ff : 0x7dd87f,
			transparent: true,
			opacity: 0.7,
		});

		for (let i = 0; i < particleCount; i++) {
			const particle = new THREE.Mesh(
				particleGeometry,
				particleMaterial.clone(),
			);
			const angle = (i / particleCount) * Math.PI * 2;
			const radius = 2.4;
			particle.position.x = Math.cos(angle) * radius;
			particle.position.y = Math.sin(angle) * radius;
			particle.position.z = 0;
			scene.add(particle);
			particles.push(particle);
		}

		sceneRef.current = scene;
		rendererRef.current = renderer;
		cameraRef.current = camera;
		ringRef.current = ring;

		// Animation loop
		const animate = () => {
			// Rotate rings slowly
			ring.rotation.z += 0.002;
			progressRing.rotation.z -= 0.001;

			// Update progress ring based on time left (use ref for latest value)
			const currentTimeLeft = timeLeftRef.current;
			const currentTotalDuration = totalDurationRef.current;
			const progress = Math.max(
				0,
				Math.min(1, currentTimeLeft / currentTotalDuration),
			);
			const startAngle = -Math.PI / 2;
			const angleSpan = progress * Math.PI * 2;

			// Create a new geometry for the progress ring
			if (angleSpan > 0.01) {
				const newProgressGeometry = new THREE.RingGeometry(
					1.8,
					2.0,
					128,
					1,
					startAngle,
					angleSpan,
				);
				progressRing.geometry.dispose();
				progressRing.geometry = newProgressGeometry;
				progressRing.visible = true;
			} else {
				// Hide progress ring when almost complete
				progressRing.visible = false;
			}

			// Animate particles in a circular motion
			const time = Date.now() * 0.0005;
			particles.forEach((particle, i) => {
				const baseAngle = (i / particleCount) * Math.PI * 2;
				const angle = baseAngle + time;
				const radius = 2.4 + Math.sin(time * 2 + i * 0.1) * 0.15;
				particle.position.x = Math.cos(angle) * radius;
				particle.position.y = Math.sin(angle) * radius;
				// Add subtle pulsing
				const scale = 1 + Math.sin(time * 3 + i) * 0.1;
				particle.scale.set(scale, scale, scale);
			});

			renderer.render(scene, camera);
			animationFrameRef.current = requestAnimationFrame(animate);
		};

		animate();

		// Handle resize
		const handleResize = () => {
			if (!containerRef.current || !camera || !renderer) return;
			const newWidth = containerRef.current.clientWidth;
			const newHeight = containerRef.current.clientHeight;
			camera.aspect = newWidth / newHeight;
			camera.updateProjectionMatrix();
			renderer.setSize(newWidth, newHeight);
		};

		window.addEventListener("resize", handleResize);

		return () => {
			window.removeEventListener("resize", handleResize);
			if (animationFrameRef.current) {
				cancelAnimationFrame(animationFrameRef.current);
			}
			renderer.dispose();
			ringGeometry.dispose();
			ringMaterial.dispose();
			progressGeometry.dispose();
			progressMaterial.dispose();
			particleGeometry.dispose();
			particleMaterial.dispose();
			particles.forEach((p) => {
				p.geometry.dispose();
				(p.material as THREE.Material).dispose();
			});
			if (container.contains(renderer.domElement)) {
				container.removeChild(renderer.domElement);
			}
		};
	}, [isRunning, sessionType]);

	// Update refs when timeLeft or totalDuration changes
	useEffect(() => {
		timeLeftRef.current = timeLeft;
		totalDurationRef.current = totalDuration;
	}, [timeLeft, totalDuration]);

	return (
		<div
			ref={containerRef}
			className="w-full h-full min-h-[400px] relative"
			style={{ aspectRatio: "1 / 1" }}
		/>
	);
}
