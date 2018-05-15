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

    effectIds.forEach( function(effectId) {

        textureIdReferences[effectId] = {}

        //bump texture finding
        var bumpTechnique = colladaXML.evaluate('/COLLADA/library_effects/effect[@id="'+effectId+'"]/profile_COMMON/technique/extra/technique[1]/bump', colladaXML, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null ).singleNodeValue
        if (bumpTechnique) {
            var bumpTextureId = bumpTechnique.firstElementChild.getAttribute('texture');
            var bumpEffect = colladaXML.evaluate('/COLLADA/library_effects/effect[@id="'+effectId+'"]/profile_COMMON/newparam[@sid="'+bumpTextureId+'"]' , colladaXML, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null ).singleNodeValue;
            var bumpSurfaceId = bumpEffect.firstElementChild.firstElementChild.innerHTML;
            var bumpSurface = colladaXML.evaluate('/COLLADA/library_effects/effect[@id="'+effectId+'"]/profile_COMMON/newparam[@sid="'+bumpSurfaceId+'"]' , colladaXML, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null ).singleNodeValue;
            textureIdReferences[effectId]["bump"] = bumpSurface.firstElementChild.firstElementChild.innerHTML;
        }
        
        //commented out untill can find model with these textures
        //spec texture finding
//        var specularTechnique = colladaXML.evaluate('/COLLADA/library_effects/effect[@id="'+effectIds[i]+'"]/profile_COMMON/technique/extra/technique[1]/bump', colladaXML, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null ).singleNodeValue
//        if(specularTechnique)
//        {
//            var specularTextureId = d.profile_COMMON[0].technique[0].blinn[0]["specular"][0]["texture"][0].$["texture"]
//            var specularEffect = d.profile_COMMON[0].newparam.find( function (d) { return (d.$.sid === specularTextureId); });
//            var specularSurfaceId = specularEffect["sampler2D"][0].source[0]
//            var specularSurface = d.profile_COMMON[0].newparam.find( function (d) { return (d.$.sid === specularSurfaceId); });
//            textureIdReferences[effectIds[i]]["specular"] = specularSurface.surface[0].init_from[0]
//        }

        //diffuse texture finding
        var diffuseTechnique = colladaXML.evaluate('/COLLADA/library_effects/effect[@id="'+effectId+'"]/profile_COMMON/technique/blinn/diffuse', colladaXML, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null ).singleNodeValue
        if(diffuseTechnique) {
            var diffuseTextureId = diffuseTechnique.firstElementChild.getAttribute('texture');
            if (diffuseTextureId != null) 
            {
              var diffuseEffect = colladaXML.evaluate('/COLLADA/library_effects/effect[@id="'+effectId+'"]/profile_COMMON/newparam[@sid="'+diffuseTextureId+'"]' , colladaXML, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null ).singleNodeValue;
              var diffuseSurfaceId = diffuseEffect.firstElementChild.firstElementChild.innerHTML;
              var diffuseSurface = colladaXML.evaluate('/COLLADA/library_effects/effect[@id="'+effectId+'"]/profile_COMMON/newparam[@sid="'+diffuseSurfaceId+'"]' , colladaXML, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null ).singleNodeValue;
              textureIdReferences[effectId]["diffuse"] = diffuseSurface.firstElementChild.firstElementChild.innerHTML;
            }
        }
        
        //reflective texture finding
        var reflectiveTechnique = colladaXML.evaluate('/COLLADA/library_effects/effect[@id="'+effectId+'"]/profile_COMMON/technique/blinn/reflective', colladaXML, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null ).singleNodeValue
        if(reflectiveTechnique) {
            var reflectiveTextureId = reflectiveTechnique.firstElementChild.getAttribute('texture');
            if (reflectiveTextureId != null) 
            {
                var reflectiveEffect = colladaXML.evaluate('/COLLADA/library_effects/effect[@id="'+effectId+'"]/profile_COMMON/newparam[@sid="'+reflectiveTextureId+'"]' , colladaXML, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null ).singleNodeValue;
                var reflectiveSurfaceId = reflectiveEffect.firstElementChild.firstElementChild.innerHTML;
                var reflectiveSurface = colladaXML.evaluate('/COLLADA/library_effects/effect[@id="'+effectId+'"]/profile_COMMON/newparam[@sid="'+reflectiveSurfaceId+'"]' , colladaXML, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null ).singleNodeValue;
                textureIdReferences[effectId]["reflective"] = reflectiveSurface.firstElementChild.firstElementChild.innerHTML;
            }
        }

        //property finding
        effectIdToBlinnProperties[effectId] = {}
        effectIdToBlinnProperties[effectId]["ambient"] = colladaXML.evaluate('/COLLADA/library_effects/effect[@id="'+effectId+'"]/profile_COMMON/technique/blinn/ambient/color', colladaXML, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null ).singleNodeValue.innerHTML.trim().split(' ').map(parseFloat)
        effectIdToBlinnProperties[effectId]["emission"] = colladaXML.evaluate('/COLLADA/library_effects/effect[@id="'+effectId+'"]/profile_COMMON/technique/blinn/emission/color', colladaXML, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null ).singleNodeValue.innerHTML.trim().split(' ').map(parseFloat)
        effectIdToBlinnProperties[effectId]["shininess"] = parseFloat(colladaXML.evaluate('/COLLADA/library_effects/effect[@id="'+effectId+'"]/profile_COMMON/technique/blinn/shininess/float', colladaXML, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null ).singleNodeValue.innerHTML)
        effectIdToBlinnProperties[effectId]["index_of_refraction"] = parseFloat(colladaXML.evaluate('/COLLADA/library_effects/effect[@id="'+effectId+'"]/profile_COMMON/technique/blinn/index_of_refraction/float', colladaXML, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null ).singleNodeValue.innerHTML)

        var specularColor = colladaXML.evaluate('/COLLADA/library_effects/effect[@id="'+effectId+'"]/profile_COMMON/technique/blinn/specular/color', colladaXML, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null ).singleNodeValue
        if (specularColor){
            effectIdToBlinnProperties[effectId]["specular"] = specularColor.innerHTML.trim().split(' ').map(parseFloat);
        }
        else {
            //ANTON: this is temporary - instead should take color from scec map hung on the same member;
            effectIdToBlinnProperties[effectId]["specular"] = [1.0,1.0,1.0,1.0]
        }

        var reflectiveColor = colladaXML.evaluate('/COLLADA/library_effects/effect[@id="'+effectId+'"]/profile_COMMON/technique/blinn/reflective/color', colladaXML, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null ).singleNodeValue
        if (reflectiveColor){
            effectIdToBlinnProperties[effectId]["reflective"] = reflectiveColor.innerHTML.trim().split(' ').map(parseFloat);
        }
        else {
            //ANTON: also temporary, see above comment
            effectIdToBlinnProperties[effectId]["reflective"] = [1.0,1.0,1.0,1.0]
        }

        var diffuseColor = colladaXML.evaluate('/COLLADA/library_effects/effect[@id="'+effectId+'"]/profile_COMMON/technique/blinn/diffuse/color', colladaXML, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null ).singleNodeValue
        if (diffuseColor){
            effectIdToBlinnProperties[effectId]["diffuse"] = diffuseColor.innerHTML.trim().split(' ').map(parseFloat);
        }
        else {
            //ANTON: also temporary, see above comment
            effectIdToBlinnProperties[effectId]["diffuse"] = [1.0,1.0,1.0,1.0]
        }

    })
    outEffects.textureIdReferences = textureIdReferences;
    outEffects.effectIdToBlinnProperties = effectIdToBlinnProperties;

    return outEffects;
}
