
// ======= Devtools deterrent script (NOT foolproof) =======

// 1) Block common keyboard shortcuts that open devtools or view-source
document.addEventListener('keydown', function (e) {
  // F12
  if (e.key === 'F12') { e.preventDefault(); e.stopPropagation(); return; }

  // Ctrl+Shift+I or Ctrl+Shift+J or Ctrl+Shift+C (Windows/Linux)
  if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) {
    e.preventDefault(); e.stopPropagation(); return;
  }

  // Cmd+Opt+I on mac (Meta = Cmd)
  if (e.metaKey && e.altKey && e.key === 'I') {
    e.preventDefault(); e.stopPropagation(); return;
  }

  // Ctrl+U (view source), Ctrl+S (save), Ctrl+Shift+S
  if (e.ctrlKey && (e.key === 'U' || e.key === 's' || e.key === 'S')) {
    e.preventDefault(); e.stopPropagation(); return;
  }
});

// 2) Disable right-click context menu
document.addEventListener('contextmenu', function (e) {
  e.preventDefault();
}, { passive: false });

// 3) (Optional) detect devtools open via heuristic and show warning
//    This uses a few heuristics: outer/inner size difference and console time trick.
//    NOTE: this is heuristic and will produce false positives/negatives.
(function detectDevTools() {
  let devtoolsOpen = false;
  let checkCount = 0;

  function showWarning() {
    if (document.getElementById('devtools-warning')) return;
    const div = document.createElement('div');
    div.id = 'devtools-warning';
    div.style.position = 'fixed';
    div.style.left = '0';
    div.style.right = '0';
    div.style.bottom = '0';
    div.style.background = 'rgba(255,80,80,0.95)';
    div.style.color = '#111';
    div.style.padding = '12px';
    div.style.fontFamily = 'sans-serif';
    div.style.textAlign = 'center';
    div.style.zIndex = '99999';
    div.textContent = 'Warning: Developer tools open. For best security, please use the game as intended.';
    const btn = document.createElement('button');
    btn.textContent = 'Dismiss';
    btn.style.marginLeft = '12px';
    btn.onclick = () => div.remove();
    div.appendChild(btn);
    document.body.appendChild(div);
  }

  function check() {
    checkCount++;
    // Heuristic A: large difference between outerWidth and innerWidth (devtools docked)
    const widthDiff = Math.abs(window.outerWidth - window.innerWidth);
    const heightDiff = Math.abs(window.outerHeight - window.innerHeight);
    if (widthDiff > 160 || heightDiff > 160) {
      devtoolsOpen = true;
    } else {
      // Heuristic B: console toString trick — runs a toString which only triggers toString when console open in some browsers
      let start = performance.now();
      debugger; // eslint-disable-line no-debugger
      let duration = performance.now() - start;
      if (duration > 100) { // if debugger paused long time, assume devtools
        devtoolsOpen = true;
      } else {
        devtoolsOpen = false;
      }
    }

    // If detected repeatedly, show a small warning
    if (devtoolsOpen && checkCount > 1) {
      showWarning();
    }
  }

  // check periodically, but not too frequently
  setInterval(check, 1500);
})();

// 4) Best-practice guidance for production (console message)
console.info('%cSecurity note: client-side code is visible in the browser. For real protection run sensitive logic on a server and remove source maps in production.', 'color: orange; font-weight: bold;');


