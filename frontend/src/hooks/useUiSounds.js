const tapSounds = [
  new Audio("/sounds/mouse-click.mp3"),
  new Audio("/sounds/keystroke1.mp3"),
  new Audio("/sounds/keystroke2.mp3"),
  new Audio("/sounds/keystroke3.mp3"),
  new Audio("/sounds/keystroke4.mp3"),
];

tapSounds.forEach((sound) => {
  sound.preload = "auto";
  sound.volume = sound.src.includes("mouse-click") ? 0.45 : 0.22;
});

function useUiSounds() {
  const playRandomTapSound = () => {
    const sound = tapSounds[Math.floor(Math.random() * tapSounds.length)];
    sound.currentTime = 0;
    sound.play().catch(() => {});
  };

  return { playRandomTapSound };
}

export default useUiSounds;
