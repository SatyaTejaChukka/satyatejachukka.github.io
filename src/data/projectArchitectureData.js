/* -------------------------------------------------------------
   ARCHITECTURE DATA REPOSITORY
   Deep, authentic system architecture specifications for each project
------------------------------------------------------------- */

export const projectsArchitectureData = {
  // TubeRAG (id: 8)
  8: {
    headline: 'Zero-Egress Hybrid RAG & Vector Search Pipeline',
    latency: '< 220ms initial chunk / Streaming tokens',
    throughput: '280+ tokens/sec on Groq LPUs',
    nodes: [
      {
        id: 'ingest',
        step: '01',
        name: 'Transcript Ingestion',
        tech: 'youtube-transcript-api',
        category: 'Source Ingestion',
        metric: '< 250ms fetch',
        summary: 'Extracts multi-language official & auto-generated subtitle tracks with microsecond timecodes.',
        decision:
          'Why custom transcript ingestion? Bypasses strict YouTube Data API v3 daily quota exhaustion (10,000 units/day) by directly leveraging public caption endpoints with fallback scraping.',
        tradeoff:
          'Auto-generated subtitles lack punctuation; required regex segmentation to construct coherent paragraph chunks for downstream embedding.',
        contract: 'YouTube URL / Playlist ID ➔ Timestamped Raw Transcript Array',
      },
      {
        id: 'embeddings',
        step: '02',
        name: 'Dense Embeddings',
        tech: 'SentenceTransformers',
        category: 'Vectorization',
        metric: '384-dim / 14ms batch',
        summary: 'Transforms chunked transcript texts into 384-dimensional dense semantic vectors using all-MiniLM-L6-v2.',
        decision:
          'Why local SentenceTransformers? Completely eliminates OpenAI embedding API costs ($0.02/1M tokens) and guarantees zero user data egress outside the server environment.',
        tradeoff:
          '384 dimensions provide the optimal sweet spot between semantic retention and vector search latency on consumer hardware (4x smaller RAM footprint than OpenAI 1536-dim).',
        contract: 'Text Chunks [T_start, T_end] ➔ Normalized Float32[384] Vectors',
      },
      {
        id: 'vectordb',
        step: '03',
        name: 'Vector Database',
        tech: 'ChromaDB',
        category: 'Storage & Search',
        metric: 'HNSW Index / < 6ms query',
        summary: 'Stores high-dimensional vectors with video metadata in persistent collections using cosine distance similarity.',
        decision:
          'Why ChromaDB vs pgvector? ChromaDB requires zero external DB server infrastructure, operates embedded in-process, and enables instant local cold starts for developer and self-hosted environments.',
        tradeoff:
          'pgvector excels at relational joins, but ChromaDB simplifies single-tenant collection isolation and reduces server infrastructure footprint to zero.',
        contract: 'Query Vector Float32[384] ➔ Top-K Chunks + Millisecond Timestamps',
      },
      {
        id: 'llm',
        step: '04',
        name: 'Hybrid Generation',
        tech: 'Groq LLaMA 3 / Ollama',
        category: 'Inference Engine',
        metric: '280+ tokens/sec (Groq)',
        summary: 'Streams grounded responses synthesized from retrieved context chunks using ultra-low latency Groq LPUs or private local Ollama.',
        decision:
          'Why Groq & Ollama hybrid? Groq LPUs achieve 280+ tokens/sec for instantaneous user response, while Ollama provides an air-gapped, zero-cloud fallback for sensitive videos.',
        tradeoff:
          'Groq requires an API key, so user BYOK (Bring Your Own Key) architecture keeps keys encrypted purely in the client session storage.',
        contract: 'Retrieved Chunks + User Query Prompt ➔ Streaming Response with Citation Tags',
      },
      {
        id: 'citations',
        step: '05',
        name: 'Timestamped Citations',
        tech: 'React & IFrame Sync',
        category: 'Client UI',
        metric: 'Sub-second seek sync',
        summary: 'Renders grounded answers with clickable badge citations that directly seek the embedded YouTube video player to the exact second.',
        decision:
          'Why timestamp-anchored citations? Solves LLM hallucinations by forcing verifiable attribution to exact timestamps in the source lecture or video.',
        tradeoff:
          'Requires synchronizing YouTube IFrame player state with React state hooks across desktop and mobile viewports.',
        contract: 'Inline [Citation: 04:23] Click ➔ Video Player Seek(263s)',
      },
    ],
  },

  // StrokeRiskAI (id: 1)
  1: {
    headline: 'Asynchronous Clinical ML Inference & Explainability Gateway',
    latency: '< 45ms end-to-end inference',
    throughput: 'Concurrent async request handling',
    nodes: [
      {
        id: 'input',
        step: '01',
        name: 'Clinical Input UI',
        tech: 'React Form Validation',
        category: 'Client Layer',
        metric: 'Real-time schema check',
        summary: 'Captures 11 biometric parameters including age, hypertension, glucose level, and BMI with strict schema bounds.',
        decision:
          'Why client-side validation? Catches out-of-range clinical inputs before hitting the network, preventing wasted compute on invalid medical inference requests.',
        tradeoff:
          'Client validation rules must remain strictly synchronized with backend Pydantic validation schemas to avoid discrepancies.',
        contract: 'Biometric Health Inputs ➔ Sanitized JSON Payload',
      },
      {
        id: 'api',
        step: '02',
        name: 'FastAPI Async Gateway',
        tech: 'FastAPI + Pydantic v2',
        category: 'API Service',
        metric: '< 4ms latency',
        summary: 'Asynchronous HTTP endpoint performing strict type enforcement, serialization, and health risk dispatch.',
        decision:
          'Why FastAPI over Flask? Built-in ASGI async event loops handle high concurrency under load, and automatic OpenAPI schema generation simplifies contract testing.',
        tradeoff:
          'Requires async-aware middleware and careful offloading of CPU-bound ML model inference to thread pools.',
        contract: 'POST /api/v1/predict ➔ Validated StrokeFeatures Object',
      },
      {
        id: 'pipeline',
        step: '03',
        name: 'Feature Preprocessor',
        tech: 'Scikit-learn Pipeline',
        category: 'Feature Engineering',
        metric: '0.8ms transform',
        summary: 'Handles categorical one-hot encoding (smoking status, work type) and scales continuous features (glucose, BMI) matching training distributions.',
        decision:
          'Why unified scikit-learn Pipeline? Serializing the preprocessor with the model prevents data leakage between training and inference distributions.',
        tradeoff:
          'Pipeline pickle artifacts must be version-locked to avoid scikit-learn version deserialization warnings.',
        contract: 'StrokeFeatures ➔ Normalized NumPy Feature Array (1x16)',
      },
      {
        id: 'ensemble',
        step: '04',
        name: 'Multi-Model Ensemble',
        tech: 'Random Forest & XGBoost',
        category: 'ML Inference',
        metric: 'ROC-AUC 0.86 · 18ms',
        summary: 'Runs calibrated probabilistic inference across benchmarked models, weighting positive class prediction under severe class imbalance.',
        decision:
          'Why Ensemble weighting? Medical stroke datasets exhibit severe 95:5 class imbalance; ensemble probability calibration drastically reduces false negatives.',
        tradeoff:
          'Evaluating multiple models slightly increases latency compared to single logistic regression, but boosts clinical recall significantly.',
        contract: 'NumPy Feature Vector ➔ Calibrated Probability & Class Label',
      },
      {
        id: 'output',
        step: '05',
        name: 'Risk Insights & SHAP',
        tech: 'Explainability Dashboard',
        category: 'Visualization',
        metric: 'Dynamic risk scoring',
        summary: 'Renders an animated risk tier meter along with top contributing risk factors (e.g. Glucose > 200, Age > 60).',
        decision:
          'Why transparent risk contribution? Healthcare professionals and patients require explainable decision factors rather than opaque black-box percentages.',
        tradeoff:
          'Calculates top weighted features using model feature importances rather than full SHAP trees to preserve sub-50ms latency.',
        contract: 'Inference Score ➔ Risk Tier (Low/Medium/High) + Factor Badges',
      },
    ],
  },

  // Boston House Price Prediction (id: 2)
  2: {
    headline: 'Cross-Validated Regression & Market Valuation Pipeline',
    latency: '< 60ms prediction cycle',
    throughput: 'Lightweight WSGI Microservice',
    nodes: [
      {
        id: 'inputs',
        step: '01',
        name: 'Market Attributes',
        tech: 'Housing Feature Input',
        category: 'Input Layer',
        metric: '13 housing features',
        summary: 'Captures per capita crime rate, average rooms (RM), property tax rate (TAX), and pupil-teacher ratio (PTRATIO).',
        decision:
          'Why multi-feature normalization? Raw housing features span disparate units (percentages vs dollar counts); normalizer scales prevent room count domination.',
        tradeoff:
          'Requires sensible default ranges to assist non-real-estate users in entering realistic values.',
        contract: '13 Housing Indicators ➔ Cleaned Feature Map',
      },
      {
        id: 'flask_api',
        step: '02',
        name: 'Flask Backend Service',
        tech: 'Python Flask Microservice',
        category: 'API Service',
        metric: 'Lightweight WSGI',
        summary: 'Receives JSON request payloads, checks input bounds, and invokes serialized model artifact in memory.',
        decision:
          'Why Flask for this service? Minimalist WSGI footprint with zero unnecessary dependencies, ideal for containerized single-model deployment on Render.',
        tradeoff:
          'Synchronous WSGI server requires multi-worker Gunicorn configuration for concurrent scaling.',
        contract: 'POST /predict_api ➔ Validated NumPy Array',
      },
      {
        id: 'scaler',
        step: '03',
        name: 'Feature Scaler',
        tech: 'StandardScaler (scaler.pkl)',
        category: 'Data Pipeline',
        metric: 'Z-score scaling',
        summary: 'Applies mean-centering and unit-variance scaling derived from Boston historical market distribution.',
        decision:
          'Why decoupled pickle scaler? Ensures that production inputs are scaled with the exact mean/std of the training dataset without data contamination.',
        tradeoff:
          'Pickle serialization requires identical scikit-learn versions across build and runtime environments.',
        contract: 'Raw Feature Array ➔ Z-Score Scaled Vector',
      },
      {
        id: 'regressor',
        step: '04',
        name: 'Tuned Regressor',
        tech: 'Ridge / Random Forest',
        category: 'ML Inference',
        metric: 'R² = 0.84 · Low RMSE',
        summary: 'Executes regression inference to estimate median home value (MEDV in $1,000s).',
        decision:
          'Why cross-validated hyperparameter tuning? L2 regularization prevents overfitting on collinear features like TAX and RAD.',
        tradeoff:
          'Trade-off between interpretability of linear coefficients versus non-linear predictive capacity of tree ensembles.',
        contract: 'Scaled Vector ➔ Valuation Float ($k)',
      },
      {
        id: 'valuation',
        step: '05',
        name: 'Valuation & Insights',
        tech: 'Responsive Market UI',
        category: 'Output Layer',
        metric: 'Instant price display',
        summary: 'Presents predicted home valuation with confidence interval and comparative feature impact indicators.',
        decision:
          'Why display confidence ranges? Gives home buyers and analysts an expected variance window rather than a misleading single-point certainty.',
        tradeoff:
          'Calculates empirical residual standard deviation for variance estimation.',
        contract: 'Valuation Output ➔ Formatted Price ($) + Market Context',
      },
    ],
  },

  // CrashGuard AI (id: 3)
  3: {
    headline: 'Predictive Geospatial Incident Severity & Risk Engine',
    latency: '< 80ms inference cycle',
    throughput: 'Multi-class hazard classification',
    nodes: [
      {
        id: 'telemetry',
        step: '01',
        name: 'Incident Telemetry',
        tech: 'Geospatial Context Form',
        category: 'Input Source',
        metric: 'Weather + Spatial coords',
        summary: 'Gathers weather conditions (precipitation, visibility), road surface conditions, junction proximity, and timestamp.',
        decision:
          'Why multi-modal input? Weather and road characteristics multiply incident severity exponentially beyond driver speed alone.',
        tradeoff:
          'Requires external weather API lookups or fallback to local sensor records.',
        contract: 'Environmental Factors ➔ Spatial-Temporal Context Object',
      },
      {
        id: 'fastapi_geo',
        step: '02',
        name: 'FastAPI Processing',
        tech: 'FastAPI + Async Worker',
        category: 'Backend Service',
        metric: '< 5ms request dispatch',
        summary: 'Processes incoming telemetry, parses geospatial coordinates, and constructs structured feature tensors.',
        decision:
          'Why FastAPI? Async architecture enables non-blocking enrichment from spatial lookup tables.',
        tradeoff:
          'In-memory coordinate indexing requires warm-start preloading during container boot.',
        contract: 'Incident Payload ➔ Parsed Feature Matrix',
      },
      {
        id: 'feature_eng',
        step: '03',
        name: 'Risk Feature Engine',
        tech: 'Pandas + Interaction Terms',
        category: 'Data Pipeline',
        metric: '24-dim risk tensor',
        summary: 'Computes synthetic risk variables: rush-hour flags, low-light hazard multipliers, and junction complexity indices.',
        decision:
          'Why engineered interaction terms? Linear models miss the compound risk of wet asphalt combined with nighttime lack of street lighting.',
        tradeoff:
          'Expands feature space, requiring feature importance pruning during model training.',
        contract: 'Raw Features ➔ Engineered 24-Dimension Risk Tensor',
      },
      {
        id: 'severity_model',
        step: '04',
        name: 'Ensemble Classifier',
        tech: 'XGBoost Multi-Class',
        category: 'Machine Learning',
        metric: 'F1-Score 0.81 across tiers',
        summary: 'Classifies probability across 3 severity tiers: Minor, Moderate, and Critical/Severe casualty risk.',
        decision:
          'Why gradient boosted trees (XGBoost)? Excels at tabular heterogeneous data with missing values and non-linear feature splits.',
        tradeoff:
          'Gradient boosted trees require careful learning rate calibration to avoid over-weighting outlier accident reports.',
        contract: 'Risk Tensor ➔ Severity Class Probabilities [P_minor, P_mod, P_severe]',
      },
      {
        id: 'safety_dashboard',
        step: '05',
        name: 'Safety Dashboard',
        tech: 'Severity Gauge & Alerts',
        category: 'Visualization',
        metric: 'Actionable emergency tier',
        summary: 'Surfaces actionable hazard warnings, emergency response recommendation level, and key mitigating precautions.',
        decision:
          'Why actionable recommendations? Transforms raw predictive severity into concrete dispatch and safety instructions.',
        tradeoff:
          'Must map probabilistic thresholds to sensible real-world emergency dispatch tiers.',
        contract: 'Severity Tier ➔ Priority Dispatch Alert & Preventive Actions',
      },
    ],
  },

  // Namaste to ICD-11 Mapping (id: 4)
  4: {
    headline: 'Hierarchical Clinical Terminology NLP & Ontology Resolution Engine',
    latency: '< 35ms query latency',
    throughput: 'GIN & GiST Trigram Indexed Search',
    nodes: [
      {
        id: 'query_input',
        step: '01',
        name: 'Clinical Term Search',
        tech: 'Debounced Autocomplete UI',
        category: 'Input Layer',
        metric: '250ms debounce rate',
        summary: 'Clinicians input traditional Indian medicine (Namaste/AYUSH) terms, disease symptoms, or colloquial diagnostic labels.',
        decision:
          'Why flexible input? Clinical terminology varies widely across regional practices; system must handle phonetic and spelling variations.',
        tradeoff:
          'Requires client-side debouncing (250ms) to prevent server search flooding on keystrokes.',
        contract: 'Search Term String ➔ Sanitized Query',
      },
      {
        id: 'search_service',
        step: '02',
        name: 'FastAPI Search Router',
        tech: 'FastAPI + Async Router',
        category: 'Backend API',
        metric: '< 3ms routing',
        summary: 'Routes query to multi-tier matching algorithms and manages connection pooling to PostgreSQL.',
        decision:
          'Why FastAPI async router? Enables parallel fuzzy text matching and hierarchy resolution without thread locking.',
        tradeoff:
          'Requires structured error handling when non-standard characters or rare scripts are submitted.',
        contract: 'GET /api/v1/map?query=... ➔ Query Pipeline Task',
      },
      {
        id: 'fuzzy_nlp',
        step: '03',
        name: 'Fuzzy NLP & Trigrams',
        tech: 'Levenshtein + Trigrams',
        category: 'NLP Engine',
        metric: 'Semantic ranking',
        summary: 'Tokenizes medical descriptions, strips stop-words, and calculates similarity weights against the Namaste nomenclature index.',
        decision:
          'Why hybrid Levenshtein + Trigrams? Trigrams capture partial word roots (e.g., "arthro-", "cardio-") even when spelling errors exist.',
        tradeoff:
          'Trigram matching is computationally heavier than exact B-Tree lookup; mitigated by candidate set pre-filtering.',
        contract: 'Query Tokens ➔ Ranked Candidate Match List',
      },
      {
        id: 'postgres_ontology',
        step: '04',
        name: 'PostgreSQL Ontology DB',
        tech: 'PostgreSQL + GIN Indices',
        category: 'Database & Storage',
        metric: 'Sub-10ms index scans',
        summary: 'Houses the complete WHO ICD-11 diagnostic hierarchy, parent-child taxonomy trees, and cross-reference mapping tables.',
        decision:
          'Why PostgreSQL with GIN indexing? Relational structure preserves ICD-11\'s strict recursive parent-child tree hierarchy, while GIN indices deliver millisecond full-text searches.',
        tradeoff:
          'Graph databases handle recursive traversal naturally, but PostgreSQL avoids extra operational complexity and offers bulletproof ACID compliance.',
        contract: 'Candidate IDs ➔ Full ICD-11 Entity & Hierarchy Path',
      },
      {
        id: 'icd_output',
        step: '05',
        name: 'Standardized ICD-11 Code',
        tech: 'WHO Diagnostic Code Card',
        category: 'Resolution UI',
        metric: 'Match confidence %',
        summary: 'Returns the standardized WHO ICD-11 code (e.g., FA20.Z), official clinical definition, match confidence %, and parent category breadcrumbs.',
        decision:
          'Why display hierarchy breadcrumbs? Helps doctors immediately verify that the mapped code resides in the correct anatomical/pathological chapter.',
        tradeoff:
          'Requires fetching parent taxonomy nodes up to 3 levels deep.',
        contract: 'ICD-11 Entity ➔ Code, Confidence %, and Chapter Breadcrumbs',
      },
    ],
  },

  // Bloch Path Explorer (id: 5)
  5: {
    headline: 'Real-Time 3D Quantum State Simulation & Trajectory Renderer',
    latency: '60 FPS hardware-accelerated WebGL',
    throughput: 'Unitary matrix state transformation',
    nodes: [
      {
        id: 'gate_controls',
        step: '01',
        name: 'Quantum Gate Controls',
        tech: 'React Gate Pad (X, Y, Z, H, S)',
        category: 'Interactive Controls',
        metric: 'Instant event dispatch',
        summary: 'User selects single-qubit quantum logic gates or directly drags polar coordinates (theta θ, phi φ).',
        decision:
          'Why dual controls (gates + angles)? Allows both introductory students and quantum researchers to interact at their preferred conceptual level.',
        tradeoff:
          'Requires synchronizing gate matrices with continuous spherical coordinate representations.',
        contract: 'Gate Event (e.g. Hadamard) ➔ Unitary Transformation Request',
      },
      {
        id: 'qiskit_engine',
        step: '02',
        name: 'Quantum State Engine',
        tech: 'Unitary Linear Algebra',
        category: 'Quantum Simulator',
        metric: '2x2 Complex Matrix Mult',
        summary: 'Computes statevector transformations |ψ\'⟩ = U|ψ⟩ using complex unitary operators on the 2D Hilbert space.',
        decision:
          'Why unitary matrix transformation? Accurately preserves quantum norm conservation (⟨ψ|ψ⟩ = 1) and phase accumulation without approximations.',
        tradeoff:
          'Matrix math on client requires lightweight complex number library to avoid loading heavy Python runtimes in the browser.',
        contract: 'Initial State |ψ⟩ + Unitary Matrix U ➔ Updated Statevector [α, β]',
      },
      {
        id: 'coord_projection',
        step: '03',
        name: 'Bloch Mapping',
        tech: 'Spherical to Cartesian',
        category: 'Projection Engine',
        metric: 'Trigonometric projection',
        summary: 'Transforms complex statevector amplitudes α and β into 3D Cartesian coordinates (x = sin θ cos φ, y = sin θ sin φ, z = cos θ).',
        decision:
          'Why spherical to Cartesian conversion? Bridges abstract quantum probabilities to intuitive visual geometry on the unit sphere.',
        tradeoff:
          'Global phase e^(iγ) is physically unobservable and discarded; only relative phase φ is mapped.',
        contract: 'Complex State [α, β] ➔ 3D Coordinates Vector [x, y, z]',
      },
      {
        id: 'threejs_canvas',
        step: '04',
        name: 'Three.js 3D Sphere',
        tech: 'Three.js + WebGL Canvas',
        category: 'Visualization Engine',
        metric: '60 FPS smooth rendering',
        summary: 'Renders the translucent glass Bloch sphere, X/Y/Z coordinate axes, animated trajectory trails, and the glowing statevector pointer.',
        decision:
          'Why Three.js WebGL? Hardware acceleration enables smooth 3D rotation, orbital camera control, and animated arc trajectories.',
        tradeoff:
          'Must manage WebGL context lifecycle and dispose geometries on component unmount to prevent GPU memory leaks.',
        contract: '3D Coordinates ➔ Interactive 3D Sphere Scene',
      },
      {
        id: 'probability_readout',
        step: '05',
        name: 'Born Rule Probabilities',
        tech: 'Dirac Notation UI',
        category: 'Measurement Readout',
        metric: 'P(|0⟩) = |α|², P(|1⟩) = |β|²',
        summary: 'Displays exact measurement collapse probabilities for computational basis states |0⟩ and |1⟩ alongside quantum phase angle.',
        decision:
          'Why live Born rule probability bars? Reinforces the core quantum principle that measurement yields probabilistic collapse proportional to amplitude squared.',
        tradeoff:
          'Must handle floating-point precision rounding near 0.0 and 1.0 boundary states.',
        contract: 'Statevector ➔ Probability Breakdown & Dirac Expression',
      },
    ],
  },

  // InterviewMaster (id: 6)
  6: {
    headline: 'Adaptive Spaced Repetition & Interview Practice Pipeline',
    latency: 'Instant local execution & telemetry',
    throughput: 'Algorithmic spaced retention intervals',
    nodes: [
      {
        id: 'deck_select',
        step: '01',
        name: 'Curated Question Deck',
        tech: 'Topic Bank Workspace',
        category: 'Interface Layer',
        metric: '100+ vetted topics',
        summary: 'Allows candidates to choose topics (Algorithms, System Design, Behavioral) and launches timed practice sessions.',
        decision:
          'Why categorized question banks? Enables targeted drilling on weak topic areas rather than overwhelming candidates with random questions.',
        tradeoff:
          'Question bank taxonomy needs regular curation to stay aligned with current tech hiring patterns.',
        contract: 'Selected Category & Difficulty ➔ Active Session Deck',
      },
      {
        id: 'timer_controller',
        step: '02',
        name: 'Session State & Timer',
        tech: 'React Hooks + Local Storage',
        category: 'State Management',
        metric: 'Millisecond precision',
        summary: 'Manages countdown timers simulating real technical interview pressure, with auto-save for mock answers.',
        decision:
          'Why client-side persistence? Keeps mock interview progress safe even if the browser tab is accidentally refreshed or connection drops.',
        tradeoff:
          'Browser local storage capacity limits storing extensive multimedia recordings.',
        contract: 'Active Timer Events ➔ Session State Object',
      },
      {
        id: 'spaced_repetition',
        step: '03',
        name: 'SM-2 Repetition Engine',
        tech: 'SuperMemo Algorithmic Engine',
        category: 'Algorithm Engine',
        metric: 'Optimal review interval',
        summary: 'Calculates next review dates based on candidate self-rating (Again, Hard, Good, Easy) using the SM-2 retention formula.',
        decision:
          'Why SM-2 algorithm? Mathematically proven to maximize long-term memory retention with minimal review sessions by combating the Ebbinghaus forgetting curve.',
        tradeoff:
          'Requires regular user engagement for optimal scheduling accuracy.',
        contract: 'Confidence Rating (1-5) ➔ Next Review Interval (Days)',
      },
      {
        id: 'readiness_analytics',
        step: '04',
        name: 'Readiness Telemetry',
        tech: 'Mastery Score & SVG Gauges',
        category: 'Telemetry UI',
        metric: 'Dynamic readiness index',
        summary: 'Aggregates topic mastery percentages, question completion rates, and average time-per-question telemetry.',
        decision:
          'Why visual mastery gauges? Clear visual feedback reinforces dopamine loops and provides concrete confidence indicators before real interview day.',
        tradeoff:
          'Mastery score is self-reported, requiring clear evaluation criteria to prevent over-optimism.',
        contract: 'Session History ➔ Topic Mastery Percentage & Readiness Rating',
      },
    ],
  },

  // WealthSync (id: 7)
  7: {
    headline: 'Full-Stack Financial Ledger, Analytics & Security Pipeline',
    latency: '< 25ms database transaction',
    throughput: 'ACID-compliant double entry records',
    nodes: [
      {
        id: 'dashboard_ui',
        step: '01',
        name: 'Financial Dashboard UI',
        tech: 'React + Responsive Charts',
        category: 'Client Application',
        metric: 'Dynamic visual reports',
        summary: 'Interactive personal budgeting dashboard with income/expense logging, category filters, and monthly trend graphs.',
        decision:
          'Why client-side charting? Chart rendering provides smooth canvas-based animation with minimal bundle weight, keeping initial page load under 1.5s.',
        tradeoff:
          'Client state must be kept strictly synced with backend financial balances.',
        contract: 'User Action (Add Expense) ➔ API Request Payload',
      },
      {
        id: 'auth_gateway',
        step: '02',
        name: 'FastAPI Auth Gateway',
        tech: 'FastAPI + OAuth2 JWT',
        category: 'Security & API',
        metric: 'Stateless token check',
        summary: 'Verifies cryptographic signatures on JWT access tokens and enforces strict role-based access control per account.',
        decision:
          'Why JWT over session cookies? Stateless authentication allows horizontal scaling across serverless API workers without sticky sessions.',
        tradeoff:
          'Token revocation requires a fast token blacklist check in Redis or short token lifetimes with refresh token rotation.',
        contract: 'Authorization: Bearer <JWT> ➔ Validated User Session',
      },
      {
        id: 'analytics_engine',
        step: '03',
        name: 'Budget Analytics Engine',
        tech: 'Python Ledger Logic',
        category: 'Business Logic',
        metric: 'Real-time category math',
        summary: 'Calculates monthly burn rates, categorical spending distribution percentages, and triggers threshold budget alerts.',
        decision:
          'Why server-side calculation? Keeps financial math authoritative, eliminating discrepancies caused by client timezone or rounding issues.',
        tradeoff:
          'Adds minor compute overhead per transaction insert, optimized with indexed summary queries.',
        contract: 'Transaction Records ➔ Aggregated Monthly Budget Health Object',
      },
      {
        id: 'postgres_ledger',
        step: '04',
        name: 'PostgreSQL Relational DB',
        tech: 'PostgreSQL ACID Engine',
        category: 'Persistent Storage',
        metric: 'Strict ledger integrity',
        summary: 'Stores double-entry transaction records, user ledgers, and budget categories with foreign key constraints.',
        decision:
          'Why PostgreSQL over NoSQL? Financial ledgers strictly demand ACID transactional guarantees (no phantom balance updates or orphaned categories).',
        tradeoff:
          'Schema migrations require structured Alembic versioning rather than flexible schemaless documents.',
        contract: 'SQL Insert / Update ➔ Confirmed Ledger State',
      },
      {
        id: 'reports_export',
        step: '05',
        name: 'Visual Reports & Export',
        tech: 'CSV / JSON Data Exporter',
        category: 'Reporting Engine',
        metric: 'Streaming export delivery',
        summary: 'Generates formatted spending breakdown charts, budget surplus/deficit gauges, and exportable financial reports.',
        decision:
          'Why instant export? Gives users complete data sovereignty over their personal financial records at any time.',
        tradeoff:
          'Large transaction history exports stream in chunks to avoid memory spikes.',
        contract: 'Ledger Query ➔ Export File Stream / Visual Summary Dashboard',
      },
    ],
  },
};

export const getProjectArchitecture = (projectId) => {
  return projectsArchitectureData[projectId] || null;
};
