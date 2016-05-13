var parseXML = require('xml2js').parseString
var parseLibraryGeometries = require('./library_geometries/parse-library-geometries.js')
var parseLibraryVisualScenes = require('./library_visual_scenes/parse-visual-scenes.js')
var parseLibraryControllers = require('./library_controllers/parse-library-controllers.js')
var parseSkeletalAnimations = require('./library_animations/parse-skeletal-animations.js')
var parseLocRotScaleAnim = require('./library_animations/parse-loc-rot-scale-anim.js')

module.exports = ParseCollada

// TODO:
// Use input, accessor, and param attributes instead of hard coding lookups
// Clean Up Code / less confusing var names
function ParseCollada (colladaXML, callback) {
  parseXML(colladaXML, function (err, result) {
    if (err) { return callback(err) }

    var parsedObject = {}
    var parsedLibraryGeometries = parseLibraryGeometries(result.COLLADA.library_geometries)

    var visualSceneData = parseLibraryVisualScenes(result.COLLADA.library_visual_scenes)

    var jointBindPoses
    if (result.COLLADA.library_controllers) {
      var controllerData = parseLibraryControllers(result.COLLADA.library_controllers)
      if (controllerData.vertexJointWeights && Object.keys(controllerData.vertexJointWeights) .length > 0) {
        parsedObject.vertexJointWeights = controllerData.vertexJointWeights
        jointBindPoses = controllerData.jointBindPoses
      }
    }

    // TODO: Also parse interpolation/intangent/outtangent
    if (result.COLLADA.library_animations) {
      parsedObject.keyframes = parseLocRotScaleAnim(result.COLLADA.library_animations[0].animation)
      if (Object.keys(parsedObject.keyframes).length === 0) {
        delete parsedObject.keyframes
      }
      var keyframes = parseSkeletalAnimations(result.COLLADA.library_animations, jointBindPoses, visualSceneData)
      if (Object.keys(keyframes).length > 0) {
        parsedObject.keyframes = keyframes
      }
    }

    // Return our parsed collada object
    parsedObject.vertexNormalIndices = parsedLibraryGeometries.vertexNormalIndices
    parsedObject.vertexNormals = parsedLibraryGeometries.vertexNormals
    parsedObject.vertexPositionIndices = parsedLibraryGeometries.vertexPositionIndices
    parsedObject.vertexPositions = parsedLibraryGeometries.vertexPositions
    if (parsedLibraryGeometries.vertexUVs.length > 0) {
      parsedObject.vertexUVIndices = parsedLibraryGeometries.vertexUVIndices
      parsedObject.vertexUVs = parsedLibraryGeometries.vertexUVs
    }
    callback(null, parsedObject)
  })
}
