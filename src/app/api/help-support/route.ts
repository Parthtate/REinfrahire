import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
  const { firstName, lastName, email, phone, category, query } = await request.json()

  // Validate phone number (must be exactly 10 digits)
  const phoneRegex = /^[0-9]{10}$/
  if (!phoneRegex.test(phone)) {
    return NextResponse.json({ message: 'Phone number must be exactly 10 digits' }, { status: 400 })
  }

  // Initialize Supabase client
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  //Create a nodemailer transporter (configure this with your email service)
  //Configure your email service here
    //Example for Gmail:
  // const transporter = nodemailer.createTransport({  
  //   host: 'gator4157.hostgator.com',
  //   port: 465,
  //   secure: true,                 // Port for TLS
  //   auth: {
  //     user: 'development@tlpms.com',
  //     pass: 'NpmtL@2024',
  //   },

  // })
  // Configure the Microsoft 365 SMTP server
  const transporter = nodemailer.createTransport({
    host: 'smtp-relay.brevo.com', // Microsoft 365 SMTP server
    port: 587,
    // secure: true,                 // Port for TLS
    auth: {
      user: '83263b001@smtp-brevo.com', // Your Microsoft 365 email
      pass: '6xFpwIrHAvgjJ5Db',           // Your Microsoft 365 email password
    },
   })

  const mailOptions = {
    from: 'NPPMT <contact@nppmt.com>',
    to: 'contact@nppmt.com',
    subject: 'New Help & Support Query from REinfraHire',
    text: `
      Name: ${firstName} ${lastName}
      Email: ${email}
      Phone: ${phone}
      Category: ${category}
      Query: ${query}

      Do not reply to this email. Create a new email and copy the user's email from above who has requested support.
    `,
  }

  try {
    // Send email
    await transporter.sendMail(mailOptions)
    
    // Save to database
    const { error: dbError } = await supabase
      .from('feedback')
      .insert({
        first_name: firstName,
        last_name: lastName,
        email: email,
        phone: phone,
        category: category,
        query: query,
        status: 'pending',
        priority: 'medium'
      })

    if (dbError) {
      console.error('Error saving to database:', dbError)
      // Still return success since email was sent, but log the database error
    }

    return NextResponse.json({ message: 'Query submitted successfully' }, { status: 200 })
  } catch (error) {
    console.error('Error sending email:', error)
    return NextResponse.json({ message: 'Failed to submit query' }, { status: 500 })
  }
}