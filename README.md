# CryptoTicker

A real-time cryptocurrency ticker that shows INR trading pairs from CoinDCX and their corresponding rates.

## Features

- Real-time price updates every 10 seconds
- Shows INR trading pairs
- Displays Buy and Sell ranges
- Sortable columns
- Responsive design

## Live Demo

Visit [https://YOUR_USERNAME.github.io/crypticker](https://YOUR_USERNAME.github.io/crypticker) to see the static version.

**Note:** The live demo is static. For real-time data, you need to run the server locally.

## Local Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/YOUR_USERNAME/crypticker.git
   cd crypticker
   ```

2. Build the server:
   ```bash
   go build
   ```

3. Run the server:
   ```bash
   ./crypticker_PLATFORM_ARCH_vX
   ```
   Replace PLATFORM_ARCH_vX with your platform's binary name (e.g., crypticker_darwin_arm64_v7)

4. Open your browser:
   The server will automatically open http://localhost:3000

## Building for Different Platforms

Use the provided build scripts:

Windows:
```bash
.\build.bat
```

macOS/Linux:
```bash
./build.sh
```

Or build for specific platforms:
```bash
./build.sh macarm winamd
```

## License

MIT License 