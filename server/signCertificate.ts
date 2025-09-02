import {
    WalletClient,
    PrivateKey,
    KeyDeriver,
    verifyNonce,
    createNonce,
    Utils,
    Certificate,
    MasterCertificate,
    Script,
    Hash
} from '@bsv/sdk'
import { WalletStorageManager, Services, Wallet, StorageClient, WalletSigner } from '@bsv/wallet-toolbox-client'
import { connectToMongo, usersCollection, User } from '../src/lib/mongo'
import dotenv from 'dotenv'
import { Request, Response } from 'express'
dotenv.config()

const CHAIN = process.env.CHAIN as 'test' | 'main';
const SERVER_PRIVATE_KEY = process.env.SERVER_PRIVATE_KEY as string;
const WALLET_STORAGE_URL = process.env.WALLET_STORAGE_URL as string;

async function makeWallet(chain: 'test' | 'main', storageURL: string, privateKey: string) {
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

export async function signCertificate(req: Request, res: Response) {
    console.log('=== Certificate signing request received ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    try {
        // Body response from Metanet desktop walletclient
        const body = req.body;
        const { clientNonce, type, fields, masterKeyring } = body;
        // Get all wallet info
        const serverWallet = await makeWallet(CHAIN, WALLET_STORAGE_URL, SERVER_PRIVATE_KEY);
        const { publicKey: certifier } = await serverWallet.getPublicKey({ identityKey: true });

        const subject = req.auth?.identityKey || 'test_subject_key';
        if (!subject) {
            return res.status(400).json({ error: 'User wallet not found' });
        }

        const wallet = new WalletClient("auto", "localhost");
        if (!wallet) {
            return res.status(400).json({ error: 'User wallet not found' });
        }

        console.log({ subject })

        // Decrypt certificate fields and verify them before signing
        const decryptedFields = await MasterCertificate.decryptFields(
            serverWallet,
            masterKeyring,
            fields,
            subject
        );

        console.log({ decryptedFields }) // check if we believe this before attesting to it

        // Verify client nonce for replay protection
        console.log('Verifying client nonce for replay protection...');
        try {
            const valid = await verifyNonce(clientNonce, serverWallet, subject);
            if (!valid) {
                console.log('Nonce verification failed for subject:', subject);
                return res.status(400).json({ error: 'Invalid client nonce - replay protection failed' });
            }
            console.log('Client nonce verification passed');
        } catch (nonceError: unknown) {
            console.error('Error during nonce verification:', nonceError);
            if (nonceError instanceof Error) {
                return res.status(400).json({ error: 'Nonce verification error: ' + nonceError.message });
            }
            return res.status(400).json({ error: 'Nonce verification error: ' + nonceError });
        }
        const serverNonce = await createNonce(serverWallet, subject);

        // The server computes a serial number from the client and server nonces
        const { hmac } = await serverWallet.createHmac({
            data: Utils.toArray(clientNonce + serverNonce, 'base64'),
            protocolID: [2, 'certificate issuance'],
            keyID: serverNonce + clientNonce,
            counterparty: subject
        });
        const serialNumber = Utils.toBase64(hmac);
        const hashOfSerialNumber = Utils.toHex(Hash.sha256(serialNumber));

        // Creating certificate revocation tx
        let revocation;
        try {
            // Create unique basket name using serialNumber to avoid conflicts with old revocation tokens
            const revocationBasket = `certificate revocation ${subject} ${serialNumber.substring(0, 8)}`;
            
            console.log('Creating revocation transaction with params:', {
                description: 'Certificate revocation',
                outputSatoshis: 1,
                basket: revocationBasket,
                serialNumber: serialNumber,
                hashOfSerialNumber: hashOfSerialNumber
            });
            
            revocation = await serverWallet.createAction({
                description: 'Certificate revocation',
                outputs: [
                    {
                        outputDescription: 'Certificate revocation outpoint',
                        satoshis: 1,
                        lockingScript: Script.fromASM(`OP_SHA256 ${hashOfSerialNumber} OP_EQUAL`).toHex(),
                        basket: revocationBasket,
                        customInstructions: JSON.stringify({
                            serialNumber, // the unlockingScript is just the serialNumber
                        })
                    }
                ],
                options: {
                    randomizeOutputs: false // this ensures the output is always at the same position at outputIndex 0
                }
            });
            console.log("revocationTxid created successfully:", revocation.txid);
        } catch (revocationError: unknown) {
            console.error("Error creating revocation transaction:", revocationError);
            console.error("Revocation error details:", JSON.stringify(revocationError, null, 2));
            if (revocationError instanceof Error) {
                return res.status(500).json({ error: 'Revocation error: ' + revocationError.message });
            }
            return res.status(500).json({ error: 'Revocation error: ' + revocationError });
        }


        // Signing the new certificate
        const signedCertificate = new Certificate(
            type,
            serialNumber,
            subject,
            certifier,
            revocation.txid + '.0', // randomizeOutputs must be set to false
            fields
        );

        await signedCertificate.sign(serverWallet);

        console.log("signedCertificate", signedCertificate);

        // Save certificate in database
        // EX: {subject: subject, certificate: signedCertificate}
        await connectToMongo();
        
        // Prepare document for database
        const documentToSave = { 
            signedCertificate: signedCertificate,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        
        // Use the certificate subject as the ID
        const documentId = signedCertificate.subject || subject;
        console.log('DEBUG: signedCertificate.subject:', signedCertificate.subject);
        console.log('DEBUG: subject:', subject);
        console.log('DEBUG: documentId:', documentId);
        
        if (!documentId) {
            throw new Error('Document ID is null or undefined - cannot save certificate');
        }
        
        await usersCollection.updateOne({ _id: documentId }, 
            { $set: documentToSave as Partial<User> },
            { upsert: true }
        );
        
        console.log(`Certificate saved for subject: ${documentId}`);
        
        // Format response for BSV SDK's acquireCertificate method
        const protocolResponse = {
            protocol: 'issuance',
            certificate: signedCertificate,
            serverNonce: serverNonce,
            timestamp: new Date().toISOString(),
            version: '1.0'
        };
        
        console.log('Returning certificate response with protocol wrapper:', protocolResponse);
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('X-Certificate-Protocol', 'issuance');
        return res.json(protocolResponse);
    } catch (error: unknown) {
        console.error('Certificate signing error:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        if (error instanceof Error) {
            return res.status(500).json({ error: error.message });
        }
        return res.status(500).json({ error: error });
    }
}