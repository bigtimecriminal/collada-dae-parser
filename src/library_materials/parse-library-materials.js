module.exports = ParseLibraryMaterials
function ParseLibraryMaterials (library_materials, colladaXML) {
    var outMaterials = {}
    var materialEffectReferences = {}

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
