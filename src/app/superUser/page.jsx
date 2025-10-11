import Headers from '@/components/Headers/page';
import Footer from '@/components/Footer/page';
import Link from 'next/link';

export default function Home() {
    return (
        <main>
            <Headers />
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-4xl font-bold text-center text-gray-800 mb-6">
                    Panel de Superusuario
                </h1>
                <p className="text-lg text-center text-gray-600 mb-12">
                    Bienvenido. Desde aquí puedes gestionar todos los aspectos del sistema.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Gestión de Usuarios */}
                    <Link href="/superUser/gestion" className="block">
                        <div className="bg-white p-6 rounded-lg shadow-md h-full transition-transform transform hover:scale-105 hover:shadow-xl cursor-pointer">
                            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Gestión de Usuarios</h2>
                            <p className="text-gray-600">Crear, editar y eliminar usuarios, y gestionar qué rol desempeñan (SUPERUSER, empleado, cliente).</p>
                        </div>
                    </Link>
                    {/* Reportes de Ventas */}
                    <Link href="/superUser/reportes" className="block">
                        <div className="bg-white p-6 rounded-lg shadow-md h-full transition-transform transform hover:scale-105 hover:shadow-xl cursor-pointer">
                            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Reportes de Ventas</h2>
                            <p className="text-gray-600">Visualizar reportes de ventas y estadísticas.</p>
                        </div>
                    </Link>
                    <Link href="/superUser/productos" className="block">
                        <div className="bg-white p-6 rounded-lg shadow-md h-full transition-transform transform hover:scale-105 hover:shadow-xl cursor-pointer">
                            <h2 className="text-2xl font-semibold mb-4 text-gray-800">productos</h2>
                            <p className="text-gray-600">Agregar editar y eliminar productos</p>
                        </div>
                    </Link>
                    {/* Configuración General */}
                    <Link href="/superUser/clientes" className="block">
                        <div className="bg-white p-6 rounded-lg shadow-md h-full transition-transform transform hover:scale-105 hover:shadow-xl cursor-pointer">
                            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Clientes</h2>
                            <p className="text-gray-600">visualizacion de clientes con los datos de contacto</p>
                        </div>
                    </Link>
                    {/* Modificación de Pedidos */}
                    <Link href="/superUser/orders" className="block">
                        <div className="bg-white p-6 rounded-lg shadow-md h-full transition-transform transform hover:scale-105 hover:shadow-xl cursor-pointer">
                            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Modificación de Pedidos</h2>
                            <p className="text-gray-600">Consultar y modificar el estado de los pedidos.</p>
                        </div>
                    </Link>
                </div>
            </div>
            <Footer />
        </main>
    );
}