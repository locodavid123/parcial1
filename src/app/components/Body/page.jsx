export default function Body() {
    const products = [
        {
            id: 1,
            name: 'Chunchulla Frita Crocante',
            description: 'Nuestra especialidad. Crujiente por fuera, tierna por dentro. Servida con limón y ají casero.',
            price: '$15.000',
            imageUrl: 'https://donjediondo.com/wp-content/uploads/2024/10/6.-Chunchullo-Papa-Criolla.png',
        },
        {
            id: 2,
            name: 'Chunchulla a la Parrilla',
            description: 'Asada a la perfección en nuestra parrilla, con un toque ahumado inigualable. Acompañada de papa criolla.',
            price: '$18.000',
            imageUrl: 'https://www.infobae.com/new-resizer/2MmG5ZeqZDQNY9yw3dWaPc-1u-Y=/arc-anglerfish-arc2-prod-infobae/public/JCRSL37AIBBPHMQMIS2UDEXTU4.jpg',
        },
        {
            id: 3,
            name: 'Picada "El Chuncho Mayor"',
            description: 'Una generosa porción de chunchulla, chorizo, morcilla, papa y arepa. Ideal para compartir.',
            price: '$35.000',
            imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT3pajraXNoKiwFyxroHhnOCLViids1ZBhXxw&shttps://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT3pajraXNoKiwFyxroHhnOCLViids1ZBhXxw&s',
        },
        {
            id: 4,
            name: 'Empanadas de Chunchulla',
            description: 'Deliciosas empanadas rellenas de un guiso único de chunchulla. (Orden de 5 unidades).',
            price: '$12.000',
            imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTZjmK436o4dTRzgZ5yJbBpfr3QA6OTJ6gcrg&s',
        },
        {
            id: 5,
            name: 'Sopa de Chunchulla',
            description: 'Una sopa tradicional y reconfortante, con trozos de chunchulla, papa y especias de la casa.',
            price: '$16.000',
            imageUrl: 'https://i0.wp.com/www.ranchomateo.com/north-bergen/wp-content/uploads/sites/7/2024/10/Blood-sausage.-4-1.jpg?fit=1400%2C800&ssl=1',
        },
    ];

    return (
        <main className="bg-gray-50 py-12">
            <div className="container mx-auto px-4">
                <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Nuestros Productos Estrella</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {products.map((product) => (
                        <div key={product.id} className="bg-white rounded-lg shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300">
                            <img src={product.imageUrl} alt={product.name} className="w-full h-56 object-cover" />
                            <div className="p-6">
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">{product.name}</h3>
                                <p className="text-gray-600 mb-4">{product.description}</p>
                                <div className="flex items-center justify-between">
                                    <span className="text-2xl font-bold text-gray-900">{product.price}</span>
                                    <button className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-full transition-colors duration-300">
                                        Agregar
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
}