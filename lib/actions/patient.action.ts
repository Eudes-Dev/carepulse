"use server"

import { ID, Query } from "node-appwrite"
import { InputFile } from 'node-appwrite/file'
import {
    BUCKET_ID,
    DATABASE_ID,
    ENDPOINT,
    PATIENT_COLLECTION_ID,
    PROJECT_ID,
    databases,
    storage,
    users,
} from "../appwrite.config"
import { parseStringify } from "../utils"

//CREATE APPWRITE USER
export const createUser = async (user: CreateUserParams) => {
    try {
        // Create new user -> https://appwrite.io/docs/references/1.5.x/server-nodejs/users#create
        const newuser = await users.create(
            ID.unique(),
            user.email,
            user.phone,
            undefined,
            user.name
        )

        return parseStringify(newuser)

    } catch (error: any) {
        //Check existing user
        if (error && error?.code === 400) {
            const existingUser = await users.list([
                Query.equal("email", [user.email])
            ])

            return existingUser.users[0]
        }
        console.error("Une erreur s'est produite lors de la création d'un nouvel utilisateur :", error)
    }
}

//GET USER
export const getUser = async (userId: string) => {
    try {
        const user = await users.get(userId)

        return parseStringify(user)
    } catch (error) {
        console.error(
            "Une erreur s'est produite lors de la récupération des détails de l'utilisateur :",
            error
        )
    }
}

//GET PATIENT
export const getPatient = async (userId: string) => {
    try {
        const patients = await databases.listDocuments(
            DATABASE_ID!,
            PATIENT_COLLECTION_ID!,
            [Query.equal("userId", [userId])]
        )

        return parseStringify(patients.documents[0])
    } catch (error) {
        console.error(
            "Une erreur s'est produite lors de la récupération des détails du patient :",
            error
        )
    }
}

//REGISTER PATIENT
export const registerPatient = async ({
    identificationDocument,
    ...patient
}: RegisterUserParams) => {
    try {
        // Upload file ->  // https://appwrite.io/docs/references/cloud/client-web/storage#createFile
        let file

        if (identificationDocument) {
            const inputFile = identificationDocument && 
            InputFile.fromBuffer(
                identificationDocument?.get('blobFile') as Blob,
                identificationDocument?.get('fileName') as string
            )

            file = await storage.createFile(BUCKET_ID!, ID.unique(), inputFile)
        }

        const newPatient = await databases.createDocument(
            DATABASE_ID!,
            PATIENT_COLLECTION_ID!,
            ID.unique(),
            {
                identificationDocumentId: file?.$id || null,
                identificationDocumentUrl: `${ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${file?.$id}/view?project=${PROJECT_ID}`,
                ...patient
            }
        )

        return parseStringify(newPatient)
    } catch (error) {
        console.log(error)
    }
}