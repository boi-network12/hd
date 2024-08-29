import React, { useEffect } from 'react'
import "./ReviewOrder.css"
import { logEvent } from 'firebase/analytics'
import { analytics } from '../../../FirebaseConfig'
import ScrollToTopButton from '../../../Components/ScrollTop/ScrollToTop'
import ProductController from '../../Components/ProductController/ProductController'

const ReviewOrder = () => {
  useEffect(() => {
    logEvent(analytics, 'page_view', {
      page_title: 'Review post page'
    })
  })

  
  return (
    <div className='ReviewOrderWrapper'>
      <ProductController/>
      <ScrollToTopButton/>
    </div>
  )
}

export default ReviewOrder