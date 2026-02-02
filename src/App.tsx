import { useState, useEffect } from 'react';
import './styles.css';

type GameType = 'rock-paper-scissors' | 'dice' | 'coin-flip' | 'quick-draw' | 'odd-even' | 'number-guess';
type GameState = 'lobby' | 'playing' | 'result';
type PlayerChoice = string | number | null;

interface Game {
  id: GameType;
  name: string;
  icon: string;
  description: string;
  spectators: number;
  activePlayers: number;
}

const games: Game[] = [
  { id: 'rock-paper-scissors', name: 'Rock Paper Scissors', icon: '✊', description: 'Classic showdown', spectators: 234, activePlayers: 48 },
  { id: 'dice', name: 'Dice Roll', icon: '🎲', description: 'High roll wins', spectators: 189, activePlayers: 36 },
  { id: 'coin-flip', name: 'Coin Flip', icon: '🪙', description: 'Call it in the air', spectators: 312, activePlayers: 72 },
  { id: 'quick-draw', name: 'Quick Draw', icon: '⚡', description: 'Fastest click wins', spectators: 156, activePlayers: 28 },
  { id: 'odd-even', name: 'Odd / Even', icon: '🔢', description: 'Pick your parity', spectators: 98, activePlayers: 22 },
  { id: 'number-guess', name: 'Number Guess', icon: '🎯', description: 'Closest to target', spectators: 145, activePlayers: 31 },
];

const tokens = ['ETH', 'SOL', 'USDC', 'APE', 'PEPE'];

