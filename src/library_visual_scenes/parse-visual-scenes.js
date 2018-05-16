module.exports = ParseVisualScenes

// TODO: Handle child joints. Maybe depth first traversal?
function ParseVisualScenes (library_visual_scenes, colladaXML) {
  var visualScene = library_visual_scenes[0].visual_scene[0]
  var parsedJoints = {}

  // Some .dae files will export a shrunken model. Here's how to scale it
  var armatureScale = null
  visualScene.node.forEach(function (node) {
    // node.node is the location of all top level parent nodes
    if (node.node) {
      if (node.scale && node.scale.length > 0) {
        armatureScale = node.scale[0]._.split(' ').map(Number)
      }
      parsedJoints = parseJoints(node.node)
    }
    /*
    // Check for an instance controller. If one exists we have a skeleton
    if (node.instance_controller) {
    // TODO: Do I need to remove the leading `#` ?
    joints = node.instance_controller[0].skeleton
    }
    */
  })
  
  nodes = [];
  var daeIterator = colladaXML.evaluate('/COLLADA/library_visual_scenes/visual_scene//node', colladaXML, null, XPathResult.ANY_TYPE, null );
  var daeElement = daeIterator.iterateNext();  
  while (daeElement) {
    if(daeElement.getElementsByTagName('instance_geometry').length === 0)
    {
      var daeElement = daeIterator.iterateNext();  
      continue;
    }

    var node = {}
    node.id = daeElement.getAttribute("id")
    node.parent = daeElement.parentElem ? daeElement.parentElem.getAttribute("id") : null
    node.matrix = daeElement.getElementsByTagName('matrix')[0].innerHTML.trim().split(' ').map(parseFloat)
    node.geometry = daeElement.getElementsByTagName('instance_geometry')[0].getAttribute('url').slice(1);
    node.materialNameReferences = {}

    Array.from(daeElement.getElementsByTagName('instance_material')).forEach( (d) => {
     node.materialNameReferences[d.getAttribute('symbol')] = d.getAttribute('target').slice(1)
    });

 //   console.log(node);

    nodes.push(node);
    var daeElement = daeIterator.iterateNext();  
  }

  return {
//    jointParents: parsedJoints,
    armatureScale: armatureScale,
    nodes: visualScene.node,
    newNodes: nodes
  }
}


// Recursively parse child joints
function parseJoints (node, parentJointName, accumulator) {
  accumulator = accumulator || {}
  node.forEach(function (joint) {
    accumulator[joint.$.sid] = accumulator[joint.$.sid] || {}
    // The bind pose of the matrix. We don't make use of this right now, but you would
    // use it to render a model in bind pose. Right now we only render the model based on
    // their animated joint positions, so we ignore this bind pose data
    accumulator[joint.$.sid].jointMatrix = joint.matrix[0]._.split(' ').map(Number)
    accumulator[joint.$.sid].parent = parentJointName
    if (joint.node) {
      parseJoints(joint.node, joint.$.sid, accumulator)
    }
  })

  return accumulator
}
