# Fadu Card Game

A mobile-friendly card game built with React and Capacitor. This application allows players to enjoy the Fadu card game on both web and mobile platforms.

## Game Overview

Fadu is a strategic card game where players aim to have the lowest sum of cards in their hand. The game features:

- Support for 2-8 players
- Customizable number of rounds
- Player name customization
- Mobile-specific features (haptic feedback, status bar customization)
- Game state saving when app is backgrounded

## Technologies Used

- React.js for UI components and state management
- Capacitor for native mobile capabilities
- HTML/CSS for styling and layout

## Getting Started

### Prerequisites

- Node.js (v14 or newer)
- npm (v6 or newer)
- For mobile development:
  - Android Studio (for Android builds)
  - Xcode (for iOS builds)

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/fadu-card-game.git
   cd fadu-card-game
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Start the development server
   ```bash
   npm start
   ```

### Building for Production

#### Web

```bash
npm run build
```

#### Android

```bash
npm run cap:build
npm run cap:open
```

## Game Rules

- Players take turns drawing and playing cards
- The goal is to have the lowest total value of cards in your hand
- Players can "call" when they believe they have the lowest hand
- A successful call earns bonus points
- After the specified number of rounds, the player with the highest score wins

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
