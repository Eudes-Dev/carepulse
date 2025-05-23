'use client'

import { createUser } from '@/lib/actions/patient.action'
import { UserFormValidation } from '@/lib/validation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import React from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Form } from '../ui/form'
import CustomFormField, { FormFieldType } from '../CustomFormField'
import SubmitButton from '../SubmitButton'

const PatientForm = () => {
    const router = useRouter()
    const [isLoading, setIsLoading] = React.useState(false)

    const form = useForm<z.infer<typeof UserFormValidation>>({
        resolver: zodResolver(UserFormValidation),
        defaultValues: {
            name: "",
            email: "",
            phone: "",
        }
    })

    const onSubmit = async (values: z.infer<typeof UserFormValidation>) => {
        setIsLoading(true)

        try {
            const user = {
                name: values.name,
                email: values.email,
                phone: values.phone,
            }

            const newUser = await createUser(user)

            if (newUser) {
                router.push(`/patients/${newUser.$id}/register`)
            }
        } catch (error) {
            console.log(error)
        }

        setIsLoading(false)
    }


  return (
    <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='flex-1 space-y-6'>
            <section className="mb-12 space-y-4">
                <h1 className="header">Salut 👋</h1>
                <p className="text-dark-700">Commencez avec les rendez-vous.</p>
            </section>

            <CustomFormField
                fieldType={FormFieldType.INPUT}
                control={form.control}
                name="name"
                label="Full name"
                placeholder="John Doe"
                iconSrc="/assets/icons/user.svg"
                iconAlt="user"
            />

            <CustomFormField
                fieldType={FormFieldType.INPUT}
                control={form.control}
                name="email"
                label="Email"
                placeholder="johndoe@gmail.com"
                iconSrc="/assets/icons/email.svg"
                iconAlt="email"
            />

            <CustomFormField
                fieldType={FormFieldType.PHONE_INPUT}
                control={form.control}
                name="phone"
                label="Phone number"
                placeholder="(555) 123-4567"
            />

            <SubmitButton isLoading={isLoading}>Commencer</SubmitButton>
        </form>
    </Form>
  )
}

export default PatientForm