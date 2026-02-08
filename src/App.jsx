import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import "../src/index.css"


export default function App() {
  return (
    <div className="min-h-screen grid place-items-center bg-rose-50">
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">NomNom 🍓</h1>
        <p className="mt-2 text-sm text-gray-600">Tailwind is working.</p>
        <button className="mt-4 rounded-xl bg-black px-4 py-2 text-sm text-white">
          Add Recipe
        </button>
      </div>
    </div>
  );
}
