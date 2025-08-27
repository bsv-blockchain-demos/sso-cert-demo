import React, { useEffect, useState } from "react";

export default function Home() {
  const [user, setUser] = useState<{ displayName: string; mail: string; isBsvEmail: boolean } | null>(null);

  useEffect(() => {
    const checkCode = async () => {
      const url = new URL(window.location.href);
      const code = url.searchParams.get("code");

      if (code && !user) {
        // Clean the URL for UX
        window.history.replaceState({}, document.title, window.location.pathname);

        const response = await fetch("/auth/login", {
          method: "POST",
          body: JSON.stringify({ code }),
        })

        const data = await response.json();
        console.log(data);
        setUser(data.user);
      }
    }
    checkCode();
  }, [user]);

  const loginWithMicrosoft = async () => {
    // Redirect to microsoft login
  }

  const generateCertificate = async () => {
    // Check cookie for verified before proceeding
    // Verify it's a valid bsva email
    if (!user?.mail) {
      return;
    }

    if (!isBsvAssociationEmail(user.mail)) {
      return;
    }

    try {
      const response = await fetch('/generate-certificate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fields: {
            name: user.displayName,
            email: user.mail,
          },
        }),
      })

      const data = await response.json();
      console.log(data);
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div>
      {user ? (
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
    </div>
  );
}

function isBsvAssociationEmail(value: unknown): value is string {
  return typeof value === "string" && value.endsWith("@bsvassociation.org");
}
