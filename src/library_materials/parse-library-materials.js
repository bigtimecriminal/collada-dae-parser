module.exports = ParseLibraryMaterials
function ParseLibraryMaterials (library_materials, colladaXML) {
    var outMaterials = {}
    var materialEffectReferences = {}

    var daeIterator = colladaXML.evaluate('/d:COLLADA/d:library_materials/d:material', colladaXML, nsResolver, XPathResult.ANY_TYPE, null );
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
