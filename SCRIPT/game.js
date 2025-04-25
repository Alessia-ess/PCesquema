document.addEventListener("DOMContentLoaded", function () {
  // Elementos del DOM
  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");
  const startButton = document.getElementById("startButton");
  const timeDisplay = document.getElementById("time");
  const scoreDisplay = document.getElementById("score");
  const levelDisplay = document.getElementById("level");
  const messageDisplay = document.getElementById("message");

  // Variables del juego
  let gameRunning = false;
  let timeLeft = 60;
  let score = 0;
  let level = 1;
  let gameInterval;
  let countdownInterval;
  let trashItems = [];
  let collectedAnimations = [];

  // Jugador
  const player = {
    x: canvas.width / 2,
    y: canvas.height - 50,
    width: 40,
    height: 60,
    speed: 5,
    color: "#2196F3",
    headColor: "#FFC107",
  };

  // Basura
  const trash = {
    minRadius: 10,
    maxRadius: 20,
    color: "#795548",
  };

  // Teclas presionadas
  const keys = {
    ArrowLeft: false,
    ArrowRight: false,
    ArrowUp: false,
    ArrowDown: false,
  };

  // Animaciones
  const animations = {
    collected: {
      duration: 500,
      startSize: 10,
      endSize: 30,
      color: "#4CAF50",
    },
  };

  // Inicializar el juego
  function initGame() {
    // Reiniciar variables
    gameRunning = true;
    timeLeft = 60;
    score = 0;
    trashItems = [];
    collectedAnimations = [];

    // Actualizar displays
    timeDisplay.textContent = timeLeft;
    scoreDisplay.textContent = score;
    levelDisplay.textContent = level;
    messageDisplay.textContent = "";

    // Crear basura inicial
    createInitialTrash();

    // Iniciar bucles del juego
    startGameLoops();
  }

  // Crear basura inicial
  function createInitialTrash() {
    const trashCount = 5 + level * 2; // Aumenta la basura por nivel
    for (let i = 0; i < trashCount; i++) {
      createTrashItem();
    }
  }

  // Crear un nuevo item de basura
  function createTrashItem() {
    const radius =
      trash.minRadius + Math.random() * (trash.maxRadius - trash.minRadius);
    const item = {
      x: radius + Math.random() * (canvas.width - radius * 2),
      y: radius + Math.random() * (canvas.height - radius * 2 - 100),
      radius: radius,
      color: trash.color,
    };
    trashItems.push(item);
  }

  // Iniciar los bucles del juego
  function startGameLoops() {
    // Bucle principal del juego
    gameInterval = setInterval(updateGame, 1000 / 60); // 60 FPS

    // Temporizador
    countdownInterval = setInterval(function () {
      timeLeft--;
      timeDisplay.textContent = timeLeft;

      // Cambiar color cuando el tiempo es crítico
      if (timeLeft <= 10) {
        timeDisplay.classList.add("time-warning");
      }

      // Fin del juego
      if (timeLeft <= 0) {
        endGame();
      }
    }, 1000);
  }

  // Actualizar el estado del juego
  function updateGame() {
    // Limpiar el canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Dibujar y actualizar elementos
    drawPlayer();
    drawTrash();
    updatePlayerPosition();
    checkCollisions();
    updateAnimations();
  }

  // Dibujar al jugador
  function drawPlayer() {
    // Cuerpo
    ctx.fillStyle = player.color;
    ctx.fillRect(
      player.x - player.width / 2,
      player.y - player.height,
      player.width,
      player.height
    );

    // Cabeza
    ctx.fillStyle = player.headColor;
    ctx.beginPath();
    ctx.arc(player.x, player.y - player.height - 10, 15, 0, Math.PI * 2);
    ctx.fill();
  }

  // Dibujar la basura
  function drawTrash() {
    trashItems.forEach((item) => {
      ctx.fillStyle = item.color;
      ctx.beginPath();
      ctx.arc(item.x, item.y, item.radius, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  // Actualizar posición del jugador
  function updatePlayerPosition() {
    if (keys.ArrowLeft && player.x > player.width / 2) {
      player.x -= player.speed;
    }
    if (keys.ArrowRight && player.x < canvas.width - player.width / 2) {
      player.x += player.speed;
    }
    if (keys.ArrowUp && player.y > player.height) {
      player.y -= player.speed;
    }
    if (keys.ArrowDown && player.y < canvas.height) {
      player.y += player.speed;
    }
  }

  // Verificar colisiones
  function checkCollisions() {
    for (let i = trashItems.length - 1; i >= 0; i--) {
      const item = trashItems[i];
      const dx = player.x - item.x;
      const dy = player.y - player.height - item.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < item.radius + 15) {
        // Recolectar basura
        trashItems.splice(i, 1);
        score++;
        scoreDisplay.textContent = score;

        // Crear animación
        createCollectionAnimation(item.x, item.y);

        // Reemplazar la basura recolectada
        createTrashItem();

        // Verificar si pasó de nivel
        if (score >= 10) {
          endGame(true);
        }
      }
    }
  }

  // Crear animación de recolección
  function createCollectionAnimation(x, y) {
    collectedAnimations.push({
      x: x,
      y: y,
      size: animations.collected.startSize,
      startTime: Date.now(),
      color: animations.collected.color,
    });
  }

  // Actualizar animaciones
  function updateAnimations() {
    const currentTime = Date.now();

    for (let i = collectedAnimations.length - 1; i >= 0; i--) {
      const anim = collectedAnimations[i];
      const elapsed = currentTime - anim.startTime;
      const progress = Math.min(elapsed / animations.collected.duration, 1);

      // Calcular tamaño actual
      anim.size =
        animations.collected.startSize +
        (animations.collected.endSize - animations.collected.startSize) *
          progress;

      // Dibujar animación
      ctx.fillStyle = anim.color;
      ctx.globalAlpha = 1 - progress;
      ctx.beginPath();
      ctx.arc(anim.x, anim.y, anim.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;

      // Eliminar animación completada
      if (progress >= 1) {
        collectedAnimations.splice(i, 1);
      }
    }
  }

  // Finalizar el juego
  function endGame(levelCompleted = false) {
    clearInterval(gameInterval);
    clearInterval(countdownInterval);
    gameRunning = false;

    timeDisplay.classList.remove("time-warning");

    if (levelCompleted) {
      level++;
      messageDisplay.textContent = `¡Nivel ${level} completado!`;
      messageDisplay.classList.add("level-complete");
      startButton.textContent = "Siguiente Nivel";
    } else {
      messageDisplay.textContent =
        "¡Tiempo agotado! No recolectaste suficiente basura.";
      messageDisplay.classList.remove("level-complete");
      startButton.textContent = "Intentar de Nuevo";
      level = 1; // Reiniciar nivel si falla
    }
  }

  // Event listeners para el teclado
  document.addEventListener("keydown", function (e) {
    if (gameRunning && keys.hasOwnProperty(e.key)) {
      keys[e.key] = true;
    }
  });

  document.addEventListener("keyup", function (e) {
    if (gameRunning && keys.hasOwnProperty(e.key)) {
      keys[e.key] = false;
    }
  });

  // Event listener para el botón de inicio
  startButton.addEventListener("click", function () {
    if (!gameRunning) {
      initGame();
    }
  });

  // Ajustar tamaño del canvas en redimensionamiento
  window.addEventListener("resize", function () {
    // Mantener las proporciones del juego
    canvas.width = Math.min(800, window.innerWidth - 40);
    canvas.height = canvas.width * 0.625; // Relación 5:8

    // Reajustar posición del jugador
    player.x = canvas.width / 2;
    player.y = canvas.height - 50;
  });

  // Inicializar tamaño del canvas
  window.dispatchEvent(new Event("resize"));
});
