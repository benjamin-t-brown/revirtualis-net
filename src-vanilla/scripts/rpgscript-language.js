// RPGScript language definition for highlight.js
// Based on the TextMate grammar in rpgscript.json

function rpgscript(hljs) {
  const KEYWORDS = {
    keyword: 'action step item step-first step-off load',
    operator: 'isnot gt lt is all any oncePerInstance one as once eq this with func',
    literal: 'true false null'
  };

  const STRING = {
    className: 'string',
    variants: [
      hljs.QUOTE_STRING_MODE,
      hljs.APOS_STRING_MODE
    ]
  };

  const NUMBER = {
    className: 'number',
    begin: /\b\d+(\.\d+)?\b/
  };

  const COMMENT = {
    className: 'comment',
    variants: [
      {
        begin: /\/\*/,
        end: /\*\//
      },
      {
        begin: /\/\//
      }
    ]
  };

  const FUNCTION = {
    className: 'function',
    begin: /^(\s*)([a-zA-Z_][a-zA-Z0-9_]*):/,
    beginScope: {
      2: 'title.function'
    }
  };

  const STORAGE_SET = {
    className: 'keyword',
    begin: /^(\s*)(\+setStorage)/,
    beginScope: {
      2: 'keyword'
    }
  };

  const FUNCTION_CALL = {
    className: 'function',
    begin: /^(\s*)(\+:([\w-]*))/,
    beginScope: {
      2: 'title.function'
    }
  };

  const THIS_REFERENCE = {
    className: 'constant',
    begin: /^(\s*)(@this)/,
    beginScope: {
      2: 'constant'
    }
  };

  const AT_REFERENCE = {
    className: 'constant',
    begin: /^(\s*)(@\w+)/,
    beginScope: {
      2: 'constant'
    }
  };

  const HASH_REFERENCE = {
    className: 'function',
    begin: /^(#\w+)/,
    beginScope: {
      1: 'title.function'
    }
  };

  const TRIGGER_KEYWORDS = {
    className: 'keyword',
    begin: /^(\s*)(action|step|item|step-first|step-off|load),/,
    beginScope: {
      2: 'keyword'
    }
  };

  const CONDITIONAL = {
    className: 'keyword',
    begin: /(\?)/,
    beginScope: {
      1: 'keyword'
    },
    end: /(:)/,
    endScope: {
      1: 'keyword'
    }
  };

  const PLUS_OPERATOR = {
    className: 'keyword',
    begin: /^(\s*)(\+)/,
    beginScope: {
      2: 'keyword'
    }
  };

  const BRACES = {
    className: 'punctuation',
    begin: /(\{)/,
    end: /(\})/,
    beginScope: {
      1: 'punctuation'
    },
    endScope: {
      1: 'punctuation'
    }
  };

  const PARENTHESES = {
    className: 'punctuation',
    begin: /(\()/,
    end: /(\))/,
    beginScope: {
      1: 'punctuation'
    },
    endScope: {
      1: 'punctuation'
    }
  };

  const BRACKETS = {
    className: 'punctuation',
    begin: /(\[)/,
    end: /(\])/,
    beginScope: {
      1: 'punctuation'
    },
    endScope: {
      1: 'punctuation'
    }
  };

  const VARIABLE = {
    className: 'variable',
    begin: /<[^>]+>/
  };

  const EQUALS_COMMENT = {
    className: 'comment',
    begin: /^(\s*)(=)/,
    beginScope: {
      2: 'comment'
    }
  };

  return {
    name: 'RPGScript',
    aliases: ['rpgscript', 'rpg'],
    keywords: KEYWORDS,
    contains: [
      COMMENT,
      STRING,
      NUMBER,
      FUNCTION,
      STORAGE_SET,
      FUNCTION_CALL,
      THIS_REFERENCE,
      AT_REFERENCE,
      HASH_REFERENCE,
      TRIGGER_KEYWORDS,
      CONDITIONAL,
      PLUS_OPERATOR,
      BRACES,
      PARENTHESES,
      BRACKETS,
      VARIABLE,
      EQUALS_COMMENT,
      {
        className: 'variable',
        begin: /\{[^}]+\}/
      },
      {
        className: 'variable',
        begin: /\[[^\]]+\]/
      }
    ]
  };
}

window.rpgscript = rpgscript;
