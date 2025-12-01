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
  playAudio("/tools/prototype/se/collect.wav", 0.5);
}

export function playMiss(volume: number = 0.5) {
  playAudio("/tools/prototype/se/miss.wav", volume);
}
