import {AnimationLoop, createGLContext, ClipSpaceQuad} from 'luma.gl';

const CONCENTRICS_FRAGMENT_SHADER = `\
#ifdef GL_ES
precision highp float;
#endif

uniform float uTime;

varying vec2 position;

void main(void) {
  float d = length(position * 64.0);
  d = 0.5 * sin(d * sin(uTime)) + 0.5 * sin(position.x * 64.0) * sin(position.y * 64.0);
  gl_FragColor = vec4(1.0-d,0,d, 1);
}
`;

export default new AnimationLoop({
  // onCreateContext: () => createGLContext({canvas: 'canvas-0'}),
  onInitialize: ({gl}) => ({
    clipSpaceQuad: new ClipSpaceQuad({gl, fs: CONCENTRICS_FRAGMENT_SHADER})
  }),
  onRender: ({gl, canvas, tick, clipSpaceQuad}) => {
    canvas.width = canvas.clientWidth;
    canvas.style.height = `${canvas.width}px`;
    canvas.height = canvas.width;
    gl.viewport(0, 0, canvas.width, canvas.height);

    clipSpaceQuad.render({uTime: tick * 0.01});
  }
});
