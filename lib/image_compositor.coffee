im = require("imagemagick")
exec = require("child_process").exec
fs = require("fs")
EventEmitter = require("events").EventEmitter

# Composites an array of four images into the final grid-based image asset.
class ImageCompositor
  defaults:
    overlay_src: "public/images/arya2.png"
    tmp_dir: "public/temp"
    output_dir: "public/photos/generated"
    thumb_dir: "public/photos/generated/thumbs"

  constructor: (@img_src_list=[], @opts=null, @cb) ->
    @opts = @defaults if @opts is null

  init: ->
    emitter = new EventEmitter()
    emitter.on "composite", (img_w, img_h, gutter) =>
      RESIZE = 3
      IMAGE_HEIGHT = img_h*RESIZE
      IMAGE_WIDTH = img_w*RESIZE
      GUTTER =
        left: gutter.left*RESIZE
        center: gutter.center*RESIZE
        right: gutter.right*RESIZE
        top: gutter.top*RESIZE
        middle: gutter.middle*RESIZE
        bottom: gutter.bottom*RESIZE
      TOTAL_HEIGHT = IMAGE_HEIGHT*2 + GUTTER.top + GUTTER.middle + GUTTER.bottom
      TOTAL_WIDTH = IMAGE_WIDTH*2 + GUTTER.left + GUTTER.center + GUTTER.right
      IMAGE_GEOMETRY = "#{IMAGE_WIDTH}x#{IMAGE_HEIGHT}"
      OUTPUT_PATH = "#{@opts.tmp_dir}/out.jpg"
      OUTPUT_FILE_NAME = "#{utcSeconds}.jpg"
      FINAL_OUTPUT_PATH = "#{@opts.output_dir}/gen_#{OUTPUT_FILE_NAME}"
      FINAL_OUTPUT_THUMB_PATH = "#{@opts.thumb_dir}/thumb_#{OUTPUT_FILE_NAME}"
      IMG_1 = "#{IMAGE_GEOMETRY}+#{GUTTER.left}+#{GUTTER.top}"
      IMG_2 = "#{IMAGE_GEOMETRY}+#{GUTTER.left + IMAGE_WIDTH + GUTTER.center}+#{GUTTER.top}"
      IMG_3 = "#{IMAGE_GEOMETRY}+#{GUTTER.left}+#{GUTTER.top + IMAGE_HEIGHT + GUTTER.middle}"
      IMG_4 = "#{IMAGE_GEOMETRY}+#{GUTTER.left + IMAGE_WIDTH + GUTTER.center}+#{GUTTER.top + IMAGE_HEIGHT + GUTTER.middle}"
      GEOMETRIES = [IMG_1, IMG_2, IMG_3, IMG_4]

      convertArgs = [ "-size", TOTAL_WIDTH + "x" + TOTAL_HEIGHT, "canvas:white" ]
      utcSeconds = (new Date()).valueOf()

      i = 0
      while i < @img_src_list.length
        convertArgs.push @img_src_list[i]
        convertArgs.push "-geometry"
        convertArgs.push GEOMETRIES[i]
        convertArgs.push "-composite"
        i++
      convertArgs.push OUTPUT_PATH
      im.convert(
        convertArgs,
        (err, stdout, stderr) ->
          throw err  if err
          emitter.emit "laid_out", OUTPUT_PATH
          doCompositing()
      )

      doCompositing = =>
        compositeArgs = [ "-gravity", "center", @opts.overlay_src, OUTPUT_PATH, "-geometry", TOTAL_WIDTH + "x" + TOTAL_HEIGHT, FINAL_OUTPUT_PATH ]
        console.log("executing: composite " + compositeArgs.join(" "))
        exec "composite " + compositeArgs.join(" "), (error, stderr, stdout) ->
          throw error  if error
          emitter.emit "composited", FINAL_OUTPUT_PATH
          doGenerateThumb()

      resizeCompressArgs = [ "-size", "25%", "-quality", "20", FINAL_OUTPUT_PATH, FINAL_OUTPUT_THUMB_PATH ]
      doGenerateThumb = =>
        im.convert resizeCompressArgs, (e, out, err) ->
          throw err  if err
          emitter.emit "generated_thumb", FINAL_OUTPUT_THUMB_PATH

    emitter

module.exports = ImageCompositor
