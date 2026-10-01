import React, { useEffect, useLayoutEffect, useRef } from 'react'
import * as THREE from 'three'
import { createRoot } from 'react-dom/client'
import { useThree, useFrame } from '@react-three/fiber'
import { useGLTF, useAnimations } from '@react-three/drei'
import { CSS3DRenderer, CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer.js'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import LaptopScreen from './LaptopScreen'

gsap.registerPlugin(ScrollTrigger)

const SCREEN_MATERIAL = 'Display.002'
const SCREEN_PX_W = 1440

const EXPAND_DURATION = 1
// Overlay fades out over the last part of the expansion (0..1) so the real
// page underneath takes over. Set to 1 to disable the fade.
const FADE_START = 1
// The overlay must sit above your hero section / navbar to be visible.
const OVERLAY_Z = -1

// Notch measured from the model's bezel geometry, as fractions of the screen.
const NOTCH_W = 0.12 // width  / screen width
const NOTCH_H = 0.0355 // height / screen height
const NOTCH_R = 0.006 // bottom corner radius / screen width
const SCREEN_R = 0.009 // screen corner radius / screen width
const FOV_START = 24 // narrow lens while far away
const FOV_END = 40   // your current fov, so the ending is unchanged

const lerp = THREE.MathUtils.lerp
const clamp = THREE.MathUtils.clamp
const easeInOut = gsap.parseEase('power2.inOut')
const CORNERS = [
    [-1, 1],
    [1, 1],
    [-1, -1],
    [1, -1],
]

const Office = () => {
    // Selectors (not bare useThree()) so a window resize doesn't re-render this
    // component and reset the camera mid-scroll.
    const camera = useThree((s) => s.camera)
    const gl = useThree((s) => s.gl)

    const model = useGLTF('/model/mac2.glb')
    const { actions } = useAnimations(model.animations, model.scene)

    const clipDuration = useRef(0)
    const scrollProgress = useRef(0) // 0..1  lid opening
    const expand = useRef(0) // 0..1  screen -> viewport
    const css = useRef(null)

    const fov = useRef({ v: FOV_START })

    useLayoutEffect(() => {
        camera.position.set(5.4, 3.1, 6.0) // pulled back along the same view line
        camera.rotation.y = 0.5
        camera.rotation.z = 0.08 // slight tilt, levels out during the move
        camera.fov = FOV_START
        camera.updateProjectionMatrix()
    }, [camera])

    useEffect(() => {
        const action = actions['EmptyAction.001']
        action.play()
        action.paused = true

        clipDuration.current = action.getClip().duration
        ScrollTrigger.refresh()
    }, [actions])

    // ---------------------------------------------------------------------
    // Laptop screen: CSS3D content + DOM overlay that expands to the viewport
    // ---------------------------------------------------------------------
    useEffect(() => {
        // 1. Find the screen quad by material name.
        let screenMesh = null
        model.scene.traverse((o) => {
            if (o.isMesh && o.material && o.material.name === SCREEN_MATERIAL) screenMesh = o
        })
        if (!screenMesh) {
            console.warn(`[Office] No mesh with material "${SCREEN_MATERIAL}" found`)
            return
        }

        // 2. Size / centre of the screen in the mesh's local space.
        const geo = screenMesh.geometry
        geo.computeBoundingBox()
        const size = geo.boundingBox.getSize(new THREE.Vector3())
        const center = geo.boundingBox.getCenter(new THREE.Vector3())
        const pxW = SCREEN_PX_W
        const pxH = Math.round((pxW * size.y) / size.x)

        // 3. Anchor on the screen mesh: follows the lid and the 5x scale.
        //    Local +Z = screen normal, +X = right, +Y = up.
        const anchor = new THREE.Object3D()
        anchor.position.copy(center)
        anchor.scale.setScalar(size.x / pxW)
        screenMesh.add(anchor)

        // 4. Hole punch so the CSS layer behind the canvas shows through.
        //    Offset is positive (pushed back) so the bezel and its notch,
        //    which sit on the same plane, still draw on top of the hole.
        const originalMaterial = screenMesh.material
        const holeMaterial = new THREE.MeshBasicMaterial({
            color: 0x000000,
            opacity: 0,
            blending: THREE.NoBlending,
            polygonOffset: true,
            polygonOffsetFactor: 1,
            polygonOffsetUnits: 1,
        })
        screenMesh.material = holeMaterial

        // 5. CSS3D screen content (what you see on the laptop while zooming in).
        const el = document.createElement('div')
        Object.assign(el.style, {
            width: `${pxW}px`,
            height: `${pxH}px`,
            overflow: 'hidden',
            background: '#fff',
        })
        const root = createRoot(el)
        root.render(<LaptopScreen />)

        const object = new CSS3DObject(el)
        const cssScene = new THREE.Scene()
        cssScene.add(object)

        const renderer = new CSS3DRenderer()
        const canvas = gl.domElement
        const host = canvas.parentElement
        host.style.position = 'relative'
        Object.assign(renderer.domElement.style, {
            position: 'absolute',
            inset: '0',
            zIndex: '0',
            pointerEvents: 'none',
        })
        Object.assign(canvas.style, { position: 'absolute', inset: '0', zIndex: '1' })
        host.insertBefore(renderer.domElement, canvas)

        // 6. DOM overlay that takes over once the lid is open, then grows to
        //    fill the viewport. Notch and rounded corners are plain CSS.
        const overlay = document.createElement('div')
        Object.assign(overlay.style, {
            position: 'fixed',
            left: '0',
            top: '0',
            width: '0',
            height: '0',
            overflow: 'hidden',
            background: '#fff',
            pointerEvents: 'none',
            visibility: 'hidden',
            zIndex: String(OVERLAY_Z),
        })
        const content = document.createElement('div')
        Object.assign(content.style, {
            position: 'absolute',
            left: '0',
            top: '0',
            width: `${pxW}px`,
            height: `${pxH}px`,
            transformOrigin: '0 0',
        })
        const overlayRoot = createRoot(content)
        overlayRoot.render(<LaptopScreen />)
        const notch = document.createElement('div')
        Object.assign(notch.style, {
            position: 'absolute',
            top: '0',
            left: '50%',
            background: '#000',
        })
        overlay.append(content, notch)
        document.body.appendChild(overlay)

        let glare = null
        let shown = false
        const v = new THREE.Vector3()

        const updateOverlay = () => {
            // Only take over once the lid is fully open and the camera has arrived.
            if (scrollProgress.current < 0.995) {
                if (shown) {
                    overlay.style.visibility = 'hidden'
                    shown = false
                }
                return
            }

            // Project the screen corners to viewport pixels.
            camera.updateMatrixWorld()
            const r = canvas.getBoundingClientRect()
            let minX = Infinity,
                minY = Infinity,
                maxX = -Infinity,
                maxY = -Infinity
            for (const [sx, sy] of CORNERS) {
                v.set((sx * pxW) / 2, (sy * pxH) / 2, 0).applyMatrix4(anchor.matrixWorld).project(camera)
                const x = r.left + (v.x * 0.5 + 0.5) * r.width
                const y = r.top + (-v.y * 0.5 + 0.5) * r.height
                minX = Math.min(minX, x)
                maxX = Math.max(maxX, x)
                minY = Math.min(minY, y)
                maxY = Math.max(maxY, y)
            }
            const w0 = maxX - minX
            const h0 = maxY - minY

            const t = clamp(expand.current, 0, 1)
            const e = easeInOut(t)
            const w = lerp(w0, window.innerWidth, e)
            const h = lerp(h0, window.innerHeight, e)

            const fade = FADE_START >= 1 ? 0 : clamp((t - FADE_START) / (1 - FADE_START), 0, 1)
            if (fade >= 1) {
                if (shown) {
                    overlay.style.visibility = 'hidden'
                    shown = false
                }
                return
            }
            if (!shown) {
                overlay.style.visibility = 'visible'
                shown = true
            }

            const s = pxW > 0 ? Math.max(w / pxW, h / pxH) : 1 // "cover" scale
            Object.assign(overlay.style, {
                left: `${lerp(minX, 0, e)}px`,
                top: `${lerp(minY, 0, e)}px`,
                width: `${w}px`,
                height: `${h}px`,
                borderRadius: `${lerp(w0 * SCREEN_R, 0, e)}px`,
                opacity: String(1 - fade),
            })
            content.style.transform = `translate(${(w - pxW * s) / 2}px, ${(h - pxH * s) / 2}px) scale(${s})`

            // Notch keeps its real-screen size, then slides off the top edge.
            const nh = h0 * NOTCH_H
            const nr = w0 * NOTCH_R
            Object.assign(notch.style, {
                width: `${w0 * NOTCH_W}px`,
                height: `${nh}px`,
                borderRadius: `0 0 ${nr}px ${nr}px`,
                transform: `translate(-50%, ${-nh * clamp(e / 0.5, 0, 1)}px)`,
            })

            if (!glare) glare = content.querySelector('[data-glare]')
            if (glare) glare.style.opacity = String(1 - e)
        }

        css.current = { renderer, cssScene, object, anchor, updateOverlay, w: 0, h: 0 }

        return () => {
            css.current = null
            renderer.domElement.remove()
            overlay.remove()
            screenMesh.material = originalMaterial
            holeMaterial.dispose()
            screenMesh.remove(anchor)
            queueMicrotask(() => {
                root.unmount()
                overlayRoot.unmount()
            })
        }
    }, [model, gl, camera])

    // Render the CSS layer + sync the overlay every frame, after the lid is posed.
    useFrame(({ size }) => {
        const c = css.current
        if (camera.fov !== fov.current.v) {
            camera.fov = fov.current.v
            camera.updateProjectionMatrix()
        }
        if (!c) return
        // ...rest unchanged

        if (c.w !== size.width || c.h !== size.height) {
            c.renderer.setSize(size.width, size.height)
            c.w = size.width
            c.h = size.height
        }

        c.anchor.updateWorldMatrix(true, false)
        c.anchor.matrixWorld.decompose(c.object.position, c.object.quaternion, c.object.scale)
        c.renderer.render(c.cssScene, camera)
        c.updateOverlay()
    })

    // ---------------------------------------------------------------------
    // Scroll animation
    // ---------------------------------------------------------------------
    useGSAP(() => {
        const tl = gsap.timeline({
            defaults: { ease: 'none' },
            scrollTrigger: {
                trigger: '#office',
                endTrigger: '#hero-section',
                start: 'top top',
                end: 'bottom bottom',
                scrub: 0.6,
            },
        })


        tl.to(scrollProgress, { current: 1, duration: 1.5 }, 0.65)

        // slow drift in, then a rush toward the laptop
        tl.to(camera.position, { x: 0.5, y: 2.72, z: -1.2, duration: 2.15, ease: 'power2.inOut' }, 0)

        // lens widens as we get close
        tl.to(fov.current, { v: FOV_END, duration: 2, ease: 'power2.in' }, 0)

        tl.to(camera.rotation, { y: 0, z: 0, duration: 1.5 }, 0.5)

        tl.to(expand, { current: 1, duration: EXPAND_DURATION }, 2.15)





        // Closing: the laptop shuts as #office5 scrolls through.
        const closeTl = gsap.timeline({
            defaults: { ease: 'none' },
            scrollTrigger: {
                trigger: '#office5',
                start: 'top bottom',   // as soon as #office5 enters the viewport
                end: 'bottom bottom',  // fully closed at the very bottom of the page
                scrub: 0.6,
                invalidateOnRefresh: true,
            },
        })

        // 1) full-viewport screen shrinks back onto the laptop (camera stays put)
        closeTl.fromTo(expand, { current: 1 }, { current: 0, duration: 1, immediateRender: false }, 0)

        // 2) then the lid closes (reverse of the opening animation)
        closeTl.fromTo(scrollProgress, { current: 1 }, { current: 0, duration: 1.5, immediateRender: false }, 0.9)

        closeTl.fromTo(
    camera.position,
    { x: 0.5, y: 2.72, z: -1.2 },
    { x: 1.7, y: 2.82, z: 0.6, duration: 1.8, ease: 'sine.inOut', immediateRender: false },
    0.9
)


    }, [])



    useFrame(() => {
        if (actions['EmptyAction.001']) {
            actions['EmptyAction.001'].time = scrollProgress.current * clipDuration.current
        }
    })

    return (
        <>
            <primitive object={model.scene} position={[0, 0, 0]} scale={[1, 1, 1]} />

            <ambientLight intensity={0.02} />

            <pointLight position={[-3, 1.5, 0]} intensity={5} color="#ff00ff" distance={8} decay={2} />

            <pointLight position={[3.5, 3, 1]} intensity={35} color="#dee2c6" distance={8} decay={2} />
        </>
    )
}

export default Office