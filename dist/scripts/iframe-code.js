{
  /* <iframe
  src="/examples/regem-ludos-rpgscript/ex01.html"
  class="blog-iframe"
  style="height: 250px"
></iframe> */
}

const createIframeCode = async ({ src, height, language }) => {
  const code = await fetch(src).then((res) => res.text());
  const container = document.createElement('div');
  container.className = 'iframe-code blog-iframe';

  const header = document.createElement('div');
  header.className = 'iframe-code-header';
  const showHtmlButton = document.createElement('button');
  showHtmlButton.textContent = 'Show App';
  showHtmlButton.style.textDecoration = 'underline';
  showHtmlButton.addEventListener('click', () => {
    codeContainer.style.display = 'none';
    iframeContainer.style.display = 'block';
    showHtmlButton.style.textDecoration = 'underline';
    showCodeButton.style.textDecoration = 'none';
  });
  header.appendChild(showHtmlButton);
  const showCodeButton = document.createElement('button');
  showCodeButton.textContent = 'Show Code';
  showCodeButton.addEventListener('click', () => {
    codeContainer.style.display = 'block';
    iframeContainer.style.display = 'none';
    showHtmlButton.style.textDecoration = 'none';
    showCodeButton.style.textDecoration = 'underline';
  });
  header.appendChild(showCodeButton);

  const body = document.createElement('div');
  body.className = 'iframe-code-body';

  const iframeContainer = document.createElement('div');
  iframeContainer.className = 'iframe-container';

  const iframe = document.createElement('iframe');
  iframe.src = src;
  iframe.className = 'code-iframe';
  iframe.style.width = '100%';
  iframe.style.height = height;

  iframeContainer.appendChild(iframe);

  const codeContainer = document.createElement('div');
  codeContainer.className = 'code-container';
  codeContainer.style.display = 'none';
  codeContainer.style.width = '100%';
  codeContainer.style.height = height;
  codeContainer.style.overflowY = 'auto';

  const pre = document.createElement('pre');
  pre.style.margin = '0';
  pre.style.padding = '0';
  const codeElem = document.createElement('code');
  codeElem.className = `language-${language ?? 'javascript'}`;
  codeElem.textContent = code;

  pre.appendChild(codeElem);
  codeContainer.appendChild(pre);

  body.appendChild(iframeContainer);
  body.appendChild(codeContainer);

  container.appendChild(header);
  container.appendChild(body);

  return container;
};

window.addEventListener('DOMContentLoaded', () => {
  const iframes = document.querySelectorAll('.iframe-code');
  for (const container of iframes) {
    const src = container.getAttribute('src');
    const height = container.getAttribute('height');
    const language = container.getAttribute('language');
    createIframeCode({ src, height, language })
      .then((iframeCode) => {
        console.log('append', container, iframeCode);
        container.appendChild(iframeCode);
        window.highlightCode();
      })
      .catch((error) => {
        console.error('error', error);
      });
  }
});
