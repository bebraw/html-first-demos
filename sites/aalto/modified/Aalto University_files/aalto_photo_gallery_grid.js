/* eslint-disable prefer-template */ // Doesn't work with IE11
function calculateColumns() {
  if (document.querySelector('.media-gallery__grid')) {
    const galleries = document.querySelectorAll('.media-gallery');
    for (let g = 0; g < galleries.length; ++g) {
      const container = galleries[g].querySelector('.media-gallery__grid');
      let divs = galleries[g].querySelectorAll('.media-gallery__item--image');
      let cols;

      if (divs.length < 1) {
        divs = galleries[g].querySelectorAll('.media-gallery__item--video-embed');
      }
      if (container && divs[0]) {
        cols = Math.round(container.clientWidth / divs[0].clientWidth);
      }
      const computedStyle = window.getComputedStyle(divs[0]);
      const paddingTop = parseFloat(computedStyle.getPropertyValue('padding-top'));
      const paddingBottom = parseFloat(computedStyle.getPropertyValue('padding-bottom'));

      const gutter = Math.ceil(paddingTop + paddingBottom);
      const heights = [];
      for (let i = 0; i < divs.length; ++i) {
        const col = i % cols;
        if (!heights[col]) {
          heights[col] = 0;
        }
        const image = divs[i].querySelector('.media-gallery__image img');
        const imageContainer = divs[i].querySelector('.media-gallery__image');
        const caption = divs[i].querySelector('.media-gallery__description');
        const captionHeight = caption ? caption.clientHeight : 0;
        const imageHeight = image.clientHeight || image.getAttribute('data-original-height') || 1; // Assume square images if nothing is found.
        const imageWidth = image.clientWidth || image.getAttribute('data-original-width') || 1;
        const aspectRatio = imageWidth / imageHeight;
        const divHeight = imageContainer.clientWidth / aspectRatio + captionHeight + gutter;
        heights[col] += divHeight;
        if (
          navigator.userAgent.indexOf('MSIE ') > -1 ||
          navigator.userAgent.indexOf('Trident/') > -1
        ) {
          const height = 'height: ' + divHeight + 'px;';
          divs[i].setAttribute('style', height);
        }
      }
      const heightAddition = 30; // Helping to avoid overflowing of the grid due to inaccurate height calculations and roundings.
      const containerHeight = Math.round(Math.max.apply(null, heights) + heightAddition);
      container.style.height = containerHeight + 'px';
      container.style.maxHeight = 'none';
      if (!galleries[g].querySelector('.media-gallery__column-divider')) {
        for (let j = 0; j < 4; ++j) {
          const dividerNode = document.createElement('SPAN');
          dividerNode.setAttribute('class', 'media-gallery__column-divider');
          container.appendChild(dividerNode);
        }
      }
    }
  }
}

// Execute when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  calculateColumns();
});

// Recalculate columns on resize
window.addEventListener('resize', calculateColumns);
