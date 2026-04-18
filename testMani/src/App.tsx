import './App.css'
import { FooterTweakPanel } from './components/FooterTweakPanel'
import { LiquidTypeCanvas } from './components/footer/LiquidTypeCanvas'
import { ThemeToggle } from './components/ThemeToggle'

export default function App() {
  return (
    <>
      <LiquidTypeCanvas />
      <FooterTweakPanel />
      <ThemeToggle />
    </>
  )
}
