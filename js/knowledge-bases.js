/**
 * Obelisk by TechXodia — Enterprise Knowledge Bases Definition & Seed Vectors
 * TechXodia Showcase Edition
 */

export const INITIAL_KNOWLEDGE_BASES = {
  'saas-cloud': {
    id: 'saas-cloud',
    name: 'TechXodia Cloud Engine',
    badge: 'SaaS Cloud Platform',
    icon: '☁️',
    description: 'Autonomous microservices, edge computing, distributed caching, and zero-trust IAM architecture.',
    vectorCount: 1420,
    dimensions: 1536,
    defaultPrompts: [
      'What are the webhook retry policies and backoff intervals?',
      'How does OAuth 2.1 token rotation work for enterprise service accounts?',
      'What are the API rate limits on the Business vs Enterprise tiers?',
      'Can you explain the multi-region failover and SLA guarantees?',
      'I need to talk to a human specialist about custom enterprise quotas'
    ],
    documents: [
      {
        id: 'doc-saas-1',
        title: 'Webhook Event Delivery & Exponential Backoff',
        fileName: 'webhooks_and_events.md',
        type: 'md',
        category: 'Networking & Events',
        size: '34 KB',
        updatedAt: '2026-09-28',
        chunks: [
          {
            id: 'chunk-saas-1-1',
            section: '§1.1 Delivery Guarantees & At-Least-Once Delivery',
            text: 'TechXodia Cloud Webhook delivery guarantees at-least-once delivery semantics for all platform events. Every payload is signed with an HMAC-SHA256 signature in the X-Obelisk-Signature header using your endpoint webhook secret. Consumers must verify this signature and maintain an idempotency cache of the event_id for 72 hours to prevent duplicate processing.',
            keywords: ['webhook', 'signature', 'hmac-sha256', 'idempotency', 'delivery', 'event_id', 'header'],
            tokens: 94,
            vectorId: 'vec_wbk_01'
          },
          {
            id: 'chunk-saas-1-2',
            section: '§1.2 Exponential Backoff & Retry Intervals',
            text: 'If an endpoint fails with a 5xx HTTP status code or connection timeout (threshold: 4,000ms), Obelisk Webhooks initiates an exponential backoff schedule with jitter: Attempt 1 is immediate; Attempt 2 at +30 seconds; Attempt 3 at +5 minutes; Attempt 4 at +30 minutes; Attempt 5 at +4 hours. After 5 consecutive failures, the event transitions to the Dead Letter Queue (DLQ) and triggers an alert via PagerDuty/Slack.',
            keywords: ['retry', 'backoff', 'interval', 'failure', '5xx', 'timeout', 'dead letter queue', 'dlq', 'attempts'],
            tokens: 118,
            vectorId: 'vec_wbk_02'
          }
        ]
      },
      {
        id: 'doc-saas-2',
        title: 'API Authentication & JWT Token Rotation',
        fileName: 'api_authentication.md',
        type: 'md',
        category: 'Security & IAM',
        size: '52 KB',
        updatedAt: '2026-10-02',
        chunks: [
          {
            id: 'chunk-saas-2-1',
            section: '§2.1 Bearer Token Lifetimes & Rotation',
            text: 'All REST and GraphQL requests require an OAuth 2.1 Bearer JWT token in the Authorization header. Access tokens have a TTL of 15 minutes (900 seconds) to mitigate replay hazards. Refresh tokens are single-use with cryptographic rotation: exchanging a refresh token invalidates the previous token and generates a new pair. If an invalidated refresh token is reused, all tokens for the security principal are immediately revoked.',
            keywords: ['authentication', 'bearer', 'jwt', 'oauth', 'token', 'rotation', 'ttl', 'refresh token', 'revocation'],
            tokens: 112,
            vectorId: 'vec_auth_01'
          },
          {
            id: 'chunk-saas-2-2',
            section: '§2.2 Rate Limiting Architecture & Quotas',
            text: 'Rate limiting is enforced at the Cloudflare Edge using a Redis token bucket algorithm. Free tier is capped at 60 requests/minute. Pro tier supports 600 req/min with burst allowance to 900. Enterprise tier provides 5,000 req/min dedicated capacity with custom tenant bypass. Responses return X-RateLimit-Limit, X-RateLimit-Remaining, and X-RateLimit-Reset epoch timestamps.',
            keywords: ['rate limit', 'quota', 'redis', 'token bucket', 'tier', 'enterprise', 'burst', 'headers', '429'],
            tokens: 96,
            vectorId: 'vec_auth_02'
          }
        ]
      },
      {
        id: 'doc-saas-3',
        title: 'Enterprise Architecture & High-Availability SLA',
        fileName: 'cloud_architecture_overview.pdf',
        type: 'pdf',
        category: 'Infrastructure',
        size: '128 KB',
        updatedAt: '2026-08-15',
        chunks: [
          {
            id: 'chunk-saas-3-1',
            section: '§3.1 Multi-Region Active-Active Topology',
            text: 'TechXodia Cloud is deployed across 3 AWS and GCP dual-homed regions (us-east-1, eu-central-1, ap-southeast-1) orchestrated by Kubernetes with Envoy service mesh. Database storage utilizes Google Cloud Spanner and CockroachDB for multi-region synchronized consistency with zero data loss (RPO = 0, RTO < 30 seconds).',
            keywords: ['multi-region', 'architecture', 'active-active', 'spanner', 'envoy', 'rpo', 'rto', 'failover', 'kubernetes'],
            tokens: 92,
            vectorId: 'vec_arch_01'
          },
          {
            id: 'chunk-saas-3-2',
            section: '§3.2 Service Level Agreement (SLA) & Financial Credits',
            text: 'Enterprise customers receive an uptime SLA guarantee of 99.99% monthly availability (less than 4.3 minutes of unplanned downtime per month). In the event of an SLA breach: 99.9% - 99.0% credits 15% of monthly fees; 98.9% - 95.0% credits 30%; below 95.0% credits 100% of the billing cycle fees upon ticket submission within 30 days.',
            keywords: ['sla', 'uptime', 'availability', '99.99%', 'credits', 'penalty', 'downtime', 'guarantee', 'enterprise'],
            tokens: 95,
            vectorId: 'vec_arch_02'
          }
        ]
      },
      {
        id: 'doc-saas-4',
        title: 'Tier Pricing & Compute Quotas Specification',
        fileName: 'pricing_v3.pdf',
        type: 'pdf',
        category: 'Commercial',
        size: '86 KB',
        updatedAt: '2026-10-01',
        chunks: [
          {
            id: 'chunk-saas-4-1',
            section: '§4.1 Subscription Tiers Comparison',
            text: 'Developer Tier ($49/month) includes 200,000 edge executions, 50 GB storage, community support. Business Tier ($299/month) includes 2.5 million edge executions, 500 GB storage, 99.9% SLA, and priority email support. Enterprise Tier ($1,299+/month base) provides unlimited edge concurrency, dedicated IP pools, custom RAG vector databases, 99.99% SLA, 15-minute response SLA, and assigned Solutions Architect.',
            keywords: ['pricing', 'developer', 'business', 'enterprise', 'cost', 'subscription', 'executions', 'storage', 'quote'],
            tokens: 110,
            vectorId: 'vec_prc_01'
          }
        ]
      }
    ]
  },

  'fintech-billing': {
    id: 'fintech-billing',
    name: 'FinCore Billing & Payment Engine',
    badge: 'Fintech & Billing API',
    icon: '💳',
    description: 'High-frequency payment processing, prorated subscriptions, multi-currency ledger, and PCI-DSS L1 vault.',
    vectorCount: 1680,
    dimensions: 1536,
    defaultPrompts: [
      'How is prorated billing calculated when a user upgrades mid-cycle?',
      'What is the chargeback rebuttal window and required evidence?',
      'What are the FX fees and settlement timings for cross-border payouts?',
      'How does client-side card tokenization protect raw PAN data?',
      'Can I speak with a sales specialist regarding custom volume interchange rates?'
    ],
    documents: [
      {
        id: 'doc-fin-1',
        title: 'Prorated Billing Mechanics & Delta Calculation',
        fileName: 'prorated_billing_engine.md',
        type: 'md',
        category: 'Subscription Billing',
        size: '41 KB',
        updatedAt: '2026-09-12',
        chunks: [
          {
            id: 'chunk-fin-1-1',
            section: '§1.1 Second-by-Second Proration Formula',
            text: 'FinCore uses a precise second-by-second linear proration algorithm for plan upgrades and downgrades. When a customer upgrades from Tier A ($100/mo) to Tier B ($300/mo) halfway through a 30-day billing cycle (15 days elapsed), the engine calculates: Credit for unused Tier A = ($100 / 30) * 15 = $50.00 credit. Debit for remaining Tier B = ($300 / 30) * 15 = $150.00 debit. Net prorated immediate charge = $100.00.',
            keywords: ['proration', 'prorated', 'upgrade', 'downgrade', 'billing cycle', 'credit', 'debit', 'mid-cycle', 'calculation'],
            tokens: 115,
            vectorId: 'vec_pro_01'
          },
          {
            id: 'chunk-fin-1-2',
            section: '§1.2 Invoice Line Items & Negative Balance Rollovers',
            text: 'If a plan downgrade generates a net credit exceeding current invoice charges, FinCore creates an unapplied credit balance on the customer ledger account. This credit balance is automatically applied against the subsequent month billing statement and does not trigger an outbound payment refund unless explicitly requested via /v1/customers/{id}/refund_balance.',
            keywords: ['invoice', 'credit balance', 'downgrade', 'rollover', 'refund', 'ledger', 'negative balance'],
            tokens: 88,
            vectorId: 'vec_pro_02'
          }
        ]
      },
      {
        id: 'doc-fin-2',
        title: 'Dispute Handling & Chargeback Resolution Protocol',
        fileName: 'dispute_and_chargeback_protocol.docx',
        type: 'docx',
        category: 'Risk & Compliance',
        size: '64 KB',
        updatedAt: '2026-08-30',
        chunks: [
          {
            id: 'chunk-fin-2-1',
            section: '§2.1 Evidence Submission Timelines & Visa/Mastercard Rules',
            text: 'Upon receipt of a chargeback inquiry notification (webhook: dispute.opened), merchants have exactly 7 calendar days to upload compelling rebuttal evidence via the FinCore dashboard or API. For fraud disputes (Reason Code 10.4 / 4837), mandatory evidence includes customer IP address, 3D Secure 2.0 liability shift certificate, matching billing address AVS code, and server delivery logs.',
            keywords: ['dispute', 'chargeback', 'rebuttal', 'evidence', '7 days', 'visa', 'mastercard', 'fraud', '3d secure', 'avs'],
            tokens: 110,
            vectorId: 'vec_dsp_01'
          },
          {
            id: 'chunk-fin-2-2',
            section: '§2.2 Chargeback Fees & Dispute Shield Automation',
            text: 'A non-refundable chargeback fee of $15.00 USD is assessed per contested transaction. FinCore Dispute Shield uses automated ML evidence compiling to achieve a 68.4% win rate across SaaS chargebacks. Winning a dispute reverses the disputed amount to the merchant ledger within 45 to 75 business days subject to card issuer review.',
            keywords: ['dispute fee', '$15', 'win rate', 'dispute shield', 'reversal', 'issuer', 'rebuttal'],
            tokens: 85,
            vectorId: 'vec_dsp_02'
          }
        ]
      },
      {
        id: 'doc-fin-3',
        title: 'Cross-Border FX Settlements & Payout Timelines',
        fileName: 'cross_border_settlement_fx.pdf',
        type: 'pdf',
        category: 'Treasury & FX',
        size: '95 KB',
        updatedAt: '2026-10-05',
        chunks: [
          {
            id: 'chunk-fin-3-1',
            section: '§3.1 Multi-Currency Payout Mechanics & FX Spread',
            text: 'FinCore supports multi-currency settlements in 42 global fiat currencies and USDC/EURC stablecoins. Cross-border currency conversion applies the mid-market Reuters spot rate plus a transparent 0.40% FX spread (interchange tier discounts apply for >$5M monthly volume). Payouts to US/EU accounts settle T+1 via ACH/SEPA Instant, while international SWIFT transfers settle T+2.',
            keywords: ['fx', 'currency', 'foreign exchange', 'spread', '0.40%', 'settlement', 'payout', 't+1', 'swift', 'sepa', 'usdc'],
            tokens: 104,
            vectorId: 'vec_fx_01'
          }
        ]
      },
      {
        id: 'doc-fin-4',
        title: 'PCI-DSS v4.0 Zero-Trust Card Tokenization',
        fileName: 'pci_dss_tokenization.md',
        type: 'md',
        category: 'Security Vault',
        size: '38 KB',
        updatedAt: '2026-09-01',
        chunks: [
          {
            id: 'chunk-fin-4-1',
            section: '§4.1 Client-Side Elements & Ephemeral Vaulting',
            text: 'FinCore ensures merchants remain fully compliant under PCI-DSS SAQ A. Primary Account Numbers (PAN) and CVV2 security codes never touch your backend web servers. FinCore Elements drop-in iframes securely transmit card telemetry directly to our HSM-backed tokenization enclave, returning an ephemeral, single-use token (tok_live_*) that is exchanged for a reusable customer payment source.',
            keywords: ['pci-dss', 'tokenization', 'card', 'pan', 'cvv', 'saq a', 'vault', 'elements', 'token', 'security'],
            tokens: 102,
            vectorId: 'vec_pci_01'
          }
        ]
      }
    ]
  },

  'ecommerce-logistics': {
    id: 'ecommerce-logistics',
    name: 'OmniShip Global Logistics',
    badge: 'E-Commerce Logistics & Returns',
    icon: '📦',
    description: 'Cross-border fulfillment, customs HS classification, reverse logistics, and IoT cold-chain telemetry.',
    vectorCount: 1890,
    dimensions: 1536,
    defaultPrompts: [
      'What is the international return window and restocking fee policy?',
      'How are customs duties and DDP vs DDU calculated for cross-border shipments?',
      'What are the transit time SLAs for Air Express vs Maritime freight?',
      'How does IoT cold-chain monitoring handle temperature excursions?',
      'I want to speak with an enterprise logistics account manager'
    ],
    documents: [
      {
        id: 'doc-log-1',
        title: 'International Reverse Logistics & Return Policy',
        fileName: 'international_return_policy.docx',
        type: 'docx',
        category: 'Returns & Reverse Logistics',
        size: '48 KB',
        updatedAt: '2026-09-22',
        chunks: [
          {
            id: 'chunk-log-1-1',
            section: '§1.1 Return Windows & Eligibility Matrix',
            text: 'OmniShip Global provides an automated 30-day return window starting from confirmed courier delivery scan. Items must be in unwashed, unworn condition with original RFID security tags intact. Return labels are generated dynamically via our localized partner network (DHL, FedEx, Royal Mail, Japan Post) with QR-code dropoff options at 140,000+ access points worldwide.',
            keywords: ['return', 'return policy', 'window', '30 days', 'refund', 'label', 'eligibility', 'qr code', 'dhl', 'fedex'],
            tokens: 98,
            vectorId: 'vec_ret_01'
          },
          {
            id: 'chunk-log-1-2',
            section: '§1.2 Restocking Fees & Inspection Turnaround',
            text: 'Standard apparel and consumer electronics returns have zero restocking fees. Heavy freight, oversized furniture (>30kg), and customized merchandise incur a flat 10% restocking fee. Once returned items arrive at regional consolidation hubs, optical AI inspection completes within 24 hours, automatically dispatching credit back to the merchant checkout within 48 hours.',
            keywords: ['restocking fee', 'fee', '10%', 'inspection', 'oversized', 'turnaround', 'refund time', 'hub'],
            tokens: 92,
            vectorId: 'vec_ret_02'
          }
        ]
      },
      {
        id: 'doc-log-2',
        title: 'Customs Clearance, Duties & DDP vs DDU Protocol',
        fileName: 'customs_and_duties_dsv.pdf',
        type: 'pdf',
        category: 'Customs & Compliance',
        size: '88 KB',
        updatedAt: '2026-08-19',
        chunks: [
          {
            id: 'chunk-log-2-1',
            section: '§2.1 Delivered Duty Paid (DDP) Automated Clearance',
            text: 'OmniShip defaults to Delivered Duty Paid (DDP) for tier-1 cross-border corridors (US to EU/UK, APAC to US). OmniShip customs AI automatically predicts 6-digit Harmonized System (HS) tariff codes with 99.4% accuracy, calculating destination VAT and import tariffs upfront at checkout. Customers experience frictionless delivery with zero surprise customs bills at their doorstep.',
            keywords: ['customs', 'duties', 'ddp', 'ddu', 'vat', 'tariff', 'hs code', 'cross-border', 'import'],
            tokens: 105,
            vectorId: 'vec_cst_01'
          },
          {
            id: 'chunk-log-2-2',
            section: '§2.2 DDU Handling & Abandonment Policies',
            text: 'When merchants select Delivered Duty Unpaid (DDU), local customs authorities contact the recipient directly. If duties remain unpaid after 14 days, the shipment enters customs holding. OmniShip provides an automated SMS reminder system. If abandoned, items are redirected to regional salvage or destruction according to local import regulations.',
            keywords: ['ddu', 'unpaid', 'customs holding', 'abandoned', 'sms', 'salvage'],
            tokens: 78,
            vectorId: 'vec_cst_02'
          }
        ]
      },
      {
        id: 'doc-log-3',
        title: 'Global Freight SLAs & Transit Times Matrix',
        fileName: 'freight_sla_transit_matrix.md',
        type: 'md',
        category: 'Carrier SLAs',
        size: '56 KB',
        updatedAt: '2026-10-09',
        chunks: [
          {
            id: 'chunk-log-3-1',
            section: '§3.1 Air Express vs Ocean Freight Transit SLAs',
            text: 'Air Express Priority delivers within 2 to 3 business days globally with flight tail-number GPS tracking. Standard Global Air delivers within 5 to 7 business days. Ocean Freight FCL/LCL operates on scheduled carrier sailings with 14 to 21 business days transit trans-Pacific, supported by real-time AIS maritime container tracking and port congestion rerouting algorithms.',
            keywords: ['transit time', 'sla', 'air express', 'ocean freight', 'shipping time', '2-3 days', '5-7 days', '14-21 days', 'carrier'],
            tokens: 96,
            vectorId: 'vec_frt_01'
          }
        ]
      },
      {
        id: 'doc-log-4',
        title: 'Cold-Chain IoT Telemetry & Excursion Alerts',
        fileName: 'cold_chain_perishables.pdf',
        type: 'pdf',
        category: 'Specialized Cargo',
        size: '72 KB',
        updatedAt: '2026-09-14',
        chunks: [
          {
            id: 'chunk-log-4-1',
            section: '§4.1 Temperature-Sensitive Pharma & Perishables Standard',
            text: 'OmniShip ColdShield integrates cellular IoT data loggers tracking temperature, relative humidity, and 3-axis shock every 120 seconds. Standard pharma ranges maintain 2°C to 8°C or deep frozen (-20°C). Any excursion exceeding +2°C above target for >15 minutes immediately issues an automated carrier reroute to the nearest cold-storage dry-ice facility and notifies QA.',
            keywords: ['cold chain', 'iot', 'temperature', 'perishable', 'pharma', '2°c to 8°c', 'excursion', 'dry ice'],
            tokens: 104,
            vectorId: 'vec_cld_01'
          }
        ]
      }
    ]
  }
};
