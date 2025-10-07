// A basic Rpgscript parser, not-optimized, very silly, and full of nuance.
// it works though.

const RPGSCRIPT_LOAD_DIR = (window.RPGSCRIPT_PATH ?? '') + '/rpgscript';
function splitNotInParens(str, spl) {
  const ret = [];
  let agg = '';
  let quote = '';
  let ignore = false;
  let ignoreViaQuotes = false;
  let numOpenParen = 0;
  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    if (quote) {
      if (ch === quote) {
        quote = '';
        ignoreViaQuotes = false;
      }
    } else if (ch === `"` || ch === `'`) {
      quote = ch;
      ignoreViaQuotes = true;
    } else if (ch === '(') {
      ignore = true;
      numOpenParen++;
    } else if (ch === ')') {
      numOpenParen--;
      if (numOpenParen === 0) {
        ignore = false;
      }
    }
    if (!ignore && !ignoreViaQuotes && str[i] === spl) {
      ret.push(agg);
      agg = '';
    } else {
      agg += ch;
    }
  }
  if (agg) {
    ret.push(agg);
  }
  return ret;
}
function indexOfNotInParens(str, spl) {
  let quote = '';
  let ignore = false;
  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    if (quote) {
      if (ch === quote) {
        quote = '';
        ignore = false;
      }
    } else if (ch === `"` || ch === `'`) {
      quote = ch;
      ignore = true;
    } else if (ch === '(') {
      ignore = true;
    } else if (ch === ')') {
      ignore = false;
    }
    if (!ignore && str[i] === spl) {
      return i;
    }
  }
  return -1;
}
function removeQuotes(args) {
  return args.map((arg) => {
    if (typeof arg === 'object') {
      return arg;
    }
    if (arg[0] === '"' || arg[0] === "'") {
      return arg.slice(1, -1);
    } else {
      return arg;
    }
  });
}
export function formatArgs(args) {
  return removeQuotes(args).map((arg) => {
    if (typeof arg === 'object') {
      return arg;
    }
    const parsedFloat = parseFloat(arg);
    if (!isNaN(parsedFloat)) {
      if (String(parsedFloat).length === arg.length) {
        return parsedFloat;
      } else {
        return arg;
      }
    } else {
      return arg;
    }
  });
}
export var TriggerType;
(function (TriggerType) {
  TriggerType['STEP'] = 'step';
  TriggerType['STEP_FIRST'] = 'step-first';
  TriggerType['STEP_OFF'] = 'step-off';
  TriggerType['ACTION'] = 'action';
  TriggerType['LOAD'] = 'load';
  TriggerType['ITEM'] = 'item';
})(TriggerType || (TriggerType = {}));
export class Trigger {
  name;
  filename;
  lineNum;
  scriptCalls;
  x = 0;
  y = 0;
  constructor(name, filename, lineNum) {
    this.name = name;
    this.filename = filename;
    this.lineNum = lineNum;
    this.scriptCalls = [];
  }
  addScriptCall(triggerType, condition, scriptName) {
    this.scriptCalls.push({
      type: triggerType,
      condition: condition,
      scriptName: scriptName,
    });
  }
}
export class Script {
  name;
  filename;
  lineNum;
  blocks;
  soundNameStorage;
  currentBlockIndex;
  currentCommandIndex;
  sounds;
  soundsPerCharacter;
  constructor(name, filename, lineNum) {
    this.name = name;
    this.filename = filename;
    this.lineNum = lineNum;
    this.blocks = [];
    this.soundNameStorage = {};
    this.currentBlockIndex = 0;
    this.currentCommandIndex = 0;
    this.sounds = 0;
    this.soundsPerCharacter = {};
  }
  copy() {
    const copy = new Script(this.name, this.filename, this.lineNum);
    copy.blocks = this.blocks.map((block) => {
      const copyBlock = { ...block };
      copyBlock.commands = block.commands.map((command) => {
        return { ...command };
      });
      return copyBlock;
    });
    return copy;
  }
  reset() {
    this.currentBlockIndex = 0;
    this.currentCommandIndex = 0;
    this.blocks.forEach((block) => {
      block.conditionalResult = undefined;
    });
  }
  breakScript() {
    this.currentBlockIndex = Infinity;
    this.currentCommandIndex = Infinity;
  }
  isBreak() {
    return (
      this.currentBlockIndex === Infinity &&
      this.currentCommandIndex === Infinity
    );
  }
  breakBlock() {
    this.currentCommandIndex = Infinity;
  }
  isValid(scene) {
    if (!scene) {
      return {};
    }
    for (let i = 0; i < this.blocks.length; i++) {
      const block = this.blocks[i];
      for (let j = 0; j < block.commands.length; j++) {
        const command = block.commands[j];
        if (command.type === 'noop') {
          continue;
        }
        if (command.type[0] !== ':' && !scene.hasCommand(command.type)) {
          return {
            msg:
              `No command exists with name "${command.type}" ` +
              `and args "${command.args.join(',')}" `,
            lineNum: command.i,
          };
        }
      }
    }
    return {};
  }
  getNextCommand() {
    const block = this.blocks[this.currentBlockIndex];
    if (block) {
      const cmd = block.commands[this.currentCommandIndex];
      if (cmd) {
        this.currentCommandIndex++;
        const ret = {
          i: this.currentBlockIndex,
          args: cmd.args,
          type: cmd.type,
          conditional: block.conditional,
          block,
        };
        return ret;
      } else {
        this.currentBlockIndex++;
        this.currentCommandIndex = 0;
        return this.getNextCommand();
      }
    } else {
      return null;
    }
  }
  getNextDialog(actorName) {
    if (this.soundsPerCharacter[actorName]) {
      this.soundsPerCharacter[actorName]++;
    } else {
      this.soundsPerCharacter[actorName] = 1;
    }
    let n = this.soundsPerCharacter[actorName];
    if (n < 10) {
      n = '0' + n;
    }
    const soundNameIndexed = this.name + '/' + this.sounds;
    const soundNameCh = this.name + '/' + actorName + '-' + n;
    this.sounds++;
    return { soundNameIndexed, soundNameCh, n };
  }
  addCommandBlock() {
    const block = {
      conditional: true,
      commands: [],
    };
    this.blocks.push(block);
    return block;
  }
}
export class ScriptParser {
  name;
  soundsToLoad;
  enableLogging = false;
  constructor(name) {
    this.name = name;
    this.soundsToLoad = [];
  }
  log(...args) {
    if (this.enableLogging) {
      console.log('[RPGSCRIPT PARSER]', ...args);
    }
  }
  throwParsingError(err, lineNum, lineContents) {
    const error = `{Line ${lineNum === -1 ? 0 : lineNum}} Script parsing error. ${err} CONTENTS [\n"${lineContents}"\n]`;
    console.error(error);
    throw new Error(error);
  }
  parseCommand(commandSrc, lineNum, script) {
    commandSrc = commandSrc.trim();
    if (commandSrc[0] === ':') {
      const src = commandSrc.slice();
      const indFirstOpen = src.indexOf('(');
      const indLastClose = src.lastIndexOf(')');
      if (indFirstOpen === -1) {
        this.throwParsingError(
          `Invalid callScript shorthand, no open paren.'`,
          lineNum,
          commandSrc
        );
      }
      if (indLastClose === -1) {
        this.throwParsingError(
          `Invalid callScript shorthand, no close paren.'`,
          lineNum,
          commandSrc
        );
      }
      const scriptName = src.slice(1, indFirstOpen);
      const scriptArgs = src.slice(indFirstOpen + 1, indLastClose).split(',');
      commandSrc = `callScript(${scriptName},${scriptArgs.join(',')});`;
    }
    const firstParenIndex = commandSrc.indexOf('(');
    const lastParenIndex = commandSrc.lastIndexOf(')');
    if (commandSrc.match(/^(\w)+:/) && script) {
      return this.createDialogCommand(commandSrc, script, lineNum);
    }
    if (firstParenIndex === -1 || firstParenIndex === 0) {
      this.throwParsingError(
        'Invalid command, no name provided',
        lineNum,
        commandSrc
      );
    }
    if (lastParenIndex === -1 || lastParenIndex === 0) {
      this.throwParsingError(
        'Invalid command, no end parens',
        lineNum,
        commandSrc
      );
    }
    let args = commandSrc.substr(
      firstParenIndex + 1,
      commandSrc.length -
        (firstParenIndex + 1) -
        (commandSrc.length - lastParenIndex)
    );
    args = splitNotInParens(args, ',').map((arg) => arg.trim());
    args.forEach((arg) => {
      if (arg[0] === "'") {
        if (arg[arg.length - 1] !== "'") {
          this.throwParsingError(
            'Invalid command, unterminated single quote "\'"',
            lineNum,
            commandSrc
          );
        }
      } else if (arg[0] === '"') {
        if (arg[arg.length - 1] !== '"') {
          this.throwParsingError(
            "Invalid command, unterminated double quote '\"'",
            lineNum,
            commandSrc
          );
        }
      }
    });
    return {
      i: lineNum,
      type: commandSrc.substr(0, firstParenIndex),
      args: formatArgs(args),
    };
  }
  parseConditional(conditionalSrc, lineNum, script) {
    const { type, args } = this.parseCommand(conditionalSrc, lineNum, script);
    const validTypes = [
      'is',
      'isnot',
      'gt',
      'lt',
      'eq',
      'any',
      'all',
      'as',
      'once',
      'oncePerInstance',
      'with',
      'func',
    ];
    if (!validTypes.includes(type)) {
      this.throwParsingError(
        `Invalid conditional, no type named "${type}"`,
        lineNum,
        conditionalSrc
      );
    }
    return {
      type: type,
      args: args.map((arg) => {
        if (
          typeof arg === 'string' &&
          type !== 'func' &&
          arg.indexOf('(') !== -1
        ) {
          return this.parseConditional(arg, lineNum, script);
        } else {
          return arg;
        }
      }),
    };
  }
  combineConditionals(c1, c2, type) {
    return {
      type,
      args: [c1, c2],
    };
  }
  createAllConditional(...args) {
    if (args.length === 1) {
      return args[0];
    }
    return {
      type: 'all',
      args: [...args],
    };
  }
  getConditionalFromLine(line, lineNum, script) {
    const conditionalStartIndex = indexOfNotInParens(line, '?');
    if (conditionalStartIndex > -1) {
      const colonIndex = line.indexOf(':');
      if (colonIndex === -1) {
        this.throwParsingError(
          `Invalid conditional, no ending ':'`,
          lineNum,
          line
        );
      }
      const conditionalSrc = line.slice(conditionalStartIndex + 1, colonIndex);
      const conditional = this.parseConditional(
        conditionalSrc.trim(),
        lineNum,
        script
      );
      return { conditional, endIndex: colonIndex + 1 };
    } else {
      return { conditional: true, endIndex: 0 };
    }
  }
  createDialogCommand(line, script, lineNum) {
    const firstIndOfColon = line.indexOf(':');
    if (firstIndOfColon === -1) {
      this.throwParsingError(
        'Dialog command did not have a ":" character.',
        lineNum,
        line
      );
    }
    let actorName = line.slice(0, firstIndOfColon);
    let text = line.slice(firstIndOfColon + 1);
    let portraitEmotion = '';
    let type = 'playDialogue';
    if (actorName[0] === '_') {
      actorName = actorName.slice(1);
      type = 'playDialogueInterruptable';
    }
    const emotionParseIndex = actorName.indexOf('&');
    if (emotionParseIndex > -1) {
      portraitEmotion = actorName.slice(emotionParseIndex + 1);
      actorName = actorName.slice(0, emotionParseIndex);
    }
    text = text.trim();
    if (text[0] === '"' || text[0] === "'") {
      text = text.slice(1);
    }
    if (text[text.length - 1] === '"' || text[text.length - 1] === "'") {
      text = text.slice(0, -1);
    }
    const { soundNameCh, soundNameIndexed, n } =
      script.getNextDialog(actorName);
    this.soundsToLoad.push({ soundNameCh, soundNameIndexed });
    return {
      i: parseInt(String(n)),
      type,
      args: formatArgs([{ actorName, text, soundNameCh, portraitEmotion }]),
    };
  }
  parse(src, scene) {
    const triggers = {};
    const scripts = {};
    const addTrigger = (n, s) => (triggers[n] = s);
    const addScript = (n, s) => (scripts[n] = s);
    let isCodeBlock = false;
    let isTrigger = false;
    let isChoice = false;
    let currentBlock = null;
    let currentScript = null;
    let currentTrigger = null;
    let currentTriggerName = null;
    let conditionalStack = [];
    const lines = src.split('\n');
    let lastValidLine = 0;
    lines.forEach((line, lineNum) => {
      lineNum = lineNum + 1;
      line = line.trim();
      if (line.length === 0) {
        return;
      }
      if (line[0] === '/' && line[1] === '/') {
        if (currentScript) {
          currentScript.addCommandBlock().commands.push({
            i: lineNum,
            type: 'noop',
            args: [],
          });
        }
        return;
      }
      lastValidLine = lineNum;
      const firstCh = line[0];
      if (firstCh === '{') {
        isCodeBlock = true;
        conditionalStack.push(true);
      } else if (firstCh === '}') {
        isCodeBlock = false;
        currentBlock = null;
        conditionalStack.pop();
      } else if (firstCh === '@' && !isCodeBlock) {
        let scriptName = line.substr(1, line.length - 1);
        if (scriptName === 'this') {
          scriptName = currentTriggerName || '';
        }
        if (scriptName.length === 0) {
          this.throwParsingError('Invalid script name', lineNum, line);
        }
        if (currentScript) {
          const obj = currentScript.isValid(scene);
          const err = obj.msg;
          if (err) {
            this.throwParsingError(err, obj.lineNum ?? 0, '');
          }
        }
        currentScript = new Script(scriptName, this.name, lineNum);
        addScript(scriptName, currentScript);
        isTrigger = false;
        isChoice = false;
        conditionalStack = [];
      } else if (firstCh === '$') {
        // TODO: Unused, remove
        isChoice = true;
        isTrigger = false;
        if (currentScript) {
          currentBlock = currentScript.addCommandBlock();
          currentBlock.conditional = true;
          currentBlock.commands.push({
            i: lineNum,
            type: 'showChoices',
            args: [],
          });
        }
      } else if (firstCh === '#') {
        isTrigger = true;
        isChoice = false;
        currentTriggerName = line.substr(1);
        currentTrigger = new Trigger(line.substr(1), this.name, lineNum);
        addTrigger(line.substr(1), currentTrigger);
      } else if (firstCh === '+' || isCodeBlock) {
        const commandContents = line.substr(isCodeBlock ? 0 : 1);
        if (currentScript) {
          const { conditional, endIndex } = this.getConditionalFromLine(
            commandContents,
            lineNum,
            currentScript
          );
          if (typeof conditional === 'object') {
            if (commandContents[endIndex] === '{') {
              conditionalStack.push(conditional);
              isCodeBlock = true;
              currentBlock = currentScript.addCommandBlock();
              currentBlock.conditional = this.createAllConditional(
                ...conditionalStack
              );
              return;
            } else if (endIndex === commandContents.length) {
              currentBlock = currentScript.addCommandBlock();
              currentBlock.conditional = conditional;
              return;
            }
          }
          let block = null;
          if (isCodeBlock) {
            if (currentBlock === null) {
              currentBlock = currentScript.addCommandBlock();
              currentBlock.conditional = conditional;
            }
            block = currentBlock;
          } else {
            block = currentBlock = currentScript.addCommandBlock();
            currentBlock.conditional = this.createAllConditional(
              ...[conditional, ...conditionalStack]
            );
          }
          let commandSrc = commandContents.substr(endIndex);
          const isDialog = /(.*): "(.*)"/.test(commandSrc);
          if (commandSrc[0] === '?') {
            this.throwParsingError(
              `Invalid conditional, did you forget '+' at the start?`,
              lineNum,
              line
            );
            return;
          }
          if (commandSrc[0] === '+') {
            commandSrc = commandSrc.slice(1);
          } else if (isDialog) {
            const command = this.createDialogCommand(
              commandSrc,
              currentScript,
              lineNum
            );
            block.commands.push(command);
            return;
          }
          const { type, args } = this.parseCommand(
            commandSrc,
            lineNum,
            currentScript
          );
          const command = {
            i: lineNum,
            type,
            args,
          };
          block.commands.push(command);
        }
      } else if (isChoice) {
        const colonIndex = line.indexOf(':');
        if (colonIndex === -1) {
          this.throwParsingError(
            `Invalid choice definition, no colon '"'`,
            lineNum,
            line
          );
        }
        const choiceText = line.substr(0, colonIndex);
        const target = line.substr(colonIndex + 1);
        if (currentBlock) {
          currentBlock.commands[0].args.push({
            text: choiceText,
            target: target,
          });
        }
      } else if (isTrigger) {
        const firstCommaIndex = line.indexOf(',');
        if (firstCommaIndex === -1) {
          this.throwParsingError(
            `Invalid trigger script call, invalid number of arguments`,
            lineNum,
            line
          );
        }
        const triggerType = line.substr(0, firstCommaIndex);
        let triggerContents = line.substr(firstCommaIndex + 1);
        let itemConditional = null;
        if (triggerType === 'item') {
          const itemName = triggerContents.slice(
            0,
            triggerContents.indexOf(',')
          );
          itemConditional = {
            type: 'with',
            args: [itemName],
          };
          triggerContents = triggerContents.slice(
            triggerContents.indexOf(',') + 1
          );
        }
        const { conditional: localConditional, endIndex } =
          this.getConditionalFromLine(triggerContents, lineNum, currentScript);
        let conditional = localConditional;
        if (itemConditional) {
          conditional = this.combineConditionals(
            itemConditional,
            localConditional,
            'all'
          );
        }
        let scriptName = triggerContents.substr(endIndex);
        if (scriptName === 'this' && currentTriggerName) {
          scriptName = currentTriggerName;
        }
        if (currentTrigger) {
          currentTrigger.addScriptCall(triggerType, conditional, scriptName);
        }
      } else if (firstCh === '>') {
        if (currentBlock) {
          currentBlock.commands.push({
            i: lineNum,
            type: 'callScript',
            args: [line.substr(1)],
          });
        }
      } else {
        isTrigger = false;
        if (currentScript) {
          if (line[0] === '?') {
            this.throwParsingError(
              `Invalid conditional, did you forget '+' at the start?`,
              lineNum,
              line
            );
            return;
          }
          const block = currentScript.addCommandBlock();
          if (conditionalStack.length) {
            block.conditional = this.createAllConditional(
              ...[true, ...conditionalStack]
            );
          }
          const command = this.createDialogCommand(
            line,
            currentScript,
            lineNum
          );
          block.commands.push(command);
        }
      }
    });
    if (currentScript) {
      const obj = currentScript.isValid(scene);
      const err = obj?.msg;
      if (err) {
        this.throwParsingError(err, obj.lineNum ?? 0, lines[lines.length - 1]);
      }
    }
    return { triggers, scripts };
  }
}
let scripts = (window.scripts = {});
let triggers = (window.triggers = {});
export const reset = () => {
  scripts = window.scripts = {};
  triggers = window.triggers = {};
};
export const loadRPGScript = async (rootPath, scriptFileName, scene) => {
  const url = `${rootPath === '/' ? '' : rootPath}${RPGSCRIPT_LOAD_DIR}/${scriptFileName}.rpgscript`;
  const src = await (await fetch(url)).text();
  parseRPGScript(scriptFileName, src, scene);
};
export const parseRPGScript = (scriptName, scriptSrc, scene) => {
  const parser = new ScriptParser(scriptName);
  const { triggers: localTriggers, scripts: localScripts } = parser.parse(
    scriptSrc,
    scene
  );
  Object.assign(scripts, localScripts);
  Object.assign(triggers, localTriggers);
};
export const parseSingleScript = (scriptSrc, scene) => {
  const parser = new ScriptParser(scriptSrc);
  const { scripts: localScripts, triggers: localTriggers } = parser.parse(
    scriptSrc,
    scene
  );
  Object.assign(scripts, localScripts);
  return { scripts: localScripts, triggers: localTriggers };
};
export const getScript = (scriptName) => {
  const script = scripts[scriptName];
  if (!script) {
    throw new Error(`Cannot get script with name ${scriptName}`);
  }
  return script;
};
export const getTrigger = (triggerName) => {
  const trigger = triggers[triggerName];
  if (!trigger) {
    throw new Error(`Cannot get trigger with name ${triggerName}`);
  }
  return trigger;
};
export const scriptExists = (scriptName) => {
  const script = scripts[scriptName];
  if (!script) {
    return false;
  }
  return true;
};
export const triggerExists = (triggerName) => {
  const trigger = triggers[triggerName];
  if (!trigger) {
    return false;
  }
  return true;
};
export const getScripts = () => scripts;
export const getTriggers = () => triggers;
