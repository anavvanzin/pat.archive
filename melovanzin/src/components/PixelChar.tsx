import { useEffect, useRef } from 'react'

type CharType = 'ana' | 'lucas' | 'capybara'

interface Props {
  char: CharType
  size?: number
  animate?: boolean
  style?: React.CSSProperties
}

// Pixel art drawing functions
// Pixel size = 4px

function drawAna(ctx: CanvasRenderingContext2D, px: number, ox: number, oy: number) {
  const p = (x: number, y: number, color: string) => {
    ctx.fillStyle = color
    ctx.fillRect(ox + x * px, oy + y * px, px, px)
  }

  // Long dark wavy hair (top)
  const hair = '#1a0a00'
  const hairWave = '#2a1000'
  // Hair top
  p(2,0,hair); p(3,0,hair); p(4,0,hair); p(5,0,hair)
  p(1,1,hair); p(2,1,hair); p(3,1,hair); p(4,1,hair); p(5,1,hair); p(6,1,hair)
  // Hair sides (long wavy)
  p(1,2,hair); p(6,2,hair)
  p(1,3,hair); p(6,3,hair)
  p(1,4,hairWave); p(6,4,hairWave)
  p(1,5,hair); p(6,5,hair)
  p(1,6,hairWave); p(6,6,hairWave)
  p(1,7,hair); p(6,7,hair)
  p(0,8,hair); p(7,8,hair) // wide wave

  // Skin
  const skin = '#f5c5a0'
  const blush = '#ff9eb4'
  p(2,2,skin); p(3,2,skin); p(4,2,skin); p(5,2,skin)
  p(2,3,skin); p(3,3,skin); p(4,3,skin); p(5,3,skin)
  p(2,4,skin); p(3,4,skin); p(4,4,skin); p(5,4,skin)
  // Blush marks
  p(2,4,blush); p(5,4,blush)
  // Eyes (brown)
  p(3,3,'#3d1a00'); p(4,3,'#3d1a00')
  // Smile
  p(3,5,skin); p(4,5,skin)
  ctx.fillStyle = '#c06060'
  ctx.fillRect(ox + 3*px + 1, oy + 5*px + 2, px*2 - 2, 2)

  // Pink dress / top
  const dress = '#ff6eb4'
  const dressDark = '#cc4488'
  p(1,6,dress); p(2,6,dress); p(3,6,dress); p(4,6,dress); p(5,6,dress); p(6,6,dress)
  p(1,7,dress); p(2,7,dress); p(3,7,dress); p(4,7,dress); p(5,7,dress); p(6,7,dress)
  p(0,8,dress); p(1,8,dress); p(2,8,dress); p(3,8,dress); p(4,8,dress); p(5,8,dress); p(6,8,dress); p(7,8,dress)
  p(0,9,dress); p(1,9,dress); p(2,9,dress); p(3,9,dress); p(4,9,dress); p(5,9,dress); p(6,9,dress); p(7,9,dress)
  // Dress detail
  p(3,7,dressDark); p(4,7,dressDark)

  // Arms / skin
  p(0,6,skin); p(7,6,skin)
  p(0,7,skin); p(7,7,skin)

  // Legs
  p(2,10,skin); p(3,10,skin); p(4,10,skin); p(5,10,skin)
  p(2,11,skin); p(3,11,skin); p(4,11,skin); p(5,11,skin)

  // Shoes (white)
  p(2,12,'#f0f0f0'); p(3,12,'#f0f0f0')
  p(4,12,'#f0f0f0'); p(5,12,'#f0f0f0')

  // Hair accessories (small star/clip)
  p(4,1,'#ffe066')
}

