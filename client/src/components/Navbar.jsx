import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSignup, setIsSignup] = useState(false);
    const navigate = useNavigate();

    const toggleModal = (type) => {
        setIsSignup(type === 'signup');
        setIsModalOpen(!isModalOpen);
    };

    return (
        <>
            <nav className="sticky top-0 z-50 py-3 backdrop-blur-lg border-b border-neutral-700/80">
                <div className="container px-4 mx-auto relative text-sm">
                    <div className="flex items-center justify-center">
                        <div className="flex items-center mr-auto space-x-2" onClick={() => navigate('/')}>
                            <img className="h-10 w-10 mr-2 " src='https://static-00.iconduck.com/assets.00/placeholder-icon-2048x2048-48kucnce.png' />
                            <span className="text-2xl tracking-tight">Flare48</span>
                        </div>
                        <ul className='flex ml-14 text-xl space-x-12 '>
                            <li>
                                <button onClick={() => setIsSearchOpen(true)} className="text-neutral-900 hover:text-primary-500 hover:cursor-pointer hover:scale-120">
                                    Search
                                </button>
                            </li>
                            <li className="text-neutral-900 hover:text-primary-500 hover:scale-120">
                                <a href="#" className="text-neutral-900 hover:text-primary-500 hover:scale-120">Saved Articles</a>
                            </li>
                            
                        </ul>
                    </div>
                </div>
            </nav>           
        </>
    );
};

export default Navbar;
