const { CSG, CAG } = require('@jscad/csg')
const { union } = require('./ops-booleans')
// -- 3D transformations (OpenSCAD like notion)

/** translate an object in 2D/3D space
 * @param {Object} vector - 3D vector to translate the given object(s) by
 * @param {[Object]} objects either a single or multiple CSG/CAG objects to translate
 * @returns {CSG} new CSG object , translated by the given amount
 *
 * @example
 * let movedSphere = translate([10,2,0], sphere())
 */
function translate (vector, objects) {      // v, obj or array
  let object = objects
  if (objects.length) {
    for (let i = 0; i < objects.length; i++) { // FIXME/ why is union really needed ??
      object = object.union(objects[i])
    }
  }
  return object.translate(vector)
}

/** center an object in 2D/3D space
 * @param {[Boolean]} axis - either an array or single boolean to indicate which axis you want to center on
 * @param {[Object]} objects either a single or multiple CSG/CAG objects to translate
 * @returns {CSG} new CSG object , translated by the given amount
 *
 * @example
 * let movedSphere = center(false, sphere())
 */
function center (axis, objects) { // v, obj or array
  let object = objects
  if (objects.length) {
    for (let i = 0; i < objects.length; i++) { // FIXME/ why is union really needed ??
      object = object.union(objects[i])
    }
  }
  return object.center(axis)
}

/** scale an object in 2D/3D space
 * @param {[Array]} scale - either an array or simple number to scale object(s) by
 * @param {[Object]} objects either a single or multiple CSG/CAG objects to scale
 * @returns {CSG} new CSG object , scaled by the given amount
 *
 * @example
 * let scaledSphere = scale([0.2,15,1], sphere())
 */
function scale (scale, objects) {         // v, obj or array
  let object = objects
  if (objects.length) {
    for (let i = 0; i < objects.length; i++) { // FIXME/ why is union really needed ??
      object = object.union(objects[i])
    }
  }
  return object.scale(scale)
}

/** rotate an object in 2D/3D space
 * @param {[Array]} rotation - either an array or simple number to rotate object(s) by
 * @param {[Object]} objects either a single or multiple CSG/CAG objects to rotate
 * @returns {CSG} new CSG object , rotated by the given amount
 *
 * @example
 * let rotatedSphere = rotate([0.2,15,1], sphere())
 */
function rotate (rotation, objects) {
  var o
  var i
  var v
  var r = 1
  var a = arguments
  if (!a[0].length) {        // rotate(r,[x,y,z],o)
    r = a[0]
    v = a[1]
    i = 2
    if (a[2].length) { a = a[2]; i = 0 }
  } else {                   // rotate([x,y,z],o)
    v = a[0]
    i = 1
    if (a[1].length) { a = a[1]; i = 0 }
  }
  for (o = a[i++]; i < a.length; i++) {
    o = o.union(a[i])
  }
  if (r !== 1) {
    return o.rotateX(v[0] * r).rotateY(v[1] * r).rotateZ(v[2] * r)
  } else {
    return o.rotateX(v[0]).rotateY(v[1]).rotateZ(v[2])
  }
}

/** mirror an object in 2D/3D space
 * @param {[Array]} vector - the axes to mirror the object(s) by
 * @param {[Object]} objects either a single or multiple CSG/CAG objects to mirror
 * @returns {CSG} new CSG object , mirrored
 *
 * @example
 * let rotatedSphere = mirror([0.2,15,1], sphere())
 */
function mirror (v, o) {
  var a = Array.prototype.slice.call(arguments, 1, arguments.length),
    o = a[0]

  for (var i = 1; i < a.length; i++) {
    o = o.union(a[i])
  }
  var plane = new CSG.Plane(new CSG.Vector3D(v[0], v[1], v[2]).unit(), 0)
  return o.mirrored(plane)
}

