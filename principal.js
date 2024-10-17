var juego = new Phaser.Game(1200, 575, Phaser.AUTO, 'bloque_juego');
var fondoJuego;
var player;
var enemigo;
var bola;
var cursors;
var wKey, sKey;
var score = 0;
var scoreText;
var bolaVelocidad = 200;
var nivel = 1;
var nivelText;  // Variable para mostrar el nivel en pantalla

var estadoPrincipal = {
    preload: function() {
        // Cargar las imágenes y el sonido
        juego.load.image('fondo', './img/bg.png');
        juego.load.image('player', './img/pj.png', 43, 30);
        juego.load.image('enemigo', './img/pj2.png', 43, 30);
        juego.load.image('bola', './img/bola.png', 43, 30);
        juego.load.audio('rebote', './rebote.mp3');
    },

    create: function() {
        // Fondo
        fondoJuego = juego.add.tileSprite(0, 0, 1200, 575, 'fondo');
        
        // Jugadores (player y enemigo)
        player = juego.add.sprite(50, juego.world.centerY, 'player');
        juego.physics.arcade.enable(player);
        player.body.collideWorldBounds = true;
        player.body.immovable = true;

        enemigo = juego.add.sprite(1150, juego.world.centerY, 'enemigo');
        juego.physics.arcade.enable(enemigo);
        enemigo.body.collideWorldBounds = true;
        enemigo.body.immovable = true;

        // Bola
        bola = juego.add.sprite(juego.world.centerX, juego.world.centerY, 'bola');
        juego.physics.arcade.enable(bola);
        bola.body.collideWorldBounds = true;
        bola.body.bounce.setTo(1, 1);
        bola.body.velocity.setTo(bolaVelocidad, bolaVelocidad);

        // Puntaje
        scoreText = juego.add.text(20, 20, 'Puntaje: 0', { fontSize: '32px', fill: '#fff' });

        // Texto del nivel (centrado en la parte superior, pero un poco más abajo)
        nivelText = juego.add.text(juego.world.centerX, 40, 'NIVEL 1', { fontSize: '32px', fill: '#fff' });
        nivelText.anchor.setTo(0.5);  // Asegurar que el texto esté centrado horizontalmente

        // Controles para el jugador 1 (W y S)
        wKey = juego.input.keyboard.addKey(Phaser.Keyboard.W);
        sKey = juego.input.keyboard.addKey(Phaser.Keyboard.S);

        // Controles para el jugador 2 (Flechas UP y DOWN)
        cursors = juego.input.keyboard.createCursorKeys();

        // Sonido
        this.reboteSound = juego.add.audio('rebote');
    },

    update: function() {
        // Movimiento del player (Jugador 1) con W y S
        if (wKey.isDown) {
            player.body.velocity.y = -300;
        } else if (sKey.isDown) {
            player.body.velocity.y = 300;
        } else {
            player.body.velocity.y = 0;
        }

        // Movimiento del enemigo (Jugador 2) con flechas UP y DOWN
        if (cursors.up.isDown) {
            enemigo.body.velocity.y = -300;
        } else if (cursors.down.isDown) {
            enemigo.body.velocity.y = 300;
        } else {
            enemigo.body.velocity.y = 0;
        }

        // Colisiones entre la bola y los jugadores
        juego.physics.arcade.collide(bola, player, this.rebote, null, this);
        juego.physics.arcade.collide(bola, enemigo, this.rebote, null, this);

        // Verificar si la bola sale del canvas por los laterales (izquierda o derecha)
        if (bola.x < 0 || bola.x > juego.world.width) {
            this.mostrarPantallaPerdida();  // Mostrar pantalla de pérdida si la bola sale del canvas
        }

        // Actualizar el nivel en función del puntaje
        if (score >= 1000 && nivel === 1) {
            this.pasarNivel(2);  // Pasar al nivel 2
        }

        // Actualizar el texto del nivel
        if (score < 1000) {
            nivelText.setText('NIVEL 1');
        } else if (score >= 1000) {
            nivelText.setText('NIVEL 2');
        }

        // Si el puntaje llega a 5000, termina el juego
        if (score >= 5000) {
            this.finDelJuego();
        }
    },

    rebote: function(bola, jugador) {
        // Sonido al rebotar
        this.reboteSound.play();

        // Aumentar puntaje y velocidad de la bola
        score += 100;
        scoreText.text = 'Puntaje: ' + score;
        bolaVelocidad += 20;
        bola.body.velocity.x = bola.body.velocity.x > 0 ? bolaVelocidad : -bolaVelocidad;
        bola.body.velocity.y = bola.body.velocity.y > 0 ? bolaVelocidad : -bolaVelocidad;
    },

    pasarNivel: function(nuevoNivel) {
        nivel = nuevoNivel;
        scoreText.text = 'Nivel: ' + nivel + ' - Puntaje: ' + score;

        // Aumentar la dificultad en el segundo nivel
        bolaVelocidad += 100;
        bola.body.velocity.setTo(bolaVelocidad, bolaVelocidad);
    },

    mostrarPantallaPerdida: function() {
        juego.state.start('perder', true, false, score);  // Cambiar a la pantalla de pérdida
    },

    finDelJuego: function() {
        // Mostrar mensaje de fin de juego
        juego.state.start('finJuego', true, false, score);  // Inicia el estado de fin del juego
    }
};

