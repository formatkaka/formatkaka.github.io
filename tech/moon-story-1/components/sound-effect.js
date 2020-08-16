AFRAME.registerComponent('sound-effect', {
  schema: {
    evt: { type: 'string', default: '' },
  },

  init: function () {
    this.startEl = document.getElementById('start');

    this.autoPlay = this.autoPlay.bind(this);
    this.playMe = this.playMe.bind(this);

    this.addEvtListeners();
  },

  update: function () {
    // Do something when component's data is updated.
  },

  remove: function () {
    // Do something the component or its entity is detached.

    this.removeEvtListeners();
  },

  tick: function (time, timeDelta) {
    // Do something on every scene tick or frame.
  },

  playMe() {
    this.el.components.sound.playSound();
  },

  autoPlay() {
    this.el.components.sound.playSound();
    console.log(
      'autoPlay -> this.el.components.sound',
      this.el.components.sound
    );

    if (this.data.evt) {
      this.el.components.sound.pauseSound();
    }
  },

  addEvtListeners() {
    this.startEl.addEventListener('click', this.autoPlay);

    if (this.data.evt) {
      this.el.sceneEl.addEventListener(this.evt, this.playMe);
    }
  },

  removeEvtListeners() {
    this.startEl.removeEventListener('click', this.autoPlay);

    if (this.data.evt) {
      this.el.sceneEl.removeEventListener(this.evt, this.playMe);
    }
  },
});
