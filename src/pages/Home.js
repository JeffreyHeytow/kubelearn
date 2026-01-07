import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';

export default function Home() {
    const navigate = useNavigate();

    return (
        <div className="App">
            <header className="App-header">
                <h1>KubeLearn</h1>
                <p>Master Kubernetes through interactive tutorials, hands-on practice, and AI-powered configuration generation</p>
                <div className="features">
                    <div className="feature" onClick={() => navigate('/tutorials')}>
                        <h3>📚 Learn</h3>
                        <p>Step-by-step tutorials with visual diagrams</p>
                    </div>
                    <div className="feature" onClick={() => navigate('/playground')}>
                        <h3>🎮 Practice</h3>
                        <p>Interactive YAML playground</p>
                    </div>
                    <div className="feature" onClick={() => alert('AI Generator coming soon!')}>
                        <h3>🤖 Generate</h3>
                        <p>AI-powered config creation</p>
                    </div>
                </div>
            </header>
        </div>
    );
}