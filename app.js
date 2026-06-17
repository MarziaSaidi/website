document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initMobileNav();
  initSkillsFilter();
  initPlaygroundTabs();
  initCsvValidator();

  initMauiSettings();
  initContactForm();
  initScrollAnimations();
});

/* ==========================================================================
   1. Theme Toggle Logic
   ========================================================================== */
function initTheme() {
  const themeToggleBtn = document.getElementById('theme-toggle');
  
  if (!themeToggleBtn) return;

  const getTheme = () => {
    const savedTheme = localStorage.getItem('color-scheme');
    if (savedTheme) return savedTheme;
    // Default to dark mode if no local storage exists
    return 'dark';
  };

  const setTheme = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    document.querySelector('meta[name="color-scheme"]').content = theme;
    localStorage.setItem('color-scheme', theme);
  };

  // Set initial state
  setTheme(getTheme());

  themeToggleBtn.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  });

  // Watch for system OS theme changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    // Only update if the user has not manually set a preference
    if (!localStorage.getItem('color-scheme')) {
      setTheme(e.matches ? 'dark' : 'light');
    }
  });
}

/* ==========================================================================
   2. Mobile Navigation Toggle
   ========================================================================== */
function initMobileNav() {
  const toggleBtn = document.querySelector('.mobile-nav-toggle');
  const navMenu = document.querySelector('.nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');

  if (!toggleBtn || !navMenu) return;

  const toggleMenu = () => {
    toggleBtn.classList.toggle('active');
    navMenu.classList.toggle('active');
    
    // Toggle accessibility attributes
    const isExpanded = navMenu.classList.contains('active');
    toggleBtn.setAttribute('aria-expanded', isExpanded);
    
    // Animate hamburger bars
    const bars = toggleBtn.querySelectorAll('.bar');
    if (isExpanded) {
      bars[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
      bars[1].style.opacity = '0';
      bars[2].style.transform = 'rotate(-45deg) translate(6px, -6px)';
    } else {
      bars[0].style.transform = 'none';
      bars[1].style.opacity = '1';
      bars[2].style.transform = 'none';
    }
  };

  toggleBtn.addEventListener('click', toggleMenu);

  // Close menu when a link is clicked
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (navMenu.classList.contains('active')) {
        toggleMenu();
      }
    });
  });
}

/* ==========================================================================
   3. Interactive Skills Matrix (Filter & Highlights)
   ========================================================================== */
function initSkillsFilter() {
  const skillBubbles = document.querySelectorAll('.skill-bubble');
  const timelineItems = document.querySelectorAll('.timeline-item');
  
  if (!skillBubbles.length || !timelineItems.length) return;

  const activeSkills = new Set();

  skillBubbles.forEach(bubble => {
    bubble.addEventListener('click', () => {
      const skillId = bubble.getAttribute('data-skill-id');
      
      // Toggle selection state
      if (activeSkills.has(skillId)) {
        activeSkills.delete(skillId);
        bubble.classList.remove('active');
      } else {
        activeSkills.add(skillId);
        bubble.classList.add('active');
      }

      updateTimelineHighlights();
    });
  });

  function updateTimelineHighlights() {
    if (activeSkills.size === 0) {
      // Clear all filters if nothing is active
      timelineItems.forEach(item => {
        item.classList.remove('faded', 'highlighted');
      });
      return;
    }

    timelineItems.forEach(item => {
      const itemSkillsAttr = item.getAttribute('data-skills') || '';
      const itemSkillsList = itemSkillsAttr.split(' ');
      
      // Check if timeline item matches any of the active skills
      const hasMatch = itemSkillsList.some(skill => activeSkills.has(skill));

      if (hasMatch) {
        item.classList.add('highlighted');
        item.classList.remove('faded');
      } else {
        item.classList.add('faded');
        item.classList.remove('highlighted');
      }
    });
  }
}

/* ==========================================================================
   4. Playgrounds Tab Navigation
   ========================================================================== */
function initPlaygroundTabs() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.playground-tab-content');

  if (!tabBtns.length || !tabContents.length) return;

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabTarget = btn.getAttribute('data-tab');

      // Update active button
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Update visible content
      tabContents.forEach(content => {
        content.classList.remove('active');
        if (content.id === `tab-${tabTarget}`) {
          content.classList.add('active');
        }
      });
    });
  });
}

/* ==========================================================================
   5. CSV Pipeline Validator Playground
   ========================================================================== */
// Split a CSV line into fields, respecting double-quoted values (so addresses
// containing commas stay in a single column). Supports "" as an escaped quote.
function parseCsvLine(line) {
  const fields = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      fields.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  fields.push(current);
  return fields;
}

