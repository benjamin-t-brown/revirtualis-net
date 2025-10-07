// A very stripped-down implementation of the Rpgscript Scene engine from Regem Ludos

import { parseSingleScript, formatArgs } from './rpgscript-parser.js';

export const get = (data, path, defaultValue) => {
  path = String(path);

  if (!path) {
    return defaultValue;
  }

  const value = path?.split('.').reduce((value, key) => value?.[key], data);

  return value ?? defaultValue;
};

export const set = (obj, path, value) => {
  if (typeof obj !== 'object') {
    return obj;
  }
  const arr = path.split('.');
  let i = 0;
  let currentObj = obj;
  let key = arr[i];
  while (i < arr.length - 1) {
    if (typeof currentObj[key] !== 'object') {
      currentObj[key] = {};
    }
    currentObj = currentObj[key];
    i++;
    key = arr[i];
  }
  currentObj[key] = value;
  return obj;
};

// these determine how many arguments can be sent to an rpgscript function.
// They are accessed by [ARG0], [ARG1], etc. If you increase this above 10,
// you'll need to change the regex to account for the extra digit in
// the argument parser.
const MAX_ARGS = 10;
const argRegex = /\[ARG\d\]/;

export class Scene {
  sceneCommands = {};
  onCurrentScriptComplete = undefined;
  scriptStack = [];
  scripts = {};
  triggers = {};
  isWaiting = false;
  currentScript = undefined;
  currentScriptArgs = [];
  storage = {};
  onRunCommand = undefined;
  constructor() {}

  setCommands(commands) {
    this.sceneCommands = commands;
  }

  hasCommand(command) {
    return this.sceneCommands[command] !== undefined;
  }

  setOnRunCommand(callback) {
    this.onRunCommand = callback;
  }

  addScriptSrc(scriptSrc) {
    const { scripts, triggers } = parseSingleScript(scriptSrc, this);
    Object.assign(this.scripts, scripts);
    Object.assign(this.triggers, triggers);
  }

  reset() {
    const scriptStack = this.scriptStack;
    const onCurrentScriptComplete = this.onCurrentScriptComplete;
    this.scriptStack = [];
    this.currentScript = undefined;
    this.currentScriptArgs = [];
    this.storage = {};
    this.isWaiting = false;
    this.onCurrentScriptComplete = undefined;
    this.sceneCommands = {};
    this.scripts = {};
    this.triggers = {};
    this.onRunCommand = undefined;
    if (onCurrentScriptComplete) {
      onCurrentScriptComplete();
    }
    while (scriptStack.length) {
      const obj = scriptStack.shift();
      if (obj.onComplete) {
        obj.onComplete();
      }
    }
  }

  async runScript(script, ...args) {
    if (this.currentScript) {
      this.scriptStack.unshift({
        script: this.currentScript,
        args: this.currentScriptArgs,
        onComplete: this.onCurrentScriptComplete,
      });
    }
    return new Promise((resolve) => {
      this.currentScript = script;
      this.onCurrentScriptComplete = resolve;
      this.currentScriptArgs = args;
      this.setArgsInStorage(args);
      this.advance();
    });
  }

  // recursive execution for example
  advance() {
    const currentScript = this.currentScript;
    if (!currentScript) {
      return;
    }

    if (this.isWaiting) {
      return;
    }

    const cmd = currentScript.getNextCommand();
    if (cmd) {
      if (cmd.block.conditionalResult === undefined) {
        cmd.block.conditionalResult = this.evalCondition(cmd.conditional);
      }

      if (cmd.type === 'noop') {
        this.advance();
        return;
      }

      if (cmd.block.conditionalResult) {
        if (this.onRunCommand) {
          this.onRunCommand(this.currentScript, cmd);
        }
        const func = this.sceneCommands[cmd.type];
        if (!func) {
          throw new Error(`Unknown scene command: ${cmd.type}`);
        }
        const promise = func(
          ...cmd.args.map((arg) =>
            this.mapGetSceneArgs(cmd.type === 'playDialogue', this.storage, arg)
          )
        );
        if (promise) {
          this.isWaiting = true;
          promise
            .then(() => {
              this.isWaiting = false;
              this.advance();
            })
            .catch((error) => {
              console.error('Error in scene advance promise:', error);
            });
        } else {
          this.advance();
        }
      } else {
        this.advance();
      }
    } else {
      if (this.onCurrentScriptComplete) {
        this.onCurrentScriptComplete();
      }
      if (this.scriptStack.length) {
        const nextScriptObj = this.scriptStack.shift();
        this.currentScript = nextScriptObj?.script;
        this.currentScriptArgs = nextScriptObj?.args;
        this.onCurrentScriptComplete = nextScriptObj?.onComplete;
        this.setArgsInStorage(this.currentScriptArgs);
        this.advance();
      }
    }
  }

  setArgsInStorage(args) {
    for (let i = 0; i < MAX_ARGS; i++) {
      const arg = args[i];
      const key = 'ARG' + i;
      if (arg === undefined || arg === 'undefined') {
        // TODO fix this with a delete that uses the '.' separated path
        delete this.storage[key];
      } else {
        set(this.storage, key, arg);
      }
    }
  }

