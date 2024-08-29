import React, { useEffect } from 'react'
import "./Products.css"
import Footer from '../../Components/footer/Footer'
import { logEvent } from 'firebase/analytics'
import { analytics } from '../../FirebaseConfig'
import ScrollToTopButton from '../../Components/ScrollTop/ScrollToTop'
import ProductDisplay from '../../Components/Shop/ProductDisplay'


const Products = () => {
        useEffect(() => {
          logEvent(analytics, 'page_view', {
            page_title: 'shop page'
          })
        });


        
    return (
        <div className='productShopWrapper'>
            <ProductDisplay/>
            <Footer/>
            <ScrollToTopButton/>
        </div>
    )
}

export default Products