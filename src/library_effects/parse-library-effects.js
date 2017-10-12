module.exports = ParseLibraryEffects
function ParseLibraryEffects (library_effects) {
    var outEffects = {}

    textureIdReferences = {};
    library_effects[0].effect.forEach( function(d) {
        textureIdReferences[d.$.id]= d.profile_COMMON[0].newparam[0].surface[0].init_from[0]
    })
    outEffects.textureIdReferences = textureIdReferences;

    return outEffects;
}
