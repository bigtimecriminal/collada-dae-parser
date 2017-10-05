var MultipleMeshError = require('./multiple-mesh-error-message.js')

module.exports = ParseLibraryGeometries

function ParseLibraryGeometries (library_geometries) {
  
  var geometries = [];
  library_geometries[0].geometry.forEach( function (library_geometry) {
    var geometryMesh = library_geometry.mesh[0]
    var source = geometryMesh.source

    var indexList = geometryMesh.polylist || geometryMesh.triangles || null
    if (!indexList) {
      console.error("Geometry must contain either 'polylist' or 'triangles' object.")
      return false
    }

    // Get index list offsets for vertex data - vertex, normal, texcoord
    var offsets = {}
    var maxOffset = 0
    indexList[0].input.forEach(function (input) {
      var offset = parseInt(input.$.offset)
      offsets[input.$.semantic.toLowerCase()] = offset
      maxOffset = Math.max(maxOffset, offset)
    })

    /* Vertex Positions, UVs, Normals */
    var polylistIndices = indexList[0].p[0].split(' ')

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

    geometries.push ({
      id: library_geometry.$.id,
      vertexPositions: vertexPositions,
      vertexNormals: vertexNormals,
      vertexUVs: vertexUVs,
      vertexNormalIndices: vertexNormalIndices,
      vertexPositionIndices: vertexPositionIndices,
      vertexUVIndices: vertexUVIndices
    });
  })

  return geometries;
}
