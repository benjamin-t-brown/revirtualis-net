import { Scene } from './rpgscript-scene.js';
import { Renderer } from './renderer.js';
import { sceneCommands } from './scene-commands.js';
import { setScene, setRenderer, setSimulation } from './statics.js';

const STARTING_SCENE_WIDTH = 250;
const STARTING_SCENE_HEIGHT = 96;

const fetchScriptSrc = async (url) => {
  const response = await fetch(url);
  return response.text();
};

const simulation = {
  timers: [],
  addTimer: (duration, callback) => {
    const timer = {
      duration,
      t: 0,
      callback,
    };
    simulation.timers.push(timer);
  },
  isTimerComplete: (timer) => {
    return timer.t >= timer.duration;
  },
  updateTimers: (deltaTime) => {
    for (const timer of simulation.timers) {
      timer.t += deltaTime;
      if (simulation.isTimerComplete(timer)) {
        simulation.timers.splice(simulation.timers.indexOf(timer), 1);
        timer.callback();
      }
    }
  },
};

const startLoop = () => {
  let lastTime = performance.now();
  const loop = () => {
    const currentTime = performance.now();
    const deltaTime = currentTime - lastTime;
    lastTime = currentTime;

    simulation.updateTimers(deltaTime);

    window.requestAnimationFrame(loop);
  };

  window.requestAnimationFrame(loop);
};

const runScene = async (scene, renderer) => {
  scene.onRunCommand = (script) => {
    let lineNumber = script.lineNum;
    for (let i = 0; i <= script.currentBlockIndex; i++) {
      if (i === script.currentBlockIndex) {
        lineNumber += script.currentCommandIndex;
      } else {
        lineNumber += script.blocks[i].commands.length;
      }
    }
    renderer.scriptSrc.highlightLine(lineNumber);
  };
  const { width, height } = renderer.scriptArgs.getValue();

  sceneCommands.setStorage('SCENE_WIDTH', width);
  sceneCommands.setStorage('SCENE_HEIGHT', height);

  const success = reloadScriptsAndStorage(scene, renderer);
  if (!success) {
    return;
  }

  const scriptResetButton = document.getElementById('script-input-restart');
  scriptResetButton.disabled = true;

  const scriptStopButton = document.getElementById('script-input-stop');
  scriptStopButton.disabled = false;

  return scene
    .runScript(scene.scripts['setup'])
    .then(() => {
      return scene.runScript(scene.scripts['main']);
    })
    .then(() => {
      renderer.clearLines();
      scriptResetButton.disabled = false;
      scriptStopButton.disabled = true;
    })
    .catch((e) => {
      console.error('Error running scene', e);
      scriptResetButton.disabled = false;
      scriptStopButton.disabled = true;
    });
};

const reloadScriptsAndStorage = (scene, renderer) => {
  const errors = [];
  const scriptSrc = renderer.scriptSrc.getValue();
  try {
    scene.addScriptSrc(scriptSrc);
  } catch (error) {
    console.error('Error parsing script src', error);
    errors.push(error.message);
  }

  try {
    const storage = renderer.scriptStorageSrc.getValue() || {};
    scene.storage = storage;
  } catch (e) {
    console.error('Error parsing storage', e);
    errors.push(e.message);
  }

  if (errors.length > 0) {
    renderer.scriptErrors.setErrors(errors);
    return false;
  }
  return true;
};

const showStartSceneButton = (scene, renderer) => {
  renderer.renderClickToContinue('Click to start cutscene.', () => {
    renderer.scriptSrc.setEditable(false);
    renderer.scriptArgs.setEditable(false);
    runScene(scene, renderer)
      .then(() => {
        renderer.scriptSrc.setEditable(true);
        renderer.scriptArgs.setEditable(true);
      })
      .catch((e) => {
        console.error('Error running scene', e);
        renderer.scriptSrc.setEditable(true);
        renderer.scriptArgs.setEditable(true);
      });
  });
};

const reset = (scene, renderer) => {
  renderer.sceneZone.clear();
  renderer.clear();
  const dims = renderer.scriptArgs.getValue();
  renderer.setDimensions(dims.width, dims.height);
  scene.reset();
  scene.setCommands(sceneCommands);
  simulation.timers = [];
};

export const main = async () => {
  const renderer = new Renderer();
  const scene = new Scene();
  window.renderer = renderer;
  window.scene = scene;
  setSimulation(simulation);
  setRenderer(renderer);
  setScene(scene);
  renderer.setDimensions(STARTING_SCENE_WIDTH, STARTING_SCENE_HEIGHT);

  const scriptResetButton = document.getElementById('script-input-restart');
  scriptResetButton.addEventListener('click', () => {
    reset(scene, renderer);
    const success = reloadScriptsAndStorage(scene, renderer);
    if (!success) {
      return;
    }

    // HACK: too lazy to figure out why this needs a delay
    setTimeout(() => {
      showStartSceneButton(scene, renderer);
    }, 100);
  });

  const scriptStopButton = document.getElementById('script-input-stop');
  scriptStopButton.addEventListener('click', () => {
    reset(scene, renderer);
  });
  scriptStopButton.disabled = true;

  const scriptSrc = await fetchScriptSrc('./ex04.rpgscript');
  renderer.scriptSrc.setValue(scriptSrc);
  renderer.scriptStorageSrc.setValue({
    chloeHasPencil: false,
  });
  scene.setCommands(sceneCommands);
  const success = reloadScriptsAndStorage(scene, renderer);
  if (success) {
    showStartSceneButton(scene, renderer);
  }

  startLoop();
};
