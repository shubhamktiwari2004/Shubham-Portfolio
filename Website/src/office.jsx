import React, { useEffect, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import { OrbitControls, useGLTF, useAnimations } from '@react-three/drei'
import gsap from "gsap";
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useFrame } from '@react-three/fiber'

gsap.registerPlugin(ScrollTrigger)

const Office = () => {

    const { camera, scene, gl } = useThree()

    camera.position.x = 0;
    camera.position.y = 0;
    camera.position.z = 2.5;
    camera.fov = 40
    camera.updateProjectionMatrix()


    const model = useGLTF("/model/mac.glb")

    const { actions } = useAnimations(model.animations, model.scene)

    const clipDuration = useRef(0);
    const scrollProgress = useRef(0);

    useEffect(() => {
        const action = actions["EmptyAction.001"]
        action.play();
        action.paused = true;

        clipDuration.current = action.getClip().duration
        ScrollTrigger.refresh();
    }, [actions])

    useGSAP(() => {

        const tl = gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
                trigger: "#office",  
                endTrigger: "#office3",
                start: "top top",
                end: "bottom bottom",
                scrub: 0.3,                   
            },
        })

        tl.to(model.scene.position, {
            y: "-0.4",
            z: "+0.5",
            duration: 1
        }, 0)

        tl.to(scrollProgress, { 
            current: 1,
            duration: 1
        }, 0)

        tl.to(model.scene.position, {
            y: "-0.6",
            z: "+1.5",

        },1)


        
    }, [])

    useFrame(() => {
        if (actions["EmptyAction.001"]) {
            actions["EmptyAction.001"].time = scrollProgress.current * clipDuration.current;
        }
    })


    return (
        <>
            <primitive object={model.scene} position={[0, 0, 0]} scale={[1, 1, 1]} />
            <directionalLight intensity={5} color={0xffffff} position={[0, 3, 3]} />
            {/* <OrbitControls/>  */}
        </>
    )
}

export default Office