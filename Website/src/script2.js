

const pageLoader = document.querySelector('#page-loader');
const loaderProgress = document.querySelector('#page-loader-progress');
const loaderStartedAt = performance.now();
const loaderMinimumDuration = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 200 : 650;
let documentLoaded = document.readyState === 'complete';
let sceneLoaded = false;
let loaderDismissed = false;
let loaderFallback;

const updateLoaderProgress = (progress) => {
  const percent = Math.max(0, Math.min(95, Math.round(progress * 0.95)));
  document.documentElement.style.setProperty('--loader-progress', `${percent}%`);
  loaderProgress.setAttribute('aria-valuenow', String(percent));
};

const dismissPageLoader = () => {
  if (!documentLoaded || !sceneLoaded || loaderDismissed) return;
  loaderDismissed = true;
  window.clearTimeout(loaderFallback);

  const remainingTime = Math.max(0, loaderMinimumDuration - (performance.now() - loaderStartedAt));
  window.setTimeout(() => {
    document.documentElement.style.setProperty('--loader-progress', '100%');
    loaderProgress.setAttribute('aria-valuenow', '100');
    pageLoader.classList.add('is-complete');

    window.setTimeout(() => {
      document.documentElement.classList.remove('page-loading');
      pageLoader.classList.add('is-hidden');
      pageLoader.setAttribute('aria-hidden', 'true');
    }, 350);
  }, remainingTime);
};

window.addEventListener('load', () => {
  documentLoaded = true;
  dismissPageLoader();
}, { once: true });

window.addEventListener('site:load-progress', (event) => {
  const { active, progress } = event.detail;
  if (active || progress > 0) updateLoaderProgress(progress);

  if (!active && progress >= 100) {
    sceneLoaded = true;
    dismissPageLoader();
  }
});

if (documentLoaded) {
  window.setTimeout(dismissPageLoader, 0);
}

loaderFallback = window.setTimeout(() => {
  sceneLoaded = true;
  dismissPageLoader();
}, 10000);

const workBoxes = document.querySelectorAll('.work-box');

const setOpenWorkBox = (activeWorkBox) => {
  workBoxes.forEach((workBox) => {
    workBox.classList.toggle('is-open', workBox === activeWorkBox);
  });
};

workBoxes.forEach((workBox) => {
  workBox.addEventListener('mouseenter', () => {
    setOpenWorkBox(workBox);
  });

  workBox.addEventListener('focusin', () => {
    setOpenWorkBox(workBox);
  });

  workBox.addEventListener('click', (event) => {
    if (!event.target.closest('a')) {
      setOpenWorkBox(workBox);
    }
  });
});

const workSection = document.querySelector('#Work-section');

if (workSection && 'IntersectionObserver' in window) {
  workSection.classList.add('work-section-reveal');

  const workSectionObserver = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) {
      workSection.classList.add('is-visible');
      workSectionObserver.disconnect();
    }
  }, { threshold: 0.15 });

  workSectionObserver.observe(workSection);
} else {
  workSection?.classList.add('is-visible');
}



(function () {
  const API_BASE = "/api/leetcode-solved";

  async function loadStats(username, container) {
    container.innerHTML = `<div class="state">Loading stats…</div>`;
    try {
      const res = await fetch(`${API_BASE}?username=${encodeURIComponent(username)}`);
      if (!res.ok) throw new Error(`API responded ${res.status}`);
      const data = await res.json();
      render(data, username, container);
    } catch (err) {
      container.innerHTML = `<div class="state error">Couldn't load stats for "${username}". ${err.message}</div>`;
    }
  }


  function render(data, username, container) {
    const { solvedProblem } = data;

    container.innerHTML = `
      <div class="total">${solvedProblem}</div>
      <div class="total-label">problems solved on leetcode</div>
      
    `;
  }

  document.querySelectorAll("#lc-card, .lc-card").forEach(el => {
    const username = el.dataset.username;
    if (username) loadStats(username, el);
  });

  window.LeetCodeWidget = { load: loadStats };


})();



const sideButtons = document.querySelector('#side-buttons');
const darkModeButton = document.querySelector('#dark-Mode-button');
const header = document.querySelector('header');
const root = document.documentElement;
const heroSectionPanel = document.querySelector('#hero-section-left-panel');
const PrimaryBodyContent = document.querySelector('#primary-body-content');

// Display portfolio immediately
[header, sideButtons, PrimaryBodyContent, heroSectionPanel].forEach(el => {
  el?.classList.add('visible');
});


const applyTheme = (theme) => {
  if (theme === 'dark') {
    root.classList.add('dark-Mode');
  } else {
    root.classList.remove('dark-Mode');
  }
};


const getInitialTheme = () => {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    return savedTheme;
  }

  const userPrefersDark = window.matchMedia('(prefers-color-scheme: light)').matches;
  return userPrefersDark ? 'dark' : 'light';
};

let currentTheme = getInitialTheme();
applyTheme(currentTheme);

darkModeButton.addEventListener('click', () => {
  if (currentTheme === 'dark') {
    currentTheme = 'light';
  } else {
    currentTheme = 'dark';
  }
  localStorage.setItem('theme', currentTheme);
  applyTheme(currentTheme);
})



const bodyEl = document.getElementById('body-element-container');
const altEl = document.getElementById('alt-body-element-container');
const bodyParent = bodyEl.parentNode;
const bodyNextSibling = bodyEl.nextSibling;

if (typeof window.DisableDevtool === 'function') {
  window.DisableDevtool({
    disableMenu: false,
    ondevtoolopen: function (type, next) {
      if (bodyEl.isConnected) bodyParent.removeChild(bodyEl);
      altEl.style.display = 'flex';
    },
    ondevtoolclose: function () {
      if (!bodyEl.isConnected) bodyParent.insertBefore(bodyEl, bodyNextSibling);
      altEl.style.display = 'none';
      window.location.reload();
    }
  });
}




const form = document.getElementById('form');
const submitBtn = form.querySelector('button[type="submit"]');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = new FormData(form);
  formData.append("access_key", "5b4a933f-a167-4190-ae6a-265a7b71e5b9");

  const originalText = submitBtn.textContent;

  submitBtn.textContent = "Sending...";
  submitBtn.disabled = true;

  try {
    const response = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      body: formData
    });

    const data = await response.json();

    if (response.ok) {
      submitBtn.textContent = "Success!"
      form.reset();
    } else {
      submitBtn.textContent = "Error!"

    }

  } catch (error) {
    alert("Something went wrong. Please try again.");
  } finally {

    setTimeout(() => {
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }, 2000)
  }
});



document.querySelectorAll('[data-scroll-target]').forEach((button) => {
  button.addEventListener('click', () => {
    document.getElementById(button.dataset.scrollTarget)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  });
});

