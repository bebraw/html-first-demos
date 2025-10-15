/* eslint-disable no-var, vars-on-top, func-names, prefer-template, prefer-destructuring, object-destructuring, object-shorthand, no-restricted-globals, eqeqeq */
const initPhotoSwipeFromDOM = function(gallerySelector) {
  function imageSize() {
    const windowWidth = window.innerWidth;
    // Image widths configured in Drupal (responsive image style: Gallery full screen).
    const galleryFullScreenImageStyles = [
      { size: 567 },
      { size: 819 },
      { size: 914 },
      { size: 1074 },
      { size: 1800 },
    ];
    for (let i = 0; i < galleryFullScreenImageStyles.length; i++) {
      if (windowWidth < galleryFullScreenImageStyles[i].size + 1) {
        return galleryFullScreenImageStyles[i].size;
      }
    }
    return 1800;
  }
  function getResponsiveStyleUrl(imageId) {
    for (let i = 0; i < drupalSettings.gallery_styles[imageId].length; i++) {
      if (drupalSettings.gallery_styles[imageId][i].includes(imageSize())) {
        return drupalSettings.gallery_styles[imageId][i];
      }
    }
  }
  function parseThumbnailElements(galleryElement) {
    let galleryImages = [];
    let imageInfo = {};
    const galleryElements = galleryElement.querySelectorAll(
      '.media-gallery__grid .media-gallery__item'
    );
    for (let i = 0; i < galleryElements.length; i++) {
      imageInfo = {};
      let imageElement = galleryElements[i].querySelector('.media-gallery__image img');
      const imageContainer = imageElement.closest('.media-gallery__item');
      const imageHeight =
        imageElement.getAttribute('data-original-height') || imageElement.clientHeight || 1; // Assume square images if nothing is found.
      const imageWidth =
        imageElement.getAttribute('data-original-width') || imageElement.clientWidth || 1;
      const aspectRatio = imageWidth / imageHeight;
      imageInfo.el = imageElement.closest('figure');
      const widthCalc = imageSize();
      // is a video
      if (imageContainer.classList.contains('media-gallery__item--video-embed')) {
        if (imageContainer.querySelector('.media-gallery__content .cookie-content-blocker')) {
          var blocker = imageContainer.querySelector(
            '.media-gallery__content .cookie-content-blocker'
          );
          const imageId = imageElement.closest('a').getAttribute('data-image-id');
          imageInfo.msrc = getResponsiveStyleUrl(imageId);
          imageInfo.videoUrl = imageElement.closest('a').getAttribute('href');
          const iframePlayer = blocker.querySelector('script').innerText;
          imageInfo.html = blocker.cloneNode(true);
          imageInfo.player = iframePlayer;
        } else {
          const iframe = imageContainer.querySelector('.media-gallery__content iframe');
          if (iframe) {
            let internalIframe = iframe.contentWindow.document.querySelector('iframe');
            const imageId = imageElement.closest('a').getAttribute('data-image-id');
            imageInfo.msrc = getResponsiveStyleUrl(imageId);
            imageInfo.videoUrl = imageElement.closest('a').getAttribute('href');
            internalIframe.removeAttribute('width');
            internalIframe.removeAttribute('height');
            const mediaUrl = imageInfo.msrc;
            const playIcon = document.querySelector('.media-gallery__play');
            imageInfo.html =
              '<div class="pswp__video-container">' +
              '<div class="pswp__video-thumbnail">' +
              '<img class="pswp__video-thumbnail-image" src="' +
              mediaUrl +
              '"></img>' +
              '<a href="' +
              imageInfo.videoUrl +
              '" class="pswp__video-play" tabindex="-1">' +
              playIcon.outerHTML +
              '<span class="visually-hidden">' +
              Drupal.t('Play video', {}, { context: 'Play video button.' }) +
              '</span>' +
              '</a></div><div class="pswp__video pswp__video-container--hidden"></div></div>';
            imageInfo.player = internalIframe.outerHTML;
          } else {
            imageInfo.html =
              '<div class="pswp__video-container">' +
              '<div class="pswp__video-thumbnail">' +
              Drupal.t(
                'Sorry, but we cannot reach the video. It may have been removed or set to private.',
                {},
                { context: 'Video component' }
              ) +
              '</div></div>';
          }
        }
      }
      // is a  picture
      else {
        let originalImage;
        if (imageContainer.querySelector('.media-gallery__image img')) {
          originalImage = imageContainer.querySelector('.media-gallery__image img');
          imageInfo.src = originalImage.getAttribute('src');
        }
        const imageId = imageElement.closest('a').getAttribute('data-image-id');
        imageInfo.src = getResponsiveStyleUrl(imageId);
        const originalWidth = parseInt(originalImage.getAttribute('data-original-width'), 10);
        const originalHeight = parseInt(originalImage.getAttribute('data-original-height'), 10);
        imageInfo.w = originalWidth ? Math.min(widthCalc, originalWidth) : widthCalc;
        if (widthCalc < originalWidth) {
          imageInfo.h = Math.round(widthCalc / aspectRatio);
        } else {
          imageInfo.h = originalHeight || originalImage.clientHeight;
        }
        imageInfo.msrc = imageElement.getAttribute('src');
      }
      imageInfo.title = imageInfo.el.querySelector('figcaption')
        ? imageInfo.el.querySelector('figcaption').innerText
        : '';
      galleryImages.push(imageInfo);
    }
    return galleryImages;
  }

  const handleFocus = function() {
    const container = document.querySelector('.pswp__scroll-wrap');
    const selectableQuery =
      'a[href]:not([tabindex="-1"]), button, iframe, form, select, input, [contentEditable], textarea';
    const selectableElements = container.querySelectorAll(selectableQuery);
    const firstElement = selectableElements[0];
    const lastElement = selectableElements[selectableElements.length - 1];
    const currentElement = document.activeElement;
    const forward = !currentElement.classList.contains('pswp__focus-backward');
    if (forward) {
      firstElement.focus();
    } else {
      lastElement.focus();
    }
  };

  // triggers when user clicks on thumbnail
  var onThumbnailsClick = function(e) {
    e = e || window.event;
    // eslint-disable-next-line
    e.preventDefault ? e.preventDefault() : (e.returnValue = false);

    // find root element of slide
    var clickedItem = e.target.closest('.media-gallery__item');
    if (!clickedItem) {
      return;
    }
    var clickedListItem = clickedItem;

    // find index of clicked item by looping through all child nodes
    // alternatively, you may define index via data- attribute
    var clickedGallery = clickedListItem.closest('.media-gallery');
    var childNodes = clickedListItem.parentNode.childNodes;
    var numChildNodes = childNodes.length;
    var nodeIndex = 0;
    var index;

    for (var i = 0; i < numChildNodes; i++) {
      if (childNodes[i].nodeType !== 1) {
        // eslint-disable-next-line no-continue
        continue;
      }

      if (childNodes[i] === clickedListItem) {
        index = nodeIndex;
        break;
      }
      nodeIndex += 1;
    }

    if (index >= 0) {
      // open PhotoSwipe if valid index found
      // eslint-disable-next-line
      openPhotoSwipe(index, clickedGallery);
    }
    return false;
  };

  var tagCurrentSlide = function(container, currItem) {
    var currentSlides = container.querySelectorAll('.pswp__item');
    // remove active class
    for (var i = 0; i < currentSlides.length; i++) {
      currentSlides[i].classList.remove('pswp__item--active');
      currentSlides[i].closest('.pswp').classList.remove('video-active');
    }
    var currentItem = currItem;
    if (currentItem.html) {
      var mediaUrl;
      if (currentItem.msrc) {
        mediaUrl = currentItem.msrc;
      }
      var currentVideoImage = container.querySelector('[src^="' + mediaUrl + '"]');
      if (currentVideoImage) {
        currentVideoImage.closest('.pswp__item').classList.add('pswp__item--active');
      }

      container.closest('.pswp').classList.add('pswp--is-video-slide');
    } else {
      var currentImage = container.querySelector('[src="' + currentItem.msrc + '"]');
      if (currentImage) {
        currentImage.closest('.pswp__item').classList.add('pswp__item--active');
      }
      container.closest('.pswp').classList.remove('pswp--is-video-slide');
    }
    return container.querySelector('.pswp__item--active');
  };

  var setupContentBlocker = function(gallery) {
    var cookieConsentButton = [].slice.call(
      gallery.container.querySelectorAll('.cookie-content-blocker__button')
    );
    if (cookieConsentButton.length) {
      cookieConsentButton.forEach(function loop(element) {
        element.addEventListener('click', function cookieClick() {
          if (typeof Cookiebot !== 'undefined' && Cookiebot.consent && !Cookiebot.consent.preferences) {
            // Accept the preferences cookies once. This should fire an event, which in turn calls this function again.
            Cookiebot.submitCustomConsent(true, false, false);
          }
          window.dispatchEvent(new CustomEvent('cookieContentBlockerConsentGiven'));
        });
      });
      if (typeof ARIAmodal !== 'undefined') {
        var cookieDialogButtons = [].slice.call(
          gallery.container.querySelectorAll('.aalto-button-as-link')
        );
        cookieDialogButtons.forEach(function(element) {
          element.removeAttribute('hidden');
        });
        ARIAmodal.setupTrigger();
      }
    }
  };

  // parse picture index and gallery index from URL (#&pid=1&gid=2)
  var photoswipeParseHash = function() {
    var hash = window.location.hash.substring(1);
    var params = {};

    if (hash.length < 5) {
      return params;
    }

    var vars = hash.split('&');
    for (var i = 0; i < vars.length; i++) {
      if (!vars[i]) {
        // eslint-disable-next-line no-continue
        continue;
      }
      var pair = vars[i].split('=');
      if (pair.length < 2) {
        // eslint-disable-next-line no-continue
        continue;
      }
      params[pair[0]] = pair[1];
    }

    if (params.gid) {
      params.gid = parseInt(params.gid, 10);
    }

    return params;
  };

  var openPhotoSwipe = function(index, galleryElement, disableAnimation, fromURL) {
    // Copy one Photoswipe HTML container from gallery to place it outside the page container, delete the rest.
    var pswpComponent = document.querySelector('.pswp');
    document.querySelector('.layout-container').parentNode.appendChild(pswpComponent);
    var galleryContainers = document.querySelectorAll('.paragraph--media-gallery');
    for (var r = 0; r < galleryContainers.length; ++r) {
      var pswp = galleryContainers[r].querySelector('.pswp');
      if (pswp) {
        pswp.parentNode.removeChild(pswp);
      }
    }

    var pswpElement = document.querySelectorAll('.pswp')[0];
    var gallery;
    var options;
    var items;

    items = parseThumbnailElements(galleryElement);

    // define options (if needed)
    options = {
      // define gallery index (for URL)
      galleryUID: galleryElement.getAttribute('data-pswp-uid'),

      getThumbBoundsFn: function(thumbindex) {
        // See Options -> getThumbBoundsFn section of documentation for more info
        var thumbnail = items[thumbindex].el.getElementsByTagName('img')[0]; // find thumbnail
        var pageYScroll = window.pageYOffset || document.documentElement.scrollTop;
        var rect = thumbnail.getBoundingClientRect();

        return {
          x: rect.left,
          y: rect.top + pageYScroll,
          w: rect.width,
        };
      },

      tapToToggleControls: function() {
        if (window.innerWidth < 600) {
          return false;
        }
        return true;
      },
    };

    // PhotoSwipe opened from URL
    if (fromURL) {
      if (options.galleryPIDs) {
        // parse real index when custom PIDs are used
        // http://photoswipe.com/documentation/faq.html#custom-pid-in-url
        for (var j = 0; j < items.length; j++) {
          if (items[j].pid == index) {
            options.index = j;
            break;
          }
        }
      } else {
        // in URL indexes start from 1
        options.index = parseInt(index, 10) - 1;
      }
    } else {
      options.index = parseInt(index, 10);
    }

    // exit if index not found
    if (isNaN(options.index)) {
      return;
    }

    if (disableAnimation) {
      options.showAnimationDuration = 0;
    }

    // Pass data to PhotoSwipe and initialize it
    // eslint-disable-next-line no-undef
    gallery = new PhotoSwipe(pswpElement, PhotoSwipeUI_Default, items, options);

    // Manage body class when gallery starts to fade in
    gallery.listen('initialZoomIn', function() {
      var bodyContainer = document.querySelector('body');
      bodyContainer.classList.add('gallery--open');
    });

    // Manage keyboard focus when gallery is activated
    gallery.listen('initialZoomInEnd', function() {
      var bodyContainer = document.querySelector('body');
      var pageContainer = document.querySelector('.layout-container');
      var galleryContainer = document.querySelector('.pswp');
      pageContainer.setAttribute('aria-hidden', 'true');
      bodyContainer.setAttribute('tabindex', '0');
      var transportBackwardElement = document.querySelector('.pswp__focus-backward');
      var transportForwardElement = document.querySelector('.pswp__focus-forward');
      bodyContainer.addEventListener('focus', handleFocus);
      galleryContainer.addEventListener('focus', handleFocus);
      transportBackwardElement.addEventListener('focus', handleFocus);
      transportForwardElement.addEventListener('focus', handleFocus);
      tagCurrentSlide(gallery.container, gallery.currItem);
    });

    // Manage keyboard focus when gallery is deactivated
    gallery.listen('close', function() {
      gallery.shout('videoDestroy');
      var bodyContainer = document.querySelector('body');
      var pageContainer = document.querySelector('.layout-container');
      var galleryContainer = document.querySelector('.pswp');
      var transportBackwardElement = document.querySelector('.pswp__focus-backward');
      var transportForwardElement = document.querySelector('.pswp__focus-forward');
      bodyContainer.classList.remove('gallery--open');
      pageContainer.removeAttribute('aria-hidden');
      bodyContainer.removeAttribute('tabindex');
      bodyContainer.removeEventListener('focus', handleFocus);
      galleryContainer.removeEventListener('focus', handleFocus);
      transportBackwardElement.removeEventListener('focus', handleFocus);
      transportForwardElement.removeEventListener('focus', handleFocus);
      var currentElement = galleryElement.querySelectorAll('.media-gallery__grid > div')[
        gallery.getCurrentIndex()
      ];
      currentElement.querySelector('a').focus();
    });

    gallery.listen('beforeChange', function() {
      gallery.shout('videoDestroy');
    });

    // Slide change video functionality
    gallery.listen('afterChange', function() {
      tagCurrentSlide(gallery.container, gallery.currItem);
      var playbuttons = gallery.container.querySelectorAll(
        '.pswp__item button, .pswp__item .pswp__video-play'
      );
      for (var i = 0; i < playbuttons.length; i++) {
        playbuttons[i].setAttribute('tabindex', '-1');
      }
      if (
        gallery.container.querySelector(
          '.pswp__item--active button, .pswp__item--active .pswp__video-play'
        )
      ) {
        var activePlayButtons = gallery.container.querySelectorAll(
          '.pswp__item--active button, .pswp__item--active .pswp__video-play'
        );
        for (var k = 0; k < activePlayButtons.length; k++) {
          activePlayButtons[k].setAttribute('tabindex', '0');
        }
      }
      setupContentBlocker(gallery);
    });

    gallery.listen('videoPlay', function() {
      gallery.container.querySelector('.pswp__item--active .pswp__video').innerHTML =
        gallery.currItem.player;
      gallery.container
        .querySelector('.pswp__item--active .pswp__video')
        .classList.remove('pswp__video-container--hidden');
      gallery.container
        .querySelector('.pswp__item--active .pswp__video-thumbnail')
        .classList.add('pswp__video-container--hidden');
      gallery.container
        .querySelector('.pswp__item--active .pswp__video-play')
        .setAttribute('tabindex', '-1');
      if (document.fullscreenElement && document.fullscreenElement.classList('pswp') > -1) {
        document.exitFullscreen();
      }
    });

    gallery.listen('videoDestroy', function() {
      if (gallery.container.querySelector('.pswp__video iframe')) {
        var video = gallery.container.querySelector('.pswp__video iframe');
        var videoContainer = video.closest('.pswp__video-container');
        video.parentNode.removeChild(video);
        videoContainer.querySelector('.pswp__video').classList.add('pswp__video-container--hidden');
        videoContainer
          .querySelector('.pswp__video-thumbnail')
          .classList.remove('pswp__video-container--hidden');
      }
    });

    gallery.init();

    // bind video play button clicks to slides
    var handlePlay = function(e) {
      if (e.target.closest('.pswp__video-play')) {
        event.preventDefault();
        e.target.closest('.pswp__item').classList.add('pswp__item--active');
        e.target.closest('.pswp').classList.add('video-active');
        gallery.shout('videoPlay');
      }
    };

    gallery.container.addEventListener('click', handlePlay);
    gallery.container.addEventListener('touchstart', handlePlay);
  };

  // loop through all gallery elements and bind events
  var galleryElements = document.querySelectorAll(gallerySelector);

  for (var i = 0, l = galleryElements.length; i < l; i++) {
    galleryElements[i].setAttribute('data-pswp-uid', i + 1);
    galleryElements[i].querySelector('.media-gallery__grid').onclick = onThumbnailsClick;
  }

  // Parse URL and open gallery if it contains #&pid=3&gid=1
  var hashData = photoswipeParseHash();
  if (hashData.pid && hashData.gid) {
    openPhotoSwipe(hashData.pid, galleryElements[hashData.gid - 1], true, true);
  }
};

// execute above function
initPhotoSwipeFromDOM('.media-gallery');
