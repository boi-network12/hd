import React from 'react'
import "./HomeHero.css";
import { Link } from "react-router-dom"

const HomeHero = () => {
  return (
    <div className='homeHeroWrapper'>
        <div className='homeHeroFistDiv'>
            <span>featured products</span>
            <h2>crafting exceptional welding solution</h2>
            <p>
                Discover our premium welding products, designed to elevate your product with unparalleled quality and precision
            </p>
            <div className='homeHeroBtn'>
                <Link to="/products"><p>shop now</p></Link>
                <Link><p>learn more </p></Link>
            </div>
        </div>

        {/* image */}

        <img src={require("../../Assets/Image/welding-art.webp")} alt="" />
    </div>
  )
}

export default HomeHero