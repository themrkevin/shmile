window.Dalek = {
  countdown: 3, // in seconds
  State: {},
  goTimeText: "OH SNAP!",
  theme: "arya", // theme css filename
  frameTemplate: '/images/arya.png',
  Gutter: {
    left: 20, 
    center: 20, 
    right: 20, 
    top: 20, 
    middle: 20
  },

  init: function() {
    Dalek.centerPos = ($window.width() / 2) - ($frame.width() / 2);
    Dalek.slotWidth = ($frame.find('.piclist').width()/2) - Dalek.Gutter.left - (Dalek.Gutter.center/2);
    Dalek.slotHeight = Dalek.slotWidth / 1.5;
    Dalek.applyTheme();
  },

  applyTheme: function() {
    var css = document.createElement('style');
    css.innerText = '.piclist li:nth-child(odd) { margin-left: '+Dalek.Gutter.left+'px; margin-right: '+Dalek.Gutter.center/2+'px; }' +
      '.piclist li:nth-child(even) { margin-left: '+Dalek.Gutter.center/2+'px; margin-right: '+Dalek.Gutter.right+'px; }' +
      '.piclist li:nth-child(1), .piclist li:nth-child(2) { margin-top: '+Dalek.Gutter.top+'px; }' +
      '.piclist li { margin-bottom: '+Dalek.Gutter.middle+'px; width: '+Dalek.slotWidth+'px; height: '+Dalek.slotHeight+'px; }'; 
    $('link[rel=stylesheet]').last().after(css);
  },

  prepNextSession: function() {
    $frame.find('.piclist').empty();
    $('.frame-template').remove();
    $startButton.removeClass('hidden');
    Dalek.Anim.setFrame('0ms', 'show');  
    Dalek.Anim.opacify($startButton, '500ms', 1);
  },

  startCountdown: function(s, callback) {
    i = s;
    (function theCounting() {
      Dalek.announce(i);
      i--;
      var nextStep = i === 0 ? callback : theCounting;
      setTimeout(nextStep, 1000);
    })();
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
    Dalek.Anim.opacify($('.frame-template'), '0ms', 1);
  },

  resetState: function() {
    Dalek.State = {
      photoset: [],
      set_id: null,
      current_frame_idx: 0,
    };
    console.log('State reset');
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
      console.log(action);
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
        var $flash = $('.flash');
        $flash.css('opacity', '0'); 
        setTimeout(function() { $flash.remove(); }, 500);
      }
      console.log('blinding');
    },
    framePhoto: function($el, delay) {
      $frame.find('.piclist').append('<li></li>');
      $li = $frame.find('.piclist').find('li').last();
      $el.css({
        'top': $li.offset().top + parseInt($li.css('padding-top')),
        'left': $li.offset().left + parseInt($li.css('padding-left')),
        'width': $li.width(),
        'height': $li.height(),
        'transition-delay': delay
      });
      setTimeout(function() {
        $li.append($el);
        $el.removeClass('current-photo').attr('style','');
      }, parseInt(delay) + 2000);
    }
  }
}

$(function() {
  $window = $(window);
  $startButton = $('#start');
  $frame = $('#frame');

  Dalek.init();

  $startButton.on('click', function() {
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
