// Función para cargar y procesar el CSV
Papa.parse('data/data_fondos/brand.csv', {
    download: true,
    header: true,
    complete: function(results) {
        const data = results.data;

        // Arrays para almacenar la información
        let productoras = [];
        let gananciasTotales = [];
        let estrenos = [];
        let peliculasTaquilleras = [];
        let gananciasPelicula = [];

        // Procesar cada fila del CSV
        data.forEach(row => {
            productoras.push(row['Brand']);
            gananciasTotales.push(parseFloat(row['Total']));
            estrenos.push(parseInt(row['Releases']));
            peliculasTaquilleras.push(row['#1 Release']);
            gananciasPelicula.push(parseFloat(row['Lifetime Gross']));
        });

        // Combinar los datos en un solo arreglo para facilitar el manejo
        const datosCombinados = productoras.map((prod, i) => ({
            productora: prod,
            gananciasTotales: gananciasTotales[i],
            estrenos: estrenos[i],
            peliculaTaquillera: peliculasTaquilleras[i],
            gananciasPelicula: gananciasPelicula[i]
        }));

        // Ordenar por ganancias totales en orden descendente y seleccionar el top 10
        const top10 = datosCombinados.sort((a, b) => b.gananciasTotales - a.gananciasTotales).slice(0, 10);

        // Extraer los datos del top 10 para el gráfico
        const topProductoras = top10.map(item => item.productora);
        const topGananciasTotales = top10.map(item => item.gananciasTotales);
        const topEstrenos = top10.map(item => item.estrenos);
        const topPeliculasTaquilleras = top10.map(item => item.peliculaTaquillera);
        const topGananciasPelicula = top10.map(item => item.gananciasPelicula);

        // Llamar a la función para crear el gráfico con los datos procesados del top 10
        crearGraficoBurbujas(topProductoras, topGananciasTotales, topEstrenos, topPeliculasTaquilleras, topGananciasPelicula);
    }
});

function crearGraficoBurbujas(productoras, gananciasTotales, estrenos, peliculasTaquilleras, gananciasPelicula) {
    const data = [{
        x: estrenos, // Eje X: Número de estrenos
        y: gananciasPelicula.map(val => val / 1e6), // Eje Y: Ganancias de la película más taquillera (en millones)
        mode: 'markers', // Solo burbujas
        marker: {
            size: gananciasTotales.map(val => val / 1e9 * 10),
            color: estrenos,
            colorscale: 'Viridis',
            showscale: true // Mostrar la barra de colores para los estrenos
        },
        hoverinfo: 'skip', // Desactivar hover
        showlegend: false // Ocultar leyenda
    }];

    // Anotaciones para los nombres y las ganancias
    const annotations = productoras.map((prod, i) => ({
        x: estrenos[i],
        y: gananciasPelicula[i] / 1e6,
        text: `${prod}<br>$${(gananciasTotales[i] / 1e9).toFixed(2)}B`,
        xanchor: 'left',
        yanchor: 'middle',
        showarrow: true, // Añadir una flecha que conecte el texto con la burbuja
        arrowhead: 2,
        ax: 20, // Ajustar posición del texto (horizontal)
        ay: -30, // Ajustar posición del texto (vertical)
        font: {
            size: 12, // Tamaño más pequeño para evitar solapamiento
            color: 'black'
        }
    }));

    const layout = {
        title: 'Top 10 Productoras: Estrenos vs. Ganancias',
        xaxis: {
            title: 'Número de Estrenos',
            showgrid: true, // Mostrar la cuadrícula en el eje X
            gridcolor: 'rgba(200, 200, 200, 0.5)', // Color suave para la cuadrícula del eje X
            zeroline: false
        },
        yaxis: {
            title: 'Ganancias de la Película más Taquillera (Millones)',
            showgrid: true, // Mostrar la cuadrícula en el eje Y
            gridcolor: 'rgba(200, 200, 200, 0.5)', // Color suave para la cuadrícula del eje Y
            zeroline: false
        },
        margin: {
            l: 100, // Márgenes para evitar solapamientos
            r: 20,
            t: 50,
            b: 100
        },
        annotations: annotations, // Añadir anotaciones al gráfico
        showlegend: false, // Ocultar leyenda
        staticPlot: true // Gráfico estático
    };

    const config = {
        responsive: true, // Hacer el gráfico responsivo
        displayModeBar: false, // Eliminar el menú de herramientas por completo
        staticPlot: true // Asegurar que el gráfico sea completamente estático
    };

    Plotly.newPlot('bubbleChart', data, layout, config);
}
