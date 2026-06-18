import React from 'react'
import { Environment, Lightformer } from '@react-three/drei'
import { Group } from 'three'

const studiolights = () => {
  return (
    <group name='lights'>
        <Environment resolution={256}>
            <group>
                <Lightformer form="rect" intensity={10} position={[-10, 5, -5]} scale={10} rotation-y={Math.PI / 2}/>
                <Lightformer form="rect" intensity={10} position={[10, 0, 1]} scale={10} rotation-y={Math.PI / 2}/>  
            </group> 
        </Environment>
        <spotLight intensity={Math.PI * 1}   position={[0, 15, 5]}   decay={0.1} angle={0.15} />
        <spotLight intensity={Math.PI * 0.2} position={[0, -25, 10]} decay={0}   angle={0.15} />
    </group>
  )
}

export default studiolights