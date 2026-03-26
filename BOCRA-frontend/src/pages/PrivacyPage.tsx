import { Link } from 'react-router-dom'
import { MainLayout } from '@/components/layout/MainLayout'
import { ChevronRight, Lock, Shield, AlertCircle } from 'lucide-react'

export default function PrivacyPage() {
  return (
    <MainLayout>
      <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-4">
              <Link to="/" className="text-bocra-teal hover:underline">Home</Link>
              <ChevronRight className="h-4 w-4 text-slate-400" />
              <span className="text-slate-600">Privacy Policy</span>
            </div>
            <h1 className="text-4xl font-bold text-slate-900 mb-4">Web Application Security Guidelines</h1>
            <p className="text-lg text-slate-600">Botswana Communications Regulatory Authority (BOCRA)</p>
          </div>

          {/* Introduction */}
          <div className="bg-white rounded-xl shadow-sm p-8 mb-8 border-l-4 border-bocra-teal">
            <div className="flex gap-4">
              <Shield className="h-6 w-6 text-bocra-teal flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">Your Privacy & Security Matter</h2>
                <p className="text-slate-600">
                  These guidelines outline how BOCRA protects your data and ensures secure web application practices. 
                  Your personal information is handled with the utmost care and security compliance.
                </p>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="bg-white rounded-xl shadow-sm p-8 space-y-8">
            
            {/* Overview */}
            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">1. Overview</h2>
              <div className="space-y-4 text-slate-700">
                <p>
                  Web application security involves safeguarding both the application and its data as well as web services 
                  such as Application Programming Interface (APIs) from various vulnerabilities and cyber-attacks. The components 
                  include authentication/authorization, input verification and validation, secure communication and storage, 
                  secure headers and regular patching/updates.
                </p>
                <p>
                  All websites undergo security testing before being hosted on production infrastructure to ensure compliance 
                  with these standards.
                </p>
              </div>
            </section>

            {/* Security Standards */}
            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">2. Our Security Standards</h2>
              <div className="space-y-6">
                
                <div className="border-l-4 border-bocra-green pl-4">
                  <h3 className="font-bold text-slate-900 mb-2">Authentication & Authorization</h3>
                  <ul className="list-disc list-inside space-y-2 text-slate-600">
                    <li>Strong password policies enforced</li>
                    <li>Multi-Factor Authentication (MFA) implemented</li>
                    <li>Regular review of user permissions</li>
                    <li>Failed login attempts monitored and logged</li>
                  </ul>
                </div>

                <div className="border-l-4 border-bocra-teal pl-4">
                  <h3 className="font-bold text-slate-900 mb-2">Patching & Diligence</h3>
                  <ul className="list-disc list-inside space-y-2 text-slate-600">
                    <li>Regular software and firmware patches applied</li>
                    <li>Insecure and unused ports disabled</li>
                    <li>SSL/TLS encryption employed</li>
                    <li>HTTPS enforced across all connections</li>
                  </ul>
                </div>

                <div className="border-l-4 border-bocra-gold pl-4">
                  <h3 className="font-bold text-slate-900 mb-2">Secure Headers & Configuration</h3>
                  <ul className="list-disc list-inside space-y-2 text-slate-600">
                    <li>Content-Security-Policy (CSP) configured</li>
                    <li>X-Frame-Options header set</li>
                    <li>Strict-Transport-Security (HSTS) enforced</li>
                    <li>Secure cookies with HttpOnly flags</li>
                  </ul>
                </div>

                <div className="border-l-4 border-bocra-green pl-4">
                  <h3 className="font-bold text-slate-900 mb-2">Secure Storage</h3>
                  <ul className="list-disc list-inside space-y-2 text-slate-600">
                    <li>Input validation to prevent injection attacks</li>
                    <li>Encryption for sensitive data at rest</li>
                    <li>TLS encryption for database connections</li>
                    <li>Access limited to trusted IP addresses</li>
                    <li>Salted hashing algorithms for password storage</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Common Threats */}
            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">3. Protected Against Common Threats</h2>
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 space-y-4">
                <div className="flex gap-4">
                  <AlertCircle className="h-6 w-6 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-slate-700">
                      We protect your data against common web application attack vectors including:
                    </p>
                  </div>
                </div>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 ml-10 text-slate-600">
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                    Cross-Site Scripting (XSS)
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                    SQL Injection
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                    Man-in-the-Middle Attacks
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                    Phishing Attacks
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                    Denial of Service (DoS/DDoS)
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                    Broken Authentication
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                    Buffer Overflow Attacks
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                    Clickjacking
                  </li>
                </ul>
              </div>
            </section>

            {/* Data Protection */}
            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">4. Your Data Protection</h2>
              <div className="bg-bocra-teal/5 border border-bocra-teal/20 rounded-lg p-6 space-y-4">
                <p className="text-slate-700">
                  We classify and protect your data based on sensitivity level:
                </p>
                <ul className="space-y-3 text-slate-600">
                  <li className="flex gap-3">
                    <span className="font-bold text-bocra-teal">•</span>
                    <span><strong>Personal Identifiable Information (PII)</strong> - Encrypted at rest and in transit</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-bold text-bocra-teal">•</span>
                    <span><strong>Sensitive Data</strong> - Tokenized and never stored in plaintext</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-bold text-bocra-teal">•</span>
                    <span><strong>Passwords</strong> - Hashed with salt using industry-standard algorithms</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-bold text-bocra-teal">•</span>
                    <span><strong>API Connections</strong> - Protected with strong authentication and access control</span>
                  </li>
                </ul>
              </div>
            </section>

            {/* Compliance */}
            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">5. Compliance & Enforcement</h2>
              <div className="space-y-4 text-slate-700">
                <p>
                  These guidelines are established to ensure that all software developers and website domain hosting companies 
                  understand the dangers and risks of insecure website applications.
                </p>
                <p>
                  Any website that does not conform to these guidelines may lead to the takedown of the domain where the site 
                  poses as a risk and a source of malicious activities, especially on the .bw domain namespace, in accordance 
                  with the Acceptable Use Policy and Registration Terms and Conditions.
                </p>
              </div>
            </section>

            {/* Contact */}
            <section className="bg-slate-50 rounded-lg p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-3">Questions About Security?</h2>
              <p className="text-slate-600 mb-4">
                For further information, clarification and advice on these guidelines, please contact:
              </p>
              <div className="bg-white rounded p-4 border border-slate-200">
                <p className="font-bold text-slate-900">CSIRT Unit</p>
                <p className="text-slate-600">Email: <a href="mailto:info@cirt.org.bw" className="text-bocra-teal hover:underline">info@cirt.org.bw</a></p>
              </div>
            </section>

            {/* Footer */}
            <div className="pt-8 border-t border-slate-200">
              <p className="text-sm text-slate-500">
                <strong>Reviewed & Approved By:</strong> Head of CSIRT - Mr. Emmanuel Thekiso
              </p>
              <p className="text-sm text-slate-500">
                <strong>Date:</strong> 04 November 2025
              </p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
