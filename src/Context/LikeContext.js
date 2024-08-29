import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../FirebaseConfig'; // Make sure to use the correct path to your Firebase config
import { doc, updateDoc, getDoc, collection, setDoc, deleteDoc, onSnapshot, getDocs } from 'firebase/firestore';
import { useAuth } from "./AuthContext"

// Create a Context
const LikeContext = createContext();

// Create a Provider Component
export const LikeProvider = ({ children }) => {
  const [likeCount, setLikeCount] = useState({});
  const [userLikes, setUserLikes] = useState({}); // Track likes specific to the current user
  const { currentUser } = useAuth();

  useEffect(() => {
    if (currentUser) {
      const productIds = Object.keys(likeCount);
      
      const unsubscribers = productIds.map(productId => {
        const productDocRef = doc(db, 'ordersPost', productId);
        const unsubscribe = onSnapshot(productDocRef, (doc) => {
          const productData = doc.data();
          setLikeCount(prevLikeCount => ({
            ...prevLikeCount,
            [productId]: productData?.likeCount || 0, // Ensure safe access
          }));
        });

        return unsubscribe;
      });

      // Cleanup function to unsubscribe from snapshots
      return () => unsubscribers.forEach(unsubscribe => unsubscribe());

    }
  }, [currentUser, likeCount]); // Added likeCount to dependency array
  
  useEffect(() => {
    const fetchProductIds = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'ordersPost'));
        const productIds = querySnapshot.docs.map(doc => doc.id);
        productIds.forEach(productId => initializeLikes(productId));
      } catch (error) {
        console.error("Error fetching product IDs: ", error);
      }
    };
  
    fetchProductIds();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Function to initialize likes from Firestore
  const initializeLikes = async (productId) => {
    try {
      const productDoc = await getDoc(doc(db, 'ordersPost', productId));
      if (productDoc.exists()) {
        const productData = productDoc.data();
        setLikeCount(prevLikeCount => ({
          ...prevLikeCount,
          [productId]: productData.likeCount || 0,
        }));
      }
    } catch (error) {
      console.error("Error fetching like count: ", error);
    }
  };

  useEffect(() => {
    const fetchUserLikes = async () => {
      if (!currentUser) return;
  
      try {
        const userLikesSnapshot = await getDocs(collection(db, 'users', currentUser.uid, 'likes'));
        const userLikesData = {};
        userLikesSnapshot.forEach((doc) => {
          userLikesData[doc.id] = doc.data().liked;
        });
        setUserLikes(userLikesData);
      } catch (error) {
        console.error("Error fetching user likes: ", error);
      }
    };
  
    fetchUserLikes();
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      const userLikesRef = collection(db, 'users', currentUser.uid, 'likes');
      const unsubscribe = onSnapshot(userLikesRef, (snapshot) => {
        const userLikesData = {};
        snapshot.forEach(doc => {
          userLikesData[doc.id] = doc.data().liked;
        });
        setUserLikes(userLikesData);
      });
  
      return () => unsubscribe();
    }
  }, [currentUser]);
  
  
  
  // Function to handle liking a product
  const likeProduct = async (productId) => {
    if (!currentUser) return;
  
    try {
      const userLikeRef = doc(db, 'users', currentUser.uid, 'likes', productId);
      const userLikeDoc = await getDoc(userLikeRef);
  
      if (!userLikeDoc.exists()) {
        await setDoc(userLikeRef, { liked: true });
  
        const productDocRef = doc(db, 'ordersPost', productId);
        const productDoc = await getDoc(productDocRef);
        const currentLikeCount = productDoc.exists() ? (productDoc.data().likeCount || 0) : 0;
  
        await updateDoc(productDocRef, {
          likeCount: currentLikeCount + 1,
        });
  
        setLikeCount(prevLikeCount => ({
          ...prevLikeCount,
          [productId]: currentLikeCount + 1,
        }));
  
        setUserLikes(prevUserLikes => ({
          ...prevUserLikes,
          [productId]: true,
        }));
      }
    } catch (error) {
      console.error("Error liking product: ", error);
    }
  };
  
  const unlikeProduct = async (productId) => {
    if (!currentUser) return;
  
    try {
      const userLikeRef = doc(db, 'users', currentUser.uid, 'likes', productId);
      const userLikeDoc = await getDoc(userLikeRef);
  
      if (userLikeDoc.exists()) {
        await deleteDoc(userLikeRef);
  
        const productDocRef = doc(db, 'ordersPost', productId);
        const productDoc = await getDoc(productDocRef);
        const currentLikeCount = productDoc.exists() ? (productDoc.data().likeCount || 0) : 0;
  
        if (currentLikeCount > 0) {
          await updateDoc(productDocRef, {
            likeCount: currentLikeCount - 1,
          });
  
          setLikeCount(prevLikeCount => ({
            ...prevLikeCount,
            [productId]: currentLikeCount - 1,
          }));
        }
  
        setUserLikes(prevUserLikes => ({
          ...prevUserLikes,
          [productId]: false,
        }));
      }
    } catch (error) {
      console.error("Error unliking product: ", error);
    }
  };
  
  
  return (
    <LikeContext.Provider value={{ likeCount, userLikes, likeProduct, unlikeProduct }}>
      {children}
    </LikeContext.Provider>
  );
};

// Custom Hook to use the LikeContext
export const useLike = () => {
  return useContext(LikeContext);
};
