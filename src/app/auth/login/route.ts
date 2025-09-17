import { NextResponse } from "next/server";
import { ConfidentialClientApplication } from "@azure/msal-node";
import axios from "axios";
import { cookies } from "next/headers";
import { createSecretKey } from "crypto";
import { SignJWT } from "jose";

const emailDomainCheck = process.env.NEXT_PUBLIC_EMAIL_DOMAIN_CHECK as string;

export async function POST(request: Request) {
    const body = await request.json();
    const { code, publicKey } = body;

    const config = {
        auth: {
            clientId: process.env.MICROSOFT_CLIENT_ID!,
            authority: `https://login.microsoftonline.com/${process.env.MICROSOFT_TENANT_ID}`,
            clientSecret: process.env.MICROSOFT_CLIENT_SECRET!,
        },
    };
    
    const cca = new ConfidentialClientApplication(config);

    const redirectUri = process.env.REDIRECT_URI!;

    if (!code) {
        const authUrl = await cca.getAuthCodeUrl({
            scopes: ["User.Read"],
            redirectUri,
        });
        return NextResponse.json({ redirectUrl: authUrl });
    }

    try {
        // Exchange code for token
        const tokenResponse = await cca.acquireTokenByCode({
            code,
            scopes: ["User.Read"],
            redirectUri,
        });

        const accessToken = tokenResponse?.accessToken;

        // Fetch user info
        const graphResponse = await axios.get("https://graph.microsoft.com/v1.0/me", {
            headers: { Authorization: `Bearer ${accessToken}` },
        });

        const user = graphResponse.data;

        const isValidEmail = user.mail?.endsWith(emailDomainCheck) ?? false;

        if (!isValidEmail) {
            return NextResponse.json({ success: false, error: "Not a valid BSVA email" }, { status: 401 });
        }

        // Create cookie here
        const jwt = new SignJWT({
            name: user.displayName,
            email: user.mail,
            isValidEmail,
            publicKey,
        });
        jwt.setProtectedHeader({ alg: "HS256" });
        jwt.setExpirationTime("5m");

        const secret = createSecretKey(Buffer.from(process.env.JWT_SECRET!, "utf-8"));
        const token = await jwt.sign(secret);

        const cookieStore = await cookies();
        cookieStore.set("verified", token, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            path: "/",
            expires: new Date(Date.now() + 5 * 60 * 1000),
        });

        return NextResponse.json({
            success: true,
            user: {
                email: user.mail,
                isValidEmail,
            },
        });
    } catch (error: unknown) {
        console.log(error);
        return NextResponse.json({ success: false, error: error });
    }
}