  mapGetSceneArgs(isDialogCommand, scope, arg) {
    if (typeof arg === 'string') {
      if (arg === '') {
        return '';
      }
      let match;
      while ((match = arg.match(argRegex))) {
        const argKey = arg.slice(match.index + 1, match.index + 5);
        const val = get(scope, argKey);
        arg = arg.slice(0, match.index) + val + arg.slice(match.index + 6);
      }
      let argRet = arg;

      if (!isDialogCommand) {
        // HACK replace '--' with '+' so negative negative numbers parse as positive
        argRet = arg.replace(/--/g, '+');
      }
      if (argRet === 'true') {
        argRet = true;
      } else if (argRet === 'false') {
        argRet = false;
      }

      if (typeof argRet === 'boolean') {
        return argRet;
      }
      if (argRet !== '' && !isNaN(Number(argRet))) {
        return Number(argRet);
      }
      return this.replaceTemplateStrings(argRet);
    } else {
      return arg;
    }
  }

  replaceTemplateStrings(text) {
    text.match(/['"`]*{([\d\w.-]*)}['"`]*/g)?.forEach((matchText) => {
      const path = matchText.slice(1, -1);
      const variable = get(this.storage, path);
      if (typeof variable === 'number') {
        text = text.replace(matchText, String(variable));
      } else {
        text = text.replace(matchText, variable);
      }
    });
    const asNumber = Number(text);
    if (isNaN(asNumber)) {
      // Evaluate as math expression
      let result;
      try {
        if (/^[\d\s+\-*/().]+$/.test(text)) {
          result = Function(`"use strict"; return (${text})`)();
          if (typeof result === 'number' && !isNaN(result)) {
            return result;
          }
        }
      } catch (e) {
        // ignore errors
      }
      return text;
    } else {
      return asNumber;
    }
  }

  evalCondition(conditional) {
    if (conditional === true) {
      return true;
    } else if (typeof conditional === 'object') {
      const { type, args: originalArgs } = conditional;
      const args = formatArgs(originalArgs)
        .map((arg) => this.mapGetSceneArgs(false, this.storage, arg))
        .map((arg) => {
          if (typeof arg === 'object') {
            return arg;
          }
          const a = arg;
          if (
            typeof a === 'string' &&
            a.search(/[a-zA-Z\d]\.[a-zA-Z\d]/) > -1
          ) {
            if (type === 'is' || type === 'isnot') {
              return arg;
            }
            const [a, b] = arg.split('.');
            if (a === 'storage') {
              return get(this.storage, b);
            }
            if (!get(this.storage, a)) {
              console.error('No storage in scene called:', a);
              return false;
            }
            return get(this.storage, arg);
          } else {
            return arg;
          }
        });

      if (type === 'is') {
        if (typeof args[0] === 'boolean') {
          return args[0];
        }

        const b = !!get(this.storage, args[0]);
        return b;
      } else if (type === 'isnot') {
        if (typeof args[0] == 'object') {
          const b = !this.evalCondition(args[0]);
          return b;
        } else if (typeof args[0] === 'boolean') {
          return !args[0];
        } else {
          const b = !get(this.storage, args[0]);
          return b;
        }
      } else if (type === 'gt') {
        if (typeof args[0] === 'string') {
          args[0] = get(this.storage, args[0]);
        }
        if (typeof args[1] === 'string') {
          args[1] = get(this.storage, args[1]);
        }
        return args[0] > args[1];
      } else if (type === 'lt') {
        if (typeof args[0] === 'string') {
          args[0] = get(this.storage, args[0]);
        }
        if (typeof args[1] === 'string') {
          args[1] = get(this.storage, args[1]);
        }
        return args[0] < args[1];
      } else if (type === 'eq') {
        const conditions = [
          args[0] === args[1],
          get(this.storage, args[0]) === args[1] &&
            args[0] !== undefined &&
            args[1] !== undefined,
          get(this.storage, args[1]) === args[0] &&
            args[0] !== undefined &&
            args[1] !== undefined,
        ];
        if (typeof args[1] !== 'number') {
          const c1 = get(this.storage, args[0]);
          const c2 = get(this.storage, args[1]);
          if (c1 !== undefined && c2 !== undefined) {
            conditions.push(
              get(this.storage, args[0]) === get(this.storage, args[1])
            );
          }
        }

        return conditions.reduce((prev, curr) => {
          return curr || prev;
        }, false);
      } else if (type === 'any') {
        for (let i = 0; i < args.length; i++) {
          const arg = args[i];
          if (this.evalCondition(arg)) {
            return true;
          }
        }
        return false;
      } else if (type === 'all') {
        for (let i = 0; i < args.length; i++) {
          const arg = args[i];
          if (!this.evalCondition(arg)) {
            return false;
          }
        }
        return true;
      }
      return false;
    }
  }
}
