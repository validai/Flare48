import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';

const Navbar = () => {
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const navigate = useNavigate();

    return (
        <nav className="sticky top-0 z-50 py-3 bg-white border-b border-neutral-700/80">
            <div className="container px-4 mx-auto relative m-3 text-sm">
                <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/')}>
                    <span className="text-4xl font-bold tracking-tight">Flare48</span>
                </div>

                <div className="hidden md:flex flex-grow justify-center">
                    <div className={`transition-all duration-300 w-1/2 ${isSearchOpen ? 'block' : 'hidden'}`}>
                        <input
                            type="text"
                            placeholder="Search..."
                            className="w-full p-2 bg-white border-2 border-black rounded-lg focus:outline-none"
                        />
                    </div>
                </div>

                <div 
                    onClick={() => setIsSearchOpen(!isSearchOpen)}
                    className="md:hidden cursor-pointer text-xl text-neutral-900 hover:text-primary-500"
                >
                    <Search />
                </div>

                <ul className="flex space-x-12">
                    {/* 🏠 New Home Button */}
                    <li className="text-neutral-900 hover:text-primary-500 hover:scale-105">
                        <button onClick={() => navigate('/Home')}>
                            Home
                        </button>
                    </li>

                    {/* Saved Articles */}
                    <li className="text-neutral-900 hover:text-primary-500 hover:scale-105">
                        <button onClick={() => navigate('/saved-articles')}>
                            Saved Articles
                        </button>
                    </li>
                </ul>
            </div>
        </nav>
    );
};

export default Navbar;

