module.exports = ParseLibraryGeometries

function ParseLibraryGeometries (library_geometries) {
  
  var outGeometries = []
  var internalGeometries = []
  var inGeometries = library_geometries[0].geometry
  
  // split multiple connectivity lists into multiple geometries
  inGeometries.forEach(function (library_geometry) {
    var geometryMesh = library_geometry.mesh[0]
    var indexList = geometryMesh.polylist || geometryMesh.triangles || null
    if (!indexList) {
      console.error("Geometry must contain either 'polylist' or 'triangles' object.")
      return false
    }

    indexList.forEach(function (subList) {
      var newGeometry = JSON.parse(JSON.stringify(library_geometry));
      var internalIndexList = newGeometry.mesh[0].polylist || newGeometry.mesh[0].triangles

      //TODO: Make compatible with polylist
      newGeometry.mesh[0].triangles = [subList]

      internalGeometries.push(newGeometry)
    })
  })

  internalGeometries.forEach(function (library_geometry) {
    var geometryMesh = library_geometry.mesh[0]
    var source = geometryMesh.source

    var indexList = geometryMesh.polylist || geometryMesh.triangles || null

    // Get index list offsets for vertex data - vertex, normal, texcoord
    var offsets = {}
    var maxOffset = 0
    indexList[0].input.forEach(function (input) {
      var offset = parseInt(input.$.offset)
      offsets[input.$.semantic.toLowerCase()] = offset
      maxOffset = Math.max(maxOffset, offset)
    })

    /* Vertex Positions, UVs, Normals */
    var polylistIndices = indexList[0].p[0].trim().split(' ')

    var vertexNormalIndices = []
    var vertexPositionIndices = []
    var vertexUVIndices = []
    for (var i = 0; i < polylistIndices.length; i += 1 + maxOffset) {
      vertexPositionIndices.push(Number(polylistIndices[i + offsets.vertex]))
      vertexNormalIndices.push(Number(polylistIndices[i + offsets.normal]))
      vertexUVIndices.push(Number(polylistIndices[i + offsets.texcoord]))
    }

    var vertexPositions = source[0].float_array[0]._.split(' ').map(Number)
    var vertexNormals = source[1].float_array[0]._.split(' ').map(Number)
    var vertexUVs = []
    // TODO: use input, semantics, source, offset, etc
    if (source[2]) {
      vertexUVs = source[2].float_array[0]._.split(' ').map(Number)
    }
    /* End Vertex Positions, UVs, Normals */

    outGeometries.push ({
      id: library_geometry.$.id,
      vertexPositions: vertexPositions,
      vertexNormals: vertexNormals,
      vertexUVs: vertexUVs,
      vertexNormalIndices: vertexNormalIndices,
      vertexPositionIndices: vertexPositionIndices,
      vertexUVIndices: vertexUVIndices
    })
  })

  return outGeometries
}
