let _renderer = undefined;

export const setRenderer = (renderer) => {
  _renderer = renderer;
};

export const getRenderer = () => {
  return _renderer;
};

let _scene = undefined;

export const setScene = (scene) => {
  _scene = scene;
};

export const getScene = () => {
  return _scene;
};

let _simulation = undefined;

export const setSimulation = (simulation) => {
  _simulation = simulation;
};

export const getSimulation = () => {
  return _simulation;
};
