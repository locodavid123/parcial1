"use client";

import Link from 'next/link';
import { useCart } from '../../context/CartContext';

export default function Headers() {
    const { itemCount } = useCart();

    return (
        <header className='flex items-center justify-between p-4'>
            <h1 className='text-2xl font-bold'>La casa de la chunchulla</h1>
            <nav className='flex items-center space-x-6'>
                <Link href="/login" className='hover:text-gray-500'>Inicio de Sesión</Link>
                <Link href="/cart" className='relative hover:text-yellow-400 transition-colors'>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    {itemCount > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                            {itemCount}
                        </span>
                    )}
                </Link>
            </nav>
        </header>
    );
}