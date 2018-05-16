module.exports = ParseLibraryGeometries

function ParseLibraryGeometries (xmlDae) {
  
  var outGeometries = []
//  var internalGeometries = []
//  var inGeometries = library_geometries[0].geometry

  var geomNames = []
  var daeIterator = colladaXML.evaluate('/COLLADA/library_geometries/geometry', colladaXML, null, XPathResult.ANY_TYPE, null );
  var geomElement = daeIterator.iterateNext();  
  while (geomElement) {
    geomNames.push(geomElement.getAttribute('id'));
    geomElement = daeIterator.iterateNext();  
  }
  
  // TODO: Bring this back when more comfortable with XML
  // split multiple connectivity lists into multiple geometries
//  inGeometries.forEach(function (library_geometry) {
//    var geometryMesh = library_geometry.mesh[0]
//    var indexList = geometryMesh.polylist || geometryMesh.triangles || null
//    if (!indexList) {
//      console.error("Geometry must contain either 'polylist' or 'triangles' object.")
//      return false
//    }
//
//    indexList.forEach(function (subList) {
//      var newGeometry = JSON.parse(JSON.stringify(library_geometry));
//      var internalIndexList = newGeometry.mesh[0].polylist || newGeometry.mesh[0].triangles
//
//      //TODO: Make compatible with polylist
//      newGeometry.mesh[0].triangles = [subList]
//
//      internalGeometries.push(newGeometry)
//    })
//  })

  geomNames.forEach(function (geomName) {
    // Get index list offsets for vertex data - vertex, normal, texcoord
    var offsets = {}
    var maxOffset = 0
    
    var daeIterator = colladaXML.evaluate('/COLLADA/library_geometries/*[@id="'+geomName+'"]/mesh/triangles/input', colladaXML, null, XPathResult.ANY_TYPE, null );
    var daeInput = daeIterator.iterateNext();
    while (daeInput) {
      var offset = parseInt(daeInput.getAttribute('offset'))
      offsets[daeInput.getAttribute('semantic').toLowerCase()] = offset
      maxOffset = Math.max(maxOffset, offset)
      daeInput = daeIterator.iterateNext();
    }

    /* Vertex Positions, UVs, Normals */
    var polylistIndices = colladaXML.evaluate('/COLLADA/library_geometries/*[@id="'+geomName+'"]/mesh/triangles/p', colladaXML, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null ).singleNodeValue.innerHTML.trim().split(' ');

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
    var daeIterator = colladaXML.evaluate('/COLLADA/library_geometries/*[@id="'+geomName+'"]/mesh/source', colladaXML, null, XPathResult.ANY, null ); 
    var daeElement = daeIterator.iterateNext();
    while (daeElement) {
      var id = daeElement.getAttribute('id').split('-').pop();
      var value = daeElement.firstElementChild.innerHTML.trim().split(' ').map(Number);
      vertexPropertyBuffers[id] = value;
      daeElement = daeIterator.iterateNext();
    }


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
      id: geomName,
      material: colladaXML.evaluate('/COLLADA/library_geometries/*[@id="'+geomName+'"]/mesh/triangles', colladaXML, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null ).singleNodeValue.getAttribute('material'),
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
