window.Dalek = {
  init: function() {
    Dalek.centerPos = ($window.width() / 2) - ($frame.width() / 2);
    Dalek.slotWidth = ($frame.find('.piclist')[0].getBoundingClientRect().width/2) - Config.GUTTER.left - (Config.GUTTER.center/2);
    Dalek.slotHeight = Dalek.slotWidth / 1.5;
    Dalek.applyTheme();
  },

  applyTheme: function() {
    var css = document.createElement('style');
    css.innerText = '.piclist li:nth-child(odd) { margin-left: '+Config.GUTTER.left+'px; margin-right: '+Config.GUTTER.center/2+'px; }' +
      '.piclist li:nth-child(even) { margin-left: '+Config.GUTTER.center/2+'px; margin-right: '+Config.GUTTER.right+'px; }' +
      '.piclist li:nth-child(1), .piclist li:nth-child(2) { margin-top: '+Config.GUTTER.top+'px; }' +
      '.piclist li { margin-bottom: '+Config.GUTTER.middle+'px; width: '+Dalek.slotWidth+'px; height: '+Dalek.slotHeight+'px; }'; 
    $('link[rel=stylesheet]').last().after(css);
    $frame.append('<img class="frame-template hidden" src="/images/'+Config.PROJECT.template+'" />');
    Dalek.$frameTemplate = $('.frame-template');
  },

  prepNextSession: function() {
    $frame.find('.piclist').empty();
    Dalek.$frameTemplate.addClass('hidden');
    $startButton.removeClass('hidden');
    Dalek.Anim.setFrame('0ms', 'show');  
    Dalek.Anim.opacify($startButton, '500ms', 1);
  },

  startCountdown: function(s, callback) {
    i = s;
    (function theCounting() {
      Dalek.announce(i);
      i--;
      var theThing = i === 0 ? Dalek.doTheThing : theCounting;
      setTimeout(theThing, 1000);
    })();
  },

  doTheThing: function() {
    Dalek.announce(Config.MESSAGE.goTime, true, Config.CHEESE_DELAY);
    socket.emit('snap', true);
    setTimeout(function() {
      Dalek.Anim.blindThem(true);
    }, 1000);
  },

  updatePhotoSet: function(img_src, idx, callback) {
    var photo = document.createElement('img');
    photo.src = img_src;
    photo.className = 'photo-'+idx+' current-photo hidden';
    $('body').append(photo);
    $photo = $('.photo-'+idx);
    $photo.css({
      'width': $window.width(),
      'height': $window.width() / 1.5,
      'top': ($window.height() - ($window.width() / 1.5)) / 2
    });
    $photo.load(function() {
      Dalek.Anim.blindThem(false);
      $photo.removeClass('hidden');
      Dalek.Anim.framePhoto($photo, '1000ms');
      callback();
    });
  },

  applyFrameTemplate: function() {
    Dalek.$frameTemplate.removeClass('hidden');
    Dalek.Anim.opacify(Dalek.$frameTemplate, '0ms', 1);
  },

  resetState: function() {
    Dalek.State = {
      photoset: [],
      set_id: null,
      current_frame_idx: 0,
    };
  },

  announce: function(text, clear, delay) {
    $motd.text(text); 
    if(clear) {
      setTimeout(function() {
        $motd.empty();
      }, delay);
    }
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
        var $flash = $('.flash');
        $flash.css('opacity', '0'); 
        setTimeout(function() { $flash.remove(); }, Config.FLASH_DURATION);
      }
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

/*****************************************************************************/

$(function() {
  $window = $(window);
  $startButton = $('#start');
  $frame = $('#frame');
  $motd = $('#motd');

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
});

socket.on('photo_saved', function(data) {
  console.log('photo_saved evt: '+data.filename);
  fsm.photo_saved(data);
});
