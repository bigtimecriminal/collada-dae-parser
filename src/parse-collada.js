var xmlparser = require('xml-parser')
var parseLibraryImages = require('./library_images/parse-library-images.js')
var parseLibraryMaterials = require('./library_materials/parse-library-materials.js')
var parseLibraryEffects = require('./library_effects/parse-library-effects.js')
var parseLibraryGeometries = require('./library_geometries/parse-library-geometries.js')
var parseLibraryVisualScenes = require('./library_visual_scenes/parse-visual-scenes.js')

module.exports = ParseCollada

function ParseCollada (colladaXML) {
  var parser = new DOMParser()
  colladaXML = parser.parseFromString(colladaXML, "text/xml")

  nsResolver = function nsResolver(prefix) { return "http://www.collada.org/2005/11/COLLADASchema" }

  var parsedObject = {}
  var parsedLibraryGeometries = parseLibraryGeometries(nsResolver, colladaXML)
  var visualSceneData = parseLibraryVisualScenes(nsResolver, colladaXML)
  var materialsData = parseLibraryMaterials(nsResolver, colladaXML)
  var effectsData = parseLibraryEffects(nsResolver, colladaXML)
  var imagesData = parseLibraryImages(nsResolver, colladaXML)

  parsedObject.geometries = []
  parsedObject.nodes = visualSceneData.nodes

  //ANTON TODO: fix this so that it transfers the entire structure
  parsedLibraryGeometries.forEach( function(parsedLibraryGeometry) {
    var parsedGeometry = {}
    parsedGeometry.id = parsedLibraryGeometry.id
    parsedGeometry.materials = parsedLibraryGeometry.materials
    parsedGeometry.vertexNormals = parsedLibraryGeometry.vertexNormals
    parsedGeometry.meshConnectivityLists = parsedLibraryGeometry.meshConnectivityLists
    parsedGeometry.vertexPositions = parsedLibraryGeometry.vertexPositions
    parsedGeometry.vertexTangents = parsedLibraryGeometry.vertexTangents
    parsedGeometry.vertexBitangents = parsedLibraryGeometry.vertexBitangents
    if (parsedLibraryGeometry.vertexUVs.length > 0) {
      parsedGeometry.vertexUVs = parsedLibraryGeometry.vertexUVs
    }
    parsedObject.geometries.push(parsedGeometry)
  })

  parsedObject.materialEffectReferences = materialsData.materialEffectReferences
  parsedObject.textureIdReferences = effectsData.textureIdReferences
  parsedObject.effectIdToBlinnProperties = effectsData.effectIdToBlinnProperties
  parsedObject.imageNameReferences = imagesData.imageNameReferences

  return parsedObject
}
