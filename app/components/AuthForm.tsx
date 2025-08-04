"use client"

import Image from "next/image"

import { createAccount } from "@/lib/actions/user.actions"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/app/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/app/components/ui/form"
import { Input } from "@/app/components/ui/input"

const formSchema = z.object({
  username: z.string().min(2).max(50),
})

import React from 'react'
import Link from "next/link"
import OtpModal from "./OTPModal"

type FormType = 'sign-in' | 'sign-up';

const authFormSchema = (formType: FormType) => {
  return z.object({
    email: z.string().email(),
    fullName: formType === 'sign-up' ? z.string().min(2).max(50) : z.string().optional(),
  });
}

const AuthForm = ( {type}: {type: FormType}) => {
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState("");
  const [accountId, setAccountId] = React.useState(null);

  // create form with default values and validation schema
  const formSchema = authFormSchema(type);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      fullName: "",
    },
  })
 
  // on submit function for form
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const user = await createAccount({ fullName: values.fullName || "", email: values.email });
      setAccountId(user.accountId);
    } catch {
      setErrorMessage('Failed to create account. Please try again.')
    } finally {
      setIsLoading(false);
    }
  }

    return (
    <>
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="auth-form">
        <h1 className="form-title">
          {type === 'sign-in' ? 'Sign In' : 'Sign Up'}
        </h1>
        {type === 'sign-up' && (
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem className="shad-form-item">
                <div>
                  <FormLabel className="shad-form-label">Full Name</FormLabel>
                  
                  <FormControl>
                    <Input className="shad-input" placeholder="Enter your full name" {...field} />
                  </FormControl>
                </div>
              <FormMessage className="shad-form-message" />
            </FormItem>
          )}
        />)}

        {/* EMAIL form field */}
        <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <div className="shad-form-item">
                  <FormLabel className="shad-form-label">Email</FormLabel>
                  
                  <FormControl>
                    <Input className="shad-input" placeholder="Enter your email" {...field} />
                  </FormControl>
                </div>
              <FormMessage className="shad-form-message" />
            </FormItem>
          )}
        />

        <Button type="submit" className="form-submit-button" disabled={isLoading}>
          {type === 'sign-in' ? 'Sign In' : 'Sign Up'}
          {isLoading && (
            <Image src="/assets/icons/loader.svg" alt="loader" width={24} height={24} className="ml-2 animate-spin" />
          )}
        </Button>
        {errorMessage && (
          <p className="error-message">*{errorMessage}</p>
        )}

        <div className="body-2 flex justify-center">
          <p className="text-light-100">
            {type === 'sign-in' ? 'Don\'t have an account?' : 'Already have an account?'}
          </p>
          <Link href={type === 'sign-in' ? '/sign-up' : '/sign-in'} className="ml-1 font-medium text-brand">
            {type === 'sign-in' ? 'Sign Up' : 'Sign In'}</Link>
        </div>
      </form>
    </Form>
    {/* OTP VERIFICATION */}
    {accountId && <OtpModal email={form.getValues('email')} accountId={accountId} />}
    </>
  )
}

export default AuthForm