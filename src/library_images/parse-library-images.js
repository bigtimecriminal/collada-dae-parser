module.exports = ParseLibraryImages
function ParseLibraryImages (library_images) {
    var outImages = {}

    imageNameReferences = {};
    library_images[0].image.forEach(function (d) {
        imageNameReferences[d.$.id] = d.init_from[0]
    })
    outImages.imageNameReferences = imageNameReferences;

    return outImages;
}
