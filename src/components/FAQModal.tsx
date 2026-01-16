import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

interface FAQModalProps {
  isOpen: boolean
  onClose: () => void
}

export function FAQModal({ isOpen, onClose }: FAQModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Frequently Asked Questions</DialogTitle>
          <DialogDescription>
            Find answers to common questions about our REinfrahire
          </DialogDescription>
        </DialogHeader>
        
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger>1. How to apply for the job?</AccordionTrigger>
            <AccordionContent>
              The page is showing the details of the job, where you can see the option in the highlighted blue color as “View Job Details”. Click on it, and it will open the job detail page. Now, click on the button “Apply” at the bottom of the job description.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2">
            <AccordionTrigger>2. I am not able to see the Apply Button.</AccordionTrigger>
            <AccordionContent>
              The apply button appears only after the profile is completed on the portal.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3">
            <AccordionTrigger>3. How to complete the profile?</AccordionTrigger>
            <AccordionContent>
            Click on the My Profile section, which is on the left-hand side of the page, and fill in all the details on the profile pages.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-4">
            <AccordionTrigger>4. How to apply for a job without going to the profile page?</AccordionTrigger>
            <AccordionContent>
              No! There is no such option available. You must complete your profile before applying. 
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-5">
            <AccordionTrigger>5. Where can I see my applied jobs?</AccordionTrigger>
            <AccordionContent>
              Click on Applied Jobs on the left-hand side of the page, after the dashboard. This will show you all the jobs you’ve applied to. 
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-6">
            <AccordionTrigger>6. I am not able to see any job details on the Applied Jobs page</AccordionTrigger>
            <AccordionContent>
              This is because you haven't applied for any jobs yet. 
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-7">
            <AccordionTrigger>7. How to save a job?</AccordionTrigger>
            <AccordionContent>
              Click on Dashboard and search for the job you want to save. On the job page, you will see the Save Job button, which will save the job. 
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-8">
            <AccordionTrigger>8. Can I unsaved a job?</AccordionTrigger>
            <AccordionContent>
              Yes, you can unsave the job by clicking on the saved job again.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-9">
            <AccordionTrigger>9. How can Help and Support assist you?</AccordionTrigger>
            <AccordionContent>
              Use Help and Support if you have any queries that need resolution. 
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-10">
            <AccordionTrigger>10. How do I complete my profile?</AccordionTrigger>
            <AccordionContent>
              Click on My Profile from the left-hand side panel, go to the profile tab, and fill in all the required details to complete your profile. 
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-11">
            <AccordionTrigger>11. How do I log out from the system?</AccordionTrigger>
            <AccordionContent>
              Click on the Logout button from the left-hand side panel of the page to log out from the system.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </DialogContent>
    </Dialog>
  )
}

