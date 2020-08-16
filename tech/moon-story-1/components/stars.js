AFRAME.registerComponent('stars', {
  schema: { type: 'string' },

  init: function () {},

  update() {
    const group = this.system.createStars();
    this.el.object3D.add(group);
  },

  remove: function () {},
});

AFRAME.registerSystem('stars', {
  init: function () {
    this.stars = [];
    this.fallingStars = [];
  },

  getRandPos() {
    const x = Math.round((1000 * Math.random() - 500) / 20) * 30;
    const y = Math.round((1000 * Math.random() - 500) / 20) * 30;
    const z = Math.round((1000 * Math.random() - 500) / 20) * 30;

    return [x, y, z];
  },

  createStars: function () {
    const group = new THREE.Group();
    for (let index = 0; index < 200; index++) {
      const geometry = new THREE.SphereGeometry(2 * Math.random(), 16, 16);
      const material = new THREE.MeshBasicMaterial({ color: 0xffffff });

      const star = new THREE.Mesh(geometry, material);
      star.position.set(...this.getRandPos());
      this.stars.push(star);
      group.add(star);
    }

    return group;
  },
});
