# scad-api

[![GitHub version](https://badge.fury.io/gh/jscad%2Fscad-api.svg)](https://badge.fury.io/gh/jscad%2Fscad-api)
[![experimental](http://badges.github.io/stability-badges/dist/experimental.svg)](http://github.com/badges/stability-badges)
[![Build Status](https://travis-ci.org/jscad/scad-api.svg)](https://travis-ci.org/jscad/scad-api)
[![Dependency Status](https://david-dm.org/jscad/scad-api.svg)](https://david-dm.org/jscad/scad-api)
[![devDependency Status](https://david-dm.org/jscad/scad-api/dev-status.svg)](https://david-dm.org/jscad/scad-api#info=devDependencies)


> OpenSCAD like modeling api for OpenJSCAD & co

This package provides an [OpenSCAD](http://www.scad.org/) like modeling api for [OpenJSCAD](openjscad.org) & co, it currently wraps 'low' level CSG/CAG objects

## Table of Contents

- [Background](#background)
- [Installation](#installation)
- [Usage](#usage)
- [API](#api)
- [Contribute](#contribute)
- [License](#license)

## Background

This is a package that provides an opinionated api on top of [CSG.js](https://github.com/jscad/csg.js)
more functional oriented, and that tried to mimic (up to a point) the api of OpenSCAD.
It used to be part of [OpenJSCAD.ORG](https://github.com/Spiritdude/OpenJSCAD.org) but is now an
'independent' module, to make usage and development easier.

It gives you ONE variant of syntaxic sugar/ flavor to do solid modeling.

It is using semantic versioning to signal minor and breaking changes.


## Installation


```
npm install @jscad/scad-api
```

### build distributable

```
npm run build
```

## Usage

this api is included by default in http://openjscad.org/ but you can also use it 'standalone'

```javascript
const scadApi = require('scad-api')

const {cube, sphere} = scadApi.primitives3d
const {union} = scadApi.booleanOps

const base = cube({size: 1, center: true})
const top = sphere({r: 10, fn: 100, type: 'geodesic'})

const result = union(base, top)

```

for now please see the OpenJsCad userguide https://en.wikibooks.org/wiki/OpenJSCAD_User_Guide
for more information about the API


## Contribute

PRs accepted.

Small note: If editing the Readme, please conform to the [standard-readme](https://github.com/RichardLitt/standard-readme) specification.


## License

[The MIT License (MIT)](https://github.com/jscad/scad-api/blob/master/LICENSE)
(unless specified otherwise)
