/**
 * Obelisk by TechXodia — Admin Knowledge Studio & Telemetry Analytics View
 * TechXodia Showcase Edition
 */

export class AdminStudio {
  constructor(ragEngine, agent, liveLLM) {
    this.rag = ragEngine;
    this.agent = agent;
    this.liveLLM = liveLLM;
    this.stats = {
      totalInquiries: 14892,
      automatedResolutionRate: 94.8,
      averageLatency: 218,
      csatScore: 4.92,
      activeVectors: 4990,
      totalTokensIndexed: 384500
    };
  }

  /**
   * Render SVG chart for 24-Hour Inquiry Volume
   */
  renderTrafficChart(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const hours = ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00', 'Now'];
    const totalVolume = [140, 95, 110, 680, 1150, 1420, 1080, 890, 1260];
    const automated = [135, 92, 106, 648, 1090, 1345, 1025, 842, 1198];

    const maxVal = 1600;
    const width = 640;
    const height = 180;
    const padding = { top: 20, right: 30, bottom: 30, left: 45 };

    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    const pointsTotal = totalVolume.map((val, idx) => {
      const x = padding.left + (idx / (totalVolume.length - 1)) * chartW;
      const y = padding.top + chartH - (val / maxVal) * chartH;
      return `${x},${y}`;
    }).join(' ');

    const pointsAuto = automated.map((val, idx) => {
      const x = padding.left + (idx / (automated.length - 1)) * chartW;
      const y = padding.top + chartH - (val / maxVal) * chartH;
      return `${x},${y}`;
    }).join(' ');

    const areaTotal = `${padding.left},${padding.top + chartH} ${pointsTotal} ${padding.left + chartW},${padding.top + chartH}`;

    container.innerHTML = `
      <svg viewBox="0 0 ${width} ${height}" class="studio-svg-chart">
        <defs>
          <linearGradient id="chartGradientTotal" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#536DFE" stop-opacity="0.35"/>
            <stop offset="100%" stop-color="#0C0B0B" stop-opacity="0.0"/>
          </linearGradient>
          <linearGradient id="chartLineGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stop-color="#00E5FF"/>
            <stop offset="50%" stop-color="#2979FF"/>
            <stop offset="100%" stop-color="#536DFE"/>
          </linearGradient>
        </defs>
        
        <!-- Grid lines -->
        <line x1="${padding.left}" y1="${padding.top}" x2="${width - padding.right}" y2="${padding.top}" stroke="rgba(255,255,255,0.06)" stroke-dasharray="3,3"/>
        <line x1="${padding.left}" y1="${padding.top + chartH / 2}" x2="${width - padding.right}" y2="${padding.top + chartH / 2}" stroke="rgba(255,255,255,0.06)" stroke-dasharray="3,3"/>
        <line x1="${padding.left}" y1="${padding.top + chartH}" x2="${width - padding.right}" y2="${padding.top + chartH}" stroke="rgba(255,255,255,0.12)"/>
        
        <!-- Area fill -->
        <polygon points="${areaTotal}" fill="url(#chartGradientTotal)"/>
        
        <!-- Lines -->
        <polyline points="${pointsTotal}" fill="none" stroke="url(#chartLineGrad)" stroke-width="3" stroke-linecap="round"/>
        <polyline points="${pointsAuto}" fill="none" stroke="#00E5FF" stroke-width="2" stroke-dasharray="4,3"/>
        
        <!-- X Axis Labels -->
        ${hours.map((h, i) => {
          const x = padding.left + (i / (hours.length - 1)) * chartW;
          return `<text x="${x}" y="${height - 8}" text-anchor="middle" fill="#64748B" font-size="11" font-family="Inter, sans-serif">${h}</text>`;
        }).join('')}
        
        <!-- Y Axis Labels -->
        <text x="${padding.left - 8}" y="${padding.top + 4}" text-anchor="end" fill="#64748B" font-size="10">1.6k</text>
        <text x="${padding.left - 8}" y="${padding.top + chartH / 2 + 4}" text-anchor="end" fill="#64748B" font-size="10">800</text>
        <text x="${padding.left - 8}" y="${padding.top + chartH + 4}" text-anchor="end" fill="#64748B" font-size="10">0</text>
      </svg>
    `;
  }

  /**
   * Render Intent Distribution Bars
   */
  renderIntentBreakdown(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const categories = [
      { name: 'API Auth & Cloud Infrastructure', percent: 42, count: '6,254 queries', color: '#536DFE' },
      { name: 'Billing & Proration Calculations', percent: 28, count: '4,170 queries', color: '#2979FF' },
      { name: 'Logistics, Customs & Return SLAs', percent: 24, count: '3,574 queries', color: '#00E5FF' },
      { name: 'Enterprise Lead & Human Escalation', percent: 6, count: '894 leads', color: '#FFB300' }
    ];

    container.innerHTML = categories.map(cat => `
      <div class="intent-stat-row">
        <div class="intent-stat-header">
          <span class="intent-name">
            <span class="intent-dot" style="background: ${cat.color};"></span>
            ${cat.name}
          </span>
          <span class="intent-count">${cat.count} (${cat.percent}%)</span>
        </div>
        <div class="intent-bar-track">
          <div class="intent-bar-fill" style="width: ${cat.percent}%; background: ${cat.color};"></div>
        </div>
      </div>
    `).join('');
  }

  /**
   * Render Captured Leads Table
   */
  renderLeadsList(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const leads = this.agent.leadTickets;

    if (leads.length === 0) {
      container.innerHTML = `<div class="empty-leads">No enterprise lead tickets dispatched yet.</div>`;
      return;
    }

    container.innerHTML = `
      <div class="table-responsive">
        <table class="studio-leads-table">
          <thead>
            <tr>
              <th>Ticket ID</th>
              <th>Contact Name</th>
              <th>Work Email</th>
              <th>Organization</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            ${leads.map(lead => `
              <tr>
                <td><span class="badge-ticket">${lead.id}</span></td>
                <td class="font-medium text-white">${lead.name}</td>
                <td class="text-slate-400 font-mono text-xs">${lead.email}</td>
                <td>${lead.company}</td>
                <td><span class="badge-priority priority-${lead.priority.toLowerCase()}">${lead.priority}</span></td>
                <td><span class="badge-status-dot">${lead.status}</span></td>
                <td class="text-slate-400 text-xs">${lead.timestamp}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }
}
