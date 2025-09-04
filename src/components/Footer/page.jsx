import Link from 'next/link';

// En un proyecto real, usarías una librería como `react-icons`
// Por ejemplo: import { FaFacebook, FaTwitter, FaInstagram } from 'react-icons/fa';
const FacebookIcon = () => <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" /></svg>;
const TwitterIcon = () => <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.71v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" /></svg>;
const InstagramIcon = () => <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.024.06 1.378.06 3.808s-.012 2.784-.06 3.808c-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.024.048-1.378.06-3.808.06s-2.784-.013-3.808-.06c-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.048-1.024-.06-1.378-.06-3.808s.012-2.784.06-3.808c.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 016.08 2.465c.636-.247 1.363-.416 2.427-.465C9.53 2.013 9.884 2 12.315 2zm-1.161 1.043c-1.061.048-1.695.212-2.28.453a3.374 3.374 0 00-1.217.86a3.374 3.374 0 00-.86 1.217c-.241.585-.405 1.219-.453 2.28c-.054 1.022-.057 1.351-.057 3.649s.003 2.627.057 3.649c.048 1.061.212 1.695.453 2.28a3.374 3.374 0 00.86 1.217 3.374 3.374 0 001.217.86c.585.241 1.219.405 2.28.453 1.022.054 1.351.057 3.649.057s2.627-.003 3.649-.057c1.061-.048 1.695-.212 2.28-.453a3.374 3.374 0 001.217-.86 3.374 3.374 0 00.86-1.217c.241-.585.405-1.219.453-2.28c.054-1.022.057-1.351.057-3.649s-.003-2.627-.057-3.649c-.048-1.061-.212-1.695-.453-2.28a3.374 3.374 0 00-.86-1.217 3.374 3.374 0 00-1.217-.86c-.585-.241-1.219-.405-2.28-.453C15.002 3.046 14.673 3.043 12.315 3.043s-2.627.003-3.649.057zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.5a3.635 3.635 0 100 7.27 3.635 3.635 0 000-7.27z" clipRule="evenodd" /></svg>;

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
    <footer className="bg-gradient-to-r from-black via-yellow-900 to-red-900 text-white pt-12 pb-8 mt-16 shadow-inner">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 text-center md:text-left">
                    {/* Navegación */}
                    <div>
                        <h3 className="font-bold text-lg mb-4">Navegación</h3>
                        <ul className="space-y-2">
                            <li><Link href="#" className="hover:text-yellow-400 transition-colors font-semibold">Menú</Link></li>
                            <li><Link href="#" className="hover:text-yellow-400 transition-colors font-semibold">Sobre Nosotros</Link></li>
                            <li><Link href="#" className="hover:text-yellow-400 transition-colors font-semibold">Contacto</Link></li>
                        </ul>
                    </div>

                    {/* Contacto */}
                    <div>
                        <h3 className="font-bold text-lg mb-4">Contacto</h3>
                        <p className="mb-2">Dirección: Calle 27 40-10, villavicencio</p>
                        <p className="mb-2">Teléfono: (57) 300 123 4567</p>
                        <p>Email: contacto@casachunchulla.com</p>
                    </div>

                    {/* Redes Sociales */}
                    <div>
                        <h3 className="font-bold text-lg mb-4">Síguenos</h3>
                        <div className="flex justify-center md:justify-start space-x-6">
                            <a href="#" aria-label="Facebook" className="hover:text-yellow-400 transition-transform transform hover:scale-125"><FacebookIcon /></a>
                            <a href="#" aria-label="Twitter" className="hover:text-yellow-400 transition-transform transform hover:scale-125"><TwitterIcon /></a>
                            <a href="#" aria-label="Instagram" className="hover:text-yellow-400 transition-transform transform hover:scale-125"><InstagramIcon /></a>
                        </div>
                    </div>
                </div>

                <div className="border-t border-yellow-700 pt-6 text-center text-yellow-200 text-sm">
                    <p>&copy; {currentYear} La Casa de la Chunchulla. Todos los derechos reservados.</p>
                </div>
            </div>
        </footer>
    );
}