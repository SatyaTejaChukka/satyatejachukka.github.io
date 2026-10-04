import React, { useState, useRef } from 'react';
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
} from 'framer-motion';
import { Briefcase, Calendar } from 'lucide-react';
import SpotlightCard from './SpotlightCard';


/* ------------------ Data ------------------ */

const experiences = [
  {
    id: 1,
    role: 'Machine Learning Intern',
    company: 'Crescout.ai',
    period: 'Mar 2025 - Present',
    description:
      'Contributed to an AI-powered badminton analytics platform by training ResNet and MobileNet computer vision models for court detection, achieving 99.66% pixel accuracy on 200+ annotated gameplay frames. Worked on LSTM and BiLSTM + Attention-based sequence models for shot analysis, rally classification, next-shot prediction, and winning probability estimation. Built automated Kaggle and Google Drive workflows for remote video-processing and match analytics pipelines.'
  },
  {
    id: 2,
    role: 'B.Tech in CSE (AI & ML)',
    company: 'Gayatri Vidya Parishad College of Engineering',
    period: '2023 - Present',
    description:
      'CGPA: 8.79. Coursework: DSA, Computer Networks, OS, DBMS, OOP, ML, Probability & Statistics.',
  },
  {
    id: 3,
    role: 'Intermediate - MPC',
    company: 'Sasi Junior College',
    period: '2021 - 2023',
    description:
      'Completed intermediate education with Mathematics, Physics, and Chemistry as core subjects.',
  },
  {
    id: 4,
    role: 'Schooling',
    company: 'Gnanodaya R.C.M High School',
    period: '2014 - 2021',
    description:
      'Completed primary and secondary education with a strong foundation in academics.',
  },


  // {
  //   id: 4,
  //   role: 'Member',
  //   company: 'Rotaract Club',
  //   period: 'Aug 2024 - Present',
  //   description:
  //     'Organized and participated in multiple community events, building teamwork and leadership skills.',
  // },
  // {
  //   id: 5,
  //   role: 'Certifications',
  //   company: 'IBM & Coursera',
  //   period: '2024',
  //   description:
  //     'Python Basics for Data Science (IBM), Supervised Machine Learning (Coursera).',
  // },
];

/* ------------------ Variants ------------------ */

/* ------------------ Variants ------------------ */

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15 },
  },
};

const itemVariants = {
  hidden: (direction) => ({
    opacity: 0,
    y: 30,
    x: direction > 0 ? 30 : -30,
    scale: 0.98,
  }),
  visible: {
    opacity: 1,
    y: 0,
    x: 0,
    scale: 1,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
};

const dotVariants = {
  hidden: { scale: 0 },
  visible: {
    scale: 1,
    transition: { type: 'spring', stiffness: 260, damping: 20 },
  },
  active: {
    scale: 1.15,
    boxShadow: '0 0 25px rgba(0, 243, 255, 0.6)',
  },
  hover: {
    scale: 1.25,
    boxShadow: '0 0 20px rgba(0, 243, 255, 0.6)',
  },
};

const cardVariants = {
  hidden: {
    opacity: 0,
    y: 15,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: 'easeOut' },
  },
  hover: {
    boxShadow: '0 16px 40px rgba(0, 243, 255, 0.2)',
  },
};

/* ------------------ Timeline Item ------------------ */

const TimelineItem = ({
  exp,
  index,
  isActive,
  hoveredId,
  setHoveredId,
}) => {
  const isRight = index % 2 !== 0;
  const direction = isRight ? 1 : -1;

  return (
    <motion.article
      className="timeline-item"
      variants={itemVariants}
      custom={direction}
      style={{ flexDirection: isRight ? 'row' : 'row-reverse' }}
      onHoverStart={() => setHoveredId(exp.id)}
      onHoverEnd={() => setHoveredId(null)}
      viewport={{ once: true, amount: 0.3 }}
    >
      {/* Dot */}
      <motion.div
        className="timeline-dot"
        variants={dotVariants}
        initial="hidden"
        whileInView="visible"
        animate={hoveredId === exp.id || isActive ? 'active' : 'visible'}
        whileHover="hover"
      >
        <span className="timeline-dot-ring" />
      </motion.div>

      <div style={{ flex: 1 }} />

      {/* Card */}
      <motion.div className="timeline-content">
        <SpotlightCard color="rgba(189, 0, 255, 0.12)" className="timeline-card-spotlight">
          <motion.div
            className="glass-panel p-6 rounded-xl timeline-card"
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            whileHover="hover"
            whileTap={{ scale: 0.98 }}
            viewport={{ once: true, amount: 0.3 }}
          >
            <div className="timeline-card-header">
              <div className="timeline-company">
                <Briefcase size={18} />
                <span>{exp.company}</span>
              </div>
              <div className="timeline-period">
                <Calendar size={14} />
                <span>{exp.period}</span>
              </div>
            </div>

            <h3 className="timeline-role">{exp.role}</h3>
            <div className="timeline-description modern-text">{exp.description}</div>
          </motion.div>
        </SpotlightCard>
      </motion.div>
    </motion.article>
  );
};

/* ------------------ Main Component ------------------ */

const Experience = () => {
  const timelineRef = useRef(null);
  const [hoveredId, setHoveredId] = useState(null);
  const activeId = experiences[0]?.id ?? null;

  /* ✅ Scroll-linked timeline line */
  const { scrollYProgress } = useScroll({
    target: timelineRef,
    offset: ['start end', 'end start'],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 24,
    mass: 0.3,
  });

  const lineHeight = useTransform(
    smoothProgress,
    (v) => `${v * 100}%`
  );

  return (
    <section id="experience" className="section relative bg-[var(--bg-dark)]">
      <div className="container relative">
        <motion.h2
          className="section-title"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          Education & <span className="text-gradient">Experience</span>
        </motion.h2>

        <motion.div
          ref={timelineRef}
          className="timeline"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {/* ✅ Animated Timeline Glow Line */}
          <motion.div
            className="timeline-line-gradient"
            style={{
              height: lineHeight,
              boxShadow: '0 0 30px rgba(0,243,255,0.75)',
            }}
          />

          {experiences.map((exp, index) => (
            <TimelineItem
              key={exp.id}
              exp={exp}
              index={index}
              hoveredId={hoveredId}
              setHoveredId={setHoveredId}
              isActive={activeId === exp.id}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Experience;