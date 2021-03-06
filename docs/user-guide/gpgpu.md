# GPGPU Programming

A number of luma.gl classes and methods are valuable for GPGPU computing, this is a quick overview.


## Memory Management

A big part of GPPGU computing is setting up memory so that the GPU can access it, and manipulating it and reading it back. As the point of GPGPU
computing is to accelerate processing of large data sets, memory management needs to be done in an efficient way. It is therefore important to be aware
of what tools WebGL and luma.gl provides to manipulate memory.


### Buffers

Buffers represent memory on the GPU. One can think of it as "uploading"
a memory to the GPU. The cost of the upload depends on the GPU architecture
but it should not be considered free.

The buffers are just memory block, the interpretation depends on how they
are used.


| Method             | Version | Description |
| ---                | ---     | ---         |
| Buffer.subData     | WebGL1* | Enables updating only part of a buffer on the GPU. Note that WebGL2 provides additional control parameters |
| Buffer.copySubData | WebGL2  | Enables direct copy between buffers on GPU without moving memory to the CPU |
| Buffer.getSubData  | WebGL2  | Enables readback of memory from |


### Textures

Textures contain memory and is organized depending on the texture
width, height, format etc.

Textures can be used as a source of data to the GPU so they can be quite useful in GPGPU computing, either when the WebGL API does not directly support buffers (often the case in WebGL1) but also to achieve special results (e.g. implementing accumulation through blending).

* **Floating Point Textures** - Usually, the most useful textures for GPGPU computing are floating point textures (i.e. each color value can be a 16 bit or 32 bit float, rather than just a small integer). In WebGL1, support for floating point textures depends on the availability of extensions, and there are many limitations and variations between platforms. In WebGL2, the situation is much better.



## Transform Feedback

While WebGL2 does not support pure compute shaders, it does allow the application to capture the output of the vertex shader stage (in WebGL1 the processed vertices are sent directly to the fragment shader and are not accessible to the application).

To use transform feedback, instantiate the `TransformFeedback` class and let your program know what varyings you want to extract into `Buffers` before you link it:

```
const transformFeedback = new TransformFeedback(gl, {})
.bindBuffersForVaryings({
  gl_Position: new Buffer(gl, {}),
  vColor: new Buffer(gl, {}),
  vNormal: new Buffer(gl, {}),
});

transformFeedback.begin(GL.POINTS);
const program = new Program(gl, {vs, fs, transformFeedback}})
const program = new Program(gl, {vs, fs, transformFeedback}})
```

For more details on how transform feedback works refer to the [OpenGL Wiki](https://www.khronos.org/opengl/wiki/Transform_Feedback).


## Disabling the Fragment Shader

When using transform feedback, you are often not interested in the output of the fragment shader. If so, you can stop it from running to improve performance. Just turn off rasterization in your draw calls.

```
program.draw({
  settings: {
    [GL.RASTERIZER_DISCARD]: true
  }
});
```


## Shader Module System

Core Requirements
* Support modules exporting
* Support dynamic registry of GLSL modules with dependencies (per vertex and fragment)
* Resolve dependency graphs.

Long Term Requirements
* Eventually support dynamic composition.

Optional Requirements
* Support 'interfaces' - set of functions expected from module (e.g. lighting)
* Several concrete modules could implement an interface.
* App shaders can be written towards an interface, app can change implementation
  module easily.

References
* [deck.gl assembleShaders](https://github.com/uber/deck.gl/blob/master/src/shader-utils/assemble-shaders.js)
* [shadergraph](https://github.com/unconed/shadergraph)
  + Graph structure
  - Coffee Script
  - Hard to understand?
* [glslify](https://github.com/stackgl/glslify)
  + supports import statements in GLSL code.
  + Supports node modules, shader-name etc
  - One function per import
  - Renames uniforms and secondary functions
* [Per file parsing of shader errors](http://codeflow.org/entries/2013/feb/22/how-to-write-portable-webgl/#shader-problems)
  - Our import system could track files and generate correct line numbers!

## GPGPU Computing

References:
* [GPU Gems Article](http://http.developer.nvidia.com/GPUGems/gpugems_ch37.html)

* Handle a number of cases (set up arrays as textures, clip space rectangles)
* Blend modes for accumulate
* Reduction algorithms for e.g. Max and Min.
* WebGL2, transform feedback, disable rasterizers etc.
* Perf tests, based on Query class, vs JavaScript counterparts.
