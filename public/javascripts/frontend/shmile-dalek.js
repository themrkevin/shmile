window.Dalek = {
  countdown: 3, // in seconds
  State: {},
  goTimeText: "OH SNAP!",
  frameTemplate: '/images/overlay.png',

  init: function() {
    Dalek.centerPos = ($window.width() / 2) - ($frame.width() / 2);
  },

  startCountdown: function(s) {
    i = s;
    (function theCounting() {
      Dalek.announce(i);
      i--;
      var nextStep = i === 0 ? Dalek.doTheThing : theCounting;
      setTimeout(nextStep, 1000);
    })();
  },

  doTheThing: function() {
    Dalek.announce('Snap');
    Dalek.Anim.opacify($startButton, '0ms', '');
    $startButton.addClass('hidden');
    Dalek.Anim.blindThem(true);
    socket.emit('snap', true);
  },

  updatePhotoSet: function(img_src, idx, callback) {
    var photo = document.createElement('img');
    photo.src = img_src;
    photo.className = 'photo-'+idx+' current-photo';
    $('body').append(photo);
    Dalek.Anim.framePhoto($('.photo-'+idx), '1000ms');
    callback();
  },

  applyFrameTemplate: function() {
    $frame.append('<img class="frame-template" src="'+Dalek.frameTemplate+'" />');
  },

  resetState: function() {
    Dalek.State = {
      photoset: [],
      set_id: null,
      current_frame_idx: 0,
      zoomed: null
    };
  },

  announce: function(text) {
    $startButton.text(text);
    console.log(text);
  },

  Anim: {
    setFrame: function(delay, action) {
      var opacity, position;
      switch (action) {
        case 'show':
          opacity = 1;
          position = Dalek.centerPos;
          break;
        case 'hide':
          opacity = 0;
          position = Dalek.centerPos + 500;
          break;
        default:
          opacity = '';
          position = '';
      }
      $frame.css({
        'opacity': opacity, 
        'margin-left': position,
        'transition-delay': delay
      });
    },
    opacify: function($el, delay, opacity) {
      $el.css({
        'opacity': opacity,
        'transition-delay': delay
      });
    },
    blindThem: function(start) {
      if(start) {
        $('body').append('<div class="flash"></div>');
      } else {
        $('.flash').css('opacity', '0'); 
      }
    },
    framePhoto: function($el, delay) {
      $frame.find('.piclist').append('<li></li>');
      $li = $frame.find('.piclist').find('li').last();
      $el.css({
        'top': $li.offset().top,
        'left': $li.offset().left,
        'width': $li.width(),
        'height': $li.height(),
        'transition-delay': delay
      });
    }
  }
}

$(function() {
  $window = $(window);
  $startButton = $('#start');
  $frame = $('#frame');

  Dalek.init();

  $startButton.on('click', function() {
    $startButton.addClass('pressed');
    $(document).trigger('ui_button_pressed');
  });
});

/*****************************************************************************/

// Set up the socket
var socket = io.connect('/')

socket.on('message', function(data) {
  console.log('data is' + data);
});

socket.on('connect', function() {
  console.log('connected evt');
  fsm.connected();
});

$(document).bind('ui_button_pressed', function() {
  console.log('ui_button_pressed evt');
  fsm.ui_button_pressed();
});

socket.on('camera_snapped', function() {
  console.log('camera_snapped evt');
  //fsm.camera_snapped();
})

socket.on('photo_saved', function(data) {
  console.log('photo_saved evt: '+data.filename);
  fsm.photo_saved(data);
});
