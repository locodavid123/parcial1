import Headers from '@/components/Headers/page';
import Footer from '@/components/Footer/page';
import pool from '@/app/config/db'; // Ruta corregida a la conexión de la BD

async function getTotalVentas() {
    try {
        // Consulta para sumar el total de los pedidos con status 'Completado'
        // NOTA: PostgreSQL devuelve los nombres de las columnas en minúsculas por defecto.
        const result = await pool.query(
            "SELECT SUM(total) as total_ventas FROM pedidos WHERE status = 'Completado'"
        );

        // La librería 'pg' para PostgreSQL devuelve los resultados en la propiedad 'rows'.
        // Si no hay ventas completadas, SUM(total) puede ser NULL.
        // El alias 'total_ventas' se convierte a 'total_ventas' en el objeto de resultado.
        const total = result.rows[0].total_ventas || 0;
        
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