import collect_Sound from "../assets/SE/collect.wav";
import miss_Sound from "../assets/SE/miss.wav";

export function playAudio(url: string, volume: number = 1.0): Promise<void> {
  return new Promise((resolve, reject) => {
    const audio = new Audio(url);
    audio.volume = volume;

    audio.oncanplaythrough = () => {
      audio
        .play()
        .then(() => resolve())
        .catch(reject);
    };

    audio.onerror = () => reject(new Error("Failed to load audio"));
  });
}
export function playCollect() {
  playAudio(collect_Sound, 0.5);
}

export function playMiss(volume: number = 0.5) {
  playAudio(miss_Sound, volume);
}
