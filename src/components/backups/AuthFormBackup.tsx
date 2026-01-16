// 'use client'

// import { useState } from 'react'
// import { useRouter } from 'next/navigation'
// import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
// import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
// import { AlertCircle, Eye, EyeOff } from "lucide-react"

// type AuthFormProps = {
//   mode: 'login' | 'signup'
// }

// export default function AuthForm({ mode }: AuthFormProps) {
//   const [email, setEmail] = useState('')
//   const [password, setPassword] = useState('')
//   const [firstName, setFirstName] = useState('')
//   const [lastName, setLastName] = useState('')
//   const [phone, setPhone] = useState('')
//   const [error, setError] = useState<string | null>(null)
//   const [showPassword, setShowPassword] = useState(false)
//   const router = useRouter()
//   const supabase = createClientComponentClient()

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
//     setError(null)

//     try {
//       if (mode === 'signup') {
//         const { data: authData, error: authError } = await supabase.auth.signUp({
//           email,
//           password,
//           options: {
//             data: {
//               first_name: firstName,
//               last_name: lastName,
//               phone,
//             },
//           },
//         })
//         if (authError) throw authError

//         if (authData.user) {
//           // Use the service role key to insert user data
//           const serviceRoleSupabase = createClientComponentClient({
//             supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY,
//           })

//           // Insert data into users table
//           const { error: insertUserError } = await serviceRoleSupabase
//             .from('users')
//             .upsert({
//               id: authData.user.id,
//               email,
//               first_name: firstName,
//               last_name: lastName,
//               phone,
//               role: 'candidate', // Set default role to 'candidate' for new signups
//             }, { onConflict: 'id' })

//           if (insertUserError) throw insertUserError

//           // Insert data into user_profiles table
//           const { error: insertProfileError } = await serviceRoleSupabase
//             .from('user_profiles')
//             .upsert({
//               id: authData.user.id,
//               first_name: firstName,
//               last_name: lastName,
//               email,
//               phone,
//             }, { onConflict: 'id' })

//           if (insertProfileError) throw insertProfileError

//           router.push('/auth/confirm-email')
//         }
//       } else {
//         const { data, error } = await supabase.auth.signInWithPassword({
//           email,
//           password,
//         })
//         if (error) throw error

//         // Fetch user role from the users table
//         const { data: userData, error: userError } = await supabase
//           .from('users')
//           .select('role')
//           .eq('id', data.user.id)
//           .single()

//         if (userError) throw userError

//         // Redirect based on user role
//         if (userData.role === 'admin') {
//           router.push('/admin')
//         } else {
//           router.push('/dashboard')
//         }
//       }
//     } catch (error) {
//       if (error instanceof Error) {
//         setError(error.message)
//       } else {
//         setError('An unexpected error occurred')
//       }
//       console.error('Auth error:', error)
//     }
//   }

//   const togglePasswordVisibility = () => {
//     setShowPassword(!showPassword)
//   }

//   return (
//     <Card className="w-full max-w-md">
//       <CardHeader>
//         <CardTitle>{mode === 'login' ? 'Log In' : 'Sign Up'}</CardTitle>
//         <CardDescription>
//           {mode === 'login' ? 'Enter your credentials to log in' : 'Create a new account'}
//         </CardDescription>
//       </CardHeader>
//       <CardContent>
//         <form onSubmit={handleSubmit} className="space-y-4">
//           {error && (
//             <Alert variant="destructive">
//               <AlertCircle className="h-4 w-4" />
//               <AlertTitle>Error</AlertTitle>
//               <AlertDescription>{error}</AlertDescription>
//             </Alert>
//           )}
//           {mode === 'signup' && (
//             <>
//               <div className='flex gap-2'>
//                 <div className="space-y-2 w-1/2">
//                   <Label htmlFor="firstName">First Name</Label>
//                   <Input
//                     id="firstName"
//                     type="text"
//                     placeholder="First Name"
//                     value={firstName}
//                     onChange={(e) => setFirstName(e.target.value)}
//                     required
//                   />
//                 </div>
//                 <div className="space-y-2 w-1/2">
//                   <Label htmlFor="lastName">Last Name</Label>
//                   <Input
//                     id="lastName"
//                     type="text"
//                     placeholder="Last Name"
//                     value={lastName}
//                     onChange={(e) => setLastName(e.target.value)}
//                     required
//                   />
//                 </div>
//               </div>
              