var estadoPerder = {
    init: function(finalScore) {
        this.finalScore = finalScore;  // Guardar el puntaje final
    },

    create: function() {
        // Fondo negro
        juego.stage.backgroundColor = "#000000";

        // Texto "Perdiste :("
        var textoPerder = juego.add.text(juego.world.centerX, juego.world.centerY - 50, 'Perdiste :( ¡Sigue intentando!', { font: '40px Arial', fill: '#fff' });
        textoPerder.anchor.setTo(0.5);

        // Texto para mostrar el puntaje
        var textoPuntaje = juego.add.text(juego.world.centerX, juego.world.centerY, 'Puntaje: ' + this.finalScore, { font: '30px Arial', fill: '#fff' });
        textoPuntaje.anchor.setTo(0.5);

        // Texto para reiniciar el juego
        var reiniciarTexto = juego.add.text(juego.world.centerX, juego.world.centerY + 50, 'Presiona cualquier tecla para iniciar', { font: '20px Arial', fill: '#fff' });
        reiniciarTexto.anchor.setTo(0.5);

        // Reiniciar el juego al presionar cualquier tecla
        juego.input.keyboard.onDownCallback = function() {
            juego.input.keyboard.onDownCallback = null;  // Evitar reinicios múltiples
            juego.state.start('principal');  // Reiniciar el juego
        };
    }
};

var estadoInicio = {

    create: function() {
        var texto = juego.add.text(juego.world.centerX, juego.world.centerY - 50, 'Presiona cualquier tecla para iniciar', { font: '30px Arial', fill: '#fff' });
        texto.anchor.setTo(0.5);

        var instruccionesPJ1 = juego.add.text(juego.world.centerX, juego.world.centerY + 10, 'Alien (PJ1): arriba = tecla "W" - abajo = tecla "S"', { font: '20px Arial', fill: '#fff' });
        instruccionesPJ1.anchor.setTo(0.5);

        var instruccionesPJ2 = juego.add.text(juego.world.centerX, juego.world.centerY + 40, 'Nave (PJ2): arriba = tecla "UP" - abajo = tecla "DOWN"', { font: '20px Arial', fill: '#fff' });
        instruccionesPJ2.anchor.setTo(0.5);

        var autor = juego.add.text(juego.world.centerX, juego.world.centerY + 100, 'Roxana Mendoza Carolina Mendoza Flores - U202299', { font: '20px Arial', fill: '#fff' });
        autor.anchor.setTo(0.5);

        // Iniciar el juego al presionar cualquier tecla
        juego.input.keyboard.addKeyCapture([Phaser.Keyboard.SPACEBAR, Phaser.Keyboard.ENTER]);
        juego.input.keyboard.onDownCallback = function() {
            juego.input.keyboard.onDownCallback = null;
            juego.state.start('principal');
        };
    }
};

juego.state.add('inicio', estadoInicio);
juego.state.add('principal', estadoPrincipal);
juego.state.add('perder', estadoPerder);
juego.state.start('inicio');

