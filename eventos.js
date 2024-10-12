Papa.parse('data/data_fondos/brand.csv', {
    download: true,
    header: true,
    complete: function(results) {
        console.log(results);
        const data = results.data;

        let gananciasProductora = {};

        data.forEach((row) => {
            const productora = row['Brand']; // Asegúrate de que el nombre de la columna sea correcto
            const ganancias = parseFloat(row['Total']); // Asegúrate de que la columna 'Total' contiene números

            // Sumar las ganancias para cada productora
            if (gananciasProductora[productora]) {
                gananciasProductora[productora] += ganancias;
            } else {
                gananciasProductora[productora] = ganancias;
            }
        });

        // Obtener el top 10 de productoras con mayores ganancias
        const topProductoras = Object.entries(gananciasProductora).sort((a, b) => b[1] - a[1]).slice(0, 10);
        
        // Extraer los nombres y las ganancias de las productoras
        const productoras = topProductoras.map((entry) => entry[0]);
        const ganancias = topProductoras.map((entry) => entry[1]);

        // Crear el gráfico con Plotly
        crearGrafico(productoras, ganancias);
    }
});

function crearGrafico(productoras, ganancias) {
    // Encontrar los índices de la mayor y menor ganancia
    const maxGanancia = Math.max(...ganancias);
    const minGanancia = Math.min(...ganancias);
    const maxIndex = ganancias.indexOf(maxGanancia);
    const minIndex = ganancias.indexOf(minGanancia);

    const data = [{
        x: ganancias, // Colocamos las ganancias en el eje X
        y: productoras, // Colocamos las productoras en el eje Y
        type: 'bar',
        orientation: 'h', // 'h' para barras horizontales
        marker: {
            color: '#32746D', // Usamos un solo color para todas las barras (azul oscuro)
            line: {
                color: '#104F55',
                width: 1.5
            }
        },
        text: ganancias.map((val, i) => {
            if (i === maxIndex || i === minIndex) {
                return '$' + val.toLocaleString(); // Mostrar solo en la barra con mayor y menor ganancia
            } else {
                return ''; // No mostrar texto en otras barras
            }
        }),
        textposition: 'inside', // Posicionamos el texto dentro de las barras
        textfont: {
            color: 'white', // Color del texto
            size: 14 // Tamaño del texto
        },
        hoverinfo: 'skip' // Esto desactiva el hover para este dataset
    }];

    const layout = {
        xaxis: {
            title: 'Ganancias Totales (USD)', // Título para el eje X
            showgrid: true, // Mostrar la cuadrícula en el eje X
            gridcolor: 'lightgray', // Color de la cuadrícula (gris claro)
            gridwidth: 2, // Grosor de la línea de la cuadrícula
            griddash: 'dot', // Estilo de línea punteada
            zeroline: false, // Quitar la línea en cero
            showticklabels: true, // Mostrar etiquetas de ganancias
            automargin: true // Ajuste automático de márgenes
        },
        yaxis: {
            automargin: true,
            categoryorder: 'total ascending', // Ordenar de mayor a menor
            showgrid: false, // Quitar las líneas de cuadrícula en Y
            zeroline: false, // Quitar la línea en cero
            showticklabels: true // Mostrar etiquetas de las productoras
        },
        margin: {
            l: 150, // Aumentar el margen izquierdo para etiquetas largas
            r: 20,
            t: 40, // Ajustar el margen superior para el título
            b: 80
        },
        showlegend: false // Ocultar leyenda
    };

    // Configuración adicional para hacerlo responsivo y estático
    const config = {
        responsive: true, // Hacer el gráfico responsivo
        staticPlot: true // Esto desactiva todas las interacciones
    };

    Plotly.newPlot('barChart', data, layout, config); // Añadimos 'config' para hacerlo completamente estático y responsivo
}
