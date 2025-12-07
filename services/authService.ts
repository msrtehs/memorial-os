
import * as firebaseAuth from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, googleProvider, storage, db } from "./firebaseConfig";
import { AppUser } from "../types";

// Extract functions from namespace with any cast to avoid TS errors about missing members
const { 
    signInWithPopup, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    signOut, 
    updateProfile, 
    onAuthStateChanged
} = firebaseAuth as any;

// Define User type as any since export is reported missing
type User = any;

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
        // Atualizar nome imediatamente
        await updateProfile(result.user, { displayName: name });
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
    const user = auth.currentUser;
    if (!user) return null;

    let photoURL = user.photoURL;

    if (photoFile) {
        // Upload da foto para o Storage
        const storageRef = ref(storage, `users/${user.uid}/profile.jpg`);
        await uploadBytes(storageRef, photoFile);
        photoURL = await getDownloadURL(storageRef);
    }

    await updateProfile(user, {
        displayName: name,
        photoURL: photoURL
    });

    // Atualizar no Firestore também para persistência extra
    await syncUserToFirestore(user, { displayName: name, photoURL });

    return formatUser(user);
};

// --- HELPERS ---

const syncUserToFirestore = async (user: User, extraData = {}) => {
    const userRef = doc(db, "users", user.uid);
    const userData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        lastLogin: new Date().toISOString(),
        ...extraData
    };
    // setDoc com merge: true atualiza se existir, cria se não existir
    await setDoc(userRef, userData, { merge: true });
};

const formatUser = (user: User): AppUser => ({
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL
});

export const subscribeToAuth = (callback: (user: AppUser | null) => void) => {
    return onAuthStateChanged(auth, (user: User) => {
        callback(user ? formatUser(user) : null);
    });
};
