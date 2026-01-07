import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Tutorials.css';

export default function Tutorials() {
  const navigate = useNavigate();

  const tutorials = [
    { id: 1, title: 'Introduction to Kubernetes', description: 'Learn the basics of Kubernetes architecture', duration: '10 min' },
    { id: 2, title: 'Understanding Pods', description: 'Deep dive into Kubernetes Pods', duration: '15 min' },
    { id: 3, title: 'Deployments Explained', description: 'Master Kubernetes Deployments', duration: '20 min' },
  ];

  return (
    <div className="tutorials-page">
      <nav className="navbar">
        <h2 onClick={() => navigate('/')}>KubeLearn</h2>
        <div className="nav-links">
          <span onClick={() => navigate('/tutorials')}>Tutorials</span>
          <span onClick={() => alert('Playground coming soon!')}>Playground</span>
          <span onClick={() => alert('Generator coming soon!')}>Generator</span>
        </div>
      </nav>
      
      <div className="tutorials-container">
        <h1>Kubernetes Tutorials</h1>
        <p className="subtitle">Learn Kubernetes step-by-step with interactive lessons</p>
        
        <div className="tutorials-grid">
          {tutorials.map(tutorial => (
            <div key={tutorial.id} className="tutorial-card">
              <h3>{tutorial.title}</h3>
              <p>{tutorial.description}</p>
              <div className="tutorial-footer">
                <span className="duration">⏱️ {tutorial.duration}</span>
                <button onClick={() => navigate(`/tutorial/${tutorial.id}`)}>
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