(() => {
  const heading = document.querySelector("main h1");
  const live = document.querySelector("#route-announcement");
  if (!heading) return;
  heading.setAttribute("tabindex", "-1");
  window.setTimeout(() => {
    heading.focus({ preventScroll: true });
    if (live) live.textContent = document.title;
  }, 0);
})();
