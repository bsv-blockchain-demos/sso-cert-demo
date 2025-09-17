import { NextResponse } from 'next/server'
import { cookies } from 'next/headers';
import { createSecretKey } from 'crypto';
import { jwtVerify, errors } from 'jose';
import { connectToMongo } from '../../lib/mongo';

export async function POST(request: Request) {
    const body = await request.json();
    const { publicKey } = body;

    // Double check cookie for verified again before proceeding
    const cookieStore = await cookies();
    const token = cookieStore.get("verified")?.value;

    if (!token) {
        return NextResponse.json({ success: false, error: "No token found" }, { status: 401 });
    }

    try {
        // Create the secret key (must match what you used to sign the JWT)
        const secret = createSecretKey(Buffer.from(process.env.JWT_SECRET!, "utf-8"));

        // Verify the JWT
        const { payload } = await jwtVerify(token, secret);

        if (!payload.isValidEmail) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        if (!payload.email) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        if (!payload.name) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        if (publicKey !== payload.publicKey) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        // Check db for certificate
        const { usersCollection } = await connectToMongo();
        const userCertificate = await usersCollection.findOne({ _id: publicKey });

        if (userCertificate) {
            return NextResponse.json({
                success: true,
                message: "User already has a certificate",
            });
        }

        return NextResponse.json({
            success: true,
            message: "User verified",
        });

    } catch (err: unknown) {
        if (err instanceof errors.JWTExpired) {
            cookieStore.delete("verified");
            return NextResponse.json({ success: false, error: "Token expired" }, { status: 401 });
        } else if (err instanceof errors.JWTInvalid) {
            cookieStore.delete("verified");
            return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 });
        } else if (err instanceof errors.JWSSignatureVerificationFailed) {
            cookieStore.delete("verified");
            return NextResponse.json({ success: false, error: "Invalid token signature" }, { status: 401 });
        }
        return NextResponse.json({ success: false, error: err instanceof Error ? err.message : "Unknown error" }, { status: 401 });
    }
}