//               <div className="space-y-2">
//                 <Label htmlFor="phone">Phone</Label>
//                 <Input
//                   id="phone"
//                   type="tel"
//                   placeholder="Phone"
//                   value={phone}
//                   onChange={(e) => setPhone(e.target.value)}
//                   required
//                 />
//               </div>
//             </>
//           )}
//           <div className="space-y-2">
//             <Label htmlFor="email">Email</Label>
//             <Input
//               id="email"
//               type="email"
//               placeholder="Email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               required
//             />
//           </div>
//           <div className="space-y-2">
//             <Label htmlFor="password">Password</Label>
//             <div className="relative">
//               <Input
//                 id="password"
//                 type={showPassword ? "text" : "password"}
//                 placeholder="Password"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 required
//               />
//               <Button
//                 type="button"
//                 variant="ghost"
//                 size="icon"
//                 className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
//                 onClick={togglePasswordVisibility}
//                 aria-label={showPassword ? "Hide password" : "Show password"}
//               >
//                 {showPassword ? (
//                   <EyeOff className="h-4 w-4 text-gray-500" />
//                 ) : (
//                   <Eye className="h-4 w-4 text-gray-500" />
//                 )}
//               </Button>
//             </div>
//           </div>
//           <Button type="submit" className="w-full">
//             {mode === 'login' ? 'Log In' : 'Sign Up'}
//           </Button>
//         </form>
//       </CardContent>
//     </Card>
//   )
// }

/////// LATEST BELOW
// 'use client'

// import { useState } from 'react'
// import { useRouter } from 'next/navigation'
// import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
// import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
// import { AlertCircle, Eye, EyeOff } from "lucide-react"

// type AuthFormProps = {
//   mode: 'login' | 'signup'
// }

// export default function AuthForm({ mode }: AuthFormProps) {
//   const [email, setEmail] = useState('')
//   const [password, setPassword] = useState('')
//   const [firstName, setFirstName] = useState('')
//   const [lastName, setLastName] = useState('')
//   const [phone, setPhone] = useState('')
//   const [error, setError] = useState<string | null>(null)
//   const [showPassword, setShowPassword] = useState(false)
//   const router = useRouter()
//   const supabase = createClientComponentClient()

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
//     setError(null)

//     try {
//       if (mode === 'signup') {
//         const { data: authData, error: authError } = await supabase.auth.signUp({
//           email,
//           password,
//           options: {
//             data: {
//               first_name: firstName,
//               last_name: lastName,
//               phone,
//             },
//           },
//         })
//         if (authError) throw authError

//         if (authData.user) {
//           // Use the service role key to insert user data
//           const serviceRoleSupabase = createClientComponentClient({
//             supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY,
//           })

//           // Insert data into users table
//           const { error: insertUserError } = await serviceRoleSupabase
//             .from('users')
//             .upsert({
//               id: authData.user.id,
//               email,
//               first_name: firstName,
//               last_name: lastName,
//               phone,
//               role: 'candidate', // Set default role to 'candidate' for new signups
//             }, { onConflict: 'id' })

//           if (insertUserError) throw insertUserError

//           // Insert data into user_profiles table
//           const { error: insertProfileError } = await serviceRoleSupabase
//             .from('user_profiles')
//             .upsert({
//               id: authData.user.id,
//               first_name: firstName,
//               last_name: lastName,
//               email,
//               phone,
//             }, { onConflict: 'id' })

//           if (insertProfileError) throw insertProfileError

//           router.push('/auth/confirm-email')
//         }
//       } else {
//         const { data, error } = await supabase.auth.signInWithPassword({
//           email,
//           password,
//         })
//         if (error) throw error

//         // Fetch user role from the users table
//         const { data: userData, error: userError } = await supabase
//           .from('users')
//           .select('role')
//           .eq('id', data.user.id)
//           .single()

//         if (userError) throw userError

//         // Redirect based on user role
//         if (userData.role === 'admin') {
//           router.push('/admin')
//         } else {
//           router.push('/dashboard')
//         }
//       }
//     } catch (error) {
//       if (error instanceof Error) {
//         setError(error.message)
//       } else {
//         setError('An unexpected error occurred')
//       }
//       console.error('Auth error:', error)
//     }
//   }

//   const togglePasswordVisibility = () => {
//     setShowPassword(!showPassword)
//   }

