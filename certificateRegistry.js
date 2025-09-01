import { RegistryClient, PrivateKey, KeyDeriver, Utils } from '@bsv/sdk';
import { WalletStorageManager, Services, Wallet, StorageClient, WalletSigner } from '@bsv/wallet-toolbox-client'
import dotenv from 'dotenv';
dotenv.config();

const CHAIN = process.env.CHAIN;
const SERVER_PRIVATE_KEY = process.env.SERVER_PRIVATE_KEY;
const WALLET_STORAGE_URL = process.env.WALLET_STORAGE_URL;
const CERT_TYPE = process.env.CERT_TYPE;

async function makeWallet(chain, storageURL, privateKey) {
    const keyDeriver = new KeyDeriver(new PrivateKey(privateKey, 'hex'));
    const storageManager = new WalletStorageManager(keyDeriver.identityKey);
    const signer = new WalletSigner(chain, keyDeriver, storageManager);
    const services = new Services(chain);
    const wallet = new Wallet(signer, services);
    const client = new StorageClient(
        wallet,
        storageURL
    );
    await client.makeAvailable();
    await storageManager.addWalletStorageProvider(client);
    return wallet;
}

const main = async () => {
    const serverWallet = await makeWallet(CHAIN, WALLET_STORAGE_URL, SERVER_PRIVATE_KEY);
    const { publicKey } = await serverWallet.getPublicKey({ identityKey: true });

    if (!serverWallet) {
        console.log('Server wallet not found');
        return;
    }

    const client = new RegistryClient(serverWallet);

    const fieldDescriptions = {
        name: {
            type: 'imageURL',
            friendlyName: 'Name',
            description: 'Name of the person',
            fieldIcon: 'https://raw.githubusercontent.com/bitcoin-sv/bsv-faucet/refs/heads/main/public/Blue_Person_RGB.png',
        },
        email: {
            type: 'imageURL',
            friendlyName: 'Email',
            description: 'Email of the person',
            fieldIcon: 'https://raw.githubusercontent.com/bitcoin-sv/bsv-faucet/refs/heads/main/public/Blue_Envelope_RGB.png',
        },
    }

    const certDefinition = {
        definitionType: 'certificate',
        type: Utils.toBase64(Utils.toArray(CERT_TYPE, 'utf8')), // Certificate type identifier
        name: 'BSVA Certificate', // Name you want your certificate to show up as in Metanet desktop/mobile
        iconURL: 'https://raw.githubusercontent.com/bitcoin-sv/bsv-faucet/refs/heads/main/public/BSV_ASSOCIATION_PRIMARY_LOGO_BLUE_STACKED_RGB-300.png', // Main certificate Icon
        description: 'Certificate from BSVACerts Microsoft SSO',
        documentationURL: 'https://github.com/bsv-blockchain-demos/sso-cert-demo',
        fields: fieldDescriptions, // Extra description for each certificate field
    }

    const res = await client.registerDefinition(certDefinition);
    console.log(res);
}

main();