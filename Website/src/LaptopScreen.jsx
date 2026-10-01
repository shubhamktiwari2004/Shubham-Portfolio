import React from 'react'







const LaptopScreen = () => (
    <div  id='mac-screen'
        style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            background: '#fdfdfb',
            color: '#161616',
            fontFamily: '"Space Grotesk", system-ui, sans-serif',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            gap: 24,
        }}
    >
        <h1 id='mac-screen' style={{ margin: 0, maxWidth: 1000, fontSize: 64, lineHeight: 1.1, fontWeight: 600, color: '#000000'}}>
            Hi.
        </h1>

        <div
            aria-hidden
            data-glare
            style={{
                position: 'absolute',
                inset: 0,
                pointerEvents: 'none',
                background:
                    'linear-gradient(115deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 35%), radial-gradient(ellipse at center, rgba(0,0,0,0) 60%, rgba(0,0,0,0.12) 100%)',
            }}
        />
    </div>
)

export default LaptopScreen