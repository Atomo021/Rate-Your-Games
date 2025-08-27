document.addEventListener('DOMContentLoaded', () => {
    const totalGamesStat = document.getElementById('total-games-stat');
    const avgScoreStat = document.getElementById('avg-score-stat');
    const scoreDistributionGraph = document.getElementById('score-distribution-graph');
    const messageBox = document.getElementById('message-box');

    // Función para mostrar un mensaje de feedback
    function showMessage(message, type = 'success') {
        if (messageBox) {
            messageBox.textContent = message;
            messageBox.className = `message-box ${type}`;
            messageBox.style.display = 'block';
            setTimeout(() => {
                messageBox.style.display = 'none';
            }, 3000);
        }
    }

    // Función para obtener la clase de color de la barra basada en el rango
    function getScoreBarClass(rangeStart) {
        if (rangeStart >= 90) return 'high-score-bar';
        if (rangeStart >= 75) return 'midhigh-score-bar';
        if (rangeStart >= 60) return 'mid-score-bar';
        if (rangeStart >= 40) return 'midlow-score-bar';
        return 'low-score-bar';
    }

    // Función para cargar los datos y calcular las estadísticas
    function loadAndRenderStats() {
        const games = JSON.parse(localStorage.getItem('games')) || [];

        if (games.length === 0) {
            if (totalGamesStat) totalGamesStat.textContent = 'Total de juegos: 0';
            if (avgScoreStat) avgScoreStat.textContent = 'Puntuación media: 0';
            if (scoreDistributionGraph) scoreDistributionGraph.innerHTML = '<p style="text-align: center; color: #aaa;">Añade juegos para ver las estadísticas.</p>';
            return;
        }

        // 1. Calcular el total de juegos
        const totalGames = games.length;
        if (totalGamesStat) totalGamesStat.textContent = `Total de juegos: ${totalGames}`;

        // 2. Calcular la puntuación media
        const totalScore = games.reduce((sum, game) => sum + game.score, 0);
        const avgScore = (totalScore / totalGames).toFixed(2);
        if (avgScoreStat) avgScoreStat.textContent = `Puntuación media: ${avgScore}`;

        // 3. Calcular la distribución de puntuaciones por rangos de 10
        const scoreCounts = {};
        for (let i = 10; i <= 90; i += 10) {
            const range = `${i}-${i + 9}`;
            scoreCounts[range] = 0;
        }
        scoreCounts['100'] = 0; // Para la puntuación perfecta

        games.forEach(game => {
            const score = game.score;
            if (score === 100) {
                scoreCounts['100']++;
            } else if (score >= 10 && score < 100) {
                const rangeStart = Math.floor(score / 10) * 10;
                const range = `${rangeStart}-${rangeStart + 9}`;
                if (scoreCounts[range] !== undefined) {
                    scoreCounts[range]++;
                }
            }
        });

        // 4. Renderizar el gráfico de barras
        if (scoreDistributionGraph) {
            scoreDistributionGraph.innerHTML = ''; // Limpia el contenedor
            
            // Renderiza los rangos de 10 en 10
            for (let i = 10; i <= 90; i += 10) {
                const range = `${i}-${i + 9}`;
                const count = scoreCounts[range];
                const percentage = (count / totalGames) * 100;
                const scoreClass = getScoreBarClass(i);

                const barContainer = document.createElement('div');
                barContainer.className = 'score-bar-container';

                const label = document.createElement('span');
                label.className = 'score-label';
                label.textContent = `${range}:`;

                const bar = document.createElement('div');
                bar.className = `score-bar ${scoreClass}`;
                bar.style.width = `${percentage}%`;

                const value = document.createElement('span');
                value.className = 'score-value';
                value.textContent = ` (${count})`;

                barContainer.appendChild(label);
                barContainer.appendChild(bar);
                barContainer.appendChild(value);
                scoreDistributionGraph.appendChild(barContainer);
            }

            // Renderiza el caso de puntuación 100 por separado
            const count100 = scoreCounts['100'];
            const percentage100 = (count100 / totalGames) * 100;
            const barContainer100 = document.createElement('div');
            barContainer100.className = 'score-bar-container';
            const label100 = document.createElement('span');
            label100.className = 'score-label';
            label100.textContent = `100:`;
            const bar100 = document.createElement('div');
            bar100.className = 'score-bar high-score-bar'; // Puntuación 100 siempre es high-score
            bar100.style.width = `${percentage100}%`;
            const value100 = document.createElement('span');
            value100.className = 'score-value';
            value100.textContent = ` (${count100})`;
            barContainer100.appendChild(label100);
            barContainer100.appendChild(bar100);
            barContainer100.appendChild(value100);
            scoreDistributionGraph.appendChild(barContainer100);
        }
    }

    // Carga las estadísticas al iniciar la página
    loadAndRenderStats();
});