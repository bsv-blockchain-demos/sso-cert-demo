'use client';

import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

import SuccessModal from "../components/successModal";

const emailDomainCheck = process.env.NEXT_PUBLIC_EMAIL_DOMAIN_CHECK as string;

export default function Home() {
  const [user, setUser] = useState<{ displayName: string; mail: string; isValidEmail: boolean } | null>(null);
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    const checkCode = async () => {
      const url = new URL(window.location.href);
      const code = url.searchParams.get("code");

      if (code && !user) {
        setLoading(true);
        // Clean the URL for UX
        window.history.replaceState({}, document.title, window.location.pathname);

        const response = await fetch("/auth/login", {
          headers: { "Content-Type": "application/json" },
          method: "POST",
          body: JSON.stringify({ code }),
        })

        const data = await response.json();
        console.log(data);
        setUser(data.user);
        setLoading(false);
      }
    }
    checkCode();
  }, []);

  const loginWithMicrosoft = async () => {
    // Redirect to microsoft login
    const response = await fetch("/auth/login", {
      headers: { "Content-Type": "application/json" },
      method: "POST",
      body: JSON.stringify({ code: "" }),
    });

    const data = await response.json();
    console.log(data);

    if (data.redirectUrl) {
      window.location.href = data.redirectUrl;
    }
  }

  const generateCertificate = async () => {
    // Check cookie for verified before proceeding
    // Verify it's a valid email
    if (!user?.mail) {
      toast.error("No user found");
      return;
    }

    if (!isValidEmail(user.mail)) {
      toast.error("User doesn't have a valid email");
      return;
    }

    try {
      const response = await fetch('/generate-certificate', {
        headers: { "Content-Type": "application/json" },
        method: 'POST',
        body: JSON.stringify({
          fields: {
            name: user.displayName,
            email: user.mail,
          },
        }),
      })

      const data = await response.json();
      console.log(data);
      setShowSuccessModal(true);
    } catch (error: unknown) {
      console.log(error);
      if (error instanceof Error) {
        if (error.message === "Wallet not found") {
          toast.error("No wallet found, make sure your wallet app is running \n Install Metanet desktop here: https://metanet.bsvb.tech");
        } else {
          toast.error(error.message);
        }
      }
    }
  }

  return (
    <div>
      {loading ? (
        <div>Loading...</div>
      ) : user ? (
        <div>
          <p className="text-3xl font-bold underline">BSVACerts</p>
          <button onClick={generateCertificate}>Generate Certificate</button>
        </div>
      ) : (
        <div>
          <p className="text-3xl font-bold underline">BSVACerts</p>
          <button onClick={loginWithMicrosoft}>Login with Microsoft</button>
        </div>
      )}
      {showSuccessModal && <SuccessModal />}
    </div>
  );
}

function isValidEmail(value: unknown): value is string {
  return typeof value === "string" && value.endsWith(emailDomainCheck);
}
