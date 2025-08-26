import { useState } from "react"
import RainingLetters from "@/components/RainingLetters"
import { useLocation } from "wouter"

export default function Welcome() {
  const [, setLocation] = useLocation()

  const handleEnter = () => {
    setLocation("/home")
  }

  return (
    <div className="w-full h-screen">
      <RainingLetters onEnter={handleEnter} />
    </div>
  )
}