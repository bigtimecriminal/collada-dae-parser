module.exports = ParseLibraryMaterials
function ParseLibraryMaterials (library_materials) {
    var outMaterials = {}
    var materialEffectReferences = {}

    library_materials[0].material.forEach( function (d) { 
        materialEffectReferences[d.$.id]= d.instance_effect[0].$.url.slice(1)
    })
    outMaterials.materialEffectReferences = materialEffectReferences;

    return outMaterials;
}
