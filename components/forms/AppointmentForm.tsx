'use client'

import { getAppointmentSchema } from '@/lib/validation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import React from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Form } from '../ui/form'
import CustomFormField, { FormFieldType } from '../CustomFormField'
import SubmitButton from '../SubmitButton'
import { Doctors } from '@/constants'
import { SelectItem } from '../ui/select'
import Image from 'next/image'
import { createAppointment, updateAppointment } from '@/lib/actions/appointment.action'
import { Appointment } from '@/types/appwrite.types'

const AppointmentForm = ({
    userId,
    patientId,
    type,
    appointment,
    setOpen
}: {
    userId: string
    patientId: string
    type: 'create' | 'cancel' | 'schedule'
    appointment: Appointment
    setOpen: (open: boolean) => void
}) => {
    const router = useRouter()
    const [isLoading, setIsLoading] = React.useState(false)

    const AppointmentFormValidation = getAppointmentSchema(type)

    console.log(appointment)

    const form = useForm<z.infer<typeof AppointmentFormValidation>>({
        resolver: zodResolver(AppointmentFormValidation),
        defaultValues: {
            primaryPhysician: appointment ? appointment.primaryPhysician : '',
            schedule: appointment ? new Date(appointment.schedule) : new Date(),
            reason: appointment ? appointment.reason : "",
            note: appointment ? appointment.note : "",
            cancellationReason: appointment ? appointment.cancellationReason  ?? undefined : undefined
        }
    })

    const onSubmit = async (values: z.infer<typeof AppointmentFormValidation>) => {
        console.log("IM submiting", {type} )

        setIsLoading(true)

        let status
        switch (type) {
            case 'schedule':
                status = 'scheduled'
                break;
            case 'cancel':
                status = 'cancelled'
                break       
            default:
                status = 'pending'
                break;
        }

        try {
            console.log({type})
            if (type === 'create' && patientId) {
                const appointmentData = {
                    userId,
                    patient: patientId,
                    primaryPhysician: values.primaryPhysician,
                    schedule: new Date(values.schedule),
                    reason: values.reason!,
                    note: values.note,
                    status: status as Status
                }

                const appointment = await createAppointment(appointmentData)

                if (appointment) {
                    form.reset()
                    router.push(`/patients/${userId}/new-appointment/success?appointmentId=${appointment.$id}`)
                }
            } else {
                console.log('Updating appointment')
                const appointmentToUpdate = {
                    userId,
                    appointmentId: appointment?.$id,
                    appointment: {
                        primaryPhysician: values?.primaryPhysician,
                        schedule: new Date(values?.schedule),
                        status: status as Status,
                        cancellationReason: values.cancellationReason,
                    },
                    type
                }

                const updatedAppointment = await updateAppointment(appointmentToUpdate)

                if (updatedAppointment) {
                    if (setOpen)
                        setOpen(false)

                    form.reset()
                }
            }

        } catch (error) {
            console.log(error)
        }

        setIsLoading(false)
    }

    let buttonLabel

    switch (type) {
        case 'cancel':
            buttonLabel = 'Annuler le Rendez-vous'
            break;
        case 'create':
            buttonLabel = 'Creer un Rendez-vous'
            break
        case 'schedule':
            buttonLabel = "Planifier un Rendez-vous"
            break    
        default:
            break;
    }


  return (
    <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='flex-1 space-y-6'>
            {type === 'create' && <section className="mb-12 space-y-4">
                <h1 className="header">Nouveau Rendez-vous</h1>
                <p className="text-dark-700">Demander un nouveau rendez-vous en 10 secondes</p>
            </section>}

            {type !== 'cancel' && (
                <>
                    <CustomFormField
                        fieldType={FormFieldType.SELECT}
                        control={form.control}
                        name="primaryPhysician"
                        label="Docteur"
                        placeholder="Choisir un docteur"
                    >
                        {Doctors.map((doctor, i) => (
                            <SelectItem key={doctor.name + i} value={doctor.name}>
                                <div className="flex cursor-pointer items-center gap-2">
                                    <Image
                                        src={doctor.image}
                                        width={32}
                                        height={32}
                                        alt="doctor"
                                        className="rounded-full border border-dark-500"
                                    />
                                    <p>{doctor.name}</p>
                                </div>
                            </SelectItem>
                        ))}
                    </CustomFormField>

                    <CustomFormField
                        fieldType={FormFieldType.DATE_PICKER}
                        control={form.control}
                        name='schedule'
                        label='Date de rendez-vous prévue'
                        showTimeSelect
                        dateFormat='MM/dd/yyyy - h:mm aa'
                    />

                    <div className="flex flex-col gap-6 xl:flex-row">
                        <CustomFormField
                            fieldType={FormFieldType.TEXTAREA}
                            control={form.control}
                            name='reason'
                            label='Raison du rendez-vous'
                            placeholder='Entrer la raison du rendez-vous'
                        />

                        <CustomFormField
                            fieldType={FormFieldType.TEXTAREA}
                            control={form.control}
                            name='note'
                            label='Notes'
                            placeholder='Saisir des notes'
                        />
                    </div>
                </>
            )}

            {type === 'cancel' && (
                <CustomFormField
                    fieldType={FormFieldType.TEXTAREA}
                    control={form.control}
                    name='cancellationReason'
                    label="Raison de l'annulation"
                    placeholder="Saisir la raison de l'annulation"
                />
            )}
            
            <SubmitButton isLoading={isLoading} className={`${type === 'cancel' ? 'shad-danger-btn' : 'shad-primary-btn'} w-full`}>{buttonLabel}</SubmitButton>
        </form>
    </Form>
  )
}

export default AppointmentForm