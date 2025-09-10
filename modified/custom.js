document.addEventListener("DOMContentLoaded", (event) => {
  const swiperWrapper = document.querySelector(".swiper-wrapper");
  const swiperSlides = document.querySelectorAll(
    ".swiper-wrapper .swiper-slide"
  );
  const [swipeLeft, swipeRight] = document.querySelectorAll(
    "aside .CarouselNavigation__Button-sc-925e5105-1.iZvnim"
  );

  if (swipeLeft) {
    swipeLeft.addEventListener("click", () => {
      swiperWrapper.scroll({
        behavior: "smooth",
        left: Math.max(0, swiperWrapper.scrollLeft - swiperWrapper.offsetWidth),
      });
    });
  }

  if (swipeRight) {
    swipeRight.addEventListener("click", () => {
      swiperWrapper.scroll({
        behavior: "smooth",
        left: getLastVisibleSlide(swiperWrapper, swiperSlides).offsetLeft,
      });
    });
  }
});

function getLastVisibleSlide(swiperWrapper, swiperSlides) {
  return Array.from(swiperSlides)
    .reverse()
    .find(
      (slide) =>
        slide.offsetLeft <= swiperWrapper.scrollLeft + swiperWrapper.offsetWidth
    );
}
