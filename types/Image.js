const Base = require('./Base')
const memoize = require('p-memoize')
const smartcrop = require('smartcrop-sharp')
const toArray = require('stream-to-array')
const sharp = require('sharp')

const name = 'image'

const generateThumb = memoize(async item => {
  const body = Buffer.concat(await toArray(await item.item.getItemStream()))

  const result = await smartcrop.crop(body, { width: 256, height: 256 })
  const crop = result.topCrop

  const buffer = await sharp(body)
    .extract({ width: crop.width, height: crop.height, left: crop.x, top: crop.y })
    .resize(256, 256)
    .toBuffer()

  await item.setThumb(buffer)
}) 

class Image extends Base {
  constructor(item) {
    super(item)

    this.generateThumb = generateThumb
  }

  get name() {
    return name
  }

  static async detect(store, bytes, data) {
    return {
      result: data.mime.startsWith('image/') ? name : undefined
    }
  }

  static async match(item) {
    return await item.getFiletype() === name
  }
}

module.exports = Image