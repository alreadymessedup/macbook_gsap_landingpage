import React from 'react'
import {navLinks} from "../constants";

const navbar = () => {
  return (
    <header>
        <nav>
            <img src="public/logo.png" alt="Logo" />
            <ul>
                    {navLinks.map(({ label }) => (
                        <li key={label}>
                            <a href={label}>{label}</a>
                        </li>
                    ))}
                </ul>


            <div className='flex-center gap-3'>
                <button>
                    <img src="public/search.png" alt="search" />
                </button>
                <button>
                    <img src="public/cart.svg" alt="cart" />
                </button>
            </div>
        </nav>
    </header>
  )
}

export default navbar