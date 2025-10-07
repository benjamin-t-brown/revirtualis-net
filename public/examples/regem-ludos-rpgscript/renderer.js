// Portions of this file may or may not have been vibe coded by 4.5 Sonnet
// ...then partially rewritten in defeated frustration.

const CLICK_TO_CONTINUE_ID = 'click-to-continue';
const LINE_ID = 'line';
const RESTART_BUTTON_ID = 'restart-button';
const SCRIPT_INPUT_ID = 'script-input';
const SCRIPT_STORAGE_SRC_ID = 'script-storage-src';
const TEXT_ZONE_ID = 'text-zone';
const SCENE_ZONE_ID = 'scene-zone';
const SCRIPT_ERRORS_ID = 'script-errors';
const SCRIPT_ARGS_INPUTS_ID = 'script-inputs';
const DIM_X_ID = 'script-input-dimensions-x';
const DIM_Y_ID = 'script-input-dimensions-y';

const onEventInsertSpacesInsteadOfTab = (e) => {
  if (e.key === 'Tab') {
    e.preventDefault();
    const spaces = '  ';

    if (document.execCommand) {
      // Use execCommand to preserve undo functionality
      document.execCommand('insertText', false, spaces);
    } else {
      // Fallback for browsers that don't support execCommand
      // like what, IE8?
      // If this works on IE8 I wish I had a time machine to sell it
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const value = textarea.value;
      textarea.value =
        value.substring(0, start) + spaces + value.substring(end);
      textarea.selectionStart = textarea.selectionEnd = start + spaces.length;
    }
  }
};

class SceneZone {
  constructor() {
    this.root = document.getElementById(SCENE_ZONE_ID);
  }

  setSize(width, height) {
    this.root.style.width = `${width}px`;
    this.root.style.height = `${height}px`;
  }

  clear() {
    this.root.style.transition = 'unset';
    this.root.style.filter = 'unset';
    this.root.style.backgroundColor = 'unset';
    this.root.innerHTML = '';
  }
}

class TextZone {
  constructor() {
    this.root = document.getElementById(TEXT_ZONE_ID);
  }

  renderLine(line) {
    const id = LINE_ID;
    const p = document.createElement('p');
    p.id = id;
    p.innerHTML = line;
    p.style.textAlign = 'center';

    const existingP = document.getElementById(id);
    if (existingP) {
      existingP.remove();
    }

    this.root.appendChild(p);
  }
}

class ScriptArgs {
  constructor() {
    this.root = document.getElementById(SCRIPT_ARGS_INPUTS_ID);
    this.xInput = document.getElementById(DIM_X_ID);
    this.yInput = document.getElementById(DIM_Y_ID);
  }

  setValue(width, height) {
    this.xInput.value = width;
    this.yInput.value = height;
  }

  getValue() {
    return {
      width: this.xInput.value,
      height: this.yInput.value,
    };
  }

  setEditable(editable) {
    this.xInput.disabled = !editable;
    this.yInput.disabled = !editable;
  }
}

class ScriptStorageSrc {
  constructor() {
    this.root = document.getElementById(SCRIPT_STORAGE_SRC_ID);

    const textarea = this.root;
    textarea.addEventListener('keydown', (e) => {
      onEventInsertSpacesInsteadOfTab(e);
    });
  }

  setValue(src) {
    this.root.value = JSON.stringify(src, null, 2);
  }

  getValue() {
    return JSON.parse(this.root.value);
  }
}

class ScriptErrors {
  constructor() {
    this.root = document.getElementById(SCRIPT_ERRORS_ID);
  }

  setErrors(errors) {
    this.root.innerHTML = '';
    for (const error of errors) {
      const errorP = document.createElement('p');
      errorP.innerHTML = error;
      this.root.appendChild(errorP);
    }
  }
}

class ScriptSrc {
  constructor() {
    this.root = document.getElementById(SCRIPT_INPUT_ID);
    this.setEditable(true);
  }

  setValue(src) {
    this.root.value = src;
  }

  getValue() {
    return this.root.value;
  }

  updateLineNumber(lineNumber) {
    const textarea = this.root;
    const lineNumberInput = document.getElementById('script-input-line-number');
    const cursorPosition = textarea.selectionStart;
    const textBeforeCursor = textarea.value.substring(0, cursorPosition);
    lineNumber = lineNumber || textBeforeCursor.split('\n').length;
    lineNumberInput.value = lineNumber;
  }

