/* eslint-disable max-len */
import test from 'tape-catch';
import 'luma.gl/headless';
import {GL, createGLContext, makeDebugContext, glKey} from 'luma.gl';
import {Framebuffer, Renderbuffer, Texture2D} from 'luma.gl';

const fixture = {
  gl: makeDebugContext(createGLContext()),
  gl2: makeDebugContext(createGLContext()) // createGLContext({webgl2: true, webgl1: false, throwOnFailure: false})
};

test('WebGL#Framebuffer construct/delete', t => {
  const {gl} = fixture;

  t.throws(
    () => new Framebuffer(),
    /.*WebGLRenderingContext.*/,
    'Framebuffer throws on missing gl context');

  const framebuffer = new Framebuffer(gl);
  t.ok(framebuffer instanceof Framebuffer,
    'Framebuffer construction successful');

  framebuffer.delete();
  t.ok(framebuffer instanceof Framebuffer,
    'Framebuffer delete successful');

  framebuffer.delete();
  t.ok(framebuffer instanceof Framebuffer,
    'Framebuffer repeated delete successful');

  t.end();
});

test('WebGL#Framebuffer resize', t => {
  const {gl} = fixture;

  const TEST_CASES = [
    {
      title: 'Default framebuffer',
      opts: {},
      fail: false
    },
    {
      title: 'Empty framebuffer',
      opts: {attachments: {}},
      fail: true
    },
    {
      title: 'Empty framebuffer',
      opts: {
        attachments: {
          [GL.COLORBUFFER0]: new Texture2D(gl),
          [GL.DEPTH]: new Renderbuffer(gl)
        }
      },
      fail: true
    },
    {
      opts: {
        attachments: {
          [GL.COLORBUFFER0]: new Texture2D(gl),
          [GL.DEPTH]: new Renderbuffer(gl),
          [GL.STENCIL]: new Renderbuffer(gl)
        }
      },
      fail: true
    },
    {
      opts: {
        attachments: {
          [GL.COLORBUFFER0]: new Texture2D(gl),
          [GL.DEPTH_STENCIL]: new Renderbuffer(gl)
        }
      },
      fail: true
    },
    {
      opts: {
        attachments: {
          [GL.COLORBUFFER0]: new Texture2D(gl),
          [GL.COLORBUFFER1]: new Texture2D(gl),
          [GL.DEPTH]: new Renderbuffer(gl)
        }
      },
      fail: true
    }
  ];

  for (const tc of TEST_CASES) {
    let framebuffer;

    t.doesNotThrow(
      () => {
        framebuffer = new Framebuffer(gl, tc.opts);
      },
      `Framebuffer(${tc.title}) construction successful`
    );

    const testMethod = tc.fail ? 'throws' : 'doesNotThrow';
    t[testMethod](
      () => {
        framebuffer.resize({width: 1000, height: 1000});
        framebuffer.checkStatus();

        framebuffer.resize({width: 100, height: 100});
        framebuffer.checkStatus();
      },
      'Framebuffer resize success/failure per spec'
    );

    framebuffer.delete({recursive: true});
  }

  t.end();
});

import {TEXTURE_FORMATS} from '../../src/webgl/texture';

const RGB_TO = {
  [GL.UNSIGNED_BYTE]: (r, g, b) => [r * 256, g * 256, b * 256],
  [GL.UNSIGNED_SHORT_5_6_5]: (r, g, b) => r * 32 << 11 + g * 64 << 6 + b * 32
};
// const RGB_FROM = {
//   [GL.UNSIGNED_BYTE]: v => [v[0] / 256, v[1] / 256, v[2] / 256],
//   [GL.UNSIGNED_SHORT_5_6_5]: v => [v >> 11 / 32, v >> 6 % 64 / 64, v % 32 * 32]
// };

const DATA = [1, 0.5, 0.25, 0.125];
const TEXTURE_DATA = {
  [GL.UNSIGNED_BYTE]: new Uint8Array(RGB_TO[GL.UNSIGNED_BYTE](DATA)),
  [GL.UNSIGNED_SHORT_5_6_5]: new Uint16Array(RGB_TO[GL.UNSIGNED_SHORT_5_6_5](DATA))
};
const DEFAULT_TEXTURE_DATA = new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);

test('WebGL2#Framebuffer texture attach and read', t => {
  const {gl2} = fixture;

  if (!gl2) {
    t.comment('WebGL2 not available, skipping tests');
    t.end();
    return;
  }

  const framebuffer = new Framebuffer(gl2, {depth: true, width: 1, height: 1, check: false});

  for (let format in TEXTURE_FORMATS) {
    const textureFormat = TEXTURE_FORMATS[format];

    const {dataFormat, types, compressed} = textureFormat;
    format = Number(format);

    if (Texture2D.isSupported(gl2, {format}) && !compressed) {

      let texture;

      for (const type of types) {
        // texture = new Texture2D(gl2, Object.assign({format, dataFormat, type}));
        // t.equals(texture.format, format,
        //   `Texture2D({format: ${glKey(format)}, type: ${glKey(type)}, dataFormat: ${glKey(dataFormat)}) created`);
        // texture.delete()
        const data = TEXTURE_DATA[type] || DEFAULT_TEXTURE_DATA;
        texture = new Texture2D(gl2, {format, dataFormat, type, data, width: 1, height: 1});
        t.equals(texture.format, format,
          `Texture2D({format: ${glKey(format)}, type: ${glKey(type)}, dataFormat: ${glKey(dataFormat)}) created`);

        framebuffer.attach({
          [GL.COLOR_ATTACHMENT0]: texture
        });
        t.doesNotThrow(
          () => framebuffer.checkStatus(),
          'Framebuffer is attachment complete'
        );

        let pixels;
        t.doesNotThrow(
          () => {
            pixels = framebuffer.readPixels();
          },
          'Framebuffer.readPixels returned'
        );
        t.ok(pixels, 'Received pixels');
        texture.delete();
      }
    }
  }

  t.end();
});
