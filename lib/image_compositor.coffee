im = require("imagemagick")
exec = require("child_process").exec
fs = require("fs")
EventEmitter = require("events").EventEmitter

# Composites an array of four images into the final grid-based image asset.
class ImageCompositor

  constructor: (@img_src_list=[], @config, @cb) ->
    @opts =
      overlay_src: "public/images/#{@config.project.template}"
      tmp_dir: "public/temp"
      output_dir: "public/photos/generated"
      thumb_dir: "public/photos/generated/thumbs"

  init: ->
    emitter = new EventEmitter()
    emitter.on "composite", (data) =>
      utcSeconds = (new Date()).valueOf()

      RESIZE = 3
      IMAGE_HEIGHT = data.img_h*RESIZE
      IMAGE_WIDTH = data.img_w*RESIZE
      GUTTER =
        left: data.gutter.left*RESIZE
        center: data.gutter.center*RESIZE
        right: data.gutter.right*RESIZE
        top: data.gutter.top*RESIZE
        middle: data.gutter.middle*RESIZE
        bottom: data.gutter.bottom*RESIZE
      TOTAL_HEIGHT = IMAGE_HEIGHT*2 + GUTTER.top + GUTTER.middle + GUTTER.bottom
      TOTAL_WIDTH = IMAGE_WIDTH*2 + GUTTER.left + GUTTER.center + GUTTER.right
      IMAGE_GEOMETRY = "#{IMAGE_WIDTH}x#{IMAGE_HEIGHT}"
      OUTPUT_PATH = "#{@opts.tmp_dir}/out.jpg"
      OUTPUT_FILE_NAME = "#{data.project.name}-#{utcSeconds}.jpg"
      FINAL_OUTPUT_PATH = "#{@opts.output_dir}/gen_#{OUTPUT_FILE_NAME}"
      FINAL_OUTPUT_THUMB_PATH = "#{@opts.thumb_dir}/thumb_#{OUTPUT_FILE_NAME}"
      IMG_1 = "#{IMAGE_GEOMETRY}+#{GUTTER.left}+#{GUTTER.top}"
      IMG_2 = "#{IMAGE_GEOMETRY}+#{GUTTER.left + IMAGE_WIDTH + GUTTER.center}+#{GUTTER.top}"
      IMG_3 = "#{IMAGE_GEOMETRY}+#{GUTTER.left}+#{GUTTER.top + IMAGE_HEIGHT + GUTTER.middle}"
      IMG_4 = "#{IMAGE_GEOMETRY}+#{GUTTER.left + IMAGE_WIDTH + GUTTER.center}+#{GUTTER.top + IMAGE_HEIGHT + GUTTER.middle}"
      GEOMETRIES = [IMG_1, IMG_2, IMG_3, IMG_4]

      convertArgs = [ "-size", TOTAL_WIDTH + "x" + TOTAL_HEIGHT, "canvas:white" ]

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
