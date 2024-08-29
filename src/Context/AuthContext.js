import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithEmailAndPassword, signInWithPopup, signOut, updateEmail, updatePassword, updateProfile } from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { auth, db, realTimeDb } from "../FirebaseConfig";
import { onValue, push, ref, set } from "firebase/database";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

const acceptedAdmin = [
    'kamdilichukwu2020@gmail.com',
    'home@gmail.com',
    'him@gmail.com'
];

const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [adminMessages, setAdminMessages] = useState([]);
    const messageRef = useRef(null);

    const logout = useCallback(async () => {
        try {
            await signOut(auth);
            setCurrentUser(null);
            
        } catch (error) {
            console.error('Error logging out:', error);
            throw error;
        }
    }, []);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async user => {
            console.log('Auth state changed:', user);
            if (user) {
                const userDoc = await getDoc(doc(db, "users", user.uid));
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    setCurrentUser({
                        ...user,
                        role: userData.role,
                        ipAddress: userData.ipAddress,
                        profileImg: userData.profileImg
                    });
                } else {
                    await logout();
                }
            } else {
                setCurrentUser(null);
            }
        });
    
        return unsubscribe;
    }, [logout]);

   // Fetch user messages
   useEffect(() => {
    if (!currentUser) return;
  
    // Fetch messages sent by user
    const messagesRef = ref(realTimeDb, `chat/userChat/${currentUser.uid}/messages`);
    onValue(messagesRef, (snapshot) => {
      const data = snapshot.val();
      const fetchedMessages = data ? Object.values(data) : [];
  
      // Fetch messages sent by admin to the current user
      if (currentUser.role !== 'admin') {
        const adminMessagesRef = ref(realTimeDb, 'chat/adminChat/messages');
        onValue(adminMessagesRef, (snapshot) => {
          const data = snapshot.val();
          if (data) {
            const adminMessages = Object.values(data).filter(msg => msg.recipientId === currentUser.uid);
            fetchedMessages.push(...adminMessages);
          }
  
          // Sort messages by timestamp after fetching all messages
          fetchedMessages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  
          setMessages(fetchedMessages);
        });
      } else {
        // Sort messages by timestamp for admin messages
        fetchedMessages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        setMessages(fetchedMessages);
      }
    });
  }, [currentUser]);
  
      

    // Fetch admin messages
    useEffect(() => {
        if (currentUser?.role !== 'admin') return;
      
        const userChatsRef = ref(realTimeDb, 'chat/userChat');
        const adminChatsRef = ref(realTimeDb, 'chat/adminChat/messages');
      
        onValue(userChatsRef, (snapshot) => {
          const usersData = snapshot.val();
          const allMessages = [];
      
          if (usersData) {
            Object.keys(usersData).forEach((userId) => {
              const userMessages = usersData[userId].messages;
              if (userMessages) {
                const messagesArray = Object.entries(userMessages).map(([id, message]) => ({
                  id,
                  ...message,
                  sender: userId,
                }));
                allMessages.push(...messagesArray);
              }
            });
          }
      
          onValue(adminChatsRef, (adminSnapshot) => {
            const adminData = adminSnapshot.val();
            if (adminData) {
              const adminMessagesArray = Object.entries(adminData).map(([id, message]) => ({
                id,
                ...message,
              })).filter(msg => msg.sender === currentUser.uid || msg.recipientId === currentUser.uid);
      
              allMessages.push(...adminMessagesArray);
            }
      
            // Sort all messages by timestamp
            allMessages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
            
            setAdminMessages(allMessages);
          });
        });
      }, [currentUser]);
      
    

    

    const deleteOldMessages = useCallback(() => {
        const messagesRef = ref(realTimeDb, 'chat/adminChat/messages');
    
        // Fetch all messages
        onValue(messagesRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                Object.entries(data).forEach(([key, value]) => {
                    const messageTime = new Date(value.timestamp).getTime();
                    const currentTime = new Date().getTime();
    
                    // Check if message is older than 24 hours
                    if (currentTime - messageTime > 24 * 60 * 60 * 1000) {
                        const messageRef = ref(realTimeDb, `chat/adminChat/messages/${key}`);
                        set(messageRef, null); // Delete the message
                    }
                });
            }
        });
    }, []);
    
    // Set an interval to run deleteOldMessages every hour
    useEffect(() => {
        const interval = setInterval(deleteOldMessages, 60 * 60 * 1000); // Every hour
    
        // Cleanup interval on component unmount
        return () => clearInterval(interval);
    }, [deleteOldMessages]);

    const handleSendMessage = (recipientId = null) => {
        if (message.trim() === '') return;
      
        const messagePath = currentUser?.role === 'admin' 
          ? `chat/adminChat/messages`  // Admin replying to a user
          : `chat/userChat/${currentUser.uid}/messages`;
      
        const newMessageRef = push(ref(realTimeDb, messagePath));
        set(newMessageRef, {
          sender: currentUser.uid,
          text: message,
          timestamp: new Date().toISOString(), // Ensure timestamp is included
          recipientId: currentUser?.role === 'admin' ? recipientId : null,
          read: false,  // Add this line
        });
      
        // Check if admin is sending the message, add the message to the user's chat as well
        if (currentUser?.role === 'admin' && recipientId) {
          const userChatRef = ref(realTimeDb, `chat/userChat/${recipientId}/messages`);
          const newUserMessageRef = push(userChatRef);
          set(newUserMessageRef, {
            sender: currentUser.uid,
            text: message,
            timestamp: new Date().toISOString(), // Ensure timestamp is included
            read: false,  // Add this line
          });
        }
      
        setMessage('');
        if (messageRef.current) {
          messageRef.current.scrollIntoView({ behavior: "smooth" });
        }
      };
      
      
      
    

    
    

    const signup = async (name, email, password) => {
        try {
            // Create user with email and password
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Update user profile with name
            await updateProfile(user, {
                displayName: name
            });

            // Determine role based on email
            const role = acceptedAdmin.includes(email) ? 'admin' : 'user';

            // Get user IP address
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            const ipAddress = data.ip;

            // Store additional user information in Firestore
            await setDoc(doc(db, "users", user.uid), {
                uid: user.uid,
                name,
                email,
                role,
                ipAddress,
                profileImg: "",
                createdAt: new Date()
            });

            // Set the current user in state
            setCurrentUser({
                ...user,
                role,
                profileImg: "",
                ipAddress
            });

            
        } catch (error) {
            console.error("Error signing up:", error);
            throw error;
        }
    };

    const login = async (email, password) => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Retrieve the user's role and IP address from Firestore
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (userDoc.exists()) {
                const userData = userDoc.data();
                setCurrentUser({
                    ...user,
                    role: userData.role,
                    ipAddress: userData.ipAddress
                });

            } else {
                throw new Error("No user data found");
            }
        } catch (error) {
            console.error("Error logging in:", error);
            throw error;
        }
    };

    const googleRegister = async () => {
        try {
            const provider = new GoogleAuthProvider();
            const userCredential = await signInWithPopup(auth, provider);
            const user = userCredential.user;
    
            // Log the user data for debugging
            console.log("Google user data:", user);
    
            // Check if the user already exists in Firestore
            const userDoc = await getDoc(doc(db, "users", user.uid));
    
            if (!userDoc.exists()) {
                // Determine role based on email
                const role = acceptedAdmin.includes(user.email) ? 'admin' : 'user';
    
                // Get user IP address
                const response = await fetch('https://api.ipify.org?format=json');
                if (!response.ok) {
                    throw new Error(`IP fetch failed: ${response.statusText}`);
                }
                const data = await response.json();
                const ipAddress = data.ip;
    
                // Store additional user information in Firestore
                await setDoc(doc(db, "users", user.uid), {
                    uid: user.uid,
                    name: user.displayName,
                    email: user.email,
                    role,
                    ipAddress,
                    profileImg: user.photoURL || '',
                    createdAt: new Date()
                });
    
                console.log("New user data saved:", {
                    uid: user.uid,
                    name: user.displayName,
                    email: user.email,
                    role,
                    ipAddress,
                    profileImg: user.photoURL || ''
                });
    
                setCurrentUser({
                    ...user,
                    role,
                    ipAddress,
                    profileImg: user.photoURL || ''
                });
            } else {
                // If the user already exists, set the current user with retrieved data
                const userData = userDoc.data();
                setCurrentUser({
                    ...user,
                    role: userData.role,
                    ipAddress: userData.ipAddress
                });
            }
    
        } catch (error) {
            console.error("Error with Google sign-up/Login:", error.message);
            // Additional error details can be provided here
            throw error;
        }
    }
    
    

    const deleteAccount = async () => {
        if (currentUser) {
            try {
                await currentUser.delete();
                setCurrentUser(null);
            } catch (error) {
                console.error("Error deleting account:", error);
                throw error;
            }
        }
    };

    const updateUser = async (name, email, password, profileImg) => {
        if (!currentUser) throw new Error("No user is currently logged in!");
    
        try {
            const user = auth.currentUser;
    
            if (name !== currentUser.displayName) {
                await updateProfile(user, { displayName: name });
            }
    
            if (email !== currentUser.email) {
                await updateEmail(user, email);
            }
    
            if (password) {
                await updatePassword(user, password);
            }
    
            await updateDoc(doc(db, "users", user.uid), {
                name,
                email,
                profileImg // Update profileImg
            });
    
            setCurrentUser({ ...currentUser, displayName: name, email, profileImg });
    
        } catch (error) {
            console.error("Error updating user profile:", error.message);
            throw error;
        }
    };
    
    

    return (
        <AuthContext.Provider value={{ currentUser, signup, login, googleRegister, logout, deleteAccount, updateUser, message, setMessage, handleSendMessage, messages, adminMessages }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;
