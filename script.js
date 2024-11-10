document.addEventListener("DOMContentLoaded", function() {
    Promise.all([
        d3.csv("brand.csv"),
        d3.csv("peliculas_mayor_recaudacion.csv")
    ]).then(function([brands, movies]) {
        const processedData = {};
        movies.forEach(movie => {
            const brand = movie.Productora;
            const year = parseInt(movie['Año de estreno']);
            const revenue = parseFloat(movie['Recaudacion mundial (Millones) (USD)']);
            const director = movie.Director || 'Desconocido';

            if (brand && year && revenue) {
                if (!processedData[brand]) {
                    processedData[brand] = { years: [], revenues: [], titles: [], directors: [] };
                }
                processedData[brand].years.push(year);
                processedData[brand].revenues.push(revenue);
                processedData[brand].titles.push(movie.Película);
                processedData[brand].directors.push(director);
            }
        });

        const brandNames = Object.keys(processedData).sort();

        const brandSelect = document.getElementById('brand-select');
        brandNames.forEach(brand => {
            const option = document.createElement('option');
            option.value = brand;
            option.textContent = brand;
            brandSelect.appendChild(option);
        });

        const colorScale = d3.scaleOrdinal()
            .domain(brandNames)
            .range(brandNames.map((d, i) => d3.interpolateRainbow(i / brandNames.length)));

        let selectedBrand = 'all';
        let traces = createTraces(processedData, colorScale, selectedBrand);

        const allYears = movies.map(movie => parseInt(movie['Año de estreno']));
        const minYear = Math.min(...allYears);
        const maxYear = Math.max(...allYears);
        const years = Array.from(new Set(allYears)).sort((a, b) => a - b);

        const layout = {
            xaxis: {
                title: { text: "Año de estreno", font: { color: "#ffd700", size: 18 } },
                gridcolor: "#444",
                color: "#e0e0e0",
                zerolinecolor: "#444",
                range: [minYear - 1, maxYear + 1]
            },
            yaxis: {
                title: { text: "Recaudación mundial (Millones USD)", font: { color: "#ffd700", size: 18 } },
                type: "log",
                gridcolor: "#444",
                color: "#e0e0e0",
                zerolinecolor: "#444",
                range: [1, 3.7],
                tickvals: [1, 2, 3],
                ticktext: ['10M', '100M', '1000M']
            },
            legend: {
                orientation: "h", 
                font: { color: "#ffd700", size: 12 },
                x: 0.5, 
                y: -0.2, 
                xanchor: "center",
                yanchor: "top",
                bgcolor: "#2d2d2d",
                bordercolor: "#ffd700",
                borderwidth: 2,
                traceorder: "normal"
            },
            paper_bgcolor: "#2d2d2d",
            plot_bgcolor: "#1a1a1a",
            width: 1600,
            height: 680,
            autosize: false,
            margin: {
                l: 70,
                r: 70,
                t: 20,
                b: 150 
            },
            hoverlabel: {
                font: {
                    color: "#e0e0e0"
                },
                bgcolor: "#2d2d2d",
                bordercolor: "#ffd700"
            }
        };
        

        const config = { responsive: false };

        Plotly.newPlot("plot", [], layout, config);

        let animationInProgress = false;

        document.getElementById('play-button').addEventListener('click', function() {
            if (animationInProgress) return;
            animationInProgress = true;
            Plotly.purge('plot');
            Plotly.newPlot("plot", [], layout, config).then(function() {
                animateFrames(traces);
            });
        });

        brandSelect.addEventListener('change', function() {
            selectedBrand = this.value;
            traces = createTraces(processedData, colorScale, selectedBrand);
            animationInProgress = false;
            Plotly.purge('plot');
            Plotly.newPlot("plot", [], layout, config);
        });

        function createTraces(dataObj, colorScale, selectedBrand) {
            const brandsToPlot = selectedBrand === 'all' ? Object.keys(dataObj).sort() : [selectedBrand];
            return brandsToPlot.map((brand) => {
                const data = dataObj[brand];
                return {
                    x: data.years,
                    y: data.revenues,
                    mode: "markers",
                    name: brand,
                    text: data.titles.map((title, i) => {
                        return `<b>${title}</b><br>Año: ${data.years[i]}<br>Recaudación: ${data.revenues[i]} millones USD<br>Director: ${data.directors[i]}`;
                    }),
                    hovertemplate: '%{text}<extra></extra>',
                    marker: {
                        size: data.revenues.map(revenue => revenue / 7),
                        sizemode: "area",
                        sizeref: 0.5,
                        color: colorScale(brand)
                    }
                };
            });
        }

        function animateFrames(fullTraces) {
            const years = Array.from(new Set(fullTraces.flatMap(trace => trace.x))).sort((a, b) => a - b);
            let currentYearIndex = 0;
            let totalBubbles = 0;

            const originalSizes = fullTraces.map(trace => [...trace.marker.size]);

            const initialTraces = fullTraces.map(trace => ({
                ...trace,
                x: [],
                y: [],
                marker: { ...trace.marker, size: [] },
                text: []
            }));
            Plotly.addTraces('plot', initialTraces);

            function animateNextFrame() {
                if (currentYearIndex >= years.length) {
                    animationInProgress = false;
                    return;
                }

                const year = years[currentYearIndex];

                fullTraces.forEach((trace, traceIndex) => {
                    const indices = [];
                    trace.x.forEach((xValue, i) => {
                        if (xValue === year) {
                            indices.push(i);
                        }
                    });

                    if (indices.length > 0) {
                        const newX = indices.map(i => trace.x[i]);
                        const newY = indices.map(i => trace.y[i]);
                        const newSize = indices.map(i => trace.marker.size[i]);
                        const newText = indices.map(i => trace.text[i]);

                        totalBubbles += newX.length;

                        const scaleFactor = Math.max(1, 50 / totalBubbles);

                        const updatedSizes = originalSizes[traceIndex].slice(0, totalBubbles).map(size => size * scaleFactor);

                        Plotly.restyle('plot', {
                            'marker.size': [updatedSizes]
                        }, [traceIndex]);

                        Plotly.extendTraces('plot', {
                            x: [newX],
                            y: [newY],
                            text: [newText]
                        }, [traceIndex]);

                        indices.forEach((_, i) => {
                            const frequency = 200 + (newSize[i] * 10);
                            playTone(frequency, 500);
                        });
                    }
                });

                currentYearIndex++;
                setTimeout(animateNextFrame, 30);
            }

            animateNextFrame();
        }

        function playTone(frequency, duration) {
            if (typeof AudioContext !== "undefined" || typeof webkitAudioContext !== "undefined") {
                const context = new (window.AudioContext || window.webkitAudioContext)();
                const oscillator = context.createOscillator();
                const gainNode = context.createGain();

                oscillator.type = "sine";
                oscillator.frequency.value = frequency;

                oscillator.connect(gainNode);
                gainNode.connect(context.destination);

                oscillator.start();

                gainNode.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + duration / 1000);

                setTimeout(() => {
                    oscillator.stop();
                    context.close();
                }, duration);
            }
        }

    });
});