function App() {
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [gameState, setGameState] = useState<GameState>('lobby');
  const [wagerAmount, setWagerAmount] = useState('0.1');
  const [selectedToken, setSelectedToken] = useState('ETH');
  const [playerChoice, setPlayerChoice] = useState<PlayerChoice>(null);
  const [opponentChoice, setOpponentChoice] = useState<PlayerChoice>(null);
  const [result, setResult] = useState<'win' | 'lose' | 'draw' | null>(null);
  const [isAIOpponent, setIsAIOpponent] = useState(true);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [quickDrawTime, setQuickDrawTime] = useState<number | null>(null);
  const [quickDrawStarted, setQuickDrawStarted] = useState(false);

  useEffect(() => {
    if (countdown !== null && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      resolveGame();
    }
  }, [countdown]);

  const startGame = () => {
    setGameState('playing');
    setPlayerChoice(null);
    setOpponentChoice(null);
    setResult(null);
    setQuickDrawTime(null);
    setQuickDrawStarted(false);

    if (selectedGame?.id === 'quick-draw') {
      const delay = 2000 + Math.random() * 3000;
      setTimeout(() => setQuickDrawStarted(true), delay);
    }
  };

  const makeChoice = (choice: PlayerChoice) => {
    setPlayerChoice(choice);

    if (selectedGame?.id === 'quick-draw') {
      if (quickDrawStarted) {
        setQuickDrawTime(Date.now());
        setCountdown(1);
      } else {
        setResult('lose');
        setGameState('result');
      }
    } else {
      setCountdown(3);
    }
  };

  const resolveGame = () => {
    let aiChoice: PlayerChoice;
    let gameResult: 'win' | 'lose' | 'draw';

    switch (selectedGame?.id) {
      case 'rock-paper-scissors':
        const rpsOptions = ['rock', 'paper', 'scissors'];
        aiChoice = rpsOptions[Math.floor(Math.random() * 3)];
        if (playerChoice === aiChoice) gameResult = 'draw';
        else if (
          (playerChoice === 'rock' && aiChoice === 'scissors') ||
          (playerChoice === 'paper' && aiChoice === 'rock') ||
          (playerChoice === 'scissors' && aiChoice === 'paper')
        ) gameResult = 'win';
        else gameResult = 'lose';
        break;

      case 'dice':
        const playerDice = Math.floor(Math.random() * 6) + 1;
        aiChoice = Math.floor(Math.random() * 6) + 1;
        setPlayerChoice(playerDice);
        if (playerDice > aiChoice) gameResult = 'win';
        else if (playerDice < aiChoice) gameResult = 'lose';
        else gameResult = 'draw';
        break;

      case 'coin-flip':
        aiChoice = Math.random() > 0.5 ? 'heads' : 'tails';
        gameResult = playerChoice === aiChoice ? 'win' : 'lose';
        break;

      case 'quick-draw':
        const aiTime = 200 + Math.random() * 300;
        aiChoice = Math.round(aiTime);
        const playerReaction = quickDrawTime ? quickDrawTime - (Date.now() - 1000) : 9999;
        if (playerReaction < aiTime) gameResult = 'win';
        else if (playerReaction > aiTime) gameResult = 'lose';
        else gameResult = 'draw';
        break;

      case 'odd-even':
        const total = Math.floor(Math.random() * 10) + 1;
        aiChoice = total;
        const isOdd = total % 2 === 1;
        gameResult = (playerChoice === 'odd' && isOdd) || (playerChoice === 'even' && !isOdd) ? 'win' : 'lose';
        break;

      case 'number-guess':
        const target = Math.floor(Math.random() * 100) + 1;
        aiChoice = Math.floor(Math.random() * 100) + 1;
        const playerDiff = Math.abs((playerChoice as number) - target);
        const aiDiff = Math.abs(aiChoice - target);
        if (playerDiff < aiDiff) gameResult = 'win';
        else if (playerDiff > aiDiff) gameResult = 'lose';
        else gameResult = 'draw';
        setOpponentChoice(`Target: ${target}, AI: ${aiChoice}`);
        break;

      default:
        aiChoice = null;
        gameResult = 'draw';
    }

    if (selectedGame?.id !== 'number-guess') {
      setOpponentChoice(aiChoice);
    }
    setResult(gameResult);
    setGameState('result');
    setCountdown(null);
  };

  const resetToLobby = () => {
    setSelectedGame(null);
    setGameState('lobby');
    setPlayerChoice(null);
    setOpponentChoice(null);
    setResult(null);
  };

  const renderGameUI = () => {
    if (!selectedGame) return null;

    switch (selectedGame.id) {
      case 'rock-paper-scissors':
        return (
          <div className="game-choices">
            {['rock', 'paper', 'scissors'].map((choice) => (
              <button
                key={choice}
                onClick={() => makeChoice(choice)}
                className={`choice-btn ${playerChoice === choice ? 'selected' : ''}`}
                disabled={playerChoice !== null}
              >
                <span className="choice-icon">
                  {choice === 'rock' ? '✊' : choice === 'paper' ? '✋' : '✌️'}
                </span>
                <span className="choice-label">{choice}</span>
              </button>
            ))}
          </div>
        );

      case 'dice':
        return (
          <div className="dice-area">
            <button
              onClick={() => makeChoice('roll')}
              className="roll-btn"
              disabled={playerChoice !== null}
            >
              <span className="dice-icon">🎲</span>
              <span>ROLL DICE</span>
            </button>
            {playerChoice && typeof playerChoice === 'number' && (
              <div className="dice-result">You rolled: {playerChoice}</div>
            )}
          </div>
        );

      case 'coin-flip':
        return (
          <div className="game-choices">
            {['heads', 'tails'].map((choice) => (
              <button
                key={choice}
                onClick={() => makeChoice(choice)}
                className={`choice-btn coin-choice ${playerChoice === choice ? 'selected' : ''}`}
                disabled={playerChoice !== null}
              >
                <span className="choice-icon">{choice === 'heads' ? '👑' : '🦅'}</span>
                <span className="choice-label">{choice}</span>
              </button>
            ))}
          </div>
        );

      case 'quick-draw':
        return (
          <div className="quick-draw-area">
            {!quickDrawStarted && !result && (
              <div className="wait-signal">
                <div className="signal-text">WAIT FOR IT...</div>
                <div className="signal-dot"></div>
              </div>
            )}
            {quickDrawStarted && !result && (
              <button onClick={() => makeChoice('draw')} className="draw-btn">
                <span>⚡ DRAW! ⚡</span>
              </button>
            )}
          </div>
        );

      case 'odd-even':
        return (
          <div className="game-choices">
            {['odd', 'even'].map((choice) => (
              <button
                key={choice}
                onClick={() => makeChoice(choice)}
                className={`choice-btn ${playerChoice === choice ? 'selected' : ''}`}
                disabled={playerChoice !== null}
              >
                <span className="choice-icon">{choice === 'odd' ? '1' : '2'}</span>
                <span className="choice-label">{choice}</span>
              </button>
            ))}
          </div>
        );

      case 'number-guess':
        return (
          <div className="number-guess-area">
            <div className="guess-label">Pick a number (1-100)</div>
            <input
              type="number"
              min="1"
              max="100"
              value={playerChoice || ''}
              onChange={(e) => setPlayerChoice(parseInt(e.target.value) || null)}
              className="number-input"
              disabled={countdown !== null}
            />
            <button
              onClick={() => playerChoice && setCountdown(3)}
              className="submit-guess"
              disabled={!playerChoice || countdown !== null}
            >
              LOCK IN
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="app">
      <div className="scanlines"></div>
      <div className="grid-bg"></div>

      <header className="header">
        <div className="logo">
          <span className="logo-icon">⚔️</span>
          <span className="logo-text">WAGER<span className="logo-accent">ARENA</span></span>
        </div>
        <div className="header-stats">
          <div className="stat">
            <span className="stat-value">1,234</span>
            <span className="stat-label">LIVE PLAYERS</span>
          </div>
          <div className="stat">
            <span className="stat-value">$892K</span>
            <span className="stat-label">24H VOLUME</span>
          </div>
        </div>
      </header>

      <main className="main">
        {!selectedGame ? (
          <section className="lobby">
            <div className="lobby-header">
              <h1 className="lobby-title">SELECT YOUR ARENA</h1>
              <p className="lobby-subtitle">Humans vs AI • Provably Fair • Any Token</p>
            </div>

            <div className="games-grid">
              {games.map((game, index) => (
                <button
                  key={game.id}
                  className="game-card"
                  onClick={() => setSelectedGame(game)}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="game-card-glow"></div>
                  <div className="game-card-content">
                    <span className="game-icon">{game.icon}</span>
                    <h3 className="game-name">{game.name}</h3>
                    <p className="game-desc">{game.description}</p>
                    <div className="game-stats">
                      <span className="live-dot"></span>
                      <span>{game.spectators} watching</span>
                      <span className="divider">•</span>
                      <span>{game.activePlayers} playing</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </section>
        ) : (
          <section className="arena">
            <button className="back-btn" onClick={resetToLobby}>
              ← BACK TO LOBBY
            </button>

            <div className="arena-header">
              <span className="arena-icon">{selectedGame.icon}</span>
              <h2 className="arena-title">{selectedGame.name}</h2>
              <div className="spectator-count">
                <span className="live-dot"></span>
                {selectedGame.spectators} spectating
              </div>
            </div>

            {gameState === 'lobby' && (
              <div className="wager-setup">
                <div className="setup-section">
                  <label className="setup-label">OPPONENT</label>
                  <div className="opponent-toggle">
                    <button
                      className={`toggle-btn ${isAIOpponent ? 'active' : ''}`}
                      onClick={() => setIsAIOpponent(true)}
                    >
                      🤖 AI
                    </button>
                    <button
                      className={`toggle-btn ${!isAIOpponent ? 'active' : ''}`}
                      onClick={() => setIsAIOpponent(false)}
                    >
                      👤 Human
                    </button>
                  </div>
                </div>

                <div className="setup-section">
                  <label className="setup-label">WAGER AMOUNT</label>
                  <div className="wager-input-group">
                    <input
                      type="text"
                      value={wagerAmount}
                      onChange={(e) => setWagerAmount(e.target.value)}
                      className="wager-input"
                    />
                    <select
                      value={selectedToken}
                      onChange={(e) => setSelectedToken(e.target.value)}
                      className="token-select"
                    >
                      {tokens.map((token) => (
                        <option key={token} value={token}>{token}</option>
                      ))}
                    </select>
                  </div>
                  <div className="quick-amounts">
                    {['0.01', '0.1', '0.5', '1.0'].map((amt) => (
                      <button
                        key={amt}
                        className="quick-amt"
                        onClick={() => setWagerAmount(amt)}
                      >
                        {amt}
                      </button>
                    ))}
                  </div>
                </div>

                <button className="start-btn" onClick={startGame}>
                  <span className="start-btn-text">ENTER ARENA</span>
                  <span className="start-btn-wager">{wagerAmount} {selectedToken}</span>
                </button>
              </div>
            )}

            {gameState === 'playing' && (
              <div className="game-area">
                <div className="versus-display">
                  <div className="player-side">
                    <div className="player-avatar">👤</div>
                    <div className="player-name">YOU</div>
                  </div>
                  <div className="versus-text">VS</div>
                  <div className="player-side opponent">
                    <div className="player-avatar">{isAIOpponent ? '🤖' : '👤'}</div>
                    <div className="player-name">{isAIOpponent ? 'AI' : 'OPPONENT'}</div>
                  </div>
                </div>

                {countdown !== null && countdown > 0 && (
                  <div className="countdown">
                    <span className="countdown-number">{countdown}</span>
                  </div>
                )}

                {renderGameUI()}

                <div className="pot-display">
                  <span className="pot-label">POT</span>
                  <span className="pot-amount">{parseFloat(wagerAmount) * 2} {selectedToken}</span>
                </div>
              </div>
            )}

            {gameState === 'result' && (
              <div className={`result-screen ${result}`}>
                <div className="result-banner">
                  {result === 'win' && <span className="result-text win">VICTORY!</span>}
                  {result === 'lose' && <span className="result-text lose">DEFEAT</span>}
                  {result === 'draw' && <span className="result-text draw">DRAW</span>}
                </div>

                <div className="result-details">
                  <div className="result-choice">
                    <span className="choice-owner">You</span>
                    <span className="choice-made">{String(playerChoice)}</span>
                  </div>
                  <div className="result-vs">VS</div>
                  <div className="result-choice">
                    <span className="choice-owner">{isAIOpponent ? 'AI' : 'Opponent'}</span>
                    <span className="choice-made">{String(opponentChoice)}</span>
                  </div>
                </div>

                {result === 'win' && (
                  <div className="winnings">
                    <span className="winnings-label">YOU WON</span>
                    <span className="winnings-amount">+{wagerAmount} {selectedToken}</span>
                  </div>
                )}

                <div className="result-actions">
                  <button className="action-btn rematch" onClick={startGame}>
                    REMATCH
                  </button>
                  <button className="action-btn lobby" onClick={resetToLobby}>
                    NEW GAME
                  </button>
                </div>
              </div>
            )}
          </section>
        )}
      </main>

      <footer className="footer">
        <span>Requested by @proto_gogo · Built by @clonkbot</span>
      </footer>
    </div>
  );
}

export default App;
