import React from 'react'

const navbar = () => {
  return (
    <nav className="sticky top-0 z-50 py-3 backdrop-blur-lg border-b border-neutral-700/80">
        <div className="container px-4 mx-auto relative text-sm">
            <div className="flex items-center justify-center">
                <div className="flex items-center flex-shrink-0">
                    <img className="h-10 w-10 mr-2" src='https://static-00.iconduck.com/assets.00/placeholder-icon-2048x2048-48kucnce.png' />
                    <span className="text-xl tracking-tight">Flare48</span>
                </div>
                <ul className='hidden lg:flex ml-14 space-x-12'>
                    
                </ul>
            </div>
        </div>

    </nav>
  )
}

export default navbar
