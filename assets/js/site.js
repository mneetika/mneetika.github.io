const header = document.querySelector(".site-header");

if (header) {
  const markScroll = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 4);
  };

  markScroll();
  window.addEventListener("scroll", markScroll, { passive: true });
}
