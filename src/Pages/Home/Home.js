import React, { useEffect } from 'react'
import "./Home.css"
import HomeHero from '../../Components/HeroSection/HomeHero'
import Footer from '../../Components/footer/Footer'
import FeatureProduct from '../../Components/FeaturedHome/FeatureProduct'
import ProductCat from '../../Components/ProductCategories/ProductCat'
import HomeReview from '../../Components/HomeReview/HomeReview'
import ScrollToTopButton from '../../Components/ScrollTop/ScrollToTop'
import { logEvent } from 'firebase/analytics'
import { analytics } from '../../FirebaseConfig'

const Home = () => {
  useEffect(() => {
    logEvent(analytics, 'page_view', {
      page_title: 'Home page'
    })
  })
  

  return (
    <div className='HomeContainerWrapper'>
      {/* hero section */}
      <HomeHero/>
      {/* for featured products */}
      <FeatureProduct/>
      {/* product cat */}
      <ProductCat/>
      {/* HomeReview */}
      <HomeReview/>
      {/* footer */}
      <Footer/>
      {/* scroll to top */}
      <ScrollToTopButton/>
    </div>
  )
}

export default Home