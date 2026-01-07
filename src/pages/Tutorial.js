import React, { useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import mermaid from 'mermaid';
import tutorials from '../tutorials';
import './Tutorial.css';

export default function Tutorial() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    // Find tutorial by slug
    const tutorial = Object.values(tutorials).find(t => t.slug === slug);

    useEffect(() => {
        window.scrollTo(0, 0);

        mermaid.initialize({
            startOnLoad: true,
            theme: 'base',
            themeVariables: {
                primaryColor: '#667eea',
                primaryTextColor: '#1a1a1a',
                primaryBorderColor: '#667eea',
                lineColor: '#667eea',
                secondaryColor: '#764ba2',
                tertiaryColor: '#f0f0f0',
                background: '#ffffff',
                mainBkg: '#f8f9ff',
                secondBkg: '#e8ebff',
                labelTextColor: '#1a1a1a',
                nodeBorder: '#667eea',
                clusterBkg: '#f8f9ff',
                clusterBorder: '#667eea',
                edgeLabelBackground: '#ffffff',
                fontSize: '16px'
            }
        });

        setTimeout(() => {
            mermaid.contentLoaded();
        }, 100);
    }, [slug]);

    if (!tutorial) {
        return (
            <div className="tutorial-page">
                <nav className="navbar">
                    <h2 onClick={() => navigate('/')}>KubeLearn</h2>
                    <div className="nav-links">
                        <span onClick={() => navigate('/tutorials')}>Tutorials</span>
                        <span onClick={() => alert('Playground coming soon!')}>Playground</span>
                        <span onClick={() => alert('Generator coming soon!')}>Generator</span>
                    </div>
                </nav>
                <div className="tutorial-container">
                    <h1>Tutorial not found</h1>
                    <button onClick={() => navigate('/tutorials')}>Back to Tutorials</button>
                </div>
            </div>
        );
    }

    // Get all tutorials as array for navigation
    const tutorialsList = Object.values(tutorials).sort((a, b) => a.id - b.id);
    const currentIndex = tutorialsList.findIndex(t => t.slug === slug);
    const prevTutorial = currentIndex > 0 ? tutorialsList[currentIndex - 1] : null;
    const nextTutorial = currentIndex < tutorialsList.length - 1 ? tutorialsList[currentIndex + 1] : null;

    return (
        <div className="tutorial-page">
            <nav className="navbar">
                <h2 onClick={() => navigate('/')}>KubeLearn</h2>
                <div className="nav-links">
                    <span
                        className={location.pathname === '/tutorials' ? 'active' : ''}
                        onClick={() => navigate('/tutorials')}>Tutorials
                    </span>
                    <span
                        className={location.pathname === '/playground' ? 'active' : ''}
                        onClick={() => navigate('/playground')}>Playground
                    </span>
                    <span onClick={() => alert('Generator coming soon!')}>Generator</span>
                </div>
            </nav>

            <div className="tutorial-container">
                <button className="back-button" onClick={() => navigate('/tutorials')}>
                    ← Back to Tutorials
                </button>

                <article className="tutorial-content">
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                            code({ node, inline, className, children, ...props }) {
                                const match = /language-(\w+)/.exec(className || '');
                                const lang = match ? match[1] : '';

                                if (lang === 'mermaid') {
                                    return (
                                        <div className="mermaid">
                                            {String(children).replace(/\n$/, '')}
                                        </div>
                                    );
                                }

                                return !inline ? (
                                    <pre>
                                        <code className={className} {...props}>
                                            {children}
                                        </code>
                                    </pre>
                                ) : (
                                    <code className={className} {...props}>
                                        {children}
                                    </code>
                                );
                            }
                        }}
                    >
                        {tutorial.content}
                    </ReactMarkdown>

                    {/* Navigation buttons */}
                    <div className="tutorial-navigation">
                        <div className="tutorial-nav-buttons">
                            {prevTutorial && (
                                <button
                                    className="nav-button prev-button"
                                    onClick={() => navigate(`/tutorial/${prevTutorial.slug}`)}
                                >
                                    ← Previous Tutorial
                                </button>
                            )}

                            {nextTutorial && (
                                <button
                                    className="nav-button next-button"
                                    onClick={() => navigate(`/tutorial/${nextTutorial.slug}`)}
                                >
                                    Next Tutorial →
                                </button>
                            )}
                        </div>

                        <button
                            className="nav-button playground-button"
                            onClick={() => alert('Playground coming soon!')}
                        >
                            Try the Playground 🎮
                        </button>
                    </div>
                </article>
            </div>
        </div>
    );
}