"use server";

import { auth, db } from "@/firebase/admin";
import { cookies } from "next/headers";
const ONE_WEEK = 60 * 60 * 24 * 7 * 1000;
export async function signUp(params: SignUpParams) {
  const { uid, name, email } = params;
  try {
    const userRecord = await db.collection("users").doc(uid).get();
    if (userRecord.exists) {
      return {
        success: false,
        message: "This user already exists please sign in instead.",
      };
    }
    await db.collection("users").doc(uid).set({
      name,
      email,
    });
    return {
      success: true,
      message: "Account created successfully. Please sign in.",
    };
  } catch (error: any) {
    console.log("Error creating user: " + error);
    if (error.code === "auth/email-already-in-use") {
      return {
        sucess: false,
        message: "This email already in use.",
      };
    }
    return {
      success: false,
      message: "An error occurred while creating the user.",
    };
  }
}
export async function signIn(params: SignInParams) {
  try {
    const { email, idToken } = params;
    const userRecord = await auth.getUserByEmail(email);
    if (!userRecord) {
      return {
        success: false,
        message: "User not found. create an account.",
      };
    }
    await setSessionCookie(idToken);
  } catch (error: any) {
    console.log("Error signing in:", error);
    return {
      success: false,
      message: "An error occurred while signing in.",
    };
  }
}
export async function setSessionCookie(idToken: string) {
  const cookieStore = await cookies();
  const sessionCookies = await auth.createSessionCookie(idToken, {
    expiresIn: ONE_WEEK,
  });
  cookieStore.set("session", sessionCookies, {
    maxAge: ONE_WEEK,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    sameSite: "lax",
  });
}
export async function getCurrentUser(): Promise<User | null> {
  const cookiesStore = await cookies();
  const sessionCookie = cookiesStore.get("session")?.value;
  if (!sessionCookie) {
    return null;
  }
  try {
    const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);
    const userRecord = await db
      .collection("users")
      .doc(decodedClaims.uid)
      .get();
      if (!userRecord.exists) {
      return null;
    }
    return {
      ...userRecord.data(),
      id: userRecord.id,
    } as User;
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function isAuthenticated(){
  const user = await getCurrentUser();
  return !!user;
}