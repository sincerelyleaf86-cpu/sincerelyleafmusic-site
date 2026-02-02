// app.js (FULL FILE)
// Notes:
// - Boot image rotates randomly using the list in data-images on #bootScene.
// - START button hides boot and reveals main.
// - Now Playing embed is loaded from /config.json (repo-controlled: only you can change it).

document.addEventListener("DOMContentLoaded", () => {
  const startBtn = document.getElementById("startBtn");
  const boot = document.getElementById("boot");
  const main = document.getElementById("main");
  const year = document.getElementById("year");
  const bootScene = document.getElementById("bootScene");
  const playerSlot = document.getElementById("playerSlot");

  if (year) year.textContent = new Date().getFullYear();

  // Randomize boot image (avoids repeating last pick)
  if (bootScene) {
    const list = (bootScene.dataset.images || "")
      .split(",")
      .map(s => s.trim())
      .filter(Boolean);

    if (list.length > 0) {
      const last = localStorage.getItem("sl_boot_last") || "";
      let pick = list[Math.floor(Math.random() * list.length)];

      if (list.length > 1) {
        let guard = 0;
        while (pick === last && guard < 40) {
          pick = list[Math.floor(Math.random() * list.length)];
          guard++;
        }
      }

      bootScene.src = pick;
      localStorage.setItem("sl_boot_last", pick);
    }
  }

  function enterStudio() {
    if (boot) boot.classList.add("hidden");
    if (main) main.classList.remove("hidden");

    // Optional: jump user to the first panel
    const videos = document.getElementById("videos");
    if (videos) window.location.hash = "#videos";
  }

  if (startBtn) startBtn.addEventListener("click", enterStudio);

  // Keyboard support
  document.addEventListener("keydown", (e) => {
    if (!boot || boot.classList.contains("hidden")) return;
    if (e.key === "Enter" || e.key === " ") enterStudio();
  });

  // Load player embed URL from config.json
  async function loadConfig() {
    try {
      const res = await fetch("/config.json", { cache: "no-store" });
      if (!res.ok) return;

      const cfg = await res.json();
      const url = (cfg.nowPlayingEmbedUrl || "").trim();

      if (playerSlot && url) {
        playerSlot.innerHTML = `
          <iframe
            title="Now Playing"
            src="${url}"
            loading="lazy"
            allow="autoplay; encrypted-media"
            referrerpolicy="no-referrer">
          </iframe>
        `;
      }
    } catch {
      // silent fail: keeps the "PLAYER NOT SET" placeholder
    }
  }

  loadConfig();
});
