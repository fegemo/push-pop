class Sound {
  constructor(name) {
    this.name = name;
    try {
      this.audio = new Audio(name);
      this.audio.addEventListener("canplaythrough", () => (this.ready = true));
    } catch (err) {
      console.error(`Could not load audio with path "${name}". Reason: ${err}`);
    }
  }

  play(timestamp, volume) {
    if (this.ready) {
      timestamp = Math.min(Math.max(0, timestamp), 1);
      this.audio.currentTime = timestamp * this.audio.duration;
      this.audio.volume = volume;
      this.audio.play();
    }
  }

  stop() {
    this.audio.pause();
    this.audio.currentTime = 0;
  }
}

const allSounds = {};
const getFileName = path => {
  const lastSlash = path.lastIndexOf("/");
  return lastSlash > 0 ? path.substr(lastSlash + 1) : path;
};

const getSound = fileName => {
  const sound = allSounds[fileName];
  if (sound) {
    return sound;
  } else {
    console.info(
      `Asked to play sound "${fileName}", but it was not preloaded.`
    );
  }
};

const sound = {
  preload: filePaths => {
    filePaths.forEach(f => {
      const fileName = getFileName(f);
      allSounds[fileName] = new Sound(f);
    });
  },

  play: (fileName, timestamp = 0, volume = 1) => {
    const sound = getSound(fileName);
    if (sound) {
      sound.play(timestamp, volume);
    }
  },

  stop: fileName => {
    const sound = getSound(fileName);
    if (sound) {
      sound.stop();
    }
  }
};

export default sound;
