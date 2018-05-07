module.exports = ParseLibraryGeometries

function ParseLibraryGeometries (library_geometries, xmlDae) {
  
  var outGeometries = []
  var internalGeometries = []
  var inGeometries = library_geometries[0].geometry

  var geomNames = []
  var daeIterator = colladaXML.evaluate('/COLLADA/library_geometries/geometry', colladaXML, null, XPathResult.ANY_TYPE, null );
  var geomElement = daeIterator.iterateNext();  
  while (geomElement) {
    geomNames.push(geomElement.getAttribute('id'));
    geomElement = daeIterator.iterateNext();  
  }
  console.log(geomNames);


  
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

  internalGeometries.forEach(function (library_geometry, i) {
    var geometryMesh = library_geometry.mesh[0]
    var source = geometryMesh.source

    var indexList = geometryMesh.polylist || geometryMesh.triangles || null

    // Get index list offsets for vertex data - vertex, normal, texcoord
    var offsets = {}
    var maxOffset = 0
    
    console.log(geomNames);
    var daeIterator = colladaXML.evaluate('/COLLADA/library_geometries/*[@id="'+geomNames[i]+'"]/mesh/triangles/input', colladaXML, null, XPathResult.ANY_TYPE, null );
    var daeInput = daeIterator.iterateNext();
    while (daeInput) {
      var offset = parseInt(daeInput.getAttribute('offset'))
      offsets[daeInput.getAttribute('semantic').toLowerCase()] = offset
      maxOffset = Math.max(maxOffset, offset)
      daeInput = daeIterator.iterateNext();
    }

//    indexList[0].input.forEach(function (input) {
//      var offset = parseInt(input.$.offset)
//      offsets[input.$.semantic.toLowerCase()] = offset
//      maxOffset = Math.max(maxOffset, offset)
//    })

    /* Vertex Positions, UVs, Normals */
    var polylistIndices = indexList[0].p[0].trim().split(' ')

    var vertexNormalIndices = []
    var vertexPositionIndices = []
    var vertexTangentIndices = []
    var vertexBitangentIndices = []
    var vertexUVIndices = []
    for (var i = 0; i < polylistIndices.length; i += 1 + maxOffset) {
      vertexPositionIndices.push(Number(polylistIndices[i + offsets.vertex]))
      vertexNormalIndices.push(Number(polylistIndices[i + offsets.normal]))
      vertexTangentIndices.push(Number(polylistIndices[i + offsets.textangent]))
      vertexBitangentIndices.push(Number(polylistIndices[i + offsets.texbinormal]))
      vertexUVIndices.push(Number(polylistIndices[i + offsets.texcoord]))
    }

    vertexPropertyBuffers = {}
    source.forEach( function (d) { vertexPropertyBuffers[d.$.id.split('-').pop()] = d.float_array[0]._.split(' ').map(Number); });

    var vertexPositions = vertexPropertyBuffers["positions"];
    var vertexNormals = vertexPropertyBuffers["normals"];
    var vertexTangents = vertexPropertyBuffers["tangents"];
    var vertexBitangents = vertexPropertyBuffers["bitangents"];
    var vertexUVs = []
    //texcoord set 0;
    if ( vertexPropertyBuffers["0"] )  {
      vertexUVs = vertexPropertyBuffers["0"];
    }

    outGeometries.push ({
      id: library_geometry.$.id,
      material: library_geometry.mesh[0].triangles[0].$.material,
      vertexPositions: vertexPositions,
      vertexNormals: vertexNormals,
      vertexTangents: vertexTangents,
      vertexBitangents: vertexBitangents,
      vertexUVs: vertexUVs,
      vertexNormalIndices: vertexNormalIndices,
      vertexPositionIndices: vertexPositionIndices,
      vertexTangentIndices: vertexTangentIndices,
      vertexBitangentIndices: vertexBitangentIndices,
      vertexUVIndices: vertexUVIndices
    })

   i++;
  })

  return outGeometries
}
