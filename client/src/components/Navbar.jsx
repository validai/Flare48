import { useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const user = JSON.parse(localStorage.getItem("user"));

    return (
        <nav className="sticky top-0 z-50 py-6 bg-white border-b border-neutral-700/80 mb-8">
            <div className="container px-6 mx-auto relative text-sm">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/')}>
                        <span className="text-4xl font-bold tracking-tight">Flare48</span>
                    </div>

                    <div className="flex items-center space-x-8">
                        <ul className="flex space-x-8 text-xl font-semibold">
                            {user && (
                                <li className="text-black hover:text-primary-500 hover:scale-105">
                                    <button onClick={() => navigate('/saved-articles')}>
                                        Saved Articles
                                    </button>
                                </li>
                            )}
                        </ul>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;

