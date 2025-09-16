import fs from 'fs';

const defaultTemplate = fs.readFileSync('src-vanilla/templates/template.html', 'utf8');

export const getDefaultTemplate = () => {
  return defaultTemplate;
};
