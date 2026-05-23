import React from 'react'
import { useMacbookStore } from '../store/index'
import clsx from 'clsx'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'


const ProductViewer = () => {
    const {color, scale, setcolor, setScale, reset} = useMacbookStore();
  return (
    <section id='product-viewer'>
        <h2>Take a closer Look</h2>

        <div className='controls'>
            <p className='info'>MacBookPro 16" in {color}</p>

            <div className='flex-center gap-5 mt-5'>
                <div  className='color-control'>
                    <div 
                    onClick={() => setcolor('#abd5bd')} 
                    className={clsx('bg-neutral-300', color === '#abd5bd' && 'active')}
                    />
                    <div 
                    onClick={() => setcolor('#2e2c2e')} 
                    className={clsx('bg-neutral-900', color === '#2e2c2e' && 'active')}
                    />
                </div>

                <div className='size-control'>
                    <div 
                    onClick={() => setScale(0.06)} 
                    className={clsx(scale === 0.06 ? 'bg-white text-black' : 'bg-transparent text-white')}
                    >
                        <p>14"</p>
                    </div>
                    <div 
                    onClick={() => setScale(0.08)} 
                    className={clsx(scale === 0.08 ? 'bg-white text-black' : 'bg-transparent text-white')}
                    >
                        <p>16"</p>
                    </div>
                </div>
            </div>

        </div>
        <Canvas id="canvas" camera={{ position: [0, 2, 5], fov: 50, near: 0.1, far: 100 }}>
  <mesh position={[0, 0, 0]} scale={10 * scale}>
    <boxGeometry />
    <meshStandardMaterial color={color} />
  </mesh>

  <OrbitControls enableZoom={false} />
</Canvas>

    </section>
  )
}

export default ProductViewer