import Headers from '@/components/Headers/page';
import Footer from '@/components/Footer/page';
import Link from 'next/link';

const AdminCard = ({ href, title, description, icon }) => (
    <Link href={href}>
        <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-in-out cursor-pointer">
            <div className="flex items-center">
                <div className="text-blue-500">{icon}</div>
                <h3 className="text-xl font-bold text-gray-800 ml-4">{title}</h3>
            </div>
            <p className="text-gray-600 mt-2">{description}</p>
        </div>
    </Link>
);

export default function SuperUserDashboard() {
    return (
        <div className="min-h-screen flex flex-col bg-gray-100">
            <Headers />
            <main className="flex-grow container mx-auto px-4 py-12">
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-extrabold text-gray-900">Panel de Administración</h1>
                    <p className="text-xl text-gray-500 mt-2">Gestiona todos los aspectos de tu tienda desde aquí.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <AdminCard
                        href="/admin/clientes"
                        title="Gestión de Clientes"
                        description="Ver y editar la información de los clientes."
                        icon={
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        }
                    />
                    <AdminCard
                        href="/superUser/productos"
                        title="Gestión de Productos"
                        description="Añadir nuevos productos, actualizar precios y gestionar el stock."
                        icon={
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                        }
                    />
                    <AdminCard
                        href="/superUser/pedidos"
                        title="Gestión de Pedidos"
                        description="Revisar pedidos recientes, actualizar estados y gestionar devoluciones."
                        icon={
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 2h8a1 1 0 001-1zM1 9h15M1 13h15" />
                            </svg>
                        }
                    />
                </div>
            </main>
            <Footer />
        </div>
    );
}