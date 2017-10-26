(function () {
    'use strict';

    var canvas = document.getElementById('theCanvas'),
        dingSound = $("#ding"),
        newGame = $("#newGame"),
        pauseWrap = $("#pauseWrap"),
        score = $("#score"),
        highScore = $("#highScore"),
        gameOver = $("#gameOver"),
        lsHighScore = localStorage.highScore,
        pause,
        ctx = canvas.getContext('2d'),
        face = new Image(),
        apple = new Image(),
        bonus2 = new Image(),
        snakeSize = 20,
        snake = [{ left: -20, top: 0 }, { left: -40, top: 0 }, { left: -60, top: 0 }],
        appleLeft = 0,
        appleTop = 0,
        bonusLeft = 0,
        bonusTop = 0,
        isBonus = false,
        bonusTime = 50,
        interval,
        counter = 0,
        speed = 250,
        currantScore = 0,
        tempLeft = 0,
        tempTop = 0,
        LEFT = 37,
        UP = 38,
        RIGHT = 39,
        DOWN = 40,
        direction = RIGHT;

    function start() {
        face.src = 'snakehead.png';
        apple.src = 'apple.jpg';
        bonus2.src = '2x.jpg';
    }
    start();

    function resizeCanvas() {
        var width = window.innerWidth - 400,
            height = window.innerHeight - 100;

        canvas.width = width - width % snakeSize;
        canvas.height = height - height % snakeSize;
    }
    resizeCanvas();

    window.addEventListener('resize', function () {
        resizeCanvas();
    });

    newGame.click(function () {
        setDefaults();
        creatPlayPause();
        placeApple();
        init();
    });

    function creatPlayPause() {
        pauseWrap.html('<button id="pause">Pause</button>');
        pause = $("#pause");
        pause.css({ width: "55px" });
        pause.click(function () {
            if (pause.text() === "Pause") {
                clearInterval(interval);
                pause.text("Play");
            } else {
                init();
                pause.text("Pause");
            }
        });
    }

    function setDefaults() {
        clearInterval(interval);
        highScore.text(localStorage.highScore);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        currantScore = 0;
        score.text("0");
        resetBonus();
        speed = 250;
        direction = RIGHT;
        snake = [{ left: -20, top: 0 }, { left: -40, top: 0 }, { left: -60, top: 0 }];
    }

    function endGame() {
        clearInterval(interval);
        ding();
        gameOver.html("GAME OVER");
        pauseWrap.html('');
        if (currantScore > localStorage.highScore) {
            localStorage.highScore = currantScore;
        }
    }

    function setScore(amount) {
        currantScore += amount;
        score.text(currantScore);
    }

    function ding() {
        dingSound.get(0).play();
    }

    function resetBonus() {
        counter = 0;
        isBonus = false;
        gameOver.html("");
    }

    function init() {
        interval = setInterval(function () {
            var left = 0,
                top = 0;
            switch (direction) {
                case LEFT:
                    if (snake[0].left + (-snakeSize) == snake[1].left) {
                        left = tempLeft;
                    } else {
                        left = -snakeSize;
                    }
                    break;
                case RIGHT:
                    if (snake[0].left + snakeSize == snake[1].left) {
                        left = tempLeft;
                    } else {
                        left = snakeSize;
                    }
                    break;
                case UP:
                    if (snake[0].top + (-snakeSize) == snake[1].top) {
                        top = tempTop;
                    } else {
                        top = -snakeSize;
                    }
                    break;
                case DOWN:
                    if (snake[0].top + snakeSize == snake[1].top) {
                        top = tempTop;
                    } else {
                        top = snakeSize;
                    }
                    break;
            }

            tempLeft = left;
            tempTop = top;

            if (snake[0].left + left < 0 || snake[0].top + top < 0 ||
                snake[0].left + left >= canvas.width || snake[0].top + top >= canvas.height) {
                endGame();
                return;
            }

            if (collisionWithSelf(snake[0].left + left, snake[0].top + top) === true) {
                endGame();
                return;
            }

            if (snake[0].left + left === appleLeft && snake[0].top + top === appleTop) {
                snake.push({ left: snake[0].left, top: snake[0].top });
                ding();
                checkSpeed();
                placeApple();
                setScore(1);
                if (snake.length % 4 === 0) {
                    placeBonus();
                    getBonusTime();
                    isBonus = true;
                    gameOver.html("GET THE BONUS");
                }
            }

            if (isBonus) {
                counter++;
                console.log(counter);
                if (counter > bonusTime) {
                    ctx.clearRect(bonusLeft, bonusTop, snakeSize, snakeSize);
                    resetBonus();
                } else {
                    if (snake[0].left + left === bonusLeft && snake[0].top + top === bonusTop) {
                        setScore(2);
                        resetBonus();
                    }
                }
            }

            ctx.clearRect(snake[snake.length - 1].left, snake[snake.length - 1].top, snakeSize, snakeSize);

            var i = snake.length - 1;
            for (i; i > 0; i--) {
                snake[i].left = snake[i - 1].left;
                snake[i].top = snake[i - 1].top;
            }

            snake[0].left += left;
            snake[0].top += top;

            snake.forEach(function (part) {
                ctx.drawImage(face, part.left, part.top, snakeSize, snakeSize);
            });
        }, speed);
    }

    function checkSpeed() {
        if ((snake.length % 5) === 0) {
            if (speed > 50) {
                speed -= 50;
            } else {
                speed -= 5;
            }
        }
        clearInterval(interval);
        init();
    }

    function getRandomNumber(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    function collisionWithSelf(leftLoc, topLoc) {
        var trueFalse = false;
        snake.forEach(function (loc) {
            if (leftLoc === loc.left && topLoc === loc.top) {
                trueFalse = true;
            }
        });
        return trueFalse;
    }

    function getBonusTime() {

    }

    function placeBonus() {
        bonusLeft = getRandomLeft();
        bonusTop = getRandomTop();

        if (collisionWithSelf(bonusLeft, bonusTop) === true || bonusLeft === appleLeft && bonusTop === appleTop) {
            placeBonus();
        }
        ctx.drawImage(bonus2, bonusLeft, bonusTop, snakeSize, snakeSize);
    }

    function getRandomLeft() {
        var left = getRandomNumber(0, canvas.width);
        left -= left % snakeSize;
        return left;
    }

    function getRandomTop() {
        var top = getRandomNumber(0, canvas.height);
        top -= top % snakeSize;
        return top;
    }

    function placeApple() {
        appleLeft = getRandomLeft();
        appleTop = getRandomTop();

        if (collisionWithSelf(appleLeft, appleTop) === true || appleLeft === bonusLeft && appleTop === bonusTop) {
            placeApple();
        }
        ctx.drawImage(apple, appleLeft, appleTop, snakeSize, snakeSize);
    }

    window.addEventListener('keydown', function (event) {
        switch (event.keyCode) {
            case LEFT:
            case UP:
            case RIGHT:
            case DOWN:
                direction = event.keyCode;
                break;
        }
    });

}());