  setEditable(editable) {
    if (editable) {
      const textarea = document.createElement('textarea');
      textarea.id = SCRIPT_INPUT_ID;
      textarea.value = this.root.textContent;
      textarea.spellcheck = false;
      textarea.disabled = false;
      textarea.style.height = '400px';

      textarea.addEventListener('click', () => this.updateLineNumber());
      textarea.addEventListener('keyup', () => this.updateLineNumber());
      textarea.addEventListener('keydown', (e) => {
        onEventInsertSpacesInsteadOfTab(e);
        this.updateLineNumber();
      });

      this.root.replaceWith(textarea);
      this.root = textarea;
    } else if (!editable) {
      const div = document.createElement('div');
      div.id = this.root.id;
      const lines = this.root.value.split('\n');
      div.innerHTML = lines
        .map(
          (line) =>
            `<span>${line.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</span>`
        )
        .join('\n');
      div.value = this.root.value;
      div.className = 'div-textarea';
      div.style.cssText = this.root.style.cssText;
      div.style.height = '400px';
      div.style.maxHeight = '400px';
      div.setAttribute('tabindex', '-1');
      div.style.border = getComputedStyle(this.root).border;

      this.root.replaceWith(div);
      this.root = div;
    }
  }

  highlightLine(lineNumber) {
    if (!Number.isInteger(lineNumber) || lineNumber < 1) {
      return;
    }
    if (this.root.tagName !== 'DIV') {
      return;
    }
    const spans = this.root.querySelectorAll('span');
    spans.forEach((span) => {
      span.style.background = '';
    });
    if (lineNumber > spans.length) {
      return;
    }
    const span = spans[lineNumber - 1];
    if (span) {
      span.style.background = 'yellow';
    }
  }
}

export class Renderer {
  constructor() {
    this.cachedImages = {};
    this.sceneZone = new SceneZone();
    this.textZone = new TextZone();
    this.scriptArgs = new ScriptArgs();
    this.scriptErrors = new ScriptErrors();
    this.scriptSrc = new ScriptSrc();
    this.scriptStorageSrc = new ScriptStorageSrc();
  }

  setDimensions(width, height) {
    this.sceneZone.setSize(width, height);
    this.scriptArgs.setValue(width, height);
  }

  renderClickToContinue(overrideText, cb) {
    const id = CLICK_TO_CONTINUE_ID;
    const button = document.createElement('button');
    button.innerHTML = overrideText ?? 'Click to continue.';
    button.id = id + '-button';
    button.addEventListener('click', () => {
      this.clearLines();
      cb();
    });

    const buttonContainer = document.createElement('p');
    buttonContainer.id = id;
    buttonContainer.style.textAlign = 'center';
    buttonContainer.appendChild(button);
    this.textZone.root.appendChild(buttonContainer);
  }

  renderRestartButton() {
    const button = document.createElement('button');
    button.innerHTML = 'Restart';
    button.id = RESTART_BUTTON_ID + '-button';
    button.addEventListener('click', () => {
      window.location.reload();
    });
    const buttonContainer = document.createElement('p');
    buttonContainer.id = RESTART_BUTTON_ID;
    buttonContainer.style.textAlign = 'center';
    buttonContainer.appendChild(button);
    this.textZone.root.appendChild(buttonContainer);
  }

  renderScriptErrors(errors) {
    const errorZone = document.getElementById(SCRIPT_ERRORS_ID);
    errorZone.innerHTML = '';

    if (!errors || errors.length === 0) {
      return;
    }
    for (const error of errors) {
      const errorP = document.createElement('p');
      errorP.innerHTML = error;
      errorZone.appendChild(errorP);
    }
  }

  renderImageToCanvas(img, canvas, width, height, color) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0, width, height);
    ctx.save();
    ctx.globalCompositeOperation = 'source-in';
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  }

  clear() {
    this.renderScriptErrors();
    const button = document.getElementById(CLICK_TO_CONTINUE_ID);
    if (button) {
      button.remove();
    }
  }

  async createCanvasWithImage(url, color, width, height) {
    let img = this.cachedImages[url];
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    if (img) {
      return {
        canvas,
        img,
      };
    }
    img = document.createElement('img');
    this.cachedImages[url] = img;
    return new Promise((resolve) => {
      img.onload = () => {
        resolve({ canvas, img });
      };

      img.src = url;
    });
  }

  clearLines() {
    const ids = [LINE_ID, CLICK_TO_CONTINUE_ID, RESTART_BUTTON_ID];
    for (const id of ids) {
      const element = document.getElementById(id);
      if (element) {
        element.remove();
      }
    }
  }
}
