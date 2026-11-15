# Scanner transition alerts — integration contract

Implemented: deterministic snapshot evaluator and transition reducer. No provider requests, scheduled jobs, charges, or live notifications are enabled.

Current main uses an embedded TradingView screener, which supplies no application-owned result stream. Integrate this module with the current backend scanner before enabling alerts. Do not scrape the embedded widget or trust browser/LLM-submitted claims of confirmed patterns.

Snapshots require stable exchange-qualified securityId, ruleVersion, exchange sessionDate, interval=1day, explicitly closed and dataValid flags, USD market capitalization, close, MA20, and volume means (last five sessions versus preceding twenty). Use consistent split-adjusted history, and validate freshness/completeness upstream. Pattern status must come from the trusted detector. MA150 and ATR are informational. Missing ATR is displayed as unavailable, not zero. Volume definition is the proposed v1 assumption, not a verified preexisting user setting.

Persist state and alerts in a durable server database. In ONE transaction, acquire a lock keyed by (securityId, ruleVersion), including when there is no existing state; read state; call advance; insert alert using a unique constraint on (securityId, ruleVersion, sessionDate); persist state; commit. Never use an in-memory lock or browser storage as a multi-worker guarantee. Retries after a crash must repeat the whole transaction. Rule changes need a new version; first valid result establishes a silent baseline. Unknown snapshots preserve the previous state. Out-of-order and already processed closed sessions are ignored. Corrected historical data requires explicit replay policy; it does not issue new notifications automatically.

Remaining production work: current scanner adapter, durable transactional repository, authenticated read API, Hebrew in-app alert list, and scheduled ingestion. No live integration or parallel database acceptance test is claimed by this branch. Validate ten concurrent submissions produce exactly one row, including after process restart and transaction rollback, against the chosen database.

Run `node --test tests/screener-alerts.test.mjs`. Fixtures cover transitions, boundaries, unknown data, rule changes, older dates, calendar validity, evidence immutability and reentry. They are synthetic test data, not quotes shown to customers.
