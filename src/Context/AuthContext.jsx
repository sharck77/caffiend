import { createUserWithEmailAndPassword, onAuthStateChanged, sendPasswordResetEmail, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { useState, useEffect, useContext, createContext } from "react";
import { auth, db } from "../../firebase";
import { doc, getDoc } from "firebase/firestore";

const AuthContext = createContext()

export function useAuth() {
    return useContext(AuthContext)
}

export function AuthProvider(props) {
    const {children} = props
    const [globalUser, setGlobalUser] = useState(null)
    const [globalData, setGlobalData] = useState(null)
    const [isLoading, setIsLoading] = useState(false)

    function signup(email, password) {
        return createUserWithEmailAndPassword(auth, email, password)
    }

    function login(email, password) {
        return signInWithEmailAndPassword(auth, email, password)
    }

    function resetPassword(email) {
        return sendPasswordResetEmail(auth, email)
    }

    const logout = () => {
        setGlobalUser(null)
        setGlobalData(null)
        return signOut(auth)
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            // REMOVE THIS BEFORE DEPLOYING
            console.log("Current User: ", user)
            // REMOVE ABOVE BEFORE DEPLOYING
            setGlobalUser(user)
            //if no user, empt user state and return from this
            
            if (!user) { 
                console.log("No active user")
                return 
            }

            // if there is a user, then check if the user has data in the database and
            // if they do, then fetch data and update the global state

            try {
                setIsLoading(true)
                
                // first we create a reference for the document (labelled JSON object)
                // then we get the doc then we snapshot it to see if it exists 
                const docRef = doc(db, "users", user.uid)
                const docSnap = await getDoc(docRef)

                let firebaseData = {}
                if (docSnap.exists()) {
                   
                   firebaseData = docSnap.data() 
                   console.log("Found user data", firebaseData)
                    }
                    setGlobalData(firebaseData)
                }   catch (err) {
                    console.log(err.message)
                } finally {
                    setIsLoading(false)
                }
        })
        return unsubscribe
    }, [])

    const value = { globalUser, globalData, setGlobalData, isLoading, setIsLoading, 
        signup, login, logout }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}