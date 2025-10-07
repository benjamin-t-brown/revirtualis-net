window.highlightCode = () => {
  const preElements = document.querySelectorAll('.post-content pre');
  preElements.forEach((pre) => {
    const codeElement = pre.querySelector('code');
    if (codeElement) {
      const textContent = codeElement.textContent || '';
      if (textContent.startsWith('\n')) {
        codeElement.textContent = textContent.substring(1);
      }
    } else {
      const textContent = pre.textContent || '';
      if (textContent.startsWith('\n')) {
        pre.textContent = textContent.substring(1);
      }
    }
  });

  if (typeof window.rpgscript === 'function') {
    if (!window.hljs.getLanguage('rpgscript')) {
      window.hljs.registerLanguage('rpgscript', window.rpgscript);
    }
  }

  window.hljs.highlightAll();
};

window.highlightCode();
