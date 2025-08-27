import { NextResponse } from "next/server";
import { ConfidentialClientApplication } from "@azure/msal-node";
import axios from "axios";

const config = {
    auth: {
        clientId: process.env.MICROSOFT_CLIENT_ID!,
        authority: `https://login.microsoftonline.com/${process.env.MICROSOFT_TENANT_ID}`,
        clientSecret: process.env.MICROSOFT_CLIENT_SECRET!,
    },
};

const cca = new ConfidentialClientApplication(config);

export async function POST(request: Request) {
    const body = await request.json();
    const { code } = body;

    if (!code) {
        return NextResponse.json({ success: false, error: "No code provided" });
    }

    const redirectUri = process.env.REDIRECT_URI!;

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

        const isBsvEmail = user.mail?.endsWith("@bsvassociation.org") ?? false;

        return NextResponse.json({
            success: true,
            user: {
                name: user.displayName,
                email: user.mail,
                isBsvEmail,
            },
        });
    } catch (error: unknown) {
        console.log(error);
        return NextResponse.json({ success: false, error: error });
    }
}