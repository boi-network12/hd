import React from 'react'
import "./Footer.css"
import { Link } from 'react-router-dom'

const footerContent = [
  {
    title: 'company',
    links: [
      { name: 'about us', to: '/about' },
      { name: 'our team', to: '/team' },
      { name: 'careers', to: '/careers' },
      { name: 'news', to: '/news' }
    ]
  },
  {
    title: 'products',
    links: [
      { name: 'street light stand', to: '/products/street-light-stand' },
      { name: 'over head tank', to: '/products/over-head-tank' },
      { name: 'gates', to: '/products/gates' },
      { name: 'tables', to: '/products/tables' },
      { name: 'chair', to: '/products/chair' }
    ]
  },
  {
    title: 'resources',
    links: [
      { name: 'blog', to: '/blog' },
      { name: 'community', to: '/community' },
      { name: 'support', to: '/support' },
      { name: 'faqs', to: '/faqs' }
    ]
  },
  {
    title: 'legal',
    links: [
      { name: 'privacy policy', to: '/privacy-policy' },
      { name: 'terms of service', to: '/terms-of-service' },
      { name: 'cookie policy', to: '/cookie-policy' }
    ]
  },
  {
    title: 'contact',
    links: [
      { name: 'support', to: '/contact/support' },
      { name: 'sales', to: '/contact/sales' },
      { name: 'press', to: '/contact/press' },
      { name: 'partnerships', to: '/contact/partnerships' }
    ]
  }
]

const Footer = () => {
  return (
    <div className='footerWrapper'> 
      {footerContent.map((section, index) => (
        <div className='footerUl' key={index}>
          <h3>{section.title}</h3>
          {section.links.map((link, linkIndex) => (
            <Link to={link.to} key={linkIndex}>{link.name}</Link>
          ))}
        </div>
      ))}
    </div>
  )
}

export default Footer
