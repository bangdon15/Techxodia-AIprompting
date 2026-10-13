/**
 * Obelisk by TechXodia — Utility Library: Markdown Parser, Audio Synthesis, Toast System
 * TechXodia Showcase Edition
 */

export class AudioEffects {
  constructor() {
    this.enabled = true;
    this.ctx = null;
  }

  init() {
    if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
  }

  playChime(type = 'receive') {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);

      const now = this.ctx.currentTime;
      if (type === 'receive') {
        // Futuristic double-tone ping (high tech copilot arrival)
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.12); // A5
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
      } else if (type === 'send') {
        // Gentle soft blip
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.08);
        gain.gain.setValueAtTime(0.03, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
        osc.start(now);
        osc.stop(now + 0.18);
      } else if (type === 'success') {
        // Harmonious chord
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.09); // E5
        osc.frequency.setValueAtTime(783.99, now + 0.18); // G5
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);
        osc.start(now);
        osc.stop(now + 0.45);
      }
    } catch (e) {
      // AudioContext policy safety fallback
    }
  }
}

export function showToast(message, type = 'info', duration = 3500) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast-item toast-${type}`;

  const iconMap = {
    info: '💡',
    success: '✅',
    warning: '⚠️',
    error: '❌'
  };

  toast.innerHTML = `
    <span class="toast-icon">${iconMap[type] || '⚡'}</span>
    <span class="toast-message">${escapeHtml(message)}</span>
    <button class="toast-close" aria-label="Close">&times;</button>
  `;

  container.appendChild(toast);

  // Fade in animation
  requestAnimationFrame(() => {
    toast.classList.add('visible');
  });

  const remove = () => {
    toast.classList.remove('visible');
    setTimeout(() => {
      if (toast.parentElement) toast.parentElement.removeChild(toast);
    }, 300);
  };

  toast.querySelector('.toast-close').addEventListener('click', remove);
  setTimeout(remove, duration);
}

export function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Lightweight safe Markdown-to-HTML parser with table, blockquote, code block, and citation tags support
 */
export function renderMarkdown(rawText) {
  if (!rawText) return '';

  let html = rawText;

  // Protect code blocks
  const codeBlocks = [];
  html = html.replace(/```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g, (match, lang, code) => {
    const placeholder = `__CODE_BLOCK_${codeBlocks.length}__`;
    codeBlocks.push({ lang: lang || 'text', code: escapeHtml(code.trim()) });
    return placeholder;
  });

  // Protect inline code
  const inlineCodes = [];
  html = html.replace(/`([^`]+)`/g, (match, code) => {
    const placeholder = `__INLINE_CODE_${inlineCodes.length}__`;
    inlineCodes.push(escapeHtml(code));
    return placeholder;
  });

  // Headers
  html = html.replace(/^### (.*$)/gim, '<h4 class="md-h3">$1</h4>');
  html = html.replace(/^## (.*$)/gim, '<h3 class="md-h2">$1</h3>');
  html = html.replace(/^# (.*$)/gim, '<h2 class="md-h1">$1</h2>');

  // Blockquotes
  html = html.replace(/^\> (.*$)/gim, '<blockquote class="md-quote">$1</blockquote>');

  // Bold & Italic
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');

  // Unordered list items
  html = html.replace(/^\s*[-*]\s+(.*$)/gim, '<li class="md-li">$1</li>');
  html = html.replace(/(<li class="md-li">[\s\S]*?<\/li>)+/g, '<ul class="md-ul">$&</ul>');

  // Tables parsing
  html = html.replace(/((?:\|[^\n]+\|\r?\n)+)/g, (tableText) => {
    const lines = tableText.trim().split('\n');
    if (lines.length < 2) return tableText;

    let tableHtml = '<div class="table-wrapper"><table class="md-table"><thead><tr>';
    const headerCols = lines[0].split('|').slice(1, -1);
    headerCols.forEach(col => {
      tableHtml += `<th>${col.trim()}</th>`;
    });
    tableHtml += '</tr></thead><tbody>';

    // Skip separator line if present (contains ---)
    const rowLines = lines.slice(1).filter(l => !l.includes('---'));
    rowLines.forEach(row => {
      const cols = row.split('|').slice(1, -1);
      tableHtml += '<tr>';
      cols.forEach(col => {
        tableHtml += `<td>${col.trim()}</td>`;
      });
      tableHtml += '</tr>';
    });
    tableHtml += '</tbody></table></div>';
    return tableHtml;
  });

  // Paragraphs & Line Breaks
  html = html.replace(/\n\n+/g, '</p><p class="md-p">');
  html = `<p class="md-p">${html}</p>`;
  html = html.replace(/<p class="md-p"><\/(ul|table|h2|h3|h4|blockquote)>/g, '</$1>');
  html = html.replace(/<(ul|div|h2|h3|h4|blockquote)([^>]*)><p class="md-p">/g, '<$1$2>');

  // Restore Inline Code
  inlineCodes.forEach((code, idx) => {
    html = html.replace(`__INLINE_CODE_${idx}__`, `<code class="md-inline-code">${code}</code>`);
  });

  // Restore Code Blocks with Copy button
  codeBlocks.forEach((block, idx) => {
    const codeBlockHtml = `
      <div class="code-block-container">
        <div class="code-block-header">
          <span class="code-lang">${block.lang}</span>
          <button class="btn-copy-code" data-code="${escapeHtml(block.code)}" title="Copy code">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
            <span>Copy</span>
          </button>
        </div>
        <pre class="md-pre"><code class="md-code language-${block.lang}">${block.code}</code></pre>
      </div>`;
    html = html.replace(`__CODE_BLOCK_${idx}__`, codeBlockHtml);
  });

  // Interactive RAG Citation Tags [Source: filename §section - 98% Match]
  html = html.replace(/\[Source:\s*([^\]]+)\]/gi, (match, citationBody) => {
    return `<button class="rag-citation-pill" data-citation="${escapeHtml(citationBody.trim())}">
      <span class="pill-spark">⚡</span>
      <span class="pill-text">Source: ${escapeHtml(citationBody.trim())}</span>
    </button>`;
  });

  return html;
}

export function copyToClipboard(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(text);
  } else {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      document.body.removeChild(textarea);
      return Promise.resolve();
    } catch (err) {
      document.body.removeChild(textarea);
      return Promise.reject(err);
    }
  }
}
