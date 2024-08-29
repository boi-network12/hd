import React, { useEffect, useState } from 'react';
import "./UsersDisplay.css";
import { useAuth } from '../../../Context/AuthContext';
import { useAlert } from '../../../Context/AlertContext';
import { logEvent } from 'firebase/analytics';
import { db, analytics } from '../../../FirebaseConfig';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';

const UsersDisplay = () => {
  const { currentUser } = useAuth();
  const showAlert = useAlert();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    logEvent(analytics, 'page_view', {
      page_title: 'user display product page'
    });

    // Fetch all users from Firestore
    const fetchUsers = async () => {
      try {
        const usersCollection = collection(db, 'users'); // Adjust the collection name based on your Firestore setup
        const usersSnapshot = await getDocs(usersCollection);
        const usersList = usersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setUsers(usersList);
      } catch (error) {
        console.error('Error fetching users:', error);
        showAlert('Error fetching users');
      }
    };

    fetchUsers();
  }, [showAlert]);

  // Function to handle role change
  const handleRoleChange = async (userId, newRole) => {
    try {
      const userDocRef = doc(db, 'users', userId); // Reference to the user document
      await updateDoc(userDocRef, { role: newRole }); // Update the user's role in Firestore
      showAlert('success','User role updated successfully');
      // Update the state to reflect the change locally
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user.id === userId ? { ...user, role: newRole } : user
        )
      );
    } catch (error) {
      console.error('Error updating user role:', error);
      showAlert('error','Error updating user role');
    }
  };

  return (
    <div className='userDisplayWrapper' style={{ marginTop: "73px" }}>
      {currentUser && currentUser.role === 'admin' ? (
        <div>
          <h1>Users List</h1>
          {users.length > 0 ? (
            <ol>
              <li><strong>Profile Image</strong> <strong>Name</strong> <strong>Email</strong> <strong>User Role</strong></li>
              {users.map(user => (
                <li key={user.id}>
                  <img width={50} src={user.profileImg} alt="" />
                  <strong>{user.name}</strong> - {user.email}
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)} 
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </li>
              ))}
            </ol>
          ) : (
            <p>No users found</p>
          )}
        </div>
      ) : (
        <p>Please move out, you're not the admin.</p>
      )}
    </div>
  );
};

export default UsersDisplay;
