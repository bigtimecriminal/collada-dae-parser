module.exports = ParseLibraryImages
function ParseLibraryImages (library_images, colladaXML) {
    var outImages = {
      imageNameReferences: {
      }
    }

    var daeIterator = colladaXML.evaluate('/d:COLLADA/d:library_images/d:image', colladaXML, nsResolver, XPathResult.ANY_TYPE, null );
    var daeElement = daeIterator.iterateNext();  
    while (daeElement) {
      outImages.imageNameReferences[daeElement.getAttribute('id')] = daeElement.firstElementChild.innerHTML;
      daeElement = daeIterator.iterateNext();  
    }

    return outImages;
}
