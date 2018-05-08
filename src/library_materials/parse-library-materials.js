module.exports = ParseLibraryMaterials
function ParseLibraryMaterials (library_materials, colladaXML) {
    var outMaterials = {}
    var materialEffectReferences = {}

//    library_materials[0].material.forEach( function (d) { 
//        materialEffectReferences[d.$.id]= d.instance_effect[0].$.url.slice(1)
//    })


    var daeIterator = colladaXML.evaluate('/COLLADA/library_materials/material', colladaXML, null, XPathResult.ANY_TYPE, null );
    var daeElement = daeIterator.iterateNext();
    while(daeElement) {
      var id = daeElement.getAttribute('id');
      var url = daeElement.firstElementChild.getAttribute('url').slice(1);
      materialEffectReferences[id] = url;
      var daeElement = daeIterator.iterateNext();
    }

    outMaterials.materialEffectReferences = materialEffectReferences;

    return outMaterials;
}
