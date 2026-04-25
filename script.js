/* ================================================
   GenderK Online Consent Form — JavaScript
   ================================================ */

document.addEventListener('DOMContentLoaded', () => {
  // Auto-fill today's date
  const parentDateField = document.getElementById('parent-date');
  if (parentDateField && !parentDateField.value) {
    parentDateField.value = new Date().toISOString().split('T')[0];
  }

  // ---- Signature Pad ----
  const canvas = document.getElementById('signature-pad');
  const ctx = canvas.getContext('2d');
  let isDrawing = false;
  let hasSigned = false;
  const container = canvas.parentElement;

  function resizeCanvas() {
    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = 160 * dpr;
    canvas.style.height = '160px';
    ctx.scale(dpr, dpr);
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#1f2937';
  }

  resizeCanvas();
  window.addEventListener('resize', () => {
    // Save current signature on resize
    const tempImg = canvas.toDataURL();
    resizeCanvas();
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0, canvas.width / (window.devicePixelRatio || 1), 160);
    };
    img.src = tempImg;
  });

  function getPos(e) {
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches ? e.touches[0] : e;
    return {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top
    };
  }

  function startDraw(e) {
    e.preventDefault();
    isDrawing = true;
    hasSigned = true;
    container.classList.add('active');
    container.classList.remove('has-error');
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  }

  function draw(e) {
    if (!isDrawing) return;
    e.preventDefault();
    const pos = getPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  }

  function stopDraw() {
    isDrawing = false;
    container.classList.remove('active');
  }

  canvas.addEventListener('mousedown', startDraw);
  canvas.addEventListener('mousemove', draw);
  canvas.addEventListener('mouseup', stopDraw);
  canvas.addEventListener('mouseleave', stopDraw);
  canvas.addEventListener('touchstart', startDraw, { passive: false });
  canvas.addEventListener('touchmove', draw, { passive: false });
  canvas.addEventListener('touchend', stopDraw);

  document.getElementById('clear-signature').addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    hasSigned = false;
  });

  // ---- Validation ----
  function clearErrors() {
    document.querySelectorAll('.has-error').forEach(el => el.classList.remove('has-error'));
  }

  function showError(fieldId, errorId) {
    const field = document.getElementById(fieldId);
    const group = field ? field.closest('.field-group') || field.closest('.consent-checkbox-group') : null;
    if (group) group.classList.add('has-error');
    if (field && field.tagName !== 'INPUT') return;
    if (field) field.classList.add('has-error');
  }

  function validateForm() {
    clearErrors();
    let valid = true;
    let firstError = null;

    // Child name
    const childName = document.getElementById('child-name');
    if (!childName.value.trim()) {
      showError('child-name', 'child-name-error');
      valid = false;
      if (!firstError) firstError = childName;
    }

    // Child DOB
    const childDOB = document.getElementById('child-dob');
    if (!childDOB.value) {
      showError('child-dob', 'child-dob-error');
      valid = false;
      if (!firstError) firstError = childDOB;
    }

    // Child gender
    const childGender = document.getElementById('child-gender');
    if (!childGender.value) {
      showError('child-gender', 'child-gender-error');
      valid = false;
      if (!firstError) firstError = childGender;
    }

    // Parent name
    const parentName = document.getElementById('parent-name');
    if (!parentName.value.trim()) {
      showError('parent-name', 'parent-name-error');
      valid = false;
      if (!firstError) firstError = parentName;
    }

    // Parent date
    const parentDate = document.getElementById('parent-date');
    if (!parentDate.value) {
      showError('parent-date', 'parent-date-error');
      valid = false;
      if (!firstError) firstError = parentDate;
    }

    // Signature
    if (!hasSigned) {
      container.classList.add('has-error');
      const sigGrp = container.closest('.field-group');
      if (sigGrp) sigGrp.classList.add('has-error');
      valid = false;
      if (!firstError) firstError = canvas;
    }

    // Consent checkbox
    const agreeCheckbox = document.getElementById('agree-consent');
    if (!agreeCheckbox.checked) {
      const cbGroup = agreeCheckbox.closest('.consent-checkbox-group');
      if (cbGroup) cbGroup.classList.add('has-error');
      valid = false;
      if (!firstError) firstError = agreeCheckbox;
    }

    if (!valid && firstError) {
      firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    return valid;
  }

  // ---- Configuration ----
  // PASTE YOUR GOOGLE APPS SCRIPT WEB APP URL HERE:
  const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzpbvS4tV9SrEYXX_Q0ARpUN8Fkww9dXhu6EV6sXxV9nzKhvz1rkDSKOTGEwFvcwC_0/exec';

  // ---- Form submission ----
  const form = document.getElementById('consent-form');
  const submitBtn = document.getElementById('submit-btn');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    // Gather data
    const data = {
      childName: document.getElementById('child-name').value.trim(),
      childDOB: document.getElementById('child-dob').value,
      childGender: document.getElementById('child-gender').value,
      parentName: document.getElementById('parent-name').value.trim(),
      parentDate: document.getElementById('parent-date').value,
      signatureData: canvas.toDataURL('image/png'),
      videoConsentPrivate: document.getElementById('video-private').value.trim(),
      videoConsentScientific: document.getElementById('video-scientific').value.trim(),
      videoConsentPublic: document.getElementById('video-public').value.trim(),
      timestamp: new Date().toISOString()
    };

    // Save to localStorage as backup (always)
    try {
      const existingData = JSON.parse(localStorage.getItem('genderk_consents') || '[]');
      existingData.push(data);
      localStorage.setItem('genderk_consents', JSON.stringify(existingData));
    } catch (err) {
      console.warn('Could not save to localStorage:', err);
    }

    // Submit to Google Sheets
    let sheetSuccess = false;
    if (GOOGLE_SCRIPT_URL) {
      // Show loading state
      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <svg class="spinner" width="20" height="20" viewBox="0 0 20 20" fill="none">
          <circle cx="10" cy="10" r="8" stroke="currentColor" stroke-width="2" stroke-dasharray="40" stroke-dashoffset="10" stroke-linecap="round"/>
        </svg>
        Submitting…
      `;

      try {
        // Use text/plain to avoid CORS preflight — Apps Script still receives the JSON body
        const response = await fetch(GOOGLE_SCRIPT_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain' },
          body: JSON.stringify(data)
        });
        sheetSuccess = true;
      } catch (err) {
        console.warn('Could not submit to Google Sheets:', err);
        sheetSuccess = false;
      }

      submitBtn.disabled = false;
      submitBtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M16.667 5L7.5 14.167 3.333 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        Submit Consent
      `;
    }

    // Also download as JSON backup
    downloadJSON(data);

    // Show success
    showSuccess(data, sheetSuccess);
  });

  function downloadJSON(data) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const safeName = data.childName.replace(/[^a-zA-Z0-9]/g, '_');
    a.download = `consent_${safeName}_${data.parentDate}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function showSuccess(data, sheetSuccess) {
    form.hidden = true;
    const success = document.getElementById('success-message');
    success.hidden = false;

    // Build summary
    const videoConsents = [];
    if (data.videoConsentPrivate) videoConsents.push(`Private use (${data.videoConsentPrivate})`);
    if (data.videoConsentScientific) videoConsents.push(`Scientific/educational use (${data.videoConsentScientific})`);
    if (data.videoConsentPublic) videoConsents.push(`Public education/outreach (${data.videoConsentPublic})`);

    const sheetStatus = GOOGLE_SCRIPT_URL
      ? (sheetSuccess
        ? '<p style="color:#22c55e;font-weight:600;">✓ Data saved to Google Sheets</p>'
        : '<p style="color:#ef4444;font-weight:600;">⚠ Could not reach Google Sheets — data saved locally and as JSON download</p>')
      : '<p style="color:#9ca3af;font-style:italic;">Google Sheets not configured — data saved as JSON download only</p>';

    document.getElementById('success-summary').innerHTML = `
      ${sheetStatus}
      <hr style="margin:12px 0;border:0;border-top:1px solid #e5e7eb;">
      <p><strong>Child:</strong> ${escapeHTML(data.childName)}</p>
      <p><strong>Date of Birth:</strong> ${data.childDOB}</p>
      <p><strong>Gender:</strong> ${data.childGender}</p>
      <p><strong>Legal Representative:</strong> ${escapeHTML(data.parentName)}</p>
      <p><strong>Date:</strong> ${data.parentDate}</p>
      ${videoConsents.length > 0
        ? `<p><strong>Video Consent:</strong> ${videoConsents.join('; ')}</p>`
        : '<p><strong>Video Consent:</strong> None specified</p>'
      }
    `;

    success.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ---- Print ----
  document.getElementById('print-btn').addEventListener('click', () => window.print());
  document.getElementById('print-success-btn').addEventListener('click', () => window.print());

  // ---- Clear field errors on input ----
  form.addEventListener('input', (e) => {
    const group = e.target.closest('.field-group') || e.target.closest('.consent-checkbox-group');
    if (group) group.classList.remove('has-error');
    e.target.classList.remove('has-error');
  });

  form.addEventListener('change', (e) => {
    const group = e.target.closest('.field-group') || e.target.closest('.consent-checkbox-group');
    if (group) group.classList.remove('has-error');
    e.target.classList.remove('has-error');
  });
});
