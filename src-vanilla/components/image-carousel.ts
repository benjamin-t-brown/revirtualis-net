const createThumbnailElement = (image: string, index: number) => {
  return /*html*/ `
<img
  src=${image}
  alt=${'screenshot' + index}
  title=${image}
  onclick="window.imageCarousel.setCurrentImageIndex(${index})"
  class="${index === 0 ? 'image-carousel-thumbnail-selected' : 'image-carousel-thumbnail-not-selected'}"
/>
  `;
};

export const createImageCarousel = (images: string[]) => {
  return /*html*/ `
<div class="image-carousel">
  <div class="image-carousel-current-image-container">
    <img src="${images[0]}" alt="screenshot" />
  </div>
  <div class="image-carousel-thumbnails">
    ${images.map(createThumbnailElement).join('\n')}
  </div>
</div>
  `;
};
