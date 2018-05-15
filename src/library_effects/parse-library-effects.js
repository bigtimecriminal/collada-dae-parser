module.exports = ParseLibraryEffects
function ParseLibraryEffects (library_effects, colladaXML) {
    var outEffects = {}

    textureIdReferences = {};
    effectIdToBlinnProperties = {};

    var effectIds = []
    var daeIterator = colladaXML.evaluate('/COLLADA/library_effects/effect', colladaXML, null, XPathResult.ANY_TYPE, null );
    var daeElement = daeIterator.iterateNext();  
    while (daeElement) {
      effectIds.push(daeElement.getAttribute('id'));
      daeElement = daeIterator.iterateNext();  
    }
    console.log(effectIds);

    library_effects[0].effect.forEach( function(d, i) {

        textureIdReferences[effectIds[i]] = {}

        //bump texture finding
        var bumpTechnique = colladaXML.evaluate('/COLLADA/library_effects/effect[@id="'+effectIds[i]+'"]/profile_COMMON/technique/extra/technique[1]/bump', colladaXML, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null ).singleNodeValue
        if (bumpTechnique) {
            var bumpTextureId = bumpTechnique.firstElementChild.getAttribute('texture');
            var bumpEffect = colladaXML.evaluate('/COLLADA/library_effects/effect[@id="'+effectIds[i]+'"]/profile_COMMON/newparam[@sid="'+bumpTextureId+'"]' , colladaXML, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null ).singleNodeValue;
            var bumpSurfaceId = bumpEffect.firstElementChild.firstElementChild.innerHTML;
            var bumpSurface = colladaXML.evaluate('/COLLADA/library_effects/effect[@id="'+effectIds[i]+'"]/profile_COMMON/newparam[@sid="'+bumpSurfaceId+'"]' , colladaXML, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null ).singleNodeValue;
            textureIdReferences[effectIds[i]]["bump"] = bumpSurface.firstElementChild.firstElementChild.innerHTML;
        }
        

        //spec texture finding
//        var specularTechnique = colladaXML.evaluate('/COLLADA/library_effects/effect[@id="'+effectIds[i]+'"]/profile_COMMON/technique/extra/technique[1]/bump', colladaXML, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null ).singleNodeValue
//        if(specularTechnique)
//        {
//            var specularTextureId = d.profile_COMMON[0].technique[0].blinn[0]["specular"][0]["texture"][0].$["texture"]
//            var specularEffect = d.profile_COMMON[0].newparam.find( function (d) { return (d.$.sid === specularTextureId); });
//            var specularSurfaceId = specularEffect["sampler2D"][0].source[0]
//            var specularSurface = d.profile_COMMON[0].newparam.find( function (d) { return (d.$.sid === specularSurfaceId); });
//            textureIdReferences[d.$.id]["specular"] = specularSurface.surface[0].init_from[0]
//        }

        //diffuse texture finding
        var diffuseTechnique = colladaXML.evaluate('/COLLADA/library_effects/effect[@id="'+effectIds[i]+'"]/profile_COMMON/technique/blinn/diffuse', colladaXML, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null ).singleNodeValue
        if(diffuseTechnique) {
            var diffuseTextureId = diffuseTechnique.firstElementChild.getAttribute('texture');
            if (diffuseTextureId != null) 
            {
              var diffuseEffect = colladaXML.evaluate('/COLLADA/library_effects/effect[@id="'+effectIds[i]+'"]/profile_COMMON/newparam[@sid="'+diffuseTextureId+'"]' , colladaXML, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null ).singleNodeValue;
              var diffuseSurfaceId = diffuseEffect.firstElementChild.firstElementChild.innerHTML;
              var diffuseSurface = colladaXML.evaluate('/COLLADA/library_effects/effect[@id="'+effectIds[i]+'"]/profile_COMMON/newparam[@sid="'+diffuseSurfaceId+'"]' , colladaXML, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null ).singleNodeValue;
              textureIdReferences[effectIds[i]]["diffuse"] = diffuseSurface.firstElementChild.firstElementChild.innerHTML;
            }

            console.log("end of diffuse", diffuseTextureId, diffuseEffect, diffuseSurfaceId, diffuseSurface, textureIdReferences[d.$.id]["diffuse"]);
        }
        
        //reflective texture finding
//        if(d.profile_COMMON[0].technique[0].blinn[0]["reflective"][0]["texture"]) {
//            var reflectiveTextureId = d.profile_COMMON[0].technique[0].blinn[0]["reflective"][0]["texture"][0].$["texture"]
//            var reflectiveEffect = d.profile_COMMON[0].newparam.find( function (d) { return (d.$.sid === reflectiveTextureId); });
//            var reflectiveSurfaceId = reflectiveEffect["sampler2D"][0].source[0]
//            var reflectiveSurface = d.profile_COMMON[0].newparam.find( function (d) { return (d.$.sid === reflectiveSurfaceId); });
//            textureIdReferences[d.$.id]["reflective"] = reflectiveSurface.surface[0].init_from[0]
//        }

        //property finding
        effectIdToBlinnProperties[d.$.id] = {}
        effectIdToBlinnProperties[d.$.id]["ambient"] = d.profile_COMMON[0].technique[0].blinn[0]["ambient"][0].color[0].trim().split(" ").map( function(d) { return parseFloat(d);});
        effectIdToBlinnProperties[d.$.id]["emission"] = d.profile_COMMON[0].technique[0].blinn[0]["emission"][0].color[0].trim().split(" ").map( function(d) { return parseFloat(d);});
        //effectIdToBlinnProperties[d.$.id]["reflective"] = d.profile_COMMON[0].technique[0].blinn[0]["reflective"][0].color[0].trim().split(" ").map( function(d) { return parseFloat(d);});
        effectIdToBlinnProperties[d.$.id]["shininess"] = parseFloat(d.profile_COMMON[0].technique[0].blinn[0]["shininess"][0].float[0])
        effectIdToBlinnProperties[d.$.id]["index_of_refraction"] = parseFloat(d.profile_COMMON[0].technique[0].blinn[0]["index_of_refraction"][0].float[0])
        if (d.profile_COMMON[0].technique[0].blinn[0]["specular"][0].color){
            effectIdToBlinnProperties[d.$.id]["specular"] = d.profile_COMMON[0].technique[0].blinn[0]["specular"][0].color[0].trim().split(" ").map( function(d) { return parseFloat(d);})
        }
        else {
            //ANTON: this is temporary - instead should take color from scec map hung on the same member;
            effectIdToBlinnProperties[d.$.id]["specular"] = [1.0,1.0,1.0,1.0]
        }
        if (d.profile_COMMON[0].technique[0].blinn[0]["reflective"][0].color){
            effectIdToBlinnProperties[d.$.id]["reflective"] = d.profile_COMMON[0].technique[0].blinn[0]["reflective"][0].color[0].trim().split(" ").map( function(d) { return parseFloat(d);})
        }
        else {
            //ANTON: also temporary, see above comment
            effectIdToBlinnProperties[d.$.id]["reflective"] = [1.0,1.0,1.0,1.0]
        }
        if (d.profile_COMMON[0].technique[0].blinn[0]["diffuse"][0].color){
            effectIdToBlinnProperties[d.$.id]["diffuse"] = d.profile_COMMON[0].technique[0].blinn[0]["diffuse"][0].color[0].trim().split(" ").map( function(d) { return parseFloat(d);})
        }
        else {
            //ANTON: also temporary, see above comment
            effectIdToBlinnProperties[d.$.id]["diffuse"] = [1.0,1.0,1.0,1.0]
        }
    })
    outEffects.textureIdReferences = textureIdReferences;
    outEffects.effectIdToBlinnProperties = effectIdToBlinnProperties;

    return outEffects;
}
