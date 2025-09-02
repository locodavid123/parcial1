import Image from 'next/image';
import Link from 'next/link';


export default function Headers() {
    return (
        // Es una buena práctica usar el elemento <header> para el encabezado principal de la página.
        <header className='flex items-center justify-between p-4'>
            <h1 className='text-2xl font-bold'>La casa de la chunchulla</h1>
            <nav className='flex items-center space-x-6'>
                <Link href="#" className='hover:text-gray-500'>Menú</Link>
                <Link href="/components/login" className='hover:text-gray-500'>Inicio de Sesión</Link>
            </nav>
        </header>
    );
}