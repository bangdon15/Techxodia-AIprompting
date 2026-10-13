/**
 * Obelisk by TechXodia — Application Controller & Interactive State Coordinator
 * TechXodia Showcase Edition
 */

import { INITIAL_KNOWLEDGE_BASES } from './knowledge-bases.js';
import { RAGEngine } from './rag-engine.js';
import { AutonomousAgent } from './autonomous-agent.js';
import { LiveLLMConnector } from './live-llm.js';
import { AdminStudio } from './studio.js';
import { renderMarkdown, showToast, copyToClipboard, AudioEffects, escapeHtml } from './utils.js';

class NexusApp {
  constructor() {
    this.knowledgeBases = JSON.parse(JSON.stringify(INITIAL_KNOWLEDGE_BASES));
    this.activeKbId = 'saas-cloud';
    this.rag = new RAGEngine(this.knowledgeBases);
    this.agent = new AutonomousAgent(this.rag);
    this.liveLLM = new LiveLLMConnector();
    this.studio = new AdminStudio(this.rag, this.agent, this.liveLLM);
    this.audio = new AudioEffects();
    this.isGenerating = false;
    this.chatHistory = [];

    this.init();
  }

  init() {
    this.bindDOM();
    this.setupEventListeners();
    this.renderActiveKnowledgeBase();
    this.renderQuickPrompts();
    this.renderInitialGreeting();
    this.updateLLMBadge();
  }

  bindDOM() {
    this.dom = {
      // Header
      kbSelect: document.getElementById('kb-select'),
      btnAdminStudio: document.getElementById('btn-admin-studio'),
      btnIngestHeader: document.getElementById('btn-ingest-header'),
      btnSoundToggle: document.getElementById('btn-sound-toggle'),
      llmModeBadge: document.getElementById('llm-mode-badge'),
      agentStatusPing: document.getElementById('agent-status-ping'),

      // Left Panel
      kbTitle: document.getElementById('kb-display-title'),
      kbDesc: document.getElementById('kb-display-desc'),
      kbBadge: document.getElementById('kb-display-badge'),
      statDocsCount: document.getElementById('stat-docs-count'),
      statVectorsCount: document.getElementById('stat-vectors-count'),
      statDimensions: document.getElementById('stat-dimensions'),
      docSearchInput: document.getElementById('doc-search-input'),
      docListContainer: document.getElementById('doc-list-container'),
      btnIngestTrigger: document.getElementById('btn-ingest-trigger'),

      // Right Panel
      chatMessages: document.getElementById('chat-messages'),
      quickPromptsContainer: document.getElementById('quick-prompts-container'),
      chatInput: document.getElementById('chat-input'),
      btnSend: document.getElementById('btn-send'),
      btnClearChat: document.getElementById('btn-clear-chat'),
      btnExportChat: document.getElementById('btn-export-chat'),
      charCounter: document.getElementById('char-counter'),

      // Modals
      ingestModal: document.getElementById('ingest-modal'),
      btnModalClose: document.getElementById('btn-modal-close'),
      btnCancelIngest: document.getElementById('btn-cancel-ingest'),
      formIngest: document.getElementById('form-ingest'),
      ingestProgressBar: document.getElementById('ingest-progress-bar'),
      ingestStatusText: document.getElementById('ingest-status-text'),
      ingestProgressContainer: document.getElementById('ingest-progress-container'),
      btnStartIngest: document.getElementById('btn-start-ingest'),

      // Chunk Inspector Modal
      chunkModal: document.getElementById('chunk-modal'),
      btnChunkModalClose: document.getElementById('btn-chunk-modal-close'),
      chunkModalTitle: document.getElementById('chunk-modal-title'),
      chunkModalBody: document.getElementById('chunk-modal-body'),

      // Admin Studio Modal
      studioModal: document.getElementById('studio-modal'),
      btnStudioModalClose: document.getElementById('btn-studio-modal-close'),
      tabButtons: document.querySelectorAll('.studio-tab-btn'),
      tabPanes: document.querySelectorAll('.studio-tab-pane'),

      // API Key / LLM Form
      providerRadios: document.querySelectorAll('input[name="llm-provider"]'),
      apiKeyInput: document.getElementById('llm-api-key'),
      modelSelect: document.getElementById('llm-model-select'),
      temperatureSlider: document.getElementById('llm-temperature'),
      tempValueDisplay: document.getElementById('temp-value-display'),
      btnSaveLLMConfig: document.getElementById('btn-save-llm-config'),
      btnTestLLMConn: document.getElementById('btn-test-llm-conn'),
      llmTestResult: document.getElementById('llm-test-result')
    };
  }

