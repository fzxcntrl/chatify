const soundPaths = [
  "/sounds/mouse-click.mp3",
  "/sounds/keystroke1.mp3",
  "/sounds/keystroke2.mp3",
  "/sounds/keystroke3.mp3",
  "/sounds/keystroke4.mp3",
];

let tapSounds = null;

const getTapSounds = () => {
  if (tapSounds) return tapSounds;

  tapSounds = soundPaths.map((path) => {
    const sound = new Audio(path);
    sound.preload = "none";
    sound.volume = path.includes("mouse-click") ? 0.45 : 0.22;
    return sound;
  });

  return tapSounds;
};

function useUiSounds() {
  const playRandomTapSound = () => {
    const sounds = getTapSounds();
    const sound = sounds[Math.floor(Math.random() * sounds.length)];
    sound.currentTime = 0;
    sound.play().catch(() => {});
  };

  return { playRandomTapSound };
}

export default useUiSounds;
