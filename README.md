# BSVA Certificate Demo

A demonstration project showcasing how to implement certificate creation with SSO (Single Sign-On) authentication using Microsoft Azure AD. This project demonstrates the integration of BSV blockchain technology with enterprise authentication systems for secure certificate issuance.

## Overview

This application allows users to authenticate via Microsoft SSO and generate BSV certificates that are cryptographically signed and stored on the blockchain. The project serves as a reference implementation for organizations wanting to integrate BSV certificates with their existing authentication infrastructure.

## Architecture

- **Frontend**: Next.js 15 with TypeScript and Tailwind CSS
- **Backend**: Express.js server with BSV SDK integration
- **Authentication**: Microsoft Azure AD SSO
- **Database**: MongoDB for certificate storage
- **Blockchain**: BSV blockchain for certificate verification and revocation

## Key Features

- **SSO Authentication**: Microsoft Azure AD integration for secure user authentication
- **Certificate Generation**: BSV certificates with cryptographic signatures
- **Email Domain Validation**: Ensures only authorized domain users can generate certificates
- **Certificate Revocation**: Built-in revocation mechanism using BSV transactions
- **Metanet Integration**: Certificates can be registered with Metanet desktop application

## Project Structure

```
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── auth/login/         # Microsoft SSO authentication
│   │   ├── generate-certificate/ # Certificate generation endpoint
│   │   └── page.tsx            # Main application page
│   ├── components/             # React components
│   └── lib/                    # Utility functions
├── server/                     # Express backend
│   ├── index.ts               # Main server file
│   └── signCertificate.ts     # Certificate signing logic
├── certificateRegistry.js      # Metanet registration example
└── example.env.txt            # Environment variables template
```

## Prerequisites

- Node.js 18+ and npm
- MongoDB database
- Microsoft Azure AD application
- BSV wallet with storage provider
- Metanet desktop (for certificate registration)

## Environment Setup

1. ### `example.env.txt`
Template file containing all required environment variables with descriptions. Copy this to `.env` and fill in your actual values.

## How to Run the Application

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Express Backend Server
```bash
npm run server
```
The server will start on the port specified in your `.env` file (default: 8080).

### 3. Start the Next.js Development Server
```bash
npm run dev
```
The frontend will be available at [http://localhost:3000](http://localhost:3000).

### 4. Build for Production (Optional)
```bash
npm run build
npm start
```

## Usage Flow

1. **Authentication**: Users click "Microsoft" to authenticate via Azure AD SSO
2. **Email Validation**: System validates the user's email domain matches the configured domain
3. **Certificate Generation**: Authenticated users can generate BSV certificates
4. **Certificate Storage**: Certificates are stored in MongoDB and on the BSV blockchain
5. **Metanet Integration**: Certificates can be registered with Metanet desktop

## Key Files

### `certificateRegistry.js`
Example script demonstrating how to register certificate definitions with Metanet desktop. This file shows:
- Wallet initialization with BSV SDK
- Certificate definition structure
- Registration with Metanet registry

## Certificate Features

- **Cryptographic Signatures**: All certificates are cryptographically signed using BSV private keys
- **Revocation Support**: Built-in revocation mechanism using BSV transactions
- **Field Encryption**: Certificate fields are encrypted during transmission
- **Replay Protection**: Nonce-based replay attack prevention
- **Database Storage**: Certificates stored in MongoDB for quick retrieval

## Development

The project uses:
- **TypeScript** for type safety
- **ESLint** for code linting
- **Tailwind CSS** for styling
- **React Hot Toast** for notifications

### Available Scripts

- `npm run dev` - Start Next.js development server
- `npm run server` - Start Express backend server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Security Considerations

- JWT tokens expire after 5 minutes for security
- Email domain validation prevents unauthorized access
- Certificate fields are encrypted during transmission
- Nonce-based replay protection
- HTTPS recommended for production deployment

## Contributing

This is a demonstration project for BSVA. For production use, consider:
- Enhanced error handling
- Rate limiting
- Comprehensive logging
- Security audits
- Performance optimization

## License

This project is for demonstration purposes as part of the BSV Association's educational initiatives.
