// -- 3D primitives (OpenSCAD like notion)
const { CSG } = require('@jscad/csg')
const { circle } = require('./primitives2d')
const { rotate_extrude } = require('./ops-extrusions')
const { translate } = require('./ops-transformations')

/** Construct a cuboid
 * @param {Object} [options] - options for construction
 * @param {Float} [options.size=1] - size of the side of the cuboid : can be either:
 * - a scalar : ie a single float, in which case all dimensions will be the same
 * - or an array: to specify different dimensions along x/y/z
 * @param {Integer} [options.fn=32] - segments of the sphere (ie quality/resolution)
 * @param {Integer} [options.fno=32] - segments of extrusion (ie quality)
 * @param {String} [options.type='normal'] - type of sphere : either 'normal' or 'geodesic'
 * @returns {CSG} new sphere
 *
 * @example
 * let cube1 = cube({
 *   r: 10,
 *   fn: 20
 * })
 */
function cube (params) {
  const defaults = {
    size: 1,
    v: null,
    offset: [0, 0, 0],
    round: false,
    radius: 0,
    fn: 8
  }

  // const {sn v, offset, round, r, fn} = Object.assign({}, defaults, params)
  // const offset = [0,0,0]

  var s = 1, v = null, offset = [0, 0, 0], round = false, r = 0, fn = 8
  if (p && p.length) v = p
  if (p && p.size && p.size.length) v = p.size // { size: [1,2,3] }
  if (p && p.size && !p.size.length) s = p.size // { size: 1 }
  if (p && (typeof p !== 'object')) s = p// (2)
  if (p && p.round === true) { round = true, r = v && v.length ? (v[0] + v[1] + v[2]) / 30 : s / 10 }
  if (p && p.radius) { round = true, r = p.radius }
  if (p && p.fn) fn = p.fn // applies in case of round: true

  var x = s, y = s, z = s
  if (v && v.length) {
    x = v[0], y = v[1], z = v[2]
  }
  offset = [x / 2, y / 2, z / 2] // center: false default
  var o = round
    ? CSG.roundedCube({radius: [x / 2, y / 2, z / 2], roundradius: r, resolution: fn})
    : CSG.cube({radius: [x / 2, y / 2, z / 2]})
  if (p && p.center && p.center.length) {
    offset = [p.center[0] ? 0 : x / 2, p.center[1] ? 0 : y / 2, p.center[2] ? 0 : z / 2]
  } else if (p && p.center == true) {
    offset = [0, 0, 0]
  } else if (p && p.center == false) {
    offset = [x / 2, y / 2, z / 2]
  }
  if (offset[0] || offset[1] || offset[2]) o = o.translate(offset)
  // if(v&&v.length) o = o.scale(v)      // we don't scale afterwards, we already created box with the correct size
  return o
}

/** Construct a sphere
 * @param {Object} [options] - options for construction
 * @param {Float} [options.r=1] - radius of the sphere
 * @param {Integer} [options.fn=32] - segments of the sphere (ie quality/resolution)
 * @param {Integer} [options.fno=32] - segments of extrusion (ie quality)
 * @param {String} [options.type='normal'] - type of sphere : either 'normal' or 'geodesic'
 * @returns {CSG} new sphere
 *
 * @example
 * let sphere1 = sphere({
 *   r: 10,
 *   fn: 20
 * })
 */
function sphere (params) {
  const defaults = {
    r: 1,
    fn: 32,
    type: 'normal'
  }

  let {r, fn, type} = Object.assign({}, defaults, params)
  let offset = [0, 0, 0] // center: false (default)
  if (params && (typeof params !== 'object')) r = params
  // var zoffset = 0 // sphere() in openscad has no center:true|false

  let output
  if (type === 'geodesic') {
    output = geodesicSphere(params)
  } else {
    output = CSG.sphere({radius: r, resolution: fn})
  }

  if (params && params.center && params.center.length) { // preparing individual x,y,z center
    offset = [params.center[0] ? 0 : r, params.center[1] ? 0 : r, params.center[2] ? 0 : r]
  } else if (params && params.center === true) {
    offset = [0, 0, 0]
  } else if (params && params.center === false) {
    offset = [r, r, r]
  }
  return (offset[0] || offset[1] || offset[2]) ? output : translate(offset, output)
}

