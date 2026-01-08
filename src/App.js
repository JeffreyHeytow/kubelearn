import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Tutorials from './pages/Tutorials';
import Tutorial from './pages/Tutorial';
import Playground from './pages/Playground';
import Generator from './pages/Generator';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/tutorials" element={<Tutorials />} />
        <Route path="/tutorial/:slug" element={<Tutorial />} />
        <Route path="/playground" element={<Playground />} />
        <Route path="/generator" element={<Generator />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;