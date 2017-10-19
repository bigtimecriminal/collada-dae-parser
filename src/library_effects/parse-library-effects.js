module.exports = ParseLibraryEffects
function ParseLibraryEffects (library_effects) {
    var outEffects = {}

    textureIdReferences = {};
    effectIdToBlinnProperties = {};

    library_effects[0].effect.forEach( function(d) {
        textureIdReferences[d.$.id]= d.profile_COMMON[0].newparam[0].surface[0].init_from[0]
        effectIdToBlinnProperties[d.$.id] = {}
        effectIdToBlinnProperties[d.$.id]["ambient"] = d.profile_COMMON[0].technique[0].blinn[0]["ambient"][0].color[0].trim().split(" ").map( function(d) { return parseFloat(d);});
        effectIdToBlinnProperties[d.$.id]["emission"] = d.profile_COMMON[0].technique[0].blinn[0]["emission"][0].color[0].trim().split(" ").map( function(d) { return parseFloat(d);});
        effectIdToBlinnProperties[d.$.id]["reflective"] = d.profile_COMMON[0].technique[0].blinn[0]["reflective"][0].color[0].trim().split(" ").map( function(d) { return parseFloat(d);});
        effectIdToBlinnProperties[d.$.id]["shininess"] = parseFloat(d.profile_COMMON[0].technique[0].blinn[0]["shininess"][0].float[0])
        effectIdToBlinnProperties[d.$.id]["index_of_refraction"] = parseFloat(d.profile_COMMON[0].technique[0].blinn[0]["index_of_refraction"][0].float[0])
        if (d.profile_COMMON[0].technique[0].blinn[0]["specular"][0].color){
            effectIdToBlinnProperties[d.$.id]["specular"] = d.profile_COMMON[0].technique[0].blinn[0]["specular"][0].color[0].trim().split(" ").map( function(d) { return parseFloat(d);})
        }
        else {
            //ANTON: this is temporary - instead should take color from scec map hung on the same member;
            effectIdToBlinnProperties[d.$.id]["specular"] = [1.0,1.0,1.0,1.0]
        }
    })
    outEffects.textureIdReferences = textureIdReferences;
    outEffects.effectIdToBlinnProperties = effectIdToBlinnProperties;

    return outEffects;
}