//   return (
//     <Card className="w-full max-w-md">
//       <CardHeader>
//         <CardTitle>{mode === 'login' ? 'Log In' : 'Sign Up'}</CardTitle>
//         <CardDescription>
//           {mode === 'login' ? 'Enter your credentials to log in' : 'Create a new account'}
//         </CardDescription>
//       </CardHeader>
//       <CardContent>
//         <form onSubmit={handleSubmit} className="space-y-4">
//           {error && (
//             <Alert variant="destructive">
//               <AlertCircle className="h-4 w-4" />
//               <AlertTitle>Error</AlertTitle>
//               <AlertDescription>{error}</AlertDescription>
//             </Alert>
//           )}
//           {mode === 'signup' && (
//             <>
//               <div className='flex gap-2'>
//                 <div className="space-y-2 w-1/2">
//                   <Label htmlFor="firstName">First Name</Label>
//                   <Input
//                     id="firstName"
//                     type="text"
//                     placeholder="First Name"
//                     value={firstName}
//                     onChange={(e) => setFirstName(e.target.value)}
//                     required
//                   />
//                 </div>
//                 <div className="space-y-2 w-1/2">
//                   <Label htmlFor="lastName">Last Name</Label>
//                   <Input
//                     id="lastName"
//                     type="text"
//                     placeholder="Last Name"
//                     value={lastName}
//                     onChange={(e) => setLastName(e.target.value)}
//                     required
//                   />
//                 </div>
//               </div>
              
//               <div className="space-y-2">
//                 <Label htmlFor="phone">Phone</Label>
//                 <Input
//                   id="phone"
//                   type="tel"
//                   placeholder="Phone"
//                   value={phone}
//                   onChange={(e) => setPhone(e.target.value)}
//                   required
//                 />
//               </div>
//             </>
//           )}
//           <div className="space-y-2">
//             <Label htmlFor="email">Email</Label>
//             <Input
//               id="email"
//               type="email"
//               placeholder="Email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               required
//             />
//           </div>
//           <div className="space-y-2">
//             <Label htmlFor="password">Password</Label>
//             <div className="relative">
//               <Input
//                 id="password"
//                 type={showPassword ? "text" : "password"}
//                 placeholder="Password"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 required
//               />
//               <Button
//                 type="button"
//                 variant="ghost"
//                 size="icon"
//                 className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
//                 onClick={togglePasswordVisibility}
//                 aria-label={showPassword ? "Hide password" : "Show password"}
//               >
//                 {showPassword ? (
//                   <EyeOff className="h-4 w-4 text-gray-500" />
//                 ) : (
//                   <Eye className="h-4 w-4 text-gray-500" />
//                 )}
//               </Button>
//             </div>
//           </div>
//           <Button type="submit" className="w-full">
//             {mode === 'login' ? 'Log In' : 'Sign Up'}
//           </Button>
//         </form>
//       </CardContent>
//     </Card>
//   )
// }

//======================
//WORKING CODE
//======================

// 'use client'

// import { useState } from 'react'
// import { useRouter } from 'next/navigation'
// import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
// import { AlertCircle, Eye, EyeOff } from "lucide-react"

// type AuthFormProps = {
//   mode: 'login' | 'signup'
// }

// export default function AuthForm({ mode }: AuthFormProps) {
//   const [email, setEmail] = useState('')
//   const [password, setPassword] = useState('')
//   const [firstName, setFirstName] = useState('')
//   const [lastName, setLastName] = useState('')
//   const [phone, setPhone] = useState('')
//   const [error, setError] = useState<string | null>(null)
//   const [showPassword, setShowPassword] = useState(false)
//   const router = useRouter()
//   const supabase = createClientComponentClient({
//     supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
//     supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
//   })

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
//     setError(null)

//     try {
//       if (mode === 'signup') {
//         const { data, error } = await supabase.auth.signUp({
//           email,
//           password,
//           options: {
//             data: {
//               first_name: firstName,
//               last_name: lastName,
//               phone,
//             },
//           },
//         })
//         if (error) throw error

//         if (data.user && !data.session) {
//           // OTP sent successfully
//           localStorage.setItem('verificationEmail', email)
//           router.push('/auth/verify-otp')
//         } else {
//           // User already confirmed or auto-confirmed
//           router.push('/dashboard')
//         }
//       } else {
//         const { data, error } = await supabase.auth.signInWithPassword({
//           email,
//           password,
//         })
//         if (error) throw error

//         // Check user role and redirect accordingly
//         const { data: userData, error: userError } = await supabase
//           .from('users')
//           .select('role')
//           .eq('id', data.user.id)
//           .single()

//         if (userError) throw userError

//         if (userData?.role === 'admin') {
//           router.push('/admin')
//         } else {
//           router.push('/dashboard')
//         }
//       }
//     } catch (error) {
//       if (error instanceof Error) {
//         setError(error.message)
//       } else {
//         setError('An unexpected error occurred')
//       }
//       console.error('Auth error:', error)
//     }
//   }

