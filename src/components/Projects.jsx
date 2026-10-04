import React, { useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, Github, X, Workflow, FileText, ChevronDown } from 'lucide-react';
import LazyImage from './LazyImage';
import SpotlightCard from './SpotlightCard';
import { hapticLight } from '../utils/mobile';
import { useIsTouchDevice, useIsMobileNav } from '../hooks/useMobile';
import { ProjectArchitectureModalTab } from './ProjectArchitecture';


/* ------------------ Animation Variants ------------------ */

const gridVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

// Desktop: animate on scroll with opacity
const cardVariantsDesktop = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

// Mobile: lighter scroll-in animation
const cardVariantsMobile = {
  hidden: {
    opacity: 0,
    y: 12,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.35,
      ease: 'easeOut',
    },
  },
};


/* ------------------ Data ------------------ */

const projectsData = [
  /* ---------- AI / ML Projects ---------- */

  {
    id: 1,
    title: 'StrokeRiskAI',
    category: 'AI/ML',
    image: '/projects/stroke-prediction.png',
    fallbackEmoji: '🧠',
    description:
      'A comprehensive machine learning application that predicts stroke risk by analyzing patient health data including age, hypertension, heart disease, glucose levels, and BMI. Features include interactive data visualization, model comparison (Random Forest, XGBoost, Logistic Regression), and a REST API built with FastAPI for real-time predictions.',
    features: ['Risk Assessment Dashboard', 'Multiple ML Models', 'Real-time Predictions', 'Data Visualization'],
    tech: ['Python', 'Pandas', 'Numpy', 'FastAPI', 'Scikit-learn', 'Machine Learning'],
    github: 'https://github.com/SatyaTejaChukka/stroke-prediction',
    demo: 'https://stroke-prediction-five.vercel.app/',
    screenshots: ['/projects/stroke-prediction.png'],
    caseStudy: {
      summary:
        'ML-driven web app that estimates stroke risk and compares model performance with a production-ready API.',
      problem:
        'Provide an accessible, reliable way to assess stroke risk from multiple health indicators with clear model insights.',
      solution:
        'Built a data pipeline, trained multiple classifiers, exposed a FastAPI prediction endpoint, and designed a dashboard for model comparison.',
      impact:
        'Enables fast, transparent risk assessment with measurable accuracy and explainable feature inputs.',
      role: 'End-to-end delivery: data prep, model training, API design, and UI.',
      highlights: ['Model benchmarking', 'Real-time API scoring', 'Insightful visualizations'],
    },
  },
  {
    id: 2,
    title: 'Boston House Price Prediction',
    category: 'AI/ML',
    image: '/projects/house-price.png',
    fallbackEmoji: '🏠',
    description:
      'An end-to-end regression-based ML project that predicts Boston house prices using features like crime rate, number of rooms, property tax, and proximity to employment centers. Implements feature engineering, cross-validation, and hyperparameter tuning with a Flask web interface for user-friendly predictions.',
    features: ['Feature Engineering', 'Cross-Validation', 'Interactive Web UI', 'Model Explainability'],
    tech: ['Python', 'Pandas', 'Numpy', 'Flask', 'Scikit-learn', 'Regression'],
    github: 'https://github.com/SatyaTejaChukka/bostonhousepricing',
    demo: 'https://bostonhousepricing-qi28.onrender.com/',
    screenshots: ['/projects/house-price.png'],
    caseStudy: {
      summary:
        'Regression pipeline with a clean Flask UI to predict housing prices from key market features.',
      problem:
        'Accurately estimate house prices while keeping the experience understandable for non-technical users.',
      solution:
        'Engineered features, tuned models with cross-validation, and shipped a lightweight web interface for instant predictions.',
      impact:
        'Improved prediction quality and packaged insights into a simple, usable tool.',
      role: 'Modeling, tuning, API integration, and frontend integration.',
      highlights: ['Feature engineering', 'Cross-validation', 'User-friendly UI'],
    },
  },
  {
    id: 3,
    title: 'CrashGuard AI',
    category: 'AI/ML',
    image: '/projects/traffic-accident.png',
    fallbackEmoji: '🚦',
    description:
      'A predictive analytics system that forecasts traffic accident severity using historical data including weather conditions, road characteristics, time of day, and location. Utilizes ensemble methods and feature importance analysis to identify key risk factors for road safety improvement.',
    features: ['Severity Classification', 'Weather Integration', 'Geospatial Analysis', 'Risk Factor Identification'],
    tech: ['Python', 'Pandas', 'FastAPI', 'Scikit-learn', 'Machine Learning'],
    github: 'https://github.com/SatyaTejaChukka/traffic-accident',
    demo: 'https://traffic-accident-mauve.vercel.app/',
    screenshots: ['/projects/traffic-accident.png'],
    caseStudy: {
      summary:
        'Predictive system that classifies traffic accident severity using historical and environmental features.',
      problem:
        'Identify which conditions most influence accident severity to improve road safety planning.',
      solution:
        'Built ensemble models, analyzed feature importance, and surfaced risk drivers through an API-backed interface.',
      impact:
        'Highlights high-risk scenarios and supports data-informed safety interventions.',
      role: 'Model development, evaluation, and API delivery.',
      highlights: ['Severity classification', 'Weather-aware modeling', 'Risk factor analysis'],
    },
  },
  {
    id: 8,
    title: 'TubeRAG',
    category: 'AI/ML',
    image: '/projects/youtube-rag.png',
    fallbackEmoji: '📺',
    description:
      'A privacy-first Retrieval-Augmented Generation application for asking natural language questions about YouTube channels, playlists, and videos. It extracts transcripts, creates semantic embeddings, and returns grounded answers with clickable citations that jump to the exact timestamp in the source video.',
    features: ['YouTube Source Ingestion', 'Timestamp Citations', 'Local Embeddings', 'Hybrid BYOK AI'],
    tech: ['React', 'TypeScript', 'FastAPI', 'ChromaDB', 'SentenceTransformers', 'Groq', 'Ollama'],
    github: 'https://github.com/SatyaTejaChukka/youtube-rag',
    demo: 'https://youtube-rag-two.vercel.app/',
    screenshots: ['/projects/youtube-rag.png'],
    caseStudy: {
      summary:
        'Privacy-first RAG application that turns YouTube content into a searchable, citation-backed knowledge base.',
      problem:
        'Finding specific information in long videos is slow, and answers from generic AI tools may not be grounded in the source content.',
      solution:
        'Built a transcript ingestion pipeline with local embeddings, vector search, and Groq or Ollama generation, then surfaced clickable timestamp citations in the chat experience.',
      impact:
        'Makes long-form video research faster while keeping user API keys in the browser and answers tied to their original sources.',
      role: 'Full-stack architecture, RAG pipeline, privacy model, and user experience.',
      highlights: ['Channel and playlist indexing', 'Grounded timestamp citations', 'Groq and local Ollama support'],
    },
  },

    /* ---------- Web / Frontend Projects ---------- */

  {
    id: 4,
    title: 'Namaste to ICD-11 Mapping',
    category: 'Web',
    image: '/projects/namaste-icd.png',
    fallbackEmoji: '🩺',
    description:
      'A healthcare data processing solution that maps Indian Namaste medical codes to international ICD-11 standards. Features fuzzy matching algorithms, hierarchical code traversal, and a PostgreSQL database for efficient querying. Designed to improve healthcare interoperability and standardization.',
    features: ['Fuzzy Matching', 'Hierarchical Mapping', 'Database Integration', 'API Documentation'],
    tech: ['Python', 'FastAPI', 'PostgreSQL', 'Data Processing', 'Healthcare Data'],
    github: 'https://github.com/SatyaTejaChukka/namaste_to_icd',
    demo: 'https://namaste-to-icd11.vercel.app/',
    screenshots: ['/projects/namaste-icd.png'],
    caseStudy: {
      summary:
        'Healthcare data mapper that aligns Namaste codes with ICD-11 using fuzzy matching and hierarchy traversal.',
      problem:
        'Local medical codes lack interoperability with global ICD-11 standards, slowing analytics and reporting.',
      solution:
        'Implemented fuzzy search, hierarchical resolution, and a PostgreSQL-backed API to deliver accurate mappings.',
      impact:
        'Accelerates code normalization and improves downstream clinical data quality.',
      role: 'Backend architecture, data processing, and API documentation.',
      highlights: ['Fuzzy matching', 'Hierarchical resolution', 'PostgreSQL optimization'],
    },
  },
  {
    id: 5,
    title: 'Bloch Path Explorer',
    category: 'Web',
    image: '/projects/bloch-sphere.png',
    fallbackEmoji: '⚛️',
    description:
      'An interactive 3D visualization tool for exploring quantum computing concepts through Bloch sphere representations. Allows users to manipulate qubit states, apply quantum gates, and observe state transformations in real-time using Three.js for rendering and Qiskit for quantum simulations.',
    features: ['3D Visualization', 'Quantum Gate Operations', 'Multi-Qubit Support', 'Educational Tooltips'],
    tech: ['React', 'JavaScript', 'Three.js', 'Qiskit'],
    github: 'https://github.com/SatyaTejaChukka/bloch-path-explorer',
    demo: 'https://bloch-path-explorer.vercel.app/',
    screenshots: ['/projects/bloch-sphere.png'],
    caseStudy: {
      summary:
        'Interactive 3D Bloch sphere for visualizing qubit states and quantum gate transformations.',
      problem:
        'Quantum state transformations are hard to grasp without strong visual intuition.',
      solution:
        'Combined Three.js rendering with Qiskit simulations to let users manipulate and observe qubit changes in real time.',
      impact:
        'Turns abstract quantum concepts into an intuitive, hands-on learning experience.',
      role: '3D visualization, state simulation, and UX design.',
      highlights: ['Real-time 3D controls', 'Gate visualization', 'Educational tooltips'],
    },
  },
  {
    id: 6,
    title: 'InterviewMaster',
    category: 'Web',
    image: '/projects/interview-master.png',
    fallbackEmoji: '🎤',
    description:
      'A comprehensive interview preparation platform that helps users organize questions by category, track their preparation progress, and practice with timed mock sessions. Features include customizable question banks, performance analytics, and spaced repetition for effective learning.',
    features: ['Question Bank', 'Progress Tracking', 'Mock Interviews', 'Performance Analytics'],
    tech: ['React', 'JavaScript', 'Frontend Development'],
    github: 'https://github.com/SatyaTejaChukka/interviewmaster',
    demo: 'https://interviewmaster-seven.vercel.app/',
    screenshots: ['/projects/interview-master.png'],
    caseStudy: {
      summary:
        'Interview prep platform that organizes practice questions and tracks readiness over time.',
      problem:
        'Candidates struggle to structure preparation and measure progress consistently.',
      solution:
        'Built a categorized question bank, timed practice mode, and analytics to guide daily prep.',
      impact:
        'Creates a repeatable workflow and improves prep consistency.',
      role: 'Frontend architecture, UX design, and progress tracking.',
      highlights: ['Question banks', 'Mock interview timer', 'Progress analytics'],
    },
  },
  {
    id: 7,
    title: 'WealthSync',
    category: 'Web',
    image: '/projects/wealthsync.png',
    fallbackEmoji: '💰',
    description:
      'A full-stack personal finance application for tracking income, expenses, and budgets with visual reports. Features include transaction categorization, monthly spending analysis, budget goal setting, and data export capabilities. Built with a FastAPI backend and PostgreSQL for secure data storage.',
    features: ['Expense Tracking', 'Budget Goals', 'Visual Reports', 'Data Export'],
    tech: ['React', 'JavaScript', 'FastAPI', 'PostgreSQL', 'Frontend Development'],
    github: 'https://github.com/SatyaTejaChukka/money_manage',
    demo: 'https://wealthsync-lemon.vercel.app/',
    screenshots: ['/projects/wealthsync.png'],
    caseStudy: {
      summary:
        'Full-stack personal finance manager for tracking income, spending, and budgets with visual reports.',
      problem:
        'Personal budgeting tools often lack clarity and real-time insights.',
      solution:
        'Built a FastAPI + PostgreSQL backend with a React dashboard for categorization and monthly analysis.',
      impact:
        'Improves visibility into spending patterns and budget goals.',
      role: 'Backend integration, data modeling, and dashboard UI.',
      highlights: ['Expense categorization', 'Budget goals', 'Export-ready reports'],
    },
  },
];

