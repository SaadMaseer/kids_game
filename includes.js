async function include(elId, file) {
  const el = document.getElementById(elId);
  if (!el) return;

  try {
    const res = await fetch(file);
    if (!res.ok) throw new Error(`File not found: ${file}`);
    const html = await res.text();
    el.innerHTML = html;
  } catch (err) {
    console.error(err);
    el.innerHTML = `<p style="color:red">⚠ Kunde inte ladda ${file}</p>`;
  }
}

function setActiveNav() {
  const path = location.pathname.split("/").pop() || "index.html"; // t.ex. "index.html" eller "game2.html"
  document.querySelectorAll('#mainNav .nav-link').forEach(a => {
    const href = a.getAttribute('href');
    a.classList.toggle('active', href === path || (path === "index.html" && href === "./"));
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  // 🔑 alltid relativa sökvägar
  await include("site-nav", "navbar.html");
  await include("site-footer", "footer.html");

  // kör först EFTER att nav laddats in
  setActiveNav();
});