function drawLucas(ctx: CanvasRenderingContext2D, px: number, ox: number, oy: number) {
  const p = (x: number, y: number, color: string) => {
    ctx.fillStyle = color
    ctx.fillRect(ox + x * px, oy + y * px, px, px)
  }

  const hair = '#1a0a00'
  const skin = '#e8b89a'
  const outfit = '#7c3aed' // purple
  const outfitDark = '#5b21b6'
  const shoes = '#ffe066' // yellow shoes

  // Man bun / hair top
  p(3,0,hair); p(4,0,hair)
  p(2,1,hair); p(3,1,hair); p(4,1,hair); p(5,1,hair)
  // Bun shape
  p(3,0,hair); p(4,0,hair); p(5,0,hair)
  // Hair sides
  p(1,2,hair); p(6,2,hair)
  p(1,3,hair); p(6,3,hair)

  // Face
  p(2,2,skin); p(3,2,skin); p(4,2,skin); p(5,2,skin)
  p(2,3,skin); p(3,3,skin); p(4,3,skin); p(5,3,skin)
  p(2,4,skin); p(3,4,skin); p(4,4,skin); p(5,4,skin)

  // Eyes (brown)
  p(3,3,'#3d1a00'); p(4,3,'#3d1a00')

  // Mustache (distinctive!)
  p(3,4,'#2a0f00'); p(4,4,'#2a0f00')
  p(3,5,'#2a0f00'); // center mustache

  // Smile
  ctx.fillStyle = '#c06060'
  ctx.fillRect(ox + 3*px + 1, oy + 5*px + 3, px*2 - 2, 2)

  // Purple outfit / hoodie
  p(1,5,outfit); p(2,5,outfit); p(3,5,outfit); p(4,5,outfit); p(5,5,outfit); p(6,5,outfit)
  p(0,6,outfit); p(1,6,outfit); p(2,6,outfit); p(3,6,outfit); p(4,6,outfit); p(5,6,outfit); p(6,6,outfit); p(7,6,outfit)
  p(0,7,outfit); p(1,7,outfit); p(2,7,outfit); p(3,7,outfit); p(4,7,outfit); p(5,7,outfit); p(6,7,outfit); p(7,7,outfit)
  p(1,8,outfitDark); p(2,8,outfitDark); p(3,8,outfitDark); p(4,8,outfitDark); p(5,8,outfitDark); p(6,8,outfitDark)
  p(1,9,outfitDark); p(2,9,outfitDark); p(3,9,outfitDark); p(4,9,outfitDark); p(5,9,outfitDark); p(6,9,outfitDark)

  // Hoodie strings
  p(3,6,'#c97dff'); p(4,6,'#c97dff')

  // Legs
  p(2,10,outfitDark); p(3,10,outfitDark); p(4,10,outfitDark); p(5,10,outfitDark)
  p(2,11,outfitDark); p(3,11,outfitDark); p(4,11,outfitDark); p(5,11,outfitDark)

  // Yellow shoes
  p(2,12,shoes); p(3,12,shoes)
  p(4,12,shoes); p(5,12,shoes)
}

function drawCapybara(ctx: CanvasRenderingContext2D, px: number, ox: number, oy: number) {
  const p = (x: number, y: number, color: string) => {
    ctx.fillStyle = color
    ctx.fillRect(ox + x * px, oy + y * px, px, px)
  }

  const brown = '#8B5A2B'
  const brownDark = '#6B3A1B'
  const brownLight = '#A0724B'
  const nose = '#5a3520'

  // Body
  p(1,4,brown); p(2,4,brown); p(3,4,brown); p(4,4,brown); p(5,4,brown); p(6,4,brown)
  p(0,5,brown); p(1,5,brown); p(2,5,brown); p(3,5,brown); p(4,5,brown); p(5,5,brown); p(6,5,brown); p(7,5,brown)
  p(0,6,brown); p(1,6,brown); p(2,6,brown); p(3,6,brown); p(4,6,brown); p(5,6,brown); p(6,6,brown); p(7,6,brown)
  p(1,7,brownDark); p(2,7,brownDark); p(3,7,brownDark); p(4,7,brownDark); p(5,7,brownDark); p(6,7,brownDark)

  // Head
  p(1,1,brown); p(2,1,brown); p(3,1,brown); p(4,1,brown); p(5,1,brown); p(6,1,brown)
  p(1,2,brown); p(2,2,brown); p(3,2,brown); p(4,2,brown); p(5,2,brown); p(6,2,brown)
  p(1,3,brown); p(2,3,brown); p(3,3,brown); p(4,3,brown); p(5,3,brown); p(6,3,brown)

  // Big nose (rectangular capybara snout)
  p(2,3,nose); p(3,3,nose); p(4,3,nose); p(5,3,nose)
  p(2,2,brownLight); p(3,2,brownLight); p(4,2,brownLight); p(5,2,brownLight)

  // Kawaii eyes (big and cute)
  p(2,2,'#1a0a00'); p(5,2,'#1a0a00')
  // Eye shine
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(ox + 2*px, oy + 2*px, 2, 2)
  ctx.fillRect(ox + 5*px, oy + 2*px, 2, 2)

  // Ears
  p(1,0,brown); p(6,0,brown)
  p(1,1,brownDark); p(6,1,brownDark)

  // Legs
  p(1,8,brownDark); p(2,8,brownDark)
  p(5,8,brownDark); p(6,8,brownDark)

  // Small backpack (cute detail)
  p(7,4,'#c97dff'); p(7,5,'#c97dff'); p(7,6,'#a855f7')
  p(8,4,'#c97dff'); p(8,5,'#7c3aed'); p(8,6,'#c97dff')
}

export default function PixelChar({ char, size = 4, animate = true, style }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const W = 12 * size
    const H = 14 * size

    canvas.width = W
    canvas.height = H

    let raf: number
    let startTime = performance.now()

    const draw = (now: number) => {
      ctx.clearRect(0, 0, W, H)

      const t = (now - startTime) / 1000
      const offsetY = animate ? Math.round(Math.sin(t * 2.5) * size * 0.5) : 0

      if (char === 'ana') drawAna(ctx, size, 0, offsetY)
      else if (char === 'lucas') drawLucas(ctx, size, 0, offsetY)
      else drawCapybara(ctx, size, 0, offsetY)

      raf = requestAnimationFrame(draw)
    }

    raf = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(raf)
  }, [char, size, animate])

  const W = 12 * size
  const H = 14 * size + size

  return (
    <canvas
      ref={canvasRef}
      width={W}
      height={H}
      style={{ imageRendering: 'pixelated', ...style }}
    />
  )
}
