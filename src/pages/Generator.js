import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Generator.css';

export default function Generator() {
    const navigate = useNavigate();
    const location = useLocation();

    const [mode, setMode] = useState('generate');
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [error, setError] = useState('');

    const handleCopy = () => {
        navigator.clipboard.writeText(output);
        alert('Copied to clipboard!');
    };

    const handleDownload = () => {
        const blob = new Blob([output], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = mode === 'generate' ? 'kubernetes.yaml' : 'explanation.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const getPlaceholder = () => {
        if (mode === 'generate') {
            return 'Example: Create a deployment with 3 nginx replicas, resource limits of 256Mi memory and 500m CPU, and expose it on port 80';
        } else {
            return 'Paste your Kubernetes YAML here to get a detailed explanation...';
        }
    };

    return (
        <div className="generator-page">
            {/* Navigation bar */}
            <nav className="navbar">
                <h2 onClick={() => navigate('/')}>KubeLearn</h2>
                <div className="nav-links">
                    <span
                        className={location.pathname.includes('/tutorial') ? 'active' : ''}
                        onClick={() => navigate('/tutorials')}
                    >
                        Tutorials
                    </span>
                    <span
                        className={location.pathname === '/playground' ? 'active' : ''}
                        onClick={() => navigate('/playground')}
                    >
                        Playground
                    </span>
                    <span
                        className={location.pathname === '/generator' ? 'active' : ''}
                        onClick={() => navigate('/generator')}
                    >
                        Generator
                    </span>
                </div>
            </nav>

            {/* Main generator area */}
            <div className="generator-container">
                <div className="generator-header">
                    <h1>AI Kubernetes Assistant</h1>
                    <p>Generate YAML configurations or get explanations powered by Google Gemini AI</p>
                </div>

                <div className="generator-content">
                    {/* AI Limitation Notice */}
                    <div className="ai-notice">
                        <div className="notice-icon">⚠️</div>
                        <div className="notice-content">
                            <strong>AI Generation Temporarily Disabled</strong>
                            <p>
                                This feature is fully functional but disabled in the live demo due to infrastructure constraints.
                                Google's Gemini API responses can take 15-20 seconds, exceeding Vercel's 10-second free tier timeout limit.
                            </p>
                            <p>
                                The complete implementation includes: rate-limited API calls (3 per IP/day, 100 global/day),
                                Redis-based request tracking, and secure environment variable management.
                                <a href="https://github.com/JeffreyHeytow/kubelearn/blob/main/api/generate.js" target="_blank" rel="noopener noreferrer">
                                    View the code →
                                </a>
                            </p>
                        </div>
                    </div>

                    {/* Mode selector */}
                    <div className="mode-selector">
                        <label htmlFor="mode">Mode:</label>
                        <select
                            id="mode"
                            value={mode}
                            onChange={(e) => {
                                setMode(e.target.value);
                                setInput('');
                                setOutput('');
                                setError('');
                            }}
                        >
                            <option value="generate">Generate YAML</option>
                            <option value="explain">Explain YAML</option>
                        </select>
                    </div>

                    {/* Input area */}
                    <div className="input-section">
                        <label>
                            {mode === 'generate' ? 'Describe what you want to create:' : 'Paste your YAML:'}
                        </label>
                        <textarea
                            className="input-textarea"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={getPlaceholder()}
                            rows={8}
                        />
                        <button
                            className="generate-button"
                            onClick={() => setError('AI generation is disabled in this demo. See banner above for details.')}
                            disabled={true}
                        >
                            {mode === 'generate' ? '🤖 Generate YAML (Disabled - See Above)' : '💡 Explain YAML (Disabled - See Above)'}
                        </button>
                    </div>

                    {/* Error message */}
                    {error && (
                        <div className="error-message">
                            ℹ️ {error}
                        </div>
                    )}

                    {/* Output area */}
                    {output && (
                        <div className="output-section">
                            <div className="output-header">
                                <label>Result:</label>
                                <div className="output-actions">
                                    <button className="action-button" onClick={handleCopy}>
                                        📋 Copy
                                    </button>
                                    <button className="action-button" onClick={handleDownload}>
                                        ⬇️ Download
                                    </button>
                                </div>
                            </div>
                            <textarea
                                className="output-textarea"
                                value={output}
                                readOnly
                                rows={20}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}