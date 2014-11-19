/*
 * STATE MACHINE DEFINITION
 * Keep track of app state and logic.
 *
 * + loading
 *   - connected() -> ready
 * + ready
 *   - ui_button_pressed() (DOM button click) -> waiting_for_photo
 * + waiting_for_photo
 *   - photo_saved() -> review_photo
 * + review_photo
 *   - photo_updated() -> next_photo
 * + next_photo
 *   - continue_partial_set() -> waiting_for_photo
 *   - finish_set() -> ready
 */
var fsm = StateMachine.create({
  initial: 'loading',
  events: [
    { name: 'connected', from: 'loading', to: 'ready' },
    { name: 'ui_button_pressed', from: 'ready', to: 'waiting_for_photo' },
    { name: 'photo_saved', from: 'waiting_for_photo', to: 'review_photo' },
    { name: 'photo_updated', from: 'review_photo', to: 'next_photo' },
    { name: 'continue_partial_set', from: 'next_photo', to: 'waiting_for_photo' },
    { name: 'finish_set', from: 'next_photo', to: 'review_composited' },
    { name: 'next_set', from: 'review_composited', to: 'ready'}
  ],
  callbacks: {
    onconnected: function() {
      Dalek.Anim.setFrame('0ms', 'show');  
      Dalek.Anim.opacify($startButton, '500ms', 1);
    },
    onenterready: function() {
      Dalek.resetState();
    },
    onleaveready: function() {
      Dalek.Anim.opacify($startButton, '0ms', '');
      $startButton.addClass('hidden');
      $motd.removeClass('hidden');
      Dalek.announce(Config.MESSAGE.ready, true, 1000);
    },
    onenterwaiting_for_photo: function(e) {
      // snap
      Dalek.startCountdown(Config.COUNTDOWN/1000);
    },

    onphoto_saved: function(e, f, t, data) {
      Dalek.updatePhotoSet(data.web_url, Dalek.State.current_frame_idx, function() {
        setTimeout(function() {
          fsm.photo_updated();
        }, Config.BETWEEN_SNAP_DELAY)
      });
    },
    onphoto_updated: function(e, f, t) {
      // We're done with the full set.
      if (Dalek.State.current_frame_idx === 3) {
        fsm.finish_set();
      } else {
        Dalek.State.current_frame_idx++;
        fsm.continue_partial_set();
      }
    },
    onenterreview_composited: function(e, f, t) {
      socket.emit('composite', { 
        project: Config.PROJECT, 
        gutter: Config.GUTTER, 
        img_w: Dalek.slotWidth, 
        img_h: Dalek.slotHeight 
      });
      Dalek.applyFrameTemplate();
      setTimeout(function() { fsm.next_set() }, Config.NEXT_DELAY);
    },
    onleavereview_composited: function(e, f, t) {
      // Clean up
      Dalek.Anim.setFrame('0ms','hide');
      setTimeout(function() { 
        Dalek.Anim.setFrame('500ms','reset'); 
      }, 500);
      setTimeout(Dalek.prepNextSession, Config.READY_DELAY);
    },
    onchangestate: function(e, f, t) {
      console.log('fsm received event '+e+', changing state from ' + f + ' to ' + t)
    }
  }
});
