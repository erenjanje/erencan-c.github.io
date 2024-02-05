import { Mesh } from './Mesh.js';
import * as g from './globals.js';
import { Camera } from './Camera.js';
import { Game } from './Game.js';
let game;
let currentFrameHandler;
const meshes = {
    pointCube: new Mesh(g.cubeData.vertex, g.cubeData.indices, new Float32Array([0.1, 0.1, 0.1]), new Float32Array([1.0, 1.0, 0.0]), new Float32Array([1, 1, 1]), 200, new Float32Array([0, 1, -7]), new Float32Array([0, 0, 0]), new Float32Array([0.25, 1, 0.5])),
    faintCube1: new Mesh(g.cubeData.vertex, g.cubeData.indices, new Float32Array([0.1, 0.1, 0.1]), new Float32Array([1, 0, 0]), new Float32Array([1, 1, 1]), 200, new Float32Array([-2, 1, -7]), new Float32Array([0, 0, 0]), new Float32Array([0.25, 1, 0.5])),
    faintCube2: new Mesh(g.cubeData.vertex, g.cubeData.indices, new Float32Array([0.1, 0.1, 0.1]), new Float32Array([1, 0, 0]), new Float32Array([1, 1, 1]), 200, new Float32Array([2, 1, -7]), new Float32Array([0, 0, 0]), new Float32Array([0.25, 1, 0.5])),
    background: new Mesh(g.planeData.vertex, g.planeData.indices, new Float32Array([0.0, 0.0, 0.0]), new Float32Array([0.0, 0.0, 0.0]), new Float32Array([0.0, 0.0, 0.0]), 1, new Float32Array(g.backgroundStartTranslation), new Float32Array([0, 0, 0]), new Float32Array([99, 99, 1])),
    ground: new Mesh(g.planeData.vertex, g.planeData.indices, new Float32Array([0.0, 0.0, 0.0]), new Float32Array([0.0, 0.0, 0.0]), new Float32Array([0.0, 0.0, 0.0]), 1, new Float32Array(g.groundStartTranslation), new Float32Array([-Math.PI / 2, 0, 0]), new Float32Array([4, 49.5, 1]), true),
    bunny: new Mesh(g.bunnyData.vertex, g.bunnyData.indices, new Float32Array([0.2, 0.2, 0.2]), new Float32Array([1.0, 0.5, 0.0]), new Float32Array([1.0, 1.0, 1.0]), 200, new Float32Array(g.bunnyStartTranslation), new Float32Array(g.bunnyStartRotation), new Float32Array([0.33, 0.33, 0.33]))
};
game = new Game(new Camera(new Float32Array(g.cameraStartTranslation), new Float32Array([0, 0, -1]), 90, 1, 0.1, 50), meshes);
g.gl.enable(g.gl.CULL_FACE);
g.gl.enable(g.gl.DEPTH_TEST);
let previousTime = 0.0;
/**
 * Process a single frame
 * @param currentTime Current time stamp given by `requestAnimationFrame` by the browser
*/
function frame(currentTime) {
    // Take the difference (divide by 1000 since we need seconds but we are given milliseconds)
    const dt = (currentTime - previousTime) / 1e3;
    // Save the current time as the previous for the usage of the next frame
    previousTime = currentTime;
    if (g.settings.running) {
        game.update(dt);
    }
    // Clear to black
    g.gl.clearColor(0, 0, 0, 1);
    g.gl.clear(g.gl.COLOR_BUFFER_BIT);
    // We need to render even when the game is not running.
    // Otherwise, changing the resolution will break
    game.render();
    requestAnimationFrame(frame);
}
/**
 * Record the key.
 *
 * We check R key here since the other alternatives do not
 * cause right behavior. Putting it in `frame` makes so that
 * pressing R key even for only a small time cause multiple
 * restarts.
*/
function keyDown(event) {
    g.keys[event.code] = true;
    if (g.keys['KeyR'] === true) {
        game.restart();
    }
}
/**
 * Delete the key.
 */
function keyUp(event) {
    delete g.keys[event.code];
}
document.addEventListener('keydown', keyDown);
document.addEventListener('keyup', keyUp);
let touchStartPosition = { x: null, y: null };
function touchStart(event) {
    const firstTouch = event.touches[0];
    touchStartPosition.x = firstTouch.clientX;
    touchStartPosition.y = firstTouch.clientY;
}
function touchMove(event) {
    if (!touchStartPosition.x || !touchStartPosition.y) {
        return;
    }
    let up = {
        x: event.touches[0].clientX,
        y: event.touches[0].clientY,
    };
    console.log(touchStartPosition, up);
    let diff = {
        x: touchStartPosition.x - up.x,
        y: touchStartPosition.y - up.y,
    };
    if (Math.abs(diff.x) > Math.abs(diff.y)) {
        if (Math.abs(diff.x) < 0.1) {
            if (g.keys['KeyA']) {
                delete g.keys['KeyA'];
            }
            if (g.keys['KeyD']) {
                delete g.keys['KeyD'];
            }
        }
        else if (diff.x < 0) {
            g.keys['KeyD'] = true;
            if (g.keys['KeyA']) {
                delete g.keys['KeyA'];
            }
        }
        else {
            g.keys['KeyA'] = true;
            if (g.keys['KeyD']) {
                delete g.keys['KeyD'];
            }
        }
    }
    touchStartPosition = up;
}
function touchEnd(event) {
    if (g.keys['KeyA']) {
        delete g.keys['KeyA'];
    }
    if (g.keys['KeyD']) {
        delete g.keys['KeyD'];
    }
    touchStartPosition.x = null;
    touchStartPosition.y = null;
}
document.addEventListener('touchstart', touchStart, false);
document.addEventListener('touchmove', touchMove, false);
document.addEventListener('touchend', touchEnd, false);
addEventListener('resize', e => {
    // Default width (and height) is 800 pixels.
    // Note that null coelescing operator (??) is problematic
    // sinc an invalid input (like a text) passes the operator while giving NaN
    // as the parseInt output, making the width (and height) NaN.
    // g.settings.width = Number.parseInt(g.settingsGetters.width.value) || 800;
    g.settings.width = window.innerWidth;
    g.settings.height = window.innerHeight;
    g.canvas.setAttribute('width', g.settings.width.toString());
    g.canvas.setAttribute('height', g.settings.height.toString());
    g.gl.viewport(0, 0, g.settings.width, g.settings.height);
    const aspectRatio = g.settings.width / g.settings.height;
    game.scene.camera.aspectRatio = aspectRatio;
    meshes.background.scaling = new Float32Array([
        g.backgroundStartScaling[0] * aspectRatio,
        g.backgroundStartScaling[1],
        g.backgroundStartScaling[2]
    ]);
    console.log(g.settings);
});
game.restart();
// We start from time 0
frame(0);
//# sourceMappingURL=index.js.map