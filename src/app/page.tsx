'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Briefcase, DollarSign, Calendar, Building2, IndianRupee, Bookmark, BookmarkCheck, Linkedin, Facebook, Youtube } from 'lucide-react'
import DOMPurify from 'dompurify'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type Job = {
  id: number
  title: string
  company: string
  location: string
  type: string
  salary: number
  description: string
  created_at: string
  is_active: boolean
}

export default function Home() {
  const [featuredJobs, setFeaturedJobs] = useState<Job[]>([])
  const [showPrivacyModal, setShowPrivacyModal] = useState(false)

  useEffect(() => {
    const fetchFeaturedJobs = async () => {
      const supabase = createClientComponentClient()
      const { data: jobs, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(3)

      if (error) {
        console.error('Error fetching jobs:', error)
      } else {
        setFeaturedJobs(jobs || [])
      }
    }

    fetchFeaturedJobs()
  }, [])

  const howItWorksSteps = [
    { title: "Create an Account", description: "Sign up and complete your profile to get started." },
    { title: "Browse Jobs", description: "Search and filter through our extensive job listings." },
    { title: "Apply with Ease", description: "Submit your applications with just a few clicks." },
  ]

  const truncateHTML = (html: string, maxLength: number) => {
    const div = document.createElement('div')
    div.innerHTML = html
    const text = div.textContent || div.innerText || ''
    if (text.length <= maxLength) return html
    let truncated = text.slice(0, maxLength)
    if (truncated.lastIndexOf(' ') > 0) {
      truncated = truncated.substr(0, truncated.lastIndexOf(' '))
    }
    return truncated + '...'
  }

  const privacyPolicy = {
    title: "Privacy Policy",
    content: `
      Effective Date: 30-November-2024

This Privacy Policy ("Policy") describes how NP'S PROJECT MANAGEMENT AND TECHNOLOGY
PRIVATE LIMITED ("we","us","our", or the "Company") collects, uses, and discloses your personal
information when you visit our web portal and use our services.
We reserve the right to change this policy at any given time, of which you will be promptly
updated. If you want to make sure that you are up to date with the latest changes, we advise you to
frequently visit this page.

1. Information We Collect:
1.1 Personal Information:
When you visit the web portal, we may collect the following types of personal information:
- Name
- Email address
- Postal address
- Phone number
- Professional Details
- Any other information you provide us voluntarily

1.2 Usage Data:
We may automatically collect information about how you use our web portal and services, including
your IP address, browser type, pages you visit, and the time and date of your visits.

2. How We Use Your Information:
We use your personal information for the following purposes:
- To provide and maintain our web portal and services.
- To respond to your requests or inquiries.
- To send you updates, newsletters, and marketing materials, where you have consented.
- To monitor and analyse usage patterns to improve our web portal and services.
- To comply with legal obligations.
- To improve our services and products.
- To send you promotional emails containing the information we think you will find
  interesting.
- To contact you to fill out surveys and participate in other types of market research.
- To customize our blog according to your online behavior and personal preferences.

3. Disclosure of Your Information:
  We may share your personal information with:
- Service providers who assist us in operating our web portal and providing services.
- Third parties with whom we collaborate for marketing or promotional purposes, provided
  you have consented.
- Legal authorities when required by law.

4. Safeguarding and Security the Data:
- ReInfraHire is committed to securing your data and keeping it confidential. NPPMT has done
  all in its power to prevent data theft, unauthorized access, and disclosure by implementing
  the latest technologies and software, which help us safeguard all the information we collect
  online.
- We implement reasonable security measures to protect your personal information from
  unauthorized access, disclosure, alteration, and destruction.
- Other Sites Our website may contain links to third-party websites in the form of policies, ads,
  and other nonaffiliated links. Once you leave our site, we are no longer responsible for how
  your information is collected and disclosed. Please refer to the privacy policies of those
  third-party sites for more information.
- If you provide personal information, we cannot verify its total security against all types of
  interception. Do-Not-Track Some browsers offer Do-Not-Track settings to prevent any
  information from being distributed. Since these settings have not been legally established as
  standard practice, we [do/do not acknowledge] these settings. Additional Options At any
  time, you may opt to review or change your account settings, including contact information.

5. Payments and Subscriptions:
- We exclusively handle payments within our application through subscriptions and in-app purchases.
- We do not charge subscriptions for Labour Worker Users If anyone requests money from our users
  on our behalf, please report us immediately.

6. Your Choices and Rights:
You have the following choices and rights regarding your personal information:
- Access, update, or correct your personal information.
- Withdraw consent for marketing communications.
- Request deletion of your personal information.
- If you wish to delete your account, you may do so to remove most of your
  information, however, some identifying information will be retained to prevent
  fraud. You may also opt-out of emails and other correspondences from our site at
  any time.
- Object to the processing of your personal information.

7. Multilingual Support:
Our application supports multiple languages. We support languages such as English, Hindi, Marathi,
Gujarati, Bangla, Tamil, Kannada, Telugu, Malayalam.

8. Grievance Officer:
In accordance with Information Technology Act 2000 and rules made there under, the name and
contact details of the Grievance Officer are provided below:
Ms. Monali Kalyani
803, LMS Finswell,
Sakore Nagar, Viman Nagar,
Pune 411014
Phone: +912061095099
Email: Monali.kalyani@nppmt.com
If you have any questions about this Policy or other privacy concerns, you can also email us at
Monali.kalyani@nppmt.com

9. Cookies:
We may use cookies and similar tracking technologies to improve your browsing experience. You can
control the use of cookies through your browser settings.
Once you agree to allow our web portal to use cookies, you also agree to use the data it collects
regarding your online behaviour (analyse web traffic, web pages you visit and spend the most time
on). The data we collect by using cookies is used to customize our blog to your needs. We use the
data for statistical analysis.
Please note that cookies don&#39;t allow us to gain control of your computer in any way. They are strictly
used to monitoring which pages you find useful and which you do not, so that we can provide a
better experience for you.

10. Contact Us:
If you have any questions or concerns about this Policy, please contact us at:

NP&#39;S PROJECT MANAGEMENT AND TECHNOLOGY PRIVATE LIMITED
803, LMS Finswell, Sakore Nagar,
Viman Nagar, Pune, Pune-411014, Maharashtra

Email: contact@nppmt.com
Phone: +91 8485861689/ +91 9970960969/ +91 2061095099

11. Changes to this Policy:
We may update this Policy from time to time to reflect changes in our practices or for other
operational, legal, or regulatory reasons. Please review this Policy periodically for any updates.
    `
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <Image
                  src="/img/logo.svg"
                  alt="ReInfraHire Logo"
                  width={160}
                  height={40}
                  priority
                  className="h-10 w-auto"
                />
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" asChild>
                <Link href="/auth/login">Log in</Link>
              </Button>
              <Button asChild>
                <Link href="/auth/signup">Sign up</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-primary-foreground text-white py-20 banner-main">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold sm:text-5xl md:text-6xl">
              Find Your Dream Job
            </h1>
            <p className="mt-3 max-w-md mx-auto text-xl sm:text-2xl md:mt-5 md:max-w-3xl">
              Connect with top employers and discover exciting career opportunities.
            </p>
            <div className="mt-10 flex justify-center">
              <div className="inline-flex rounded-md shadow">
                <Button size="lg" asChild>
                  <Link href="/auth/login">Browse Jobs</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Jobs Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl text-center mb-12">
            Featured Jobs
          </h2>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {featuredJobs.map((job) => (
              <Card key={job.id}>
                <CardHeader>
                  <CardTitle>{job.title}</CardTitle>
                  <div className="flex items-center space-x-2">            
                    <Badge variant="secondary">{job.type}</Badge>
                  </div>                        
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" /> <span>Company:</span>
                    <p className="text-md">{job.company}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" /><span>Location:</span>
                    <span className="text-md">{job.location}</span>
                  </div>          
                  {/* <div className="flex items-center space-x-2">
                    <IndianRupee className="h-4 w-4 text-muted-foreground" /> <span>Salary:</span>
                    <span className="text-sm font-medium">{job.salary.toLocaleString()}</span>
                  </div> */}
                  <div className='mb-4'>
                    <strong>Description:</strong>                    
                    <div 
                      className="text-sm prose max-w-none"
                      dangerouslySetInnerHTML={{ 
                        __html: DOMPurify.sanitize(truncateHTML(job.description, 150))
                      }}
                    />
                  </div>                  
                  <Button variant="outline" className="w-full" asChild>
                    <Link href={`/auth/login`}>View Job</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Button size="lg" asChild>
              <Link href="/auth/login">View All Jobs</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl text-center mb-12">
            How It Works
          </h2>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {howItWorksSteps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="flex items-center justify-center w-12 h-12 mx-auto bg-primary rounded-full text-white text-xl font-bold mb-4">
                  {index + 1}
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">            
            <div>
              <h3 className="text-lg font-semibold mb-4">Connect</h3>
              <ul className="flex justify-center gap-4">
                <li><a href="https://www.linkedin.com/company/nppmt/" className="hover:text-gray-300" target='_blank' rel="noopener noreferrer">LinkedIn</a></li>
                <li><a href="https://www.facebook.com/profile.php?id=61563162436752" className="hover:text-gray-300" target='_blank' rel="noopener noreferrer">Facebook</a></li>
                <li><a href="https://x.com/_nppmt/" className="hover:text-gray-300" target='_blank' rel="noopener noreferrer">Twitter X</a></li>
                <li><a href="https://www.instagram.com/nppmt/" className="hover:text-gray-300" target='_blank' rel="noopener noreferrer">Instagram</a></li>
                <li><a href="https://youtube.com/shorts/Wc7QsIA9r8w?feature=share" className="hover:text-gray-300" target='_blank' rel="noopener noreferrer">Youtube</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-700 text-center">
            <p className="flex justify-center items-center gap-2">
              &copy; 2025 © NPPMT. All rights reserved.
              <button
                onClick={() => setShowPrivacyModal(true)}
                className="text-gray-300 hover:text-white underline"
              >
                Privacy Policy
              </button>
            </p>
          </div>
        </div>
      </footer>

      <Dialog open={showPrivacyModal} onOpenChange={setShowPrivacyModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{privacyPolicy.title}</DialogTitle>
          </DialogHeader>
          <div className="prose prose-sm prose-invert">
            <p className="whitespace-pre-line">{privacyPolicy.content}</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}