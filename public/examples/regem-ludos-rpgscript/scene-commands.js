// This file defines all the "+" commands you can run with an rpgscript parser and scene runner.

import { getRenderer, getScene, getSimulation } from './statics.js';
import { set } from './rpgscript-scene.js';

const ATTRIBUTE_X_LOCATION = 'x-location';
const ATTRIBUTE_Y_LOCATION = 'y-location';

const getNumericAttribute = (svg, attribute) => {
  const value = svg.getAttribute(attribute);
  return value !== null && value !== undefined ? parseInt(value) : 0;
};

const setPuppetLocationAttributes = (svg, x, y) => {
  svg.setAttribute(ATTRIBUTE_X_LOCATION, x);
  svg.setAttribute(ATTRIBUTE_Y_LOCATION, y);
};

// start commands

const playDialogue = ({ text, actorName }) => {
  getRenderer().textZone.renderLine(
    `<span style="font-weight: bold">${actorName}</span>: ${text}`
  );
  return new Promise((resolve) => {
    getRenderer().renderClickToContinue(undefined, resolve);
  });
};

const waitMs = (ms) => {
  return new Promise((resolve) => {
    getSimulation().addTimer(ms, resolve);
  });
};

const setStorage = (path, value) => {
  if (value === 'false') {
    value = false;
  }
  if (value === 'true') {
    value = true;
  }
  if (typeof value === 'string' && value !== '' && !isNaN(Number(value))) {
    value = Number(value);
  }
  set(getScene().storage, path, value ?? true);
  getRenderer().scriptStorageSrc.setValue(getScene().storage);
};

const callScript = (scriptName, ...args) => {
  const script = getScene().scripts[scriptName];
  if (!script) {
    throw new Error(`Script ${scriptName} not found`);
  }
  getScene().runScript(script.copy(), ...args);
};

const loop = (scriptName, times, ...args) => {
  const p = Promise.resolve();
  for (let i = 0; i < times; i++) {
    p.then(() => callScript(scriptName, ...args));
  }
  return p;
};

const addPuppet = (
  puppetName,
  url,
  x = 0,
  y = 0,
  width = 64,
  height = 64,
  hexColor = '#000000' // must be 6 digits
) => {
  const id = puppetName.toLowerCase();

  const existingPuppet = document.getElementById(id);
  if (existingPuppet) {
    // throw new Error(`Puppet ${puppetName} already exists`);
    console.warn(`Puppet ${puppetName} already exists.`);
    setPuppetLocationAttributes(existingPuppet, 0, 0);
    existingPuppet.style.left = `0px`;
    existingPuppet.style.top = `0px`;
    movePuppet(puppetName, x, y, 'linear', 0, true);
    return;
  }

  const fullUrl = `https://game-icons.net/icons/000000/transparent/1x1/${url}`;

  return getRenderer()
    .createCanvasWithImage(fullUrl, hexColor, width, height)
    .then(({ canvas, img }) => {
      canvas.id = id;
      canvas.style.position = 'absolute';
      canvas.style.left = `${0}px`;
      canvas.style.top = `${0}px`;
      const sceneZone = getRenderer().sceneZone.root;
      sceneZone.appendChild(canvas);
      getRenderer().renderImageToCanvas(img, canvas, width, height, hexColor);
      movePuppet(puppetName, x, y, 'linear', 0, true);
    })
    .catch((error) => {
      throw new Error(`Error adding puppet ${puppetName}: ${error}`);
    });
};

const removePuppet = (puppetName) => {
  const id = puppetName.toLowerCase();
  const img = document.getElementById(id);
  if (img) {
    img.remove();
  } else {
    console.error(`Puppet ${puppetName} not found to remove.`);
    return;
  }
};

const shakePuppet = (puppetName, ms = 150, skipWait = false) => {
  const id = puppetName.toLowerCase();
  const duration = ms;
  const svg = document.getElementById(id);
  if (!svg) {
    throw new Error(`Puppet ${puppetName} not found`);
  }
  const puppetX = getNumericAttribute(svg, ATTRIBUTE_X_LOCATION);
  const puppetY = getNumericAttribute(svg, ATTRIBUTE_Y_LOCATION);

  const nextX = puppetX;
  const nextY = puppetY - 5;

  svg.style.transform = `translate(${nextX}px, ${nextY}px)`;
  svg.style.transition = `transform ${duration / 2}ms linear`;

  const cb1 = () => {
    svg.style.transform = `translate(${puppetX}px, ${puppetY}px)`;
  };

  if (skipWait) {
    getSimulation().addTimer(duration / 2, cb1);
    return undefined;
  } else {
    return new Promise((resolve) => {
      getSimulation().addTimer(duration / 2, cb1);
      getSimulation().addTimer(duration, () => {
        resolve();
      });
    });
  }
};

const movePuppet = (
  puppetName,
  x,
  y,
  ease = 'linear',
  ms = 75,
  skipWait = false
) => {
  const id = puppetName.toLowerCase();
  const duration = ms;
  const svg = document.getElementById(id);
  if (!svg) {
    throw new Error(`Puppet ${puppetName} not found`);
  }
  const puppetX = getNumericAttribute(svg, ATTRIBUTE_X_LOCATION);
  const puppetY = getNumericAttribute(svg, ATTRIBUTE_Y_LOCATION);
  const nextX = puppetX + x;
  const nextY = puppetY + y;
  setPuppetLocationAttributes(svg, nextX, nextY);

  if (ms === 0) {
    svg.style.transition = `unset`;
  } else {
    svg.style.transition = `transform ${duration}ms ${ease}`;
  }
  svg.style.transform = `translate(${nextX}px, ${nextY}px)`;

  if (skipWait) {
    return undefined;
  } else {
    return new Promise((resolve) => {
      getSimulation().addTimer(duration, resolve);
    });
  }
};

const fadeOut = (ms, skipWait) => {
  const sceneZone = getRenderer().sceneZone.root;
  if (ms === 0) {
    sceneZone.style.transition = 'unset';
  } else {
    sceneZone.style.transition = `filter ${ms}ms linear, background-color ${ms}ms linear`;
  }
  sceneZone.style.filter = 'brightness(0)';
  sceneZone.style.backgroundColor = 'rgba(0, 0, 0, 255)';
  if (skipWait) {
    return undefined;
  } else {
    return new Promise((resolve) => {
      getSimulation().addTimer(ms, resolve);
    });
  }
};

const fadeIn = (ms, skipWait) => {
  const sceneZone = getRenderer().sceneZone.root;
  if (ms === 0) {
    sceneZone.style.transition = 'unset';
  } else {
    sceneZone.style.transition = `filter ${ms}ms linear, background-color ${ms}ms linear`;
  }
  sceneZone.style.filter = 'brightness(1)';
  sceneZone.style.backgroundColor = 'rgba(0, 0, 0, 0)';
  if (skipWait) {
    return undefined;
  } else {
    return new Promise((resolve) => {
      getSimulation().addTimer(ms, resolve);
    });
  }
};

export const sceneCommands = {
  playDialogue,
  waitMs,
  setStorage,
  callScript,
  loop,
  addPuppet,
  removePuppet,
  shakePuppet,
  movePuppet,
  fadeOut,
  fadeIn,
};

export default sceneCommands;
