AFRAME.registerComponent('moon', {
  init: function () {
    const material = new THREE.MeshPhongMaterial();
    material.map = new THREE.TextureLoader().load('../textures/moonmap.jpg');

    const mesh = this.el.getObject3D('mesh');
    mesh.material = material;

    const bumpTexture = new THREE.TextureLoader().load(
      '../textures/moonbump.jpg'
    );
    material.bumpMap = bumpTexture;
    material.bumpScale = 0.5;
  },
});
