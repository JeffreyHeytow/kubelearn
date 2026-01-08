import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { DndContext, DragOverlay, useDraggable, useDroppable } from '@dnd-kit/core';
import { levels } from '../data/levels';
import './Playground.css';

// Shuffle array utility
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Draggable code block component
function DraggableCodeBlock({ line, isPlaced, isLockedIn }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: line.id,
        disabled: isLockedIn  // Can't drag if locked in
    });

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        opacity: isDragging ? 0.5 : 1
    } : undefined;

    // Don't render if locked in
    if (isLockedIn) return null;

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            className={`code-block ${isPlaced ? 'placed' : ''} ${isDragging ? 'dragging' : ''}`}
        >
            <code>{line.code}</code>
        </div>
    );
}

// Draggable placed line in editor (for wrong placements)
function DraggablePlacedLine({ line, position }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: `placed-${line.id}-${position}`
    });

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        opacity: isDragging ? 0.5 : 1
    } : undefined;

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            className="draggable-placed-line"
        >
            <code className="placed-code">{line.code}</code>
        </div>
    );
}

// Droppable slot in editor
function DropSlot({ position, placedLine, lineNumber }) {
    const { setNodeRef, isOver } = useDroppable({
        id: `slot-${position}`
    });

    const isCorrect = placedLine && placedLine.position === position;
    const isWrong = placedLine && placedLine.position !== position;

    return (
        <div
            ref={setNodeRef}
            className={`editor-line ${isOver ? 'hover' : ''} ${isCorrect ? 'correct' : ''} ${isWrong ? 'wrong' : ''}`}
        >
            <span className="line-number">{lineNumber}</span>
            <div
                className="line-content"
                style={{ paddingLeft: `${(placedLine?.indent || 0) * 20}px` }}
            >
                {placedLine ? (
                    isCorrect ? (
                        // Locked in - can't drag
                        <code className="placed-code locked">{placedLine.code}</code>
                    ) : (
                        // Wrong - can drag back out
                        <DraggablePlacedLine line={placedLine} position={position} />
                    )
                ) : (
                    <span className="line-placeholder">&nbsp;</span>
                )}
            </div>
        </div>
    );
}

// Droppable zone for blocks panel (to drag back)
function BlocksDropZone({ children }) {
    const { setNodeRef } = useDroppable({
        id: 'blocks-return-zone'
    });

    return (
        <div ref={setNodeRef} className="blocks-content">
            {children}
        </div>
    );
}

