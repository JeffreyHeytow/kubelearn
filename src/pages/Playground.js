import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import './Playground.css';

export default function Playground() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // State: This is our "Model" in MVC - the data we're managing
  const [yamlCode, setYamlCode] = useState('# Type your YAML here\n');

  return (
    <div className="playground-page">
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
          <span onClick={() => alert('Generator coming soon!')}>
            Generator
          </span>
        </div>
      </nav>

      {/* Main playground area */}
      <div className="playground-container">
        <h1>Kubernetes YAML Playground</h1>
        
        <div className="playground-layout">
          {/* Left side: Editor */}
          <div className="editor-section">
            <h3>YAML Editor</h3>
            <Editor
              height="600px"
              defaultLanguage="yaml"
              value={yamlCode}
              onChange={(value) => setYamlCode(value || '')}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
              }}
              loading={<div style={{color: 'white', padding: '20px'}}>Loading editor...</div>}
              beforeMount={(monaco) => {
                // Tell Monaco to load from CDN
                monaco.languages.register({ id: 'yaml' });
              }}
            />
          </div>

          {/* Right side: Guidance panel */}
          <div className="guidance-section">
            <h3>Guidance</h3>
            <div className="guidance-content">
              <p>✅ Ready to help!</p>
              <p>Start typing YAML and I'll provide real-time feedback.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}