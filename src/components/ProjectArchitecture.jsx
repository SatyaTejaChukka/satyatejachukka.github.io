import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Workflow,
  Zap,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Activity,
  Clock,
} from 'lucide-react';
import { hapticLight } from '../utils/mobile';
import { getProjectArchitecture } from '../data/projectArchitectureData';

/* -------------------------------------------------------------
   INLINE DRAWER (Renders on the Project Card)
------------------------------------------------------------- */
export const ProjectArchitectureDrawer = ({
  project,
  isExpanded,
  onOpenModal,
}) => {
  const arch = getProjectArchitecture(project?.id);
  const [selectedNodeIdx, setSelectedNodeIdx] = useState(0);

  if (!arch) return null;

  const activeNode = arch.nodes[selectedNodeIdx] || arch.nodes[0];

  return (
    <AnimatePresence>
      {isExpanded && (
        <motion.div
          className="project-arch-drawer"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Headline & Quick Metrics */}
          <div className="arch-drawer-header">
            <div className="arch-drawer-title-area">
              <span className="arch-drawer-pill">
                <Workflow size={13} className="text-[var(--primary)]" />
                System Pipeline
              </span>
              <h4 className="arch-drawer-headline">{arch.headline}</h4>
            </div>

            <button
              type="button"
              className="arch-inspect-btn"
              onClick={onOpenModal}
              title="Inspect interactive architecture in modal"
            >
              <span>Full Pipeline</span>
              <ArrowRight size={13} />
            </button>
          </div>

          {/* Visual Node Flow Strip with Animated Glowing Energy Packets */}
          <div className="arch-pipeline-strip">
            <div className="arch-pipeline-track">
              {arch.nodes.map((node, idx) => {
                const isActive = idx === selectedNodeIdx;
                const isLast = idx === arch.nodes.length - 1;

                return (
                  <React.Fragment key={node.id}>
                    <button
                      type="button"
                      className={`arch-node-chip ${isActive ? 'arch-node-chip--active' : ''}`}
                      onClick={() => {
                        setSelectedNodeIdx(idx);
                        hapticLight();
                      }}
                      title={`${node.step}. ${node.name} (${node.tech})`}
                    >
                      <span className="arch-node-step">{node.step}</span>
                      <div className="arch-node-info">
                        <span className="arch-node-name">{node.name}</span>
                        <span className="arch-node-tech">{node.tech}</span>
                      </div>
                    </button>

                    {!isLast && (
                      <div className="arch-node-connector" aria-hidden="true">
                        <div className="arch-connector-line" />
                        <div className="arch-connector-packet" />
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Inline Node Micro-Inspector */}
          {activeNode && (
            <motion.div
              key={activeNode.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="arch-inline-inspector"
            >
              <div className="arch-inline-meta">
                <span className="arch-inline-badge">{activeNode.category}</span>
                <span className="arch-inline-metric">
                  <Zap size={11} className="text-amber-400" />
                  {activeNode.metric}
                </span>
              </div>
              <p className="arch-inline-summary">{activeNode.summary}</p>
              <div className="arch-inline-decision">
                <span className="arch-decision-label">Design Choice:</span>
                <span className="arch-decision-text">{activeNode.decision}</span>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/* -------------------------------------------------------------
   MODAL TAB COMPONENT (Renders inside Case Study Modal)
------------------------------------------------------------- */
export const ProjectArchitectureModalTab = ({ project }) => {
  const arch = getProjectArchitecture(project?.id);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const diagramScrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Drag-to-scroll state
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeftPos = useRef(0);
  const hasMoved = useRef(false);

  const checkScrollBounds = useCallback(() => {
    const el = diagramScrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 8);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 8);
  }, []);

  // Handle horizontal mouse wheel rolling
  useEffect(() => {
    const el = diagramScrollRef.current;
    if (!el) return;

    checkScrollBounds();

    const handleWheel = (e) => {
      // If there is horizontal overflow in the pipeline strip
      if (el.scrollWidth > el.clientWidth) {
        // Vertical wheel roll (deltaY) converts into horizontal scroll!
        if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
          const canLeft = el.scrollLeft > 0;
          const canRight = el.scrollLeft < el.scrollWidth - el.clientWidth - 2;

          if ((e.deltaY > 0 && canRight) || (e.deltaY < 0 && canLeft)) {
            e.preventDefault();
            e.stopPropagation();
            el.scrollLeft += e.deltaY * 1.5;
            checkScrollBounds();
          }
        }
      }
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    el.addEventListener('scroll', checkScrollBounds, { passive: true });
    window.addEventListener('resize', checkScrollBounds);

    return () => {
      el.removeEventListener('wheel', handleWheel);
      el.removeEventListener('scroll', checkScrollBounds);
      window.removeEventListener('resize', checkScrollBounds);
    };
  }, [checkScrollBounds]);

  const scrollByAmount = (amount) => {
    const el = diagramScrollRef.current;
    if (!el) return;
    el.scrollBy({ left: amount, behavior: 'smooth' });
    setTimeout(checkScrollBounds, 320);
  };

  const handleMouseDown = (e) => {
    if (e.button !== 0) return;
    const el = diagramScrollRef.current;
    if (!el) return;
    isDragging.current = true;
    hasMoved.current = false;
    startX.current = e.pageX - el.offsetLeft;
    scrollLeftPos.current = el.scrollLeft;
  };

  const handleMouseMove = (e) => {
    if (!isDragging.current) return;
    const el = diagramScrollRef.current;
    if (!el) return;
    const x = e.pageX - el.offsetLeft;
    const walk = (x - startX.current) * 1.5;
    if (Math.abs(walk) > 4) {
      hasMoved.current = true;
      e.preventDefault();
    }
    el.scrollLeft = scrollLeftPos.current - walk;
    checkScrollBounds();
  };

  const handleMouseUpOrLeave = () => {
    isDragging.current = false;
  };

  const selectNode = (idx, e) => {
    if (hasMoved.current) {
      hasMoved.current = false;
      return;
    }
    setSelectedIdx(idx);
    hapticLight();
    // Center the selected node smoothly
    if (e?.currentTarget) {
      e.currentTarget.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest',
      });
    }
  };

  if (!arch) {
    return (
      <div className="arch-modal-empty">
        <p>Architecture diagrams are being configured for this project.</p>
      </div>
    );
  }

  const activeNode = arch.nodes[selectedIdx] || arch.nodes[0];

  return (
    <div className="arch-modal-container" data-lenis-prevent="true">
      {/* Top Banner */}
      <div className="arch-modal-hero">
        <div className="arch-modal-hero-left">
          <div className="arch-modal-tag">
            <Workflow size={14} className="text-[var(--primary)]" />
            <span>Interactive Data Pipeline & Backend Architecture</span>
          </div>
          <h3 className="arch-modal-title">{arch.headline}</h3>
        </div>

        <div className="arch-modal-hero-metrics">
          <div className="arch-hero-metric-item">
            <span className="arch-hero-metric-label">Latency Profile</span>
            <span className="arch-hero-metric-val">{arch.latency}</span>
          </div>
          <div className="arch-hero-metric-item">
            <span className="arch-hero-metric-label">Throughput / Engine</span>
            <span className="arch-hero-metric-val">{arch.throughput}</span>
          </div>
        </div>
      </div>

      {/* Horizontal Interactive Pipeline Visualizer */}
      <div className="arch-modal-diagram">
        <div className="arch-diagram-shell">
          {canScrollLeft && (
            <button
              type="button"
              className="arch-nav-arrow arch-nav-arrow-left"
              onClick={() => scrollByAmount(-220)}
              aria-label="Scroll pipeline left"
              title="Scroll left"
            >
              <ChevronLeft size={18} />
            </button>
          )}

          <div
            ref={diagramScrollRef}
            className="arch-modal-diagram-scroll"
            data-lenis-prevent="true"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUpOrLeave}
            onMouseLeave={handleMouseUpOrLeave}
          >
            <div className="arch-modal-pipeline">
              {arch.nodes.map((node, idx) => {
                const isActive = idx === selectedIdx;
                const isLast = idx === arch.nodes.length - 1;

                return (
                  <React.Fragment key={node.id}>
                    <button
                      type="button"
                      className={`arch-modal-node-card ${isActive ? 'arch-modal-node-card--active' : ''}`}
                      onClick={(e) => selectNode(idx, e)}
                    >
                      <div className="arch-modal-node-top">
                        <span className="arch-modal-node-step">{node.step}</span>
                        <span className="arch-modal-node-cat">{node.category}</span>
                      </div>

                      <h4 className="arch-modal-node-name">{node.name}</h4>
                      <span className="arch-modal-node-tech-badge">{node.tech}</span>

                      <div className="arch-modal-node-footer">
                        <span className="arch-modal-node-metric">
                          <Zap size={11} className="text-amber-400" />
                          {node.metric}
                        </span>
                        {isActive && (
                          <span className="arch-modal-node-pulse" aria-hidden="true" />
                        )}
                      </div>
                    </button>

                    {!isLast && (
                      <div className="arch-modal-connector" aria-hidden="true">
                        <div className="arch-modal-connector-line" />
                        <div className="arch-modal-packet" />
                        <ChevronRight size={14} className="arch-modal-connector-arrow" />
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {canScrollRight && (
            <button
              type="button"
              className="arch-nav-arrow arch-nav-arrow-right"
              onClick={() => scrollByAmount(220)}
              aria-label="Scroll pipeline right"
              title="Scroll right"
            >
              <ChevronRight size={18} />
            </button>
          )}
        </div>
        <div className="arch-scroll-hint" aria-hidden="true">
          <span className="arch-scroll-hint-desktop">💡 Mouse wheel or drag to scroll horizontally · Click any node to inspect</span>
          <span className="arch-scroll-hint-mobile">👆 Swipe horizontally to explore pipeline · Tap node to inspect</span>
        </div>
      </div>

      {/* Deep Node Inspector Panel */}
      <AnimatePresence mode="wait">
        {activeNode && (
          <motion.div
            key={activeNode.id}
            className="arch-inspector-card glass-panel"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
          >
            <div className="arch-inspector-header">
              <div className="arch-inspector-title-group">
                <span className="arch-inspector-step-pill">
                  STEP {activeNode.step} · {activeNode.category.toUpperCase()}
                </span>
                <h4 className="arch-inspector-title">
                  {activeNode.name}
                  <span className="arch-inspector-tech-tag">{activeNode.tech}</span>
                </h4>
              </div>

              <div className="arch-inspector-stat-pill">
                <Clock size={13} className="text-[var(--primary)]" />
                <span>{activeNode.metric}</span>
              </div>
            </div>

            <p className="arch-inspector-summary">{activeNode.summary}</p>

            <div className="arch-inspector-grid">
              {/* Engineering Decision Box */}
              <div className="arch-inspector-box arch-inspector-decision">
                <div className="arch-box-title">
                  <Sparkles size={14} className="text-[var(--primary)]" />
                  <h5>Architectural Decision & Rationale</h5>
                </div>
                <p className="arch-box-content">{activeNode.decision}</p>
              </div>

              {/* Performance & Trade-offs Box */}
              <div className="arch-inspector-box arch-inspector-tradeoff">
                <div className="arch-box-title">
                  <ShieldCheck size={14} className="text-purple-400" />
                  <h5>Latency & Trade-off Consideration</h5>
                </div>
                <p className="arch-box-content">{activeNode.tradeoff}</p>
              </div>
            </div>

            {/* Data Contract / Interface */}
            {activeNode.contract && (
              <div className="arch-inspector-contract">
                <span className="arch-contract-label">
                  <Activity size={13} className="text-[var(--primary)]" />
                  Data Contract & Transformation Flow
                </span>
                <code className="arch-contract-code">{activeNode.contract}</code>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
