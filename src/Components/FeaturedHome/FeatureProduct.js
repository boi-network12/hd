import React, { useState, useEffect } from 'react';
import "./FeatureProduct.css";
import { Link } from "react-router-dom";
import ConstantImg from "../../Assets/Image/placeholderImage.png";
import { FaCartPlus, FaHeart } from "react-icons/fa";
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useAlert } from '../../Context/AlertContext';
import { db } from '../../FirebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import { useLike } from '../../Context/LikeContext';

// Carousel settings
const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false
};

const FeatureProduct = () => {
    const [products, setProducts] = useState([]);
    const { likeCount, userLikes, likeProduct, unlikeProduct } = useLike();
    const showAlert = useAlert();

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                // Fetch all products
                const querySnapshot = await getDocs(collection(db, 'ordersPost'));
                const productsData = [];
                querySnapshot.forEach((doc) => {
                    productsData.push({ id: doc.id, ...doc.data() });
                });

                // Fetch all likes data (assuming you have a way to get this)
                const allLikes = likeCount;

                // Add likes count to products
                productsData.forEach(product => {
                    product.likes = allLikes[product.id] || 0;
                });

                // Sort products by likes and get top 3
                const sortedProducts = productsData.sort((a, b) => b.likes - a.likes).slice(0, 3);

                setProducts(sortedProducts);
            } catch (error) {
                console.error("Error fetching products: ", error);
                showAlert('error', 'Failed to load products.');
            }
        };

        fetchProducts();
    }, [likeCount, showAlert]);

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

    return (
        <div className='FeatureProductWrapper'>
            <div className='FeatureProductFirstDiv'>
                <h2>Featured Products</h2>
                <div className='FeatureProductFirstDivPBtn'>
                    <p>
                        Check out our top-selling welding products.
                    </p>
                    <Link to="/products"><p>View All</p></Link>
                </div>
            </div>
            <div className='productDisplay'>
                {products.map((product) => (
                    <div key={product.id} className='itemsDisplay'>
                        <div className='imgDisplayProduct'>
                            <Slider {...settings}>
                                {product.img.map((image, index) => (
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
                                            <FaHeart color="red" /><span>{product.likes || 0}</span>
                                        </p>
                                    ) : (
                                        <p onClick={() => handleLike(product)}>
                                            <FaHeart /><span>{product.likes || 0}</span>
                                        </p>
                                    )}

                                    <p onClick={() => handleAddToCart(product)} className='btnCart'>
                                        <FaCartPlus />
                                        Add to Cart
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>  
                ))}
            </div>
        </div>
    );
}

export default FeatureProduct;
