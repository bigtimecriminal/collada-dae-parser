module.exports = ParseLibraryGeometries

function ParseLibraryGeometries (nsResolver, colladaXML) {
  var outGeometries = []
  var geomNames = []

  var daeIterator = colladaXML.evaluate('/d:COLLADA/d:library_geometries/d:geometry', colladaXML, nsResolver, XPathResult.ANY_TYPE, null)
  var geomElement = daeIterator.iterateNext()
  while (geomElement) {
    if (geomElement.getElementsByTagName('triangles').length > 0) {
      geomNames.push(geomElement.getAttribute('id'))
    }
    geomElement = daeIterator.iterateNext()
  }

  geomNames.forEach(function (geomName) {
    var meshConnectivityLists = []
    var materials = []

    var daeIterator = colladaXML.evaluate('/d:COLLADA/d:library_geometries/d:*[@id="' + geomName + '"]/d:mesh/d:triangles', colladaXML, nsResolver, XPathResult.ANY_TYPE, null)
    var daeElement = daeIterator.iterateNext()
    while (daeElement) {
      meshConnectivityLists.push(daeElement.getElementsByTagName('p')[0].innerHTML.trim().split(' ').map(function (d) { return parseInt(d) }))
      var material = daeElement.getAttribute('material')
      if (material) {
        materials.push(material)
      }
      daeElement = daeIterator.iterateNext()
    }

    var vertexPropertyBuffers = {}
    daeIterator = colladaXML.evaluate('/d:COLLADA/d:library_geometries/d:*[@id="' + geomName + '"]/d:mesh/d:source', colladaXML, nsResolver, XPathResult.ANY, null)
    daeElement = daeIterator.iterateNext()
    while (daeElement) {
      var id = daeElement.getAttribute('id').split('-').pop()
      var value = daeElement.firstElementChild.innerHTML.trim().split(' ').map(Number)
      vertexPropertyBuffers[id] = value
      daeElement = daeIterator.iterateNext()
    }

    var vertexPositions = vertexPropertyBuffers['positions']
    var vertexNormals = vertexPropertyBuffers['normals']
    var vertexTangents = vertexPropertyBuffers['tangents']
    var vertexBitangents = vertexPropertyBuffers['bitangents']
    var vertexUVs = []
    // texcoord set 0
    if (vertexPropertyBuffers['0']) {
      vertexUVs = vertexPropertyBuffers['0']
    }

    outGeometries.push({
      id: geomName,
      materials: materials,
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
