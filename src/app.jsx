import React from 'react'
import Navbar from './components/Navbar'  
import Hero from './components/Hero'   
import ProductViewer from './components/ProductViewer'   
import gsap from 'gsap'
import { ScrollTrigger, SplitText } from 'gsap/all'
import Showcase from './components/showcase'
import Performance from './components/performance'
import Features from './components/Features'
import Highlights from './components/highlights'
import Footer from './components/footer'


gsap.registerPlugin(ScrollTrigger, SplitText)

const App = () => {
  return (
    <main>
      <Navbar/>
      <Hero/>
      <ProductViewer/>
      <Showcase/>
      <Performance/>
      <Features/>
      <Highlights/>
      <Footer/>

    </main>
  )
}

export default App