import { connectToMongo } from "../../lib/mongo";
import { NextResponse } from "next/server";
import { connectWallet } from "../../lib/connectWallet";

// For now keeping it simple with just a db check
// For future could possible use listCertificate to find the specific cert if needed

export async function GET() {
    const { usersCollection } = await connectToMongo();
    const wallet = await connectWallet();

    if (!wallet) {
        return NextResponse.json({ success: false, error: "Wallet not connected" });
    }

    const { publicKey } = await wallet.getPublicKey({ identityKey: true });
    const user = await usersCollection.findOne({ _id: publicKey });

    if (!user) {
        return NextResponse.json({ success: false, error: "User not found" });
    }

    return NextResponse.json({ success: true, data: user });
}