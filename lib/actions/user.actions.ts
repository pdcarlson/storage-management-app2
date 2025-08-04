"use server";

import { createAdminClient } from "../appwrite";
import { appwriteConfig } from "../appwrite/config";
import { Query, ID } from "node-appwrite";
import { parseStringify } from "../utils";

const handleError = (error: unknown, message: string) => {
    console.error(message, error);
    throw new Error(message);
};

const getUserByEmail = async (email: string) => {
    const { databases } = await createAdminClient();

    const result = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.usersCollectionId,
        [Query.equal("email", [email])]
    );
    return result.total > 0 ? result.documents[0] : null;
};

const sendEmailOTP = async ({ email }: { email: string }) => {
    const { account } = await createAdminClient();

    try {
        const session = await account.createEmailToken(ID.unique(), email);
        return session.userId;
    } catch (error) {
        handleError(error, "Failed to send email OTP");
    }
};

export const createAccount = async ({ fullName, email}: { fullName: string; email: string }) => {
    const existingUser = await getUserByEmail(email);

    const accountId = await sendEmailOTP({ email });
    if (!accountId) {
        throw new Error("Failed to send email OTP");
    }

    if (!existingUser) {
        const { databases } = await createAdminClient();

        await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.usersCollectionId,
            ID.unique(),
            {
                fullName,
                email,
                avatar: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAKMAAACUCAMAAADIzWmnAAAANlBMVEWVu9////+Rud6Ltdzm7vf2+fyvy+akxOPx9fr7/P6dwOGZvuC50emIs9zA1evZ5vPF2ezN3u8u+wDMAAAE3UlEQVR4nO2c6ZKrIBCFtVllEX3/l70SZpI40QiNtrFuvpmq1PxI1RmW7gYONM2XzwOmX4Db5ycCwMAalTB2+uvDhALzqg+Bay0iWvMQeuXZx8icGkyGrn2lC7L5iNYEpga9IDChB3V+YzIIYlVhRARgpyqEZngrMDGcOc/BhAyJbRvMaSJBve/mpw5XJ4kEmakwIk8RCXIp3qzRnSESbIHCiD1B5HpQXEaTK4SxUGLbjsQNWTRffiEekr60pyPaU0oEh5DYto60ITlKIydUiBqNEcIRCXlp+pVA2NklGWYGmUJ0VxN2NsN29dTZVPUuwwTHhKbSaHPLxleEpZEIDj1l2o4ojEPOGmaNgUhjecnzgKj4QUfwCFEUv4JGiysoEkRlRZ1GmuDz1bgTFxiPTdW8ppF4hdhzBY2sKhfSFGeXqCmuUJupCo1km6UVdTiRQtxmT4JsPXOFdSH0aI091XAEhdZIeL6AndgdmcIGsJUPJ9w3w2Yaoixz03iF/UeFi5Ca8kgOGSHJomMEGSHJomMSidJIfD6D6exAej5ziXMuzAKWaml9BxHGCQP4D8UbzoLeVMFKG3I4wUIDZcVPd4ahojCO04/GSNH+GfmkTlzAO1O0qUK0hbJAdj1OWH+/YPKCpDDnSWwgK5KLM+xHTyLltkhx1ny5i9z07p3m2XsSuVEB8RMNmvBbsL73kj48pJ7aygWN5HfLMhi+nLs7/qh1gNOanJl1fJbemFxwDosgH5E7Jk7uLFEonzp5TMvrp8gMoNysMTvu1KPZ4Cfa65Ggyyct8jFHZjvHwLyV/RhCGHtp/fNdgOfdaS7VkV0O3vTzPhX9fKkHwCJ/RPh+/qXQm4NaE5jkr4MubIYWsK/rXMHlAfZ7UMNysBb9W5XQ9Gvf23l9A+zNnQTer17wAN+vR3g97NmWoN7nEjGYdLdn9iVozErb3/+7/dJkjhOcD1I1cbbcYKxRctiuLndzjWda/jvNp6jjnHRuikBcZy0b9yo4DP7IaBu9S/nra6wJ2/Ad0iPSwpxP/UksHNrTEV0dJyvO3XKp3oGGo5txashKjRX24Hwqg+TBkzrB6/bJLd6WkE9XtV9FMGMiVbOmym6UT5Ux6fDgmKhKiPgD/zIUXiLRcKwakBUGlDIqDmQ9ReSJdPgIiTtdxYDua5JEmECnwyoTYRno0xuSZJ1Ap2yCuuwXdH1GlGVuGpGZpuyCdR3YhTZZlokgM03VXZ5SkHd/iAqzBLI8q7o7UQry7DjzMHAfkEeKhlBi2+I0UhW4CVSZe/hGzxzUtg9hRRFBVRVkRXgCVYoTVj0RVOVT4fjHgHoYgmwxk0AtaRipxLZFLQ2JNSIUAm2amRJNefCpuDiBA3FSQ7hwTSAq8a/G/0hj6ZtWtWBMaVfIhTVXHctBXo4ESbhPgd04A3B5J+WVdNrhBCaVXo1Hl5F8VJVuH2BWjsf1uR6l3cOdApPOQYu9e70TerA7vv4KzBs3LtiksAg+OrP/u68A1uT4YbbhgzT2MGMcMBZ9cVzjWlRoHnrr2fFPvQIDI90YymaSDqOTBuheoo1eqMZaFcdo934ydV0ce8ra9CVyphnv/RSc3DCGwLnW97eQteY8hHFwU2jx/gPebo7+stiuvy9Kp1elb69Mny/uLxB/IH1++Tj+AUa3QL3aqldFAAAAAElFTkSuQmCChttps://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_960_720.png',
                accountId,
            },
        );
    }
    return parseStringify( { accountId });
};