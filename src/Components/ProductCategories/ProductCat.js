import React from 'react'
import "./ProductCat.css"
import chair_img from "../../Assets/Image/chair_image.jpeg";
import table_img from "../../Assets/Image/4bd1be18-ea45-47d5-b8b7-6bb4b8307cc4.jpg";
import gate_img from "../../Assets/Image/gate_iron.jpg";


// Sample data updated
const item = [
    {
        id: 1,
        title: "Chair",
        desc: "Discover our top-quality iron chair",
        img: chair_img
    },
    {
        id: 2,
        title: "Table",
        desc: "Discover our top-quality iron table",
        img: table_img
    },
    {
        id: 3,
        title: "gate",
        desc: "Discover our top-quality iron gate",
        img: gate_img
    },
];


const ProductCat = () => {
  return (
    <div className='FeatureProductWrapper catCOntainer'>
            <div className='FeatureProductFirstDiv'>
                <h2>product categories</h2>
                <div className='FeatureProductFirstDivPBtn'>
                    <p>
                        browse our wide range of iron products.
                    </p>
                    
                </div>
            </div>
            <div className='productDisplay'>
                {item.map((product) => (
                    <div key={product.id} className='itemsDisplay catDisplay'>
                        <div className='imgDisplayProduct'>
                            <img src={product.img} alt="" />
                        </div>
                        <div className='describeDiv'>
                            <h5>{product.title}</h5>
                            <p>{product.desc}</p>
                            
                        </div>
                    </div>
                ))}
            </div>
        </div>
  )
}

export default ProductCat