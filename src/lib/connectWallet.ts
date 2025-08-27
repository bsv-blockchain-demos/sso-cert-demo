import { WalletClient } from "@bsv/sdk";

export async function connectWallet() {
    // Connect to wallet with BEEF capabilities
    const wallet = new WalletClient('auto', 'localhost');
    const isConnected = await wallet.isAuthenticated();

    if (isConnected) {
        return wallet;
    }

    return null;
}