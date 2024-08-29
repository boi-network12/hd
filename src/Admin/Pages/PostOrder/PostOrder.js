import React, { useState, useRef, useEffect } from 'react'
import { } from 'react-router-dom'
import "./PostOrder.css"
import { useAuth } from "../../../Context/AuthContext"
import { useAlert } from "../../../Context/AlertContext"
import { FaImage } from "react-icons/fa"
import { analytics, db, storage } from '../../../FirebaseConfig'
import { addDoc, collection } from "firebase/firestore"
import { getDownloadURL, ref, uploadBytes } from "firebase/storage"
import { logEvent } from 'firebase/analytics'

const PostOrder = () => {
  const { currentUser } = useAuth();
  const showAlert = useAlert();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [type, setType] = useState('');
  const [desc, setDesc] = useState('');
  const [images, setImages] = useState([]);

  useEffect(() => {
    logEvent(analytics, 'page_view', {
      page_title: 'post product page'
    })
  })

  // useRef to handle the file input
  const fileInputRef = useRef();

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length !== 3) {
      showAlert('error', 'You must upload exactly 3 images.');
    }
    setImages(files);
  }

  const uploadImagesToStorage = async () => {
    const uploadPromises = images.map((image, index) => {
      const storageRef = ref(storage, `orders/${Date.now()}_${index}_${image.name}`);
      return uploadBytes(storageRef, image).then((snapshot) => getDownloadURL(snapshot.ref))
    })
    return Promise.all(uploadPromises);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true)
    try {
      if (images.length !== 3) {
        showAlert('error', 'Please upload exactly 3 images.');
        setLoading(false);
        return;
      }

      // Upload images to firebase storage
      const imageUrls = await uploadImagesToStorage();

      // Create the order object
      const newOrder = {
        title,
        desc,
        price: parseFloat(price),
        likeCount: 0,
        type,
        img: imageUrls,
        createdAt: Date.now()
      };

      // Add the order to firestore 
      const docRef = await addDoc(collection(db, 'ordersPost'), newOrder);
      console.log('Order created with ID: ', docRef.id);

      // Display success alert
      showAlert('success', 'Order has been posted successfully!');

      // Reset form fields
      setTitle('');
      setPrice('');
      setType('')
      setDesc('');
      setImages('');

    } catch (error) {
      showAlert('error', 'Failed to post order. Please try again.');
      console.error('Error adding document: ', error);
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='PostOrderWrapper'>
      {currentUser && currentUser.role === 'admin' ? (
        <form className='postOrderContainer' onSubmit={handleSubmit}>
          <div className='pictureBtn'>
            <img
              src={currentUser && currentUser.profileImg ? currentUser.profileImg : require("../../../Assets/Image/placeholderImage.png")}
              alt=""
              className='profileImg'
            />
            <button type='submit'>{loading ? 'Loading...' : 'Submit'}</button>
          </div>
          <div className='postContent'>
            <input
              type="text"
              placeholder='Post name'
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <input
              type="number"
              placeholder='Write the amount'
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />

            <select value={type} onChange={(e) => setType(e.target.value)}>
              <option value='' key=''>
                -select option
              </option>
              <option value='chair' key='chair'>
                Chair
              </option>
              <option value='table' key='table'>
                Table
              </option>
              <option value='gate' key='gate'>
                Gate
              </option>
            </select>

            <textarea
              cols="30"
              rows="10"
              placeholder='Add post description'
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
            ></textarea>
            <div className='fileBtn'>
              <p onClick={() => fileInputRef.current.click()}>
                <FaImage className='icon' size={20} />
                {/* Hidden file input */}
                <input
                  type='file'
                  accept='image/*'
                  multiple
                  onChange={handleImageUpload}
                  className='fileInput'
                  ref={fileInputRef}
                  style={{ display: 'none' }} // Hide the file input
                />
              </p>
            </div>
          </div>
        </form>
      ) : (
        <p>I'm sorry, you are not the admin.</p>
      )}
    </div>
  )
}

export default PostOrder;
