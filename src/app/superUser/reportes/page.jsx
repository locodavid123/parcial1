import Headers from '@/components/Headers/page';
import Footer from '@/components/Footer/page';
import getDb from '@/app/config/mongo';

async function getTotalVentas() {
    try {
        // Sumar el total de los pedidos con status 'Completado' en MongoDB
        const db = await getDb();
        const res = await db.collection('pedidos').aggregate([
            { $match: { status: 'Completado' } },
            { $group: { _id: null, total_ventas: { $sum: '$total' } } }
        ]).toArray();
        const total = (res[0] && res[0].total_ventas) ? res[0].total_ventas : 0;
        
        return total;
    } catch (error) {
        console.error("Error al obtener el total de ventas:", error);
        // En caso de error, podrías retornar un mensaje o un valor que indique el fallo.
        return 'Error al cargar los datos';
    }
}

export default async function ReportesPage() {
    const totalVentas = await getTotalVentas();

    // Formatear el número como moneda (ej. Dólares estadounidenses)
    // Puedes ajustar 'en-US' y 'USD' según tu localidad y moneda.
    const formatoMoneda = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    });

    return (
        <main>
            <Headers />
            <div className="container mx-auto px-4 py-8 min-h-screen">
                <h1 className="text-4xl font-bold text-center text-gray-800 mb-6">
                    Reporte de Ventas
                </h1>
                <p className="text-lg text-center text-gray-600 mb-12">
                    Aquí se muestra el resumen total de las ventas completadas.
                </p>

                <div className="flex justify-center">
                    <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md text-center">
                        <h2 className="text-2xl font-semibold text-gray-700 mb-4">
                            Ventas Totales (Completadas)
                        </h2>
                        {typeof totalVentas === 'number' ? (
                            <p className="text-5xl font-bold text-green-600">
                                {formatoMoneda.format(totalVentas)}
                            </p>
                        ) : (
                            <p className="text-2xl font-bold text-red-500">
                                {totalVentas}
                            </p>
                        )}
                    </div>
                </div>
            </div>
            <Footer />
        </main>
    );
}