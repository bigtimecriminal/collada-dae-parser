var makePerspective = require('./matrix-math/make-perspective.js')
var makeInverse = require('./matrix-math/make-inverse.js')

var interpolateJoints = require('./temporary-refactor-zone/interpolate-joints.js')
var makeCamera = require('./temporary-refactor-zone/make-camera.js')

module.exports = Render

// TODO: Pass in an object instead of a bunch of params
// TODO: There's a lot happening in here that should happen elsewhere (i.e. animation setup)
// will be easier to split out once we know what we're doing
function Render (gl, animatedModel, shaderObject, dt, state) {
  // TODO: get # joints from model
  var numJoints = 5
  var selectedKeyframes = Object.keys(animatedModel.keyframes)
  .sort()
  .slice(state.currentAnimation[0], state.currentAnimation[1] + 1)
  .reduce(function (selectedKeyframes, currentKeyframe) {
    selectedKeyframes[currentKeyframe] = animatedModel.keyframes[currentKeyframe]
    return selectedKeyframes
  }, {})

  var interpolatedJoints = interpolateJoints(selectedKeyframes, dt, numJoints)

  gl.viewport(0, 0, state.viewport.width, state.viewport.height)
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

  var pMatrix = makePerspective(Math.PI / 3, state.viewport.width / state.viewport.height, 1, 2000)

  var modelPosition = [0, 0, 0]

  var cameraMatrix = makeCamera(state.orbit, modelPosition)
  var viewMatrix = makeInverse(cameraMatrix)

  animatedModel.draw({
    interpolatedJoints: interpolatedJoints,
    position: modelPosition,
    perspectiveMatrix: pMatrix,
    shaderObj: shaderObject,
    viewMatrix: viewMatrix
  })
}
