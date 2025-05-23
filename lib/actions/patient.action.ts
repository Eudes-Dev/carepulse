"use server"

import { ID, Query } from "node-appwrite"
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