// Validate a contact date in mm-dd or mm-dd-yyyy form (Quill & Pigeon stores
// birthdays/anniversaries without requiring a year). Rejects impossible
// calendar dates such as 02-30 or 13-40. Returns true when valid.
function isValidContactDate(str) {
  let month, day, year;

  if (/^\d{1,2}-\d{1,2}$/.test(str)) {
    [month, day] = str.split('-').map(Number);
    year = 2000; // leap year reference so 02-29 is accepted when no year given
  } else if (/^\d{1,2}-\d{1,2}-\d{4}$/.test(str)) {
    [month, day, year] = str.split('-').map(Number);
  } else {
    return false;
  }

  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

// Break a single address string into structured parts (the address-parsing
// pipeline I built for Quill & Pigeon). Expected shape:
//   "Street[, Apt/Suite], City, State ZIP"
// Returns { street, unit, city, state, zip }.
function parseAddress(raw) {
  const result = { street: '', unit: '', city: '', state: '', zip: '' };
  const parts = raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  if (!parts.length) return result;

  // Last segment holds "State ZIP" (e.g. "ME 04101").
  const tail = parts[parts.length - 1];
  const stateZip = tail.match(/^([A-Za-z]{2})\s+(\d{5})$/);
  if (stateZip) {
    result.state = stateZip[1].toUpperCase();
    result.zip = stateZip[2];
  }

  result.street = parts[0] || '';
  if (parts.length >= 2) result.city = parts[parts.length - 2];
  // Anything between the street and the city is the apartment / suite line.
  if (parts.length >= 4) result.unit = parts.slice(1, parts.length - 2).join(', ');

  return result;
}

function initCsvValidator() {
  const csvInput = document.getElementById('csv-input');
  const btnValidate = document.getElementById('btn-validate-csv');
  const btnReset = document.getElementById('btn-reset-csv');
  const tableContainer = document.getElementById('csv-output-table-container');

  if (!csvInput || !btnValidate || !tableContainer) return;

  const sampleData = `Mom,Jane,Doe,"23 Maine St, Apt 4, Lisbon, ME 04250",03-12,06-20
Dad,John,Doe,"500 Pine Ave, Austin, TX 73301",12-25,
Bestie,Sarah,Connor,,08-01-1982,09-15
,Mike,Jones,"42 Pigeon Ave, Austin, TX 73301",07-04,
Sis,Emma,Stone,"Just a street name",02-30,13-40`;

  const resetSample = () => {
    csvInput.value = sampleData;
    tableContainer.innerHTML = '<div class="empty-state"><p>Click "Run Schema Validation" to parse the CSV input.</p></div>';
  };

  btnReset.addEventListener('click', resetSample);

  btnValidate.addEventListener('click', () => {
    const rawText = csvInput.value.trim();
    if (!rawText) {
      tableContainer.innerHTML = '<div class="empty-state"><p class="cell-error">Please enter CSV data before validating.</p></div>';
      return;
    }

    const lines = rawText.split('\n');
    let htmlTable = `
      <table class="csv-table">
        <thead>
          <tr>
            <th>Row</th>
            <th>Nickname</th>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Address</th>
            <th>Birthday</th>
            <th>Anniversary</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
    `;

    lines.forEach((line, index) => {
      if (!line.trim()) return;

      const columns = parseCsvLine(line);
      const rowNum = index + 1;

      // Clean inputs
      const nickname = columns[0] ? columns[0].trim() : '';
      const firstName = columns[1] ? columns[1].trim() : '';
      const lastName = columns[2] ? columns[2].trim() : '';
      const address = columns[3] ? columns[3].trim() : '';
      const birthday = columns[4] ? columns[4].trim() : '';
      const anniversary = columns[5] ? columns[5].trim() : '';

      // Validation Checks (Simulating Zod schemas)
      const errors = {};

      // 1. Required text fields
      if (!nickname) errors.nickname = 'Required';
      if (!firstName) errors.firstName = 'Required';
      if (!lastName) errors.lastName = 'Required';

      // 2. Address (optional, but if present must parse into City/State/ZIP)
      let addressCell = '<td>—</td>';
      if (address) {
        const parsed = parseAddress(address);
        const addrErrors = {};
        if (!parsed.city) addrErrors.city = 'Missing city';
        if (!/^[A-Z]{2}$/.test(parsed.state)) addrErrors.state = 'Missing state';
        if (!/^\d{5}$/.test(parsed.zip)) addrErrors.zip = 'Missing ZIP';

        if (Object.keys(addrErrors).length) errors.address = true;

        const line = (label, value, error) => {
          if (!value && !error) return '';
          const valueText = value || '—';
          return error
            ? `<span class="addr-line"><strong>${label}:</strong> ${valueText} <span class="cell-error">${error}</span></span>`
            : `<span class="addr-line"><strong>${label}:</strong> ${valueText}</span>`;
        };

        addressCell = `<td><div class="addr-parsed">
          ${line('Street', parsed.street)}
          ${parsed.unit ? line('Unit', parsed.unit) : ''}
          ${line('City', parsed.city, addrErrors.city)}
          ${line('State', parsed.state, addrErrors.state)}
          ${line('ZIP', parsed.zip, addrErrors.zip)}
        </div></td>`;
      }

      // 3. Birthday (optional, mm-dd or mm-dd-yyyy)
      if (birthday && !isValidContactDate(birthday)) {
        errors.birthday = 'Invalid date';
      }

      // 4. Anniversary (optional, mm-dd or mm-dd-yyyy)
      if (anniversary && !isValidContactDate(anniversary)) {
        errors.anniversary = 'Invalid date';
      }

      const isValid = Object.keys(errors).length === 0;
      const rowClass = isValid ? '' : 'class="invalid-row"';

      // Render Cells with inline feedback markup
      const cell = (value, error) =>
        error
          ? `<td>${value} <span class="cell-error">${error}</span></td>`
          : `<td>${value}</td>`;

      const statusMarkup = isValid
        ? '<td><span class="status-badge valid">Passed</span></td>'
        : '<td><span class="status-badge invalid">Failed</span></td>';

      htmlTable += `
        <tr ${rowClass}>
          <td><strong>${rowNum}</strong></td>
          ${cell(nickname, errors.nickname)}
          ${cell(firstName, errors.firstName)}
          ${cell(lastName, errors.lastName)}
          ${addressCell}
          ${cell(birthday || '—', errors.birthday)}
          ${cell(anniversary || '—', errors.anniversary)}
          ${statusMarkup}
        </tr>
      `;
    });

    htmlTable += `
        </tbody>
      </table>
    `;

    tableContainer.innerHTML = htmlTable;
  });

  // Load sample on start
  resetSample();
}



/* ==========================================================================
   7. .NET MAUI Settings Simulator
   ========================================================================== */
function initMauiSettings() {
  const phoneScreen = document.getElementById('simulated-phone-screen');
  const darkToggle = document.getElementById('phone-dark-toggle');
  const textScaleSlider = document.getElementById('phone-text-scale');
  const textScaleVal = document.getElementById('phone-text-scale-val');

  if (!phoneScreen || !darkToggle || !textScaleSlider) return;

  // Initial phone screen theme setup (syncs with checkbox)
  phoneScreen.setAttribute('data-phone-theme', darkToggle.checked ? 'dark' : 'light');

  darkToggle.addEventListener('change', () => {
    phoneScreen.setAttribute('data-phone-theme', darkToggle.checked ? 'dark' : 'light');
  });

  textScaleSlider.addEventListener('input', () => {
    const scale = textScaleSlider.value;
    textScaleVal.textContent = `${scale}%`;
    
    // Scale text elements inside the phone screen specifically
    const settingNames = phoneScreen.querySelectorAll('.setting-name');
    const settingDescs = phoneScreen.querySelectorAll('.setting-desc');
    const phoneHeader = phoneScreen.querySelector('.phone-app-header h5');
    const statusText = phoneScreen.querySelector('.status-title');

    settingNames.forEach(el => el.style.fontSize = `${0.85 * (scale / 100)}rem`);
    settingDescs.forEach(el => el.style.fontSize = `${0.7 * (scale / 100)}rem`);
    if (phoneHeader) phoneHeader.style.fontSize = `${0.95 * (scale / 100)}rem`;
    if (statusText) statusText.style.fontSize = `${0.75 * (scale / 100)}rem`;
  });
}

/* ==========================================================================
   8. Contact Form Handler (Web3Forms Submission)
   ========================================================================== */
function initContactForm() {
  const form = document.getElementById('contact-form');
  const btnSubmit = document.getElementById('btn-submit-contact');
  const feedbackMsg = document.getElementById('form-feedback');

  if (!form || !btnSubmit || !feedbackMsg) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Trigger loading states
    btnSubmit.classList.add('loading');
    btnSubmit.disabled = true;

    // Reset feedback messages
    feedbackMsg.className = 'form-feedback-message';
    feedbackMsg.textContent = '';

    const name = document.getElementById('contact-name').value;

    try {
      const formData = new FormData(form);
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: formData
      });

      const data = await response.json();

      if (response.ok && data.success) {
        feedbackMsg.classList.add('show', 'success');
        feedbackMsg.textContent = `Thanks, ${name}! Your message has been sent successfully.`;
        form.reset();
      } else {
        feedbackMsg.classList.add('show', 'error');
        feedbackMsg.textContent = data.message || 'Something went wrong. Please try again.';
      }
    } catch (err) {
      feedbackMsg.classList.add('show', 'error');
      feedbackMsg.textContent = 'Network error. Please try again later.';
    } finally {
      btnSubmit.classList.remove('loading');
      btnSubmit.disabled = false;
    }
  });
}

/* ==========================================================================
   9. Scroll Animations (Fallback Observer for unsupported browsers)
   ========================================================================== */
function initScrollAnimations() {
  // Check if browser supports CSS Scroll-driven animations natively
  const hasNativeScrollTimeline = CSS.supports('(animation-timeline: view()) and (animation-range: entry)');
  
  if (hasNativeScrollTimeline) {
    // Rely on native CSS which runs off-thread and is highly optimized.
    return;
  }

  // Otherwise, use progressive enhancement fallback with Intersection Observer
  const elementsToAnimate = document.querySelectorAll(
    '.section-header, .skills-category-card, .education-block, .playground-display, .contact-form-card, .contact-text-content, .timeline-content'
  );

  if (!elementsToAnimate.length) return;

  // Add initial state helper class
  elementsToAnimate.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1), transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        // Once visible, stop tracking
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  });

  elementsToAnimate.forEach(el => {
    observer.observe(el);
  });
}
