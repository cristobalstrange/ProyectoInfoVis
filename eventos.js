Papa.parse('data/data_fondos/brand.csv', {
    download: true,
    header: true,
    complete: function(results) {
        console.log(results);
        const data = results.data;

        let gananciasProductora = {};

        data.forEach((row) => {
            const productora = row['Brand'];
            const ganancias = parseFloat(row['Total']);

            if (gananciasProductora[productora]) {
                gananciasProductora[productora] += ganancias;
            } else {
                gananciasProductora[productora] = ganancias;
            }
        });

        const topProductoras = Object.entries(gananciasProductora).sort((a, b) => b[1] - a[1]).slice(0, 10);
        
        const productoras = topProductoras.map((entry) => entry[0]);
        const ganancias = topProductoras.map((entry) => entry[1]);

        crearGrafico(productoras, ganancias);
    }
});

function crearGrafico(productoras, ganancias) {
    const maxGanancia = Math.max(...ganancias);
    const minGanancia = Math.min(...ganancias);
    const maxIndex = ganancias.indexOf(maxGanancia);
    const minIndex = ganancias.indexOf(minGanancia);

    const data = [{
        x: ganancias, 
        y: productoras,
        type: 'bar',
        orientation: 'h', 
        marker: {
            color: '#32746D',
            line: {
                color: '#104F55',
                width: 1.5
            }
        },
        text: ganancias.map((val, i) => {
            if (i === maxIndex || i === minIndex) {
                return '$' + val.toLocaleString(); 
            } else {
                return ''; 
            }
        }),
        textposition: 'inside',
        textfont: {
            color: 'white', 
            size: 14 
        },
        hoverinfo: 'skip' 
    }];

    const layout = {
        xaxis: {
            title: 'Ganancias Totales (USD)', 
            showgrid: true,
            gridcolor: 'lightgray',
            gridwidth: 2, 
            griddash: 'dot', 
            zeroline: false, 
            showticklabels: true,
            automargin: true 
        },
        yaxis: {
            automargin: true,
            categoryorder: 'total ascending', 
            showgrid: false,
            zeroline: false,
            showticklabels: true
        },
        margin: {
            l: 150,
            r: 20,
            t: 40,
            b: 80
        },
        showlegend: false 
    };

    // Configuración adicional para hacerlo responsivo y estático
    const config = {
        responsive: true, // Hacer el gráfico responsivo
        staticPlot: true // Esto desactiva todas las interacciones
    };

    Plotly.newPlot('barChart', data, layout, config);
