module.exports = ParseLibraryImages
function ParseLibraryImages (library_images, colladaXML) {
    var outImages = {
      imageNameReferences: {
      }
    }

    var daeIterator = colladaXML.evaluate('/COLLADA/library_images/image', colladaXML, null, XPathResult.ANY_TYPE, null );
    var daeElement = daeIterator.iterateNext();  
    while (daeElement) {
      outImages.imageNameReferences[daeElement.getAttribute('id')] = daeElement.firstElementChild.innerHTML;
      daeElement = daeIterator.iterateNext();  
    }

    return outImages;
}
