import React, { useState, useEffect } from 'react';
import './styles.css';

// Conditional import of Capacitor modules
// This allows the app to run in web environments without native functionality
let Capacitor, Haptics, CapApp, Storage, StatusBar;

try {
  // Try to import the real Capacitor modules
  Capacitor = require('@capacitor/core').Capacitor;
  Haptics = require('@capacitor/haptics').Haptics;
  CapApp = require('@capacitor/app').App;
  Storage = require('@capacitor/storage').Storage;
  StatusBar = require('@capacitor/status-bar').StatusBar;
} catch (error) {
  // If import fails, use web compatibility implementations
  const webCompat = require('./capacitor-web-compat');
  Capacitor = webCompat.Capacitor;
  Haptics = webCompat.Haptics;
  CapApp = webCompat.CapApp;
  Storage = webCompat.Storage;
  StatusBar = webCompat.StatusBar;
  console.log('Running in web-only mode with limited functionality');
}

// Card deck utilities
const suits = ['Hearts', 'Diamonds', 'Clubs', 'Spades'];
const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

// Create a full deck of cards
const createDeck = () => {
  const deck = [];
  for (const suit of suits) {
    for (const value of values) {
      deck.push({ suit, value });
    }
  }
  return deck;
};

// Shuffle the deck using Fisher-Yates algorithm
const shuffleDeck = (deck) => {
  const newDeck = [...deck];
  for (let i = newDeck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
  }
  return newDeck;
};

// Calculate the numeric value of a card
const getCardValue = (card) => {
  if (card.value === 'A') return 1;
  if (card.value === 'J') return 11;
  if (card.value === 'Q') return 12;
  if (card.value === 'K') return 13;
  return parseInt(card.value);
};

// Calculate the sum of cards in a hand
const calculateHandSum = (hand) => {
  return hand.reduce((sum, card) => sum + getCardValue(card), 0);
};

// Get card symbol based on suit
const getCardSymbol = (suit) => {
  switch (suit) {
    case 'Hearts': return '♥';
    case 'Diamonds': return '♦';
    case 'Clubs': return '♣';
    case 'Spades': return '♠';
    default: return '';
  }
};

// Get color for suit (red for Hearts/Diamonds, black for Clubs/Spades)
const getCardColor = (suit) => {
  return suit === 'Hearts' || suit === 'Diamonds' ? 'red' : 'black';
};

