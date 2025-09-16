import { connectToMongo } from "../../lib/mongo";
import { NextResponse } from "next/server";
// For now keeping it simple with just a db check
// For future could possible use listCertificate to find the specific cert if needed

export async function POST(request: Request) {
    const body = await request.json();
    const { publicKey } = body;

    const { usersCollection } = await connectToMongo();

    const user = await usersCollection.findOne({ _id: publicKey });

    if (!user) {
        return NextResponse.json({ success: false, error: "User not found" });
    }

    return NextResponse.json({ success: true, data: user });
}