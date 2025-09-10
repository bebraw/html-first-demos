document.addEventListener("DOMContentLoaded", (event) => {
  const swiperWrapper = document.querySelector(".swiper-wrapper");
  const swiperSlides = document.querySelectorAll(
    ".swiper-wrapper .swiper-slide"
  );
  const [swipeLeft, swipeRight] = document.querySelectorAll(
    "aside .CarouselNavigation__Button-sc-925e5105-1.iZvnim"
  );

  const lastVisibleSlide = getLastVisibleSlide(swiperWrapper, swiperSlides);
  console.log("last visible slide", lastVisibleSlide);

  if (swipeLeft) {
    // TODO: Implement this part
    swipeLeft.addEventListener("click", () => {
      if (swiperWrapper) {
        console.log("Width on swipe left:", swiperWrapper.offsetWidth);
      } else {
        console.log("swiper-wrapper not found");
      }
    });
  }

  if (swipeRight) {
    swipeRight.addEventListener("click", () => {
      const lastVisibleSlide = getLastVisibleSlide(swiperWrapper, swiperSlides);

      swiperWrapper.scroll({
        behavior: "smooth",
        left: lastVisibleSlide.offsetLeft,
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