//   const togglePasswordVisibility = () => {
//     setShowPassword(!showPassword)
//   }

//   return (
//     <Card className="w-full max-w-md">
//       <CardHeader>
//         <CardTitle>{mode === 'login' ? 'Log In' : 'Sign Up'}</CardTitle>
//         <CardDescription>
//           {mode === 'login' ? 'Enter your credentials to log in' : 'Create a new account'}
//         </CardDescription>
//       </CardHeader>
//       <CardContent>
//         <form onSubmit={handleSubmit} className="space-y-4">
//           {error && (
//             <Alert variant="destructive">
//               <AlertCircle className="h-4 w-4" />
//               <AlertTitle>Error</AlertTitle>
//               <AlertDescription>{error}</AlertDescription>
//             </Alert>
//           )}
//           {mode === 'signup' && (
//             <>
//               <div className='flex gap-2'>
//                 <div className="space-y-2 w-1/2">
//                   <Label htmlFor="firstName">First Name</Label>
//                   <Input
//                     id="firstName"
//                     type="text"
//                     placeholder="First Name"
//                     value={firstName}
//                     onChange={(e) => setFirstName(e.target.value)}
//                     required
//                   />
//                 </div>
//                 <div className="space-y-2 w-1/2">
//                   <Label htmlFor="lastName">Last Name</Label>
//                   <Input
//                     id="lastName"
//                     type="text"
//                     placeholder="Last Name"
//                     value={lastName}
//                     onChange={(e) => setLastName(e.target.value)}
//                     required
//                   />
//                 </div>
//               </div>
              
//               <div className="space-y-2">
//                 <Label htmlFor="phone">Phone</Label>
//                 <Input
//                   id="phone"
//                   type="tel"
//                   placeholder="Phone"
//                   value={phone}
//                   onChange={(e) => setPhone(e.target.value)}
//                   required
//                 />
//               </div>
//             </>
//           )}
//           <div className="space-y-2">
//             <Label htmlFor="email">Email</Label>
//             <Input
//               id="email"
//               type="email"
//               placeholder="Email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               required
//             />
//           </div>
//           <div className="space-y-2">
//             <Label htmlFor="password">Password</Label>
//             <div className="relative">
//               <Input
//                 id="password"
//                 type={showPassword ? "text" : "password"}
//                 placeholder="Password"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 required
//               />
//               <Button
//                 type="button"
//                 variant="ghost"
//                 size="icon"
//                 className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
//                 onClick={togglePasswordVisibility}
//                 aria-label={showPassword ? "Hide password" : "Show password"}
//               >
//                 {showPassword ? (
//                   <EyeOff className="h-4 w-4 text-gray-500" />
//                 ) : (
//                   <Eye className="h-4 w-4 text-gray-500" />
//                 )}
//               </Button>
//             </div>
//           </div>
//           <Button type="submit" className="w-full">
//             {mode === 'login' ? 'Log In' : 'Sign Up'}
//           </Button>
//         </form>
//       </CardContent>
//     </Card>
//   )
// }

// 'use client'

// import { useState } from 'react'
// import { useRouter } from 'next/navigation'
// import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
// import { AlertCircle, Eye, EyeOff } from "lucide-react"

// type AuthFormProps = {
//   mode: 'login' | 'signup'
// }

// export default function AuthForm({ mode }: AuthFormProps) {
//   const [email, setEmail] = useState('')
//   const [password, setPassword] = useState('')
//   const [firstName, setFirstName] = useState('')
//   const [lastName, setLastName] = useState('')
//   const [phone, setPhone] = useState('')
//   const [error, setError] = useState<string | null>(null)
//   const [showPassword, setShowPassword] = useState(false)
//   const router = useRouter()
//   const supabase = createClientComponentClient()

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
//     setError(null)

//     try {
//       if (mode === 'signup') {
//         const { data: authData, error: authError } = await supabase.auth.signUp({
//           email,
//           password,
//           options: {
//             data: {
//               first_name: firstName,
//               last_name: lastName,
//               phone,
//             },
//           },
//         })
//         if (authError) throw authError

//         if (authData.user) {
//           // Use the service role key to insert user data
//           const serviceRoleSupabase = createClientComponentClient({
//             supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY,
//           })

