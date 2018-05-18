module.exports = ParseLibraryGeometries

function ParseLibraryGeometries (library_geometries, colladaXML) {
  
  var outGeometries = []
//  var internalGeometries = []
//  var inGeometries = library_geometries[0].geometry

  var geomNames = []
  var daeIterator = colladaXML.evaluate('/d:COLLADA/d:library_geometries/d:geometry', colladaXML, nsResolver, XPathResult.ANY_TYPE, null );
  var geomElement = daeIterator.iterateNext();  
  while (geomElement) {
    if (geomElement.getElementsByTagName('triangles').length > 0)
    {
      geomNames.push(geomElement.getAttribute('id'));
    }
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
//

  geomNames.forEach(function (geomName) {
    // I don't think this is a thing anymore - anton
    // Get index list offsets for vertex data - vertex, normal, texcoord
//    var offsets = {}
//    var maxOffset = 0
//    
//    var daeIterator = colladaXML.evaluate('/COLLADA/library_geometries/*[@id="'+geomName+'"]/mesh/triangles/input', colladaXML, null, XPathResult.ANY_TYPE, null );
//    var daeInput = daeIterator.iterateNext();
//    while (daeInput) {
//      var offset = parseInt(daeInput.getAttribute('offset'))
//      offsets[daeInput.getAttribute('semantic').toLowerCase()] = offset
//      maxOffset = Math.max(maxOffset, offset)
//      daeInput = daeIterator.iterateNext();
//    }

    /* Vertex Positions, UVs, Normals */
    var meshConnectivityLists = []
    var daeIterator = colladaXML.evaluate('/d:COLLADA/d:library_geometries/d:*[@id="'+geomName+'"]/d:mesh/d:triangles', colladaXML, nsResolver, XPathResult.ANY_TYPE, null )
    var daeElement = daeIterator.iterateNext();
    while (daeElement) {
      meshConnectivityLists.push(daeElement.getElementsByTagName('p')[0].innerHTML.trim().split(' ').map(function (d) { return parseInt(d);}));
      var daeElement = daeIterator.iterateNext();
    }

    vertexPropertyBuffers = {}
    var daeIterator = colladaXML.evaluate('/d:COLLADA/d:library_geometries/d:*[@id="'+geomName+'"]/d:mesh/d:source', colladaXML, nsResolver, XPathResult.ANY, null ); 
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
      material: colladaXML.evaluate('/d:COLLADA/d:library_geometries/d:*[@id="'+geomName+'"]/d:mesh/d:triangles', colladaXML, nsResolver, XPathResult.FIRST_ORDERED_NODE_TYPE, null ).singleNodeValue.getAttribute('material'),
      vertexPositions: vertexPositions,
      vertexNormals: vertexNormals,
      vertexTangents: vertexTangents,
      vertexBitangents: vertexBitangents,
      vertexUVs: vertexUVs,
      meshConnectivityLists: meshConnectivityLists
    })
  })

  return outGeometries
}
