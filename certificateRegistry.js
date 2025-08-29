import { RegistryClient, PrivateKey, KeyDeriver, Utils } from '@bsv/sdk';
import { WalletStorageManager, Services, Wallet, StorageClient, WalletSigner } from '@bsv/wallet-toolbox-client'

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

    const client = new RegistryClient({
        serverWallet,
    });

    const fieldDescriptions = {
        name: {
            type: 'text',
            friendlyName: 'Name',
            description: 'Name of the person',
            fieldIcon: 'string',
        },
        email: {
            type: 'text',
            friendlyName: 'Email',
            description: 'Email of the person',
            fieldIcon: 'string',
        },
    }

    const certDefinition = {
        definitionType: 'certificate',
        type: Utils.toBase64(Utils.toArray(CERT_TYPE, 'utf8')), // Certificate type identifier
        name: 'BSVA Certificate', // Name you want your certificate to show up as in Metanet desktop/mobile
        iconURL: 'string', // Main certificate Icon
        description: 'Certificate from BSVACerts Microsoft SSO',
        documentationURL: 'https://github.com/bsv-blockchain-demos/sso-cert-demo',
        fields: fieldDescriptions, // Extra description for each certificate field
        registryOperator: publicKey, // Your server's public key (which initialized the registryClient and signed the certificates)
    }

    const res = await client.registerDefinition(certDefinition);
    console.log(res);
}

main();