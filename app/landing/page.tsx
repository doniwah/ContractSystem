'use client';

import { useRouter } from 'next/navigation';
import { Shield, FileCheck, Users, Zap, Lock, Globe } from 'lucide-react';

export default function LandingPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
            {/* Navigation */}
            <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Shield className="text-blue-600" size={32} />
                            <span className="text-2xl font-bold text-gray-900">ContractChain</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => router.push('/login')}
                                className="px-6 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors"
                            >
                                Login
                            </button>
                            <button
                                onClick={() => router.push('/signup')}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors shadow-md hover:shadow-lg"
                            >
                                Sign Up
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="max-w-7xl mx-auto px-6 py-20">
                <div className="text-center space-y-8">
                    <h1 className="text-6xl font-bold text-gray-900 leading-tight">
                        Secure Digital Contract
                        <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                            Approval System
                        </span>
                    </h1>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                        Streamline your contract approval process with blockchain-powered security.
                        Get signatures fast, ensure integrity, and maintain full transparency.
                    </p>
                    <div className="flex items-center justify-center gap-4 pt-4">
                        <button
                            onClick={() => router.push('/signup')}
                            className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-lg transition-all shadow-lg hover:shadow-xl hover:scale-105"
                        >
                            Get Started Free
                        </button>
                        <button
                            onClick={() => router.push('/login')}
                            className="px-8 py-4 bg-white text-gray-700 rounded-lg hover:bg-gray-50 font-semibold text-lg transition-all border-2 border-gray-200 shadow-md hover:shadow-lg"
                        >
                            Learn More
                        </button>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="max-w-7xl mx-auto px-6 py-20">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose ContractChain?</h2>
                    <p className="text-lg text-gray-600">Everything you need for secure and efficient contract management</p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {/* Feature 1 */}
                    <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
                        <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                            <Lock className="text-blue-600" size={28} />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">Blockchain Security</h3>
                        <p className="text-gray-600 leading-relaxed">
                            Every approval is cryptographically signed and recorded on the blockchain for immutable proof.
                        </p>
                    </div>

                    {/* Feature 2 */}
                    <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
                        <div className="w-14 h-14 bg-indigo-100 rounded-xl flex items-center justify-center mb-6">
                            <FileCheck className="text-indigo-600" size={28} />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">Document Integrity</h3>
                        <p className="text-gray-600 leading-relaxed">
                            SHA-256 hashing ensures your documents remain tamper-proof from creation to approval.
                        </p>
                    </div>

                    {/* Feature 3 */}
                    <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
                        <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
                            <Users className="text-purple-600" size={28} />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">Multi-Party Approval</h3>
                        <p className="text-gray-600 leading-relaxed">
                            Set custom approval thresholds and manage multiple stakeholders with ease.
                        </p>
                    </div>

                    {/* Feature 4 */}
                    <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
                        <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mb-6">
                            <Zap className="text-green-600" size={28} />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">Lightning Fast</h3>
                        <p className="text-gray-600 leading-relaxed">
                            Get approvals in minutes, not days. Real-time notifications keep everyone in sync.
                        </p>
                    </div>

                    {/* Feature 5 */}
                    <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
                        <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center mb-6">
                            <Globe className="text-orange-600" size={28} />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">On-Chain & Off-Chain</h3>
                        <p className="text-gray-600 leading-relaxed">
                            Choose between blockchain verification or traditional database storage based on your needs.
                        </p>
                    </div>

                    {/* Feature 6 */}
                    <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
                        <div className="w-14 h-14 bg-pink-100 rounded-xl flex items-center justify-center mb-6">
                            <Shield className="text-pink-600" size={28} />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">Full Audit Trail</h3>
                        <p className="text-gray-600 leading-relaxed">
                            Complete transparency with detailed activity logs and blockchain transaction records.
                        </p>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="max-w-5xl mx-auto px-6 py-20">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-12 text-center shadow-2xl">
                    <h2 className="text-4xl font-bold text-white mb-4">Ready to Get Started?</h2>
                    <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                        Join thousands of teams already using ContractChain to streamline their approval workflows.
                    </p>
                    <button
                        onClick={() => router.push('/signup')}
                        className="px-10 py-4 bg-white text-blue-600 rounded-lg hover:bg-blue-50 font-bold text-lg transition-all shadow-lg hover:shadow-xl hover:scale-105"
                    >
                        Create Your Free Account
                    </button>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-gray-400 py-8">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <p>&copy; 2026 ContractChain.</p>
                </div>
            </footer>
        </div>
    );
}
