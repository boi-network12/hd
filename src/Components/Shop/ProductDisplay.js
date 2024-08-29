import React, { useEffect, useState } from 'react';
import "./ProductDisplay.css";
import ConstantImg from "../../Assets/Image/placeholderImage.png";
import { FaCartPlus, FaHeart, FaTrash } from "react-icons/fa";
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useAlert } from '../../Context/AlertContext';
import { db } from '../../FirebaseConfig';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { useLike } from '../../Context/LikeContext';
import { useAuth } from '../../Context/AuthContext';

const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false
};

const ProductDisplay = () => {
    const [products, setProducts] = useState([]);
    const [types, setTypes] = useState(['All']); // Initialize with 'All' as default
    const [selectedType, setSelectedType] = useState('All'); 
    const { currentUser } = useAuth();
    const { likeCount = {}, userLikes, likeProduct, unlikeProduct } = useLike();
    const showAlert = useAlert();

    useEffect(() => {
        const fetchProductsAndTypes = async () => {
            try {
                // Fetch product types from Firestore
                const typesSnapshot = await getDocs(collection(db, 'types'));
                const typesData = new Set(['All']); // Use Set to avoid duplicates

                typesSnapshot.forEach((doc) => {
                    typesData.add(doc.data().type);
                });

                // Fetch products from Firestore
                const productsQuery = collection(db, 'ordersPost');
                const querySnapshot = await getDocs(productsQuery);
                const productsData = [];

                querySnapshot.forEach((doc) => {
                    const productData = { id: doc.id, ...doc.data() };
                    productsData.push(productData);

                    // Add product type to typesData if not already present
                    if (productData.type) {
                        typesData.add(productData.type);
                    }
                });

                // Update state with fetched data
                setTypes(Array.from(typesData)); // Convert Set back to array
                if (selectedType && selectedType !== 'All') {
                    // Filter products based on selected type
                    const filteredProducts = productsData.filter(product => product.type === selectedType);
                    setProducts(filteredProducts);
                } else {
                    setProducts(productsData);
                }
            } catch (error) {
                console.error("Error fetching products or types: ", error);
                showAlert('error', 'Failed to load product types or products.');
            }
        };

        fetchProductsAndTypes();
    }, [selectedType, showAlert]);

    const handleDeleteProduct = async (productId) => {
        try {
            const productDocRef = doc(db, 'ordersPost', productId);
            await deleteDoc(productDocRef);
            setProducts(prevProducts => prevProducts.filter(product => product.id !== productId));
            showAlert('success', 'Product deleted successfully');
        } catch (error) {
            console.error("Error deleting product: ", error);
            showAlert('error', 'Failed to delete product');
        }
    };

    const handleAddToCart = (product) => {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const existingProductIndex = cart.findIndex(item => item.id === product.id);

        if (existingProductIndex > -1) {
            cart[existingProductIndex].quantity = (cart[existingProductIndex].quantity || 0) + 1;
        } else {
            cart.push({ ...product, quantity: 1 });
        }

        localStorage.setItem('cart', JSON.stringify(cart));
        showAlert('success', 'Product added to cart');
    };

    const handleLike = (product) => {
        likeProduct(product.id);
        showAlert('success', 'Product liked!');
    };

    const handleUnlike = (product) => {
        unlikeProduct(product.id);
        showAlert('info', 'Product unliked');
    };

    const handleTypeClick = (type) => {
        setSelectedType(type);
    };

    return (
        <div className='FeatureProductWrapper'>
            <div className='FeatureProductFirstDiv'>
                {/* Product types navigation */}
                <div className='FeatureProductFirstDivPBtn productDisplayBtn'>
                    {types.map((type, index) => (
                        <p
                            key={index}
                            onClick={() => handleTypeClick(type)}
                            className={selectedType === type ? 'active' : ''}
                        >
                            {type}
                        </p>
                    ))}
                </div>
                <h2>Products we offer</h2>
            </div>
            <div className='productDisplay'>
                {products.map((product) => (
                    <div key={product.id} className='itemsDisplay'>
                        <div className='imgDisplayProduct'>
                            <Slider {...settings}>
                                {product.img && product.img.map((image, index) => (
                                    <div key={index}>
                                        <img
                                            src={image || ConstantImg}
                                            alt={`${product.title}`}
                                        />
                                    </div>
                                ))}
                            </Slider>
                        </div>
                        <div className='describeDiv'>
                            <h5>{product.title}</h5>
                            <p>{product.desc}</p>
                            <div className='priceAndCount'>
                                <span>&#8358;{new Intl.NumberFormat().format(product.price)}</span>
                                
                                <div className='hearthDivAndCount'>
                                    {userLikes[product.id] ? (
                                        <p onClick={() => handleUnlike(product)}>
                                            <FaHeart color="red" /><span>{likeCount[product.id] || 0}</span>
                                        </p>
                                    ) : (
                                        <p onClick={() => handleLike(product)}>
                                            <FaHeart /><span>{likeCount[product.id] || 0}</span>
                                        </p>
                                    )}
                                    <p onClick={() => handleAddToCart(product)} className='btnCart'>
                                        <FaCartPlus />
                                        Add to Cart
                                    </p>
                                    {currentUser && currentUser.role === 'admin' && (
                                        <aside>
                                            <FaTrash onClick={() => handleDeleteProduct(product.id)} />
                                        </aside>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProductDisplay;