export default function Playground() {
    const navigate = useNavigate();
    const location = useLocation();

    const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
    const [placedLines, setPlacedLines] = useState({});
    const [shuffledLines, setShuffledLines] = useState([]);
    const [shuffleKey, setShuffleKey] = useState(0); // Force re-shuffle trigger
    const [feedback, setFeedback] = useState({
        message: "Drag code blocks from the right into the editor on the left. Build your Kubernetes YAML line by line!",
        type: "info"
    });
    const [activeId, setActiveId] = useState(null);

    const currentLevel = levels[currentLevelIndex];

    // Calculate completion
    const correctCount = Object.values(placedLines).filter(line =>
        line && line.position === line.placedAt
    ).length;
    const isLevelComplete = correctCount === currentLevel.lines.length;

    // Shuffle lines when level changes OR when shuffle key changes
    useEffect(() => {
        setShuffledLines(shuffleArray(currentLevel.lines));
    }, [currentLevelIndex, shuffleKey, currentLevel.lines]);

    // Handle drag start
    const handleDragStart = (event) => {
        setActiveId(event.active.id);
    };

    // Handle drag end
    const handleDragEnd = (event) => {
        const { active, over } = event;
        setActiveId(null);

        if (!over) return;

        const draggedId = active.id;

        // Check if dragging from editor (format: "placed-line-X-position")
        const isDraggingFromEditor = draggedId.startsWith('placed-');

        if (isDraggingFromEditor) {
            // Extract the original line ID and current position
            const parts = draggedId.split('-');
            const lineId = parts.slice(1, -1).join('-'); // Get line-X part
            const fromPosition = parseInt(parts[parts.length - 1]);
            const line = currentLevel.lines.find(l => l.id === lineId);

            // Dragging back to blocks panel
            if (over.id === 'blocks-return-zone') {
                // Remove from editor
                const newPlacedLines = { ...placedLines };
                delete newPlacedLines[fromPosition];
                setPlacedLines(newPlacedLines);

                setFeedback({
                    message: "💡 Line removed. Try placing it in a different position!",
                    type: "info"
                });
                return;
            }

            // Dragging to another slot in editor
            if (over.id.startsWith('slot-')) {
                const targetPosition = parseInt(over.id.replace('slot-', ''));

                // Can't drop on self
                if (targetPosition === fromPosition) return;

                const newPlacedLines = { ...placedLines };

                // Check if target position has a line
                if (placedLines[targetPosition]) {
                    const targetLine = placedLines[targetPosition];

                    // Check if target line is locked (correct)
                    if (targetLine.position === targetPosition) {
                        setFeedback({
                            message: "❌ Can't swap with a locked (green) line! It's already correct.",
                            type: "error"
                        });
                        return;
                    }

                    // SWAP: Target goes to source position
                    newPlacedLines[fromPosition] = { ...targetLine, placedAt: fromPosition };
                }

                // Remove from old position and place in new position
                delete newPlacedLines[fromPosition];
                newPlacedLines[targetPosition] = { ...line, placedAt: targetPosition };
                setPlacedLines(newPlacedLines);

                // Check if correct
                if (line.position === targetPosition) {
                    setFeedback({
                        message: `✅ Correct! ${line.explanation}`,
                        type: "success"
                    });
                } else {
                    setFeedback({
                        message: getHint(line, targetPosition),
                        type: "error"
                    });
                }
                return;
            }
        }

        // Dragging from blocks to editor
        const targetSlotId = over.id;
        if (!targetSlotId.startsWith('slot-')) return;

        const targetPosition = parseInt(targetSlotId.replace('slot-', ''));
        const line = currentLevel.lines.find(l => l.id === draggedId);

        const newPlacedLines = { ...placedLines };

        // Check if target position has a line
        if (placedLines[targetPosition]) {
            const targetLine = placedLines[targetPosition];

            // Check if target line is locked (correct)
            if (targetLine.position === targetPosition) {
                setFeedback({
                    message: "❌ Can't place here - this line is already correct (green/locked)!",
                    type: "error"
                });
                return;
            }

            // SWAP: Target line goes back to blocks (removed from editor)
            // No need to move it anywhere, just remove it
            delete newPlacedLines[targetPosition];
        }

        // Place the new line
        newPlacedLines[targetPosition] = { ...line, placedAt: targetPosition };
        setPlacedLines(newPlacedLines);

        // Check if correct
        if (line.position === targetPosition) {
            setFeedback({
                message: `✅ Correct! ${line.explanation}`,
                type: "success"
            });
        } else {
            setFeedback({
                message: getHint(line, targetPosition),
                type: "error"
            });
        }
    };

    // Generate contextual hint
    // Generate contextual hint
    const getHint = (line, targetPosition) => {
        const correctPosition = line.position + 1; // +1 for 1-indexed display
        const currentCode = line.code.trim();

        // Very specific hints based on exact code content
        if (currentCode === "apiVersion: v1") {
            return "💡 Hint: 'apiVersion' is always the very first line in a Kubernetes YAML file.";
        }

        if (currentCode === "kind: Pod") {
            return "💡 Hint: 'kind' comes right after 'apiVersion' to specify what type of resource you're creating.";
        }

        if (currentCode === "metadata:") {
            return "💡 Hint: 'metadata:' comes after 'kind' and before the indented name field.";
        }

        if (currentCode === "name: my-pod" && line.indent === 2) {
            return "💡 Hint: This 'name' field belongs under 'metadata:' and should be indented with 2 spaces. It identifies your Pod.";
        }

        if (currentCode === "spec:") {
            return "💡 Hint: 'spec:' comes after the metadata section. It defines what your Pod should actually run.";
        }

        if (currentCode === "containers:") {
            return "💡 Hint: 'containers:' goes under 'spec:' with 2 spaces indent. It starts the list of containers to run.";
        }

        if (currentCode === "- name: nginx") {
            return "💡 Hint: This line starts a container definition. The dash (-) makes it a list item under 'containers:', with 2 spaces before the dash.";
        }

        if (currentCode === "image: nginx:1.21" && line.indent === 4) {
            return "💡 Hint: The 'image' field tells Kubernetes which container image to use. It should be indented 4 spaces (under the container name).";
        }

        if (currentCode === "resources:") {
            return "💡 Hint: 'resources:' defines CPU and memory limits. It goes at the same indent level as 'image:' (4 spaces).";
        }

        if (currentCode === "requests:") {
            return "💡 Hint: 'requests:' specifies the minimum resources guaranteed to the container. It goes under 'resources:' with 6 spaces indent.";
        }

        if (currentCode.includes("memory:") && currentCode.includes("64Mi")) {
            return "💡 Hint: This memory request should be under 'requests:' with 8 spaces indent.";
        }

        if (currentCode.includes("cpu:") && currentCode.includes("250m")) {
            return "💡 Hint: This CPU request should be under 'requests:' with 8 spaces indent, after the memory line.";
        }

        // Fallback: directional hint
        if (targetPosition < line.position) {
            const distance = line.position - targetPosition;
            if (distance === 1) {
                return `💡 Hint: Try the next line down.`;
            } else if (distance <= 3) {
                return `💡 Hint: This line belongs a few lines further down in the file.`;
            } else {
                return `💡 Hint: This line belongs much further down (near line ${correctPosition}).`;
            }
        } else {
            const distance = targetPosition - line.position;
            if (distance === 1) {
                return `💡 Hint: Try the line above this one.`;
            } else if (distance <= 3) {
                return `💡 Hint: This line belongs a few lines further up in the file.`;
            } else {
                return `💡 Hint: This line belongs much further up (near line ${correctPosition}).`;
            }
        }
    };

    // Check if line is placed anywhere
    const isLinePlaced = (lineId) => {
        return Object.values(placedLines).some(pl => pl && pl.id === lineId);
    };

    // Check if line is correctly placed (locked in)
    const isLineLockedIn = (lineId) => {
        return Object.values(placedLines).some(pl =>
            pl && pl.id === lineId && pl.position === pl.placedAt
        );
    };

    // Next level
    const goToNextLevel = () => {
        if (currentLevelIndex < levels.length - 1) {
            setCurrentLevelIndex(currentLevelIndex + 1);
            setPlacedLines({});
            setShuffleKey(prev => prev + 1); // Trigger re-shuffle
            setFeedback({
                message: "New level! Drag the code blocks to build this configuration.",
                type: "info"
            });
        }
    };

    // Reset level
    const resetLevel = () => {
        setPlacedLines({});
        setShuffleKey(prev => prev + 1); // Trigger re-shuffle
        setFeedback({
            message: "Level reset! Start building your YAML again.",
            type: "info"
        });
    };

    // Restart from beginning
    const restartGame = () => {
        setCurrentLevelIndex(0);
        setPlacedLines({});
        setShuffleKey(prev => prev + 1); // Trigger re-shuffle
        setFeedback({
            message: "Starting over! Drag the code blocks to build this configuration.",
            type: "info"
        });
    };

    // Get active line for drag overlay
    let activeLine = null;
    if (activeId) {
        if (activeId.startsWith('placed-')) {
            // Dragging from editor
            const parts = activeId.split('-');
            const lineId = parts.slice(1, -1).join('-');
            activeLine = currentLevel.lines.find(l => l.id === lineId);
        } else {
            // Dragging from blocks
            activeLine = currentLevel.lines.find(l => l.id === activeId);
        }
    }

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

            {/* Main game area */}
            <div className="playground-container">
                <div className="level-header">
                    <div className="level-title">
                        <h1>Level {currentLevel.id}: {currentLevel.title}</h1>
                        <span className="progress">{correctCount} / {currentLevel.lines.length} correct</span>
                    </div>
                    <p className="level-description">{currentLevel.description}</p>
                </div>

                {/* Feedback Panel (Top) */}
                <div className={`feedback-panel ${feedback.type}`}>
                    {isLevelComplete ? (
                        <div className="level-complete">
                            <span className="complete-icon">🎉</span>
                            <div className="complete-text">
                                <strong>Level Complete!</strong>
                                <p>You successfully built a valid Kubernetes YAML configuration!</p>
                            </div>
                            {currentLevelIndex < levels.length - 1 ? (
                                <button onClick={goToNextLevel} className="next-button">
                                    Next Level →
                                </button>
                            ) : (
                                <button onClick={restartGame} className="next-button">
                                    🏆 Play Again
                                </button>
                            )}
                        </div>
                    ) : (
                        <p>{feedback.message}</p>
                    )}
                </div>

                <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                    <div className="game-layout">
                        {/* Left side: Code Editor */}
                        <div className="editor-zone">
                            <div className="editor-header">
                                <span className="editor-title">📝 pod.yaml</span>
                            </div>
                            <div className="editor-content">
                                {currentLevel.lines.map((_, index) => (
                                    <DropSlot
                                        key={index}
                                        position={index}
                                        placedLine={placedLines[index]}
                                        lineNumber={index + 1}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Right side: Code Blocks */}
                        <div className="blocks-zone">
                            <div className="blocks-header">Code Blocks - Drag & Drop</div>
                            <BlocksDropZone>
                                {shuffledLines.map((line) => (
                                    <DraggableCodeBlock
                                        key={line.id}
                                        line={line}
                                        isPlaced={isLinePlaced(line.id)}
                                        isLockedIn={isLineLockedIn(line.id)}
                                    />
                                ))}
                            </BlocksDropZone>
                            <div className="blocks-footer">
                                <button onClick={resetLevel} className="reset-button">
                                    🔄 Reset Level
                                </button>
                            </div>
                        </div>
                    </div>

                    <DragOverlay>
                        {activeLine ? (
                            <div className="code-block dragging-overlay">
                                <code>{activeLine.code}</code>
                            </div>
                        ) : null}
                    </DragOverlay>
                </DndContext>
            </div>
        </div>
    );
}