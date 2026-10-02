import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import LazyImage from './LazyImage';
import profileImg from '../assets/profile.webp';
import { hapticLight } from '../utils/mobile';

const skillCategories = [
    {
        title: 'Languages',
        skills: [
            { name: 'Python', icon: 'devicon-python-plain colored' },
            { name: 'C++', icon: 'devicon-cplusplus-plain colored' },
            { name: 'C', icon: 'devicon-c-plain colored' },
            { name: 'SQL', icon: 'devicon-azuresqldatabase-plain colored' },
        ],
    },
    {
        title: 'Frameworks & Libraries',
        skills: [
            { name: 'FastAPI', icon: 'devicon-fastapi-plain colored' },
            { name: 'Flask', icon: 'devicon-flask-original' },
            { name: 'React', icon: 'devicon-react-original colored' },
            { name: 'Scikit-learn', icon: 'devicon-scikitlearn-plain colored' },
            { name: 'TensorFlow', icon: 'devicon-tensorflow-original colored' },
            { name: 'Keras', icon: 'devicon-keras-plain colored' },
            { name: 'Pandas', icon: 'devicon-pandas-plain' },
            { name: 'NumPy', icon: 'devicon-numpy-plain colored' },
        ],
    },
    {
        title: 'Cloud & DevOps',
        skills: [
            { name: 'Docker', icon: 'devicon-docker-plain colored' },
            { name: 'Git', icon: 'devicon-git-plain colored' },
            { name: 'GitHub', icon: 'devicon-github-original' },
        ],
    },
    {
        title: 'Frontend',
        skills: [
            { name: 'HTML', icon: 'devicon-html5-plain colored' },
            { name: 'CSS', icon: 'devicon-css3-plain colored' },
            { name: 'JavaScript', icon: 'devicon-javascript-plain colored' },
        ],
    },
    {
        title: 'Databases',
        skills: [
            { name: 'MySQL', icon: 'devicon-mysql-plain colored' },
            { name: 'SQLite', icon: 'devicon-sqlite-plain colored' },
            { name: 'PostgreSQL', icon: 'devicon-postgresql-plain colored' },
        ],
    },
    {
        title: 'Tools',
        skills: [
            { name: 'VS Code', icon: 'devicon-vscode-plain colored' },
            { name: 'PyCharm', icon: 'devicon-pycharm-plain colored' },
            { name: 'Jupyter', icon: 'devicon-jupyter-plain colored' },
            { name: 'Google Colab', icon: 'devicon-google-plain colored' },
        ],
    },
];

const About = () => {
    const [ref, inView] = useInView({
        triggerOnce: true,
        threshold: 0.1,
    });
    const [activeSkill, setActiveSkill] = useState(null);

    return (
        <section id="about" className="section bg-[var(--bg-dark)]">
            <div className="container">
                <motion.div
                    ref={ref}
                    initial={{ opacity: 0, y: 50 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.8 }}
                    className="about-grid"
                >
                    {/* Profile Image with Lazy Loading */}
                    <div className="profile-img-container group">
                        <div className="profile-img glass-panel overflow-hidden">
                            <LazyImage
                                src={profileImg}
                                alt="Satya Teja Chukka"
                                className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                                width={400}
                                height={400}
                                wrapperClassName="w-full h-full"
                            />
                        </div>
                    </div>

                    <div>
                        <h2 className="section-title about-title text-left md:text-left mb-4">
                            About <span className="text-gradient">Me</span>
                        </h2>

                        {/* Bio Highlight Cards */}
                        <div className="about-highlights">
                            <div className="about-highlight-card">
                                <span className="about-highlight-icon">🎓</span>
                                <div>
                                    <h4 className="about-highlight-title">Education</h4>
                                    <p className="about-highlight-text">
                                        B.Tech CSE (AI & ML) — Class of 2027, with a strong foundation in Computer Science, Machine Learning, Deep Learning, and Software Engineering.
                                    </p>
                                </div>
                            </div>
                            <div className="about-highlight-card">
                                <span className="about-highlight-icon">💻</span>
                                <div>
                                    <h4 className="about-highlight-title">Experience</h4>
                                    <p className="about-highlight-text">
                                        Building full-stack applications and ML solutions using technologies like FastAPI, Docker, and AWS.
                                    </p>
                                </div>
                            </div>
                            <div className="about-highlight-card">
                                <span className="about-highlight-icon">🚀</span>
                                <div>
                                    <h4 className="about-highlight-title">Goal</h4>
                                    <p className="about-highlight-text">
                                        Actively seeking internships to apply my problem-solving and development skills in real-world projects.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Skills Icon Grid */}
                        <div className="skills-icon-section">
                            {skillCategories.map((category, catIdx) => (
                                <motion.div
                                    key={category.title}
                                    className="skill-category"
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={inView ? { opacity: 1, y: 0 } : {}}
                                    transition={{ duration: 0.4, delay: catIdx * 0.05 }}
                                >
                                    <h4 className="skill-category-title">{category.title}</h4>
                                    <div className="skill-icons-row">
                                        {category.skills.map((skill) => (
                                            <motion.div
                                                key={skill.name}
                                                className={`skill-icon-chip ${activeSkill === skill.name ? 'skill-icon-chip--active' : ''}`}
                                                whileHover={{ y: -3, scale: 1.05 }}
                                                whileTap={{ scale: 0.94 }}
                                                onTap={() => {
                                                    setActiveSkill(skill.name);
                                                    hapticLight();
                                                    window.setTimeout(() => setActiveSkill(null), 700);
                                                }}
                                                title={skill.name}
                                            >
                                                <i className={skill.icon} />
                                                <span className="skill-icon-label">{skill.name}</span>
                                            </motion.div>
                                        ))}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default About;
