'use client'

import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"

export default function PrivacyPolicy() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="px-6 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
            
            <div className="prose prose-gray max-w-none">
              <p className="text-sm text-gray-600 mb-6">
                <strong>Effective Date:</strong> 14-July-2025
              </p>

              <div className="space-y-6 text-gray-700 leading-relaxed">
                <p>
                  This Privacy Policy ("Policy") describes how NP'S PROJECT MANAGEMENT AND TECHNOLOGY
                  PRIVATE LIMITED ("we," "us," "our," or the "Company") collects, uses, and discloses your personal
                  information when you visit our web portal and use our services.
                </p>
                
                <p>
                  We reserve the right to change this policy at any given time, of which you will be promptly
                  updated. If you want to make sure that you are up to date with the latest changes, we advise you to
                  frequently visit this page.
                </p>

                <section>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Information We Collect:</h2>
                  
                  <h3 className="text-lg font-medium text-gray-900 mb-2">1.1 Personal Information:</h3>
                  <p className="mb-4">
                    When you visit the web portal, we may collect the following types of personal information:
                  </p>
                  <ul className="list-disc pl-6 mb-4 space-y-1">
                    <li>Name</li>
                    <li>Email address</li>
                    <li>Postal address</li>
                    <li>Phone number</li>
                    <li>Professional Details</li>
                    <li>Any other information you provide us voluntarily</li>
                  </ul>

                  <h3 className="text-lg font-medium text-gray-900 mb-2">1.2 Usage Data:</h3>
                  <p>
                    We may automatically collect information about how you use our web portal and services, including
                    your IP address, browser type, pages you visit, and the time and date of your visits.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">2. How We Use Your Information:</h2>
                  <p className="mb-4">We use your personal information for the following purposes:</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>To provide and maintain our web portal and services.</li>
                    <li>To respond to your requests or inquiries.</li>
                    <li>To send you updates, newsletters, and marketing materials, where you have consented.</li>
                    <li>To monitor and analyse usage patterns to improve our web portal and services.</li>
                    <li>To comply with legal obligations.</li>
                    <li>To improve our services and products.</li>
                    <li>To send you promotional emails containing the information we think you will find interesting.</li>
                    <li>To contact you to fill out surveys and participate in other types of market research.</li>
                    <li>To customize our blog according to your online behaviour and personal preferences.</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">3. Disclosure of Your Information:</h2>
                  <p className="mb-4">We may share your personal information with:</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Service providers who assist us in operating our web portal and providing services.</li>
                    <li>Third parties with whom we collaborate for marketing or promotional purposes, provided you have consented.</li>
                    <li>Legal authorities when required by law.</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Safeguarding and Security the Data:</h2>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>
                      ReInfraHire is committed to securing your data and keeping it confidential. NPPMT has done
                      all in its power to prevent data theft, unauthorized access, and disclosure by implementing the
                      latest technologies and software, which help us safeguard all the information we collect
                      online.
                    </li>
                    <li>
                      We implement reasonable security measures to protect your personal information from
                      unauthorized access, disclosure, alteration, and destruction.
                    </li>
                    <li>
                      Other Sites Our website may contain links to third-party websites in the form of policies, ads,
                      and other nonaffiliated links. Once you leave our site, we are no longer responsible for how
                      your information is collected and disclosed. Please refer to the privacy policies of those third-
                      party sites for more information.
                    </li>
                    <li>
                      If you provide personal information, we cannot verify its total security against all types of
                      interception. Do-Not-Track Some browsers offer Do-Not-Track settings to prevent any
                      information from being distributed. Since these settings have not been legally established as
                      standard practice, we [do/do not acknowledge] these settings. Additional Options At any time,
                      you may opt to review or change your account settings, including contact information.
                    </li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Payments and Subscriptions:</h2>
                  <p className="mb-2">We exclusively handle payments within our application through subscriptions and in-app purchases.</p>
                  <p>We do not charge subscriptions for Labour Worker Users If anyone requests money from our users on our behalf, please report us immediately.</p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Your Choices and Rights:</h2>
                  <p className="mb-4">You have the following choices and rights regarding your personal information:</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Access, update, or correct your personal information.</li>
                    <li>Withdraw consent for marketing communications.</li>
                    <li>Request deletion of your personal information.
                      <ul className="list-circle ml-6 mt-1">
                        <li>If you wish to delete your account, you may do so to remove most of your information, however, some identifying information will be retained to prevent fraud. You may also opt-out of emails and other correspondences from our site at any time.</li>
                      </ul>
                    </li>
                    <li>Object to the processing of your personal information.</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Transparent Consent — Clear, Honest, and No Surprises</h2>
                  <p className="mb-4">
                    <strong>We (NP'S PROJECT MANAGEMENT AND TECHNOLOGY PRIVATE LIMITED) want you to understand what's happening behind the scenes in plain language.</strong>
                  </p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>We clearly explain what data we need and why (e.g., location to show nearby results, email to send receipts).</li>
                    <li>We use simple terms, not confusing legal language.</li>
                    <li>We'll tell you when we're collecting data and get your permission first.</li>
                    <li>We'll also explain who we may share it with, if anyone (like trusted service providers or for legal reasons).</li>
                    <li>No hidden settings. No guessing. No surprises.</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Granular Consent — Your Data, Your Rules</h2>
                  
                  <h3 className="text-lg font-medium text-gray-900 mb-2">A. Rather than seeking a blank consent for all data and features, we offer users the ability to provide informed consent individually for each specific type of data and functionality.</h3>
                  <p className="mb-2">You can choose:</p>
                  <ul className="list-disc pl-6 space-y-1 mb-4">
                    <li>Share location for map features</li>
                    <li>But not for ads</li>
                    <li>Get product updates</li>
                    <li>But opt out of promotional emails</li>
                    <li>Allow camera access for uploads</li>
                    <li>But keep contact list private</li>
                    <li>Every permission is optional (unless required for the feature to work), and you can adjust them anytime in your settings.</li>
                  </ul>

                  <h3 className="text-lg font-medium text-gray-900 mb-2">B. You're Always in Control</h3>
                  <p className="mb-2">We believe consent isn't a one-time thing. So we make it easy to:</p>
                  <ul className="list-disc pl-6 space-y-1 mb-4">
                    <li>Update your choices in your privacy or account settings</li>
                    <li>Withdraw consent if you change your mind</li>
                    <li>Delete your data if you no longer want us to have it</li>
                  </ul>
                  <p>We'll also remind you once in a while to review your settings — just to be sure you're still happy with what you've agreed to.</p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">9. Stricter Kids' Data Protections: Keeping Your Child's Privacy Safe</h2>
                  <p>
                    Your child's privacy matters deeply — and we take that responsibility seriously. That's why
                    we follow stricter, child-focused data protection practices, designed with care and built with
                    transparency.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">10. Breach Notifications:</h2>
                  <p>Must inform users promptly — possibly within hours or days, not weeks.</p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">11. Data Portability & Deletion</h2>
                  <p>Provide easy download options and delete-old-data protocols ("right to be forgotten").</p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">12. Cross-Border Transfers</h2>
                  <p>Only to approved countries, require documentation and robust safeguards.</p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">13. Multilingual Support:</h2>
                  <p>
                    Our application supports multiple languages. We support languages such as English,
                    Hindi, Marathi, Gujarati, Bangla, Tamil, Kannada, Telugu, Malayalam.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">14. Grievance Officer:</h2>
                  <p className="mb-4">
                    In accordance with Information Technology Act 2000 and rules made there under, the name
                    and contact details of the Grievance Officer are provided below:
                  </p>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p><strong>Ms. Monali Kalyani</strong></p>
                    <p>801, LMS Finswell,</p>
                    <p>Sakore Nagar, Viman Nagar,</p>
                    <p>Pune 411014</p>
                    <p>Phone: +912061095099</p>
                    <p>Email: Monali.kalyani@nppmt.com</p>
                  </div>
                  <p className="mt-4">
                    If you have any questions about this Policy or other privacy concerns, you can also email us
                    at Monali.kalyani@nppmt.com
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">15. Cookies:</h2>
                  <p className="mb-4">
                    We may use cookies and similar tracking technologies to improve your browsing experience. You can
                    control the use of cookies through your browser settings.
                  </p>
                  <p className="mb-4">
                    Once you agree to allow our web portal to use cookies, you also agree to use the data it collects
                    regarding your online behaviour (analyse web traffic, web pages you visit and spend the most time
                    on). The data we collect by using cookies is used to customize our blog to your needs. We use the data
                    for statistical analysis.
                  </p>
                  <p>
                    Please note that cookies don't allow us to gain control of your computer in any way. They are strictly
                    used to monitoring which pages you find useful and which you do not, so that we can provide a better
                    experience for you.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">16. Contact Us:</h2>
                  <p className="mb-4">
                    If you have any questions or concerns about this Policy, please contact us at:
                  </p>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p><strong>NP'S PROJECT MANAGEMENT AND TECHNOLOGY PRIVATE LIMITED</strong></p>
                    <p>801, LMS Finswell, Sakore Nagar,</p>
                    <p>Viman Nagar, Pune, Pune-411014, Maharashtra</p>
                    <p className="mt-2">Email: contact@nppmt.com</p>
                    <p>Phone: +91 9970173969/ +91 9970960969/ +91 2061095099</p>
                  </div>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">17. Changes to this Policy:</h2>
                  <p className="mb-4">
                    We may update this Policy from time to time to reflect changes in our practices or for other
                    operational, legal, or regulatory reasons. Please review this Policy periodically for any updates.
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Last updated on 14-07-2025</strong>
                  </p>
                </section>
              </div>
            </div>
            
            {/* Footer section */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <Button 
                  variant="outline" 
                  onClick={() => router.back()}
                  className="mb-4"
                >
                  Go Back
                </Button>
              </div>
              <p className="text-sm text-gray-500 text-center">
                © 2025 NP's Project Management And Technology Pvt. Ltd. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 