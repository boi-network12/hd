import React, { useState, useEffect } from 'react';
import "./Header.css";
import { FaCartShopping } from "react-icons/fa6";
import { useAuth } from '../../Context/AuthContext';
import { useCart } from '../../Context/CartContext';
import { Link } from "react-router-dom";

const Header = () => {
    const { currentUser, logout } = useAuth();
    const { cartItems } = useCart();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const handleToggle = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    const handleCloseDropdown = () => {
        setIsDropdownOpen(false);
    };

    const handleLogout = async () => {
        try {
            await logout();
            handleCloseDropdown();
        } catch (error) {
            console.error("Error logging out:", error);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isDropdownOpen && !event.target.closest('.dropdownMenu') && !event.target.closest('.profileImg')) {
                handleCloseDropdown();
            }
        };

        const handleScroll = () => {
            if (isDropdownOpen) {
                handleCloseDropdown();
            }
        };

        document.addEventListener('click', handleClickOutside);
        window.addEventListener('scroll', handleScroll);

        return () => {
            document.removeEventListener('click', handleClickOutside);
            window.removeEventListener('scroll', handleScroll);
        };
    }, [isDropdownOpen]);

    return (
        <div className='headerWrapper'>
            <Link to="/" className='headerImgH1'>
                <img src={require("../../Assets/Image/spanner.png")} alt="" />
                <h1>neo material</h1>
            </Link>

            <div className='headerSecondDiv'>
                <Link to="/cart">
                    <FaCartShopping className="cart-icon" />
                    <span>{cartItems.length}</span>
                </Link>
                {currentUser ? (
                    <div className='headerSecondNav'>
                        <img
                            src={currentUser && currentUser.profileImg ? currentUser.profileImg : require("../../Assets/Image/placeholderImage.png")}
                            alt=""
                            onClick={handleToggle}
                            className='profileImg'
                        />
                        {isDropdownOpen && (
                            <ul className='dropdownMenu'>
                                <li><h6>My account</h6></li>
                                <li><Link to="/dashboard">Dashboard</Link></li>
                                <li><Link to="/orders">Orders</Link></li>
                                <li><Link to="/reviews">Reviews</Link></li>
                                
                                {/* for the admin route */}
                                {currentUser && currentUser.role === 'admin' && (
                                    <>
                                        <li><Link to="/postorder">Post order</Link></li>
                                        <li><Link to="/revieworder">Order review</Link></li>
                                        <li><Link to="/user_display">users</Link></li>
                                        <li><Link to="/custom_admin_chat">help chat</Link></li>
                                    </>
                                )}


                                {/* for the logout */}
                            <li><h6 onClick={handleLogout}>Logout</h6></li>
                            </ul>
                        )}
                    </div>
                ) : (
                    <Link to="/login">
                        <button>
                            Sign Up
                        </button>
                    </Link>
                )}
            </div>
        </div>
    );
};

export default Header;

