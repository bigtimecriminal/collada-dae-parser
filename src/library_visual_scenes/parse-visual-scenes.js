module.exports = ParseVisualScenes

function ParseVisualScenes (nsResolver, colladaXML) {
  var nodes = []
  var daeIterator = colladaXML.evaluate('/d:COLLADA/d:library_visual_scenes/d:visual_scene//d:node', colladaXML, nsResolver, XPathResult.ANY_TYPE, null)
  var daeElement = daeIterator.iterateNext()
  while (daeElement) {
    if (daeElement.getElementsByTagName('instance_geometry').length === 0) {
      daeElement = daeIterator.iterateNext()
      continue
    }

    var node = {}
    node.id = daeElement.getAttribute('id')
    node.parent = daeElement.parentElement ? daeElement.parentElement.getAttribute('id') : null
    node.matrix = daeElement.getElementsByTagName('matrix')[0].innerHTML.trim().split(' ').map(parseFloat)
    var potentialGeometry = daeElement.getElementsByTagName('instance_geometry')[0]
    // don't steal your child's geometry
    if(potentialGeometry.parentNode.getAttribute('id') === node.id)
    {
        node.geometry = potentialGeometry.getAttribute('url').slice(1)
    }
    node.materialNameReferences = {}

    Array.from(daeElement.getElementsByTagName('instance_material')).forEach(function (d) {
      node.materialNameReferences[d.getAttribute('symbol')] = d.getAttribute('target').slice(1)
    })

    nodes.push(node)
    daeElement = daeIterator.iterateNext()
  }

  return {
    nodes: nodes
  }
}
