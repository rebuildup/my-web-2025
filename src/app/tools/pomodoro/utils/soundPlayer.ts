"use client";

let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext {
	if (!audioContext) {
		audioContext = new (
			window.AudioContext || (window as any).webkitAudioContext
		)();
	}
	return audioContext;
}

export function playNotificationSound(volume: number = 0.5) {
	try {
		const ctx = getAudioContext();
		const oscillator = ctx.createOscillator();
		const gainNode = ctx.createGain();

		oscillator.connect(gainNode);
		gainNode.connect(ctx.destination);

		// 作業終了音（高めの音）
		oscillator.frequency.value = 800;
		oscillator.type = "sine";

		gainNode.gain.setValueAtTime(0, ctx.currentTime);
		gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.01);
		gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

		oscillator.start(ctx.currentTime);
		oscillator.stop(ctx.currentTime + 0.5);

		// 2回目の音（少し低め）
		setTimeout(() => {
			const oscillator2 = ctx.createOscillator();
			const gainNode2 = ctx.createGain();

			oscillator2.connect(gainNode2);
			gainNode2.connect(ctx.destination);

			oscillator2.frequency.value = 600;
			oscillator2.type = "sine";

			gainNode2.gain.setValueAtTime(0, ctx.currentTime);
			gainNode2.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.01);
			gainNode2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

			oscillator2.start(ctx.currentTime);
			oscillator2.stop(ctx.currentTime + 0.5);
		}, 200);
	} catch (error) {
		console.error("Error playing notification sound:", error);
	}
}

export function playBreakStartSound(volume: number = 0.3) {
	try {
		const ctx = getAudioContext();
		const oscillator = ctx.createOscillator();
		const gainNode = ctx.createGain();

		oscillator.connect(gainNode);
		gainNode.connect(ctx.destination);

		// 休憩開始音（柔らかい音）
		oscillator.frequency.value = 400;
		oscillator.type = "sine";

		gainNode.gain.setValueAtTime(0, ctx.currentTime);
		gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.01);
		gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);

		oscillator.start(ctx.currentTime);
		oscillator.stop(ctx.currentTime + 0.8);
	} catch (error) {
		console.error("Error playing break start sound:", error);
	}
}
