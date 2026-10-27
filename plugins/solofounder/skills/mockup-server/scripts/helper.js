(function() {
  const WS_URL = 'ws://' + window.location.host;
  let ws = null;
  let eventQueue = [];

  function connect() {
    ws = new WebSocket(WS_URL);

    ws.onopen = () => {
      eventQueue.forEach(e => ws.send(JSON.stringify(e)));
      eventQueue = [];
    };

    ws.onmessage = (msg) => {
      const data = JSON.parse(msg.data);
      if (data.type === 'reload') {
        window.location.reload();
      }
    };

    ws.onclose = () => {
      setTimeout(connect, 1000);
    };
  }

  function sendEvent(event) {
    event.timestamp = Date.now();
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(event));
    } else {
      eventQueue.push(event);
    }
  }

  // Capture clicks on choice elements
  document.addEventListener('click', (e) => {
    const target = e.target.closest('[data-choice]');
    if (!target) return;

    sendEvent({
      type: 'click',
      text: target.textContent.trim(),
      choice: target.dataset.choice,
      id: target.id || null
    });

    // Update indicator bar (defer so toggleSelect runs first)
    setTimeout(() => {
      const indicator = document.getElementById('indicator-text');
      if (!indicator) return;
      const container = target.closest('.options') || target.closest('.cards');
      const selected = container ? container.querySelectorAll('.selected') : [];
      if (selected.length === 0) {
        indicator.textContent = 'Click an option above, then return to the terminal';
      } else if (selected.length === 1) {
        const label = selected[0].querySelector('h3, .content h3, .card-body h3')?.textContent?.trim() || selected[0].dataset.choice;
        indicator.innerHTML = '<span class="selected-text">' + label + ' selected</span> — return to terminal to continue';
      } else {
        indicator.innerHTML = '<span class="selected-text">' + selected.length + ' selected</span> — return to terminal to continue';
      }
    }, 0);
  });

  // Frame UI: selection tracking
  window.selectedChoice = null;

  window.toggleSelect = function(el) {
    const container = el.closest('.options') || el.closest('.cards');
    const multi = container && container.dataset.multiselect !== undefined;
    if (container && !multi) {
      container.querySelectorAll('.option, .card').forEach(o => o.classList.remove('selected'));
    }
    if (multi) {
      el.classList.toggle('selected');
    } else {
      el.classList.add('selected');
    }
    window.selectedChoice = el.dataset.choice;
  };

  // Expose API for explicit use
  window.brainstorm = {
    send: sendEvent,
    choice: (value, metadata = {}) => sendEvent({ type: 'choice', value, ...metadata })
  };

  // ===== Variant Comparison Events =====

  window.voteForVariant = function(variantName, buttonEl) {
    sendEvent({ type: 'vote', variant: variantName });
    if (buttonEl) {
      buttonEl.textContent = 'Voted';
      buttonEl.classList.add('voted');
    }
    // Update indicator
    const indicator = document.getElementById('indicator-text');
    if (indicator) {
      indicator.innerHTML = '<span class="selected-text">Voted for ' + variantName + '</span> — return to terminal to continue';
    }
  };

  window.sendVariantFeedback = function(variantName, inputEl) {
    const text = inputEl.value.trim();
    if (!text) return;
    sendEvent({ type: 'feedback', variant: variantName, text: text });
    inputEl.value = '';
    inputEl.placeholder = 'Feedback sent!';
    setTimeout(() => { inputEl.placeholder = 'Add feedback for this variant...'; }, 2000);
  };

  window.requestMerge = function(variantNames, note) {
    sendEvent({ type: 'merge', from: variantNames, note: note || '' });
    const indicator = document.getElementById('indicator-text');
    if (indicator) {
      indicator.innerHTML = '<span class="selected-text">Merge requested</span> — return to terminal to continue';
    }
  };

  // Expose extended API
  window.brainstorm.vote = (variant) => sendEvent({ type: 'vote', variant });
  window.brainstorm.feedback = (variant, text) => sendEvent({ type: 'feedback', variant, text });
  window.brainstorm.merge = (from, note) => sendEvent({ type: 'merge', from, note: note || '' });

  connect();
})();