/** expand an object in 2D/3D space
 * @param {[Array]} vector - the axes to mirror the object(s) by
 * @param {[Object]} objects either a single or multiple CSG/CAG objects to mirror
 * @returns {CSG} new CSG object , mirrored
 *
 * @example
 * let expanededShape = expand([0.2,15,1], sphere())
 */
function expand (r, n, o) {
  return o.expand(r, n)
}

/** contract an object(s) in 2D/3D space
 * @param {[Array]} vector - the axes to mirror the object(s) by
 * @param {[Object]} objects either a single or multiple CSG/CAG objects to mirror
 * @returns {CSG} new CSG object , mirrored
 *
 * @example
 * let contractedShape = contract([0.2,15,1], sphere())
 */
function contract (r, n, o) {
  return o.contract(r, n)
}

/** apply the given matrix transform to the given objects
 * @param {Array} matrix - the matrix to apply, as a simple 1d array of 16 elements
 * @param {[Object]} objects either a single or multiple CSG/CAG objects to transform
 * @returns {CSG} new CSG object , transformed
 *
 * @example
 * const angle = 45
 * let transformedShape = multmatrix([
 * cos(angle), -sin(angle), 0, 10,
 * sin(angle),  cos(angle), 0, 20,
 * 0         ,           0, 1, 30,
 * 0,           0, 0,  1
 * ], sphere())
 */
function multmatrix (mat, obj) {
  console.log('multmatrix() not yet implemented')
}

/** create a minkowski sum of the given shapes
 * @param {[Array]} vector - the axes to mirror the object(s) by
 * @param {[Object]} objects either a single or multiple CSG/CAG objects to create a hull around
 * @returns {CSG} new CSG object , mirrored
 *
 * @example
 * let hulled = hull(rect(), circle())
 */
function minkowski () {
  console.log('minkowski() not yet implemented')
}

/** create a convex hull of the given shapes
 * @param {[Array]} vector - the axes to mirror the object(s) by
 * @param {[Object]} objects either a single or multiple CSG/CAG objects to create a hull around
 * @returns {CSG} new CSG object , mirrored
 *
 * @example
 * let hulled = hull(rect(), circle())
 */