function geodesicSphere (params) {
  var r = 1, fn = 5

  var ci = [ // hard-coded data of icosahedron (20 faces, all triangles)
    [0.850651, 0.000000, -0.525731],
    [0.850651, -0.000000, 0.525731],
    [-0.850651, -0.000000, 0.525731],
    [-0.850651, 0.000000, -0.525731],
    [0.000000, -0.525731, 0.850651],
    [0.000000, 0.525731, 0.850651],
    [0.000000, 0.525731, -0.850651],
    [0.000000, -0.525731, -0.850651],
    [-0.525731, -0.850651, -0.000000],
    [0.525731, -0.850651, -0.000000],
    [0.525731, 0.850651, 0.000000],
    [-0.525731, 0.850651, 0.000000]]

  var ti = [ [0, 9, 1], [1, 10, 0], [6, 7, 0], [10, 6, 0], [7, 9, 0], [5, 1, 4], [4, 1, 9], [5, 10, 1], [2, 8, 3], [3, 11, 2], [2, 5, 4],
    [4, 8, 2], [2, 11, 5], [3, 7, 6], [6, 11, 3], [8, 7, 3], [9, 8, 4], [11, 10, 5], [10, 11, 6], [8, 9, 7]]

  var geodesicSubDivide = function (p, fn, offset) {
    var p1 = p[0], p2 = p[1], p3 = p[2]
    var n = offset
    var c = []
    var f = []

    //           p3
    //           /\
    //          /__\     fn = 3
    //      i  /\  /\
    //        /__\/__\       total triangles = 9 (fn*fn)
    //       /\  /\  /\
    //     0/__\/__\/__\
    //    p1 0   j      p2

    for (var i = 0; i < fn; i++) {
      for (var j = 0; j < fn - i; j++) {
        var t0 = i / fn
        var t1 = (i + 1) / fn
        var s0 = j / (fn - i)
        var s1 = (j + 1) / (fn - i)
        var s2 = fn - i - 1 ? j / (fn - i - 1) : 1
        var q = []

        q[0] = mix3(mix3(p1, p2, s0), p3, t0)
        q[1] = mix3(mix3(p1, p2, s1), p3, t0)
        q[2] = mix3(mix3(p1, p2, s2), p3, t1)

        // -- normalize
        for (var k = 0; k < 3; k++) {
          var r = Math.sqrt(q[k][0] * q[k][0] + q[k][1] * q[k][1] + q[k][2] * q[k][2])
          for (var l = 0; l < 3; l++) {
            q[k][l] /= r
          }
        }
        c.push(q[0], q[1], q[2])
        f.push([n, n + 1, n + 2]); n += 3

        if (j < fn - i - 1) {
          var s3 = fn - i - 1 ? (j + 1) / (fn - i - 1) : 1
          q[0] = mix3(mix3(p1, p2, s1), p3, t0)
          q[1] = mix3(mix3(p1, p2, s3), p3, t1)
          q[2] = mix3(mix3(p1, p2, s2), p3, t1)

          // -- normalize
          for (var k = 0; k < 3; k++) {
            var r = Math.sqrt(q[k][0] * q[k][0] + q[k][1] * q[k][1] + q[k][2] * q[k][2])
            for (var l = 0; l < 3; l++) {
              q[k][l] /= r
            }
          }
          c.push(q[0], q[1], q[2])
          f.push([n, n + 1, n + 2]); n += 3
        }
      }
    }
    return { points: c, triangles: f, off: n }
  }

  var mix3 = function (a, b, f) {
    var _f = 1 - f
    var c = []
    for (var i = 0; i < 3; i++) {
      c[i] = a[i] * _f + b[i] * f
    }
    return c
  }

  if (params) {
    if (p.fn) fn = Math.floor(p.fn / 6)
    if (p.r) r = p.r
  }

  if (fn <= 0) fn = 1

  var q = []
  var c = [], f = []
  var offset = 0

  for (var i = 0; i < ti.length; i++) {
    var g = geodesicSubDivide([ ci[ti[i][0]], ci[ti[i][1]], ci[ti[i][2]]], fn, offset)
    c = c.concat(g.points)
    f = f.concat(g.triangles)
    offset = g.offset
  }
  return polyhedron({points: c, triangles: f}).scale(r)
}

/** Construct a cylinder
 * @param {Object} [options] - options for construction
 * @param {Float} [options.r=1] - radius of the cylinder
 * @param {Float} [options.r1=1] - radius of the top of the cylinder
 * @param {Float} [options.r2=1] - radius of the bottom of the cylinder
 * @param {Float} [options.d=1] - diameter of the cylinder
 * @param {Float} [options.d1=1] - diameter of the top of the cylinder
 * @param {Float} [options.d2=1] - diameter of the bottom of the cylinder
 * @param {Integer} [options.fn=32] - number of sides of the cylinder (ie quality/resolution)
 * @returns {CSG} new cylinder
 *
 * @example
 * let cylinder = cylinder({
 *   d: 10,
 *   fn: 20
 * })
 */
