
import * as firebaseAuth from "firebase/auth";
import * as firebaseStorage from "firebase/storage";
import * as firebaseFirestore from "firebase/firestore";
import { auth, googleProvider, storage, db } from "./firebaseConfig";
import { AppUser } from "../types";

// Extração segura das funções via Namespace
const { 
    signInWithPopup, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    signOut, 
    updateProfile: firebaseUpdateProfile, 
    onAuthStateChanged
} = firebaseAuth as any;

const { ref, uploadBytes, getDownloadURL } = firebaseStorage as any;
const { doc, setDoc } = firebaseFirestore as any;

// --- AUTHENTICATION FUNCTIONS ---

export const loginWithGoogle = async (): Promise<AppUser> => {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;
        await syncUserToFirestore(user);
        return formatUser(user);
    } catch (error) {
        console.error("Erro no login Google:", error);
        throw error;
    }
};

export const loginWithEmail = async (email: string, pass: string): Promise<AppUser> => {
    try {
        const result = await signInWithEmailAndPassword(auth, email, pass);
        return formatUser(result.user);
    } catch (error) {
        throw error;
    }
};

export const registerWithEmail = async (email: string, pass: string, name: string): Promise<AppUser> => {
    try {
        const result = await createUserWithEmailAndPassword(auth, email, pass);
        await firebaseUpdateProfile(result.user, { displayName: name });
        await syncUserToFirestore(result.user);
        return formatUser(result.user);
    } catch (error) {
        throw error;
    }
};

export const logout = async () => {
    await signOut(auth);
};

// --- PROFILE MANAGEMENT ---

export const updateUserProfile = async (name: string, photoFile?: File): Promise<AppUser | null> => {
    const user = (auth as any).currentUser;
    if (!user) return null;

    let photoURL = user.photoURL;

    if (photoFile) {
        // Upload da foto para o Storage
        const storageRef = ref(storage, `users/${user.uid}/profile.jpg`);
        await uploadBytes(storageRef, photoFile);
        photoURL = await getDownloadURL(storageRef);
    }

    await firebaseUpdateProfile(user, {
        displayName: name,
        photoURL: photoURL
    });

    await syncUserToFirestore(user, { displayName: name, photoURL });

    return formatUser(user);
};

// --- HELPERS ---

const syncUserToFirestore = async (user: any, extraData = {}) => {
    const userRef = doc(db, "users", user.uid);
    const userData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        lastLogin: new Date().toISOString(),
        ...extraData
    };
    await setDoc(userRef, userData, { merge: true });
};

const formatUser = (user: any): AppUser => ({
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL
});

export const subscribeToAuth = (callback: (user: AppUser | null) => void) => {
    return onAuthStateChanged(auth, (user: any) => {
        callback(user ? formatUser(user) : null);
    });
};
