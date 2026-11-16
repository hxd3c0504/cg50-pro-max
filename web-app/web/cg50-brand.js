
(() => {
  "use strict";
  function install() {
    const strong = document.querySelector("header strong");
    if (!strong || document.getElementById("cg50-brand-version")) return;

    const brand = document.createElement("span");
    brand.style.cssText =
      "display:inline-flex;flex-direction:column;" +
      "vertical-align:middle;gap:2px";
    strong.before(brand);
    brand.append(strong);

    const small = document.createElement("small");
    small.id = "cg50-brand-version";
    small.style.cssText =
      "display:block;font-size:12px;line-height:1.3;" +
      "font-weight:400;opacity:.65";
    small.textContent = "V " + window.CG50Release.version;
    brand.append(small);
  }
  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", install, {once:true});
  else install();
})();
