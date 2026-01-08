import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Generator.css';

export default function Generator() {
    const navigate = useNavigate();
    const location = useLocation();

    const [mode, setMode] = useState('generate');
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [usage, setUsage] = useState({ remainingToday: 3, globalRemaining: 100 });

    const handleGenerate = async () => {
        if (!input.trim()) {
            setError('Please enter a description or paste YAML code.');
            return;
        }

        setIsLoading(true);
        setError('');
        setOutput('');

        try {
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    mode,
                    input
                })
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 429) {
                    // Rate limit hit
                    setError(data.error);
                } else {
                    setError(data.error || 'Failed to generate response');
                }
                return;
            }

            setOutput(data.result);
            setUsage(data.usage);

        } catch (err) {
            setError('Failed to connect to server. Please try again.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

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

    const getButtonText = () => {
        if (isLoading) return '⏳ Processing...';
        return mode === 'generate' ? '🤖 Generate YAML' : '💡 Explain YAML';
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
                    <p>Generate YAML configurations or get explanations powered by Gemini AI</p>
                </div>

                <div className="generator-content">
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

                        <div className="usage-info">
                            <span className="usage-badge">
                                {usage.remainingToday} requests left today
                            </span>
                        </div>
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
                            onClick={handleGenerate}
                            disabled={isLoading}
                        >
                            {getButtonText()}
                        </button>
                    </div>

                    {/* Error message */}
                    {error && (
                        <div className="error-message">
                            ❌ {error}
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