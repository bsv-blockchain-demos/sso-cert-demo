'use client';

import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import SuccessModal from "../components/successModal";
import { useRouter } from "next/navigation";

const emailDomainCheck = process.env.NEXT_PUBLIC_EMAIL_DOMAIN_CHECK as string;

export default function Home() {
  const [user, setUser] = useState<{ name: string; email: string; isValidEmail: boolean } | null>(null);
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const router = useRouter();

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
  }, [user]);

  useEffect(() => {
    const checkCertificateOwnership = async () => {
      if (!user) {
        return;
      }
      const response = await fetch("/check-certificate-ownership", {
        headers: { "Content-Type": "application/json" },
        method: "GET",
      });
      const data = await response.json();
      console.log(data);

      if (data.success) {
        router.push("/owns-certificate");
      }
    }
    checkCertificateOwnership();
  }, [user, router]);

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
    if (!user?.email) {
      toast.error("No user found");
      return;
    }

    if (!isValidEmail(user.email)) {
      toast.error("User doesn't have a valid email");
      return;
    }

    try {
      const response = await fetch('/generate-certificate', {
        headers: { "Content-Type": "application/json" },
        method: 'POST',
        body: JSON.stringify({
          fields: {
            name: user.name,
            email: user.email,
          },
        }),
      })

      const data = await response.json();
      console.log(data);

      if (!data.success) {
        if (data.error === "Token expired") {
          setUser(null);
        } else if (data.error === "No token found") {
          setUser(null);
        }
        throw new Error(data.error);
      }

      if (data.data === "User already has a certificate") {
        router.push("/owns-certificate");
        return;
      }
      
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
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center p-4">
      <div className="text-center max-w-md w-full">
        {loading ? (
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            <p className="text-white text-lg">Loading...</p>
          </div>
        ) : user ? (
          <div className="space-y-8">
            <div>
              <h1 className="text-5xl font-light text-white mb-2">BSVACerts</h1>
              <p className="text-blue-200 text-lg">Create your BSVA certificate with your Microsoft SSO login</p>
            </div>
            <div className="space-y-4">
              <p className="text-white text-lg">Welcome, {user.name}</p>
              <p className="text-blue-200 text-sm">{user.email}</p>
              <button 
                onClick={generateCertificate}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:cursor-pointer"
              >
                Generate Certificate
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <div>
              <h1 className="text-5xl font-light text-white mb-2">BSVACerts</h1>
              <p className="text-blue-200 text-lg">Certify your identity with your Microsoft SSO login</p>
            </div>
            <div className="space-y-4">
              <button 
                onClick={loginWithMicrosoft}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2 hover:cursor-pointer"
              >
                <svg className="w-5 h-5" viewBox="0 0 23 23" fill="currentColor">
                  <path d="M11 11h11v11H11V11zM0 11h11v11H0V11zM11 0h11v11H11V0zM0 0h11v11H0V0z"/>
                </svg>
                <span>Microsoft</span>
              </button>
            </div>
          </div>
        )}
      </div>
      {showSuccessModal && <SuccessModal onClose={() => {
        setShowSuccessModal(false);
        router.push("/owns-certificate");
      }} />}
    </div>
  );
}

function isValidEmail(value: unknown): value is string {
  return typeof value === "string" && value.endsWith(emailDomainCheck);
}
