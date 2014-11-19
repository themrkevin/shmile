window.Config = {
  PROJECT: {
    name: 'arya',
    format: '4x6',
    template: 'arya2.png'
  },
  GUTTER: {
    left: 40.01, 
    center: 10.991, 
    right: 40.01, 
    top: 11.253, 
    middle: 37.108,
    bottom: 11.253
  },
  MESSAGE: {
    ready: 'Ready?',
    goTime: 'Smile!'
  },
  COUNTDOWN: 3000,
  NEXT_DELAY: 10000,
  CHEESE_DELAY: 1000,
  SNAP_DELAY: 1400,
  FLASH_DURATION: 500,
  READY_DELAY: 2000,
  NICE_DELAY: 5000,

  // The amount of time we should pause between each frame shutter
  // I tend to bump this up when 1) photobooth participants want more
  // time to review their photos between shots, and 2) when I'm shooting
  // with external flash and the flash needs more time to recharge.
  BETWEEN_SNAP_DELAY: 5000,

  // For usability enhancements on iPad, set this to "true"
  IS_MOBILE: true
}
