

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



const macImmersionEle = document.querySelector('#macImmersion');
const sideButtons = document.querySelector('#side-buttons');
const darkModeButton = document.querySelector('#dark-Mode-button');
const header = document.querySelector('header');
const root = document.documentElement;
const heroTrigger = document.querySelector('#hero-trigger');
const heroSectionPanel = document.querySelector('#hero-section-left-panel');
const PrimaryBodyContent = document.querySelector('#primary-body-content');
const office5 = document.querySelector('#office5')

window.addEventListener('scroll', () => {
  const triggerPosition = heroTrigger.getBoundingClientRect().top + window.scrollY;

  if (window.scrollY > triggerPosition && window.scrollY < office5.offsetTop) {
    macImmersionEle.classList.add('visible');
    header.classList.add('visible');
    sideButtons.classList.add('visible');
    PrimaryBodyContent.classList.add('visible');
    heroSectionPanel.classList.add('visible');

  } else {
    macImmersionEle.classList.remove('visible');
    header.classList.remove('visible');
    sideButtons.classList.remove('visible');
    PrimaryBodyContent.classList.remove('visible');
    heroSectionPanel.classList.remove('visible');
  }
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

const scrollGuide = document.querySelector('#scroll-down-guide-container');

window.addEventListener('scroll', () => {
  if (window.scrollY > 5) {
    scrollGuide.classList.add('visible');
  } else {
    scrollGuide.classList.remove('visible');
  }
});






const form = document.getElementById('form');
const submitBtn = form.querySelector('button[type="submit"]');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = new FormData(form);
  formData.append("access_key", "c70e286e-2f8e-4f23-aeae-92a70f63c62a");

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












const btn = document.getElementById('videoBtn');
const video = document.getElementById('demoVideo');
const altBodySectionHeading = document.getElementById('alt-body-section-heading');
let played = false;

btn.addEventListener('click', (e) => {
  if (played) return;          // after the video, behave as a normal link
  e.preventDefault();          // stop "#" navigation

  btn.textContent = 'Loading...';

  video.style.display = 'block';
  video.controls = false;      // no controls
  video.loop = false;          // play once
  video.play();

  btn.classList.add('disabled');          // Bootstrap disabled look
  btn.style.pointerEvents = 'none';       // block clicks while playing
});

video.addEventListener('ended', () => {
  played = true;
  altBodySectionHeading.textContent = 'Just Kidding!';
  btn.textContent = 'View Source on Github';
  btn.href = 'https://github.com/chahalarsh/chahalarsh'; // new link
  btn.target = '_blank';
  btn.rel = 'noopener noreferrer';
  btn.classList.remove('disabled');
  btn.style.pointerEvents = '';
  video.style.display = 'none';
});