//           // Insert data into users table
//           const { error: insertUserError } = await serviceRoleSupabase
//             .from('users')
//             .upsert({
//               id: authData.user.id,
//               email,
//               first_name: firstName,
//               last_name: lastName,
//               phone,
//               role: 'candidate', // Set default role to 'candidate' for new signups
//             }, { onConflict: 'id' })

//           if (insertUserError) throw insertUserError

//           // Insert data into user_profiles table
//           const { error: insertProfileError } = await serviceRoleSupabase
//             .from('user_profiles')
//             .upsert({
//               id: authData.user.id,
//               first_name: firstName,
//               last_name: lastName,
//               email,
//               phone,
//             }, { onConflict: 'id' })

//           if (insertProfileError) throw insertProfileError

//           // Store email in localStorage for OTP verification
//           localStorage.setItem('verificationEmail', email)
//           router.push('/auth/verify-otp')
//         }
//       } else {
//         const { data, error } = await supabase.auth.signInWithPassword({
//           email,
//           password,
//         })
//         if (error) throw error

//         // Fetch user role from the users table
//         const { data: userData, error: userError } = await supabase
//           .from('users')
//           .select('role')
//           .eq('id', data.user.id)
//           .single()

//         if (userError) throw userError

//         // Redirect based on user role
//         if (userData.role === 'admin') {
//           router.push('/admin')
//         } else {
//           router.push('/dashboard')
//         }
//       }
//     } catch (error) {
//       if (error instanceof Error) {
//         setError(error.message)
//       } else {
//         setError('An unexpected error occurred')
//       }
//       console.error('Auth error:', error)
//     }
//   }

//   const togglePasswordVisibility = () => {
//     setShowPassword(!showPassword)
//   }

//   return (
//     <Card className="w-full max-w-md">
//       <CardHeader>
//         <CardTitle>{mode === 'login' ? 'Log In' : 'Sign Up'}</CardTitle>
//         <CardDescription>
//           {mode === 'login' ? 'Enter your credentials to log in' : 'Create a new account'}
//         </CardDescription>
//       </CardHeader>
//       <CardContent>
//         <form onSubmit={handleSubmit} className="space-y-4">
//           {error && (
//             <Alert variant="destructive">
//               <AlertCircle className="h-4 w-4" />
//               <AlertTitle>Error</AlertTitle>
//               <AlertDescription>{error}</AlertDescription>
//             </Alert>
//           )}
//           {mode === 'signup' && (
//             <>
//               <div className='flex gap-2'>
//                 <div className="space-y-2 w-1/2">
//                   <Label htmlFor="firstName">First Name</Label>
//                   <Input
//                     id="firstName"
//                     type="text"
//                     placeholder="First Name"
//                     value={firstName}
//                     onChange={(e) => setFirstName(e.target.value)}
//                     required
//                   />
//                 </div>
//                 <div className="space-y-2 w-1/2">
//                   <Label htmlFor="lastName">Last Name</Label>
//                   <Input
//                     id="lastName"
//                     type="text"
//                     placeholder="Last Name"
//                     value={lastName}
//                     onChange={(e) => setLastName(e.target.value)}
//                     required
//                   />
//                 </div>
//               </div>
              
//               <div className="space-y-2">
//                 <Label htmlFor="phone">Phone</Label>
//                 <Input
//                   id="phone"
//                   type="tel"
//                   placeholder="Phone"
//                   value={phone}
//                   onChange={(e) => setPhone(e.target.value)}
//                   required
//                 />
//               </div>
//             </>
//           )}
//           <div className="space-y-2">
//             <Label htmlFor="email">Email</Label>
//             <Input
//               id="email"
//               type="email"
//               placeholder="Email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               required
//             />
//           </div>
//           <div className="space-y-2">
//             <Label htmlFor="password">Password</Label>
//             <div className="relative">
//               <Input
//                 id="password"
//                 type={showPassword ? "text" : "password"}
//                 placeholder="Password"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 required
//               />
//               <Button
//                 type="button"
//                 variant="ghost"
//                 size="icon"
//                 className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
//                 onClick={togglePasswordVisibility}
//                 aria-label={showPassword ? "Hide password" : "Show password"}
//               >
//                 {showPassword ? (
//                   <EyeOff className="h-4 w-4 text-gray-500" />
//                 ) : (
//                   <Eye className="h-4 w-4 text-gray-500" />
//                 )}
//               </Button>
//             </div>
//           </div>
//           <Button type="submit" className="w-full">
//             {mode === 'login' ? 'Log In' : 'Sign Up'}
//           </Button>
//         </form>
//       </CardContent>
//     </Card>
//   )
// }