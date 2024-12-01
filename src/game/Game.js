import React, { useEffect, useRef } from 'react';
import '../game/Game.css';
import '../App.css';
import Footer from '../components/Footer';

const Game = () => {
    const gameState = useRef({
        stage: 1,
        health: 3,
        score: 0,
        maxScore: 0,
        hiscore: 0,
        aliens: [],
        alienSpeed: 1,
        attackMode: false,
        gameLoop: null,
    });

    const startScreenRef = useRef(null);
    const gameScreenRef = useRef(null);
    const stageScreenRef = useRef(null);
    const gameOverScreenRef = useRef(null);
    const startButtonRef = useRef(null);
    const avatarRef = useRef(null);
    const healthBarRef = useRef(null);
    const scoreDisplayRef = useRef(null);
    const hiScoreDisplayRef = useRef(null);
    const startHiScoreDisplayRef = useRef(null);

    useEffect(() => {
        const startButton = startButtonRef.current;
        startButton.addEventListener('click', startGame);
        
        // Mouse and touch controls
        let isDragging = false;
        let offsetX = 0;
        let offsetY = 0;

        const handleMouseDown = (e) => {
            isDragging = true;
            offsetX = e.clientX - avatarRef.current.offsetLeft;
            offsetY = e.clientY - avatarRef.current.offsetTop;
        };

        const handleMouseMove = (e) => {
            if (isDragging) {
                const rect = gameScreenRef.current.getBoundingClientRect();
                let x = e.clientX - offsetX;
                let y = e.clientY - offsetY;
                x = Math.max(0, Math.min(rect.width - avatarRef.current.offsetWidth, x));
                y = Math.max(0, Math.min(rect.height - avatarRef.current.offsetHeight, y));
                avatarRef.current.style.left = `${x}px`;
                avatarRef.current.style.top = `${y}px`;
            }
        };

        const handleMouseUp = () => {
            isDragging = false;
        };

        const handleTouchStart = (e) => {
            isDragging = true;
            offsetX = e.touches[0].clientX - avatarRef.current.offsetLeft;
            offsetY = e.touches[0].clientY - avatarRef.current.offsetTop;
        };

        const handleTouchMove = (e) => {
            if (isDragging) {
                const rect = gameScreenRef.current.getBoundingClientRect();
                let x = e.touches[0].clientX - offsetX;
                let y = e.touches[0].clientY - offsetY;
                x = Math.max(0, Math.min(rect.width - avatarRef.current.offsetWidth, x));
                y = Math.max(0, Math.min(rect.height - avatarRef.current.offsetHeight, y));
                avatarRef.current.style.left = `${x}px`;
                avatarRef.current.style.top = `${y}px`;
            }
        };

        const handleTouchEnd = () => {
            isDragging = false;
        };

        const handleDoubleClick = () => {
            avatarRef.current.style.backgroundColor = 'red';
            gameState.current.attackMode = true;
            setTimeout(() => {
                gameState.current.attackMode = false;
                avatarRef.current.style.backgroundColor = 'white';
            }, 2000);
        };

        const handleTouchEndDoubleClick = (e) => {
            const currentTime = new Date().getTime();
            const tapTimeDiff = currentTime - lastTapTime;
            if (tapTimeDiff < doubleTapDelay && tapTimeDiff > 0) {
                avatarRef.current.style.backgroundColor = 'red';
                gameState.current.attackMode = true;
                setTimeout(() => {
                    gameState.current.attackMode = false;
                    avatarRef.current.style.backgroundColor = 'white';
                }, 2000);
            }
            lastTapTime = currentTime;
        };

        let lastTapTime = 0;
        const doubleTapDelay = 300; // milliseconds

        document.addEventListener('mousedown', handleMouseDown);
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        document.addEventListener('touchstart', handleTouchStart);
        document.addEventListener('touchmove', handleTouchMove);
        document.addEventListener('touchend', handleTouchEnd);
        document.addEventListener('dblclick', handleDoubleClick);
        document.addEventListener('touchend', handleTouchEndDoubleClick);

        return () => {
            document.removeEventListener('mousedown', handleMouseDown);
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.removeEventListener('touchstart', handleTouchStart);
            document.removeEventListener('touchmove', handleTouchMove);
            document.removeEventListener('touchend', handleTouchEnd);
            document.removeEventListener('dblclick', handleDoubleClick);
            document.removeEventListener('touchend', handleTouchEndDoubleClick);
        };
    }, []);

    const startGame = () => {
        console.log("Game started");
        startScreenRef.current.style.display = 'none';
        gameOverScreenRef.current.style.display = 'none';
        gameScreenRef.current.style.display = 'block';
        gameState.current.health = 3;
        gameState.current.score = 0;
        gameState.current.aliens = [];
        gameState.current.stage = 1;
        gameState.current.attackMode = false;
        updateHealthBar();
        scoreDisplayRef.current.textContent = 'Score: 0';
        hiScoreDisplayRef.current.textContent = `HI-SCORE: ${gameState.current.hiscore.toString().padStart(7, '0')}`;
        clearInterval(gameState.current.gameLoop);  // Clear any existing game loops
        showStageScreen();
    };

    const showStageScreen = () => {
        stageScreenRef.current.style.display = 'flex';
        stageScreenRef.current.textContent = `Stage ${gameState.current.stage}`;
        setTimeout(() => {
            stageScreenRef.current.style.display = 'none';
            gameScreenRef.current.style.display = 'block';
            startStage();
        }, 3000);
    };

    const updateHealthBar = () => {
        healthBarRef.current.innerHTML = '';
        for (let i = 0; i < gameState.current.health; i++) {
            const healthIcon = document.createElement('div');
            healthIcon.style.width = '20px';
            healthIcon.style.height = '20px';
            healthIcon.style.backgroundColor = 'red';
            healthIcon.style.display = 'inline-block';
            healthIcon.style.marginRight = '5px';
            healthBarRef.current.appendChild(healthIcon);
        }
    };

    const startStage = () => {
        console.log("Starting stage", gameState.current.stage);
        gameState.current.alienSpeed = 1 + (gameState.current.stage - 1) * 0.5;
        spawnAliens();
        gameState.current.gameLoop = setInterval(updateGame, 1000 / 60);
    };

    const spawnAliens = () => {
        const alienCount = 50;
        for (let i = 0; i < alienCount; i++) {
            setTimeout(() => {
                if (gameState.current.health > 0) {
                    createAlien();
                }
            }, i * 1000);
        }
    };

    const createAlien = () => {
        const alien = document.createElement('div');
        alien.className = 'alien';
        alien.style.top = Math.random() * (gameScreenRef.current.clientHeight - 30) + 'px';
        alien.style.left = Math.random() * (gameScreenRef.current.clientWidth - 30) + 'px';
        gameScreenRef.current.appendChild(alien);
        gameState.current.aliens.push(alien);
        console.log("Alien created", alien);
    };

    const updateGame = () => {
        if (gameState.current.health <= 0) {
            gameOver();
            return;
        }

        const avatarRect = avatarRef.current.getBoundingClientRect();

        gameState.current.aliens.forEach(alien => {
            const alienRect = alien.getBoundingClientRect();
            let alienSize = parseFloat(alien.style.width);

            // Move alien towards avatar
            const alienCenterX = alienRect.left + alienRect.width / 2;
            const alienCenterY = alienRect.top + alienRect.height / 2;
            const avatarCenterX = avatarRect.left + avatarRect.width / 2;
            const avatarCenterY = avatarRect.top + avatarRect.height / 2;

            const deltaX = avatarCenterX - alienCenterX;
            const deltaY = avatarCenterY - alienCenterY;
            const angle = Math.atan2(deltaY, deltaX);
            const speed = gameState.current.alienSpeed;

            alien.style.left = `${alienRect.left + Math.cos(angle) * speed}px`;
            alien.style.top = `${alienRect.top + Math.sin(angle) * speed}px`;

            // Increase alien size
            const distanceToAvatar = Math.hypot(deltaX, deltaY);
            const maxDistance = Math.hypot(gameScreenRef.current.clientWidth, gameScreenRef.current.clientHeight) / 2;
            const newSize = Math.min(2 + (48 * (maxDistance - distanceToAvatar) / maxDistance), 10);
            alien.style.width = `${newSize}vw`;
            alien.style.height = `${newSize}vh`;

            // Check if the alien size exceeds 150px in height and remove if so
            if (alienRect.height >= 150) {
                alien.remove();
                gameState.current.aliens = gameState.current.aliens.filter(a => a !== alien);
                return;  // Skip the rest of the update for this alien
            }

            if (checkCollision(avatarRef.current, alien) && alienSize >= 5) {
                if (gameState.current.attackMode) {
                    alien.remove();
                    gameState.current.aliens = gameState.current.aliens.filter(a => a !== alien);
                    gameState.current.score += 10;
                    scoreDisplayRef.current.textContent = `Score: ${gameState.current.score}`;
                } else {
                    gameState.current.health -= 1;
                    updateHealthBar();
                    alien.remove();
                    gameState.current.aliens = gameState.current.aliens.filter(a => a !== alien);
                }
            }
        });

        // Check stage completion
        if (gameState.current.aliens.length === 0) {
            gameState.current.stage += 1;
            showStageScreen();
        }
    };

    const checkCollision = (rect1, rect2) => {
        const r1 = rect1.getBoundingClientRect();
        const r2 = rect2.getBoundingClientRect();
        return !(r2.left > r1.right ||
            r2.right < r1.left ||
            r2.top > r1.bottom ||
            r2.bottom < r1.top);
    };

    const gameOver = () => {
        clearInterval(gameState.current.gameLoop);
        gameOverScreenRef.current.style.display = 'flex';
        gameScreenRef.current.style.display = 'none';
        gameState.current.hiscore = Math.max(gameState.current.hiscore, gameState.current.score);
        startHiScoreDisplayRef.current.textContent = `HI-SCORE: ${gameState.current.hiscore.toString().padStart(7, '0')}`;
        console.log("Game Over");
    };

    return (
        <div className="container">
            <div className="screen" ref={startScreenRef} id="start-screen">
                <button ref={startButtonRef} id="start-button">Start</button>
                <div ref={startHiScoreDisplayRef} id="start-hi-score">HI-SCORE: 0000000</div>
            </div>
            <div className="screen" ref={gameScreenRef} id="game-screen">
                <div ref={healthBarRef} id="health-bar"></div>
                <div ref={scoreDisplayRef} id="score">Score: 0</div>
                <div ref={hiScoreDisplayRef} id="hi-score">HI-SCORE: 0000000</div>
                <div ref={avatarRef} id="avatar"></div>
            </div>
            <div className="screen" ref={stageScreenRef} id="stage-screen"></div>
            <div className="screen" ref={gameOverScreenRef} id="game-over-screen">
                <div>Game Over</div>
                <button onClick={startGame}>Restart</button>
            </div>
            <Footer />
        </div>
    );
};

export default Game;
