var xmlparser = require('xml-parser')
var parseLibraryImages = require('./library_images/parse-library-images.js')
var parseLibraryMaterials = require('./library_materials/parse-library-materials.js')
var parseLibraryEffects = require('./library_effects/parse-library-effects.js')
var parseLibraryGeometries = require('./library_geometries/parse-library-geometries.js')
var parseLibraryVisualScenes = require('./library_visual_scenes/parse-visual-scenes.js')
var parseLibraryControllers = require('./library_controllers/parse-library-controllers.js')
var parseSkeletalAnimations = require('./library_animations/parse-skeletal-animations.js')
var parseLocRotScaleAnim = require('./library_animations/parse-loc-rot-scale-anim.js')
var validateNoControlBones = require('./validation/no-control-bones.js')

module.exports = ParseCollada

// TODO:
// Use input, accessor, and param attributes instead of hard coding lookups
// Clean Up Code / less confusing var names
function ParseCollada (colladaXML) {
  var result = compactXML({}, xmlparser(colladaXML.toString()).root)
  result = { COLLADA: result.COLLADA[0] }

  var parser = new DOMParser();
  colladaXML = parser.parseFromString(colladaXML, "text/xml");
  window.colladaXML = colladaXML;
  console.log(result);
  console.log(colladaXML);

//  function nsResolver(prefix) { return "http://www.collada.org/2005/11/COLLADASchema"; };
//  var daeIterator = colladaXML.evaluate('/COLLADA/library_geometries', colladaXML, nsResolver, XPathResult.ANY_TYPE, null );
//  var geometriesLib = daeIterator.iterateNext();

  var parsedObject = {}
  var parsedLibraryGeometries = parseLibraryGeometries(result.COLLADA.library_geometries, colladaXML)
  var visualSceneData = parseLibraryVisualScenes(result.COLLADA.library_visual_scenes, colladaXML)
  var materialsData = parseLibraryMaterials(result.COLLADA.library_materials, colladaXML)
  var effectsData = parseLibraryEffects(result.COLLADA.library_effects, colladaXML)
  var imagesData = parseLibraryImages(result.COLLADA.library_images, colladaXML)

  // The joint parents aren't actually joint parents so we get the joint parents..
  // This lib needs a refactor indeed
  // jointParents = {childBone: 'parentBone', anotherChild: 'anotherParent'}
//  var jointParents
//  if (Object.keys(visualSceneData.jointParents).length) {
//    jointParents = Object.keys(visualSceneData.jointParents)
//    .reduce(function (jointParents, jointName) {
//      // JSON.stringify {foo: undefined} = {}, os we replace undefined with null
//      // to make sure that we don't lose any keys
//      jointParents[jointName] = visualSceneData.jointParents[jointName].parent || null
//      return jointParents
//    }, {})
//  }
//
//  var jointInverseBindPoses
//  var controllerData
// commented out until model can be tested
//  if (result.COLLADA.library_controllers) {
//    controllerData = parseLibraryControllers(result.COLLADA.library_controllers)
//    if (controllerData.vertexJointWeights && Object.keys(controllerData.vertexJointWeights).length > 0) {
//      parsedObject.vertexJointWeights = controllerData.vertexJointWeights
//      parsedObject.jointNamePositionIndex = controllerData.jointNamePositionIndex
//      parsedObject.jointInverseBindPoses = controllerData.jointInverseBindPoses
//      jointInverseBindPoses = controllerData.jointInverseBindPoses
//
//      // The parser only supports deformation bones. Control bones' affects must be baked in before exporting
//      validateNoControlBones(Object.keys(visualSceneData.jointParents), Object.keys(jointInverseBindPoses))
//    }
//  }
//
//  // TODO: Also parse interpolation/intangent/outtangent
//  if (result.COLLADA.library_animations) {
//    parsedObject.keyframes = parseLocRotScaleAnim(result.COLLADA.library_animations[0].animation)
//    if (Object.keys(parsedObject.keyframes).length === 0) {
//      delete parsedObject.keyframes
//    }
//    var keyframes = parseSkeletalAnimations(result.COLLADA.library_animations, jointInverseBindPoses, visualSceneData, controllerData.jointNamePositionIndex)
//    if (Object.keys(keyframes).length > 0) {
//      parsedObject.keyframes = keyframes
//    }
//  }

  parsedObject.geometries = []
  parsedObject.nodes = visualSceneData.nodes

  // Return our parsed collada object
//  if (controllerData && controllerData.armatureName) {
//    parsedObject.armatureName = controllerData.armatureName
//  }
//  if (jointParents) {
//    parsedObject.jointParents = jointParents
//  }

  //ANTON TODO: fix this so that it transfers the entire structure
  parsedLibraryGeometries.forEach( function(parsedLibraryGeometry) {
    var parsedGeometry = {}
    parsedGeometry.id = parsedLibraryGeometry.id
    parsedGeometry.material = parsedLibraryGeometry.material
    parsedGeometry.vertexNormalIndices = parsedLibraryGeometry.vertexNormalIndices
    parsedGeometry.vertexNormals = parsedLibraryGeometry.vertexNormals
    parsedGeometry.vertexPositionIndices = parsedLibraryGeometry.vertexPositionIndices
    parsedGeometry.vertexPositions = parsedLibraryGeometry.vertexPositions
    parsedGeometry.vertexTangentIndices = parsedLibraryGeometry.vertexTangentIndices
    parsedGeometry.vertexTangents = parsedLibraryGeometry.vertexTangents
    parsedGeometry.vertexBitangentIndices = parsedLibraryGeometry.vertexBitangentIndices
    parsedGeometry.vertexBitangents = parsedLibraryGeometry.vertexBitangents
    if (parsedLibraryGeometry.vertexUVs.length > 0) {
      parsedGeometry.vertexUVIndices = parsedLibraryGeometry.vertexUVIndices
      parsedGeometry.vertexUVs = parsedLibraryGeometry.vertexUVs
    }
    parsedObject.geometries.push(parsedGeometry);
  })

  parsedObject.materialEffectReferences = materialsData.materialEffectReferences;
  parsedObject.textureIdReferences = effectsData.textureIdReferences;
  parsedObject.effectIdToBlinnProperties = effectsData.effectIdToBlinnProperties;
  parsedObject.imageNameReferences = imagesData.imageNameReferences;

  return parsedObject
}

/**
 * We used to use a different XML parsing library. This recursively transforms
 * the data that we get from our new XML parser to match the old one. This is a
 * stopgap measure until we get around to changing the keys that we look while we parse to
 * the keys that the new parser expects
 */
function compactXML (res, xml) {
  var txt = Object.keys(xml.attributes).length === 0 && xml.children.length === 0
  var r = {}
  if (!res[xml.name]) res[xml.name] = []
  if (txt) {
    r = xml.content || ''
  } else {
    r.$ = xml.attributes
    r._ = xml.content || ''
    xml.children.forEach(function (ch) {
      compactXML(r, ch)
    })
  }
  res[xml.name].push(r)
  return res
}