function hull () {
  var pts = []

  var a = arguments
  if (a[0].length) a = a[0]
  var done = []

  for (var i = 0; i < a.length; i++) {              // extract all points of the CAG in the argument list
    var cag = a[i]
    if (!(cag instanceof CAG)) {
      throw ('ERROR: hull() accepts only 2D forms / CAG')
      return
    }
    for (var j = 0; j < cag.sides.length; j++) {
      var x = cag.sides[j].vertex0.pos.x
      var y = cag.sides[j].vertex0.pos.y
      if (done['' + x + ',' + y])  // avoid some coord to appear multiple times
           {
        continue
      }
      pts.push({ x: x, y: y })
      done['' + x + ',' + y]++
         // echo(x,y);
    }
  }
   // echo(pts.length+" points in",pts);

   // from http://www.psychedelicdevelopment.com/grahamscan/
   //    see also at https://github.com/bkiers/GrahamScan/blob/master/src/main/cg/GrahamScan.java
  var ConvexHullPoint = function (i, a, d) {
    this.index = i
    this.angle = a
    this.distance = d

    this.compare = function (p) {
      if (this.angle < p.angle) {
        return -1
      } else if (this.angle > p.angle) {
        return 1
      } else {
        if (this.distance < p.distance) {
          return -1
        } else if (this.distance > p.distance) {
          return 1
        }
      }
      return 0
    }
  }

  var ConvexHull = function () {
    this.points = null
    this.indices = null

    this.getIndices = function () {
      return this.indices
    }

    this.clear = function () {
      this.indices = null
      this.points = null
    }

    this.ccw = function (p1, p2, p3) {
      var ccw = (this.points[p2].x - this.points[p1].x) * (this.points[p3].y - this.points[p1].y) -
                   (this.points[p2].y - this.points[p1].y) * (this.points[p3].x - this.points[p1].x)
      if (ccw < 1e-5)      // we need this, otherwise sorting never ends, see https://github.com/Spiritdude/OpenJSCAD.org/issues/18
            {
        return 0
      }
      return ccw
    }

    this.angle = function (o, a) {
         // return Math.atan((this.points[a].y-this.points[o].y) / (this.points[a].x - this.points[o].x));
      return Math.atan2((this.points[a].y - this.points[o].y), (this.points[a].x - this.points[o].x))
    }

    this.distance = function (a, b) {
      return ((this.points[b].x - this.points[a].x) * (this.points[b].x - this.points[a].x) +
                 (this.points[b].y - this.points[a].y) * (this.points[b].y - this.points[a].y))
    }

    this.compute = function (_points) {
      this.indices = null
      if (_points.length < 3) {
        return
      }
      this.points = _points

         // Find the lowest point
      var min = 0
      for (var i = 1; i < this.points.length; i++) {
        if (this.points[i].y === this.points[min].y) {
          if (this.points[i].x < this.points[min].x) {
            min = i
          }
        } else if (this.points[i].y < this.points[min].y) {
          min = i
        }
      }

         // Calculate angle and distance from base
      var al = new Array()
      var ang = 0.0
      var dist = 0.0
      for (i = 0; i < this.points.length; i++) {
        if (i == min) {
          continue
        }
        ang = this.angle(min, i)
        if (ang < 0) {
          ang += Math.PI
        }
        dist = this.distance(min, i)
        al.push(new ConvexHullPoint(i, ang, dist))
      }

      al.sort(function (a, b) { return a.compare(b) })

         // Create stack
      var stack = new Array(this.points.length + 1)
      var j = 2
      for (i = 0; i < this.points.length; i++) {
        if (i == min) {
          continue
        }
        stack[j] = al[j - 2].index
        j++
      }
      stack[0] = stack[this.points.length]
      stack[1] = min

      var tmp
      var M = 2
      for (i = 3; i <= this.points.length; i++) {
        while (this.ccw(stack[M - 1], stack[M], stack[i]) <= 0) {
          M--
        }
        M++
        tmp = stack[i]
        stack[i] = stack[M]
        stack[M] = tmp
      }

      this.indices = new Array(M)
      for (i = 0; i < M; i++) {
        this.indices[i] = stack[i + 1]
      }
    }
  }

  var hull = new ConvexHull()

  hull.compute(pts)
  var indices = hull.getIndices()

  if (indices && indices.length > 0) {
    var ch = []
    for (var i = 0; i < indices.length; i++) {
      ch.push(pts[indices[i]])
         // echo(pts[indices[i]]);
    }
      // echo(ch.length+" points out",ch);
    return CAG.fromPoints(ch)
      // return CAG.fromPointsNoCheck(ch);
  }
}

/** create a chain hull of the given shapes
 * originally "Whosa whatsis" suggested "Chain Hull" ,
 * as described at https://plus.google.com/u/0/105535247347788377245/posts/aZGXKFX1ACN
 * essentially hull A+B, B+C, C+D and then union those
 * @param {[Object]} objects either a single or multiple CSG/CAG objects to create a chain hull around
 * @returns {CSG} new CSG object ,which a chain hull of the inputs
 *
 * @example
 * let hulled = chain_hull(rect(), circle())
 */
function chain_hull () {
  var a = arguments
  var j = 0, closed = false

  if (a[j].closed !== undefined) {
    closed = a[j++].closed
  }

  if (a[j].length) { a = a[j] }

  var h = []; var n = a.length - (closed ? 0 : 1)
  for (var i = 0; i < n; i++) {
    h.push(hull(a[i], a[(i + 1) % a.length]))
  }
  return union(h)
}

module.exports = {
  translate,
  center,
  scale,
  rotate,
  mirror,
  expand,
  contract,
  multmatrix,
  minkowski,
  hull,
  chain_hull
}
