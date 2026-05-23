import React, { useRef } from 'react'

const hero = () => {

    const videoRef = useRef();



  return (
    <section id='hero'>
        <div>
            <h1>Macbook Pro</h1>
            <img src='/title.png' alt='macbook title'/>

        </div>

        
        <video 
  ref={videoRef} 
  src="/videos/hero.mp4" 
  autoPlay 
  muted 
  playsInline
  className="w-full"
/>
    
    <button>Buy</button>

    <p>From $1599 or $133/mo  for 12 months</p>
    </section>
  )
}

export default hero