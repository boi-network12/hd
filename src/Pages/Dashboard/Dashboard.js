import { logEvent } from 'firebase/analytics';
import React, { useEffect, useState } from 'react';
import { analytics, storage } from '../../FirebaseConfig';
import "./Dashboard.css";
import { useAuth } from '../../Context/AuthContext';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';

const Dashboard = () => {
  const { currentUser, updateUser } = useAuth();
  const [name, setName] = useState(currentUser?.displayName || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [password, setPassword] = useState('');
  const [profileImg, setProfileImg] = useState(currentUser?.profileImg || '');
  const [imagePreview, setImagePreview] = useState(currentUser?.profileImg || '');
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    logEvent(analytics, 'page_view', {
      page_title: 'Dashboard page'
    });
  }, []);

  const uploadImage = async (file) => {
    const storageRef = ref(storage, `profileImages/${file.name}`);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  }

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      /// Upload image and get the URL
      try {
        const imageURL = await uploadImage(file);
        setImagePreview(imageURL);
        setProfileImg(imageURL);
      } catch (error) {
        console.error("Error uploading image:", error);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
        await updateUser(name, email, password, profileImg);
    } catch (error) {
        console.error("Error updating profile:", error.message);
    } finally {
        setLoading(false);
    }
};

  return (
    <div className='DashboardWrapper'>
      {currentUser && currentUser.role === 'admin' && (
        <span>{currentUser.displayName}</span>
      )}
      {currentUser ? (
        <div className='profileInfoWrapper'>
          <img
            src={imagePreview || require("../../Assets/Image/placeholderImage.png")}
            alt="Profile"
            className='profileImg'
          />
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className='fileInput'
          />
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name"
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="New Password"
            />
            <button type="submit">{loading ? 'Loading...' : 'Update'}</button>
          </form>
        </div>
      ) : (
        <p>There is no user logged in</p>
      )}
    </div>
  );
}

export default Dashboard;
