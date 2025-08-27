import { Utils } from '@bsv/sdk'
import { NextResponse } from 'next/server'
import { connectWallet } from '../../lib/connectWallet';

const serverPubKey = process.env.NEXT_PUBLIC_SERVER_PUBLIC_KEY as string;
const certifierUrl = process.env.NEXT_PUBLIC_CERTIFIER_URL as string || "http://localhost:8080";

export default async function POST(request: Request) {
    const body = await request.json();
    const { fields } = body;

    // Double check cookie for verified again before proceeding

    try {
        const wallet = await connectWallet();
        if (!wallet) {
            throw new Error('Wallet not connected');
        }
        const certResponse = await wallet.acquireCertificate({
            type: Utils.toBase64(Utils.toArray('BSVA Employee Identity', 'utf8')),
            fields,
            acquisitionProtocol: "issuance",
            certifier: serverPubKey,
            certifierUrl,
        });
        console.log(certResponse);

        return NextResponse.json({
            success: true,
            data: certResponse,
        });

    } catch (error) {
        console.log(error);
        return NextResponse.json({
            success: false,
            error,
        });
    }
}