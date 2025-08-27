document.addEventListener('DOMContentLoaded', () => {
    // Referencias a elementos del DOM
    const gameForm = document.getElementById('game-form');
    const gameListContainer = document.getElementById('game-list');
    const exportButton = document.getElementById('export-button');
    const importFile = document.getElementById('import-file');
    const messageBox = document.getElementById('message-box');
    const gameFormSection = document.getElementById('game-form-section');
    const statsSection = document.getElementById('stats-section');
    const statsContainer = document.getElementById('stats-container');
    const viewStatsButton = document.getElementById('view-stats-button');
    const goBackButton = document.getElementById('go-back-button');
    const totalGamesCountSpan = document.getElementById('total-games-count');
    const averageScoreSpan = document.getElementById('average-score');
    const scoreDistributionDiv = document.getElementById('score-distribution');

    // Carga los juegos desde el almacenamiento local
    let games = JSON.parse(localStorage.getItem('games')) || [];

    /**
     * Muestra un mensaje de retroalimentación en la interfaz de usuario.
     * @param {string} message - El mensaje a mostrar.
     * @param {string} type - El tipo de mensaje ('success' o 'error').
     */
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

    /**
     * Renderiza la lista de juegos en la interfaz de usuario.
     */
    function renderGames() {
        if (!gameListContainer) {
            console.error('El contenedor de la lista de juegos no se encontró.');
            return;
        }

        gameListContainer.innerHTML = '';
        if (games.length === 0) {
            gameListContainer.innerHTML = '<p class="no-games-message" style="text-align: center; color: #aaa;">¡Tu jardín de juegos está vacío! Añade algunos títulos.</p>';
            return;
        }

        games.forEach((game, index) => {
            const gameCard = document.createElement('div');
            gameCard.className = 'game-card';
            
            // Lógica para asignar clases de puntuación
            let scoreClass = '';
            if (game.score >= 10 && game.score <= 39) {
                scoreClass = 'low-score';
            } else if (game.score >= 40 && game.score <= 59) {
                scoreClass = 'midlow-score';
            } else if (game.score >= 60 && game.score <= 74) {
                scoreClass = 'mid-score';
            } else if (game.score >= 75 && game.score <= 89) {
                scoreClass = 'midhigh-score';
            } else if (game.score >= 90 && game.score <= 100) {
                scoreClass = 'high-score';
            }

            gameCard.innerHTML = `
                ${game.imageLink ? `<img src="${game.imageLink}" alt="Imagen de ${game.title}" class="game-image" onerror="this.style.display='none'">` : ''}
                <div class="card-content">
                    <div class="card-header">
                        <h3>
                            ${game.referenceLink ? `<a href="${game.referenceLink}" target="_blank" class="game-reference-link">${game.title}</a>` : game.title}
                        </h3>
                        <span class="score ${scoreClass}">${game.score}</span>
                    </div>
                    ${game.platform ? `<p class="platform">${game.platform}</p>` : ''}
                    ${game.notes ? `<p>${game.notes}</p>` : ''}
                    <div class="card-footer">
                        <button class="delete-button" data-index="${index}">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </div>
            `;
            gameListContainer.appendChild(gameCard);
        });

        // Añade los event listeners para los botones de eliminar
        document.querySelectorAll('.delete-button').forEach(button => {
            button.addEventListener('click', (e) => {
                const index = e.target.closest('button').dataset.index;
                deleteGame(index);
            });
        });
    }

    /**
     * Renderiza las estadísticas de la colección de juegos.
     */
    function renderStats() {
        if (!statsContainer) {
            console.error('El contenedor de estadísticas no se encontró.');
            return;
        }

        if (games.length === 0) {
            statsContainer.innerHTML = '<p style="text-align: center;">¡Aún no hay juegos para analizar!</p>';
            return;
        }

        const totalGames = games.length;
        const sumOfScores = games.reduce((sum, game) => sum + parseInt(game.score), 0);
        const averageScore = (sumOfScores / totalGames).toFixed(2);

        if (totalGamesCountSpan) totalGamesCountSpan.textContent = totalGames;
        if (averageScoreSpan) averageScoreSpan.textContent = averageScore;

        const scoreRanges = {
            '0-9': 0, '10-19': 0, '20-29': 0, '30-39': 0, '40-49': 0,
            '50-59': 0, '60-69': 0, '70-79': 0, '80-89': 0, '90-100': 0
        };
        games.forEach(game => {
            const score = parseInt(game.score);
            if (score >= 90) scoreRanges['90-100']++;
            else if (score >= 80) scoreRanges['80-89']++;
            else if (score >= 70) scoreRanges['70-79']++;
            else if (score >= 60) scoreRanges['60-69']++;
            else if (score >= 50) scoreRanges['50-59']++;
            else if (score >= 40) scoreRanges['40-49']++;
            else if (score >= 30) scoreRanges['30-39']++;
            else if (score >= 20) scoreRanges['20-29']++;
            else if (score >= 10) scoreRanges['10-19']++;
            else scoreRanges['0-9']++;
        });

        if (scoreDistributionDiv) {
            scoreDistributionDiv.innerHTML = '';
            const maxCount = Math.max(...Object.values(scoreRanges));

            for (const range in scoreRanges) {
                const count = scoreRanges[range];
                const width = maxCount > 0 ? (count / maxCount) * 100 : 0;
                const scoreBarContainer = document.createElement('div');
                scoreBarContainer.className = 'score-bar-container';
                scoreBarContainer.innerHTML = `
                    <span class="score-label">${range}: ${count}</span>
                    <div class="score-bar" style="width: ${width}%;"></div>
                `;
                scoreDistributionDiv.appendChild(scoreBarContainer);
            }
        }
    }
    
    // Función para guardar los juegos en el localStorage
    function saveGames() {
        localStorage.setItem('games', JSON.stringify(games));
    }

    // Maneja el envío del formulario para añadir un nuevo juego
    if (gameForm) {
        gameForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const title = document.getElementById('game-title').value;
            const platform = document.getElementById('game-platform').value;
            const score = parseInt(document.getElementById('game-score').value);
            const imageLink = document.getElementById('game-image-link').value;
            const referenceLink = document.getElementById('game-reference-link').value;
            
            if (score < 10 || score > 100) {
                showMessage('La puntuación debe estar entre 10 y 100.', 'error');
                return;
            }

            const newGame = {
                id: Date.now(),
                title,
                platform,
                score,
                imageLink,
                referenceLink,
                notes,
                dateAdded: new Date().toISOString()
            };

            games.push(newGame);
            saveGames();
            renderGames();
            gameForm.reset();
            showMessage('¡Juego añadido a tu jardín con éxito!');
        });
    }

    // Función para eliminar un juego
    function deleteGame(index) {
        games.splice(index, 1);
        saveGames();
        renderGames();
        showMessage('Juego eliminado.', 'error');
    }

    // Maneja la exportación de datos
    if (exportButton) {
        exportButton.addEventListener('click', () => {
            const dataStr = JSON.stringify(games, null, 2);
            const blob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'rate_your_games_data.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            showMessage('Puntuaciones exportadas con éxito.');
        });
    }

    // Maneja la importación de datos
    if (importFile) {
        importFile.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) {
                return;
            }
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const importedGames = JSON.parse(event.target.result);
                    if (Array.isArray(importedGames)) {
                        games = importedGames;
                        saveGames();
                        renderGames();
                        showMessage('Puntuaciones importadas con éxito.');
                    } else {
                        throw new Error('El archivo no es un formato JSON de puntuaciones válido.');
                    }
                } catch (error) {
                    showMessage('Error al importar el archivo. Asegúrate de que es un archivo JSON válido.', 'error');
                    console.error('Error de importación:', error);
                }
            };
            reader.readAsText(file);
        });
    }

    // Maneja el cambio de vista a estadísticas. El error original estaba aquí.
    if (viewStatsButton) {
        viewStatsButton.addEventListener('click', (e) => {
            e.preventDefault();
            if (gameFormSection) gameFormSection.style.display = 'none';
            if (gameListContainer.parentElement) gameListContainer.parentElement.style.display = 'none';
            if (statsSection) statsSection.style.display = 'flex';
            renderStats();
        });
    }

    // Maneja el regreso a la lista de juegos. El error original también estaba aquí.
    if (goBackButton) {
        goBackButton.addEventListener('click', (e) => {
            e.preventDefault();
            if (gameFormSection) gameFormSection.style.display = 'flex';
            if (gameListContainer.parentElement) gameListContainer.parentElement.style.display = 'flex';
            if (statsSection) statsSection.style.display = 'none';
        });
    }

    // Renderiza los juegos al cargar la página
    renderGames();
});