  setupEventListeners() {
    // KB Selector Change
    this.dom.kbSelect?.addEventListener('change', (e) => {
      this.switchKnowledgeBase(e.target.value);
    });

    // Document Search Filtering
    this.dom.docSearchInput?.addEventListener('input', (e) => {
      this.filterDocuments(e.target.value);
    });

    // Chat Message Submission
    this.dom.btnSend?.addEventListener('click', () => this.handleSendMessage());
    this.dom.chatInput?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.handleSendMessage();
      }
    });

    // Chat Input resizing & char counter
    this.dom.chatInput?.addEventListener('input', () => {
      this.dom.chatInput.style.height = 'auto';
      this.dom.chatInput.style.height = Math.min(this.dom.chatInput.scrollHeight, 140) + 'px';
      if (this.dom.charCounter) {
        this.dom.charCounter.textContent = `${this.dom.chatInput.value.length}/1000`;
      }
    });

    // Clear & Export Chat
    this.dom.btnClearChat?.addEventListener('click', () => this.clearChat());
    this.dom.btnExportChat?.addEventListener('click', () => this.exportChat());

    // Sound Toggle
    this.dom.btnSoundToggle?.addEventListener('click', () => {
      this.audio.enabled = !this.audio.enabled;
      this.dom.btnSoundToggle.classList.toggle('active', this.audio.enabled);
      showToast(this.audio.enabled ? 'Audio Chimes Enabled' : 'Audio Chimes Muted', 'info');
    });

    // Ingest Modal Open & Close
    this.dom.btnIngestHeader?.addEventListener('click', () => this.openIngestModal());
    this.dom.btnIngestTrigger?.addEventListener('click', () => this.openIngestModal());
    this.dom.btnModalClose?.addEventListener('click', () => this.closeIngestModal());
    this.dom.btnCancelIngest?.addEventListener('click', () => this.closeIngestModal());
    this.dom.ingestModal?.addEventListener('click', (e) => {
      if (e.target === this.dom.ingestModal) this.closeIngestModal();
    });

    // Form Ingest Submission
    this.dom.formIngest?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.executeIngestionPipeline();
    });

    // Chunk Modal Close
    this.dom.btnChunkModalClose?.addEventListener('click', () => this.closeChunkModal());
    this.dom.chunkModal?.addEventListener('click', (e) => {
      if (e.target === this.dom.chunkModal) this.closeChunkModal();
    });

    // Admin Studio Modal Open & Close
    this.dom.btnAdminStudio?.addEventListener('click', () => this.openAdminStudio());
    this.dom.btnStudioModalClose?.addEventListener('click', () => this.closeAdminStudio());
    this.dom.studioModal?.addEventListener('click', (e) => {
      if (e.target === this.dom.studioModal) this.closeAdminStudio();
    });

    // Admin Studio Tabs
    this.dom.tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetTab = btn.getAttribute('data-tab');
        this.switchStudioTab(targetTab);
      });
    });

    // LLM Temperature Slider
    this.dom.temperatureSlider?.addEventListener('input', (e) => {
      if (this.dom.tempValueDisplay) {
        this.dom.tempValueDisplay.textContent = e.target.value;
      }
    });

    // LLM Provider Radio Change
    this.dom.providerRadios?.forEach(radio => {
      radio.addEventListener('change', (e) => {
        this.updateLLMFormState(e.target.value);
      });
    });

    // Save & Test LLM Config
    this.dom.btnSaveLLMConfig?.addEventListener('click', () => this.saveLLMSettings());
    this.dom.btnTestLLMConn?.addEventListener('click', () => this.testLLMConnection());

    // Global Delegated Click Handler (Citations, Code Copy, Lead Submit)
    document.addEventListener('click', (e) => {
      // Citation pill click
      const citationBtn = e.target.closest('.rag-citation-pill');
      if (citationBtn) {
        const citationInfo = citationBtn.getAttribute('data-citation');
        this.handleCitationClick(citationInfo);
        return;
      }

      // Copy code block button
      const copyBtn = e.target.closest('.btn-copy-code');
      if (copyBtn) {
        const codeText = copyBtn.getAttribute('data-code');
        copyToClipboard(codeText).then(() => {
          showToast('Code copied to clipboard!', 'success');
          copyBtn.innerHTML = `<span>✓ Copied</span>`;
          setTimeout(() => {
            copyBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg><span>Copy</span>`;
          }, 2000);
        });
        return;
      }

      // Quick prompt pill click
      const promptPill = e.target.closest('.prompt-pill');
      if (promptPill) {
        const text = promptPill.getAttribute('data-prompt');
        if (text && !this.isGenerating) {
          this.dom.chatInput.value = text;
          this.handleSendMessage();
        }
        return;
      }

      // Document list item click to inspect chunks
      const docItem = e.target.closest('.doc-item-card');
      if (docItem) {
        const docId = docItem.getAttribute('data-doc-id');
        this.openDocumentChunkInspector(docId);
        return;
      }

      // Lead Card Submit
      const leadSubmitBtn = e.target.closest('.btn-submit-lead-card');
      if (leadSubmitBtn) {
        const card = leadSubmitBtn.closest('.lead-capture-card');
        if (card) this.handleLeadCardSubmit(card);
        return;
      }

      // Thumbs Up / Down
      const feedbackBtn = e.target.closest('.btn-feedback');
      if (feedbackBtn) {
        feedbackBtn.classList.toggle('active');
        showToast('Thank you! Feedback logged to Grounding Studio.', 'info');
        return;
      }

      // Copy response text
      const copyMsgBtn = e.target.closest('.btn-copy-msg');
      if (copyMsgBtn) {
        const msgBubble = copyMsgBtn.closest('.agent-bubble-content');
        if (msgBubble) {
          copyToClipboard(msgBubble.innerText).then(() => {
            showToast('Response copied to clipboard', 'success');
          });
        }
        return;
      }
    });
  }

  /**
   * Switch Active Knowledge Base
   */
  switchKnowledgeBase(kbId) {
    if (!this.knowledgeBases[kbId]) return;
    this.activeKbId = kbId;
    this.dom.kbSelect.value = kbId;

    this.renderActiveKnowledgeBase();
    this.renderQuickPrompts();

    // Add notification bubble to chat
    const kb = this.knowledgeBases[kbId];
    this.appendSystemNotice(`Switched active context to **${kb.name}** (${kb.vectorCount.toLocaleString()} indexed vectors).`);
    showToast(`Active KB: ${kb.name}`, 'info');
  }

  /**
   * Render Left Panel Knowledge Base Info and Document List
   */
  renderActiveKnowledgeBase() {
    const kb = this.knowledgeBases[this.activeKbId];
    if (!kb) return;

    if (this.dom.kbTitle) this.dom.kbTitle.textContent = kb.name;
    if (this.dom.kbDesc) this.dom.kbDesc.textContent = kb.description;
    if (this.dom.kbBadge) this.dom.kbBadge.textContent = kb.badge;

    if (this.dom.statDocsCount) this.dom.statDocsCount.textContent = kb.documents.length;
    if (this.dom.statVectorsCount) this.dom.statVectorsCount.textContent = kb.vectorCount.toLocaleString();
    if (this.dom.statDimensions) this.dom.statDimensions.textContent = `${kb.dimensions}-dim`;

    this.renderDocumentList(kb.documents);
  }

  /**
   * Render Document List in Left Panel
   */
  renderDocumentList(documents) {
    if (!this.dom.docListContainer) return;

    if (!documents || documents.length === 0) {
      this.dom.docListContainer.innerHTML = `
        <div class="empty-docs-state">
          <p class="text-slate-400 text-xs">No documents match search.</p>
        </div>`;
      return;
    }

    const fileIconMap = {
      md: '<span class="icon-file icon-md">MD</span>',
      pdf: '<span class="icon-file icon-pdf">PDF</span>',
      docx: '<span class="icon-file icon-docx">DOC</span>',
      json: '<span class="icon-file icon-json">JSON</span>'
    };

    this.dom.docListContainer.innerHTML = documents.map(doc => {
      const icon = fileIconMap[doc.type] || '<span class="icon-file">TXT</span>';
      const chunkCount = doc.chunks?.length || 1;

      return `
        <div class="doc-item-card" data-doc-id="${doc.id}" title="Click to inspect vector chunks">
          <div class="doc-item-left">
            ${icon}
            <div class="doc-item-info">
              <span class="doc-item-name">${escapeHtml(doc.fileName)}</span>
              <span class="doc-item-meta">${escapeHtml(doc.category)} • ${doc.size}</span>
            </div>
          </div>
          <div class="doc-item-right">
            <span class="doc-chunk-pill">${chunkCount} ${chunkCount === 1 ? 'chunk' : 'chunks'}</span>
            <svg class="doc-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </div>
        </div>
      `;
    }).join('');
  }

  filterDocuments(query) {
    const kb = this.knowledgeBases[this.activeKbId];
    if (!kb) return;

    const q = query.toLowerCase().trim();
    if (!q) {
      this.renderDocumentList(kb.documents);
      return;
    }

    const filtered = kb.documents.filter(doc =>
      doc.fileName.toLowerCase().includes(q) ||
      doc.title.toLowerCase().includes(q) ||
      doc.category.toLowerCase().includes(q) ||
      doc.chunks.some(c => c.text.toLowerCase().includes(q))
    );

    this.renderDocumentList(filtered);
  }

  /**
   * Render Quick Prompts based on Active KB
   */
  renderQuickPrompts() {
    if (!this.dom.quickPromptsContainer) return;
    const kb = this.knowledgeBases[this.activeKbId];
    const prompts = kb?.defaultPrompts || [];

    this.dom.quickPromptsContainer.innerHTML = prompts.map(p => `
      <button class="prompt-pill" data-prompt="${escapeHtml(p)}">
        <span class="prompt-spark">✦</span>
        <span>${escapeHtml(p)}</span>
      </button>
    `).join('');
  }

  renderInitialGreeting() {
    const kb = this.knowledgeBases[this.activeKbId];
    const initialText = `### ⟡ Welcome to Obelisk by TechXodia\n\n` +
      `**All your knowledge, assembled.**\n\n` +
      `I am your enterprise autonomous knowledge copilot grounded in **${kb.name}**.\n\n` +
      `You can ask me technical integration questions, verify architecture SLAs, calculate pricing deltas, or test autonomous agent capabilities.\n\n` +
      `*Try clicking any quick prompt below or type your inquiry.*`;

    this.appendAgentMessage({
      text: initialText,
      grounding: { percentage: 99.8, label: 'Grounded & Ready', colorClass: 'confidence-high' },
      tools: [],
      citations: [],
      latencyMs: 18,
      skipTyping: true
    });
  }

  /**
   * Send User Message & Trigger Autonomous Copilot Pipeline
   */
  async handleSendMessage() {
    if (this.isGenerating) return;

    const rawInput = this.dom.chatInput.value.trim();
    if (!rawInput) return;

    // Reset input
    this.dom.chatInput.value = '';
    this.dom.chatInput.style.height = 'auto';
    if (this.dom.charCounter) this.dom.charCounter.textContent = '0/1000';

    this.isGenerating = true;
    this.audio.playChime('send');

    // Append User Message Bubble
    this.appendUserMessage(rawInput);
    this.scrollToBottom();

    // Check Live LLM mode vs Simulation
    if (this.liveLLM.isLiveMode()) {
      await this.handleLiveLLMFlow(rawInput);
    } else {
      await this.handleSimulatedRAGFlow(rawInput);
    }

    this.isGenerating = false;
  }

  /**
   * Simulated Autonomous RAG Copilot Workflow
   */
  async handleSimulatedRAGFlow(query) {
    // 1. Classify Intent
    const intent = this.agent.classifyIntent(query);

    // 2. Plan Autonomous Tool Executions
    const plannedTools = this.agent.planAutonomousTools(intent, query, this.activeKbId);

    // 3. Create Agent Message Container in "Thinking" State
    const msgElement = this.createAgentMessageShell();
    this.dom.chatMessages.appendChild(msgElement);
    this.scrollToBottom();

    const toolsContainer = msgElement.querySelector('.agent-tools-container');
    const bubbleContent = msgElement.querySelector('.agent-bubble-content');
    const metaBar = msgElement.querySelector('.agent-meta-bar');

    // 4. Sequentially render tool calls with animation
    for (let i = 0; i < plannedTools.length; i++) {
      const tool = plannedTools[i];
      const toolPill = document.createElement('div');
      toolPill.className = 'tool-exec-pill active-executing';
      toolPill.innerHTML = `
        <span class="tool-spinner"></span>
        <span class="tool-icon">${tool.icon}</span>
        <span class="tool-name">${tool.name}</span>
        <span class="tool-label">${tool.label}</span>
      `;
      toolsContainer.appendChild(toolPill);
      this.scrollToBottom();

      await new Promise(r => setTimeout(r, 260));

      // Mark tool completed
      toolPill.classList.remove('active-executing');
      toolPill.classList.add('completed');
      toolPill.querySelector('.tool-spinner').remove();
      const checkBadge = document.createElement('span');
      checkBadge.className = 'tool-check';
      checkBadge.textContent = '✓ ' + tool.latency;
      toolPill.appendChild(checkBadge);
    }

    // 5. Retrieve RAG Chunks
    const retrievedChunks = this.rag.retrieveTopChunks(this.activeKbId, query, 3);

    // 6. Synthesize Response
    const synthesis = this.agent.synthesizeResponse(query, this.activeKbId, retrievedChunks, intent);

    this.audio.playChime('receive');

    // 7. Stream text response token-by-token
    await this.streamResponseText(bubbleContent, synthesis.text);

    // 8. If Human Handoff is required, inject interactive Lead Capture Card
    if (synthesis.requiresHandoffCard) {
      const leadCard = this.createLeadCaptureCard(query);
      bubbleContent.appendChild(leadCard);
      this.scrollToBottom();
    }

    // 9. Update Metadata Bar (Confidence Pill, Citations, Latency)
    this.renderResponseMetaBar(metaBar, synthesis);
    this.scrollToBottom();
  }

  /**
   * Live LLM Flow (OpenAI / Gemini)
   */
  async handleLiveLLMFlow(query) {
    const msgElement = this.createAgentMessageShell();
    this.dom.chatMessages.appendChild(msgElement);
    this.scrollToBottom();

    const toolsContainer = msgElement.querySelector('.agent-tools-container');
    const bubbleContent = msgElement.querySelector('.agent-bubble-content');
    const metaBar = msgElement.querySelector('.agent-meta-bar');

    // Tool call for retrieval
    const toolPill = document.createElement('div');
    toolPill.className = 'tool-exec-pill completed';
    toolPill.innerHTML = `
      <span class="tool-icon">🧠</span>
      <span class="tool-name">live_llm_${this.liveLLM.config.provider}</span>
      <span class="tool-label">Streaming live from ${this.liveLLM.config.model}...</span>
      <span class="tool-check">✓ Live</span>
    `;
    toolsContainer.appendChild(toolPill);

    const activeKb = this.knowledgeBases[this.activeKbId];
    const retrievedChunks = this.rag.retrieveTopChunks(this.activeKbId, query, 3);

    bubbleContent.innerHTML = `<span class="streaming-cursor">|</span>`;

    try {
      let accumulatedText = '';
      await this.liveLLM.generateLiveResponse(query, retrievedChunks, activeKb.name, (delta, full) => {
        accumulatedText = full;
        bubbleContent.innerHTML = renderMarkdown(full) + '<span class="streaming-cursor">|</span>';
        this.scrollToBottom();
      });

      bubbleContent.innerHTML = renderMarkdown(accumulatedText);
      this.audio.playChime('receive');

      const grounding = this.rag.calculateGroundingConfidence(retrievedChunks);
      this.renderResponseMetaBar(metaBar, {
        grounding,
        citations: retrievedChunks,
        tokensUsed: Math.round(accumulatedText.split(' ').length * 1.3),
        latencyMs: 320
      });

    } catch (err) {
      bubbleContent.innerHTML = `
        <div class="error-notice">
          <strong>⚠️ Live LLM Error:</strong> ${escapeHtml(err.message)}<br/>
          <small>Switching to Smart Simulation mode in Admin Studio.</small>
        </div>`;
      showToast(err.message, 'error', 5000);
    }
  }

  /**
   * Helper: Create empty shell for Agent Message
   */
  createAgentMessageShell() {
    const msgDiv = document.createElement('div');
    msgDiv.className = 'chat-message agent-message';
    msgDiv.innerHTML = `
      <div class="msg-avatar-col">
        <div class="agent-avatar">
          <span class="avatar-glow"></span>
          <img src="assets/obelisk-logo.png" alt="Obelisk Copilot" class="avatar-logo-img" />
        </div>
      </div>
      <div class="msg-content-col">
        <div class="agent-sender-header">
          <span class="agent-name">Obelisk Copilot</span>
          <span class="agent-tag">Autonomous Agent</span>
          <span class="agent-time">Just now</span>
        </div>
        <div class="agent-tools-container"></div>
        <div class="agent-bubble-content">
          <div class="typing-indicator">
            <span></span><span></span><span></span>
          </div>
        </div>
        <div class="agent-meta-bar"></div>
      </div>
    `;
    return msgDiv;
  }

  /**
   * Stream Response Text with realistic typing cadence
   */
  async streamResponseText(container, fullMarkdownText) {
    container.innerHTML = '';
    const words = fullMarkdownText.split(' ');
    let currentText = '';

    for (let i = 0; i < words.length; i++) {
      currentText += (i === 0 ? '' : ' ') + words[i];

      // Update with markdown parser and blinking cursor
      container.innerHTML = renderMarkdown(currentText) + '<span class="streaming-cursor">|</span>';
      this.scrollToBottom();

      // Realistic typing cadence (faster for punctuation, steady token delay)
      const delay = Math.random() < 0.1 ? 28 : 12;
      await new Promise(r => setTimeout(r, delay));
    }

    // Final clean render without cursor
    container.innerHTML = renderMarkdown(fullMarkdownText);
  }

  /**
   * Render Metadata Bar (Confidence Pill, Citations count, Copy/Feedback actions)
   */
  renderResponseMetaBar(container, { grounding, citations, tokensUsed, latencyMs }) {
    if (!container) return;

    const confClass = grounding.colorClass || 'confidence-high';
    const confScore = grounding.percentage || 98.4;
    const citationCount = citations?.length || 0;

    container.innerHTML = `
      <div class="meta-left">
        <div class="confidence-pill ${confClass}" title="Grounding verification score">
          <span class="conf-dot"></span>
          <span>${confScore}% Grounded</span>
        </div>
        <span class="meta-stat-divider">•</span>
        <span class="meta-latency">${latencyMs || 120}ms</span>
        <span class="meta-stat-divider">•</span>
        <span class="meta-tokens">${tokensUsed || 110} tokens</span>
        ${citationCount > 0 ? `
          <span class="meta-stat-divider">•</span>
          <span class="meta-citations-count">📚 ${citationCount} ${citationCount === 1 ? 'citation' : 'citations'}</span>
        ` : ''}
      </div>
      <div class="meta-actions">
        <button class="btn-msg-action btn-copy-msg" title="Copy response">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
        </button>
        <button class="btn-msg-action btn-feedback" title="Helpful answer">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>
        </button>
      </div>
    `;
  }

  /**
   * Create Interactive Lead Capture Card for Human Handoff
   */
  createLeadCaptureCard(initialIntent) {
    const card = document.createElement('div');
    card.className = 'lead-capture-card';
    card.innerHTML = `
      <div class="lead-card-header">
        <div class="lead-card-badge">
          <span class="badge-dot-live"></span>
          <span>Priority Human Specialist Dispatch</span>
        </div>
        <span class="lead-card-sla">⚡ < 15 Min SLA</span>
      </div>
      <h4 class="lead-card-title">Connect with TechXodia Enterprise Team</h4>
      <p class="lead-card-desc">Our Solutions Architects can review your volume requirements, custom SLA parameters, and dedicated VPC infrastructure.</p>
      
      <form class="lead-card-form" onsubmit="return false;">
        <div class="lead-form-grid">
          <div class="lead-form-field">
            <label>Full Name</label>
            <input type="text" class="input-lead-name" placeholder="e.g. Alex Rivera" required value="Alex Rivera" />
          </div>
          <div class="lead-form-field">
            <label>Work Email</label>
            <input type="email" class="input-lead-email" placeholder="name@company.com" required value="alex.r@enterprise.io" />
          </div>
        </div>
        <div class="lead-form-grid">
          <div class="lead-form-field">
            <label>Organization / Team Size</label>
            <input type="text" class="input-lead-org" placeholder="Company (e.g. 100+ seats)" value="Acme Enterprise (250 seats)" />
          </div>
          <div class="lead-form-field">
            <label>Priority Tier</label>
            <select class="input-lead-priority">
              <option value="Urgent">🔥 Urgent (Active Procurement)</option>
              <option value="High" selected>⚡ High (Technical Evaluation)</option>
              <option value="Standard">📋 Standard (General Discovery)</option>
            </select>
          </div>
        </div>
        <div class="lead-form-field">
          <label>Inquiry Summary</label>
          <input type="text" class="input-lead-intent" value="${escapeHtml(initialIntent)}" />
        </div>
        <div class="lead-form-footer">
          <button type="button" class="btn-primary btn-submit-lead-card">
            <span>Dispatch Ticket to Specialist</span>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
          </button>
        </div>
      </form>
    `;
    return card;
  }

  /**
   * Handle Lead Card Submission
   */
  handleLeadCardSubmit(cardElement) {
    const nameInput = cardElement.querySelector('.input-lead-name');
    const emailInput = cardElement.querySelector('.input-lead-email');
    const orgInput = cardElement.querySelector('.input-lead-org');
    const prioritySelect = cardElement.querySelector('.input-lead-priority');
    const intentInput = cardElement.querySelector('.input-lead-intent');

    if (!nameInput.value || !emailInput.value) {
      showToast('Please enter both name and email', 'warning');
      return;
    }

    const ticket = this.agent.submitLeadTicket({
      name: nameInput.value,
      email: emailInput.value,
      company: orgInput.value,
      priority: prioritySelect.value,
      intent: intentInput.value
    });

    this.audio.playChime('success');

    // Replace card content with Success Ticket Confirmation
    cardElement.innerHTML = `
      <div class="lead-success-state">
        <div class="lead-success-icon">✓</div>
        <div class="lead-success-info">
          <h4 class="lead-success-title">Lead Ticket Dispatched: #${ticket.id}</h4>
          <p class="lead-success-text">Assigned to **TechXodia Senior Solutions Architect**. A calendar invite and architecture overview have been queued for <strong>${escapeHtml(ticket.email)}</strong>.</p>
          <div class="lead-ticket-meta-pills">
            <span class="meta-pill">Priority: ${ticket.priority}</span>
            <span class="meta-pill">Guaranteed SLA: < 15 mins</span>
            <span class="meta-pill">Ref: #${ticket.id}</span>
          </div>
        </div>
      </div>
    `;

    showToast(`Ticket #${ticket.id} dispatched to CRM queue!`, 'success');

    // Update Admin Studio leads count
    this.studio.renderLeadsList('studio-leads-container');
  }

  /**
   * Append User Message Bubble
   */
  appendUserMessage(text) {
    const msgDiv = document.createElement('div');
    msgDiv.className = 'chat-message user-message';
    msgDiv.innerHTML = `
      <div class="msg-content-col">
        <div class="user-sender-header">
          <span class="user-name">You</span>
          <span class="user-time">Just now</span>
        </div>
        <div class="user-bubble-content">
          ${escapeHtml(text)}
        </div>
      </div>
      <div class="msg-avatar-col">
        <div class="user-avatar">
          <span>U</span>
        </div>
      </div>
    `;
    this.dom.chatMessages.appendChild(msgDiv);
    this.chatHistory.push({ role: 'user', content: text });
  }

  appendAgentMessage({ text, grounding, tools = [], citations = [], latencyMs = 120, skipTyping = false }) {
    const msgDiv = this.createAgentMessageShell();
    this.dom.chatMessages.appendChild(msgDiv);

    const bubbleContent = msgDiv.querySelector('.agent-bubble-content');
    const metaBar = msgElement => msgElement.querySelector('.agent-meta-bar');

    bubbleContent.innerHTML = renderMarkdown(text);
    this.renderResponseMetaBar(msgDiv.querySelector('.agent-meta-bar'), {
      grounding,
      citations,
      tokensUsed: Math.round(text.split(' ').length * 1.3),
      latencyMs
    });

    this.chatHistory.push({ role: 'assistant', content: text });
    this.scrollToBottom();
  }

  appendSystemNotice(text) {
    const noticeDiv = document.createElement('div');
    noticeDiv.className = 'chat-system-notice';
    noticeDiv.innerHTML = `<span class="notice-icon">ℹ️</span><span>${renderMarkdown(text)}</span>`;
    this.dom.chatMessages.appendChild(noticeDiv);
    this.scrollToBottom();
  }

  scrollToBottom() {
    if (this.dom.chatMessages) {
      this.dom.chatMessages.scrollTop = this.dom.chatMessages.scrollHeight;
    }
  }

  clearChat() {
    if (confirm('Clear chat history?')) {
      this.dom.chatMessages.innerHTML = '';
      this.chatHistory = [];
      this.renderInitialGreeting();
      showToast('Chat history cleared', 'info');
    }
  }

  exportChat() {
    if (this.chatHistory.length === 0) {
      showToast('No chat messages to export', 'warning');
      return;
    }

    const exportData = {
      app: 'Obelisk by TechXodia',
      knowledgeBase: this.knowledgeBases[this.activeKbId].name,
      exportedAt: new Date().toISOString(),
      messages: this.chatHistory
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `obelisk_chat_${this.activeKbId}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Chat exported as JSON', 'success');
  }

  /**
   * Handle Click on Citation Pill -> Open Chunk Inspector
   */
  handleCitationClick(citationInfo) {
    // citationInfo format: "filename §section - 98% Match"
    const kb = this.knowledgeBases[this.activeKbId];
    if (!kb) return;

    // Find document
    let matchedChunk = null;
    let matchedDoc = null;

    for (const doc of kb.documents) {
      for (const chunk of doc.chunks) {
        if (citationInfo.includes(doc.fileName) || citationInfo.includes(chunk.section)) {
          matchedChunk = chunk;
          matchedDoc = doc;
          break;
        }
      }
      if (matchedChunk) break;
    }

    if (matchedChunk && matchedDoc) {
      this.openChunkModalWithDetail(matchedDoc, matchedChunk, citationInfo);
    } else {
      showToast(`Citation Source: ${citationInfo}`, 'info');
    }
  }

  /**
   * Chunk Inspector Modal
   */
  openChunkModalWithDetail(doc, chunk, citationMeta) {
    if (!this.dom.chunkModal) return;

    this.dom.chunkModalTitle.textContent = `${doc.fileName} — Vector Chunk Inspector`;
    this.dom.chunkModalBody.innerHTML = `
      <div class="chunk-inspect-meta">
        <span class="meta-tag">Section: ${escapeHtml(chunk.section)}</span>
        <span class="meta-tag">Vector ID: <code>${chunk.vectorId || 'vec_001'}</code></span>
        <span class="meta-tag">Tokens: ${chunk.tokens || 95}</span>
        <span class="meta-tag tag-source">${escapeHtml(citationMeta || 'RAG Grounded')}</span>
      </div>
      <div class="chunk-inspect-box">
        <div class="chunk-inspect-label">Raw Indexed Chunk Text:</div>
        <p class="chunk-inspect-text">${escapeHtml(chunk.text)}</p>
      </div>
      <div class="chunk-keywords-row">
        <span class="keywords-label">Indexed Keywords:</span>
        ${(chunk.keywords || []).map(k => `<span class="keyword-pill">${escapeHtml(k)}</span>`).join('')}
      </div>
    `;

    this.dom.chunkModal.classList.add('active');
  }

  openDocumentChunkInspector(docId) {
    const kb = this.knowledgeBases[this.activeKbId];
    if (!kb) return;

    const doc = kb.documents.find(d => d.id === docId);
    if (!doc) return;

    this.dom.chunkModalTitle.textContent = `${doc.fileName} — (${doc.chunks.length} Chunks)`;
    this.dom.chunkModalBody.innerHTML = `
      <div class="doc-inspect-header">
        <h4>${escapeHtml(doc.title)}</h4>
        <span class="doc-meta-badge">${escapeHtml(doc.category)} • ${doc.size}</span>
      </div>
      <div class="doc-chunks-list">
        ${doc.chunks.map((chunk, idx) => `
          <div class="chunk-card-item">
            <div class="chunk-card-top">
              <span class="chunk-section-name">${escapeHtml(chunk.section)}</span>
              <span class="chunk-id-badge">${chunk.vectorId || `vec_${idx}`} • ${chunk.tokens} tokens</span>
            </div>
            <p class="chunk-card-text">${escapeHtml(chunk.text)}</p>
            <div class="chunk-keywords-row">
              ${(chunk.keywords || []).map(k => `<span class="keyword-pill">${escapeHtml(k)}</span>`).join('')}
            </div>
          </div>
        `).join('')}
      </div>
    `;

    this.dom.chunkModal.classList.add('active');
  }

  closeChunkModal() {
    this.dom.chunkModal?.classList.remove('active');
  }

  /**
   * Ingest Knowledge Modal Actions
   */
  openIngestModal() {
    if (!this.dom.ingestModal) return;
    this.dom.ingestProgressContainer.style.display = 'none';
    this.dom.btnStartIngest.disabled = false;
    this.dom.ingestModal.classList.add('active');
  }

  closeIngestModal() {
    this.dom.ingestModal?.classList.remove('active');
  }

  async executeIngestionPipeline() {
    const title = document.getElementById('ingest-title').value.trim();
    const fileName = document.getElementById('ingest-filename').value.trim();
    const category = document.getElementById('ingest-category').value.trim();
    const content = document.getElementById('ingest-content').value.trim();

    if (!title || !content) {
      showToast('Please provide a document title and text content.', 'warning');
      return;
    }

    this.dom.btnStartIngest.disabled = true;
    this.dom.ingestProgressContainer.style.display = 'block';

    const steps = [
      { progress: 20, text: 'Extracting text & sanitizing markdown tokens...' },
      { progress: 45, text: 'Executing recursive character chunking (512 token windows, 64 overlap)...' },
      { progress: 75, text: 'Generating 1536-dim dense vector embeddings via text-embedding-3-small...' },
      { progress: 95, text: 'Upserting vectors into Pinecone HNSW vector memory index...' },
      { progress: 100, text: 'Ingestion complete! Vectors active & queryable.' }
    ];

    for (const step of steps) {
      this.dom.ingestProgressBar.style.width = `${step.progress}%`;
      this.dom.ingestStatusText.textContent = step.text;
      await new Promise(r => setTimeout(r, 450));
    }

    const result = this.rag.ingestDocument(this.activeKbId, {
      title,
      fileName,
      category,
      type: fileName.endsWith('.pdf') ? 'pdf' : (fileName.endsWith('.json') ? 'json' : 'md'),
      content
    });

    this.audio.playChime('success');
    showToast(`Successfully indexed "${result.document.fileName}" (${result.chunksAdded} vector chunks added)!`, 'success');

    this.renderActiveKnowledgeBase();
    this.closeIngestModal();

    // Reset form
    this.dom.formIngest.reset();
  }

  /**
   * Admin Studio Modal Actions
   */
  openAdminStudio() {
    if (!this.dom.studioModal) return;
    this.dom.studioModal.classList.add('active');

    // Render charts & leads
    this.studio.renderTrafficChart('studio-chart-traffic');
    this.studio.renderIntentBreakdown('studio-intent-breakdown');
    this.studio.renderLeadsList('studio-leads-container');

    // Populate current LLM settings
    const config = this.liveLLM.config;
    const radio = document.querySelector(`input[name="llm-provider"][value="${config.provider}"]`);
    if (radio) radio.checked = true;

    if (this.dom.apiKeyInput) this.dom.apiKeyInput.value = config.apiKey || '';
    if (this.dom.modelSelect) this.dom.modelSelect.value = config.model || 'gpt-4o-mini';
    if (this.dom.temperatureSlider) this.dom.temperatureSlider.value = config.temperature ?? 0.3;
    if (this.dom.tempValueDisplay) this.dom.tempValueDisplay.textContent = config.temperature ?? 0.3;

    this.updateLLMFormState(config.provider);
  }

  closeAdminStudio() {
    this.dom.studioModal?.classList.remove('active');
  }

  switchStudioTab(tabId) {
    this.dom.tabButtons.forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-tab') === tabId);
    });

    this.dom.tabPanes.forEach(pane => {
      pane.classList.toggle('active', pane.id === `tab-pane-${tabId}`);
    });
  }

  updateLLMFormState(provider) {
    const isSim = provider === 'simulated';
    if (this.dom.apiKeyInput) {
      this.dom.apiKeyInput.disabled = isSim;
      this.dom.apiKeyInput.placeholder = isSim ? 'Offline smart simulation (no key needed)' : 'Paste API Key (sk-...)';
    }
  }

  saveLLMSettings() {
    const selectedProvider = document.querySelector('input[name="llm-provider"]:checked')?.value || 'simulated';
    const apiKey = this.dom.apiKeyInput?.value.trim() || '';
    const model = this.dom.modelSelect?.value || 'gpt-4o-mini';
    const temperature = parseFloat(this.dom.temperatureSlider?.value || 0.3);

    this.liveLLM.saveConfig({
      provider: selectedProvider,
      apiKey,
      model,
      temperature
    });

    this.updateLLMBadge();
    showToast('LLM Settings saved successfully!', 'success');
  }

  async testLLMConnection() {
    const selectedProvider = document.querySelector('input[name="llm-provider"]:checked')?.value || 'simulated';
    const apiKey = this.dom.apiKeyInput?.value.trim() || '';
    const model = this.dom.modelSelect?.value || 'gpt-4o-mini';

    this.dom.llmTestResult.innerHTML = `<span class="test-loading">Pinging API endpoint...</span>`;

    try {
      const res = await this.liveLLM.testConnection(selectedProvider, apiKey, model);
      this.dom.llmTestResult.innerHTML = `<span class="test-success">✓ ${res.message}</span>`;
      showToast(res.message, 'success');
    } catch (err) {
      this.dom.llmTestResult.innerHTML = `<span class="test-error">✕ ${err.message}</span>`;
      showToast(err.message, 'error');
    }
  }

  updateLLMBadge() {
    if (!this.dom.llmModeBadge) return;
    if (this.liveLLM.isLiveMode()) {
      this.dom.llmModeBadge.innerHTML = `
        <span class="badge-dot-live"></span>
        <span>Live LLM (${this.liveLLM.config.provider})</span>
      `;
      this.dom.llmModeBadge.className = 'status-badge live-active';
    } else {
      this.dom.llmModeBadge.innerHTML = `
        <span class="badge-dot-sim"></span>
        <span>Smart Offline Engine</span>
      `;
      this.dom.llmModeBadge.className = 'status-badge sim-active';
    }
  }
}

// Bootstrap Application on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  window.obeliskApp = window.nexusApp = new NexusApp();
});
