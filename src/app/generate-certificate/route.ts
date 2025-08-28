import { Utils } from '@bsv/sdk'
import { NextResponse } from 'next/server'
import { connectWallet } from '../../lib/connectWallet';
import { cookies } from 'next/headers';
import { createSecretKey } from 'crypto';
import { jwtVerify, errors } from 'jose';

const serverPubKey = process.env.NEXT_PUBLIC_SERVER_PUBLIC_KEY as string;
const certifierUrl = process.env.NEXT_PUBLIC_CERTIFIER_URL as string || "http://localhost:8080";
const certType = process.env.CERT_TYPE as string;

export async function POST(request: Request) {
    const body = await request.json();
    const { fields } = body;

    // Double check cookie for verified again before proceeding
    const cookieStore = await cookies();
    const token = cookieStore.get("verified")?.value;

    if (!token) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    try {
        // Create the secret key (must match what you used to sign the JWT)
        const secret = createSecretKey(Buffer.from(process.env.JWT_SECRET!, "utf-8"));

        // Verify the JWT
        const { payload } = await jwtVerify(token, secret);

        if (!payload.isValidEmail) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        // Verified cookie, continue
        const wallet = await connectWallet();
        if (!wallet) {
            throw new Error('Wallet not connected');
        }
        const certResponse = await wallet.acquireCertificate({
            type: Utils.toBase64(Utils.toArray(certType, 'utf8')),
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

    } catch (err) {
        if (err instanceof errors.JWTExpired) {
            cookieStore.delete("verified");
            return NextResponse.json({ success: false, error: "Token expired" }, { status: 401 });
        }
        return NextResponse.json({ success: false, error: err }, { status: 401 });
    }
}