const CATEGORIES = ['All', 'Web', 'AI/ML'];


/* ------------------ Component ------------------ */

const Projects = () => {
  const [filter, setFilter] = useState('All');
  // Use matchMedia-based hook instead of state — avoids re-rendering the entire
  // Projects component on every window resize event.
  const isMobile = useIsMobileNav();
  const isDesktop = !isMobile;
  const [selectedProject, setSelectedProject] = useState(null);
  const [modalTab, setModalTab] = useState('overview');
  const [activeShot, setActiveShot] = useState(0);
  const isTouch = useIsTouchDevice();
  const swipeStartX = useRef(0);

  const openCaseStudy = (project, initialTab = 'overview') => {
    setSelectedProject(project);
    setActiveShot(0);
    setModalTab(initialTab);
  };

  const closeCaseStudy = useCallback(() => {
    setSelectedProject(null);
  }, []);


  const filteredProjects =
    filter === 'All'
      ? projectsData
      : projectsData.filter((p) => p.category === filter);

  const caseStudy = selectedProject?.caseStudy ?? {};
  const screenshots =
    selectedProject?.screenshots?.length
      ? selectedProject.screenshots
      : selectedProject
        ? [selectedProject.image]
        : [];
  const highlightItems =
    caseStudy.highlights?.length
      ? caseStudy.highlights
      : selectedProject?.features ?? [];

  const advanceShot = useCallback((direction) => {
    if (screenshots.length <= 1) {
      return;
    }
    hapticLight();
    setActiveShot((prev) => {
      const next = (prev + direction + screenshots.length) % screenshots.length;
      return next;
    });
  }, [screenshots.length]);

  const handleGalleryTouchStart = (event) => {
    swipeStartX.current = event.touches[0]?.clientX ?? 0;
  };

  const handleGalleryTouchEnd = (event) => {
    if (screenshots.length <= 1) return;
    const endX = event.changedTouches[0]?.clientX ?? 0;
    const delta = endX - swipeStartX.current;
    if (Math.abs(delta) < 50) return;
    advanceShot(delta > 0 ? -1 : 1);
  };

  React.useEffect(() => {
    if (!selectedProject) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      const target = event.target;
      if (
        target instanceof HTMLElement &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }
      if (event.key === 'Escape') {
        closeCaseStudy();
      }
      if (event.key === 'ArrowRight' && screenshots.length > 1) {
        event.preventDefault();
        advanceShot(1);
      }
      if (event.key === 'ArrowLeft' && screenshots.length > 1) {
        event.preventDefault();
        advanceShot(-1);
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Stop Lenis smooth virtual scroll while modal is active
    if (window.__lenis) {
      window.__lenis.stop();
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow === 'hidden' ? '' : previousOverflow;
      if (window.__lenis) {
        window.__lenis.start();
      }
    };
  }, [selectedProject, screenshots.length, advanceShot, closeCaseStudy]);

  return (
    <section id="projects" className="section">
      <div className="container">
        {/* Title */}
        <motion.h2
          className="section-title"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          Featured <span className="text-gradient">Projects</span>
        </motion.h2>

        {/* Filters */}
        <div className={`filter-container ${!isDesktop ? 'filter-container--scroll' : ''}`}>
          {CATEGORIES.map((cat) => (
            <motion.button
              key={cat}
              onClick={() => {
                setFilter(cat);
                hapticLight();
              }}
              className={`filter-btn ${filter === cat ? 'active' : ''}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {cat}
            </motion.button>
          ))}
        </div>

        {/* Projects Grid */}
        {isDesktop ? (
          // Desktop: Animate on scroll
          <motion.div
            key={filter}
            className="projects-grid"
            variants={gridVariants}
            initial="hidden"
            animate="visible"
          >
            {filteredProjects.map((project, index) => (
              <SpotlightCard key={project.id} className="relative project-card glass-panel group">
              <motion.div
                variants={cardVariantsDesktop}
                initial="hidden"
                animate="visible"
                transition={{ delay: index * 0.08 }}
                className="h-full"
              >
                {/* Project Image with Lazy Loading */}
                <div className="project-img-container">
                  <LazyImage
                    width={600}
                    height={800}
                    src={project.image}
                    alt={`${project.title} screenshot`}
                    className="project-screenshot"
                    fallbackEmoji={project.fallbackEmoji}
                    wrapperClassName="project-img-wrapper"
                  />
                </div>

                {/* Base Content */}
                <div className="project-info">
                  <span className="text-xs font-bold text-[var(--primary)] mb-2 block">
                    {project.category.toUpperCase()}
                  </span>

                  <h3 className="project-title">
                    {project.title}
                  </h3>

                  <div className="project-description-wrapper">
                    <p className="text-[var(--text-muted)] text-sm project-description modern-text">
                      {project.description}
                    </p>
                    <span className="project-description-hint">Hover to read more</span>
                    <div className="project-description-full">
                      {project.description}
                    </div>
                  </div>

                  {/* Key Features */}
                  {project.features && (
                    <div className="project-features">
                      {project.features.map((feature) => (
                        <span key={feature} className="project-feature-tag">
                          ✓ {feature}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="project-tech-list">
                    {project.tech.map((t) => (
                      <span key={t} className="project-tech-pill">
                        {t}
                      </span>
                    ))}
                  </div>

                  <div className="project-actions">
                    <button
                      type="button"
                      className="project-action-btn case-study-btn"
                      onClick={() => openCaseStudy(project, 'overview')}
                      title="Open Case Study"
                    >
                      Case Study
                    </button>
                    <button
                      type="button"
                      className="project-action-btn arch-toggle-btn"
                      onClick={() => openCaseStudy(project, 'architecture')}
                      title="View System Architecture Pipeline"
                    >
                      <Workflow size={14} />
                      <span>Pipeline</span>
                    </button>
                    {project.demo && (
                      <a
                        href={project.demo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="project-action-btn"
                        title="View Live Demo"
                      >
                        <ExternalLink size={16} />
                        Live
                      </a>
                    )}

                    <a
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="project-action-btn"
                      title="View Source Code"
                    >
                      <Github size={16} />
                      Code
                    </a>
                  </div>
                </div>
              </motion.div>
              </SpotlightCard>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key={filter}
            className="projects-grid"
            variants={gridVariants}
            initial="hidden"
            animate="visible"
          >
            {filteredProjects.map((project, index) => (
              <SpotlightCard key={project.id} className="relative project-card glass-panel group project-card--touch">
              <motion.div
                variants={cardVariantsMobile}
                initial="hidden"
                animate="visible"
                transition={{ delay: index * 0.06 }}
                whileTap={{ scale: 0.98 }}
                className="h-full"
              >
                {/* Project Image with Lazy Loading */}
                <div className="project-img-container">
                  <LazyImage
                    width={600}
                    height={800}
                    src={project.image}
                    alt={`${project.title} screenshot`}
                    className="project-screenshot"
                    fallbackEmoji={project.fallbackEmoji}
                    wrapperClassName="project-img-wrapper"
                  />
                </div>

                {/* Base Content */}
                <div className="project-info">
                  <span className="text-xs font-bold text-[var(--primary)] mb-2 block">
                    {project.category.toUpperCase()}
                  </span>

                  <h3 className="project-title">
                    {project.title}
                  </h3>

                  <div className="project-description-wrapper">
                    <p className="text-[var(--text-muted)] text-sm project-description modern-text">
                      {project.description}
                    </p>
                    <span className="project-description-hint project-description-hint--pulse">
                      Tap to read more
                      {isTouch && <ChevronDown size={12} className="project-description-hint-chevron" />}
                    </span>
                    <div className="project-description-full">
                      {project.description}
                    </div>
                  </div>

                  {/* Key Features */}
                  {project.features && (
                    <div className="project-features">
                      {project.features.map((feature) => (
                        <span key={feature} className="project-feature-tag">
                          ✓ {feature}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="project-tech-list">
                    {project.tech.map((t) => (
                      <span key={t} className="project-tech-pill">
                        {t}
                      </span>
                    ))}
                  </div>

                  <div className="project-actions">
                    <button
                      type="button"
                      className="project-action-btn case-study-btn"
                      onClick={() => openCaseStudy(project, 'overview')}
                      title="Open Case Study"
                    >
                      Case Study
                    </button>
                    <button
                      type="button"
                      className="project-action-btn arch-toggle-btn"
                      onClick={() => openCaseStudy(project, 'architecture')}
                      title="View System Architecture Pipeline"
                    >
                      <Workflow size={14} />
                      <span>Pipeline</span>
                    </button>
                    {project.demo && (
                      <a
                        href={project.demo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="project-action-btn"
                        title="View Live Demo"
                      >
                        <ExternalLink size={16} />
                        Live
                      </a>
                    )}

                    <a
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="project-action-btn"
                      title="View Source Code"
                    >
                      <Github size={16} />
                      Code
                    </a>
                  </div>
                </div>
              </motion.div>
              </SpotlightCard>
            ))}
          </motion.div>
        )}
      </div>

      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {selectedProject && (
              <motion.div
                className="case-study-overlay"
                data-lenis-prevent="true"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={closeCaseStudy}
              >
                <motion.div
                  className="case-study-dialog"
                  data-lenis-prevent="true"
                  initial={{ opacity: 0, y: 20, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.98 }}
                  transition={{ duration: 0.25 }}
                  onClick={(event) => event.stopPropagation()}
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="case-study-title"
                >
                  <div className="case-study-header">
                    <div>
                      <span className="case-study-kicker">{selectedProject.category}</span>
                      <h3 className="case-study-title" id="case-study-title">
                        {selectedProject.title}
                      </h3>
                    </div>
                    <button
                      type="button"
                      className="case-study-close"
                      onClick={closeCaseStudy}
                      aria-label="Close case study"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  {/* Modal Tabs */}
                  <div className="case-study-nav-tabs" role="tablist">
                    <button
                      type="button"
                      role="tab"
                      aria-selected={modalTab === 'overview'}
                      className={`case-study-nav-tab ${modalTab === 'overview' ? 'active' : ''}`}
                      onClick={() => {
                        setModalTab('overview');
                        hapticLight();
                      }}
                    >
                      <FileText size={15} />
                      <span>Overview & Case Study</span>
                    </button>
                    <button
                      type="button"
                      role="tab"
                      aria-selected={modalTab === 'architecture'}
                      className={`case-study-nav-tab ${modalTab === 'architecture' ? 'active' : ''}`}
                      onClick={() => {
                        setModalTab('architecture');
                        hapticLight();
                      }}
                    >
                      <Workflow size={15} />
                      <span>System Architecture & Pipeline</span>
                      <span className="case-study-tab-badge">Interactive</span>
                    </button>
                  </div>

                  {modalTab === 'overview' ? (
                    <div className="case-study-body" data-lenis-prevent="true">
                      <div
                        className="case-study-gallery"
                        onTouchStart={handleGalleryTouchStart}
                        onTouchEnd={handleGalleryTouchEnd}
                      >
                        <div className="case-study-hero">
                          <LazyImage
                            src={screenshots[activeShot]}
                            alt={`${selectedProject.title} screenshot`}
                            className="case-study-hero-img"
                            fallbackEmoji={selectedProject.fallbackEmoji}
                            wrapperClassName="case-study-hero-wrapper"
                          />
                        </div>
                        {screenshots.length > 1 && (
                          <p className="case-study-swipe-hint" aria-hidden="true">
                            Swipe to browse screenshots
                          </p>
                        )}
                        {screenshots.length > 1 && (
                          <div className="case-study-thumbs">
                            {screenshots.map((shot, index) => (
                              <button
                                key={`${shot}-${index}`}
                                type="button"
                                className={`case-study-thumb ${index === activeShot ? 'active' : ''}`}
                                onClick={() => setActiveShot(index)}
                                aria-label={`View screenshot ${index + 1}`}
                              >
                                <img src={shot} alt="" />
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="case-study-details">
                        <p className="case-study-summary">
                          {caseStudy.summary || selectedProject.description}
                        </p>

                        <div className="case-study-meta">
                          <div className="case-study-meta-item">
                            <span className="case-study-meta-label">Category</span>
                            <span className="case-study-meta-value">
                              {selectedProject.category}
                            </span>
                          </div>
                          {caseStudy.role && (
                            <div className="case-study-meta-item">
                              <span className="case-study-meta-label">Role</span>
                              <span className="case-study-meta-value">{caseStudy.role}</span>
                            </div>
                          )}
                        </div>

                        {caseStudy.problem && (
                          <div className="case-study-section">
                            <h4 className="case-study-section-title">Problem</h4>
                            <p className="case-study-section-text">{caseStudy.problem}</p>
                          </div>
                        )}

                        {caseStudy.solution && (
                          <div className="case-study-section">
                            <h4 className="case-study-section-title">Solution</h4>
                            <p className="case-study-section-text">{caseStudy.solution}</p>
                          </div>
                        )}

                        {caseStudy.impact && (
                          <div className="case-study-section">
                            <h4 className="case-study-section-title">Impact</h4>
                            <p className="case-study-section-text">{caseStudy.impact}</p>
                          </div>
                        )}

                        {highlightItems.length > 0 && (
                          <div className="case-study-section">
                            <h4 className="case-study-section-title">Highlights</h4>
                            <div className="case-study-highlights">
                              {highlightItems.map((item) => (
                                <span key={item} className="case-study-highlight">
                                  {item}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="case-study-section">
                          <h4 className="case-study-section-title">Tech Stack</h4>
                          <div className="case-study-tech">
                            {selectedProject.tech.map((tech) => (
                              <span key={tech} className="project-tech-pill">
                                {tech}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="case-study-links">
                          {selectedProject.demo && (
                            <a
                              href={selectedProject.demo}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="project-action-btn"
                            >
                              <ExternalLink size={16} />
                              Live Demo
                            </a>
                          )}
                          {selectedProject.github && (
                            <a
                              href={selectedProject.github}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="project-action-btn"
                            >
                              <Github size={16} />
                              Source Code
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="case-study-body case-study-body--arch" data-lenis-prevent="true">
                      <ProjectArchitectureModalTab project={selectedProject} />
                    </div>
                  )}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}

    </section>
  );
};

export default Projects;