function cylinder (params) {
  const defaults = {
    r1: 1,
    r2: 1,
    h: 1,
    fn: 32,
    round: false
  }
  var r1 = 1, r2 = 1, h = 1, fn = 32, round = false
  var a = arguments
  var offset = [0, 0, 0]
  if (p && p.d) {
    r1 = r2 = p.d / 2
  }
  if (p && p.r) {
    r1 = p.r
    r2 = p.r
  }
  if (p && p.h) {
    h = p.h
  }
  if (p && (p.r1 || p.r2)) {
    r1 = p.r1
    r2 = p.r2
    if (p.h) h = p.h
  }
  if (p && (p.d1 || p.d2)) {
    r1 = p.d1 / 2
    r2 = p.d2 / 2
  }

  if (a && a[0] && a[0].length) {
    a = a[0]
    r1 = a[0]
    r2 = a[1]
    h = a[2]
    if (a.length === 4) fn = a[3]
  }
  if (p && p.fn) fn = p.fn
  // if(p&&p.center==true) zoffset = -h/2
  if (p && p.round === true) round = true
  var o
  if (p && (p.start && p.end)) {
    o = round
      ? CSG.roundedCylinder({start: p.start, end: p.end, radiusStart: r1, radiusEnd: r2, resolution: fn})
      : CSG.cylinder({start: p.start, end: p.end, radiusStart: r1, radiusEnd: r2, resolution: fn})
  } else {
    o = round
      ? CSG.roundedCylinder({start: [0, 0, 0], end: [0, 0, h], radiusStart: r1, radiusEnd: r2, resolution: fn})
      : CSG.cylinder({start: [0, 0, 0], end: [0, 0, h], radiusStart: r1, radiusEnd: r2, resolution: fn})
    var r = r1 > r2 ? r1 : r2
    if (p && p.center && p.center.length) { // preparing individual x,y,z center
      offset = [p.center[0] ? 0 : r, p.center[1] ? 0 : r, p.center[2] ? -h / 2 : 0]
    } else if (p && p.center === true) {
      offset = [0, 0, -h / 2]
    } else if (p && p.center === false) {
      offset = [0, 0, 0]
    }
    if (offset[0] || offset[1] || offset[2]) o = o.translate(offset)
  }
  return o
}

/** Construct a torus
 * @param {Object} [options] - options for construction
 * @param {Float} [options.ri=1] - radius of base circle
 * @param {Float} [options.ro=4] - radius offset
 * @param {Integer} [options.fni=16] - segments of base circle (ie quality)
 * @param {Integer} [options.fno=32] - segments of extrusion (ie quality)
 * @param {Integer} [options.roti=0] - rotation angle of base circle
 * @returns {CSG} new torus
 *
 * @example
 * let torus1 = torus({
 *   ri: 10
 * })
 */
function torus (params) {
  const defaults = {
    ri: 1,
    ro: 4,
    fni: 16,
    fno: 32,
    roti: 0
  }
  params = Object.assign({}, defaults, params)

  const limits = {
    fni: {min: 3},
    fno: {min: 3}
  }

  let {ri, ro, fni, fno, roti} = params

  if (fni < 3) fni = 3
  if (fno < 3) fno = 3

  let baseCircle = circle({r: ri, fn: fni, center: true})

  if (roti) baseCircle = baseCircle.rotateZ(roti)
  let result = rotate_extrude({fn: fno}, translate([ro, 0, 0], baseCircle))
  // result = result.union(result)
  return result
}

function polyhedron (params) {
  var pgs = []
  var ref = p.triangles || p.polygons
  var colors = p.colors || null

  for (var i = 0; i < ref.length; i++) {
    var pp = []
    for (var j = 0; j < ref[i].length; j++) {
      pp[j] = p.points[ref[i][j]]
    }

    var v = []
    for (j = ref[i].length - 1; j >= 0; j--) { // --- we reverse order for examples of OpenSCAD work
      v.push(new CSG.Vertex(new CSG.Vector3D(pp[j][0], pp[j][1], pp[j][2])))
    }
    var s = CSG.Polygon.defaultShared
    if (colors && colors[i]) {
      s = CSG.Polygon.Shared.fromColor(colors[i])
    }
    pgs.push(new CSG.Polygon(v, s))
  }
  var r = CSG.fromPolygons(pgs)
  return r
}

module.exports = {
  cube,
  sphere,
  geodesicSphere,
  cylinder,
  torus,
  polyhedron
}
