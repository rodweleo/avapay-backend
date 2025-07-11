# AvaPay Backend

A backend service that enables buying AVAX (Avalanche) cryptocurrency using M-Pesa mobile money payments.

## Features

- M-Pesa STK Push integration for payments
- Real-time AVAX/KES exchange rate fetching
- Avalanche C-Chain integration (both Mainnet and Testnet)
- WebSocket support for real-time transaction updates
- Wallet balance checking
- Automated AVAX distribution after successful M-Pesa payments

## Tech Stack

- Node.js with TypeScript
- Express.js for REST API
- Socket.IO for real-time updates
- Winston for logging
- Ethers.js for Avalanche blockchain interactions
- Axios for HTTP requests

## Prerequisites

- Node.js 20.18.0 or higher
- M-Pesa developer account
- Avalanche C-Chain wallet with AVAX

## Environment Variables

Create a `.env` file in the root directory:

```env
PORT=3000
AVALANCHE_C_CHAIN_MAINNET_RPC_URL=<mainnet-rpc-url>
AVALANCHE_C_CHAIN_TESTNET_RPC_URL=<testnet-rpc-url>
AVALANCHE_WS_MAINNET_RPC_URL=<mainnet-ws-url>
AVALANCHE_WS_TESTNET_RPC_URL=<testnet-ws-url>
APP_WALLET_PRIVATE_KEY=<your-wallet-private-key>
MPESA_CONSUMER_KEY=<mpesa-consumer-key>
MPESA_CONSUMER_SECRET=<mpesa-consumer-secret>
MPESA_SHORTCODE=<mpesa-shortcode>
MPESA_CALLBACK_URL=<your-callback-url>
MPESA_PASSKEY=<mpesa-passkey>
PRODUCTION_BACKEND_URL=<production-url>
```

## Installation

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Start the server
npm start

# Development mode
npm run dev
```

## API Endpoints

### Wallet Routes
- `GET /wallet/balance` - Get AVAX balance for a wallet address

### Transaction Routes
- `POST /transactions/buy-avax` - Initiate AVAX purchase with M-Pesa
- `POST /transactions/mpesa/payment/stkCallbackURL` - M-Pesa callback handler
- `POST /transactions/sendAvax` - Send AVAX to user wallet

## Deployment

The project is configured for deployment on both Vercel and Fly.io:

### Fly.io Deployment
```bash
fly launch
fly deploy
```

### Docker Support
```bash
docker build -t avapay-backend .
docker run -p 3000:3000 avapay-backend
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.