'use client';

export default function OwnsCertificate() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center p-4">
            <div className="text-center max-w-2xl w-full">
                <div className="space-y-8">
                    {/* Header */}
                    <div>
                        <h1 className="text-5xl font-light text-white mb-2">BSVACerts</h1>
                        <p className="text-blue-200 text-lg">Certificate Management</p>
                    </div>

                    {/* Main Content */}
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-2xl">
                        {/* Success Icon */}
                        <div className="flex justify-center mb-6">
                            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center">
                                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                        </div>

                        <h2 className="text-3xl font-semibold text-white mb-4">
                            Certificate Already Exists
                        </h2>

                        <div className="space-y-4 text-blue-100">
                            <p className="text-lg">
                                Great news! You already have a valid BSV certificate associated with your identity.
                            </p>

                            <div className="bg-blue-800/30 rounded-lg p-4 border border-blue-600/30">
                                <h3 className="text-white font-medium mb-2 flex items-center">
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Where to find your certificate:
                                </h3>
                                <ul className="space-y-2 text-sm">
                                    <li className="flex items-start">
                                        <span className="text-green-400 mr-2">•</span>
                                        Open your Metanet Desktop Wallet
                                    </li>
                                    <li className="flex items-start">
                                        <span className="text-green-400 mr-2">•</span>
                                        Navigate to the Identity section
                                    </li>
                                    <li className="flex items-start">
                                        <span className="text-green-400 mr-2">•</span>
                                        Your BSV certificate will be listed there with your verified identity
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Footer Note */}
                    <p className="text-blue-300 text-sm">
                        Your certificate is securely stored on the BSV blockchain and can be used to verify your identity across compatible applications.
                    </p>
                </div>
            </div>
        </div>
    );
}