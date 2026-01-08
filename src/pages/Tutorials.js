import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import tutorials from '../tutorials';
import './Tutorials.css';

export default function Tutorials() {
    const navigate = useNavigate();
    const location = useLocation();

    // Convert tutorials object to array for mapping
    const tutorialsList = Object.values(tutorials);

    return (
        <div className="tutorials-page">
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
                    <span
                        className={location.pathname === '/generator' ? 'active' : ''}
                        onClick={() => navigate('/generator')}>Generator
                    </span>
                </div>
            </nav>

            <div className="tutorials-container">
                <h1>Kubernetes Tutorials</h1>
                <p className="subtitle">Learn Kubernetes step-by-step with interactive lessons</p>

                <div className="tutorials-grid">
                    {tutorialsList.map(tutorial => (
                        <div key={tutorial.id} className="tutorial-card">
                            <h3>{tutorial.title}</h3>
                            <p>{tutorial.description}</p>
                            <div className="tutorial-footer">
                                <span className="duration">⏱️ {tutorial.duration}</span>
                                <button onClick={() => navigate(`/tutorial/${tutorial.slug}`)}>
                                    Start →
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}