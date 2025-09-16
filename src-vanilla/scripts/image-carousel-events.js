window.imageCarousel = {
  setCurrentImageIndex(index) {
    const imageCarousel = document.querySelector('.image-carousel');
    const imageCarouselThumbnails = imageCarousel.querySelector(
      '.image-carousel-thumbnails'
    );
    const imageCarouselThumbnailsImages =
      imageCarouselThumbnails.querySelectorAll('img');
    imageCarouselThumbnailsImages.forEach((image, i) => {
      if (i === index) {
        image.classList.add('image-carousel-thumbnail-selected');
      } else {
        image.classList.remove('image-carousel-thumbnail-selected');
      }
    });
    const imageCarouselCurrentImageContainer = imageCarousel.querySelector(
      '.image-carousel-current-image-container'
    );
    const imageCarouselCurrentImage =
      imageCarouselCurrentImageContainer.querySelector('img');
    imageCarouselCurrentImage.src = imageCarouselThumbnailsImages[index].src;
  },
};
