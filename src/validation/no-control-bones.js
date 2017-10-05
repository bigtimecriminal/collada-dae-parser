module.exports = noControlBones

// Validate that the rig does not
// contain any pole targets, inverse kinematic,
// or other non deformation bones
//
// The user must bake these animations before
// exporting their model.
//  [LINK TO DOCS]
function noControlBones (allJointNames, deformationJointNames) {
  // We know that there are no control bones if the number of bones
  // matches the number of deformation bones. Otherwise we throw a
  // descriptive error
  if (allJointNames.length !== deformationJointNames.length) {
    // Let's find the control joint names so that we can report
    // them to the user

    // [joint_1, joint_2] -> {joint_1: true, joint_2: true}
    // We're doing this in order to look up the missing elements
    var deformJoints = deformationJointNames.reduce(function (allJoints, jointName) {
      allJoints[jointName] = true
      return allJoints
    }, {})

    // Create an array of control joint names
    var nonDeformJoints = allJointNames.reduce(function (nonDeformJoints, jointName) {
      if (!deformJoints[jointName]) {
        nonDeformJoints.push(jointName)
      }
      return nonDeformJoints
    }, [])

    // Throw an error with a link to the documentation and the names of their non-deformation bones
    // TODO: Figure out why template notation is not accepted in these errors.
    throw new Error( "This error has been removed" )
  }
}