function App() {
  // Game state variables
  const [gameStarted, setGameStarted] = useState(false);
  const [numPlayers, setNumPlayers] = useState(2);
  const [numRounds, setNumRounds] = useState(5);
  const [currentRound, setCurrentRound] = useState(1);
  const [players, setPlayers] = useState([]);
  const [currentTurnIndex, setCurrentTurnIndex] = useState(0);
  const [tableCard, setTableCard] = useState(null);
  const [selectedCards, setSelectedCards] = useState([]);
  const [showWinner, setShowWinner] = useState(false);
  const [gameWinners, setGameWinners] = useState([]);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [deck, setDeck] = useState([]);
  const [discardPile, setDiscardPile] = useState([]);
  const [roundWinner, setRoundWinner] = useState(null);
  const [showPlayerScreen, setShowPlayerScreen] = useState(false);
  const [activePlayerName, setActivePlayerName] = useState('');
  const [playerNames, setPlayerNames] = useState(Array(numPlayers).fill('').map((_, i) => `Player ${i + 1}`));
  const [roundEnded, setRoundEnded] = useState(false);
  const [gameMessage, setGameMessage] = useState('');
  const [isFirstPlayerOfRound, setIsFirstPlayerOfRound] = useState(true);
  const [isGameRestored, setIsGameRestored] = useState(false);
  
  // Initialize status bar (if on native platform)
  useEffect(() => {
    const setupStatusBar = async () => {
      if (Capacitor.isNativePlatform()) {
        try {
          StatusBar.setBackgroundColor({ color: '#2196f3' });
          StatusBar.setStyle({ style: 'DARK' });
        } catch (error) {
          console.error('Error setting status bar:', error);
        }
      }
    };
    
    setupStatusBar();
  }, []);
  
  // Load saved game - enhanced for web support
  useEffect(() => {
    const loadSavedGame = async () => {
      try {
        const { value } = await Storage.get({ key: 'faduGameState' });
        if (value) {
          const savedState = JSON.parse(value);
          
          setGameStarted(savedState.gameStarted);
          setNumPlayers(savedState.numPlayers);
          setNumRounds(savedState.numRounds);
          setCurrentRound(savedState.currentRound);
          setPlayers(savedState.players);
          setCurrentTurnIndex(savedState.currentTurnIndex);
          setTableCard(savedState.tableCard);
          setDeck(savedState.deck);
          setDiscardPile(savedState.discardPile);
          setRoundWinner(savedState.roundWinner);
          setPlayerNames(savedState.playerNames);
          setRoundEnded(savedState.roundEnded);
          setIsFirstPlayerOfRound(savedState.isFirstPlayerOfRound);
          
          // If a game is in progress, show the player transition screen
          if (savedState.gameStarted && !savedState.roundEnded) {
            setActivePlayerName(savedState.players[savedState.currentTurnIndex].name);
            setShowPlayerScreen(true);
          }
          
          setIsGameRestored(true);
        }
      } catch (error) {
        console.error('Error loading saved game:', error);
      }
    };
    
    loadSavedGame();
    
    // Set up back button handling
    let backButtonListener;
    if (Capacitor.isNativePlatform()) {
      backButtonListener = CapApp.addListener('backButton', (e) => {
        // If in the main game screen, show a confirm dialog
        if (gameStarted && !showPlayerScreen && !roundEnded && !showWinner) {
          if (window.confirm('Do you want to exit the game? Your progress will be saved.')) {
            saveGameState();
            CapApp.exitApp();
          }
        } else {
          // Handle other screens
          if (showWinner) {
            resetGame();
          } else if (roundEnded) {
            handleNextRound();
          } else if (showPlayerScreen) {
            // Stay on player screen
          } else {
            CapApp.exitApp();
          }
        }
      });
    }
    
    // Add visibilitychange event listener
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      if (Capacitor.isNativePlatform() && backButtonListener) {
        backButtonListener.remove();
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [gameStarted, showPlayerScreen, roundEnded, showWinner]);
  
  // Save game state when app is paused or backgrounded
  const handleVisibilityChange = () => {
    if (document.visibilityState === 'hidden') {
      saveGameState();
    }
  };
  
  // Save game state - enhanced for web support
  const saveGameState = async () => {
    if (!gameStarted) return;
    
    const gameState = {
      gameStarted,
      numPlayers,
      numRounds,
      currentRound,
      players,
      currentTurnIndex,
      tableCard,
      deck,
      discardPile,
      roundWinner,
      playerNames,
      roundEnded,
      isFirstPlayerOfRound
    };
    
    try {
      await Storage.set({
        key: 'faduGameState',
        value: JSON.stringify(gameState)
      });
      
      if (!Capacitor.isNativePlatform()) {
        console.log('Game state saved to browser storage');
      }
    } catch (error) {
      console.error('Error saving game state:', error);
      if (!Capacitor.isNativePlatform()) {
        // Show a more discreet message for web
        console.warn('Game progress may not be saved in private/incognito mode');
      }
    }
  };
  
  // Helper function to check if a player has cards matching the table card
  const playerHasMatchingCards = (playerHand) => {
    if (!tableCard) return false;
    return playerHand.some(card => getCardValue(card) === getCardValue(tableCard));
  };

  // Trigger haptic feedback - enhanced for web visual feedback
  const triggerHapticFeedback = async (type = 'medium') => {
    try {
      if (type === 'light') {
        await Haptics.impact({ style: 'light' });
      } else if (type === 'medium') {
        await Haptics.impact({ style: 'medium' });
      } else if (type === 'heavy') {
        await Haptics.impact({ style: 'heavy' });
      } else if (type === 'success') {
        await Haptics.notification({ type: 'SUCCESS' });
      } else if (type === 'warning') {
        await Haptics.notification({ type: 'WARNING' });
      } else if (type === 'error') {
        await Haptics.notification({ type: 'ERROR' });
      }
    } catch (error) {
      console.error('Haptics not available:', error);
    }
  };
  
  // Toggle card selection
  const toggleCardSelection = (index) => {
    if (currentTurnIndex === null) return;
    
    // If the card is already selected, remove it from selection
    if (selectedCards.includes(index)) {
      setSelectedCards(selectedCards.filter(i => i !== index));
      triggerHapticFeedback('light');
      return;
    }
    
    // Get the card being selected
    const currentPlayer = players[currentTurnIndex];
    const newCard = currentPlayer.hand[index];
    
    // FIRST CARD SELECTION RULES
    if (selectedCards.length === 0) {
      // Rule 1: First player of round must draw first (regardless of matching cards)
      if (isFirstPlayerOfRound && !hasDrawn) {
        setGameMessage("First player of each round must draw a card first.");
        triggerHapticFeedback('warning');
        return;
      }
      
      // Rule 2: If player hasn't drawn yet AND is NOT first player of round
      if (!hasDrawn && !isFirstPlayerOfRound) {
        // Check if player has any cards matching the table card
        const hasMatchingCards = playerHasMatchingCards(currentPlayer.hand);
        
        if (hasMatchingCards) {
          // If trying to select a non-matching card, block selection
          if (getCardValue(newCard) !== getCardValue(tableCard)) {
            setGameMessage(`You have cards matching the ${tableCard.value}. You must play one of these matching cards or draw first.`);
            triggerHapticFeedback('warning');
            return;
          }
          // Allow selection of matching cards (continue to the add card section)
        } else {
          // If player has no matching cards, they must draw first
          setGameMessage("You don't have any matching cards. You must draw a card first.");
          triggerHapticFeedback('warning');
          return;
        }
      }
      // If player has drawn already, they can select any card (continue to the add card section)
    } 
    // MULTIPLE CARD SELECTION RULES
    else {
      const firstSelectedCard = currentPlayer.hand[selectedCards[0]];
      
      // Rule 1: All cards in a multi-card play must have the same value
      if (getCardValue(firstSelectedCard) !== getCardValue(newCard)) {
        setGameMessage("You can only select multiple cards with the same value.");
        triggerHapticFeedback('warning');
        return;
      }
      
      // Rule 2: When playing multiple cards, they must match the table card value
      if (tableCard && getCardValue(firstSelectedCard) !== getCardValue(tableCard)) {
        setGameMessage("When playing multiple cards, they must match the value of the table card.");
        triggerHapticFeedback('warning');
        return;
      }
    }
    
    // Add card to selection if it passed all validation
    triggerHapticFeedback('medium');
    setSelectedCards([...selectedCards, index]);
  };

  // Initialize the game
  const initializeGame = () => {
    // Create and shuffle the deck
    const newDeck = shuffleDeck(createDeck());
    
    // Initialize players with 5 cards each
    const initialPlayers = [];
    for (let i = 0; i < numPlayers; i++) {
      const hand = newDeck.splice(0, 5);
      initialPlayers.push({
        id: i,
        name: playerNames[i],
        hand,
        score: 0
      });
    }
    
    // Set the first card on the table
    const initialTableCard = newDeck.splice(0, 1)[0];
    
    setDeck(newDeck);
    setPlayers(initialPlayers);
    setTableCard(initialTableCard);
    setDiscardPile([]);
    setCurrentTurnIndex(0);
    setHasDrawn(false);
    setSelectedCards([]);
    setShowWinner(false);
    setRoundEnded(false);
    setGameMessage('');
    setIsFirstPlayerOfRound(true);
    
    // First player's turn
    setActivePlayerName(initialPlayers[0].name);
    setShowPlayerScreen(true);
    
    // Save initial game state
    saveGameState();
  };

  // Start a new round
  const startNewRound = () => {
    // Create and shuffle the deck
    const newDeck = shuffleDeck(createDeck());
    
    // Reset players' hands with 5 cards each
    const updatedPlayers = players.map(player => {
      return {
        ...player,
        hand: newDeck.splice(0, 5)
      };
    });
    
    // Set the first card on the table
    const initialTableCard = newDeck.splice(0, 1)[0];
    
    setDeck(newDeck);
    setPlayers(updatedPlayers);
    setTableCard(initialTableCard);
    setDiscardPile([]);
    
    // The winner of the last round goes first
    const startingPlayerIndex = roundWinner !== null ? 
      players.findIndex(p => p.id === roundWinner) : 0;
    
    setCurrentTurnIndex(startingPlayerIndex);
    setHasDrawn(false);
    setSelectedCards([]);
    setRoundEnded(false);
    setGameMessage('');
    setIsFirstPlayerOfRound(true);
    
    // First player's turn
    setActivePlayerName(updatedPlayers[startingPlayerIndex].name);
    setShowPlayerScreen(true);
    
    // Save game state
    saveGameState();
  };

  // Handle player name changes
  const handlePlayerNameChange = (index, name) => {
    const newPlayerNames = [...playerNames];
    newPlayerNames[index] = name;
    setPlayerNames(newPlayerNames);
  };

  // Handle the start game button
  const handleStartGame = () => {
    triggerHapticFeedback('medium');
    setGameStarted(true);
    initializeGame();
  };

  // Draw a card for the current player
  const drawCard = () => {
    if (currentTurnIndex === null || hasDrawn) return;
    
    triggerHapticFeedback('medium');
    
    // If deck is almost empty, reshuffle the discard pile
    if (deck.length < 5 && discardPile.length > 0) {
      const newDeck = shuffleDeck([...discardPile]);
      setDeck([...deck, ...newDeck]);
      setDiscardPile([]);
    }
    
    // If deck is completely empty, can't draw
    if (deck.length === 0) {
      setGameMessage("The deck is empty. You must play a card or call.");
      triggerHapticFeedback('warning');
      return;
    }
    
    // Draw a card from the deck
    const newCard = deck[0];
    const newDeck = deck.slice(1);
    
    // Add card to player's hand
    const updatedPlayers = [...players];
    updatedPlayers[currentTurnIndex].hand.push(newCard);
    
    setDeck(newDeck);
    setPlayers(updatedPlayers);
    setHasDrawn(true);
    setGameMessage("You've drawn a card. Now you can play any single card, or multiple cards that match the table card.");
    
    // Save game state
    saveGameState();
  };

  // Play selected cards from the current player's hand
  const playCard = () => {
    if (currentTurnIndex === null || selectedCards.length === 0) return;
    
    const currentPlayer = players[currentTurnIndex];
    
    // Get the selected cards
    const cardIndices = [...selectedCards].sort((a, b) => b - a); // Sort in descending order to avoid index issues
    const firstCard = currentPlayer.hand[selectedCards[0]];
    
    // TURN BASED RULES
    
    // RULE 1: First player of round must draw first
    if (isFirstPlayerOfRound && !hasDrawn) {
      setGameMessage("First player of each round must draw a card first.");
      triggerHapticFeedback('warning');
      return;
    }
    
    // RULE 2: If player hasn't drawn yet AND is NOT first player of round
    if (!hasDrawn && !isFirstPlayerOfRound) {
      // Check if player has any cards matching the table card
      const hasMatchingCards = playerHasMatchingCards(currentPlayer.hand);
      
      // If they have matching cards, verify they are playing matching cards
      if (hasMatchingCards) {
        if (getCardValue(firstCard) !== getCardValue(tableCard)) {
          setGameMessage("You have cards matching the table card. You must play those or draw first.");
          triggerHapticFeedback('warning');
          return;
        }
      } else {
        // If they have no matching cards, they must draw first
        setGameMessage("You don't have any cards matching the table card. You must draw first.");
        triggerHapticFeedback('warning');
        return;
      }
    }
    
    // CARD VALIDATION RULES
    
    // RULE 3: All cards played together must have the same value
    if (selectedCards.length > 1) {
      const allSameValue = selectedCards.every(index => 
        getCardValue(currentPlayer.hand[index]) === getCardValue(firstCard)
      );
      
      if (!allSameValue) {
        setGameMessage("You can only play multiple cards of the same value.");
        triggerHapticFeedback('warning');
        return;
      }
    }
    
    // RULE 4: When playing multiple cards, they must always match the table card value
    if (selectedCards.length > 1 && tableCard && getCardValue(firstCard) !== getCardValue(tableCard)) {
      setGameMessage("When playing multiple cards, they must match the value of the table card.");
      triggerHapticFeedback('warning');
      return;
    }
    
    // RULE 5: After drawing, if playing a single card, it can be any card
    // (This is implicitly allowed by not adding any additional restrictions here)
    
    // Play the cards
    triggerHapticFeedback('success');
    const updatedPlayers = [...players];
    
    // Move current table card to discard pile if exists
    if (tableCard) {
      setDiscardPile([...discardPile, tableCard]);
    }
    
    // Remove cards from hand in reverse order (to avoid index shifting issues)
    let lastCardPlayed;
    for (const index of cardIndices) {
      lastCardPlayed = updatedPlayers[currentTurnIndex].hand.splice(index, 1)[0];
    }
    
    // Set the last card played as the new table card
    setTableCard(lastCardPlayed);
    setPlayers(updatedPlayers);
    setSelectedCards([]);
    
    // Check if player has emptied their hand
    if (updatedPlayers[currentTurnIndex].hand.length === 0) {
      // Award +4 points for emptying hand
      updatedPlayers[currentTurnIndex].score += 4;
      setPlayers(updatedPlayers);
      
      // End the round
      endRound(updatedPlayers[currentTurnIndex].id);
      return;
    }
    
    // Move to next player
    nextTurn();
    
    // Save game state
    saveGameState();
  };

  // Handle a call (claiming lowest sum)
  const handleCall = () => {
    if (currentTurnIndex === null) return;
    
    // Players can only call at the start of their turn (before drawing)
    if (hasDrawn) {
      setGameMessage("You can only call at the start of your turn (before drawing).");
      triggerHapticFeedback('warning');
      return;
    }
    
    const currentPlayer = players[currentTurnIndex];
    
    // Calculate the sum of all players' hands
    const handSums = players.map(player => ({
      id: player.id,
      sum: calculateHandSum(player.hand)
    }));
    
    // Find the minimum sum
    const minSum = Math.min(...handSums.map(h => h.sum));
    
    // Find players with the minimum sum
    const playersWithMinSum = handSums.filter(h => h.sum === minSum);
    
    // Check if the caller has the unique minimum sum
    const updatedPlayers = [...players];
    if (playersWithMinSum.length === 1 && playersWithMinSum[0].id === currentPlayer.id) {
      // Successful call: +3 points
      updatedPlayers[currentTurnIndex].score += 3;
      setGameMessage(`${currentPlayer.name} called successfully! +3 points`);
      triggerHapticFeedback('success');
    } else {
      // Failed call: -2 points for caller, +1 for each player with minimum sum
      updatedPlayers[currentTurnIndex].score -= 2;
      setGameMessage(`${currentPlayer.name} called unsuccessfully! -2 points`);
      triggerHapticFeedback('error');
      
      // Award +1 point to players with minimum sum
      playersWithMinSum.forEach(player => {
        if (player.id !== currentPlayer.id) {
          const playerIndex = updatedPlayers.findIndex(p => p.id === player.id);
          updatedPlayers[playerIndex].score += 1;
        }
      });
    }
    
    setPlayers(updatedPlayers);
    
    // End the round
    endRound(currentPlayer.id);
    
    // Save game state
    saveGameState();
  };

  // Handle the game logic when a player takes their turn
  const handleTurn = () => {
    setGameMessage('');
    
    const currentPlayer = players[currentTurnIndex];
    
    // At the start of a turn, explain the player's options
    if (!hasDrawn) {
      // First player of the round must draw
      if (isFirstPlayerOfRound) {
        setGameMessage("You're the first player this round. You must draw a card first.");
        return;
      }
      
      // Check if player has cards matching the table card
      const hasMatchingCard = playerHasMatchingCards(currentPlayer.hand);
      
      if (hasMatchingCard) {
        setGameMessage(`You have cards matching the ${tableCard?.value}. You can play these matching cards without drawing, or draw a card first to play any card.`);
      } else {
        setGameMessage("You don't have any matching cards. You must draw a card first.");
      }
    } else {
      // After drawing, player can play any single card
      setGameMessage("You've drawn a card. Now you can play any single card, or multiple cards that match the table card.");
    }
  };
  
  // Move to the next player's turn
  const nextTurn = () => {
    const nextIndex = (currentTurnIndex + 1) % numPlayers;
    
    // Reset all turn-specific state
    setCurrentTurnIndex(nextIndex);
    setHasDrawn(false);
    setSelectedCards([]);  // Ensure no cards remain selected from previous player
    setActivePlayerName(players[nextIndex].name);
    setShowPlayerScreen(true);
    setGameMessage(''); // Clear any previous game messages
    
    // IMPORTANT: This player is no longer the first player of the round
    setIsFirstPlayerOfRound(false);
  };

  // End the current round
  const endRound = (winningPlayerId) => {
    setRoundEnded(true);
    setRoundWinner(winningPlayerId);
    
    // Check if this was the last round
    if (currentRound >= numRounds) {
      endGame();
    } else {
      setCurrentRound(currentRound + 1);
    }
    
    // Save game state
    saveGameState();
  };

  // End the game and determine the winner - enhanced for web
  const endGame = () => {
    // Find the maximum score
    const maxScore = Math.max(...players.map(p => p.score));
    
    // Find all players with the maximum score (could be multiple in case of a tie)
    const winners = players.filter(p => p.score === maxScore);
    
    setGameWinners(winners);
    setShowWinner(true);
    
    // Clear saved game state in all environments
    Storage.remove({ key: 'faduGameState' })
      .catch(error => console.error('Error clearing saved game:', error));
  };

  // Reset the game to start a new one - enhanced for web
  const resetGame = () => {
    setGameStarted(false);
    setShowWinner(false);
    setGameWinners([]);
    setPlayers([]);
    setTableCard(null);
    setSelectedCards([]);
    setCurrentRound(1);
    setHasDrawn(false);
    setPlayerNames(Array(numPlayers).fill('').map((_, i) => `Player ${i + 1}`));
    setRoundEnded(false);
    setIsFirstPlayerOfRound(true);
    
    // Clear saved game state in all environments
    Storage.remove({ key: 'faduGameState' })
      .catch(error => console.error('Error clearing saved game:', error));
  };

  // Start the next round
  const handleNextRound = () => {
    startNewRound();
  };

  // When player is ready to start their turn
  const handleReady = () => {
    triggerHapticFeedback('medium');
    setShowPlayerScreen(false);
    handleTurn();
  };

  // Resume saved game
  const handleResumeGame = () => {
    triggerHapticFeedback('medium');
    setIsGameRestored(false);
  };

  // Start new game instead of resuming - enhanced for web
  const handleNewGameInstead = () => {
    triggerHapticFeedback('medium');
    
    // Clear storage in all environments
    Storage.remove({ key: 'faduGameState' })
      .catch(error => console.error('Error clearing saved game:', error));
    
    resetGame();
    setIsGameRestored(false);
  };

  // Render resume game prompt
  if (isGameRestored && gameStarted) {
    return (
      <div className="game-container">
        <div className="player-transition">
          <h1>Game in Progress</h1>
          <p>You have a saved game. Would you like to resume?</p>
          <button 
            className="start-button"
            onClick={handleResumeGame}
            style={{ marginBottom: '16px' }}
          >
            Resume Game
          </button>
          <button 
            className="start-button"
            onClick={handleNewGameInstead}
            style={{ backgroundColor: '#f44336' }}
          >
            Start New Game
          </button>
        </div>
      </div>
    );
  }

  // Render setup screen
  if (!gameStarted) {
    return (
      <div className="game-container">
        <div className="setup-form">
          <h1 className="title">Fadu Card Game</h1>
          
          <div className="input-group">
            <label>Number of Players:</label>
            <input
              type="number"
              min="2"
              max="8"
              value={numPlayers}
              onChange={(e) => {
                const newNum = parseInt(e.target.value);
                setNumPlayers(newNum);
                setPlayerNames(Array(newNum).fill('').map((_, i) => `Player ${i + 1}`));
              }}
            />
          </div>
          
          <div className="input-group">
            <label>Number of Rounds:</label>
            <input
              type="number"
              min="1"
              value={numRounds}
              onChange={(e) => setNumRounds(parseInt(e.target.value))}
            />
          </div>
          
          <div className="player-names-container">
            <h3>Player Names</h3>
            {playerNames.map((name, index) => (
              <div key={index} className="input-group">
                <label>Player {index + 1}:</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => handlePlayerNameChange(index, e.target.value)}
                  placeholder={`Player ${index + 1}`}
                />
              </div>
            ))}
          </div>
          
          <button 
            className="start-button"
            onClick={handleStartGame}
          >
            Start Game
          </button>
        </div>
      </div>
    );
  }

  // Player transition screen
  if (showPlayerScreen) {
    return (
      <div className="game-container">
        <div className="player-transition">
          <h1>{activePlayerName}'s Turn</h1>
          <p>Pass the device to {activePlayerName}</p>
          <button 
            className="start-button"
            onClick={handleReady}
          >
            I'm Ready
          </button>
        </div>
      </div>
    );
  }

  // Round ended screen
  if (roundEnded) {
    return (
      <div className="game-container">
        <div className="round-ended">
          <h1>Round {currentRound - 1} Ended</h1>
          <div className="players-scores">
            <h3>Current Scores:</h3>
            {players.map(player => (
              <div key={player.id} className="player-score">
                {player.name}: {player.score} points
              </div>
            ))}
          </div>
          <button 
            className="start-button"
            onClick={handleNextRound}
          >
            {currentRound > numRounds ? 'See Final Results' : 'Start Round ' + currentRound}
          </button>
        </div>
      </div>
    );
  }

  // Main game screen
  return (
    <div className="game-container">
      <div className="game-board">
        <div className="game-info">
          <div className="round-info">
            Round {currentRound} of {numRounds}
          </div>
          <div className="deck-info">
            Cards in deck: {deck.length}
          </div>
        </div>
        
        <h1 className="title">Current Player: {players[currentTurnIndex]?.name}</h1>
        
        {!Capacitor.isNativePlatform() && (
          <div className="web-note">
            Note: You're playing in a web browser. Card selection is done with a single tap/click. Pass the device physically to the next player when prompted.
          </div>
        )}
        
        <div className="players-list">
          {players.map(player => (
            <div key={player.id} className={`player-info ${player.id === players[currentTurnIndex]?.id ? 'current-turn' : ''}`}>
              {player.name} - Score: {player.score} - Cards: {player.hand.length}
            </div>
          ))}
        </div>

        {gameMessage && (
          <div className="game-message">{gameMessage}</div>
        )}

        <div className="table-area">
          {tableCard && (
            <div 
              className={`playing-card ${getCardColor(tableCard.suit)}`}
              data-suit={tableCard.suit.toLowerCase()}
            >
              <div className="card-corner top-left">
                <div className="card-value">{tableCard.value}</div>
                <div className="card-suit">{getCardSymbol(tableCard.suit)}</div>
              </div>
              <div className="card-center-symbol">{getCardSymbol(tableCard.suit)}</div>
              <div className="card-corner bottom-right">
                <div className="card-value">{tableCard.value}</div>
                <div className="card-suit">{getCardSymbol(tableCard.suit)}</div>
              </div>
            </div>
          )}
        </div>

        <div className="player-hand">
          <h2>Your Cards:</h2>
          <div className="cards-container">
            {players[currentTurnIndex]?.hand.map((card, index) => (
              <div
                key={index}
                className={`playing-card ${getCardColor(card.suit)} ${selectedCards.includes(index) ? 'selected' : ''}`}
                data-suit={card.suit.toLowerCase()}
                onClick={() => toggleCardSelection(index)}
              >
                <div className="card-corner top-left">
                  <div className="card-value">{card.value}</div>
                  <div className="card-suit">{getCardSymbol(card.suit)}</div>
                </div>
                <div className="card-center-symbol">{getCardSymbol(card.suit)}</div>
                <div className="card-corner bottom-right">
                  <div className="card-value">{card.value}</div>
                  <div className="card-suit">{getCardSymbol(card.suit)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="controls">
          <button
            className="game-button"
            onClick={drawCard}
            disabled={hasDrawn}
          >
            Draw Card
          </button>
          <button
            className="game-button"
            onClick={playCard}
            disabled={selectedCards.length === 0}
          >
            Play Selected Cards
          </button>
          <button 
            className="game-button" 
            onClick={handleCall}
            disabled={hasDrawn}
          >
            Call
          </button>
        </div>
      </div>

      {showWinner && (
        <>
          <div className="overlay"></div>
          <div className="winner-announcement">
            <h2>Game Over!</h2>
            {gameWinners.length === 1 ? (
              <p>{gameWinners[0].name} wins with {gameWinners[0].score} points!</p>
            ) : (
              <div>
                <p>It's a tie between:</p>
                {gameWinners.map(winner => (
                  <p key={winner.id}>
                    {winner.name} with {winner.score} points
                  </p>
                ))}
              </div>
            )}
            <button className="start-button" onClick={resetGame}>
              Play Again
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
